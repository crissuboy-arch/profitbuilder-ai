"use server";

import fs from "fs";
import path from "path";
import { openai, DEFAULT_MODEL } from "@/lib/openai";
import { saveGenerationToDatabase } from "@/lib/projects";
import { createClient } from "@/utils/supabase/server";

// ── Kit de Publicação Types ────────────────────────────────────────────────────

export type PublicationKit = {
  amazon?: AmazonKDPData;
  hotmart?: HotmartData;
  kiwify?: KiwifyData;
  eduzz?: EduzzData;
  gumroad?: GumroadData;
};

export type AmazonKDPData = {
  title: string;
  subtitle: string;
  description: string;
  keywords: string[];
  categories: string[];
  suggestedPriceUSD: number;
  kdpChecklist: string[];
};

export type HotmartData = {
  productTitle: string;
  salesDescription: string;
  salesPageContent: string;
  suggestedPriceBRL: number;
  registrationUrl: string;
};

export type KiwifyData = {
  productTitle: string;
  description: string;
  salesElements: string[];
  suggestedPriceBRL: number;
  registrationUrl: string;
};

export type EduzzData = {
  productTitle: string;
  description: string;
  salesElements: string[];
  suggestedPriceBRL: number;
  registrationUrl: string;
};

export type GumroadData = {
  productTitle: string;
  description: string;
  suggestedPriceUSD: number;
  landingPageTips: string[];
  gumroadUrl: string;
};

// ── Generate Publication Kit ────────────────────────────────────────────────────

export async function generatePublicationKit(
  bookTitle: string,
  bookSubtitle: string,
  synopsis: string,
  genre: string,
  language: string,
  authorName?: string
): Promise<{ success: boolean; data?: PublicationKit; error?: string }> {
  try {
    const systemPrompt = `You are an expert digital product marketing consultant specializing in publishing books in Brazilian and international markets.

Your expertise includes:
- Amazon KDP (Kindle Direct Publishing) - US/Brazil market
- Hotmart - Brazilian infoprodutos platform
- Kiwify - Brazilian platform
- Eduzz - Brazilian platform
- Gumroad - International platform

Generate comprehensive publication kits for all these platforms based on the provided book information.

Return ONLY valid JSON:
{
  "amazon": {
    "title": "Optimized Amazon title (consider keywords)",
    "subtitle": "Clear subtitle with key selling points",
    "description": "Full book description with hook, key benefits, and call to action (150-300 words)",
    "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5", "keyword6", "keyword7"],
    "categories": ["suggested category 1", "suggested category 2"],
    "suggestedPriceUSD": 9.99,
    "kdpChecklist": ["Step 1", "Step 2", "Step 3", "Step 4", "Step 5", "Step 6", "Step 7", "Step 8"]
  },
  "hotmart": {
    "productTitle": "Sales-optimized product title for Hotmart",
    "salesDescription": "Compelling sales description for Brazilian market",
    "salesPageContent": "Complete sales page content with headline, benefits, testimonials structure, guarantee, call to action",
    "suggestedPriceBRL": 47.00,
    "registrationUrl": "https://www.hotmart.com/pt-BR/register"
  },
  "kiwify": {
    "productTitle": "Kiwify-optimized product title",
    "description": "Product description for Kiwify platform",
    "salesElements": ["Element 1", "Element 2", "Element 3"],
    "suggestedPriceBRL": 37.00,
    "registrationUrl": "https://www.kiwify.com.br/registro"
  },
  "eduzz": {
    "productTitle": "Eduzz-optimized product title",
    "description": "Product description for Eduzz platform",
    "salesElements": ["Element 1", "Element 2", "Element 3"],
    "suggestedPriceBRL": 47.00,
    "registrationUrl": "https://www.eduzz.com/cadastro"
  },
  "gumroad": {
    "productTitle": "Gumroad-optimized product title",
    "description": "Product description for Gumroad platform",
    "suggestedPriceUSD": 9.99,
    "landingPageTips": ["Tip 1", "Tip 2", "Tip 3", "Tip 4"],
    "gumroadUrl": "https://app.gumroad.com/login"
  }
}

ABSOLUTE RULES:
1. ALL text in ${language === "Português" ? "Português (Brazilian)" : language}
2. All descriptions must be compelling and marketing-focused
3. Keywords should be relevant to the book's topic
4. Prices should be realistic for the market and format
5. Return ONLY the JSON — no markdown fences, no extra commentary.`;

    const userPrompt = `Generate publication kit for this book:
- Title: ${bookTitle}
- Subtitle: ${bookSubtitle}
- Synopsis: ${synopsis}
- Genre: ${genre}
- Author: ${authorName || "N/A"}`;

    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 8000,
    });

    const raw = response.choices[0].message.content ?? "";
    const clean = raw.trim().replace(/^```[a-z]*\n?/, "").replace(/```$/, "").trim();
    const parsed = JSON.parse(clean) as PublicationKit;
    return { success: true, data: parsed };
  } catch (error) {
    console.error("generatePublicationKit error:", error);
    return { success: false, error: "Falha ao gerar kit de publicação." };
  }
}

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

