export type AdScore = {
  hookScore: number;
  clarityScore: number;
  emotionScore: number;
  conversionScore: number;
  finalScore: number;
};

export type NicheProfile = {
  tone: "aggressive" | "empathetic" | "luxury" | "casual" | "professional" | "urgent";
  vocabulary: string[];
  painPoints: string[];
  promises: string[];
  emotionalTriggers: string[];
  urgencyLevel: "low" | "medium" | "high";
  socialProofStyle: "testimonials" | "numbers" | "authority" | "community";
};

export const NICHE_PROFILES: Record<string, NicheProfile> = {
  saude: {
    tone: "empathetic",
    vocabulary: ["transformar", "saúde", "bem-estar", "vitalidade", "cuidar", "equilíbrio", "qualidade de vida"],
    painPoints: ["dor crônica", "baixa energia", "estresse", "ansiedade", "peso excessivo", "noites mal dormidas"],
    promises: ["mais energia", "vida mais saudável", "corpo em forma", "mente clara", "sono restaurador"],
    emotionalTriggers: ["medo de doença", "desejo de viver mais", "autocuidado", "liberdade"],
    urgencyLevel: "medium",
    socialProofStyle: "testimonials"
  },
  emagrecimento: {
    tone: "urgent",
    vocabulary: ["emagrecer", "perder peso", "queimar gordura", "corpo magro", "silhueta", "medida", "balança"],
    painPoints: ["quilos extras", "roupas apertadas", "depoimentos ruins", "falta de resultados", "efeito sanfona"],
    promises: ["perder X kg", "entrar na roupa antiga", "corpo definido", "autoestima de volta"],
    emotionalTriggers: ["orgulho", "confiança", "atração", "saúde", "liberdade alimentar"],
    urgencyLevel: "high",
    socialProofStyle: "testimonials"
  },
  cabelos: {
    tone: "empathetic",
    vocabulary: ["cabelos", "queda", "calvície", "fortalecer", "crescimento", "brilho", "volume"],
    painPoints: ["cabelo caindo", "fios quebradiços", "cabeça careca", "autoestima baixa"],
    promises: ["cabelos fortes", "crescimento acelerado", "volume e brilho", "fim da queda"],
    emotionalTriggers: ["beleza", "juventude", "confiança", "atrair olhares"],
    urgencyLevel: "medium",
    socialProofStyle: "testimonials"
  },
  financas: {
    tone: "aggressive",
    vocabulary: ["dinheiro", "renda", "investimento", "rico", "fortuna", "independência", "multiplicar"],
    painPoints: ["dívidas", "salário curto", "falta de dinheiro", "trabalho que não rende", "inveja financeira"],
    promises: ["renda extra", "independência financeira", "dinheiro trabalhando", "mulher/bombeiro milionário"],
    emotionalTriggers: ["ganância", "medo de perder", "status", "liberdade", "orgulho"],
    urgencyLevel: "high",
    socialProofStyle: "numbers"
  },
  negocios: {
    tone: "professional",
    vocabulary: ["negócio", "empresa", "vendas", "cliente", "faturamento", "escala", "marketing"],
    painPoints: ["baixo faturamento", "poucos clientes", "concorrência", "trabalho exaustivo", "vendas oscilando"],
    promises: ["faturamento crescendo", "clientes qualificados", "processos automatizados", "negócio escalável"],
    emotionalTriggers: ["poder", "sucesso", "reconhecimento", "legado"],
    urgencyLevel: "medium",
    socialProofStyle: "numbers"
  },
  marketing: {
    tone: "aggressive",
    vocabulary: ["marketing", "tráfego", "conversão", "vendas", "funil", "copy", "estratégia"],
    painPoints: ["sem resultados", "tráfego pago caro", "baixa conversão", "vender na internet é difícil"],
    promises: ["resultados em 30 dias", "funil que vende", "tráfego qualificado", "vendas automáticas"],
    emotionalTriggers: ["ganância", "medo de ficar para trás", "status de expert", "reconhecimento"],
    urgencyLevel: "high",
    socialProofStyle: "authority"
  },
  Relacionamentos: {
    tone: "empathetic",
    vocabulary: ["relacionamento", "amor", "parceiro", "casal", "conexão", "intimidade", "felicidade"],
    painPoints: ["solidão", "relações frustradas", "medo de abandono", "incompatibilidade", "falta de intimidade"],
    promises: ["encontrar o par ideal", "relacionamento saudável", "amor de verdade", "conexão profunda"],
    emotionalTriggers: ["amor", "pertencimento", "aceitação", "paixão"],
    urgencyLevel: "low",
    socialProofStyle: "testimonials"
  },
  default: {
    tone: "empathetic",
    vocabulary: ["transformar", "resultado", "conseguir", "alcançar", "conquistar", "realizar"],
    painPoints: ["dificuldade", "falta de tempo", "resultados insatisfatórios", "desmotivação"],
    promises: ["resultados rápidos", "transformação", "conquista", "realização"],
    emotionalTriggers: ["esperança", "medo de perder", "orgulho", "liberdade"],
    urgencyLevel: "medium",
    socialProofStyle: "testimonials"
  }
};

