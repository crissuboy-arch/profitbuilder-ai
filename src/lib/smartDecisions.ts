// Smart Decision System - Auto-select frameworks, architectures, and visual styles based on product + niche

import { NICHE_VISUAL_STYLES } from "./designSystem";

// Product types
export type ProductType = 
  | "digital_product" 
  | "physical_product" 
  | "service" 
  | "course" 
  | "membership"
  | "ebook"
  | "software"
  | "coaching";

// Price range
export type PriceRange = 
  | "free" 
  | "low"      // $0-50
  | "medium"   // $50-200
  | "high"     // $200-500
  | "premium"; // $500+

// Funnel stage
export type FunnelStage = 
  | "awareness"    // Top of funnel - cold traffic
  | "interest"     // Middle - warm traffic
  | "decision"     // Bottom - hot traffic
  | "retention";   // Post-purchase

export interface ProductContext {
  productName: string;
  productType: ProductType;
  niche: string;
  price: number;
  priceRange: PriceRange;
  targetAudience: string;
  mainPainPoint: string;
  mainPromise: string;
  mechanism?: string;  // How the product works
}

export interface FrameworkRecommendation {
  frameworkId: string;
  frameworkName: string;
  reason: string;
  priority: number;  // 1 = highest
  expectedPerformance: "high" | "medium" | "low";
}

export interface ArchitectureRecommendation {
  architectureId: string;
  architectureName: string;
  reason: string;
  priority: number;
  funnelStage: FunnelStage;
}

export interface VisualStyleRecommendation {
  style: keyof typeof NICHE_VISUAL_STYLES;
  description: string;
  prompt: string;
  composition: string[];
}

// Framework performance data (learned from analytics patterns)
const FRAMEWORK_PERFORMANCE: Record<string, { niche: string[]; priceRange: PriceRange[]; funnelStage: FunnelStage[]; score: number }> = {
  pas: {
    niche: ["fitness", "health", "weight_loss", "business", "finance"],
    priceRange: ["medium", "high"],
    funnelStage: ["interest", "decision"],
    score: 9.2,
  },
  aida: {
    niche: ["business", "marketing", "digital_product", "software"],
    priceRange: ["low", "medium"],
    funnelStage: ["awareness", "interest"],
    score: 8.5,
  },
  story: {
    niche: ["fitness", "transformation", "lifestyle", "emotional"],
    priceRange: ["medium", "high", "premium"],
    funnelStage: ["awareness", "interest"],
    score: 8.8,
  },
  authority: {
    niche: ["business", "finance", "coaching", "software"],
    priceRange: ["high", "premium"],
    funnelStage: ["awareness", "interest"],
    score: 8.3,
  },
  hook_story_offer: {
    niche: ["fitness", "business", "marketing", "digital_product"],
    priceRange: ["medium", "high"],
    funnelStage: ["awareness", "interest", "decision"],
    score: 9.0,
  },
  curiosity_gap: {
    niche: ["business", "marketing", "digital_product", "software"],
    priceRange: ["low", "medium"],
    funnelStage: ["awareness"],
    score: 8.7,
  },
  mini_aula: {
    niche: ["education", "course", "coaching"],
    priceRange: ["medium", "high"],
    funnelStage: ["awareness", "interest"],
    score: 8.4,
  },
  confronto: {
    niche: ["fitness", "business", "transformation"],
    priceRange: ["medium", "high"],
    funnelStage: ["interest", "decision"],
    score: 8.6,
  },
  segredo_aberto: {
    niche: ["business", "marketing", "digital_product"],
    priceRange: ["low", "medium"],
    funnelStage: ["awareness"],
    score: 8.9,
  },
  three_erros: {
    niche: ["business", "finance", "health", "fitness"],
    priceRange: ["medium", "high"],
    funnelStage: ["awareness", "interest"],
    score: 8.2,
  },
  ugc_conexao: {
    niche: ["fitness", "lifestyle", "transformation", "health"],
    priceRange: ["low", "medium"],
    funnelStage: ["interest", "decision"],
    score: 8.8,
  },
  sinceridade: {
    niche: ["health", "fitness", "personal_development"],
    priceRange: ["medium"],
    funnelStage: ["interest"],
    score: 8.1,
  },
};

