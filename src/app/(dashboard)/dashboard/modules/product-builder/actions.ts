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

export type EbookChapter = {
  title: string;
  content: string;
};

export type EbookResult = {
  title: string;
  subtitle: string;
  backCoverText: string;
  tableOfContents: string[];
  introduction: string;
  chapters: EbookChapter[];
  conclusion: string;
  cta: string;
};

export type ViralHooksResult = {
  names: string[];
  headlines: string[];
  hooks: string[];
  promises: string[];
};

const chapterConfig: Record<number, { count: number; minWords: number }> = {
  10: { count: 3, minWords: 600 },
  20: { count: 5, minWords: 750 },
  30: { count: 6, minWords: 900 },
  60: { count: 8, minWords: 1100 },
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
  } catch (error: unknown) {
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

export type ComplementaryFormat = {
  type: string;
  title: string;
  description: string;
};

export async function generateBonuses(params: {
  concept: string;
  targetAudience: string;
  language: string;
}): Promise<{ success: boolean; data?: string[]; error?: string }> {
  try {
    const systemPrompt = `You are a digital product strategist.
Generate exactly 3 creative, high-perceived-value bonus items for a digital product.
Each bonus must be directly relevant to the product concept and highly desirable for the target audience.
Make them specific, tangible, and exciting — not generic.

Return ONLY a valid JSON object:
{ "bonuses": ["Bonus 1: title and short description", "Bonus 2: title and short description", "Bonus 3: title and short description"] }

CRITICAL:
1. All text in ${params.language}
2. Tailored for: ${params.targetAudience}
3. Return ONLY the JSON object`;

    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Generate bonuses for: ${params.concept}` },
      ],
      response_format: { type: "json_object" },
      temperature: 0.9,
    });

    const parsed = parseOpenAIResponse<{ bonuses: string[] }>(response.choices[0].message.content);
    return { success: true, data: parsed.bonuses };
  } catch (error: unknown) {
    console.error("Error generating bonuses:", error);
    return { success: false, error: "Failed to generate bonuses." };
  }
}

export async function generateComplementaryFormats(params: {
  concept: string;
  targetAudience: string;
  language: string;
}): Promise<{ success: boolean; data?: ComplementaryFormat[]; error?: string }> {
  try {
    const systemPrompt = `You are a digital product strategist specializing in complementary products.
Given a core product concept, select the 4 most suitable complementary formats from this list and customize them:
[Planner, Checklist, Planilha, Workbook, Mini desafio, Grupo de apoio, Templates, Calendário de acompanhamento]

For each selected format, create a specific title and description tailored to the product concept.

Return ONLY a valid JSON object:
{
  "formats": [
    { "type": "Planner", "title": "Specific title", "description": "One sentence on how it helps" },
    { "type": "Checklist", "title": "Specific title", "description": "One sentence on how it helps" },
    { "type": "Workbook", "title": "Specific title", "description": "One sentence on how it helps" },
    { "type": "Templates", "title": "Specific title", "description": "One sentence on how it helps" }
  ]
}

CRITICAL:
1. All text in ${params.language}
2. Tailored for: ${params.targetAudience}
3. Choose the 4 most relevant formats for this specific product
4. Return ONLY the JSON object`;

    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Generate complementary formats for: ${params.concept}` },
      ],
      response_format: { type: "json_object" },
      temperature: 0.8,
    });

    const parsed = parseOpenAIResponse<{ formats: ComplementaryFormat[] }>(response.choices[0].message.content);
    return { success: true, data: parsed.formats };
  } catch (error: unknown) {
    console.error("Error generating complementary formats:", error);
    return { success: false, error: "Failed to generate complementary formats." };
  }
}

