"use server";

import { openai, DEFAULT_MODEL, parseOpenAIResponse } from "@/lib/openai";
import { saveGenerationToDatabase } from "@/lib/projects";

export type ProductIdea = {
  productName: string;
  targetAudience: string;
  mainProblemSolved: string;
  priceRange: string;
  recommendedFormat: string;
};

export type GenerateProductsParams = {
  niche: string;
  subniche: string;
  businessType: string;
  country: string;
  language: string;
  targetAudience: string;
  targetGoal: string;
};

export async function generateProducts(
  params: GenerateProductsParams
): Promise<{ success: boolean; data?: ProductIdea[]; error?: string }> {
  try {
    const systemPrompt = `You are an expert product strategist and market researcher. 
Your goal is to generate exactly 10 highly profitable digital product ideas based on the user's inputs.
You MUST format your response as a valid JSON object with a root key "ideas" containing an array of objects.
Each object must strictly follow this schema:
{
  "productName": "Catchy, benefit-driven product name",
  "targetAudience": "Specific target customer profile",
  "mainProblemSolved": "The exact painful problem this product solves",
  "priceRange": "Suggested price or tiered range, optimized for the user's country",
  "recommendedFormat": "e.g., Video Course, SaaS Wrapper, E-book, Group Coaching, etc."
}

CRITICAL LOCALIZATION RULES:
- Language: The entire response MUST be written natively in ${params.language}. Never mix languages.
- Country Context: The tone, market examples, cultural fit, and currency formats MUST align with the market in ${params.country}.`;

    const userPrompt = `Please synthesize 10 optimized digital product structured ideas based on the following constraints:
- Niche: ${params.niche}
- Micro-niche / Sub-niche: ${params.subniche}
- Intended Business Model: ${params.businessType}
- Target Audience Focus: ${params.targetAudience}
- Final Goal for the Audience: ${params.targetGoal}`;

    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const parsed = parseOpenAIResponse<{ ideas: ProductIdea[] }>(response.choices[0].message.content);

    return {
      success: true,
      data: parsed.ideas,
    };
  } catch (error: any) {
    console.error("Error generating products:", error);
    return {
      success: false,
      error: error.message || "An unexpected error occurred while generating products.",
    };
  }
}

export async function saveProductToProject(product: ProductIdea, projectName: string) {
  const name = projectName && projectName.trim() ? projectName : "Product Blueprints";
  return await saveGenerationToDatabase(
    name, 
    "product-miner", 
    { concept: product.productName, format: product.recommendedFormat }, 
    product
  );
}

export async function saveMultipleProductsToProject(products: ProductIdea[], projectName: string) {
  const name = projectName && projectName.trim() ? projectName : "Product Blueprints Cluster";
  
  // We save them as a single generation entry with the array as output_data 
  // to keep the project view clean, or we could loop and save 10 times.
  // Saving as a cluster is often better for "Miner" results.
  return await saveGenerationToDatabase(
    name,
    "product-miner",
    { count: products.length, type: "cluster" },
    { ideas: products }
  );
}
