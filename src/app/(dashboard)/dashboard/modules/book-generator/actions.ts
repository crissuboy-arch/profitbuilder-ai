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
  authorName?: string;
  pageSize?: number;
};

export type ImproveMode = "spelling" | "expand" | "reformat" | "rewrite";

export type ImproveBookParams = {
  originalText: string;
  improveMode: ImproveMode;
  genre: string;
  language: string;
  authorName?: string;
  pageSize?: number;
};

// ── Page-size → chapter config ────────────────────────────────────────────────

const PAGE_CONFIG: Record<number, { chapters: number; minWords: number }> = {
  10:  { chapters: 3,  minWords: 350 },
  20:  { chapters: 5,  minWords: 500 },
  30:  { chapters: 8,  minWords: 600 },
  60:  { chapters: 10, minWords: 900 },
  80:  { chapters: 12, minWords: 1100 },
  120: { chapters: 15, minWords: 1400 },
};

function getPageConfig(pageSize = 60) {
  return PAGE_CONFIG[pageSize] ?? PAGE_CONFIG[60];
}

// ── Story Chief integration ───────────────────────────────────────────────────

const GENRE_SPECIALISTS: Record<string, string> = {
  Romance:
    "Kindra Hall (strategic stories with emotional truth) and Matthew Dicks (personal narrative, vulnerability).",
  Thriller:
    "Blake Snyder (beat sheet, commercial structure) and Shawn Coyne (story editing, value shifts).",
  Fantasia:
    "Joseph Campbell (hero's journey, mythic archetypes) and Dan Harmon (story circle, character transformation).",
  Autoajuda:
    "Park Howell (Brand Story Cycle, ABT framework) and Nancy Duarte (audience as hero, transformation narrative).",
  Contos:
    "Matthew Dicks (homework for life method) and Keith Johnstone (spontaneity, status, improv narrative).",
  "Romance de Mafia":
    "Kindra Hall (forbidden desire and emotional stakes) and Blake Snyder (dark beat sheet, moral ambiguity).",
  "CEO Romance":
    "Kindra Hall (power dynamics and emotional vulnerability) and Oren Klaff (frame control, status as romantic tension).",
  "Dark Romance":
    "Shawn Coyne (value shifts, moral complexity) and Matthew Dicks (raw emotional truth, taboo personal narrative).",
  "Suspense Romântico":
    "Blake Snyder (thriller structure, tension beats) and Kindra Hall (romantic emotional core woven into suspense).",
};

