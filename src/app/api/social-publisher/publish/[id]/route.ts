/**
 * POST /api/social-publisher/publish/[id]
 *
 * Triggers immediate publishing of a scheduled post to all connected platforms.
 * Implements Instagram Graph API (v21.0) and TikTok Content Posting API v2
 * — ported from github.com/inematds/redessociais2026.
 */

import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

const IG_BASE  = "https://graph.facebook.com/v21.0";
const TTK_BASE = "https://open.tiktokapis.com";

// ── Instagram helpers ──────────────────────────────────────────────────────────

async function igCreateContainer(
  igUserId: string,
  accessToken: string,
  mediaUrl: string,
  caption: string,
  isVideo: boolean
): Promise<string> {
  const params: Record<string, string> = {
    caption,
    access_token: accessToken,
  };
  if (isVideo) {
    params.video_url  = mediaUrl;
    params.media_type = "REELS";
  } else {
    params.image_url = mediaUrl;
  }
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${IG_BASE}/${igUserId}/media?${qs}`, { method: "POST" });
  const json = await res.json();
  if (!json.id) throw new Error(`Instagram: falha ao criar container — ${JSON.stringify(json)}`);
  return json.id as string;
}

async function igWaitReady(containerId: string, accessToken: string): Promise<void> {
  for (let i = 0; i < 40; i++) {
    await sleep(3000);
    const res = await fetch(
      `${IG_BASE}/${containerId}?fields=status_code,status&access_token=${accessToken}`
    );
    const json = await res.json();
    const code: string = json.status_code ?? "";
    if (code === "FINISHED") return;
    if (code === "ERROR")    throw new Error(`Instagram: container com erro — ${json.status ?? code}`);
    if (code === "EXPIRED")  throw new Error("Instagram: container expirado");
  }
  throw new Error(`Instagram: timeout aguardando container ${containerId}`);
}

async function igPublish(
  igUserId: string,
  accessToken: string,
  containerId: string
): Promise<string> {
  const qs = new URLSearchParams({ creation_id: containerId, access_token: accessToken }).toString();
  const res = await fetch(`${IG_BASE}/${igUserId}/media_publish?${qs}`, { method: "POST" });
  const json = await res.json();
  if (!json.id) throw new Error(`Instagram: falha ao publicar — ${JSON.stringify(json)}`);
  return json.id as string;
}

// ── TikTok helpers ─────────────────────────────────────────────────────────────

async function ttkInitPublish(
  accessToken: string,
  mediaUrl: string,
  caption: string,
  isVideo: boolean
): Promise<string> {
  const body = {
    post_info: {
      title:            caption,
      description:      caption,
      privacy_level:    "SELF_ONLY",
      disable_comment:  false,
      auto_add_music:   !isVideo,
    },
    source_info: isVideo
      ? { source: "PULL_FROM_URL", video_url: mediaUrl }
      : { source: "PULL_FROM_URL", photo_cover_index: 0, photo_images: [mediaUrl] },
    post_mode:  "DIRECT_POST",
    media_type: isVideo ? "VIDEO" : "PHOTO",
  };

  const res = await fetch(`${TTK_BASE}/v2/post/publish/content/init/`, {
    method:  "POST",
    headers: { "Content-Type": "application/json; charset=UTF-8", Authorization: `Bearer ${accessToken}` },
    body:    JSON.stringify(body),
  });
  const json = await res.json();
  if (json.error?.code && json.error.code !== "ok") {
    throw new Error(`TikTok API: ${json.error.code} — ${json.error.message}`);
  }
  return json.data?.publish_id as string;
}

async function ttkWaitDone(
  accessToken: string,
  publishId: string
): Promise<{ externalId: string; externalUrl?: string }> {
  for (let i = 0; i < 60; i++) {
    await sleep(5000);
    const res = await fetch(`${TTK_BASE}/v2/post/publish/status/fetch/`, {
      method:  "POST",
      headers: { "Content-Type": "application/json; charset=UTF-8", Authorization: `Bearer ${accessToken}` },
      body:    JSON.stringify({ publish_id: publishId }),
    });
    const json = await res.json();
    const status: string = json.data?.status ?? "";

    if (status === "PUBLISH_COMPLETE") {
      const ids: string[] = json.data?.publicaly_available_post_id ?? [];
      const videoId = ids[0] ?? publishId;
      return {
        externalId:  videoId,
        externalUrl: ids[0] ? `https://www.tiktok.com/@user/video/${ids[0]}` : undefined,
      };
    }
    if (status === "FAILED") {
      throw new Error(`TikTok: publicação falhou — ${json.data?.fail_reason ?? "motivo desconhecido"}`);
    }
  }
  throw new Error("TikTok: timeout aguardando publicação");
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function buildCaption(caption: string, hashtags: string[]): string {
  const tags = (hashtags ?? []).map((h) => (h.startsWith("#") ? h : `#${h}`)).join(" ");
  return tags ? `${caption}\n\n${tags}` : caption;
}

