"use server";

import fs from "fs";
import path from "path";
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

// Map each genre to the storytelling specialists story-chief would route to
const GENRE_SPECIALISTS: Record<string, string> = {
  Romance:
    "Kindra Hall (strategic stories with emotional truth, vulnerability, customer connection) and Matthew Dicks (personal narrative, finding the hidden story within ordinary moments).",
  Thriller:
    "Blake Snyder (beat sheet, genre conventions, commercial structure, save the cat moments) and Shawn Coyne (story editing, value shifts from positive to negative across scenes, editorial rigor).",
  Fantasia:
    "Joseph Campbell (hero's journey, mythic archetypes, the call to adventure, threshold crossings) and Dan Harmon (story circle, character transformation through want→need→change).",
  Autoajuda:
    "Park Howell (Brand Story Cycle, ABT framework: And→But→Therefore) and Nancy Duarte (audience as hero, transformation from 'what is' to 'what could be', data narrative).",
  Contos:
    "Matthew Dicks (finding and crafting personal true stories, the 'homework for life' method) and Keith Johnstone (spontaneity, status games, improv narrative, embracing the unexpected).",
};

function loadStoryChief(): { activation: string; principles: string } {
  try {
    const mdPath = path.join(process.cwd(), "public", "agents", "storytelling", "story-chief.md");
    const content = fs.readFileSync(mdPath, "utf-8");

    const activationMatch = content.match(/>\s*ACTIVATION-NOTICE:\s*(.+)/);
    const activation = activationMatch?.[1]?.trim() ?? "";

    const principlesBlock = content.match(/core_principles:\n([\s\S]*?)(?:\n\w|\nsignature_vocabulary|$)/);
    const principles = principlesBlock
      ? principlesBlock[1]
          .split("\n")
          .filter((l) => l.trim().startsWith("- "))
          .map((l) => l.replace(/^\s*-\s*"?/, "").replace(/"$/, "").trim())
          .join("\n")
      : "";

    return { activation, principles };
  } catch {
    return { activation: "", principles: "" };
  }
}

export async function generateBook(
  params: GenerateBookParams
): Promise<{ success: boolean; data?: BookResult; error?: string }> {
  try {
    const { activation, principles } = loadStoryChief();
    const specialist = GENRE_SPECIALISTS[params.genre] ?? "a master narrative craftsman";

    const genreInstructions: Record<string, string> = {
      Romance:
        "Focus on emotional connections, relationships, and personal growth. Include vivid descriptions of feelings, tension, and heartfelt moments.",
      Thriller:
        "Build suspense, tension, and unexpected twists. Include fast-paced scenes, cliffhangers, and psychological depth.",
      Fantasia:
        "Create a rich world with unique rules, magical elements, epic quests, and memorable characters. World-building is essential.",
      Autoajuda:
        "Provide practical advice, real-world examples, and actionable steps. Use an empathetic, motivational tone.",
      Contos:
        "Write vivid, self-contained short stories within each chapter that share a common theme. Each chapter can be an independent tale.",
    };

    const genreGuidance = genreInstructions[params.genre] ?? "";

    const systemPrompt = `${activation}

As Story Chief, you are routing this book generation to the narrative specialists: ${specialist}

Apply their combined storytelling frameworks to produce chapters of exceptional narrative quality.

STORY CHIEF CORE PRINCIPLES:
${principles}

---

GENRE: ${params.genre}
GENRE GUIDANCE: ${genreGuidance}

YOUR TASK: Write a COMPLETE, FULLY WRITTEN book manuscript — not an outline or summary.

CRITICAL REQUIREMENTS:
1. The "content" field of EACH chapter must contain the ACTUAL FULL WRITTEN TEXT — minimum 800 words of real prose per chapter.
2. Do NOT write descriptions or outlines. Write the actual content as it would appear in the published book.
3. Each chapter must have: an opening hook, developed scenes/ideas, internal subtitles, and a closing that connects to the next chapter.
4. The synopsis must be 150-200 words, compelling and market-ready.
5. Apply the specialist frameworks above: structure, emotional truth, character arcs, and narrative transformation must be present in every chapter.

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
      temperature: 0.85,
      max_tokens: 16000,
    });

    const parsed = parseOpenAIResponse<BookResult>(response.choices[0].message.content);
    return { success: true, data: parsed };
  } catch (error: any) {
    console.error("Error generating book:", error);
    return { success: false, error: "Falha ao gerar o livro. Tente novamente." };
  }
}

export async function generateBookCover(
  title: string,
  genre: string,
  synopsis: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const genreStyle: Record<string, string> = {
      Romance:
        "romantic, warm golden tones, soft bokeh, couple silhouettes, elegant typography space, emotional and intimate atmosphere",
      Thriller:
        "dark cinematic, dramatic shadows, high contrast, suspenseful atmosphere, noir aesthetic, urban or isolated setting",
      Fantasia:
        "epic fantasy art, magical landscape, dramatic sky, glowing elements, mythic and otherworldly atmosphere, painterly style",
      Autoajuda:
        "clean modern design, inspirational, bold colors, minimalist with motivational visual metaphor, professional and uplifting",
      Contos:
        "illustrated storybook style, whimsical, rich textures, warm colors, artistic and literary aesthetic",
    };

    const style = genreStyle[genre] ?? "professional book cover, cinematic composition, dramatic lighting";
    const shortSynopsis = synopsis.slice(0, 180);

    const prompt = `Professional book cover design for a ${genre} book titled "${title}". ${style}. Theme: ${shortSynopsis}. High quality digital art, no text overlaid, portrait orientation, dramatic composition, suitable for commercial publishing.`;

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1792",
      quality: "standard",
    });

    const url = response.data[0]?.url;
    if (!url) throw new Error("No image URL returned");

    return { success: true, url };
  } catch (error: any) {
    console.error("Error generating book cover:", error);
    return { success: false, error: "Falha ao gerar a capa. Tente novamente." };
  }
}

export async function getImageAsBase64(url: string): Promise<string> {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");
  return `data:image/png;base64,${base64}`;
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