const GENRE_GUIDANCE: Record<string, string> = {
  Romance:
    "Focus on emotional connections, relationships, personal growth. Include vivid descriptions of feelings, tension, and heartfelt moments.",
  Thriller:
    "Build suspense, tension, and unexpected twists. Include fast-paced scenes, cliffhangers, and psychological depth.",
  Fantasia:
    "Create a rich world with unique rules, magical elements, epic quests, and memorable characters.",
  Autoajuda:
    "Provide practical advice, real-world examples, and actionable steps. Empathetic, motivational tone.",
  Contos:
    "Write vivid self-contained stories per chapter sharing a common theme.",
  "Romance de Mafia":
    "Forbidden romance in the criminal underworld. Powerful dangerous mafia boss × strong heroine. Power imbalance, possessiveness, moral greyness, steamy tension. Dreame/99Novels style — fast-paced, cliffhanger chapters.",
  "CEO Romance":
    "Enemies-to-lovers or forced-proximity between arrogant billionaire CEO and strong heroine. Corporate power dynamics, jealousy, irresistible chemistry. Dreame style — addictive hooks, banter, steamy tension.",
  "Dark Romance":
    "Obsession, anti-hero love interest, twisted devotion. Relationship begins dark but evolves into consuming love. Raw emotions, no fade-to-black, villain love interest. Dreame dark romance style.",
  "Suspense Romântico":
    "Couple must solve a danger/mystery while falling in love. Thriller twists, ticking-clock threat, slow-burn romance. Dreame suspense romance — alternating POVs, chapter cliffhangers.",
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

// ── Shared prompt builder ─────────────────────────────────────────────────────

function buildSystemPrompt(genre: string, language: string, pageSize: number, authorName?: string) {
  const { activation, principles } = loadStoryChief();
  const specialist = GENRE_SPECIALISTS[genre] ?? "a master narrative craftsman";
  const guidance = GENRE_GUIDANCE[genre] ?? "";
  const { chapters, minWords } = getPageConfig(pageSize);
  const authorLine = authorName ? `Author: ${authorName}` : 'Author: Create a fitting fictional author name for the genre';

  return `${activation}

As Story Chief, routing to specialists: ${specialist}

STORY CHIEF PRINCIPLES:
${principles}

GENRE: ${genre}
GUIDANCE: ${guidance}
LANGUAGE: ${language}
${authorLine}
TARGET: ~${pageSize} pages (${chapters} chapters, minimum ${minWords} words per chapter body)

Return ONLY a valid JSON object:
{
  "title": "Compelling book title",
  "subtitle": "One-line descriptive subtitle",
  "author": "${authorName || "Fitting author name for genre/language"}",
  "synopsis": "150-200 word compelling synopsis",
  "chapters": [
    {
      "number": 1,
      "title": "Chapter title",
      "imageDesc": "Vivid visual scene for DALL-E 3. No text. Realistic/painterly. Max 120 words.",
      "blocks": [
        {"type": "heading", "text": "Introdução"},
        {"type": "paragraph", "text": "Opening hook — minimum ${Math.round(minWords * 0.2)} words"},
        {"type": "heading", "text": "Desenvolvimento"},
        {"type": "bullet", "text": "Key point or scene — fully written"},
        {"type": "bullet", "text": "Second point or scene — fully written"},
        {"type": "bullet", "text": "Third point with insight"},
        {"type": "heading", "text": "Conclusão"},
        {"type": "paragraph", "text": "Closing that connects to next chapter — minimum ${Math.round(minWords * 0.15)} words"}
      ]
    }
  ]
}

ABSOLUTE RULES:
1. ALL text in ${language} — never mix languages.
2. EXACTLY ${chapters} chapters.
3. Each chapter MUST have blocks: heading(Introdução)→paragraph→heading(Desenvolvimento)→3+ bullets→heading(Conclusão)→paragraph.
4. "imageDesc" must be a vivid scene, NO text/letters.
5. Return ONLY the JSON — no markdown fences.`;
}

// ── Generate from scratch ─────────────────────────────────────────────────────

export async function generateBook(
  params: GenerateBookParams
): Promise<{ success: boolean; data?: BookResult; error?: string }> {
  try {
    const { language, genre, theme, authorName, pageSize = 60 } = params;
    const systemPrompt = buildSystemPrompt(genre, language, pageSize, authorName);
    const userPrompt = `Write a complete ${genre} book about: ${theme}`;

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

    const raw = response.choices[0].message.content ?? "";
    const clean = raw.trim().replace(/^```[a-z]*\n?/, "").replace(/```$/, "").trim();
    const parsed = JSON.parse(clean) as BookResult;
    return { success: true, data: parsed };
  } catch (error: any) {
    console.error("generateBook error:", error);
    return { success: false, error: "Falha ao gerar o livro. Tente novamente." };
  }
}

// ── Improve / rewrite from extracted PDF text ─────────────────────────────────

export async function improveBookFromText(
  params: ImproveBookParams
): Promise<{ success: boolean; data?: BookResult; error?: string }> {
  try {
    const { originalText, improveMode, genre, language, authorName, pageSize = 60 } = params;

    const modeInstructions: Record<ImproveMode, string> = {
      spelling:
        "Correct only spelling, grammar, and punctuation errors. Keep all content, structure, and wording as close to the original as possible. Do NOT add or remove chapters or sections.",
      expand:
        "Improve prose quality, expand thin sections, add richer descriptions and dialogue. You may add up to 30% more content per chapter but keep the original story and structure.",
      reformat:
        "Keep the original text as-is. Only reformat it into the required JSON structure with the exact blocks format (heading/bullet/paragraph). Do not change any words.",
      rewrite:
        "Completely rewrite the book in a new, more compelling and marketable style for the chosen genre, language, and Dreame/99Novels audience. Keep the core story premise but elevate everything.",
    };

    const systemPrompt = `${buildSystemPrompt(genre, language, pageSize, authorName)}

MODE: ${modeInstructions[improveMode]}

You are working from an EXISTING manuscript. Apply the mode instructions above to this manuscript text.`;

    const truncated = originalText.length > 12000 ? originalText.slice(0, 12000) + "\n\n[...text truncated...]" : originalText;
    const userPrompt = `Here is the original manuscript text:\n\n${truncated}`;

    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: improveMode === "reformat" ? 0.2 : 0.75,
      max_tokens: 16000,
    });

    const raw = response.choices[0].message.content ?? "";
    const clean = raw.trim().replace(/^```[a-z]*\n?/, "").replace(/```$/, "").trim();
    const parsed = JSON.parse(clean) as BookResult;
    return { success: true, data: parsed };
  } catch (error: any) {
    console.error("improveBookFromText error:", error);
    return { success: false, error: "Falha ao processar o livro. Tente novamente." };
  }
}