export type BookConclusion = {
  title: string;
  blocks: BookBlock[];
};

export type BookResult = {
  title: string;
  subtitle: string;
  author: string;
  synopsis: string;
  impactPhrase?: string;     // powerful sentence for back cover
  chapters: BookChapter[];
  conclusion?: BookConclusion; // single conclusion at book end only
};

export type SavedBook = {
  id: string;
  title: string;
  subtitle: string;
  author: string;
  genre: string;
  language: string;
  synopsis: string | null;
  page_size: number;
  created_at: string;
  chapters?: BookChapter[];
  conclusion?: BookConclusion | null;
  impact_phrase?: string | null;
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

// ── Genre specialists ─────────────────────────────────────────────────────────

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
  Emagrecimento:
    "Park Howell (transformation story arc) and Nancy Duarte (audience as hero of their own health journey).",
  "Dieta e Nutrição":
    "Park Howell (evidence-based storytelling) and Nancy Duarte (visual metaphor for nutritional concepts).",
  Fitness:
    "Park Howell (brand story cycle for fitness transformation) and Nancy Duarte (motivational structure).",
  "Gospel/Cristão":
    "Kindra Hall (faith stories with emotional truth) and Nancy Duarte (audience transformation through scripture narrative).",
  "Marketing Digital":
    "Oren Klaff (frame control, pitch narrative) and Park Howell (brand storytelling for digital growth).",
  Finanças:
    "Oren Klaff (framing value and financial narrative) and Nancy Duarte (simplifying complex financial stories).",
  Maternidade:
    "Kindra Hall (emotional truth in parenting stories) and Matthew Dicks (vulnerability and personal narrative).",
  Autodesenvolvimento:
    "Park Howell (transformation arc) and Nancy Duarte (audience as hero of self-growth journey).",
  Negócios:
    "Oren Klaff (frame control, deal narrative) and Park Howell (brand story cycle for business).",
  Culinária:
    "Matthew Dicks (personal food stories) and Keith Johnstone (spontaneity and sensory description).",
  Infantil:
    "Matthew Dicks (memory-based simple stories) and Keith Johnstone (play, imagination, character fun).",
  Juvenil:
    "Dan Harmon (story circle for coming-of-age) and Matthew Dicks (personal truth in teen narrative).",
  Biografia:
    "Kindra Hall (true stories with emotional stakes) and Matthew Dicks (memory mining, personal truth).",
  Motivacional:
    "Park Howell (ABT framework for motivation) and Nancy Duarte (transformational arc).",
  Espiritualidade:
    "Kindra Hall (story as spiritual metaphor) and Joseph Campbell (mythic journey, inner awakening).",
  Relacionamentos:
    "Kindra Hall (emotional truth in relationship stories) and Matthew Dicks (vulnerability as strength).",
  "Educação":
    "Nancy Duarte (audience as learner hero) and Park Howell (brand story cycle for knowledge transfer).",
  "História":
    "Matthew Dicks (vivid memory reconstruction) and Joseph Campbell (mythic historical narrative).",
  Tecnologia:
    "Oren Klaff (framing innovation) and Park Howell (brand story cycle for tech audiences).",
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
  Emagrecimento:
    "Evidence-based weight loss journey with motivational stories, practical tips, mindset shifts, and real transformation narratives. Empathetic, encouraging tone.",
  "Dieta e Nutrição":
    "Science-backed nutritional guidance, practical meal strategies, food relationship healing, and healthy lifestyle building. Accessible and empowering.",
  Fitness:
    "Exercise routines, body transformation stories, motivational breakthroughs, and practical fitness coaching. Energetic, results-driven tone.",
  "Gospel/Cristão":
    "Faith-centered content with biblical references, testimonials, devotional depth, and spiritual growth. Warm, reverent, and inspiring tone.",
  "Marketing Digital":
    "Digital marketing strategies, growth hacking, content creation, social media tactics, and online business case studies. Practical and results-focused.",
  Finanças:
    "Personal finance, investment strategies, wealth building, financial freedom stories, and money mindset. Accessible, empowering, and trust-building.",
  Maternidade:
    "Parenting challenges, motherhood stories, child development insights, and emotional support. Warm, honest, and nurturing tone.",
  Autodesenvolvimento:
    "Personal growth frameworks, mindset transformation, habit building, goal achievement, and self-mastery. Energetic and practical.",
  Negócios:
    "Entrepreneurship stories, business strategy, leadership lessons, startup journeys, and practical frameworks. Bold, visionary, action-oriented.",
  Culinária:
    "Recipes intertwined with personal food stories, cultural traditions, cooking techniques, and sensory descriptions. Warm and inviting.",
  Infantil:
    "Simple, imaginative, age-appropriate stories with positive values, colorful characters, and gentle lessons. Fun, playful, and heartwarming.",
  Juvenil:
    "Coming-of-age adventures, relatable teen characters, friendship and identity themes. Exciting, emotionally resonant, age-appropriate.",
  Biografia:
    "True life narrative with chronological or thematic structure, authentic voice, emotional honesty, and inspiring turning points.",
  Motivacional:
    "Powerful stories of overcoming, actionable wisdom, energy and positivity. Inspire readers to take their next step. Bold and uplifting.",
  Espiritualidade:
    "Inner journey, mindfulness, spiritual awakening, universal themes of meaning and peace. Gentle, profound, and contemplative.",
  Relacionamentos:
    "Communication, love languages, conflict resolution, healthy boundaries, and connection. Warm, practical, and emotionally intelligent.",
  "Educação":
    "Learning strategies, teaching methods, educational stories, knowledge frameworks. Accessible, structured, and empowering.",
  "História":
    "Historical accuracy with vivid period detail, engaging narrative arcs, and compelling real or fictional characters from history.",
  Tecnologia:
    "Tech innovation, future trends, accessible explanations of complex concepts, and case studies of transformation through technology.",
};

