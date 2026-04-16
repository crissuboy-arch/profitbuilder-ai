"use server";

import { openai, DEFAULT_MODEL, parseOpenAIResponse } from "@/lib/openai";
import { saveGenerationToDatabase } from "@/lib/projects";

// ── Types ──────────────────────────────────────────────────────────────────────

export type CompetitionLevel = "Low" | "Medium" | "High";

export type ProductIdea = {
  productName:          string;
  productType:          string;   // e.g., "Curso Online", "E-book", "Mentoria"
  targetAudience:       string;   // detailed profile
  mainProblemSolved:    string;   // transformation delivered
  priceBRL:             number;
  priceUSD:             number;
  priceEUR:             number;
  competitionLevel:     CompetitionLevel;
  profitPotential:      string;   // e.g., "R$ 5.000 – R$ 30.000/mês"
  recommendedPlatforms: string[]; // ["Hotmart", "Kiwify"]
  recommendedFormat:    string;   // detailed format description
  marketTrend:          string;   // why it's trending NOW
};

export type GenerateProductsParams = {
  niche:          string;
  subniche:       string;
  businessType:   string;
  country:        string;
  language:       string;
  targetAudience: string;
  targetGoal:     string;
};

// ── Generate ───────────────────────────────────────────────────────────────────

export async function generateProducts(
  params: GenerateProductsParams
): Promise<{ success: boolean; data?: ProductIdea[]; error?: string }> {
  try {
    const systemPrompt = `You are a top-tier digital product strategist and market intelligence analyst specializing in the ${params.country} market.

CURRENT MARKET CONTEXT (2025):
- Brazilian infoprodutos market: R$20B+ industry, growing 35%/year, 40M+ active buyers
- Top PT platforms: Hotmart (35M producers), Kiwify (fastest growing), Eduzz, Monetizze
- Top EN platforms: Teachable, Kajabi, Gumroad, Thinkific, Podia, Udemy
- HOT niches 2025: IA/automação, finanças pessoais, relacionamentos, emagrecimento, espiritualidade, concursos públicos, marketing digital, programação no-code
- Rising formats: micro-comunidades, Sprint de 7 dias, Notion templates, prompts IA, planilhas premium
- Brazilian buyer psychology: results-focused, transformation-driven, strong FOMO, trust social proof
- Price anchoring: R$27-97 (e-books), R$197-997 (cursos), R$1.997+ (mentorias/mastermind)

YOUR MISSION: Generate exactly 10 data-driven digital product ideas. Base each idea on real market demand, current trends, and competition analysis for ${params.country}.

ABSOLUTE RULES:
1. ALL text fields (productName, productType, targetAudience, mainProblemSolved, profitPotential, recommendedFormat, marketTrend) MUST be written entirely in ${params.language}. NO language mixing whatsoever.
2. competitionLevel MUST always be exactly: "Low", "Medium", or "High" (always English, for programmatic use)
3. priceBRL, priceUSD, priceEUR must be realistic numeric values (no currency symbols, just the number)
4. recommendedPlatforms must list 2-3 platforms best suited for this product in ${params.country}
5. marketTrend must explain WHY this specific product is in demand RIGHT NOW with concrete evidence

Return ONLY valid JSON:
{
  "ideas": [
    {
      "productName": "Compelling benefit-driven name in ${params.language}",
      "productType": "Product type in ${params.language} (e.g., Curso Online, E-book, Mentoria)",
      "targetAudience": "Detailed demographic + psychographic profile in ${params.language}",
      "mainProblemSolved": "Specific pain + transformation in ${params.language}",
      "priceBRL": 297,
      "priceUSD": 57,
      "priceEUR": 52,
      "competitionLevel": "Low",
      "profitPotential": "Estimated monthly revenue in ${params.language}",
      "recommendedPlatforms": ["Hotmart", "Kiwify"],
      "recommendedFormat": "Detailed delivery format in ${params.language}",
      "marketTrend": "Concrete 2024-2025 trend evidence in ${params.language}"
    }
  ]
}`;

    const userPrompt = `Analyze the ${params.country} digital market and generate 10 high-potential product ideas:

- Niche: ${params.niche}
- Sub-niche: ${params.subniche}
- Business model: ${params.businessType}
- Target audience: ${params.targetAudience}
- Creator's goal: ${params.targetGoal}

Focus on: real market gaps, underserved segments, validated demand signals, and competition white spaces. Each idea must be immediately actionable.`;

    const response = await openai.chat.completions.create({
      model:           DEFAULT_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user",   content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature:     0.75,
      max_tokens:      6000,
    });

    const parsed = parseOpenAIResponse<{ ideas: ProductIdea[] }>(
      response.choices[0].message.content
    );

    return { success: true, data: parsed.ideas };
  } catch (error: any) {
    console.error("generateProducts error:", error);
    return {
      success: false,
      error: error.message || "Failed to generate product ideas.",
    };
  }
}

// ── Save ───────────────────────────────────────────────────────────────────────

export async function saveProductToProject(product: ProductIdea, projectName: string) {
  const name = projectName?.trim() || "Product Blueprints";
  return await saveGenerationToDatabase(
    name,
    "product-miner",
    { concept: product.productName, format: product.productType, competition: product.competitionLevel },
    product
  );
}

export async function saveMultipleProductsToProject(products: ProductIdea[], projectName: string) {
  const name = projectName?.trim() || "Product Blueprints Cluster";
  return await saveGenerationToDatabase(
    name,
    "product-miner",
    { count: products.length, type: "cluster" },
    { ideas: products }
  );
}
