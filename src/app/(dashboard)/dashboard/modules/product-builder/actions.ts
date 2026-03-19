"use server";

import { openai, DEFAULT_MODEL, parseOpenAIResponse } from "@/lib/openai";
import { saveGenerationToDatabase } from "@/lib/projects";

export type ProductStructureResult = {
  concept: string;
  offerStructure: string;
  modules: string[];
  bonuses: string[];
  pricingStrategy: string;
  uniqueSellingMechanism: string;
  deliveryFormat: string;
};

export type BuildProductParams = {
  idea: string;
  targetAudience: string;
  priceRange: string;
  businessModel: string;
  country: string;
  language: string;
};

export async function buildProduct(
  params: BuildProductParams
): Promise<{ success: boolean; data?: ProductStructureResult; error?: string }> {
  try {
    const systemPrompt = `You are a world-class digital product architect. 
Your goal is to build out a structured blueprint for a highly profitable product based on the user's idea and constraints.

You MUST format your response as a valid JSON object matching this exact schema:
{
  "concept": "A 1-2 sentence compelling summary of the core transformation.",
  "offerStructure": "A breakdown of the core offer (e.g. Course + Coaching + Software).",
  "modules": ["Module 1: Title", "Module 2: Title", "Module 3: Title", ...],
  "bonuses": ["Bonus 1: Title", "Bonus 2: Title", ...],
  "pricingStrategy": "A strategic recommendation on how to price this, e.g. Single Pay vs Splits.",
  "uniqueSellingMechanism": "A branded, unique name for the method or framework used.",
  "deliveryFormat": "How the user will consume it (e.g. Kajabi Member Area, Notion Dashboard, etc)."
}

CRITICAL RULES:
1. Language: All text MUST be returned natively in ${params.language}. Never mix languages.
2. Context: Tailor the pricing, cultural fit, examples, and tone to the market in ${params.country}.
3. Only return the JSON object. No other text.`;

    const userPrompt = `Please structure a product based on these constraints:
- Idea: ${params.idea}
- Target Audience: ${params.targetAudience}
- Expected Price Range: ${params.priceRange}
- Business Model / Delivery Type: ${params.businessModel}`;

    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const parsed = parseOpenAIResponse<ProductStructureResult>(response.choices[0].message.content);

    return {
      success: true,
      data: parsed,
    };
  } catch (error: any) {
    console.error("Error structuring product:", error);
    return {
      success: false,
      error: "An unexpected error occurred while structuring the product.",
    };
  }
}

export async function saveStructureToProject(result: ProductStructureResult, projectName: string) {
  const name = projectName && projectName.trim() ? projectName : "Product Blueprints";
  return await saveGenerationToDatabase(
    name,
    "product-builder",
    { blueprintConcept: result.concept.substring(0, 50) },
    result
  );
}