function detectNiche(niche: string): string {
  const nicheLower = niche.toLowerCase();
  
  if (nicheLower.includes("saúde") || nicheLower.includes("saude") || nicheLower.includes("bem-estar")) {
    return "saude";
  }
  if (nicheLower.includes("emagre") || nicheLower.includes("perder peso") || nicheLower.includes("dieta")) {
    return "emagrecimento";
  }
  if (nicheLower.includes("cabelo") || nicheLower.includes("queda")) {
    return "cabelos";
  }
  if (nicheLower.includes("financ") || nicheLower.includes("dinheiro") || nicheLower.includes("invest")) {
    return "financas";
  }
  if (nicheLower.includes("negóci") || nicheLower.includes("business") || nicheLower.includes("empresa")) {
    return "negocios";
  }
  if (nicheLower.includes("marketing") || nicheLower.includes("tráfego") || nicheLower.includes("vendas online")) {
    return "marketing";
  }
  if (nicheLower.includes("relacion") || nicheLower.includes("amor") || nicheLower.includes("parceiro")) {
    return "Relacionamentos";
  }
  
  return "default";
}

export function getNicheProfile(niche: string): NicheProfile {
  const detected = detectNiche(niche);
  return NICHE_PROFILES[detected] || NICHE_PROFILES.default;
}

export function scoreCreative(
  headline: string,
  body: string,
  cta: string,
  frameworkId: string
): AdScore {
  const hookScore = calculateHookScore(headline);
  const clarityScore = calculateClarityScore(headline, body);
  const emotionScore = calculateEmotionScore(body, frameworkId);
  const conversionScore = calculateConversionScore(headline, body, cta);
  
  const finalScore = Math.round(
    (hookScore * 0.3) +
    (clarityScore * 0.2) +
    (emotionScore * 0.25) +
    (conversionScore * 0.25)
  );

  return {
    hookScore,
    clarityScore,
    emotionScore,
    conversionScore,
    finalScore
  };
}

function calculateHookScore(headline: string): number {
  let score = 50;
  const hl = headline.toLowerCase();
  
  const strongStarters = ["descubra", "pare de", "pare de fazer", "você sabe", "e se", "o segredo", "a verdade", "nunca", "comprovado", "resultados"];
  for (const starter of strongStarters) {
    if (hl.startsWith(starter) || hl.includes(starter)) {
      score += 10;
    }
  }
  
  const urgencyWords = ["agora", "hoje", "não espere", "tempo limitado", "última chance", "urgente", "descartado", "eliminado"];
  for (const word of urgencyWords) {
    if (hl.includes(word)) {
      score += 8;
    }
  }
  
  const numberWords = ["1", "2", "3", "30 dias", "7 dias", "x kg", "%", "reais"];
  for (const num of numberWords) {
    if (hl.includes(num)) {
      score += 5;
    }
  }
  
  const questions = hl.includes("?") || hl.includes("você");
  if (questions) {
    score += 7;
  }
  
  if (headline.length > 10 && headline.length < 70) {
    score += 5;
  }
  
  return Math.min(100, score);
}

