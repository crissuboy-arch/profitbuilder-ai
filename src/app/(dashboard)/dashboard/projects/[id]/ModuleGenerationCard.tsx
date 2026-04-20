/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Bot, 
  Search, 
  Lightbulb, 
  Package, 
  PenTool, 
  ShoppingCart, 
  Megaphone, 
  BarChart, 
  Wand2,
  Calendar,
  CheckCircle2,
  TrendingUp,
  Target,
  DollarSign,
  Share2,
  Video,
  ImageIcon,
  LayoutTemplate
} from "lucide-react";
import { cn } from "@/lib/utils";

interface GenerationData {
  id: string;
  module_type: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  input_params: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  output_data: any;
  created_at: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const moduleConfig: Record<string, { icon: any, color: string, label: string }> = {
  "product-miner": { icon: Search, color: "text-violet-500", label: "Product Miner" },
  "idea-validator": { icon: Lightbulb, color: "text-pink-700", label: "Idea Validator" },
  "product-builder": { icon: Package, color: "text-orange-700", label: "Product Builder" },
  "sales-page-generator": { icon: PenTool, color: "text-emerald-500", label: "Sales Page" },
  "checkout-generator": { icon: ShoppingCart, color: "text-green-700", label: "Checkout Generator" },
  "social-media-content": { icon: Megaphone, color: "text-cyan-500", label: "Social Media" },
  "social-media-generator": { icon: Megaphone, color: "text-cyan-500", label: "Social Media" },
  "ads-generator": { icon: BarChart, color: "text-red-500", label: "Ads Generator" },
  "seo-generator": { icon: Wand2, color: "text-yellow-500", label: "SEO Generator" },
};

export function ModuleGenerationCard({ gen }: { gen: GenerationData }) {
  const config = moduleConfig[gen.module_type] || { icon: Bot, color: "text-slate-500", label: gen.module_type };
  const Icon = config.icon;

  return (
    <Card className="overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="bg-slate-50/50 border-b pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className={cn("p-2 rounded-lg bg-white shadow-sm", config.color.replace("text-", "bg-").replace("-500", "-500/10").replace("-700", "-700/10"))}>
               <Icon className={cn("w-5 h-5", config.color)} />
             </div>
             <div>
               <CardTitle className="text-lg font-bold tracking-tight">
                 {config.label}
               </CardTitle>
               <CardDescription className="text-xs">
                 Saved on {new Date(gen.created_at).toLocaleString()}
               </CardDescription>
             </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
           {/* Dynamic Content Rendering Based on Module Type */}
           {renderModuleContent(gen)}

           {/* Input Context Toggle or Small Badge */}
           <div className="pt-4 border-t border-slate-100">
             <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Input Context</h4>
             <div className="flex flex-wrap gap-2">
               {Object.entries(gen.input_params || {}).map(([key, value]) => (
                 <span key={key} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">
                   <span className="font-bold">{key}:</span> {String(value)}
                 </span>
               ))}
             </div>
           </div>
        </div>
      </CardContent>
    </Card>
  );
}

function renderModuleContent(gen: GenerationData) {
  const data = gen.output_data;
  const type = gen.module_type;

  switch (type) {
    case "product-miner":
      const ideas = data.ideas || [data];
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ideas.map((idea: any, i: number) => (
            <div key={i} className="bg-violet-50/50 border border-violet-100 p-4 rounded-xl">
              <h5 className="font-bold text-violet-900 mb-1">{idea.productName}</h5>
              <p className="text-xs text-slate-600 mb-2">{idea.mainProblemSolved}</p>
              <div className="flex justify-between text-[10px] font-bold">
                <span className="text-violet-600">{idea.recommendedFormat}</span>
                <span className="text-slate-500">{idea.priceRange}</span>
              </div>
            </div>
          ))}
        </div>
      );