// Visual framework recommendations
const VISUAL_FRAMEWORKS = {
  stack: { bestFor: ["benefits", "features", "steps"], niches: ["business", "digital_product", "software"] },
  us_vs_them: { bestFor: ["comparison", "transformation"], niches: ["fitness", "health", "transformation"] },
  native_notes: { bestFor: ["personal", "emotional"], niches: ["lifestyle", "personal_development"] },
  notification: { bestFor: ["urgency", "alert"], niches: ["business", "marketing"] },
  news_advertorial: { bestFor: ["authority", "education"], niches: ["business", "finance", "education"] },
  warning_sign: { bestFor: ["problem_agitation", "warning"], niches: ["health", "fitness", "finance"] },
  testimonial_quote: { bestFor: ["social_proof"], niches: ["all"] },
  countdown_timer: { bestFor: ["urgency", "offer"], niches: ["all"] },
  native_feed_post: { bestFor: ["social_proof", "ugc"], niches: ["fitness", "lifestyle"] },
  checklist_manual: { bestFor: ["steps", "process"], niches: ["business", "education"] },
};

// Determine price range from price
function getPriceRange(price: number): PriceRange {
  if (price === 0) return "free";
  if (price <= 50) return "low";
  if (price <= 200) return "medium";
  if (price <= 500) return "high";
  return "premium";
}

// Determine funnel stage based on product and audience
function determineFunnelStage(context: ProductContext): FunnelStage {
  // If audience is cold (new to product), start at awareness
  const audienceLower = context.targetAudience.toLowerCase();
  
  if (audienceLower.includes("new") || audienceLower.includes("beginner") || audienceLower.includes("starting")) {
    return "awareness";
  }
  
  // If price is high, need more awareness/interest
  if (context.priceRange === "premium" || context.priceRange === "high") {
    return "awareness";
  }
  
  // If audience is warm/hot
  if (audienceLower.includes("ready") || audienceLower.includes("looking") || audienceLower.includes("interested")) {
    return "decision";
  }
  
  return "interest";
}

// Main function to get all recommendations
export function getSmartRecommendations(context: ProductContext): {
  frameworks: FrameworkRecommendation[];
  architectures: ArchitectureRecommendation[];
  visualStyle: VisualStyleRecommendation;
  funnelStage: FunnelStage;
} {
  const priceRange = getPriceRange(context.price);
  const funnelStage = determineFunnelStage(context);
  
  // Get framework recommendations
  const frameworks = getFrameworkRecommendations(context, priceRange, funnelStage);
  
  // Get architecture recommendations
  const architectures = getArchitectureRecommendations(context, priceRange, funnelStage);
  
  // Get visual style recommendation
  const visualStyle = getVisualStyleRecommendation(context);
  
  return {
    frameworks,
    architectures,
    visualStyle,
    funnelStage,
  };
}

function getFrameworkRecommendations(
  context: ProductContext,
  priceRange: PriceRange,
  funnelStage: FunnelStage
): FrameworkRecommendation[] {
  const recommendations: FrameworkRecommendation[] = [];
  
  // Score each framework based on fit
  const frameworkEntries = Object.entries(FRAMEWORK_PERFORMANCE);
  
  for (const [frameworkId, data] of frameworkEntries) {
    let score = data.score;
    
    // Bonus for niche match
    const nicheMatch = data.niche.some(n => context.niche.toLowerCase().includes(n));
    if (nicheMatch) score += 1.5;
    
    // Bonus for price range match
    if (data.priceRange.includes(priceRange)) score += 1;
    
    // Bonus for funnel stage match
    if (data.funnelStage.includes(funnelStage)) score += 1;
    
    // Context-based adjustments
    if (context.productType === "course" && (frameworkId === "mini_aula" || frameworkId === "authority")) {
      score += 2;
    }
    if (context.productType === "software" && (frameworkId === "aida" || frameworkId === "curiosity_gap")) {
      score += 2;
    }
    if (context.niche.toLowerCase().includes("fitness") && (frameworkId === "story" || frameworkId === "confronto")) {
      score += 2;
    }
    
    recommendations.push({
      frameworkId,
      frameworkName: getFrameworkName(frameworkId),
      reason: getFrameworkReason(frameworkId, context),
      priority: 0,
      expectedPerformance: score >= 9 ? "high" : score >= 8 ? "medium" : "low",
    });
  }
  
  // Sort by score and assign priority
  recommendations.sort((a, b) => (b.expectedPerformance === "high" ? 1 : 0) - (a.expectedPerformance === "high" ? 1 : 0));
  
  return recommendations.slice(0, 5).map((r, i) => ({ ...r, priority: i + 1 }));
}

