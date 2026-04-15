"use server";

import fs from "fs";
import path from "path";
import { openai, DEFAULT_MODEL } from "@/lib/openai";
import { saveGenerationToDatabase } from "@/lib/projects";

// ── Types ─────────────────────────────────────────────────────────────────────

export type BookBlock = {
  type: "heading" | "bullet" | "paragraph";
  text: string;
};

export type BookChapter = {
  number: number;
  title: string;
  imageDesc: string;
  blocks: BookBlock[];
};

export type BookResult = {
  title: string;
  subtitle: string;
  author: string;
  synopsis: string;
  chapters: BookChapter[];
};

export type GenerateBookParams = {
  language: string;
  genre: string;
  theme: string;
};

// ── Story Chief integration ───────────────────────────────────────────────────

const GENRE_SPECIALISTS: Record<string, string> = {
  Romance:
    "Kindra Hall (strategic stories with emotional truth) and Matthew Dicks (personal narrative, vulnerability, finding the hidden story).",
  Thriller:
    "Blake Snyder (beat sheet, commercial structure, save-the-cat moments) and Shawn Coyne (story editing, value shifts, editorial rigor).",
  Fantasia:
    "Joseph Campbell (hero's journey, mythic archetypes, threshold crossings) and Dan Harmon (story circle, character transformation).",
  Autoajuda:
    "Park Howell (Brand Story Cycle, ABT: And→But→Therefore) and Nancy Duarte (audience as hero, transformation narrative).",
  Contos:
    "Matthew Dicks (homework for life method, finding stories in ordinary moments) and Keith Johnstone (spontaneity, status, improv narrative).",
  "Romance de Mafia":
    "Kindra Hall (forbidden desire and emotional stakes) and Blake Snyder (save-the-cat anti-hero, dark beat sheet, moral ambiguity).",
  "CEO Romance":
    "Kindra Hall (power dynamics and emotional vulnerability) and Oren Klaff (frame control, status, high-stakes negotiation as romantic tension).",
  "Dark Romance":
    "Shawn Coyne (value shifts from positive to deeply negative, moral complexity) and Matthew Dicks (raw emotional truth, taboo personal narrative).",
  "Suspense Romântico":
    "Blake Snyder (thriller structure, tension beats, ticking clock) and Kindra Hall (romantic emotional core woven into suspense escalation).",
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

// ── Book generation ───────────────────────────────────────────────────────────

export async function generateBook(
  params: GenerateBookParams
): Promise<{ success: boolean; data?: BookResult; error?: string }> {
  try {
    const { activation, principles } = loadStoryChief();
    const specialist = GENRE_SPECIALISTS[params.genre] ?? "a master narrative craftsman";

    const genreGuidance: Record<string, string> = {
      Romance:
        "Focus on emotional connections, relationships, personal growth. Include vivid descriptions of feelings, tension, and heartfelt moments.",
      Thriller:
        "Build suspense, tension, and unexpected twists. Include fast-paced scenes, cliffhangers, and psychological depth.",
      Fantasia:
        "Create a rich world with unique rules, magical elements, epic quests, and memorable characters. World-building is essential.",
      Autoajuda:
        "Provide practical advice, real-world examples, and actionable steps in each chapter. Use an empathetic, motivational tone.",
      Contos:
        "Write vivid self-contained stories per chapter sharing a common theme. Each chapter is an independent tale.",
      "Romance de Mafia":
        "Write a forbidden romance set in the criminal underworld. The hero is a powerful, dangerous mafia boss; the heroine is drawn into his world against her will but falls irresistibly. Include power imbalance, protection, possessiveness, moral greyness, steamy tension, and loyalty-above-all. Style: Brazilian Dreame/99Novels popular romance — fast-paced chapters, cliffhangers, intense emotions.",
      "CEO Romance":
        "Write an enemies-to-lovers or forced-proximity romance between an arrogant billionaire CEO and a strong-willed heroine. Include corporate power dynamics, lavish settings, jealousy, misunderstandings, and irresistible chemistry. Style: Brazilian Dreame/99Novels popular romance — addictive chapter hooks, banter, steamy tension, emotional declarations.",
      "Dark Romance":
        "Write a dark, morally complex romance that explores obsession, captivity, anti-hero love interests, and twisted devotion. The relationship begins with conflict and darkness but evolves into fierce, consuming love. Include trigger-worthy tension, psychological complexity, and cathartic emotional payoff. Style: Brazilian Dreame dark romance readers — no fade-to-black, raw emotions, villain love interest.",
      "Suspense Romântico":
        "Write a romantic suspense where the couple must solve a danger/mystery while falling in love. Include thriller plot twists, a ticking-clock threat, and a slow-burn romance that ignites under pressure. Style: Brazilian Dreame suspense romance — alternating POVs, chapter cliffhangers, danger + desire on every page.",
    };

    const systemPrompt = `${activation}

As Story Chief, routing to specialists: ${specialist}

STORY CHIEF PRINCIPLES:
${principles}

GENRE: ${params.genre}
GUIDANCE: ${genreGuidance[params.genre] ?? ""}
LANGUAGE: ${params.language}

Return ONLY a valid JSON object with EXACTLY this structure:
{
  "title": "Compelling book title",
  "subtitle": "One-line descriptive subtitle",
  "author": "Fictional author name appropriate to the genre and language",
  "synopsis": "150-200 word compelling synopsis for the back cover",
  "chapters": [
    {
      "number": 1,
      "title": "Chapter title without the word Chapter",
      "imageDesc": "Detailed visual scene for DALL-E 3 illustration. No text. Realistic/painterly style. Max 120 words.",
      "blocks": [
        {"type": "heading", "text": "Introdução"},
        {"type": "paragraph", "text": "Opening hook paragraph — minimum 80 words of actual prose"},
        {"type": "heading", "text": "Desenvolvimento"},
        {"type": "bullet", "text": "First key point or example — fully written"},
        {"type": "bullet", "text": "Second key point or example — fully written"},
        {"type": "bullet", "text": "Third key point with practical insight"},
        {"type": "heading", "text": "Conclusão"},
        {"type": "paragraph", "text": "Closing reflection that connects to the next chapter — minimum 60 words"}
      ]
    }
  ]
}

ABSOLUTE RULES:
1. ALL text in ${params.language} — never mix languages.
2. EXACTLY 10 chapters.
3. Each chapter MUST have blocks in this order: heading(Introdução) → paragraph → heading(Desenvolvimento) → 3+ bullets → heading(Conclusão) → paragraph.
4. "imageDesc" must be a vivid scene, NO text/letters in the image.
5. Return ONLY the JSON — no markdown fences, no extra text.`;

    const userPrompt = `Write a complete ${params.genre} book about: ${params.theme}`;

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

    const content = response.choices[0].message.content;
    if (!content) throw new Error("No content received");

    let clean = content.trim();
    if (clean.startsWith("```")) clean = clean.replace(/^```[a-z]*\n?/, "").replace(/```$/, "").trim();

    const parsed = JSON.parse(clean) as BookResult;
    return { success: true, data: parsed };
  } catch (error: any) {
    console.error("Error generating book:", error);
    return { success: false, error: "Falha ao gerar o livro. Tente novamente." };
  }
}

// ── Image generation ──────────────────────────────────────────────────────────

async function fetchAsBase64(url: string): Promise<string> {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  return `data:image/png;base64,${Buffer.from(buffer).toString("base64")}`;
}

export async function generateBookCover(
  title: string,
  subtitle: string,
  author: string,
  genre: string
): Promise<{ success: boolean; base64?: string; error?: string }> {
  try {
    const genreStyle: Record<string, string> = {
      Romance:
        "romantic, warm golden tones, soft bokeh, elegant intimate atmosphere, couples motif, inspirational",
      Thriller:
        "dark cinematic, dramatic shadows, high contrast noir, suspenseful, urban or isolated setting",
      Fantasia:
        "epic fantasy art, magical landscape, dramatic glowing sky, mythic otherworldly atmosphere, painterly",
      Autoajuda:
        "clean modern inspirational, bold warm colors, minimalist visual metaphor, professional uplifting",
      Contos:
        "illustrated storybook style, whimsical, rich textures, warm colors, literary artistic aesthetic",
      "Romance de Mafia":
        "Brazilian Dreame romance cover style: brooding dark-haired mafia boss in expensive suit, dramatic chiaroscuro lighting, deep red and black palette, rose petals, gun or rose as symbol, cinematic atmosphere, intense magnetic gaze, luxury and danger combined, moody editorial photography style",
      "CEO Romance":
        "Brazilian Dreame CEO romance cover style: tall attractive billionaire in tailored suit, city skyline at night or luxury penthouse, gold and navy palette, confident powerful stance, beautiful heroine in elegant dress, glamorous aspirational aesthetic, high-fashion editorial photography feel, warm bokeh city lights",
      "Dark Romance":
        "Brazilian Dreame dark romance cover style: dramatic contrast between light and shadow, anti-hero with intense dangerous eyes, dark floral motifs — black roses, ravens, chains as ornamental elements, deep crimson and obsidian palette, gothic elegant aesthetic, tension and forbidden desire atmosphere, cinematic dark fantasy photography style",
      "Suspense Romântico":
        "Brazilian Dreame romantic suspense cover style: couple in dangerous situation, thriller atmosphere with romantic tension, muted teal and burgundy palette, motion blur or dramatic silhouettes, urban noir setting, rain-slicked streets or shadowy corridor, sense of urgency and hidden desire, cinematic thriller poster aesthetic",
    };
    const style = genreStyle[genre] ?? "professional book cover, cinematic dramatic lighting";
    const prompt = `Professional publishing-quality book cover for "${title}" by ${author}. Subtitle: "${subtitle}". Style: ${style}. Portrait orientation. Large clear space at top for title text, bottom for author name. No text, no letters, no words anywhere in the image. High quality digital art.`;

    const resp = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1792",
      quality: "hd",
    });

    const url = resp.data[0]?.url;
    if (!url) throw new Error("No URL returned");

    const base64 = await fetchAsBase64(url);
    return { success: true, base64 };
  } catch (error: any) {
    console.error("generateBookCover error:", error);
    return { success: false, error: "Falha ao gerar a capa." };
  }
}

