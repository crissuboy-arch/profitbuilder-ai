"use server";

import { openai, DEFAULT_MODEL, parseOpenAIResponse } from "@/lib/openai";
import { saveGenerationToDatabase } from "@/lib/projects";
import type { 
  SalesPageResult, 
  GenerateSalesPageParams, 
  TemplateType, 
  StylePreset, 
  SectionToggle, 
  GeneratedSalesPage 
} from "./types";

export type { 
  SalesPageResult, 
  GenerateSalesPageParams, 
  TemplateType, 
  StylePreset, 
  SectionToggle, 
  GeneratedSalesPage 
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
  } catch (error: unknown) {
    console.error("Error generating sales page:", error);
    return {
      success: false,
      error: "An unexpected error occurred while generating the sales page.",
    };
  }
}

export type GenerateTemplatePageParams = {
  templateType: TemplateType;
  stylePreset: StylePreset;
  sections: SectionToggle;
  productData: {
    productName: string;
    niche: string;
    promise: string;
    audience: string;
    modules?: { number: number; title: string; description: string }[];
    bonuses?: { title: string; description: string; value?: string }[];
    testimonials?: { quote: string; author: string; role?: string }[];
    faq?: { question: string; answer: string }[];
    price: string;
    originalPrice?: string;
    ctaText?: string;
    guaranteeDays?: number;
  };
  language: string;
};

