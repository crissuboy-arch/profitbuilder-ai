"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Radar, ArrowRight, Search, Layers, FileText } from "lucide-react";

const steps = [
  {
    icon: Search,
    label: "Product Miner",
    description: "Descubra produtos com alta demanda no seu nicho.",
    href: "/dashboard/modules/product-miner",
    color: "text-violet-500",
    bg: "bg-violet-500/10",
  },
  {
    icon: Layers,
    label: "Product Builder",
    description: "Estruture o produto completo com módulos, bônus e preço.",
    href: "/dashboard/modules/product-builder",
    color: "text-emerald-600",
    bg: "bg-emerald-600/10",
  },
  {
    icon: FileText,
    label: "Sales Page Generator",
    description: "Gere a página de vendas com copy de alta conversão.",
    href: "/dashboard/modules/sales-page-generator",
    color: "text-rose-600",
    bg: "bg-rose-600/10",
  },
];

export default function ProductRadarPage() {
  const router = useRouter();

  return (
    <div className="p-8 max-w-4xl mx-auto font-[family-name:var(--font-geist-sans)]">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-violet-500/10 rounded-xl">
          <Radar className="w-8 h-8 text-violet-500" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Radar de Produtos</h1>
          <p className="text-muted-foreground">
            Siga o fluxo completo: do produto à página de vendas com IA.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map((step, i) => (
          <Card
            key={step.href}
            onClick={() => router.push(step.href)}
            className="cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-200 border-slate-200"
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg ${step.bg}`}>
                  <step.icon className={`w-6 h-6 ${step.color}`} />
                </div>
                <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  Passo {i + 1}
                </span>
              </div>
              <CardTitle className="text-lg">{step.label}</CardTitle>
              <CardDescription>{step.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" className={`w-full justify-between ${step.color} hover:bg-slate-50`}>
                Acessar
                <ArrowRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
