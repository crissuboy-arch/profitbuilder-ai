"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Search, Lightbulb, Package, PenTool, ShoppingCart,
  ArrowRight, CheckCircle2, Rocket, Zap,
} from "lucide-react";

// ── Step data ─────────────────────────────────────────────────────────────────

const STEPS = [
  {
    step: 1,
    phase: "DESCOBRIR",
    emoji: "📊",
    title: "Minerar Produto",
    subtitle: "Encontre oportunidades de alto lucro",
    description:
      "Descubra produtos digitais com alta demanda e baixa concorrência. O agente analisa nichos, tendências e sugere os melhores ângulos para o seu negócio.",
    href: "/dashboard/modules/product-miner",
    cta: "Iniciar Mineração",
    agents: [
      { name: "data-chief",  desc: "Análise de dados e tendências de mercado" },
      { name: "sean-ellis",  desc: "Fit produto-mercado e validação de demanda" },
    ],
    color: {
      accent:  "text-violet-400",
      bg:      "bg-violet-400/10",
      border:  "border-violet-400/20",
      hover:   "hover:border-violet-400/50",
      badge:   "bg-violet-400/15 text-violet-300",
      btn:     "bg-violet-500 hover:bg-violet-600 text-white",
      glow:    "shadow-violet-500/20",
      number:  "bg-violet-500/20 text-violet-300 border border-violet-500/30",
    },
    icon: Search,
  },
  {
    step: 2,
    phase: "DESCOBRIR",
    emoji: "💡",
    title: "Validar Ideia",
    subtitle: "Garanta que o mercado quer comprar",
    description:
      "Antes de criar, valide a ideia com dados reais. O agente avalia viabilidade, potencial de lucro, público-alvo e a melhor oferta irresistível para o produto.",
    href: "/dashboard/modules/idea-validator",
    cta: "Validar Agora",
    agents: [
      { name: "hormozi-offers",   desc: "Estrutura de oferta irresistível ($100M Offers)" },
      { name: "hormozi-advisor",  desc: "Estratégia de precificação e posicionamento" },
    ],
    color: {
      accent:  "text-pink-400",
      bg:      "bg-pink-400/10",
      border:  "border-pink-400/20",
      hover:   "hover:border-pink-400/50",
      badge:   "bg-pink-400/15 text-pink-300",
      btn:     "bg-pink-500 hover:bg-pink-600 text-white",
      glow:    "shadow-pink-500/20",
      number:  "bg-pink-500/20 text-pink-300 border border-pink-500/30",
    },
    icon: Lightbulb,
  },
  {
    step: 3,
    phase: "CRIAR",
    emoji: "🛠",
    title: "Criar Produto",
    subtitle: "Monte o produto digital completo",
    description:
      "Crie um infoproduto completo: estrutura de módulos, e-book, bônus, imagens com IA e tudo que você precisa para ter um produto pronto para vender.",
    href: "/dashboard/modules/product-builder",
    cta: "Criar Produto",
    agents: [
      { name: "copy-master-chief", desc: "Copywriting de alta conversão" },
      { name: "story-chief",       desc: "Narrativa e estrutura de conteúdo" },
    ],
    color: {
      accent:  "text-orange-400",
      bg:      "bg-orange-400/10",
      border:  "border-orange-400/20",
      hover:   "hover:border-orange-400/50",
      badge:   "bg-orange-400/15 text-orange-300",
      btn:     "bg-orange-500 hover:bg-orange-600 text-white",
      glow:    "shadow-orange-500/20",
      number:  "bg-orange-500/20 text-orange-300 border border-orange-500/30",
    },
    icon: Package,
  },
  {
    step: 4,
    phase: "VENDER",
    emoji: "💰",
    title: "Lançar e Vender",
    subtitle: "Página de vendas + checkout que converte",
    description:
      "Gere uma página de vendas persuasiva com copy de Gary Halbert e David Ogilvy, e um checkout otimizado com estratégias de pricing do Hormozi.",
    href: "/dashboard/modules/sales-page-generator",
    cta: "Criar Página de Vendas",
    agents: [
      { name: "gary-halbert",     desc: "Copywriting clássico de resposta direta" },
      { name: "david-ogilvy",     desc: "Posicionamento e headlines que vendem" },
      { name: "hormozi-pricing",  desc: "Precificação e estrutura de oferta" },
    ],
    color: {
      accent:  "text-emerald-400",
      bg:      "bg-emerald-400/10",
      border:  "border-emerald-400/20",
      hover:   "hover:border-emerald-400/50",
      badge:   "bg-emerald-400/15 text-emerald-300",
      btn:     "bg-emerald-500 hover:bg-emerald-600 text-white",
      glow:    "shadow-emerald-500/20",
      number:  "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
    },
    icon: PenTool,
  },
] as const;

// ── Component ─────────────────────────────────────────────────────────────────

