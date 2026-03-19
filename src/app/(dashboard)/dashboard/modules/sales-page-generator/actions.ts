"use server";

import { openai, DEFAULT_MODEL, parseOpenAIResponse } from "@/lib/openai";
import { saveGenerationToDatabase } from "@/lib/projects";

export type SalesPageResult = {
  headline: string;
  subheadline: string;
  problemSection: string;
  storySection: string;
  offerPresentation: string;
  bonuses: string[];
  testimonials: string[];
  guarantee: string;
  faq: string[];
  callsToAction: string[];
  price: string;
};

export type GenerateSalesPageParams = {
  productConcept: string;
  targetAudience: string;
  price: string;
  uniqueMechanism: string;
  country: string;
  language: string;
};

export async function generateSalesPage(
  params: GenerateSalesPageParams
): Promise<{ success: boolean; data?: SalesPageResult; error?: string }> {
  try {
    const systemPrompt = `You are a world-class direct-response copywriter.
Your goal is to write high-converting sales page copy following a structured framework.

You MUST format your response as a valid JSON object matching this exact schema:
{
  "headline": "A punchy, benefit-driven hook",
  "subheadline": "Expands on the headline and promises a timeframe or specific result",
  "problemSection": "Pokes the pain point by describing the audience's current struggles",
  "storySection": "A relatable story bridging the problem to the solution/epiphany",
  "offerPresentation": "Introduces the product as the ultimate solution",
  "bonuses": ["Bonus 1: Description", "Bonus 2: Description", ...],
  "testimonials": ["Fake quote 1", "Fake quote 2", ...],
  "guarantee": "A strong risk-reversal statement (e.g. 30-day money back)",
  "faq": ["Q: Short question? A: Short answer.", ...],
  "callsToAction": ["CTA Button Copy 1", "CTA Button Copy 2"],
  "price": "The price point (use the user's provided input)"
}

CRITICAL RULES:
1. Language: All text MUST be returned natively in ${params.language}. Never mix languages.
2. Context: Tailor the tone, examples, idioms, locations, and currency formats to the market in ${params.country}.
3. Formatting: Do not output markdown codeblocks inside the JSON payload fields; keep strings plain.`;

    const userPrompt = `Please write a sales page for:
- Product Concept: ${params.productConcept}
- Target Audience: ${params.targetAudience}
- Unique Mechanism: ${params.uniqueMechanism}
- Price Point: ${params.price}`;

    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const parsed = parseOpenAIResponse<SalesPageResult>(response.choices[0].message.content);

    return {
      success: true,
      data: parsed,
    };
  } catch (error: any) {
    console.error("Error generating sales page:", error);
    return {
      success: false,
      error: "An unexpected error occurred while generating the sales page.",
    };
  }
}

export async function saveSalesPageToProject(result: SalesPageResult, projectName: string) {
  const name = projectName && projectName.trim() ? projectName : "Sales Pages";
  return await saveGenerationToDatabase(
    name,
    "sales-page-generator",
    { headline: result.headline },
    result
  );
}
