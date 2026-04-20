"use server";

import { openai, DEFAULT_MODEL, parseOpenAIResponse } from "@/lib/openai";
import { saveGenerationToDatabase } from "@/lib/projects";

export type IdeaValidationResult = {
  demandScore: number;
  competitionScore: number;
  monetizationScore: number;
  audienceClarityScore: number;
  viralityScore: number;
  overallViabilityScore: number;
  demandFeedback: string;
  competitionFeedback: string;
  monetizationFeedback: string;
  audienceFeedback: string;
  viralityFeedback: string;
  overallFeedback: string;
};

export type ValidateIdeaParams = {
  ideaDescription: string;
  targetAudience: string;
  pricePoint: string;
  country: string;
  language: string;
};

export async function validateIdea(
  params: ValidateIdeaParams
): Promise<{ success: boolean; data?: IdeaValidationResult; error?: string }> {
  try {
    const systemPrompt = `You are a ruthless, data-driven AI startup advisor and market analyst.
Your job is to critically evaluate a product idea out of 100 based on core metrics.

You MUST format your response as a valid JSON object matching this exact schema:
{
  "demandScore": <number 0-100>,
  "competitionScore": <number 0-100, where 100 is high competition (red ocean) and 0 is no competition>,
  "monetizationScore": <number 0-100>,
  "audienceClarityScore": <number 0-100>,
  "viralityScore": <number 0-100>,
  "overallViabilityScore": <number 0-100>,
  "demandFeedback": "Brief paragraph explaining the demand score",
  "competitionFeedback": "Brief paragraph explaining the competition landscape",
  "monetizationFeedback": "Brief paragraph predicting revenue friction",
  "audienceFeedback": "Brief paragraph on the defined audience",
  "viralityFeedback": "Brief paragraph on organic growth potential",
  "overallFeedback": "Your brutal, honest summary recommendation: Pivot or Proceed?"
}

CRITICAL RULES:
1. Language: All text fields MUST be returned natively in ${params.language}.
2. Context: Relate your feedback to the market behavior, purchasing power, and competition in ${params.country}. Be realistic about the ${params.pricePoint} price tag for this specific country.
3. Only return the JSON object. No other text.`;

    const userPrompt = `Please validate this product idea:
- Core Concept: ${params.ideaDescription}
- Intended Audience: ${params.targetAudience}
- Proposed Price Point: ${params.pricePoint}`;

    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.6,
    });

    const parsed = parseOpenAIResponse<IdeaValidationResult>(response.choices[0].message.content);

    return {
      success: true,
      data: parsed,
    };
  } catch (error: unknown) {
    console.error("Error validating idea:", error);
    return {
      success: false,
      error: "An unexpected error occurred while running the validation scan.",
    };
  }
}

export async function saveValidationToProject(
  result: IdeaValidationResult, 
  ideaName: string, 
  params: ValidateIdeaParams
) {
  const name = ideaName && ideaName.trim() ? ideaName : "Idea Validation Tests";
  return await saveGenerationToDatabase(
    name,
    "idea-validator",
    { ideaDescription: params.ideaDescription, targetAudience: params.targetAudience, pricePoint: params.pricePoint },
    result
  );
}
