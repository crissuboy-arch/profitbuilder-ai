"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n";
import { createClient } from "@/utils/supabase/client";
import { cn } from "@/lib/utils";
import {
  BarChart, BarChart3, Lightbulb, Megaphone, Package, PenTool, Search,
  ShoppingCart, Wand2, ArrowRight, BookOpen, Users,
  Layers, TrendingUp, Zap, Rocket,
} from "lucide-react";

const TOOLS = [
  {
    key:      "nav.productMiner",
    desc_en:  "Discover high-converting product opportunities.",
    desc_pt:  "Descubra oportunidades de produtos com alta conversão.",
    icon:     Search,
    color:    "text-violet-400",
    bg:       "bg-violet-400/10",
    border:   "group-hover:border-violet-400/30",
    href:     "/dashboard/modules/product-miner",
  },
  {
    key:      "nav.ideaValidator",
    desc_en:  "Analyze market demand and validate product ideas.",
    desc_pt:  "Analise a demanda do mercado e valide suas ideias.",
    icon:     Lightbulb,
    color:    "text-pink-400",
    bg:       "bg-pink-400/10",
    border:   "group-hover:border-pink-400/30",
    href:     "/dashboard/modules/idea-validator",
  },
  {
    key:      "nav.productBuilder",
    desc_en:  "Create complete info-products and courses with AI.",
    desc_pt:  "Crie infoprodutos e cursos completos com IA.",
    icon:     Package,
    color:    "text-orange-400",
    bg:       "bg-orange-400/10",
    border:   "group-hover:border-orange-400/30",
    href:     "/dashboard/modules/product-builder",
  },
  {
    key:      "nav.salesPage",
    desc_en:  "Generate high-converting sales pages automatically.",
    desc_pt:  "Gere páginas de vendas de alta conversão automaticamente.",
    icon:     PenTool,
    color:    "text-emerald-400",
    bg:       "bg-emerald-400/10",
    border:   "group-hover:border-emerald-400/30",
    href:     "/dashboard/modules/sales-page-generator",
  },
  {
    key:      "nav.checkout",
    desc_en:  "Optimize checkout experiences that convert.",
    desc_pt:  "Otimize checkouts que realmente convertem.",
    icon:     ShoppingCart,
    color:    "text-green-400",
    bg:       "bg-green-400/10",
    border:   "group-hover:border-green-400/30",
    href:     "/dashboard/modules/checkout-generator",
  },
  {
    key:      "nav.socialContent",
    desc_en:  "Create weeks of social media posts instantly.",
    desc_pt:  "Crie semanas de posts para redes sociais em minutos.",
    icon:     Megaphone,
    color:    "text-cyan-400",
    bg:       "bg-cyan-400/10",
    border:   "group-hover:border-cyan-400/30",
    href:     "/dashboard/modules/social-media-content",
  },
  {
    key:      "nav.adsGenerator",
    desc_en:  "Write profitable ad copies for any platform.",
    desc_pt:  "Escreva copys lucrativas para anúncios em qualquer plataforma.",
    icon:     BarChart,
    color:    "text-red-400",
    bg:       "bg-red-400/10",
    border:   "group-hover:border-red-400/30",
    href:     "/dashboard/modules/ads-generator",
  },
  {
    key:      "nav.adsAnalytics",
    desc_en:  "Upload Meta Ads reports and get AI-powered insights.",
    desc_pt:  "Carregue relatórios do Meta Ads e получите insights de IA.",
    icon:     BarChart3,
    color:    "text-blue-400",
    bg:       "bg-blue-400/10",
    border:   "group-hover:border-blue-400/30",
    href:     "/dashboard/modules/ads-analytics",
  },
  {
    key:      "nav.seoGenerator",
    desc_en:  "Generate SEO optimized blogs and content clusters.",
    desc_pt:  "Gere blogs e clusters de conteúdo otimizados para SEO.",
    icon:     Wand2,
    color:    "text-yellow-400",
    bg:       "bg-yellow-400/10",
    border:   "group-hover:border-yellow-400/30",
    href:     "/dashboard/modules/seo-generator",
  },
  {
    key:      "nav.bookGenerator",
    desc_en:  "Create full books with DALL-E illustrations + PDF.",
    desc_pt:  "Crie livros completos com ilustrações DALL-E + PDF.",
    icon:     BookOpen,
    color:    "text-indigo-400",
    bg:       "bg-indigo-400/10",
    border:   "group-hover:border-indigo-400/30",
    href:     "/dashboard/modules/book-generator",
    badge:    true,
  },
  {
    key:      "nav.marketingMachine",
    desc_en:  "Generate complete marketing assets automatically.",
    desc_pt:  "Gere todos os assets de marketing automaticamente.",
    icon:     Zap,
    color:    "text-teal-400",
    bg:       "bg-teal-400/10",
    border:   "group-hover:border-teal-400/30",
    href:     "/dashboard/modules/marketing-machine",
  },
  {
    key:      "nav.squads",
    desc_en:  "177 specialized AI agents organized in 13 squads.",
    desc_pt:  "177 agentes IA especializados em 13 squads.",
    icon:     Users,
    color:    "text-purple-400",
    bg:       "bg-purple-400/10",
    border:   "group-hover:border-purple-400/30",
    href:     "/squads",
    badge:    true,
  },
];