// ── Story Chief integration ───────────────────────────────────────────────────

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
  const authorLine = authorName
    ? `Author: ${authorName}`
    : "Author: Create a fitting fictional author name for the genre";

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
  "impactPhrase": "One powerful, memorable sentence that captures the book's essence — suitable for the back cover",
  "author": "${authorName || "Fitting author name for genre/language"}",
  "synopsis": "150-200 word compelling synopsis",
  "chapters": [
    {
      "number": 1,
      "title": "Chapter title",
      "imageDesc": "Vivid visual scene for DALL-E 3. No text. Realistic/painterly. Max 120 words.",
      "blocks": [
        {"type": "paragraph", "text": "Opening hook paragraph — minimum ${Math.round(minWords * 0.2)} words"},
        {"type": "paragraph", "text": "Development paragraph — scene, tension, or character depth"},
        {"type": "paragraph", "text": "Further development — rising action or emotional beat"},
        {"type": "paragraph", "text": "Closing paragraph that flows seamlessly into the next chapter — minimum ${Math.round(minWords * 0.15)} words"}
      ]
    }
  ],
  "conclusion": {
    "title": "Conclusão",
    "blocks": [
      {"type": "paragraph", "text": "Final reflection — at least 150 words synthesizing the book's journey"},
      {"type": "paragraph", "text": "Closing thought — inspiring, forward-looking, memorable"}
    ]
  }
}

