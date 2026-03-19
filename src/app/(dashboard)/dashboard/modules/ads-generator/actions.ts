"use server";

import { openai, DEFAULT_MODEL, parseOpenAIResponse } from "@/lib/openai";
import { saveGenerationToDatabase } from "@/lib/projects";

export type AdsResult = {
  scrollStoppingHook: string;
  primaryAdCopy: string;
  shortAdCopy: string;
  videoAdScript: string;
  imageHeadlines: string[];
  callsToAction: string[];
  emotionalTriggers: string[];
};

export type GenerateAdsParams = {
  productName: string;
  targetAudience: string;
  price: string;
  uniqueMechanism: string;
  platform: string;
  country: string;
  language: string;
};

export async function generateAds(
  params: GenerateAdsParams
): Promise<{ success: boolean; data?: AdsResult; error?: string }> {
  try {
    const systemPrompt = `You are a legendary digital marketer and media buyer running ads on ${params.platform}.
Your goal is to write highly engaging and converting ad creatives for a given product.

You MUST format your response as a valid JSON object matching this exact schema:
{
  "scrollStoppingHook": "1 explosive sentence to grab attention instantly.",
  "primaryAdCopy": "The main long-form or medium-form copy for the description/caption.",
  "shortAdCopy": "A quick, punchy 2-sentence version of the ad.",
  "videoAdScript": "A short script format like: [Hook]... [Body]... [CTA]...",
  "imageHeadlines": ["Headline 1", "Headline 2"],
  "callsToAction": ["CTA 1", "CTA 2"],
  "emotionalTriggers": ["e.g. FOMO", "e.g. Curiosity"]
}

CRITICAL RULES:
1. Language: All text MUST be returned natively in ${params.language}. Never mix languages.
2. Context: Tailor the tone, vernacular, cultural pain points, and currency to the ${params.country} market.
3. Platform Optimization: Write specifically for the style of ${params.platform} (e.g., TikTok needs fast hooks, Facebook needs emotional stories).`;

    const userPrompt = `Please write ad creatives for:
- Product Name: ${params.productName}
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

    const parsed = parseOpenAIResponse<AdsResult>(response.choices[0].message.content);

    return {
      success: true,
      data: parsed,
    };
  } catch (error: any) {
    console.error("Error generating ads:", error);
    return {
      success: false,
      error: "An unexpected error occurred while generating the ad creatives.",
    };
  }
}

export async function saveAdsToProject(result: AdsResult, projectName: string) {
  const name = projectName && projectName.trim() ? projectName : "Ad Campaigns";
  return await saveGenerationToDatabase(
    name,
    "ads-generator",
    { hook: result.scrollStoppingHook },
    result
  );
}