function getArchitectureRecommendations(
  context: ProductContext,
  priceRange: PriceRange,
  funnelStage: FunnelStage
): ArchitectureRecommendation[] {
  const recommendations: ArchitectureRecommendation[] = [];
  
  // Define architecture recommendations based on context
  const architectureRules = [
    {
      id: "aggressive",
      name: "Aggressive 🔥",
      condition: funnelStage === "decision" && (priceRange === "medium" || priceRange === "high"),
      reason: "High-intent audience ready to buy - aggressive close works well",
      stage: "decision" as FunnelStage,
    },
    {
      id: "storytelling",
      name: "Storytelling 📖",
      condition: funnelStage === "awareness" && context.niche.toLowerCase().includes("fitness"),
      reason: "Transformation story resonates with fitness audience",
      stage: "awareness" as FunnelStage,
    },
    {
      id: "pas",
      name: "Problem-Agitate-Solution",
      condition: funnelStage === "interest" && context.mainPainPoint.length > 20,
      reason: "Clear pain point to agitate - PAS is effective",
      stage: "interest" as FunnelStage,
    },
    {
      id: "authority",
      name: "Authority 🏆",
      condition: priceRange === "premium" || priceRange === "high",
      reason: "Premium pricing requires authority building first",
      stage: "awareness" as FunnelStage,
    },
    {
      id: "mini_aula",
      name: "Mini Aula 🎓",
      condition: context.productType === "ebook" || context.productType === "coaching",
      reason: "Educational products work well with teaching approach",
      stage: "awareness" as FunnelStage,
    },
    {
      id: "confronto",
      name: "Confronto ⚔️",
      condition: context.niche.toLowerCase().includes("fitness") || context.niche.toLowerCase().includes("transformation"),
      reason: "Confrontational approach drives fitness audience",
      stage: "interest" as FunnelStage,
    },
    {
      id: "segredo_aberto",
      name: "Segredo Aberto 🔐",
      condition: funnelStage === "awareness" && context.priceRange === "low",
      reason: "Curiosity hook works for low-ticket awareness",
      stage: "awareness" as FunnelStage,
    },
    {
      id: "aida_viral",
      name: "AIDA Viral 🚀",
      condition: context.productType === "digital_product" || context.productType === "software",
      reason: "Viral potential for digital products",
      stage: "awareness" as FunnelStage,
    },
    {
      id: "ugc_conexao",
      name: "UGC Conexão 👤",
      condition: context.niche.toLowerCase().includes("fitness") || context.niche.toLowerCase().includes("lifestyle"),
      reason: "UGC style resonates with lifestyle products",
      stage: "interest" as FunnelStage,
    },
  ];
  
  // Filter and sort by priority
  const matched = architectureRules.filter(r => r.condition);
  
  // If no matches, add default recommendations
  if (matched.length === 0) {
    recommendations.push({
      architectureId: "pas",
      architectureName: "Problem-Agitate-Solution",
      reason: "Universal effectiveness for most products",
      priority: 1,
      funnelStage: "interest",
    });
    recommendations.push({
      architectureId: "aida",
      architectureName: "AIDA Model",
      reason: "Classic framework works for any product",
      priority: 2,
      funnelStage: "awareness",
    });
  } else {
    matched.forEach((r, i) => {
      recommendations.push({
        architectureId: r.id,
        architectureName: r.name,
        reason: r.reason,
        priority: i + 1,
        funnelStage: r.stage,
      });
    });
  }
  
  return recommendations.slice(0, 4);
}