ABSOLUTE RULES:
1. ALL text in ${language} — never mix languages.
2. EXACTLY ${chapters} chapters.
3. Each chapter MUST have 4–6 blocks of type "paragraph" ONLY — flowing prose like a professional novel. ABSOLUTELY NO headings, NO bullets, NO per-chapter conclusions, NO structural labels of any kind (Introdução / Desenvolvimento / Conclusão / Resumo etc.). Each chapter must end naturally, leaving the reader wanting more — do NOT wrap up or conclude the chapter topic. Chapters flow into each other without resolution.
4. The "conclusion" object is the ONE AND ONLY conclusion for the ENTIRE book. It appears ONCE at the very end. All chapters treat the content as ongoing and unresolved until the conclusion.
5. "imageDesc" must be a vivid scene, NO text/letters.
6. Return ONLY the JSON — no markdown fences, no extra commentary.`;
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
  } catch (error: unknown) {
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

    const truncated =
      originalText.length > 12000
        ? originalText.slice(0, 12000) + "\n\n[...text truncated...]"
        : originalText;
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
  } catch (error: unknown) {
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
    "romantic editorial illustration, warm golden hour light bathing the entire scene evenly, soft floral elements, elegant couple silhouette or solitary heroine, rose gold and champagne palette",
  Thriller:
    "cinematic thriller art, dramatic but evenly lit scene, high contrast yet fully illuminated, urban setting, shadowy character in sharp light, no dark gradient across the image",
  Fantasia:
    "epic fantasy painting, radiant magical light filling the entire canvas uniformly, glowing sky, mythical landscape, vibrant jewel tones throughout",
  Autoajuda:
    "clean modern inspirational art, bright natural light flooding the entire scene, bold warm sunrise colors, uplifting visual metaphor, minimalist professional",
  Contos:
    "illustrated storybook aesthetic, warm even lighting across the whole image, rich textures, literary charm, golden-amber palette",
  "Romance de Mafia":
    "brooding mafia boss in an expensive suit, even professional studio lighting with no dark sections, deep red and charcoal palette, rose petals or gun as symbol, luxury editorial photography, every part of the image fully illuminated",
  "CEO Romance":
    "confident billionaire CEO, city skyline background fully lit, gold and navy palette, glamorous editorial photography, bright even light throughout the entire composition, no dark gradient",
  "Dark Romance":
    "intense gothic aesthetic with anti-hero figure, deep crimson and charcoal palette, dark floral motifs as decorative elements, evenly lit studio lighting so no portion is obscured, gothic elegant photography, fully illuminated from edge to edge",
  "Suspense Romântico":
    "couple in dramatic romantic tension, teal and burgundy palette, cinematic but evenly lit composition, urban noir atmosphere fully visible with no dark vignette overlay",
  Emagrecimento:
    "vibrant health transformation art, bright natural light filling the scene, energetic green and white palette, active lifestyle imagery, uplifting and motivational, fully illuminated",
  "Dieta e Nutrição":
    "fresh food and wellness art, bright even studio lighting, clean green and cream palette, appetizing healthy food arrangement, modern health aesthetic, fully illuminated scene",
  Fitness:
    "dynamic fitness art, bright energetic lighting across entire image, bold orange and charcoal palette, athletic silhouette in motion, powerful and inspiring, fully illuminated",
  "Gospel/Cristão":
    "serene spiritual art, warm golden divine light filling the entire scene evenly, soft white and gold palette, rays of light, peaceful and uplifting atmosphere, no dark sections",
  "Marketing Digital":
    "modern digital marketing art, clean bright lighting across entire composition, bold electric blue and white palette, abstract network or growth visual, professional and dynamic",
  Finanças:
    "professional financial art, clean even lighting throughout, gold and deep navy palette, abstract wealth or growth imagery, trust-inspiring, no dark gradients",
  Maternidade:
    "warm heartfelt art, soft natural light bathing entire scene evenly, blush pink and cream palette, mother and child imagery, tender and nurturing atmosphere",
  Autodesenvolvimento:
    "uplifting personal growth art, bright sunrise light across entire image, amber and gold palette, silhouette reaching upward, energetic transformation imagery",
  Negócios:
    "bold business art, clean professional lighting throughout, dark navy and gold palette, skyline or abstract growth imagery, powerful and authoritative, fully illuminated",
  Culinária:
    "beautiful food photography art, warm even studio lighting across entire scene, rich earthy tones, artisan food arrangement, inviting and delicious atmosphere",
  Infantil:
    "colorful illustrated children's art, bright playful lighting across entire scene, rainbow palette, friendly cartoon-style characters, joyful and imaginative",
  Juvenil:
    "dynamic adventure art for young adults, bright even lighting, vibrant jewel tones, exciting action or discovery scene, energetic and youthful",
  Biografia:
    "dignified portrait art, even professional lighting across entire composition, classic sepia and warm tones, timeless aesthetic, gravitas and authenticity",
  Motivacional:
    "bold motivational art, radiant light flooding the entire scene, sunrise in vibrant orange and gold, empowering silhouette, fully illuminated dramatic sky",
  Espiritualidade:
    "ethereal spiritual art, soft celestial light filling the entire canvas, lavender and gold palette, cosmic or nature imagery, transcendent and peaceful, no dark sections",
  Relacionamentos:
    "warm connection art, even natural light across the scene, rose and gold palette, couple or hands imagery, intimacy and warmth, fully illuminated soft atmosphere",
  "Educação":
    "clean educational art, bright even lighting, blue and white palette, books and knowledge imagery, modern and accessible, professional and clear",
  "História":
    "historical art illustration, even warm lighting, sepia and amber palette, period-accurate scene, dignified and timeless, fully illuminated composition",
  Tecnologia:
    "futuristic tech art, clean bright lighting across entire image, electric blue and white palette, abstract circuit or innovation imagery, modern and dynamic",
};

export async function generateBookCover(
  title: string,
  subtitle: string,
  author: string,
  genre: string
): Promise<{ success: boolean; base64?: string; error?: string }> {
  try {
    const style = COVER_STYLES[genre] ?? "professional book cover art, even studio lighting, vibrant colors throughout";
    const prompt = `Professional publishing-quality book cover art for a ${genre} book titled "${title}" by ${author}. Art style: ${style}. Portrait orientation, full bleed illustration. CRITICAL REQUIREMENTS: 
