import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { caption, hashtags, scheduled_at, platform_ids, media_url, post_type } = body as {
    caption: string;
    hashtags: string[];
    scheduled_at: string;
    platform_ids: string[];
    media_url?: string;
    post_type?: "image" | "video";
  };

  if (!caption?.trim()) {
    return NextResponse.json({ error: "Caption é obrigatório" }, { status: 400 });
  }
  if (!scheduled_at) {
    return NextResponse.json({ error: "Data de publicação é obrigatória" }, { status: 400 });
  }
  if (!platform_ids?.length) {
    return NextResponse.json({ error: "Selecione ao menos uma plataforma" }, { status: 400 });
  }

  // Verify platforms belong to this user
  const { data: platforms, error: plErr } = await supabase
    .from("sp_platforms")
    .select("id, name, is_active")
    .eq("user_id", user.id)
    .in("id", platform_ids);

  if (plErr) return NextResponse.json({ error: plErr.message }, { status: 500 });

  const activePlatforms = (platforms ?? []).filter((p) => p.is_active);
  if (activePlatforms.length === 0) {
    return NextResponse.json(
      { error: "Nenhuma das plataformas selecionadas está ativa. Conecte as contas primeiro." },
      { status: 400 }
    );
  }

  // Create the post
  const { data: post, error: postErr } = await supabase
    .from("sp_posts")
    .insert({
      user_id:      user.id,
      caption:      caption.trim(),
      hashtags:     hashtags ?? [],
      scheduled_at,
      status:       "pending",
      post_type:    post_type ?? "image",
      media_url:    media_url ?? null,
    })
    .select("id")
    .single();

  if (postErr || !post) {
    return NextResponse.json({ error: postErr?.message ?? "Falha ao criar post" }, { status: 500 });
  }

  // Link each platform
  const ppRows = activePlatforms.map((p) => ({
    post_id:     post.id,
    platform_id: p.id,
    status:      "pending",
  }));

  const { error: ppErr } = await supabase.from("sp_post_platforms").insert(ppRows);
  if (ppErr) {
    // Clean up orphaned post
    await supabase.from("sp_posts").delete().eq("id", post.id);
    return NextResponse.json({ error: ppErr.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, post_id: post.id }, { status: 201 });
}
