"use server";

import { openai, DEFAULT_MODEL, parseOpenAIResponse } from "@/lib/openai";
import { saveGenerationToDatabase } from "@/lib/projects";
import { adFrameworks, getRandomFrameworks } from "./adFrameworks";

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

export type AdCreative = {
  id: string;
  frameworkId: string;
  frameworkName: string;
  headline: string;
  body: string;
  cta: string;
  visualConcept: string;
  imagePrompt: string;
};

export type GenerateFrameworkAdsParams = {
  productName: string;
  targetAudience: string;
  niche: string;
  price: string;
  promise: string;
  language: string;
  selectedFrameworks?: string[];
  count?: number;
  platform?: string;
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
  } catch (error: unknown) {
    console.error("Error generating ads:", error);
    return {
      success: false,
      error: "An unexpected error occurred while generating the ad creatives.",
    };
  }
}

export async function generateFrameworkAds(
  params: GenerateFrameworkAdsParams
): Promise<{ success: boolean; data?: AdCreative[]; error?: string }> {
  try {
    const isPT = params.language === "Português" || params.language === "Portuguese";
    
    const frameworks = params.selectedFrameworks && params.selectedFrameworks.length > 0
      ? adFrameworks.filter(f => params.selectedFrameworks!.includes(f.id))
      : getRandomFrameworks(params.count || 7);

    if (frameworks.length === 0) {
      return {
        success: false,
        error: isPT ? "Nenhum framework selecionado." : "No frameworks selected.",
      };
    }

    const frameworksJson = frameworks.map(f => ({
      id: f.id,
      name: f.name,
      description: f.description,
      psychologicalTrigger: f.psychologicalTrigger,
      headlineTemplate: f.headlineTemplate,
      bodyTemplate: f.bodyTemplate,
      ctaTemplate: f.ctaTemplate,
      imagePromptTemplate: f.imagePromptTemplate,
    }));

    const systemPrompt = `You are a world-class direct response copywriter specializing in ${params.platform || 'social media'} ads.
You create ultra-converting ad creatives using proven psychological frameworks.

IMPORTANT: Return ALL text natively in ${params.language}. Never mix languages.

For each framework provided, generate a complete ad creative with:
1. headline - Must use the template's style but be specific to the product
2. body - Must follow the template structure with real product details
3. cta - Action-oriented button text
4. visualConcept - Brief description of the visual treatment
5. imagePrompt - DALL-E ready prompt with: composition, lighting, emotional tone, product positioning, NO text, NO watermark

You MUST format your response as a valid JSON object with this exact schema:
{
  "creatives": [
    {
      "frameworkId": "framework_id",
      "frameworkName": "Framework Name",
      "headline": "The ad headline",
      "body": "The ad body copy",
      "cta": "Call to action text",
      "visualConcept": "Visual treatment description",
      "imagePrompt": "DALL-E ready image prompt"
    }
  ]
}`;

    const userPrompt = `Generate ${frameworks.length} ad creatives using these frameworks:

${JSON.stringify(frameworksJson, null, 2)}

PRODUCT DATA:
- Product: ${params.productName}
- Niche: ${params.niche}
- Promise: ${params.promise}
- Target Audience: ${params.targetAudience}
- Price: ${params.price}

For each creative:
- Fill in the templates with real product details
- Make headlines punchy and specific
- Make body copy compelling and concise
- CTAs should create urgency or curiosity
- Image prompts should be detailed for AI image generation`;

    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.8,
      max_tokens: 12000,
    });

    const raw = response.choices[0].message.content ?? "{}";
    const parsed = JSON.parse(raw);

    const creatives: AdCreative[] = (parsed.creatives || []).map((c: { frameworkId: string; frameworkName: string; headline: string; body: string; cta: string; visualConcept: string; imagePrompt: string }) => ({
      id: crypto.randomUUID(),
      frameworkId: c.frameworkId,
      frameworkName: c.frameworkName,
      headline: c.headline || "",
      body: c.body || "",
      cta: c.cta || "",
      visualConcept: c.visualConcept || "",
      imagePrompt: c.imagePrompt || "",
    }));

    return {
      success: true,
      data: creatives,
    };
  } catch (error: unknown) {
    console.error("Error generating framework ads:", error);
    return {
      success: false,
      error: "An unexpected error occurred while generating ad creatives.",
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

export async function saveFrameworkAdsToProject(
  creatives: AdCreative[], 
  projectName: string
) {
  const name = projectName && projectName.trim() ? projectName : "Framework Ad Campaign";
  return await saveGenerationToDatabase(
    name,
    "framework-ads",
    { count: creatives.length, firstHeadline: creatives[0]?.headline },
    { creatives, savedAt: new Date().toISOString() }
  );
}