interface Metrics {
  books:    number;
  copys:    number;
  sessions: number;
}

export default function DashboardPage() {
  const { t, lang } = useLanguage();
  const [email, setEmail]     = useState<string | null>(null);
  const [metrics, setMetrics] = useState<Metrics>({ books: 0, copys: 0, sessions: 0 });

  useEffect(() => {
    const supabase = createClient();

    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setEmail(user.email ?? null);

      // Count book generations
      const { count: bookCount } = await supabase
        .from("generations")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("module_type", "book-generator");

      // Count all copy/content generations (everything except books)
      const { count: copyCount } = await supabase
        .from("generations")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .neq("module_type", "book-generator");

      // Sessions = total generations (proxy metric)
      const { count: totalCount } = await supabase
        .from("generations")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      setMetrics({
        books:    bookCount ?? 0,
        copys:    copyCount ?? 0,
        sessions: totalCount ?? 0,
      });
    }

    load();
  }, []);

  const displayName = email?.split("@")[0] ?? "usuário";

  const METRIC_CARDS = [
    { label: t("dash.metrics.books"),   value: metrics.books,    icon: BookOpen,    color: "text-indigo-400",  bg: "bg-indigo-400/10" },
    { label: t("dash.metrics.copys"),   value: metrics.copys,    icon: Layers,      color: "text-teal-400",    bg: "bg-teal-400/10" },
    { label: t("dash.metrics.sessions"),value: metrics.sessions,  icon: TrendingUp,  color: "text-purple-400",  bg: "bg-purple-400/10" },
  ];

  // PT description or EN description based on language
  const getDesc = (tool: typeof TOOLS[0]) =>
    lang === "pt" ? tool.desc_pt : tool.desc_en;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">

      {/* ── Welcome hero ─────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl p-6 md:p-8 mb-8 card-premium glass">
        {/* Background glow */}
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-[#00d4aa]/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-[#7c3aed]/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-[#00d4aa]" />
              <span className="text-xs font-semibold text-[#00d4aa] uppercase tracking-widest">
                ProfitBuilder AI
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              {t("dash.welcome")},{" "}
              <span className="gradient-text">{displayName}</span>
            </h1>
            <p className="text-muted-foreground text-sm mt-1">{t("dash.subtitle")}</p>
          </div>
          <Link
            href="/dashboard/criar-produto"
            className="btn-cta inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold shrink-0 shadow-lg shadow-[#00d4aa]/20"
          >
            <Rocket className="w-4 h-4" />
            Criar Meu Produto
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* ── Metrics row ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {METRIC_CARDS.map((m) => (
          <div
            key={m.label}
            className="glass card-premium rounded-xl p-4 flex items-center gap-3"
          >
            <div className={cn("p-2 rounded-lg shrink-0", m.bg)}>
              <m.icon className={cn("w-5 h-5", m.color)} />
            </div>
            <div className="min-w-0">
              <p className="text-xl md:text-2xl font-bold tabular-nums">{m.value}</p>
              <p className="text-xs text-muted-foreground truncate">{m.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Section heading ───────────────────────────────────────────────── */}
      <div className="mb-6">
        <h2 className="text-xl font-bold">{t("dash.heading")}</h2>
        <p className="text-muted-foreground text-sm mt-1 max-w-2xl">
          {t("dash.subheading")}
        </p>
      </div>

      {/* ── Tool cards grid ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {TOOLS.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="group block"
          >
            <div
              className={cn(
                "h-full glass card-premium rounded-xl p-5 border border-border/50 transition-all duration-200",
                "hover:shadow-xl hover:-translate-y-0.5 cursor-pointer",
                tool.border
              )}
            >
              {/* Icon + badge row */}
              <div className="flex items-start justify-between mb-4">
                <div className={cn("p-2.5 rounded-xl shrink-0", tool.bg)}>
                  <tool.icon className={cn("w-6 h-6", tool.color)} />
                </div>
                <div className="flex items-center gap-2">
                  {tool.badge && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#00d4aa]/15 text-[#00d4aa] font-bold uppercase tracking-wide">
                      {t("common.new")}
                    </span>
                  )}
                  <ArrowRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-[#00d4aa] group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>

              {/* Label + description */}
              <div>
                <p className="font-semibold text-sm mb-1.5 group-hover:text-foreground transition-colors">
                  {t(tool.key)}
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {getDesc(tool)}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
