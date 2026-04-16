"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Instagram, Loader2, Send, Clock, CheckCircle2, XCircle, AlertCircle,
  Plus, Trash2, ExternalLink, RefreshCw, Zap, Settings, CalendarClock,
  Link as LinkIcon, Image as ImageIcon, Video,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────────

type Platform = {
  id: string;
  name: "instagram" | "tiktok";
  display_name: string;
  is_active: boolean;
  token_expires_at: string | null;
};

type PostPlatformResult = {
  id: string;
  status: string;
  external_id: string | null;
  external_url: string | null;
  error_message: string | null;
  published_at: string | null;
  sp_platforms: { id: string; name: string; display_name: string };
};

type Post = {
  id: string;
  caption: string;
  hashtags: string[];
  scheduled_at: string;
  status: string;
  post_type: string;
  media_url: string | null;
  created_at: string;
  sp_post_platforms: PostPlatformResult[];
};

type Tab = "schedule" | "posts" | "platforms";

// ── Status badge ───────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; className: string; icon: React.ElementType }> = {
  pending:    { label: "Agendado",    className: "bg-amber-100   text-amber-700",   icon: Clock        },
  processing: { label: "Publicando", className: "bg-blue-100    text-blue-700",    icon: Loader2      },
  published:  { label: "Publicado",  className: "bg-green-100   text-green-700",   icon: CheckCircle2 },
  partial:    { label: "Parcial",    className: "bg-orange-100  text-orange-700",  icon: AlertCircle  },
  failed:     { label: "Falhou",     className: "bg-red-100     text-red-700",     icon: XCircle      },
  cancelled:  { label: "Cancelado",  className: "bg-slate-100   text-slate-500",   icon: XCircle      },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full", cfg.className)}>
      <Icon className={cn("w-3 h-3", status === "processing" && "animate-spin")} />
      {cfg.label}
    </span>
  );
}

// ── Platform icons ─────────────────────────────────────────────────────────────