1. Absolutely NO text, NO letters, NO words, NO numbers anywhere in the image
2. EVERY portion of the image must be FULLY and EVENLY ILLUMINATED - no dark corners, no dark edges, no dark bottom half
3. Use only BRIGHT professional photography studio lighting - the entire image should look like it was lit with softbox lights
4. No vignette effects, no dark gradients, no shadows covering any part of the image
5. The subject/illustration should be evenly lit from all angles
6. This is for a BOOK COVER - it needs to look premium and fully visible in all areas
7. Bright, saturated colors throughout the entire frame - nothing dark or shadowy`;

    const resp = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1792",
      quality: "hd",
    });

    const url = resp.data?.[0]?.url;
    if (!url) throw new Error("No URL returned");
    const base64 = await fetchAsBase64(url);
    return { success: true, base64 };
  } catch (error: unknown) {
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
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1792x1024",
      quality: "hd",
    });

    const url = resp.data?.[0]?.url;
    if (!url) throw new Error("No URL returned");
    const base64 = await fetchAsBase64(url);
    return { success: true, base64 };
  } catch (error: unknown) {
    console.error(`generateChapterImage error (ch.${chapterNumber}):`, error);
    return { success: false, error: `Falha na imagem do capítulo ${chapterNumber}.` };
  }
}

// ── Save to project (legacy) ──────────────────────────────────────────────────

export async function saveBookToProject(result: BookResult, projectName: string) {
  const name = projectName?.trim() || "Livros Gerados";
  return await saveGenerationToDatabase(
    name,
    "book-generator",
    { title: result.title.substring(0, 50) },
    result
  );
}

// ── Save book to Meus Livros (new) ────────────────────────────────────────────

export type SaveBookParams = {
  result: BookResult;
  language: string;
  genre: string;
  pageSize: number;
  authorName?: string;
};

export async function saveBook(
  params: SaveBookParams
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) return { success: false, error: "Não autenticado." };

    // Strip imageDesc from chapters to reduce payload; keep blocks
    const chaptersToSave = params.result.chapters.map((ch) => ({
      number:    ch.number,
      title:     ch.title,
      imageDesc: ch.imageDesc,
      blocks:    ch.blocks,
    }));

    const { data, error } = await supabase
      .from("books")
      .insert({
        user_id:       user.id,
        title:         params.result.title,
        subtitle:      params.result.subtitle ?? "",
        author:        params.authorName || params.result.author,
        genre:         params.genre,
        language:      params.language,
        synopsis:      params.result.synopsis ?? null,
        impact_phrase: params.result.impactPhrase ?? null,
        conclusion:    params.result.conclusion ?? null,
        chapters:      chaptersToSave,
        page_size:     params.pageSize,
      })
      .select("id")
      .single();

    if (error) {
      console.error("saveBook error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data.id };
  } catch (err: unknown) {
    console.error("saveBook catch:", err);
    return { success: false, error: err instanceof Error ? err.message : "Falha ao salvar livro." };
  }
}

export async function getMyBooks(): Promise<{
  success: boolean;
  data?: SavedBook[];
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) return { success: false, error: "Não autenticado." };

    const { data, error } = await supabase
      .from("books")
      .select("id, title, subtitle, author, genre, language, synopsis, page_size, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as SavedBook[] };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Falha ao carregar livros." };
  }
}

export async function getBook(id: string): Promise<{
  success: boolean;
  data?: BookResult & { language: string; genre: string; pageSize: number };
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("books")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) return { success: false, error: error?.message ?? "Não encontrado." };

    return {
      success: true,
      data: {
        title:        data.title,
        subtitle:     data.subtitle,
        author:       data.author,
        synopsis:     data.synopsis ?? "",
        impactPhrase: data.impact_phrase ?? undefined,
        conclusion:   data.conclusion ?? undefined,
        chapters:     data.chapters ?? [],
        language:     data.language,
        genre:        data.genre,
        pageSize:     data.page_size,
      },
    };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Falha ao carregar livro." };
  }
}

export async function deleteBook(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("books").delete().eq("id", id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Falha ao deletar livro." };
  }
}

export type UpdateBookParams = {
  id: string;
  result?: BookResult;
  language?: string;
  genre?: string;
  pageSize?: number;
  authorName?: string;
};

export async function updateBook(
  params: UpdateBookParams
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) return { success: false, error: "Não autenticado." };

    const updates: Record<string, unknown> = {};

    if (params.result) {
      updates.title = params.result.title;
      updates.subtitle = params.result.subtitle ?? "";
      updates.author = params.authorName || params.result.author;
      updates.synopsis = params.result.synopsis ?? null;
      updates.impact_phrase = params.result.impactPhrase ?? null;
      updates.conclusion = params.result.conclusion ?? null;
      updates.chapters = params.result.chapters.map((ch) => ({
        number: ch.number,
        title: ch.title,
        imageDesc: ch.imageDesc,
        blocks: ch.blocks,
      }));
    }

    if (params.language) updates.language = params.language;
    if (params.genre) updates.genre = params.genre;
    if (params.pageSize) updates.page_size = params.pageSize;

    const { error } = await supabase
      .from("books")
      .update(updates)
      .eq("id", params.id)
      .eq("user_id", user.id);

    if (error) {
      console.error("updateBook error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    console.error("updateBook catch:", err);
    return { success: false, error: err instanceof Error ? err.message : "Falha ao atualizar livro." };
  }
}

// ── Save playbook (public shareable) ─────────────────────────────────────────
// Note: chapter images are NOT stored to keep payload within Supabase limits.
// Shared playbooks show gradient placeholders for chapter illustrations.

export type PlaybookChapterData = Omit<BookChapter, "imageDesc"> & { imageBase64: null };

export type SavePlaybookParams = {
  result:        BookResult;
  coverBase64:   string | null;
  chapterImages: Record<number, string>;
  authorName:    string;
  genre:         string;
};

export async function savePlaybook(
  params: SavePlaybookParams
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return { success: false, error: "Você precisa estar logado para compartilhar." };
    }

    // Store only text content — skip chapter images to stay within payload limits
    const chapters = params.result.chapters.map((ch) => ({
      number:      ch.number,
      title:       ch.title,
      blocks:      ch.blocks,
      imageBase64: null,
    }));

    // Compress cover if present (remove data URI prefix, limit size)
    let compressedCover = null;
    if (params.coverBase64) {
      try {
        const base64Data = params.coverBase64.replace(/^data:image\/\w+;base64,/, "");
        // Skip if too large (>1MB base64) to avoid payload limits
        if (base64Data.length > 1_500_000) {
          console.warn("Cover image too large, skipping...");
        } else {
          compressedCover = params.coverBase64;
        }
      } catch {
        console.warn("Failed to process cover image");
      }
    }

    const { data, error } = await supabase
      .from("playbooks")
      .insert({
        user_id:      user.id,
        title:        params.result.title,
        author:       params.authorName || params.result.author,
        genre:        params.genre,
        cover_base64: compressedCover,
        chapters,
      })
      .select("id")
      .single();

    if (error) {
      console.error("savePlaybook error:", error);
      // Provide more specific error messages
      if (error.message.includes("payload")) {
        return { success: false, error: "O conteúdo é muito grande. Tente缩短 o livro." };
      }
      return { success: false, error: error.message };
    }

    return { success: true, id: data.id };
  } catch (err: unknown) {
    console.error("savePlaybook catch:", err);
    const msg = err instanceof Error ? err.message : undefined;
    if (msg?.includes("fetch")) {
      return { success: false, error: "Erro de conexão. Tente novamente." };
    }
    return { success: false, error: msg ?? "Falha ao salvar playbook." };
  }
}
