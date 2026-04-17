"use server";

import { openai, DEFAULT_MODEL, parseOpenAIResponse } from "@/lib/openai";
import { saveGenerationToDatabase } from "@/lib/projects";
import { createClient } from "@/utils/supabase/server";
import { adFrameworks, getRandomFrameworks } from "./adFrameworks";
import { getNicheProfile, scoreCreative, rankCreatives, type NicheProfile } from "./adScorer";

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

export type AdScore = {
  hookScore: number;
  clarityScore: number;
  emotionScore: number;
  conversionScore: number;
  finalScore: number;
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
  score?: AdScore;
  nicheProfile?: NicheProfile;
  isTopAd?: boolean;
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
  productType?: string;
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
    
    const nicheProfile = getNicheProfile(params.niche || "");
    
    const frameworks = params.selectedFrameworks && params.selectedFrameworks.length > 0
      ? adFrameworks.filter(f => params.selectedFrameworks!.includes(f.id))
      : getRandomFrameworks(params.count || 7);

    if (frameworks.length === 0) {
      return {
        success: false,
        error: isPT ? "Nenhum framework selecionado." : "No frameworks selected.",
      };
    }

    const toneInstructions = getToneInstructions(nicheProfile, isPT);
    
    const hormoziInstructions = isPT
      ? `ESTRUTURA HORMOZI (P-A-S-T):
- PROBLEMA: Identifique a dor mais profunda do público (máximo 2 linhas)
- AGREMIÇÃO: Agite o problema, mostre as consequências (2-3 linhas)
- SOLUÇÃO: Apresente seu produto como a solução inevitável (2-3 linhas)
- TRANSFORMAÇÃO: Mostre o resultado final desejado (1-2 linhas)
- CTA: Urgência + ação clara

Cada ad deve seguir esta estrutura de forma NATURAL e PODEROSA.`
      : `HORMOZI STRUCTURE (P-A-S-T):
- PROBLEM: Identify the deepest pain of your audience (max 2 lines)
- AGITATION: Stir up the problem, show consequences (2-3 lines)
- SOLUTION: Present your product as the inevitable solution (2-3 lines)
- TRANSFORMATION: Show the desired end result (1-2 lines)
- CTA: Urgency + clear action

Each ad must follow this structure NATURALLY and POWERFULLY.`;

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

    const systemPrompt = `You are a world-class direct response copywriter specializing in high-converting social media ads.
You create ultra-converting ad creatives using proven psychological frameworks and the Hormozi P-A-S-T structure.

${toneInstructions}

${hormoziInstructions}

IMPORTANT: Return ALL text natively in ${params.language}. Never mix languages.

For each framework provided, generate a complete ad creative with HORMOZI-STYLE copy:
1. headline - Must be SCROLL-STOPPING, specific to the product and niche
2. body - MUST follow P-A-S-T structure: Problem → Agitation → Solution → Transformation → CTA
3. cta - Action-oriented, create urgency
4. visualConcept - Brief description of the visual treatment
5. imagePrompt - DALL-E ready prompt with: composition, lighting, emotional tone, NO text, NO watermark

You MUST format your response as a valid JSON object with this exact schema:
{
  "creatives": [
    {
      "frameworkId": "framework_id",
      "frameworkName": "Framework Name",
      "headline": "The ad headline - be specific, emotional, with numbers or strong words",
      "body": "HORMOZI P-A-S-T COPY:\n\nPROBLEMA: [Deep pain point]\n\nAGREMIÇÃO: [Consequences of not solving]\n\nSOLUÇÃO: [Why your product is the answer]\n\nTRANSFORMAÇÃO: [End result promise]\n\nCTA: [Urgency + action]",
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
- Product Type: ${params.productType || "Digital Product"}
- Niche: ${params.niche || "Geral"}
- Promise: ${params.promise}
- Target Audience: ${params.targetAudience}
- Price: ${params.price}

NICHE INTELLIGENCE DATA:
- Tone: ${nicheProfile.tone}
- Key Pain Points: ${nicheProfile.painPoints.slice(0, 3).join(", ")}
- Key Promises: ${nicheProfile.promises.slice(0, 3).join(", ")}
- Emotional Triggers: ${nicheProfile.emotionalTriggers.slice(0, 3).join(", ")}
- Vocabulary to use: ${nicheProfile.vocabulary.slice(0, 5).join(", ")}

For each creative:
- Fill in the templates with real product details
- Use niche-specific vocabulary
- Make headlines punchy and specific to the audience
- Body must follow HORMOZI P-A-S-T structure EXACTLY
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
      max_tokens: 15000,
    });

    const raw = response.choices[0].message.content ?? "{}";
    const parsed = JSON.parse(raw);

    let creatives: AdCreative[] = (parsed.creatives || []).map((c: { 
      frameworkId: string; 
      frameworkName: string; 
      headline: string; 
      body: string; 
      cta: string; 
      visualConcept: string; 
      imagePrompt: string 
    }) => {
      const creative: AdCreative = {
        id: crypto.randomUUID(),
        frameworkId: c.frameworkId,
        frameworkName: c.frameworkName,
        headline: c.headline || "",
        body: c.body || "",
        cta: c.cta || "",
        visualConcept: c.visualConcept || "",
        imagePrompt: c.imagePrompt || "",
        nicheProfile,
      };
      
      creative.score = scoreCreative(creative.headline, creative.body, creative.cta, creative.frameworkId);
      
      return creative;
    });

    creatives = rankCreatives(creatives);
    
    creatives = creatives.map((c, index) => ({
      ...c,
      isTopAd: index < 3
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

function getToneInstructions(nicheProfile: NicheProfile, isPT: boolean): string {
  switch (nicheProfile.tone) {
    case "aggressive":
      return isPT
        ? "TOM: AGRESSIVO E DIRETO. Use palavras fortes como 'pare de perder', 'acabe com', 'nunca mais'. Seja confiante e provocativo. Faça o público sentir que está perdendo algo."
        : "TONE: AGGRESSIVE AND DIRECT. Use strong words like 'stop losing', 'end', 'never again'. Be confident and provocative. Make the audience feel they are missing out.";
    case "empathetic":
      return isPT
        ? "TOM: EMPÁTICO E CARING. Conecte-se emocionalmente com a dor do público. Use palavras como 'eu entendo', 'como você se sente', 'não se preocupe'. Faça o público sentir que você entende."
        : "TONE: EMPATHETIC AND CARING. Connect emotionally with the audience's pain. Use words like 'I understand', 'how you feel', 'don't worry'. Make the audience feel understood.";
    case "luxury":
      return isPT
        ? "TOM: LUXO E EXCLUSIVIDADE. Use palavras como 'exclusivo', 'premium', 'seleto', 'você merece'. Mostre que este é um produto para poucos."
        : "TONE: LUXURY AND EXCLUSIVITY. Use words like 'exclusive', 'premium', 'select', 'you deserve'. Show this is a product for few.";
    case "urgent":
      return isPT
        ? "TOM: URGENTE E IMPERATIVO. Use frases como 'agora mesmo', 'não espere', 'última chance', 'vagas limitadas'. Crie FOMO forte."
        : "TONE: URGENT AND IMPERATIVE. Use phrases like 'right now', 'don't wait', 'last chance', 'limited spots'. Create strong FOMO.";
    case "casual":
      return isPT
        ? "TOM: CASUAL E PARECIDO COM AMIGO. Fale como se estivesse conversando. Use gírias quando apropriado. Seja autêntico e próximo."
        : "TONE: CASUAL AND FRIENDLY. Talk like you're having a conversation. Use slang when appropriate. Be authentic and approachable.";
    default:
      return isPT
        ? "TOM: PROFISSIONAL MAS ACESSÍVEL. Balanceie autoridade com acessibilidade. Seja claro e direto."
        : "TONE: PROFESSIONAL BUT ACCESSIBLE. Balance authority with accessibility. Be clear and direct.";
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
    { count: creatives.length, firstHeadline: creatives[0]?.headline, topAds: creatives.filter(c => c.isTopAd).length },
    { creatives, savedAt: new Date().toISOString() }
  );
}

export async function saveSingleAdToDatabase(
  creative: AdCreative,
  productName: string
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    const { data, error } = await supabase
      .from("saved_ads")
      .insert({
        user_id: user.id,
        product_name: productName,
        framework_id: creative.frameworkId,
        framework_name: creative.frameworkName,
        headline: creative.headline,
        body: creative.body,
        cta: creative.cta,
        visual_concept: creative.visualConcept,
        image_prompt: creative.imagePrompt,
        hook_score: creative.score?.hookScore ?? 0,
        clarity_score: creative.score?.clarityScore ?? 0,
        emotion_score: creative.score?.emotionScore ?? 0,
        conversion_score: creative.score?.conversionScore ?? 0,
        final_score: creative.score?.finalScore ?? 0,
        is_top_ad: creative.isTopAd ?? false,
      })
      .select()
      .single();

    if (error) {
      console.error("Error saving ad:", error);
      return { success: false, error: error.message };
    }

    return { success: true, message: "Ad saved successfully!", data };
  } catch (error: unknown) {
    console.error("Error in saveSingleAdToDatabase:", error);
    return { success: false, error: "Failed to save ad" };
  }
}

export async function getSavedAds() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: "User not authenticated", data: [] };
    }

    const { data, error } = await supabase
      .from("saved_ads")
      .select("*")
      .eq("user_id", user.id)
      .order("final_score", { ascending: false });

    if (error) {
      console.error("Error fetching saved ads:", error);
      return { success: false, error: error.message, data: [] };
    }

    return { success: true, data: data || [] };
  } catch (error: unknown) {
    console.error("Error in getSavedAds:", error);
    return { success: false, error: "Failed to fetch saved ads", data: [] };
  }
}

export async function deleteSavedAd(adId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    const { error } = await supabase
      .from("saved_ads")
      .delete()
      .eq("id", adId)
      .eq("user_id", user.id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, message: "Ad deleted successfully!" };
  } catch (error: unknown) {
    return { success: false, error: "Failed to delete ad" };
  }
}
