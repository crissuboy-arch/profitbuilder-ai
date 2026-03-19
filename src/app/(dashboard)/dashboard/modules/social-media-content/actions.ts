"use server";

import { openai, DEFAULT_MODEL, parseOpenAIResponse } from "@/lib/openai";
import { saveGenerationToDatabase } from "@/lib/projects";

export type SocialMediaResult = {
  weeklySchedule: { day: string, format: string, hook: string, concept: string }[];
  writtenCaptions: string[];
  shortVideoHooks: string[];
  videoScripts: string[];
  hashtags: string[];
};

export type GenerateSocialParams = {
  businessType: string;
  niche: string;
  targetAudience: string;
  platform: string;
  goal: string;
  country: string;
  language: string;
};

export async function generateSocialContent(
  params: GenerateSocialParams
): Promise<{ success: boolean; data?: SocialMediaResult; error?: string }> {
  try {
    const systemPrompt = `You are a prolific social media manager and content strategist.
Your task is to build a viral content calendar and assets optimized for ${params.platform}.

You MUST format your response as a valid JSON object matching this exact schema:
{
  "weeklySchedule": [
    { "day": "Monday", "format": "e.g. Reel, Carousel, Text", "hook": "The opening line", "concept": "What the post is about" },
    ... continue for 7 days
  ],
  "writtenCaptions": ["Full caption 1", "Full caption 2"],
  "shortVideoHooks": ["Hook 1", "Hook 2", "Hook 3"],
  "videoScripts": ["A short script format: [Hook]... [Value]... [CTA]..."],
  "hashtags": ["#tag1", "#tag2", "#tag3"]
}

CRITICAL RULES:
1. Language: All text MUST be returned natively in ${params.language}. Never mix languages.
2. Context: Relate concepts, idioms, holidays, and behavior to the market in ${params.country}.
3. Goal: The primary objective of this content is ${params.goal}. Format the CTAs accordingly.`;

    const userPrompt = `Please plan 7 days of social media content:
- Business Type: ${params.businessType}
- Niche: ${params.niche}
- Target Audience: ${params.targetAudience}
- Platform: ${params.platform}`;

    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const parsed = parseOpenAIResponse<SocialMediaResult>(response.choices[0].message.content);

    return {
      success: true,
      data: parsed,
    };
  } catch (error: any) {
    console.error("Error generating social content:", error);
    return {
      success: false,
      error: "An unexpected error occurred while generating the content plan.",
    };
  }
}

export async function saveSocialToProject(result: SocialMediaResult, projectName: string) {
  const name = projectName && projectName.trim() ? projectName : "Social Content";
  return await saveGenerationToDatabase(
    name,
    "social-media-generator",
    {}, 
    result
  );
}