function getVisualStyleRecommendation(context: ProductContext): VisualStyleRecommendation {
  const nicheLower = context.niche.toLowerCase();
  
  // Map niche to visual style
  if (nicheLower.includes("fitness") || nicheLower.includes("gym") || nicheLower.includes("transform")) {
    return {
      style: "fitness",
      ...NICHE_VISUAL_STYLES.fitness,
    };
  }
  if (nicheLower.includes("business") || nicheLower.includes("saas") || nicheLower.includes("entrepreneur")) {
    return {
      style: "business",
      ...NICHE_VISUAL_STYLES.business,
    };
  }
  if (nicheLower.includes("love") || nicheLower.includes("relationship") || nicheLower.includes("dating")) {
    return {
      style: "emotional",
      ...NICHE_VISUAL_STYLES.emotional,
    };
  }
  if (nicheLower.includes("digital") || nicheLower.includes("course") || nicheLower.includes("software")) {
    return {
      style: "digital_product",
      ...NICHE_VISUAL_STYLES.digital_product,
    };
  }
  if (nicheLower.includes("health") || nicheLower.includes("wellness") || nicheLower.includes("diet")) {
    return {
      style: "health",
      ...NICHE_VISUAL_STYLES.health,
    };
  }
  if (nicheLower.includes("learn") || nicheLower.includes("education") || nicheLower.includes("study")) {
    return {
      style: "education",
      ...NICHE_VISUAL_STYLES.education,
    };
  }
  if (nicheLower.includes("finance") || nicheLower.includes("invest") || nicheLower.includes("money")) {
    return {
      style: "finance",
      ...NICHE_VISUAL_STYLES.finance,
    };
  }
  
  return {
    style: "default",
    ...NICHE_VISUAL_STYLES.default,
  };
}

function getFrameworkName(id: string): string {
  const names: Record<string, string> = {
    pas: "Problem-Agitate-Solution",
    aida: "AIDA Model",
    story: "Storytelling",
    authority: "Authority",
    hook_story_offer: "Hook-Story-Offer",
    curiosity_gap: "Curiosity Gap",
    mini_aula: "Mini Aula",
    confronto: "Confronto",
    segredo_aberto: "Segredo Aberto",
    three_erros: "3 Erros",
    ugc_conexao: "UGC Conexão",
    sinceridade: "Sinceridade",
  };
  return names[id] || id;
}

function getFrameworkReason(id: string, context: ProductContext): string {
  const reasons: Record<string, string> = {
    pas: `PAS is effective for ${context.niche} products - addresses pain points directly`,
    aida: "AIDA provides clear funnel progression - works for cold to warm audiences",
    story: "Storytelling creates emotional connection - powerful for transformation products",
    authority: "Authority builds trust for premium offerings - essential for high-ticket",
    hook_story_offer: "HSO is versatile - works across funnel stages and niches",
    curiosity_gap: "Curiosity Gap creates intrigue - effective for cold traffic",
    mini_aula: "Mini Aula establishes expertise - perfect for educational products",
    confronto: "Confronto creates urgency - drives action for motivated audiences",
    segredo_aberto: "Segredo Aberto leverages curiosity - great for low-ticket awareness",
    three_erros: "3 Erros highlights mistakes - positions solution as essential",
    ugc_conexao: "UGC style feels authentic - resonates with modern consumers",
    sinceridade: "Sinceridade builds trust - effective for health and personal development",
  };
  return reasons[id] || "Recommended based on performance data";
}

// Helper to get default product context
export function createDefaultContext(productName: string): ProductContext {
  return {
    productName,
    productType: "digital_product",
    niche: "business",
    price: 97,
    priceRange: "medium",
    targetAudience: "entrepreneur",
    mainPainPoint: "wants to grow their business",
    mainPromise: "scale their business",
  };
}