// ── Image generation ──────────────────────────────────────────────────────────

async function fetchAsBase64(url: string): Promise<string> {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  return `data:image/png;base64,${Buffer.from(buffer).toString("base64")}`;
}

const COVER_STYLES: Record<string, string> = {
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
    "Brazilian Dreame romance cover: brooding dark-haired mafia boss in expensive suit, dramatic chiaroscuro lighting, deep red and black palette, rose petals or gun as symbol, cinematic, luxury and danger combined, moody editorial photography",
  "CEO Romance":
    "Brazilian Dreame CEO romance cover: tall attractive billionaire in tailored suit, city skyline at night or luxury penthouse, gold and navy palette, confident powerful stance, glamorous aspirational aesthetic, high-fashion editorial photography, warm bokeh city lights",
  "Dark Romance":
    "Brazilian Dreame dark romance cover: dramatic contrast light and shadow, anti-hero with intense dangerous eyes, dark floral motifs — black roses and chains as ornamental elements, deep crimson and obsidian palette, gothic elegant aesthetic, tension and forbidden desire, cinematic dark fantasy photography",
  "Suspense Romântico":
    "Brazilian Dreame romantic suspense cover: couple in dangerous situation, thriller atmosphere with romantic tension, muted teal and burgundy palette, motion blur or dramatic silhouettes, urban noir setting, rain-slicked streets, sense of urgency and hidden desire, cinematic thriller poster",
};

export async function generateBookCover(
  title: string,
  subtitle: string,
  author: string,
  genre: string
): Promise<{ success: boolean; base64?: string; error?: string }> {
  try {
    const style = COVER_STYLES[genre] ?? "professional book cover, cinematic dramatic lighting";
    const prompt = `Professional publishing-quality book cover for "${title}" by ${author}. Subtitle: "${subtitle}". Style: ${style}. Portrait orientation. Large clear space at top for title text, bottom for author name. No text, no letters, no words anywhere. High quality digital art.`;

    const resp = await openai.images.generate({
      model: "dall-e-3", prompt, n: 1, size: "1024x1792", quality: "hd",
    });

    const url = resp.data?.[0]?.url;
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
  genre: string,
  playbookStyle = false
): Promise<{ success: boolean; base64?: string; error?: string }> {
  try {
    const desc = imageDesc?.trim() || `Scene from chapter ${chapterNumber}: ${chapterTitle}`;
    const styleNote = playbookStyle
      ? "Dark anime/manga illustration style, dramatic lighting, cel-shaded, cinematic panel composition, deep shadows, vibrant accent colors on black background."
      : `Book illustration for a ${genre} book. Warm realistic style, publishing quality.`;

    const prompt = `${styleNote} Chapter ${chapterNumber}: "${chapterTitle}". Scene: ${desc} No text, no letters, no words.`;

    const resp = await openai.images.generate({
      model: "dall-e-3", prompt, n: 1, size: "1792x1024", quality: "hd",
    });

    const url = resp.data?.[0]?.url;
    if (!url) throw new Error("No URL returned");
    const base64 = await fetchAsBase64(url);
    return { success: true, base64 };
  } catch (error: any) {
    console.error(`generateChapterImage error (ch.${chapterNumber}):`, error);
    return { success: false, error: `Falha na imagem do capítulo ${chapterNumber}.` };
  }
}

// ── Save ──────────────────────────────────────────────────────────────────────

export async function saveBookToProject(result: BookResult, projectName: string) {
  const name = projectName?.trim() || "Livros Gerados";
  return await saveGenerationToDatabase(
    name, "book-generator",
    { title: result.title.substring(0, 50) },
    result
  );
}
