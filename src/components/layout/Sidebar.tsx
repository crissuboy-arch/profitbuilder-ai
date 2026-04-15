"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  BarChart,
  BookOpen,
  LayoutDashboard,
  Lightbulb,
  Megaphone,
  Package,
  PenTool,
  Search,
  ShoppingCart,
  Wand2,
  Folder
} from "lucide-react";

const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
    color: "text-sky-500"
  },
  {
    label: "Projects",
    icon: Folder,
    href: "/dashboard/projects",
    color: "text-amber-500"
  },
  {
    label: "Product Miner",
    icon: Search,
    href: "/dashboard/modules/product-miner",
    color: "text-violet-500",
  },
  {
    label: "Idea Validator",
    icon: Lightbulb,
    href: "/dashboard/modules/idea-validator",
    color: "text-pink-700",
  },
  {
    label: "Product Builder",
    icon: Package,
    href: "/dashboard/modules/product-builder",
    color: "text-orange-700",
  },
  {
    label: "Sales Page",
    icon: PenTool,
    href: "/dashboard/modules/sales-page-generator",
    color: "text-emerald-500",
  },
  {
    label: "Checkout",
    icon: ShoppingCart,
    href: "/dashboard/modules/checkout-generator",
    color: "text-green-700",
  },
  {
    label: "Social Content",
    icon: Megaphone,
    href: "/dashboard/modules/social-media-content",
    color: "text-cyan-500",
  },
  {
    label: "Ads Generator",
    icon: BarChart,
    href: "/dashboard/modules/ads-generator",
    color: "text-red-500",
  },
  {
    label: "SEO Generator",
    icon: Wand2,
    href: "/dashboard/modules/seo-generator",
    color: "text-yellow-500",
  },
  {
    label: "Gerador de Livros",
    icon: BookOpen,
    href: "/dashboard/modules/book-generator",
    color: "text-indigo-500",
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-slate-900 text-white">
      <div className="px-3 py-2 flex-1">
        <Link href="/dashboard" className="flex items-center pl-3 mb-14">
          <div className="relative w-8 h-8 mr-4 flex items-center justify-center bg-white rounded-lg">
            <Wand2 className="w-5 h-5 text-slate-900" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            ProfitBuilder <span className="text-primary text-blue-500">AI</span>
          </h1>
        </Link>
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                pathname === route.href ? "text-white bg-white/10" : "text-zinc-400"
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