function calculateClarityScore(headline: string, body: string): number {
  let score = 50;
  const hl = headline.toLowerCase();
  const b = body.toLowerCase();
  
  const clearWords = ["conseguir", "ter", "fazer", "usar", "aprender", "descobrir", "perder", "ganhar", "tornar"];
  for (const word of clearWords) {
    if (hl.includes(word) || b.includes(word)) {
      score += 5;
    }
  }
  
  const activeVerbs = ["transforme", "conquiste", "alcance", "conseguir", "obtenha", "libere"];
  for (const verb of activeVerbs) {
    if (hl.includes(verb)) {
      score += 6;
    }
  }
  
  const jargons = ["paradigma", "ecossistema", "sinergia", "holístico", "quantum"];
  for (const jargon of jargons) {
    if (hl.includes(jargon) || b.includes(jargon)) {
      score -= 8;
    }
  }
  
  if (body.length > 50 && body.length < 500) {
    score += 8;
  }
  
  const paragraphs = body.split("\n").filter(p => p.trim().length > 10);
  if (paragraphs.length >= 2) {
    score += 5;
  }
  
  return Math.max(0, Math.min(100, score));
}

function calculateEmotionScore(body: string, frameworkId: string): number {
  let score = 50;
  const b = body.toLowerCase();
  
  const fearPhrases = ["perder", "risco", "erro", "falha", "cuidado", "atenção", "perigo"];
  for (const phrase of fearPhrases) {
    if (b.includes(phrase)) {
      score += 6;
    }
  }
  
  const hopePhrases = ["conseguir", "transformar", "alcançar", "realizar", "viver", "sentir"];
  for (const phrase of hopePhrases) {
    if (b.includes(phrase)) {
      score += 5;
    }
  }
  
  const urgencyPhrases = ["agora", "hoje", "não deixe", "comece", "não espere"];
  for (const phrase of urgencyPhrases) {
    if (b.includes(phrase)) {
      score += 4;
    }
  }
  
  const emotionalStory = b.includes("eu") || b.includes("minha") || b.includes("como eu");
  if (emotionalStory) {
    score += 8;
  }
  
  const emoji = b.includes("😀") || b.includes("✅") || b.includes("💰") || b.includes("🔥");
  if (emoji) {
    score += 3;
  }
  
  const painFramework = frameworkId.includes("dor") || frameworkId.includes("pain") || frameworkId.includes("problema");
  if (painFramework) {
    score += 7;
  }
  
  const testimonials = b.includes('"') && b.includes("—");
  if (testimonials) {
    score += 6;
  }
  
  return Math.min(100, score);
}

function calculateConversionScore(headline: string, body: string, cta: string): number {
  let score = 50;
  const hl = headline.toLowerCase();
  const b = body.toLowerCase();
  const c = cta.toLowerCase();
  
  const strongCTAs = ["garantir", "começar", "agora", "hoje", "resultado", "acesso", "meu"];
  for (const word of strongCTAs) {
    if (c.includes(word)) {
      score += 6;
    }
  }
  
  const ctaWithAction = c.includes("clique") || c.includes("botão") || c.includes(">>") || c.includes("→");
  if (ctaWithAction) {
    score += 5;
  }
  
  const benefitWords = ["ganhar", "perder", "conseguir", "economizar", "resolver"];
  let benefitCount = 0;
  for (const word of benefitWords) {
    if (hl.includes(word) || b.includes(word)) {
      benefitCount++;
    }
  }
  score += benefitCount * 4;
  
  const price = b.includes("r$") || b.includes("$") || b.includes("reais") || b.includes("por");
  if (price) {
    score += 5;
  }
  
  const guarantee = b.includes("garantia") || b.includes("devolvemos") || b.includes("risco zero");
  if (guarantee) {
    score += 8;
  }
  
  const urgency = b.includes("tempo") || b.includes("vagas") || b.includes("limite") || b.includes("última");
  if (urgency) {
    score += 6;
  }
  
  return Math.min(100, score);
}

export function rankCreatives<T extends { score?: AdScore }>(creatives: T[]): T[] {
  return [...creatives].sort((a, b) => {
    const scoreA = a.score?.finalScore ?? 0;
    const scoreB = b.score?.finalScore ?? 0;
    return scoreB - scoreA;
  });
}

export function getScoreBadge(score: number): { label: string; color: string; bgColor: string } {
  if (score >= 85) {
    return { label: "EXCELENTE", color: "text-emerald-700", bgColor: "bg-emerald-100" };
  }
  if (score >= 70) {
    return { label: "BOM", color: "text-blue-700", bgColor: "bg-blue-100" };
  }
  if (score >= 55) {
    return { label: "MÉDIO", color: "text-amber-700", bgColor: "bg-amber-100" };
  }
  return { label: "BAIXO", color: "text-red-700", bgColor: "bg-red-100" };
}