// ── Route ──────────────────────────────────────────────────────────────────────

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: postId } = await params;
  if (!postId) return NextResponse.json({ error: "Post ID obrigatório" }, { status: 400 });

  const supabase = await createClient();
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Fetch post + post_platforms + platform credentials
  const { data: post, error: postErr } = await supabase
    .from("sp_posts")
    .select(`
      *,
      sp_post_platforms (
        id, status,
        sp_platforms ( id, name, credentials, is_active )
      )
    `)
    .eq("id", postId)
    .eq("user_id", user.id)
    .single();

  if (postErr || !post) return NextResponse.json({ error: "Post não encontrado" }, { status: 404 });
  if (post.status === "published") return NextResponse.json({ error: "Post já publicado" }, { status: 400 });

  // Mark as processing
  await supabase.from("sp_posts").update({ status: "processing" }).eq("id", postId);

  const caption    = buildCaption(post.caption, post.hashtags ?? []);
  const isVideo    = post.post_type === "video";
  const mediaUrl   = post.media_url ?? "";

  let published = 0;
  let failed    = 0;

  const postPlatforms: any[] = post.sp_post_platforms ?? [];

  for (const pp of postPlatforms) {
    const platform = pp.sp_platforms;
    if (!platform?.is_active) continue;

    const creds = platform.credentials as Record<string, string>;
    let externalId:  string | undefined;
    let externalUrl: string | undefined;
    let errMsg:      string | undefined;

    try {
      if (platform.name === "instagram") {
        const { access_token, ig_user_id } = creds;
        if (!access_token || !ig_user_id) throw new Error("Credenciais Instagram incompletas (access_token + ig_user_id)");
        const containerId = await igCreateContainer(ig_user_id, access_token, mediaUrl, caption, isVideo);
        await igWaitReady(containerId, access_token);
        const mediaId = await igPublish(ig_user_id, access_token, containerId);
        externalId  = mediaId;
        externalUrl = isVideo
          ? `https://www.instagram.com/reel/${mediaId}/`
          : `https://www.instagram.com/p/${mediaId}/`;

      } else if (platform.name === "tiktok") {
        const { access_token } = creds;
        if (!access_token) throw new Error("Credenciais TikTok incompletas (access_token)");
        if (!mediaUrl) throw new Error("TikTok requer media_url para publicação");
        const publishId = await ttkInitPublish(access_token, mediaUrl, caption, isVideo);
        const result    = await ttkWaitDone(access_token, publishId);
        externalId  = result.externalId;
        externalUrl = result.externalUrl;

      } else {
        throw new Error(`Plataforma não suportada: ${platform.name}`);
      }

      published++;
      await supabase
        .from("sp_post_platforms")
        .update({ status: "published", external_id: externalId, external_url: externalUrl, published_at: new Date().toISOString() })
        .eq("id", pp.id);

    } catch (err: unknown) {
      failed++;
      errMsg = err instanceof Error ? err.message : String(err);
      await supabase
        .from("sp_post_platforms")
        .update({ status: "failed", error_message: errMsg })
        .eq("id", pp.id);
    }
  }

  // Final post status
  const finalStatus =
    published === 0 && failed > 0 ? "failed" :
    failed > 0                    ? "partial" :
                                    "published";

  await supabase
    .from("sp_posts")
    .update({ status: finalStatus })
    .eq("id", postId);

  return NextResponse.json({ success: finalStatus !== "failed", status: finalStatus, published, failed });
}
