"use server";

import { openai, DEFAULT_MODEL, parseOpenAIResponse } from "@/lib/openai";
import { saveGenerationToDatabase } from "@/lib/projects";

export type SEOResult = {
  titles: string[];
  metaDescriptions: string[];
  slugs: string[];
  outline: {
    h1: string;
    sections: { h2: string, h3s: string[] }[];
  };
  keywordClusters: { category: string; keywords: string[] }[];
  introduction: string;
  faqSchema: { question: string; answer: string }[];
  internalLinking: string;
  languageUsed: string;
  countryTargeted: string;
};

export type GenerateSEOParams = {
  keyword: string;
  niche: string;
  targetAudience: string;
  contentType: string;
  country: string;
  language: string;
};

export async function generateSEO(
  params: GenerateSEOParams
): Promise<{ success: boolean; data?: SEOResult; error?: string }> {
  try {
    const systemPrompt = `You are a world-class SEO Architect and Content Strategist.
Your goal is to build out an incredibly optimized, semantically rich semantic SEO plan.

You MUST format your response as a valid JSON object matching this exact schema:
{
  "titles": ["SEO Title 1 (Include target keyword)", "Title 2", "Title 3"],
  "metaDescriptions": ["Meta 1 (Call to action included)", "Meta 2", "Meta 3"],
  "slugs": ["/slug-1", "/slug-2", "/slug-3"],
  "outline": {
    "h1": "Main Article H1",
    "sections": [
      { "h2": "Section Heading", "h3s": ["Sub point 1", "Sub point 2"] }
    ]
  },
  "keywordClusters": [
    { "category": "Intent or Topic", "keywords": ["kw 1", "kw 2"] }
  ],
  "introduction": "A compelling 3-4 sentence article intro acting as hook and thesis.",
  "faqSchema": [
    { "question": "Common user question?", "answer": "Direct answer." }
  ],
  "internalLinking": "Brief strategic advice on where to interlink this article.",
  "languageUsed": "${params.language}",
  "countryTargeted": "${params.country}"
}

CRITICAL RULES:
1. Language: All generated content MUST be returned natively in ${params.language}.
2. Context: Ensure search intent matches the cultural and behavioral expectations of users residing in ${params.country}. The slang, references, and problems must make sense locally.`;

    const userPrompt = `Create an SEO content strategy based on these inputs:
- Target Primary Keyword: ${params.keyword}
- Niche Industry: ${params.niche}
- Core Audience: ${params.targetAudience}
- Intended Content Type: ${params.contentType}`;

    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const parsed = parseOpenAIResponse<SEOResult>(response.choices[0].message.content);

    return {
      success: true,
      data: parsed,
    };
  } catch (error: unknown) {
    console.error("Error generating SEO outline:", error);
    return {
      success: false,
      error: "An unexpected error occurred while generating the SEO strategy.",
    };
  }
}

export async function saveSEOToProject(result: SEOResult, projectName: string) {
  const name = projectName && projectName.trim() ? projectName : "SEO Strategies";
  return await saveGenerationToDatabase(
    name,
    "seo-generator",
    { targetKeyword: result.titles[0] || "Unknown SEO Project" },
    result
  );
}