function PlatformIcon({ name, size = 16 }: { name: string; size?: number }) {
  if (name === "instagram") {
    return (
      <span style={{ width: size, height: size }} className="inline-flex items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 shrink-0">
        <Instagram style={{ width: size * 0.6, height: size * 0.6 }} className="text-white" />
      </span>
    );
  }
  // TikTok
  return (
    <span style={{ width: size, height: size }} className="inline-flex items-center justify-center rounded-lg bg-black shrink-0">
      <svg style={{ width: size * 0.6, height: size * 0.6 }} viewBox="0 0 24 24" fill="white">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V9.17a8.16 8.16 0 004.77 1.52V7.24a4.85 4.85 0 01-1-.55z" />
      </svg>
    </span>
  );
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function SocialPublisherPage() {
  const [tab, setTab] = useState<Tab>("schedule");

  // Platforms state
  const [platforms, setPlatforms]           = useState<Platform[]>([]);
  const [platformsLoading, setPlatformsLoading] = useState(true);
  const [connectForm, setConnectForm]       = useState<"instagram" | "tiktok" | null>(null);
  const [igToken, setIgToken]               = useState("");
  const [igUserId, setIgUserId]             = useState("");
  const [ttkToken, setTtkToken]             = useState("");
  const [ttkOpenId, setTtkOpenId]           = useState("");
  const [connectingPlatform, setConnectingPlatform] = useState(false);

  // Schedule form state
  const [caption, setCaption]               = useState("");
  const [hashtags, setHashtags]             = useState("");
  const [mediaUrl, setMediaUrl]             = useState("");
  const [postType, setPostType]             = useState<"image" | "video">("image");
  const [scheduledAt, setScheduledAt]       = useState(() => {
    const d = new Date(); d.setMinutes(d.getMinutes() + 30); d.setSeconds(0);
    return d.toISOString().slice(0, 16);
  });
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<string>>(new Set());
  const [scheduling, setScheduling]         = useState(false);

  // Posts state
  const [posts, setPosts]                   = useState<Post[]>([]);
  const [postsLoading, setPostsLoading]     = useState(false);
  const [publishing, setPublishing]         = useState<string | null>(null);

  // ── Data fetching ────────────────────────────────────────────────────────────

  const fetchPlatforms = useCallback(async () => {
    setPlatformsLoading(true);
    try {
      const res = await fetch("/api/social-publisher/platforms");
      if (!res.ok) throw new Error(await res.text());
      const { platforms: data } = await res.json();
      setPlatforms(data ?? []);
    } catch {
      toast.error("Erro ao carregar plataformas.");
    } finally {
      setPlatformsLoading(false);
    }
  }, []);

  const fetchPosts = useCallback(async () => {
    setPostsLoading(true);
    try {
      const res = await fetch("/api/social-publisher/posts");
      if (!res.ok) throw new Error(await res.text());
      const { posts: data } = await res.json();
      setPosts(data ?? []);
    } catch {
      toast.error("Erro ao carregar posts.");
    } finally {
      setPostsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlatforms();
  }, [fetchPlatforms]);

  useEffect(() => {
    if (tab === "posts") fetchPosts();
  }, [tab, fetchPosts]);

  // ── Handlers ─────────────────────────────────────────────────────────────────

  async function handleConnect(name: "instagram" | "tiktok") {
    const credentials: Record<string, string> =
      name === "instagram"
        ? { access_token: igToken.trim(), ig_user_id: igUserId.trim() }
        : { access_token: ttkToken.trim(), open_id: ttkOpenId.trim() };

    if (!credentials.access_token) {
      toast.error("Access token é obrigatório.");
      return;
    }
    if (name === "instagram" && !credentials.ig_user_id) {
      toast.error("Instagram User ID é obrigatório.");
      return;
    }

    setConnectingPlatform(true);
    try {
      const res = await fetch("/api/social-publisher/platforms", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ name, credentials }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      toast.success(`${name === "instagram" ? "Instagram" : "TikTok"} conectado!`);
      setConnectForm(null);
      setIgToken(""); setIgUserId(""); setTtkToken(""); setTtkOpenId("");
      await fetchPlatforms();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Falha ao conectar.");
    } finally {
      setConnectingPlatform(false);
    }
  }

  async function handleDisconnect(name: string) {
    try {
      const res = await fetch("/api/social-publisher/platforms", {
        method:  "DELETE",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ name }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      toast.success("Plataforma desconectada.");
      await fetchPlatforms();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Falha ao desconectar.");
    }
  }

  async function handleSchedule(e: React.FormEvent) {
    e.preventDefault();
    if (!caption.trim()) { toast.error("Caption é obrigatório."); return; }
    if (selectedPlatforms.size === 0) { toast.error("Selecione ao menos uma plataforma."); return; }

    setScheduling(true);
    try {
      const res = await fetch("/api/social-publisher/schedule", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caption,
          hashtags: hashtags.split(/[\s,]+/).map(h => h.trim()).filter(Boolean),
          scheduled_at: new Date(scheduledAt).toISOString(),
          platform_ids: Array.from(selectedPlatforms),
          media_url:    mediaUrl.trim() || null,
          post_type:    postType,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      toast.success("Post agendado com sucesso!");
      setCaption(""); setHashtags(""); setMediaUrl(""); setSelectedPlatforms(new Set());
      setTab("posts");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Falha ao agendar.");
    } finally {
      setScheduling(false);
    }
  }

  async function handlePublishNow(postId: string) {
    setPublishing(postId);
    toast.loading("Publicando...", { id: `pub-${postId}` });
    try {
      const res = await fetch(`/api/social-publisher/publish/${postId}`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      if (json.status === "published") {
        toast.success("Publicado com sucesso!", { id: `pub-${postId}` });
      } else if (json.status === "partial") {
        toast.warning(`Publicação parcial: ${json.published} ok, ${json.failed} falha`, { id: `pub-${postId}` });
      } else {
        throw new Error("Publicação falhou em todas as plataformas.");
      }
      await fetchPosts();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Falha ao publicar.", { id: `pub-${postId}` });
    } finally {
      setPublishing(null);
    }
  }

  // ── Active platforms for platform selection ───────────────────────────────────

  const activePlatforms = platforms.filter((p) => p.is_active);
  const hasIg  = platforms.some((p) => p.name === "instagram" && p.is_active);
  const hasTtk = platforms.some((p) => p.name === "tiktok"    && p.is_active);

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center shadow-lg shrink-0">
            <Send className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Social Publisher</h1>
            <p className="text-muted-foreground text-sm">Agende posts para Instagram e TikTok</p>
          </div>
        </div>
        {/* Status pills */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
          {(["instagram", "tiktok"] as const).map((n) => {
            const connected = platforms.some((p) => p.name === n && p.is_active);
            return (
              <div key={n} className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
                connected
                  ? "bg-green-50 border-green-200 text-green-700 dark:bg-green-950/30 dark:border-green-800 dark:text-green-400"
                  : "bg-slate-50 border-slate-200 text-slate-400 dark:bg-slate-900 dark:border-slate-700"
              )}>
                <PlatformIcon name={n} size={14} />
                {n === "instagram" ? "Instagram" : "TikTok"}
                <span className={cn("w-1.5 h-1.5 rounded-full ml-0.5", connected ? "bg-green-500" : "bg-slate-300")} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl w-fit">
        {([
          { key: "schedule", label: "Novo Post",        icon: Plus          },
          { key: "posts",    label: "Posts Agendados",  icon: CalendarClock },
          { key: "platforms",label: "Plataformas",      icon: Settings      },
        ] as { key: Tab; label: string; icon: React.ElementType }[]).map(({ key, label, icon: Icon }) => (
          <div
            key={key}
            role="button"
            tabIndex={0}
            onClick={() => setTab(key)}
            onKeyDown={(e) => e.key === "Enter" && setTab(key)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition select-none",
              tab === key
                ? "bg-white dark:bg-slate-800 shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </div>
        ))}
      </div>

      {/* ── Tab: Novo Post ───────────────────────────────────────────────────── */}
      {tab === "schedule" && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

          {/* Form */}
          <Card className="xl:col-span-7 border-none shadow-md">
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Criar novo post</CardTitle>
            </CardHeader>
            <CardContent>
              {activePlatforms.length === 0 && (
                <div className="mb-5 flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl text-sm text-amber-700 dark:text-amber-400">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>
                    Nenhuma conta conectada.{" "}
                    <span
                      role="button"
                      tabIndex={0}
                      className="underline cursor-pointer font-medium"
                      onClick={() => setTab("platforms")}
                      onKeyDown={(e) => e.key === "Enter" && setTab("platforms")}
                    >
                      Conecte uma plataforma
                    </span>{" "}
                    antes de agendar.
                  </span>
                </div>
              )}

              <form onSubmit={handleSchedule} className="space-y-5">

                {/* Platform selection */}
                <div className="space-y-2">
                  <Label>Plataformas</Label>
                  <div className="flex gap-3 flex-wrap">
                    {(["instagram", "tiktok"] as const).map((name) => {
                      const platform = platforms.find((p) => p.name === name && p.is_active);
                      const isSelected = platform && selectedPlatforms.has(platform.id);
                      return (
                        <div
                          key={name}
                          role="button"
                          tabIndex={platform ? 0 : -1}
                          onClick={() => {
                            if (!platform) return;
                            setSelectedPlatforms(prev => {
                              const next = new Set(prev);
                              if (next.has(platform.id)) next.delete(platform.id);
                              else next.add(platform.id);
                              return next;
                            });
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && platform) {
                              setSelectedPlatforms(prev => {
                                const next = new Set(prev);
                                if (next.has(platform.id)) next.delete(platform.id);
                                else next.add(platform.id);
                                return next;
                              });
                            }
                          }}
                          className={cn(
                            "flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition select-none",
                            !platform
                              ? "border-dashed border-slate-200 text-slate-300 cursor-not-allowed dark:border-slate-700 dark:text-slate-600"
                              : isSelected
                              ? name === "instagram"
                                ? "border-pink-400 bg-pink-50 text-pink-700 cursor-pointer dark:bg-pink-950/20 dark:border-pink-700 dark:text-pink-400"
                                : "border-slate-800 bg-slate-900 text-white cursor-pointer"
                              : "border-slate-200 text-slate-600 hover:border-slate-300 cursor-pointer dark:border-slate-700 dark:text-slate-400"
                          )}
                        >
                          <PlatformIcon name={name} size={20} />
                          {name === "instagram" ? "Instagram" : "TikTok"}
                          {!platform && <span className="text-xs text-slate-400">(não conectado)</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Post type */}
                <div className="space-y-2">
                  <Label>Tipo de mídia</Label>
                  <div className="flex gap-2">
                    {(["image", "video"] as const).map((t) => (
                      <div
                        key={t}
                        role="button"
                        tabIndex={0}
                        onClick={() => setPostType(t)}
                        onKeyDown={(e) => e.key === "Enter" && setPostType(t)}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 rounded-lg border text-sm cursor-pointer transition select-none",
                          postType === t
                            ? "border-violet-500 bg-violet-50 text-violet-700 dark:bg-violet-950/20 dark:border-violet-700 dark:text-violet-400"
                            : "border-slate-200 text-slate-500 hover:border-slate-300 dark:border-slate-700"
                        )}
                      >
                        {t === "image" ? <ImageIcon className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                        {t === "image" ? "Imagem" : "Vídeo"}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Media URL */}
                <div className="space-y-2">
                  <Label htmlFor="mediaUrl">
                    URL da mídia{" "}
                    <span className="text-muted-foreground font-normal text-xs">(pública, acessível pela API)</span>
                  </Label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="mediaUrl"
                      placeholder="https://exemplo.com/imagem.jpg"
                      value={mediaUrl}
                      onChange={(e) => setMediaUrl(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                {/* Caption */}
                <div className="space-y-2">
                  <Label htmlFor="caption">Caption *</Label>
                  <Textarea
                    id="caption"
                    placeholder="Escreva sua legenda aqui..."
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    className="min-h-[100px] resize-none"
                    required
                  />
                  <p className="text-xs text-muted-foreground text-right">{caption.length} caracteres</p>
                </div>

                {/* Hashtags */}
                <div className="space-y-2">
                  <Label htmlFor="hashtags">
                    Hashtags{" "}
                    <span className="text-muted-foreground font-normal text-xs">(separadas por espaço ou vírgula)</span>
                  </Label>
                  <Input
                    id="hashtags"
                    placeholder="#marketing #digital #vendas"
                    value={hashtags}
                    onChange={(e) => setHashtags(e.target.value)}
                  />
                </div>

                {/* Scheduled at */}
                <div className="space-y-2">
                  <Label htmlFor="scheduledAt">Data e hora de publicação</Label>
                  <Input
                    id="scheduledAt"
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={scheduling || activePlatforms.length === 0 || selectedPlatforms.size === 0}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg"
                >
                  {scheduling
                    ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Agendando...</>
                    : <><CalendarClock className="w-4 h-4 mr-2" />Agendar Post</>
                  }
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Preview */}
          <div className="xl:col-span-5 space-y-4">
            <Card className="border-none shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
                  Pré-visualização
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Mock phone preview */}
                <div className="mx-auto w-56 rounded-[2.5rem] border-4 border-slate-800 bg-black shadow-2xl overflow-hidden">
                  <div className="bg-slate-900 h-6 flex items-center justify-center">
                    <div className="w-20 h-1.5 rounded-full bg-slate-700" />
                  </div>
                  <div className="bg-white">
                    {/* IG header */}
                    <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-100">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400" />
                      <span className="text-xs font-semibold text-slate-800">seuusuario</span>
                    </div>
                    {/* Image placeholder */}
                    {mediaUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={mediaUrl}
                        alt="Preview"
                        className="w-full aspect-square object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    ) : (
                      <div className="w-full aspect-square bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                        {postType === "video"
                          ? <Video className="w-8 h-8 text-slate-300" />
                          : <ImageIcon className="w-8 h-8 text-slate-300" />}
                      </div>
                    )}
                    {/* Caption */}
                    <div className="px-3 py-2">
                      <p className="text-[10px] text-slate-700 leading-relaxed line-clamp-3">
                        {caption || <span className="text-slate-300 italic">Sua caption aparece aqui...</span>}
                      </p>
                      {hashtags && (
                        <p className="text-[10px] text-blue-500 mt-1 line-clamp-2">{hashtags}</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Schedule info */}
            {scheduledAt && (
              <Card className="border-none shadow-sm bg-violet-50 dark:bg-violet-950/20">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center gap-2 text-violet-700 dark:text-violet-400">
                    <Clock className="w-4 h-4 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold">Publicação agendada</p>
                      <p className="text-xs text-violet-600 dark:text-violet-300 mt-0.5">
                        {new Date(scheduledAt).toLocaleString("pt-BR", { dateStyle: "full", timeStyle: "short" })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* ── Tab: Posts Agendados ─────────────────────────────────────────────── */}
      {tab === "posts" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{posts.length} post{posts.length !== 1 ? "s" : ""}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchPosts}
              disabled={postsLoading}
            >
              <RefreshCw className={cn("w-3.5 h-3.5 mr-1.5", postsLoading && "animate-spin")} />
              Atualizar
            </Button>
          </div>

          {postsLoading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-xl bg-slate-50/50 dark:bg-slate-900/50">
              <CalendarClock className="w-10 h-10 text-slate-300 mb-3" />
              <p className="text-slate-500 font-medium">Nenhum post agendado</p>
              <p className="text-slate-400 text-sm mt-1">
                Vá para{" "}
                <span
                  role="button"
                  tabIndex={0}
                  className="underline cursor-pointer"
                  onClick={() => setTab("schedule")}
                  onKeyDown={(e) => e.key === "Enter" && setTab("schedule")}
                >
                  Novo Post
                </span>{" "}
                para começar.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {posts.map((post) => (
                <Card key={post.id} className="border-none shadow-sm">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start gap-4">
                      {/* Media thumb */}
                      <div className="shrink-0">
                        {post.media_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={post.media_url}
                            alt="thumb"
                            className="w-14 h-14 rounded-lg object-cover border border-border"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-border">
                            {post.post_type === "video"
                              ? <Video className="w-5 h-5 text-slate-400" />
                              : <ImageIcon className="w-5 h-5 text-slate-400" />}
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <p className="text-sm font-medium text-foreground line-clamp-2 flex-1">
                            {post.caption}
                          </p>
                          <StatusBadge status={post.status} />
                        </div>

                        {post.hashtags?.length > 0 && (
                          <p className="text-xs text-blue-500 mt-1 line-clamp-1">
                            {post.hashtags.map((h) => (h.startsWith("#") ? h : `#${h}`)).join(" ")}
                          </p>
                        )}

                        <div className="flex items-center gap-4 mt-2 flex-wrap">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(post.scheduled_at).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
                          </span>

                          {/* Per-platform status */}
                          <div className="flex items-center gap-2 flex-wrap">
                            {(post.sp_post_platforms ?? []).map((pp) => (
                              <div key={pp.id} className="flex items-center gap-1">
                                <PlatformIcon name={pp.sp_platforms.name} size={14} />
                                <StatusBadge status={pp.status} />
                                {pp.external_url && (
                                  <a
                                    href={pp.external_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-muted-foreground hover:text-foreground transition"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Publish now button */}
                      {(post.status === "pending" || post.status === "failed") && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePublishNow(post.id)}
                          disabled={publishing === post.id}
                          className="shrink-0 border-violet-300 text-violet-700 hover:bg-violet-50 dark:border-violet-700 dark:text-violet-400"
                        >
                          {publishing === post.id
                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            : <Zap className="w-3.5 h-3.5" />}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Plataformas ─────────────────────────────────────────────────── */}
      {tab === "platforms" && (
        <div className="space-y-6 max-w-2xl">

          {platformsLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {/* Instagram */}
              <Card className="border-none shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <PlatformIcon name="instagram" size={28} />
                      <div>
                        <CardTitle className="text-base">Instagram</CardTitle>
                        <p className="text-xs text-muted-foreground">Graph API v21.0</p>
                      </div>
                    </div>
                    {hasIg
                      ? <span className="text-xs font-semibold text-green-600 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Conectado</span>
                      : <span className="text-xs text-muted-foreground">Não conectado</span>}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {hasIg ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => handleDisconnect("instagram")}
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Desconectar
                    </Button>
                  ) : (
                    <>
                      {connectForm !== "instagram" ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-pink-300 text-pink-600 hover:bg-pink-50"
                          onClick={() => setConnectForm("instagram")}
                        >
                          <Plus className="w-3.5 h-3.5 mr-1.5" /> Conectar Instagram
                        </Button>
                      ) : (
                        <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
                          <div className="space-y-1.5">
                            <Label>Access Token</Label>
                            <Input
                              type="password"
                              placeholder="EAAxxxxx..."
                              value={igToken}
                              onChange={(e) => setIgToken(e.target.value)}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label>Instagram User ID</Label>
                            <Input
                              placeholder="17841400000000000"
                              value={igUserId}
                              onChange={(e) => setIgUserId(e.target.value)}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Obtenha o token longo (60 dias) no Meta for Developers.
                          </p>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              disabled={connectingPlatform}
                              onClick={() => handleConnect("instagram")}
                              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                            >
                              {connectingPlatform ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Salvar"}
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setConnectForm(null)}>
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>

              {/* TikTok */}
              <Card className="border-none shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <PlatformIcon name="tiktok" size={28} />
                      <div>
                        <CardTitle className="text-base">TikTok</CardTitle>
                        <p className="text-xs text-muted-foreground">Content Posting API v2</p>
                      </div>
                    </div>
                    {hasTtk
                      ? <span className="text-xs font-semibold text-green-600 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Conectado</span>
                      : <span className="text-xs text-muted-foreground">Não conectado</span>}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {hasTtk ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => handleDisconnect("tiktok")}
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Desconectar
                    </Button>
                  ) : (
                    <>
                      {connectForm !== "tiktok" ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-slate-800 text-slate-800 hover:bg-slate-900 hover:text-white"
                          onClick={() => setConnectForm("tiktok")}
                        >
                          <Plus className="w-3.5 h-3.5 mr-1.5" /> Conectar TikTok
                        </Button>
                      ) : (
                        <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
                          <div className="space-y-1.5">
                            <Label>Access Token</Label>
                            <Input
                              type="password"
                              placeholder="act.xxxxx..."
                              value={ttkToken}
                              onChange={(e) => setTtkToken(e.target.value)}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label>Open ID</Label>
                            <Input
                              placeholder="xxxxxxxxxxxxxxxxxxxxxx"
                              value={ttkOpenId}
                              onChange={(e) => setTtkOpenId(e.target.value)}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Gere o access token via TikTok for Developers OAuth flow.
                          </p>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              disabled={connectingPlatform}
                              onClick={() => handleConnect("tiktok")}
                              className="bg-black text-white hover:bg-slate-800"
                            >
                              {connectingPlatform ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Salvar"}
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setConnectForm(null)}>
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}
    </div>
  );
}