export async function generateEbook(params: {
  concept: string;
  targetAudience: string;
  pageCount: number;
  language: string;
}): Promise<{ success: boolean; data?: EbookResult; error?: string }> {
  try {
    const cfg = chapterConfig[params.pageCount] ?? chapterConfig[20];

    const systemPrompt = `You are a world-class ebook author. Your task is to write a COMPLETE, FULLY WRITTEN ebook — not an outline, not a summary, not placeholder text.

CRITICAL REQUIREMENT — READ THIS CAREFULLY:
The "content" field of EACH chapter must contain the ACTUAL FULL WRITTEN TEXT of that chapter — a minimum of ${cfg.minWords} words of real prose. Do NOT write descriptions, summaries, or outlines. Write the chapter itself, as it would appear in the published book.

FORBIDDEN IN CONTENT FIELDS:
- "This chapter will cover..."
- "In this chapter, we discuss..."
- "The reader will learn..."
- Bullet points as the only content
- Any text that describes what will be written instead of actually writing it

CHAPTER CONTENT STRUCTURE (write all of these for every chapter):
1. Opening hook paragraph — name the reader's exact pain or fear. Make them feel seen in 2-3 sentences.
2. Story or real-world example — a relatable situation or character that mirrors the reader's life (3-4 paragraphs).
3. Internal subtitle — provocative, benefit-driven.
4. Core insight and explanation — 3-4 paragraphs of meaty, practical content.
5. Bullet point list — 4-6 specific, actionable tips the reader can apply today.
6. Another internal subtitle.
7. Deeper content or second insight — 2-3 paragraphs with examples.
8. Mental trigger sentence — scarcity, social proof, or before/after contrast.
9. Optional image placeholder: [IMAGEM: brief visual description in the same language as the content]
10. Closing hook — one sentence that creates curiosity or urgency for the next chapter.

INTRODUCTION requirements (400+ words):
- Open with a scene or provocative question
- Create immediate identification ("Se você já sentiu que...")
- Deliver the bold promise of transformation
- Preview the journey ahead

CONCLUSION requirements (300+ words):
- Summarize the transformation arc
- Reinforce belief that the reader can do this
- Build urgency and emotional momentum

Return ONLY a valid JSON object with this exact structure. Every string value must be the actual written content — never a description:
{
  "title": "The actual ebook title",
  "subtitle": "The actual subtitle",
  "backCoverText": "Actual 200-word back cover text selling the transformation",
  "tableOfContents": ["Introdução", "Capítulo 1: Actual Title", "Capítulo 2: Actual Title", "Conclusão"],
  "introduction": "Actual 400+ word introduction written in full",
  "chapters": [
    {
      "title": "Capítulo 1: Actual Provocative Title",
      "content": "The full written text of this chapter — minimum ${cfg.minWords} words — with internal subtitles, paragraphs, bullet lists, story, examples, and a closing hook. Write every word."
    }
  ],
  "conclusion": "Actual 300+ word conclusion written in full",
  "cta": "One bold, emotionally charged paragraph telling the reader exactly what to do next"
}

ABSOLUTE RULES:
1. ALL text MUST be written natively in ${params.language}. Never mix languages.
2. Tailor ALL content and examples specifically for: ${params.targetAudience}
3. Include EXACTLY ${cfg.count} chapters in the chapters array
4. Every "content" field must be ${cfg.minWords}+ words of actual written prose
5. Return ONLY the JSON object — no markdown fences, no text outside the JSON`;

    const userPrompt = `Create a complete ebook about: ${params.concept}`;

    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 16000,
    });

    const parsed = parseOpenAIResponse<EbookResult>(response.choices[0].message.content);
    return { success: true, data: parsed };
  } catch (error: unknown) {
    console.error("Error generating ebook:", error);
    return { success: false, error: "Failed to generate ebook. Please try again." };
  }
}

export async function generateViralHooks(params: {
  concept: string;
  targetAudience: string;
  language: string;
}): Promise<{ success: boolean; data?: ViralHooksResult; error?: string }> {
  try {
    const systemPrompt = `You are a world-class direct-response copywriter specializing in viral content.

Return ONLY a valid JSON object with this exact structure:
{
  "names": ["name 1", "name 2", "name 3", "name 4", "name 5", "name 6", "name 7", "name 8", "name 9", "name 10"],
  "headlines": ["headline 1", "headline 2", "headline 3", "headline 4", "headline 5", "headline 6", "headline 7", "headline 8", "headline 9", "headline 10"],
  "hooks": ["hook 1", "hook 2", "hook 3", "hook 4", "hook 5", "hook 6", "hook 7", "hook 8", "hook 9", "hook 10"],
  "promises": ["promise 1", "promise 2", "promise 3", "promise 4", "promise 5", "promise 6", "promise 7", "promise 8", "promise 9", "promise 10"]
}

Where:
- names: 10 powerful, memorable product/ebook names with strong emotional pull
- headlines: 10 high-converting ad headlines (mix of curiosity, benefit, and pain-based)
- hooks: 10 viral scroll-stopping hooks (1-2 sentences, immediate attention-grabbing)
- promises: 10 bold, specific, outcome-driven promises

CRITICAL:
1. ALL text MUST be written natively in ${params.language}
2. Target audience: ${params.targetAudience}
3. Return ONLY the JSON object`;

    const userPrompt = `Generate viral hooks and copy assets for: ${params.concept}`;

    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.85,
    });

    const parsed = parseOpenAIResponse<ViralHooksResult>(response.choices[0].message.content);
    return { success: true, data: parsed };
  } catch (error: unknown) {
    console.error("Error generating viral hooks:", error);
    return { success: false, error: "Failed to generate viral hooks. Please try again." };
  }
}

export async function generateCoverImage(params: {
  title: string;
  concept: string;
}): Promise<{ success: boolean; imageBase64?: string; error?: string }> {
  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: `Professional digital ebook cover for a book titled "${params.title}". Theme: ${params.concept}. Modern premium design, bold typography, clean layout, high contrast, suitable for digital publishing. No text in the image.`,
      size: "1024x1024",
      quality: "standard",
      response_format: "b64_json",
      n: 1,
    });

    const imageBase64 = response.data?.[0]?.b64_json;
    return { success: true, imageBase64 };
  } catch (error: unknown) {
    console.error("Error generating cover image:", error);
    return { success: false, error: "Failed to generate cover image." };
  }
}

export async function generateChapterImages(params: {
  chapters: { title: string }[];
  concept: string;
}): Promise<{ success: boolean; images?: (string | null)[]; error?: string }> {
  try {
    const images: (string | null)[] = [];
    for (const ch of params.chapters) {
      try {
        const response = await openai.images.generate({
          model: "dall-e-3",
          prompt: `Premium editorial book illustration for a chapter titled "${ch.title}". Book theme: ${params.concept}. Style: cinematic photography, professional, rich colors, dramatic lighting, abstract or conceptual. No text or words in the image.`,
          size: "1792x1024",
          quality: "standard",
          response_format: "b64_json",
          n: 1,
        });
        images.push(response.data?.[0]?.b64_json ?? null);
        // Respect rate limits between calls
        await new Promise((r) => setTimeout(r, 600));
      } catch {
        images.push(null);
      }
    }
    return { success: true, images };
  } catch (error: unknown) {
    console.error("Error generating chapter images:", error);
    return { success: false, error: "Failed to generate chapter images." };
  }
}
