"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n";
import {
  BarChart,
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
} from "lucide-react";

const NAV_ITEMS = [
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
  {
    key:   "nav.productMiner",
    icon:  Search,
    href:  "/dashboard/modules/product-miner",
    color: "text-violet-400",
    glow:  "group-hover:drop-shadow-[0_0_6px_rgb(167,139,250)]",
  },
  {
    key:   "nav.ideaValidator",
    icon:  Lightbulb,
    href:  "/dashboard/modules/idea-validator",
    color: "text-pink-400",
    glow:  "group-hover:drop-shadow-[0_0_6px_rgb(244,114,182)]",
  },
  {
    key:   "nav.productBuilder",
    icon:  Package,
    href:  "/dashboard/modules/product-builder",
    color: "text-orange-400",
    glow:  "group-hover:drop-shadow-[0_0_6px_rgb(251,146,60)]",
  },
  {
    key:   "nav.salesPage",
    icon:  PenTool,
    href:  "/dashboard/modules/sales-page-generator",
    color: "text-emerald-400",
    glow:  "group-hover:drop-shadow-[0_0_6px_rgb(52,211,153)]",
  },
  {
    key:   "nav.checkout",
    icon:  ShoppingCart,
    href:  "/dashboard/modules/checkout-generator",
    color: "text-green-400",
    glow:  "group-hover:drop-shadow-[0_0_6px_rgb(74,222,128)]",
  },
  {
    key:   "nav.socialContent",
    icon:  Megaphone,
    href:  "/dashboard/modules/social-media-content",
    color: "text-cyan-400",
    glow:  "group-hover:drop-shadow-[0_0_6px_rgb(34,211,238)]",
  },
  {
    key:   "nav.adsGenerator",
    icon:  BarChart,
    href:  "/dashboard/modules/ads-generator",
    color: "text-red-400",
    glow:  "group-hover:drop-shadow-[0_0_6px_rgb(248,113,113)]",
  },
  {
    key:   "nav.seoGenerator",
    icon:  Wand2,
    href:  "/dashboard/modules/seo-generator",
    color: "text-yellow-400",
    glow:  "group-hover:drop-shadow-[0_0_6px_rgb(250,204,21)]",
  },
  {
    key:   "nav.bookGenerator",
    icon:  BookOpen,
    href:  "/dashboard/modules/book-generator",
    color: "text-indigo-400",
    badge: true,
    glow:  "group-hover:drop-shadow-[0_0_6px_rgb(129,140,248)]",
  },
  {
    key:   "nav.socialPublisher",
    icon:  Send,
    href:  "/dashboard/modules/social-publisher",
    color: "text-pink-400",
    badge: true,
    glow:  "group-hover:drop-shadow-[0_0_6px_rgb(244,114,182)]",
  },
  {
    key:   "nav.squads",
    icon:  Users,
    href:  "/squads",
    color: "text-purple-400",
    badge: true,
    glow:  "group-hover:drop-shadow-[0_0_6px_rgb(192,132,252)]",
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <div className="flex flex-col h-full bg-[var(--sidebar)] border-r border-[var(--sidebar-border)]">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-[var(--sidebar-border)]">
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

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 relative",
                isActive
                  ? "sidebar-active"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5 dark:hover:bg-white/5"
              )}
            >
              <item.icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-all",
                  isActive ? "text-[#00d4aa]" : item.color,
                  !isActive && item.glow
                )}
              />
              <span className="truncate flex-1">{t(item.key)}</span>
              {item.badge && !isActive && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#00d4aa]/15 text-[#00d4aa] font-semibold shrink-0">
                  {t("common.new")}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-[var(--sidebar-border)]">
        <p className="text-[10px] text-muted-foreground/50 font-mono">v2.0 · ProfitBuilder AI</p>
      </div>
    </div>
  );
}