export async function generateChapterImage(
  chapterNumber: number,
  chapterTitle: string,
  imageDesc: string,
  genre: string
): Promise<{ success: boolean; base64?: string; error?: string }> {
  try {
    const desc = imageDesc?.trim() || `Scene from chapter ${chapterNumber}: ${chapterTitle}`;
    const prompt = `Book illustration for a ${genre} book, chapter ${chapterNumber} titled "${chapterTitle}". Scene: ${desc} Warm realistic style, publishing quality. No text, no letters, no words in the image.`;

    const resp = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1792x1024",
      quality: "hd",
    });

    const url = resp.data[0]?.url;
    if (!url) throw new Error("No URL returned");

    const base64 = await fetchAsBase64(url);
    return { success: true, base64 };
  } catch (error: any) {
    console.error(`generateChapterImage error (ch.${chapterNumber}):`, error);
    return { success: false, error: `Falha ao gerar imagem do capítulo ${chapterNumber}.` };
  }
}

// ── Save ──────────────────────────────────────────────────────────────────────

export async function saveBookToProject(result: BookResult, projectName: string) {
  const name = projectName?.trim() || "Livros Gerados";
  return await saveGenerationToDatabase(
    name,
    "book-generator",
    { title: result.title.substring(0, 50) },
    result
  );
}
