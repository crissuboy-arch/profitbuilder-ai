"use client";

import { Card } from "@/components/ui/card";
import { 
  BarChart, 
  Lightbulb, 
  Megaphone, 
  Package, 
  PenTool, 
  Search, 
  ShoppingCart, 
  Wand2, 
  ArrowRight
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const tools = [
  {
    label: "Product Miner",
    description: "Discover high-converting product opportunities.",
    icon: Search,
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
    href: "/dashboard/modules/product-miner"
  },
  {
    label: "Idea Validator",
    description: "Analyze market demand and validate product ideas.",
    icon: Lightbulb,
    color: "text-pink-700",
    bgColor: "bg-pink-700/10",
    href: "/dashboard/modules/idea-validator"
  },
  {
    label: "Product Builder",
    description: "Create complete info-products and courses with AI.",
    icon: Package,
    color: "text-orange-700",
    bgColor: "bg-orange-700/10",
    href: "/dashboard/modules/product-builder"
  },
  {
    label: "Sales Page",
    description: "Generate high-converting sales pages automatically.",
    icon: PenTool,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    href: "/dashboard/modules/sales-page-generator"
  },
  {
    label: "Checkout",
    description: "Optimize and generate checkout experiences that convert.",
    icon: ShoppingCart,
    color: "text-green-700",
    bgColor: "bg-green-700/10",
    href: "/dashboard/modules/checkout-generator"
  },
  {
    label: "Social Content",
    description: "Create weeks of engaging social media posts instantly.",
    icon: Megaphone,
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
    href: "/dashboard/modules/social-media-content"
  },
  {
    label: "Ads Generator",
    description: "Write profitable ad copies for Facebook, Google, and more.",
    icon: BarChart,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    href: "/dashboard/modules/ads-generator"
  },
  {
    label: "SEO Generator",
    description: "Generate SEO optimized blogs and content clusters.",
    icon: Wand2,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    href: "/dashboard/modules/seo-generator"
  }
];

export default function DashboardPage() {
  const router = useRouter();

  return (
    <div className="p-8 pb-20 sm:p-12 font-[family-name:var(--font-geist-sans)] max-w-7xl mx-auto">
      <div className="mb-8 space-y-4">
        <h2 className="text-2xl md:text-4xl font-bold text-center">
          Explore the Power of AI
        </h2>
        <p className="text-muted-foreground font-light text-sm md:text-lg text-center max-w-2xl mx-auto">
          Scale your digital business with our centralized suite of AI-powered tools. Create products, marketing, and sales systems in minutes, not weeks.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-12">
        {tools.map((tool) => (
          <Card
            onClick={() => router.push(tool.href)}
            key={tool.href}
            className="p-6 border-black/5 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group bg-white shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={cn("p-2 w-fit rounded-lg", tool.bgColor)}>
                <tool.icon className={cn("w-8 h-8", tool.color)} />
              </div>
              <ArrowRight className="w-5 h-5 text-zinc-300 group-hover:text-black transition" />
            </div>
            
            <div>
              <div className="font-semibold text-xl mb-2">
                {tool.label}
              </div>
              <p className="text-zinc-500 text-sm leading-relaxed">
                {tool.description}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