export async function generateTemplateSalesPage(
  params: GenerateTemplatePageParams
): Promise<{ success: boolean; data?: GeneratedSalesPage; error?: string }> {
  try {
    const { templateType, stylePreset, sections, productData, language } = params;
    
    const isPT = language === "Português" || language.includes("PT");
    const isFeminine = templateType === "feminino" || stylePreset === "feminine-soft";

    const tone = isFeminine 
      ? (isPT ? "escreva com um tom delicado, acolhedor e feminino, mas profissional" : "write with a delicate, warm, feminine but professional tone")
      : (isPT ? "escreva com copy de alta conversão, direto e persuasivo, focado em transformação" : "write with high-converting, direct and persuasive copy, focused on transformation");
    
    const copyPrompt = `
${tone}

Gere conteúdo para uma página de vendas com base nestes dados do produto:
- Nome do produto: ${productData.productName}
- Nicho: ${productData.niche}
- Promessa: ${productData.promise}
- Público-alvo: ${productData.audience}
- Preço: ${productData.price}
${productData.modules?.length ? `- Módulos: ${productData.modules.map(m => `${m.number}. ${m.title} - ${m.description}`).join(', ')}` : ''}
${productData.bonuses?.length ? `- Bônus: ${productData.bonuses.map(b => b.title).join(', ')}` : ''}
${productData.testimonials?.length ? `- Depoimentos: ${productData.testimonials.map(t => `"${t.quote}" - ${t.author}`).join(', ')}` : ''}

${sections.hero ? `HEADLINE E SUBHEADLINE: Crie uma headline poderosa e uma subheadline que.expande a promessa.` : ''}
${sections.pain ? `SEÇÃO DE DORES: Crie 3-4 cartões de dor/problema que ressoem com o público.` : ''}
${sections.solution ? `SEÇÃO DE SOLUÇÃO: Descreva o produto e liste 5-7 benefícios claros.` : ''}
${sections.modules ? `SEÇÃO DE MÓDULOS: Liste todos os módulos/capítulos do produto.` : ''}
${sections.bonuses ? `SEÇÃO DE BÔNUS: Descreva cada bônus com título, descrição e valor.` : ''}
${sections.testimonials ? `DEPONENTES: Crie ${productData.testimonials?.length || 3} depoimentos假的 mas verossímeis.` : ''}
${sections.guarantee ? `GARANTIA: Crie texto de garantia de ${productData.guaranteeDays || 7} dias.` : ''}
${sections.faq ? `FAQ: Crie 4-6 perguntas e respostas relevantes.` : ''}
${sections.offer ? `OFERTA FINAL: Crie texto de urgência, preço e CTA.` : ''}
${templateType === 'checkout' ? `CHECKOUT: Crie elementos de confiança e resumo da compra.` : ''}
${templateType === 'thankyou' ? `THANK YOU: Crie mensagem de agradecimento e próximos passos.` : ''}

Retorne APENAS JSON válido com todos os campos preenchidos de forma detalhada e persuasiva.`;

    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        { role: "system", content: tone },
        { role: "user", content: copyPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.75,
      max_tokens: 8000,
    });

    const raw = response.choices[0].message.content ?? "";
    const parsed = JSON.parse(raw);

    const generatedPage: GeneratedSalesPage = {
      id: crypto.randomUUID(),
      templateType,
      stylePreset,
      sections: {},
      metadata: {
        productName: productData.productName,
        niche: productData.niche,
        audience: productData.audience,
        language,
        createdAt: new Date().toISOString(),
      },
    };

    if (sections.hero && parsed.hero) {
      generatedPage.sections.hero = parsed.hero;
    }
    if (sections.pain && parsed.pain) {
      generatedPage.sections.pain = parsed.pain;
    }
    if (sections.solution && parsed.solution) {
      generatedPage.sections.solution = parsed.solution;
    }
    if (sections.modules && (parsed.modules || productData.modules)) {
      generatedPage.sections.modules = parsed.modules || {
        title: isPT ? "O Que Você Vai Encontrar" : "What You'll Get",
        chapters: productData.modules || [],
      };
    }
    if (sections.bonuses && (parsed.bonuses || productData.bonuses)) {
      generatedPage.sections.bonuses = parsed.bonuses || {
        title: isPT ? "Bônus Exclusivos" : "Exclusive Bonuses",
        items: productData.bonuses?.map(b => ({ icon: "🎁", title: b.title, description: b.description, value: b.value || "" })) || [],
      };
    }
    if (sections.testimonials && (parsed.testimonials || productData.testimonials)) {
      generatedPage.sections.testimonials = parsed.testimonials || {
        title: isPT ? "O Que Estão Dizendo" : "What They're Saying",
        items: productData.testimonials || [],
      };
    }
    if (sections.guarantee && (parsed.guarantee || productData.guaranteeDays)) {
      generatedPage.sections.guarantee = parsed.guarantee || {
        title: isPT ? "Garantia Incondicional" : "Unconditional Guarantee",
        description: isPT 
          ? `Estamos tão confiantes neste produto que oferecemos ${productData.guaranteeDays || 7} dias para você testar. Se não gostar, devolvemos 100% do seu dinheiro.`
          : `We're so confident in this product that we offer ${productData.guaranteeDays || 7} days for you to try it. If you don't like it, we refund 100% of your money.`,
        days: productData.guaranteeDays || 7,
      };
    }
    if (sections.faq && (parsed.faq || productData.faq)) {
      generatedPage.sections.faq = parsed.faq || {
        title: isPT ? "Perguntas Frequentes" : "Frequently Asked Questions",
        items: productData.faq || [],
      };
    }
    if (sections.offer) {
      generatedPage.sections.offer = parsed.offer || {
        price: productData.price,
        originalPrice: productData.originalPrice,
        ctaText: productData.ctaText || (isPT ? "Quero Garantir Meu Acesso Agora" : "Get Instant Access Now"),
        urgencyText: isPT 
          ? "Oferta por tempo limitado. Não perca!"
          : "Limited time offer. Don't miss out!",
      };
    }
    if (templateType === "checkout" && parsed.checkout) {
      generatedPage.sections.checkout = parsed.checkout;
    }
    if (templateType === "thankyou" && parsed.thankyou) {
      generatedPage.sections.thankyou = parsed.thankyou;
    }

    return { success: true, data: generatedPage };
  } catch (error: unknown) {
    console.error("Error generating template sales page:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao gerar página de vendas.",
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

export async function saveTemplateSalesPage(
  page: GeneratedSalesPage,
  projectName: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  return await saveGenerationToDatabase(
    projectName || `Sales Page - ${page.templateType}`,
    "sales-page-template",
    { templateType: page.templateType, productName: page.metadata.productName },
    page
  );
}
