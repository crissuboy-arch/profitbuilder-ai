"use server";

import { openai, DEFAULT_MODEL, parseOpenAIResponse } from "@/lib/openai";
import { saveGenerationToDatabase } from "@/lib/projects";

export type BookChapter = {
  title: string;
  content: string;
};

export type BookResult = {
  title: string;
  synopsis: string;
  chapters: BookChapter[];
};

export type GenerateBookParams = {
  language: string;
  genre: string;
  theme: string;
};

export async function generateBook(
  params: GenerateBookParams
): Promise<{ success: boolean; data?: BookResult; error?: string }> {
  try {
    const genreInstructions: Record<string, string> = {
      Romance: "Focus on emotional connections, relationships, and personal growth. Include vivid descriptions of feelings, tension, and heartfelt moments.",
      Thriller: "Build suspense, tension, and unexpected twists. Include fast-paced scenes, cliffhangers, and psychological depth.",
      Fantasia: "Create a rich world with unique rules, magical elements, epic quests, and memorable characters. World-building is essential.",
      Autoajuda: "Provide practical advice, real-world examples, and actionable steps. Use an empathetic, motivational tone.",
      Contos: "Write vivid, self-contained short stories within each chapter that share a common theme. Each chapter can be an independent tale.",
    };

    const genreGuidance = genreInstructions[params.genre] ?? "";

    const systemPrompt = `You are a world-class author specialized in ${params.genre} books.
Your task is to write a COMPLETE, FULLY WRITTEN book manuscript — not an outline or summary.

GENRE GUIDANCE:
${genreGuidance}

CRITICAL REQUIREMENTS:
1. The "content" field of EACH chapter must contain the ACTUAL FULL WRITTEN TEXT — minimum 800 words of real prose per chapter.
2. Do NOT write descriptions or outlines. Write the actual content as it would appear in the published book.
3. Each chapter must have: an opening hook, developed scenes/ideas, internal subtitles, and a closing that connects to the next chapter.
4. The synopsis must be 150-200 words, compelling and market-ready.

Return ONLY a valid JSON object:
{
  "title": "The compelling book title",
  "synopsis": "150-200 word market-ready synopsis",
  "chapters": [
    {
      "title": "Chapter 1: Evocative Title",
      "content": "Full 800+ word chapter text with paragraphs, internal subtitles, and rich narrative"
    }
  ]
}

ABSOLUTE RULES:
1. ALL text MUST be written natively in ${params.language}. Never mix languages.
2. Genre: ${params.genre} — honor the genre conventions fully.
3. Include EXACTLY 10 chapters in the chapters array.
4. Return ONLY the JSON object — no markdown fences, no extra text.`;

    const userPrompt = `Write a complete ${params.genre} book about the following theme: ${params.theme}`;

    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.8,
      max_tokens: 16000,
    });

    const parsed = parseOpenAIResponse<BookResult>(response.choices[0].message.content);
    return { success: true, data: parsed };
  } catch (error: any) {
    console.error("Error generating book:", error);
    return { success: false, error: "Falha ao gerar o livro. Tente novamente." };
  }
}

export async function saveBookToProject(result: BookResult, projectName: string) {
  const name = projectName && projectName.trim() ? projectName : "Livros Gerados";
  return await saveGenerationToDatabase(
    name,
    "book-generator",
    { title: result.title.substring(0, 50) },
    result
  );
}