export default function CriarProdutoPage() {
  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl p-6 md:p-8 mb-10 glass card-premium">
        <div className="absolute -top-12 -right-12 w-56 h-56 rounded-full bg-[#00d4aa]/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-56 h-56 rounded-full bg-[#7c3aed]/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Rocket className="w-4 h-4 text-[#00d4aa]" />
              <span className="text-xs font-bold text-[#00d4aa] uppercase tracking-widest">
                Fluxo Completo
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Criar Meu Produto Completo
            </h1>
            <p className="text-muted-foreground text-sm mt-2 max-w-lg">
              Do zero à venda em 4 passos guiados. Cada etapa usa agentes IA especializados
              para maximizar suas chances de sucesso no mercado digital.
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              {["Infoprodutos", "E-books", "Cursos", "Mentorias"].map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <Link
            href="/dashboard/modules/product-miner"
            className="btn-cta inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold shrink-0 shadow-lg shadow-[#00d4aa]/20 whitespace-nowrap"
          >
            <Zap className="w-4 h-4" />
            Começar do Zero
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* ── Pipeline connector (desktop only) ────────────────────────────── */}
      <div className="hidden md:flex items-center justify-between mb-6 px-4">
        {STEPS.map((step, i) => (
          <div key={step.step} className="flex items-center flex-1">
            <div className={cn(
              "flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold shrink-0",
              step.color.number
            )}>
              {step.step}
            </div>
            {i < STEPS.length - 1 && (
              <div className="flex-1 mx-2 flex items-center gap-1">
                <div className="flex-1 h-px bg-border/50" />
                <ArrowRight className="w-3 h-3 text-muted-foreground/40 shrink-0" />
                <div className="flex-1 h-px bg-border/50" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Step cards ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {STEPS.map((step) => (
          <div
            key={step.step}
            className={cn(
              "glass card-premium rounded-2xl p-5 border transition-all duration-200 flex flex-col",
              "hover:shadow-xl hover:-translate-y-0.5",
              step.color.border,
              step.color.hover
            )}
          >
            {/* Step header */}
            <div className="flex items-start justify-between mb-4">
              <div className={cn("p-2.5 rounded-xl", step.color.bg)}>
                <step.icon className={cn("w-5 h-5", step.color.accent)} />
              </div>
              <div className="text-right">
                <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", step.color.badge)}>
                  {step.emoji} {step.phase}
                </span>
              </div>
            </div>

            {/* Step number + title */}
            <div className="mb-3">
              <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest mb-1">
                Passo {step.step}
              </p>
              <h3 className={cn("text-base font-bold", step.color.accent)}>
                {step.title}
              </h3>
              <p className="text-xs text-muted-foreground font-medium mt-0.5">
                {step.subtitle}
              </p>
            </div>

            {/* Description */}
            <p className="text-xs text-muted-foreground leading-relaxed mb-4 flex-1">
              {step.description}
            </p>

            {/* Agents */}
            <div className="mb-4 space-y-1.5">
              <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-wider">
                Agentes
              </p>
              {step.agents.map((agent) => (
                <div key={agent.name} className="flex items-start gap-2">
                  <CheckCircle2 className={cn("w-3 h-3 shrink-0 mt-0.5", step.color.accent)} />
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono font-bold text-foreground/70">
                      {agent.name}
                    </span>
                    <p className="text-[10px] text-muted-foreground/50 leading-tight">
                      {agent.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <Link
              href={step.href}
              className={cn(
                "w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all",
                step.color.btn,
                `shadow-md ${step.color.glow}`
              )}
            >
              {step.cta}
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ))}
      </div>

      {/* ── Bottom extras ─────────────────────────────────────────────────── */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            icon: Package,
            color: "text-indigo-400",
            bg: "bg-indigo-400/10",
            title: "Gerador de Livros",
            desc: "Crie e-books completos com DALL-E + PDF profissional",
            href: "/dashboard/modules/book-generator",
          },
          {
            icon: ShoppingCart,
            color: "text-green-400",
            bg: "bg-green-400/10",
            title: "Checkout Otimizado",
            desc: "Configure checkouts que aumentam a conversão",
            href: "/dashboard/modules/checkout-generator",
          },
          {
            icon: Zap,
            color: "text-teal-400",
            bg: "bg-teal-400/10",
            title: "Marketing Machine",
            desc: "Gere todos os assets de marketing automaticamente",
            href: "/dashboard/modules/marketing-machine",
          },
        ].map((extra) => (
          <Link
            key={extra.href}
            href={extra.href}
            className="group glass card-premium rounded-xl p-4 border border-border/50 hover:border-border transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 flex items-center gap-3"
          >
            <div className={cn("p-2 rounded-lg shrink-0", extra.bg)}>
              <extra.icon className={cn("w-5 h-5", extra.color)} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">{extra.title}</p>
              <p className="text-xs text-muted-foreground leading-tight mt-0.5">{extra.desc}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-[#00d4aa] transition-colors shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}
