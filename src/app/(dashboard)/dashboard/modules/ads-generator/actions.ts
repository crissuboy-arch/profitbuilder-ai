"use server";

import { openai, DEFAULT_MODEL, parseOpenAIResponse } from "@/lib/openai";
import { saveGenerationToDatabase } from "@/lib/projects";
import { createClient } from "@/utils/supabase/server";
import { adFrameworks, getRandomFrameworks } from "./adFrameworks";
import { copyArchitectures, getRandomArchitectures } from "./copyArchitectures";
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
  architectureId?: string;
  architectureName?: string;
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
  selectedArchitectures?: string[];
  count?: number;
  architectureCount?: number;
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
      : getRandomFrameworks(params.count || 5);

    const architectures = params.selectedArchitectures && params.selectedArchitectures.length > 0
      ? copyArchitectures.filter(a => params.selectedArchitectures!.includes(a.id))
      : getRandomArchitectures(params.architectureCount || 2);

    if (frameworks.length === 0 && architectures.length === 0) {
      return {
        success: false,
        error: isPT ? "Selecione pelo menos um framework ou copy style." : "Select at least one framework or copy style.",
      };
    }

    const toneInstructions = getToneInstructions(nicheProfile, isPT);
    
    const architecturesJson = architectures.map(a => ({
      id: a.id,
      name: a.name,
      emoji: a.emoji,
      description: a.description,
      funnelStage: a.funnelStage,
      toneStyle: a.toneStyle,
      structure: a.structure,
    }));

    const frameworksJson = frameworks.map(f => ({
      id: f.id,
      name: f.name,
      description: f.description,
      visualLogic: f.visualLogic,
      imagePromptTemplate: f.imagePromptTemplate,
    }));

    const copyInstructions = architectures.length > 0
      ? `COPY ARCHITECTURES TO USE:\n${architecturesJson.map(a => `- ${a.emoji} ${a.name} (${a.funnelStage}): ${a.structure}`).join("\n")}`
      : `Use PAS (Problem → Agitation → Solution) structure by default.`;

    const systemPrompt = `You are a world-class direct response copywriter.
You create ultra-converting ad creatives combining VISUAL FRAMEWORKS + COPY ARCHITECTURES.

${toneInstructions}

${copyInstructions}

IMPORTANT: Return ALL text natively in ${params.language}. Never mix languages.

Generate ad creatives combining a VISUAL FRAMEWORK (for design/layout) with a COPY ARCHITECTURE (for copy structure).

For each creative:
1. headline - SCROLL-STOPPING, specific to product and audience, can include numbers
2. body - Follow the COPY ARCHITECTURE structure precisely
3. cta - Action-oriented, create urgency or curiosity
4. visualConcept - Describe how the VISUAL FRAMEWORK elements should look
5. imagePrompt - DALL-E ready prompt: composition, lighting, emotional tone, NO text, NO watermark
6. frameworkId / frameworkName - From the visual framework used
7. architectureId / architectureName - From the copy architecture used

You MUST format your response as a valid JSON object:
{
  "creatives": [
    {
      "frameworkId": "visual_framework_id",
      "frameworkName": "Visual Framework Name",
      "architectureId": "copy_architecture_id",
      "architectureName": "Copy Architecture Name",
      "headline": "Compelling headline",
      "body": "Body following copy architecture structure",
      "cta": "Call to action",
      "visualConcept": "Visual description",
      "imagePrompt": "DALL-E prompt"
    }
  ]
}`;

    const creativeCount = Math.min(10, Math.max(frameworks.length, architectures.length) * 2);
    
    const userPrompt = `Generate ${creativeCount} ad creatives combining:

VISUAL FRAMEWORKS:
${JSON.stringify(frameworksJson, null, 2)}

COPY ARCHITECTURES:
${JSON.stringify(architecturesJson, null, 2)}

PRODUCT DATA:
- Product: ${params.productName}
- Product Type: ${params.productType || "Digital Product"}
- Niche: ${params.niche || "Geral"}
- Promise: ${params.promise}
- Target Audience: ${params.targetAudience}
- Price: ${params.price}

NICHE INTELLIGENCE:
- Tone: ${nicheProfile.tone}
- Pain Points: ${nicheProfile.painPoints.slice(0, 3).join(", ")}
- Promises: ${nicheProfile.promises.slice(0, 3).join(", ")}
- Triggers: ${nicheProfile.emotionalTriggers.slice(0, 3).join(", ")}

Create ads that COMBINE visual frameworks with copy architectures.
Each ad should use one framework + one architecture.
Make headlines punchy and emotional.
Make body copy follow the architecture structure EXACTLY.
Image prompts should reference the visual framework.`;

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
      architectureId?: string;
      architectureName?: string;
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
        architectureId: c.architectureId,
        architectureName: c.architectureName,
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
        ? "TOM: AGRESSIVO E DIRETO. Use palavras fortes como 'pare de perder', 'acabe com', 'nunca mais'. Seja confiante e provocativo."
        : "TONE: AGGRESSIVE AND DIRECT. Use strong words like 'stop losing', 'end', 'never again'. Be confident and provocative.";
    case "empathetic":
      return isPT
        ? "TOM: EMPÁTICO E CARING. Conecte-se emocionalmente com a dor do público. Use palavras como 'eu entendo', 'como você se sente'."
        : "TONE: EMPATHETIC AND CARING. Connect emotionally with the audience's pain.";
    case "luxury":
      return isPT
        ? "TOM: LUXO E EXCLUSIVIDADE. Use palavras como 'exclusivo', 'premium', 'seleto', 'você merece'."
        : "TONE: LUXURY AND EXCLUSIVITY. Use words like 'exclusive', 'premium', 'you deserve'.";
    case "urgent":
      return isPT
        ? "TOM: URGENTE E IMPERATIVO. Use frases como 'agora mesmo', 'não espere', 'última chance'."
        : "TONE: URGENT AND IMPERATIVE. Use phrases like 'right now', 'don't wait', 'last chance'.";
    case "casual":
      return isPT
        ? "TOM: CASUAL E PARECIDO COM AMIGO. Fale como se estivesse conversando. Seja autêntico."
        : "TONE: CASUAL AND FRIENDLY. Talk like you're having a conversation.";
    default:
      return isPT
        ? "TOM: PROFISSIONAL MAS ACESSÍVEL. Balanceie autoridade com acessibilidade."
        : "TONE: PROFESSIONAL BUT ACCESSIBLE. Balance authority with accessibility.";
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
        architecture_name: creative.architectureName,
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

export async function generateAdImage(
  imagePrompt: string
): Promise<{ success: boolean; base64?: string; error?: string }> {
  try {
    const resp = await openai.images.generate({
      model: "dall-e-3",
      prompt: imagePrompt,
      n: 1,
      size: "1024x1024",
      quality: "hd",
    });
    const url = resp.data?.[0]?.url;
    if (!url) throw new Error("No URL returned");
    const res = await fetch(url);
    const buffer = await res.arrayBuffer();
    const base64 = `data:image/png;base64,${Buffer.from(buffer).toString("base64")}`;
    return { success: true, base64 };
  } catch (error: any) {
    console.error("generateAdImage error:", error);
    return { success: false, error: "Falha ao gerar imagem." };
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
