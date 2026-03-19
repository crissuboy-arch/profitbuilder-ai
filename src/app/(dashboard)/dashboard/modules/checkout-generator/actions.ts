"use server";

import { openai, DEFAULT_MODEL, parseOpenAIResponse } from "@/lib/openai";
import { saveGenerationToDatabase } from "@/lib/projects";

export type CheckoutResult = {
  checkoutStructure: string;
  orderBumps: string[];
  upsells: string[];
  downsells: string[];
  paymentPlans: string[];
  checkoutCopy: string;
  thankYouPage: string;
};

export type GenerateCheckoutParams = {
  productName: string;
  price: string;
  offerStructure: string;
  bonuses: string;
  guarantee: string;
  country: string;
  language: string;
};

export async function generateCheckout(
  params: GenerateCheckoutParams
): Promise<{ success: boolean; data?: CheckoutResult; error?: string }> {
  try {
    const systemPrompt = `You are a masterful funnel builder and conversion rate optimizer.
Your goal is to construct an optimized checkout flow maximizing Average Order Value (AOV).

You MUST format your response as a valid JSON object matching this exact schema:
{
  "checkoutStructure": "1-2 sentences describing the core design/layout recommendation.",
  "orderBumps": ["Bump 1 name and brief description", "Bump 2 name (optional)"],
  "upsells": ["Upsell 1 concept and pitch", "Upsell 2 concept (optional)"],
  "downsells": ["Downsell 1 concept for those who reject the upsell"],
  "paymentPlans": ["e.g. 1 payment of X", "e.g. 3 payments of Y"],
  "checkoutCopy": "Short, reassuring text placed right near the payment button.",
  "thankYouPage": "A script or outline of what happens on the confirmation page."
}

CRITICAL RULES:
1. Language: All text MUST be returned natively in ${params.language}.
2. Context: Tailor the payment structures (e.g. splits, local gateways), tone, currency formats, and pricing elasticity to the market in ${params.country}.
3. Formatting: Output pure JSON. Only return the JSON object.`;

    const userPrompt = `Build an entire checkout and upsell flow for the following offer:
- Product Name: ${params.productName}
- Core Price: ${params.price}
- Offer Structure: ${params.offerStructure}
- Bonuses Included: ${params.bonuses}
- Guarantee: ${params.guarantee}`;

    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const parsed = parseOpenAIResponse<CheckoutResult>(response.choices[0].message.content);

    return {
      success: true,
      data: parsed,
    };
  } catch (error: any) {
    console.error("Error generating checkout:", error);
    return {
      success: false,
      error: "An unexpected error occurred while mapping the checkout flow.",
    };
  }
}

export async function saveCheckoutToProject(result: CheckoutResult, projectName: string) {
  const name = projectName && projectName.trim() ? projectName : "Checkout Flows";
  return await saveGenerationToDatabase(
    name,
    "checkout-generator",
    { overview: result.checkoutStructure.substring(0, 50) },
    result
  );
}
