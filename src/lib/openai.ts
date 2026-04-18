import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const DEFAULT_MODEL = "gpt-4o";

/**
 * Safely parse a JSON string from OpenAI completions,
 * removing optional markdown code blocks if the model includes them.
 */
export function parseOpenAIResponse<T>(content: string | null): T {
  if (!content) {
    throw new Error("No content received from OpenAI");
  }

  try {
    // Strip ```json and ``` wrapping if it exists
    let cleanedContent = content.trim();
    if (cleanedContent.startsWith("```json")) {
      cleanedContent = cleanedContent.replace(/^```json\n?/, "");
    }
    if (cleanedContent.endsWith("```")) {
      cleanedContent = cleanedContent.replace(/```$/, "");
    }
    cleanedContent = cleanedContent.trim();
    
    return JSON.parse(cleanedContent) as T;
  } catch (error) {
    console.error("Failed to parse JSON content:", content);
    throw new Error("Failed to parse the structured logic from the AI.");
  }
}
