"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n";
import {
  BarChart,
  BarChart3,
  BookOpen,
  LayoutDashboard,
  Lightbulb,
  Megaphone,
  Package,
  PenTool,
  Search,
  Send,
  ShoppingCart,
  Wand2,
  Folder,
  Users,
  Sparkles,
  Zap,
  Rocket,
  ChevronRight,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────

type NavItem = {
  key: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  color: string;
  glow: string;
  badge?: boolean;
  agents?: string[];
};

type NavGroup = {
  id: string;
  label: string;
  emoji: string;
  items: NavItem[];
};

// ── Utility items (always visible at top, no section header) ─────────────────

const UTILITY_ITEMS: NavItem[] = [
  {
    key:   "nav.dashboard",
    icon:  LayoutDashboard,
    href:  "/dashboard",
    color: "text-sky-400",
    glow:  "group-hover:drop-shadow-[0_0_6px_rgb(56,189,248)]",
  },
  {
    key:   "nav.projects",
    icon:  Folder,
    href:  "/dashboard/projects",
    color: "text-amber-400",
    glow:  "group-hover:drop-shadow-[0_0_6px_rgb(251,191,36)]",
  },
];

// ── Grouped nav sections ──────────────────────────────────────────────────────

const NAV_GROUPS: NavGroup[] = [
  {
    id: "descobrir", label: "DESCOBRIR", emoji: "📊",
    items: [
      {
        key: "nav.productMiner", icon: Search,
        href: "/dashboard/modules/product-miner",
        color: "text-violet-400",
        glow: "group-hover:drop-shadow-[0_0_6px_rgb(167,139,250)]",
        agents: ["data-chief", "sean-ellis"],
      },
      {
        key: "nav.ideaValidator", icon: Lightbulb,
        href: "/dashboard/modules/idea-validator",
        color: "text-pink-400",
        glow: "group-hover:drop-shadow-[0_0_6px_rgb(244,114,182)]",
        agents: ["hormozi-offers", "hormozi-advisor"],
      },
    ],
  },
  {
    id: "criar", label: "CRIAR", emoji: "🛠",
    items: [
      {
        key: "nav.productBuilder", icon: Package,
        href: "/dashboard/modules/product-builder",
        color: "text-orange-400",
        glow: "group-hover:drop-shadow-[0_0_6px_rgb(251,146,60)]",
        agents: ["copy-master-chief", "story-chief"],
      },
      {
        key: "nav.bookGenerator", icon: BookOpen,
        href: "/dashboard/modules/book-generator",
        color: "text-indigo-400",
        glow: "group-hover:drop-shadow-[0_0_6px_rgb(129,140,248)]",
        badge: true,
        agents: ["story-chief", "joseph-campbell"],
      },
    ],
  },
  {
    id: "vender", label: "VENDER", emoji: "💰",
    items: [
      {
        key: "nav.salesPage", icon: PenTool,
        href: "/dashboard/modules/sales-page-generator",
        color: "text-emerald-400",
        glow: "group-hover:drop-shadow-[0_0_6px_rgb(52,211,153)]",
        agents: ["gary-halbert", "david-ogilvy"],
      },
      {
        key: "nav.checkout", icon: ShoppingCart,
        href: "/dashboard/modules/checkout-generator",
        color: "text-green-400",
        glow: "group-hover:drop-shadow-[0_0_6px_rgb(74,222,128)]",
        agents: ["hormozi-pricing", "hormozi-closer"],
      },
    ],
  },
  {
    id: "crescer", label: "CRESCER", emoji: "📢",
    items: [
      {
        key: "nav.socialContent", icon: Megaphone,
        href: "/dashboard/modules/social-media-content",
        color: "text-cyan-400",
        glow: "group-hover:drop-shadow-[0_0_6px_rgb(34,211,238)]",
        agents: ["dan-koe", "traffic-chief"],
      },
      {
        key: "nav.adsGenerator", icon: BarChart,
        href: "/dashboard/modules/ads-generator",
        color: "text-red-400",
        glow: "group-hover:drop-shadow-[0_0_6px_rgb(248,113,113)]",
        agents: ["dan-kennedy", "gary-bencivenga"],
      },
      {
        key: "nav.socialPublisher", icon: Send,
        href: "/dashboard/modules/social-publisher",
        color: "text-pink-400",
        glow: "group-hover:drop-shadow-[0_0_6px_rgb(244,114,182)]",
        badge: true,
      },
      {
        key: "nav.marketingMachine", icon: Zap,
        href: "/dashboard/modules/marketing-machine",
        color: "text-teal-400",
        glow: "group-hover:drop-shadow-[0_0_6px_rgb(45,212,191)]",
      },
    ],
  },
  {
    id: "escalar", label: "ESCALAR", emoji: "📈",
    items: [
      {
        key: "nav.adsAnalytics", icon: BarChart3,
        href: "/dashboard/modules/ads-analytics",
        color: "text-blue-400",
        glow: "group-hover:drop-shadow-[0_0_6px_rgb(96,165,250)]",
        agents: ["ads-analyst", "performance-analyst"],
      },
      {
        key: "nav.seoGenerator", icon: Wand2,
        href: "/dashboard/modules/seo-generator",
        color: "text-yellow-400",
        glow: "group-hover:drop-shadow-[0_0_6px_rgb(250,204,21)]",
        agents: ["david-ogilvy"],
      },
    ],
  },
  {
    id: "agentes", label: "AGENTES", emoji: "🤖",
    items: [
      {
        key: "nav.squads", icon: Users,
        href: "/squads",
        color: "text-purple-400",
        glow: "group-hover:drop-shadow-[0_0_6px_rgb(192,132,252)]",
        badge: true,
        agents: ["177 agentes"],
      },
    ],
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

export function Sidebar() {
  const pathname = usePathname();
  const { t } = useLanguage();

  const isActive = (href: string) =>
    pathname === href || (href !== "/dashboard" && pathname.startsWith(href + "/"));

  return (
    <div className="flex flex-col h-full bg-[var(--sidebar)] border-r border-[var(--sidebar-border)]">

      {/* ── Logo ─────────────────────────────────────────────────────────── */}
      <div className="px-4 py-4 border-b border-[var(--sidebar-border)]">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="relative w-9 h-9 flex items-center justify-center rounded-xl btn-cta shrink-0 shadow-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-foreground leading-none">
              ProfitBuilder
            </h1>
            <span className="text-xs gradient-text font-semibold">AI</span>
          </div>
        </Link>
      </div>

      {/* ── Nav ──────────────────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4 scrollbar-none">

        {/* Utility: Dashboard + Projects */}
        <div className="space-y-0.5">
          {UTILITY_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150",
                isActive(item.href)
                  ? "sidebar-active"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              )}
            >
              <item.icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-all",
                  isActive(item.href) ? "text-[#00d4aa]" : item.color,
                  !isActive(item.href) && item.glow
                )}
              />
              <span className="truncate">{t(item.key)}</span>
            </Link>
          ))}
        </div>

        {/* ── 🚀 COMEÇAR ── */}
        <div>
          <p className="px-3 mb-2 text-[10px] font-bold tracking-widest text-muted-foreground/40 uppercase flex items-center gap-1.5">
            <span>🚀</span> COMEÇAR
          </p>
          <Link
            href="/dashboard/criar-produto"
            className={cn(
              "group flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-150",
              isActive("/dashboard/criar-produto")
                ? "btn-cta text-white shadow-lg shadow-[#00d4aa]/20"
                : "bg-[#00d4aa]/10 text-[#00d4aa] hover:bg-[#00d4aa]/20 border border-[#00d4aa]/20 hover:border-[#00d4aa]/40"
            )}
          >
            <Rocket className="h-4 w-4 shrink-0" />
            <span className="flex-1 truncate leading-snug text-[13px]">
              Criar Meu Produto Completo
            </span>
            <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-50 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* ── Grouped sections ── */}
        {NAV_GROUPS.map((group) => (
          <div key={group.id}>
            <p className="px-3 mb-1.5 text-[10px] font-bold tracking-widest text-muted-foreground/40 uppercase flex items-center gap-1.5">
              <span>{group.emoji}</span> {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group flex items-start gap-2.5 px-3 py-2 rounded-lg transition-all duration-150 relative",
                      active
                        ? "sidebar-active"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-4 w-4 shrink-0 mt-0.5 transition-all",
                        active ? "text-[#00d4aa]" : item.color,
                        !active && item.glow
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-medium truncate">{t(item.key)}</span>
                        {item.badge && !active && (
                          <span className="text-[9px] px-1 py-0.5 rounded-full bg-[#00d4aa]/15 text-[#00d4aa] font-bold shrink-0 leading-none">
                            {t("common.new")}
                          </span>
                        )}
                      </div>
                      {item.agents && item.agents.length > 0 && (
                        <p className="text-[10px] text-muted-foreground/35 truncate mt-0.5 font-mono leading-none">
                          {item.agents.join(" · ")}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <div className="px-4 py-3 border-t border-[var(--sidebar-border)]">
        <p className="text-[10px] text-muted-foreground/50 font-mono">v2.0 · ProfitBuilder AI</p>
      </div>
    </div>
  );
}