    case "idea-validator":
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-center p-4 bg-pink-50 rounded-xl border border-pink-100">
             <div className="text-center">
               <div className="text-sm font-bold text-pink-500 uppercase">Viability Score</div>
               <div className="text-4xl font-black text-pink-700">{data.overallViabilityScore}/100</div>
             </div>
          </div>
          <p className="text-sm text-slate-700 italic border-l-4 border-pink-200 pl-4">{data.overallFeedback}</p>
          <div className="grid grid-cols-2 gap-3">
             {[
               { label: "Demand", score: data.demandScore, icon: TrendingUp },
               { label: "Competition", score: data.competitionScore, icon: Target },
               { label: "Monetization", score: data.monetizationScore, icon: DollarSign },
               { label: "Virality", score: data.viralityScore, icon: Share2 },
             ].map((m) => (
               <div key={m.label} className="flex items-center justify-between p-2 bg-white border rounded shadow-sm">
                 <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                   <m.icon className="w-3 h-3" /> {m.label}
                 </div>
                 <span className="text-xs font-bold">{m.score}</span>
               </div>
             ))}
          </div>
        </div>
      );

    case "product-builder":
      return (
        <div className="space-y-4 text-sm">
          <div className="p-3 bg-orange-50 border border-orange-100 rounded-lg">
             <h5 className="font-bold text-orange-900 mb-1">Concept</h5>
             <p className="text-slate-700">{data.concept}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
               <h6 className="font-bold text-xs uppercase text-slate-400 mb-2">Offer Structure</h6>
               <p className="text-xs text-slate-600 leading-relaxed">{data.offerStructure}</p>
             </div>
             <div>
               <h6 className="font-bold text-xs uppercase text-slate-400 mb-2">Curriculum Modules</h6>
               <ul className="text-xs text-slate-600 list-disc pl-4 space-y-1">
                 {data.modules?.map((m: string, i: number) => <li key={i}>{m}</li>)}
               </ul>
             </div>
          </div>
        </div>
      );

    case "sales-page-generator":
      return (
        <div className="space-y-4">
          <div className="p-4 bg-emerald-900 text-white rounded-xl text-center">
             <h5 className="text-xs font-bold uppercase opacity-60 mb-1">Main Hook</h5>
             <p className="text-lg font-black leading-tight">{data.headline}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-3 rounded border">
               <h6 className="text-[10px] font-bold text-slate-400 uppercase mb-1">Problem</h6>
               <p className="text-[10px] text-slate-600 line-clamp-3">{data.problemSection}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded border">
               <h6 className="text-[10px] font-bold text-slate-400 uppercase mb-1">Guarantee</h6>
               <p className="text-[10px] text-slate-600 line-clamp-3">{data.guarantee}</p>
            </div>
          </div>
        </div>
      );

    case "checkout-generator":
      return (
        <div className="space-y-4 text-sm">
          <div className="flex gap-4">
            <div className="flex-1 p-3 border rounded-lg bg-green-50 border-green-100">
               <h5 className="font-bold text-green-900 mb-1">Structure</h5>
               <p className="text-xs text-slate-600">{data.checkoutStructure}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
             <div className="text-center p-2 bg-slate-50 rounded">
                <div className="text-[10px] font-bold">Bumps</div>
                <div className="text-xs font-black">{data.orderBumps?.length || 0}</div>
             </div>
             <div className="text-center p-2 bg-slate-50 rounded">
                <div className="text-[10px] font-bold">Upsells</div>
                <div className="text-xs font-black">{data.upsells?.length || 0}</div>
             </div>
             <div className="text-center p-2 bg-slate-50 rounded">
                <div className="text-[10px] font-bold">Plans</div>
                <div className="text-xs font-black">{data.paymentPlans?.length || 0}</div>
             </div>
          </div>
        </div>
      );

    case "social-media-content":
    case "social-media-generator":
      return (
        <div className="space-y-4">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {data.weeklySchedule?.map((day: any, i: number) => (
              <div key={i} className="shrink-0 w-24 bg-cyan-50 border border-cyan-100 p-2 rounded text-center">
                <div className="text-[8px] font-bold text-cyan-600 uppercase">{day.day}</div>
                <div className="text-[10px] font-black text-slate-800 truncate">{day.format}</div>
              </div>
            ))}
          </div>
          <div className="p-3 bg-slate-900 text-white rounded-lg">
             <h5 className="text-[10px] font-bold text-cyan-400 uppercase mb-1">Sample Caption</h5>
             <p className="text-[10px] text-slate-300 line-clamp-2 italic">&quot;{data.writtenCaptions?.[0]}&quot;</p>
          </div>
        </div>
      );

    case "ads-generator":
      return (
        <div className="space-y-4">
          <div className="p-3 bg-red-50 border border-red-100 rounded-lg border-l-4 border-l-red-500">
             <h5 className="text-[10px] font-bold text-red-700 uppercase mb-1">Scroll-Stopping Hook</h5>
             <p className="text-sm font-bold text-slate-900 leading-tight">&quot;{data.scrollStoppingHook}&quot;</p>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
               <h6 className="text-[10px] font-bold text-slate-400 uppercase mb-1">Headlines</h6>
               <div className="flex flex-wrap gap-1">
                 {data.imageHeadlines?.slice(0, 3).map((h: string, i: number) => (
                   <span key={i} className="text-[8px] bg-slate-100 px-1.5 py-0.5 rounded italic">{h}</span>
                 ))}
               </div>
            </div>
            <div className="flex-1">
               <h6 className="text-[10px] font-bold text-slate-400 uppercase mb-1">Triggers</h6>
               <div className="flex flex-wrap gap-1">
                 {data.emotionalTriggers?.slice(0, 3).map((t: string, i: number) => (
                   <span key={i} className="text-[8px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold">{t}</span>
                 ))}
               </div>
            </div>
          </div>
        </div>
      );

    case "seo-generator":
      return (
        <div className="space-y-4 text-sm">
          <div className="p-3 bg-yellow-50 border border-yellow-100 rounded-lg">
             <h5 className="font-bold text-yellow-900 mb-1">Primary Title</h5>
             <p className="text-xs text-slate-700">{data.titles?.[0]}</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
             <h6 className="font-bold text-[10px] uppercase text-slate-400 mb-2">Outline Summary</h6>
             <h3 className="text-xs font-bold text-slate-800">{data.outline?.h1}</h3>
             <ul className="mt-1 space-y-1">
                {data.outline?.sections?.slice(0, 3).map((s: any, i: number) => (
                   <li key={i} className="text-[10px] text-slate-500 flex items-center gap-1">
                     <span className="w-1 h-1 bg-slate-300 rounded-full"></span> {s.h2}
                   </li>
                ))}
             </ul>
          </div>
        </div>
      );

    default:
      return (
        <pre className="text-[10px] text-slate-600 bg-slate-50 p-3 rounded border overflow-auto max-h-[200px]">
          {JSON.stringify(data, null, 2)}
        </pre>
      );
  }
}
