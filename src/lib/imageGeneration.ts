// Image Generation Utility - Direct DALL-E 3 image generation
import OpenAI from "openai";
import { getVisualStyleForNiche, getFrameworkVisualRule, NICHE_VISUAL_STYLES } from "./designSystem";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export type ImageSize = "1024x1024" | "1024x1792" | "1792x1024";
export type ImageStyle = "fitness" | "business" | "emotional" | "digital_product" | "health" | "education" | "finance" | "default";

export interface GeneratedImage {
  url: string;
  revisedPrompt: string;
  width: number;
  height: number;
}

export interface AdCreativeWithImage {
  // Original ad data
  id: string;
  frameworkId: string;
  frameworkName: string;
  architectureId: string;
  architectureName: string;
  headline: string;
  body: string;
  cta: string;
  visualConcept: string;
  imagePrompt: string;
  // Generated image
  generatedImage?: GeneratedImage;
  // Score
  score: {
    hookScore: number;
    clarityScore: number;
    emotionScore: number;
    conversionScore: number;
    finalScore: number;
  };
}

// Generate a single image
export async function generateImage(
  prompt: string,
  size: ImageSize = "1024x1024",
  quality: "standard" | "hd" = "hd"
): Promise<GeneratedImage> {
  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      size: size,
      quality: quality,
      n: 1,
    });

    const image = response.data?.[0];
    if (!image) throw new Error("No image returned from API");

    return {
      url: image.url ?? "",
      revisedPrompt: image.revised_prompt || prompt,
      width: size === "1024x1792" ? 1024 : size === "1792x1024" ? 1792 : 1024,
      height: size === "1024x1792" ? 1792 : size === "1792x1024" ? 1024 : 1024,
    };
  } catch (error) {
    console.error("Error generating image:", error);
    throw new Error(`Failed to generate image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Generate image for an ad creative
export async function generateAdImage(
  adCreative: {
    frameworkId: string;
    visualConcept: string;
    imagePrompt: string;
    headline: string;
  },
  niche: string = "default",
  productName: string = ""
): Promise<GeneratedImage> {
  // Get visual style for niche
  const visualStyle = getVisualStyleForNiche(niche);
  
  // Get framework visual rule
  const frameworkRule = getFrameworkVisualRule(adCreative.frameworkId);
  
  // Build optimized prompt
  const basePrompt = adCreative.imagePrompt || adCreative.visualConcept;
  
  // Combine elements for best result
  const fullPrompt = `${basePrompt}. ${visualStyle.prompt}. ${frameworkRule.prompt_addition}. Professional photography, high quality, no text overlay, commercial use allowed.${productName ? ` Product: ${productName}` : ''}`;
  
  return generateImage(fullPrompt, "1024x1024", "hd");
}

// Generate book cover
export async function generateBookCover(
  title: string,
  subtitle: string,
  genre: string,
  style: "visual" | "traditional" = "visual"
): Promise<GeneratedImage> {
  const genreStyles: Record<string, string> = {
    romance: "romantic editorial illustration, warm golden hour light, soft floral elements, rose gold palette",
    dark_romance: "gothic aesthetic with anti-hero, crimson/charcoal palette, evenly lit studio lighting",
    thriller: "suspenseful thriller cover, dark moody lighting, dramatic shadows, mysterious atmosphere",
    fantasy: "epic fantasy illustration, magical elements, detailed world-building, rich colors",
    autoajuda: "inspirational self-help cover, uplifting imagery, warm colors, modern design",
    fitness: "fitness transformation cover, athletic energy, dynamic composition, motivational",
    marketing: "business marketing cover, professional, modern design, data visualization elements",
    finance: "financial success cover, wealth imagery, professional and trustworthy, blue tones",
    default: "modern professional book cover, clean design, high quality illustration",
  };
  
  const genreStyle = genreStyles[genre.toLowerCase()] || genreStyles.default;
  
  let prompt: string;
  if (style === "visual") {
    prompt = `Book cover for "${title}${subtitle ? `: ${subtitle}` : ''}". ${genreStyle}. Professional book cover design, high quality, commercial use allowed, no text on cover.`;
  } else {
    prompt = `Clean minimalist book cover for "${title}". Solid background, elegant typography area, professional Amazon KDP ready, white or light background, no imagery, placeholder for title text.`;
  }
  
  return generateImage(prompt, "1024x1792", "hd");
}

// Generate chapter image
export async function generateChapterImage(
  chapterNumber: number,
  chapterTitle: string,
  description: string,
  genre: string,
  playbookStyle: boolean = false
): Promise<GeneratedImage> {
  const genreScenes: Record<string, string> = {
    romance: "romantic scene, emotional moment, warm lighting, elegant setting",
    thriller: "suspenseful scene, tension building, dramatic lighting, mysterious",
    fantasy: "magical scene, fantasy world, epic moment, detailed fantasy illustration",
    autoajuda: "motivational scene, personal growth, inspiring setting, positive energy",
    fitness: "transformation scene, workout environment, athletic setting, energetic",
    default: "professional illustration, clean design, modern aesthetic",
  };
  
  const scene = genreScenes[genre.toLowerCase()] || genreScenes.default;
  
  let prompt: string;
  if (playbookStyle) {
    prompt = `Chapter ${chapterNumber} illustration: ${chapterTitle}. Dark anime/manga style, interactive playbook aesthetic, dark background with vibrant accents, modern digital art, high quality.`;
  } else {
    prompt = `Chapter ${chapterNumber} illustration: ${chapterTitle}. ${scene}. Professional book illustration, high quality, commercial use allowed, no text.`;
  }
  
  return generateImage(prompt, "1792x1024", "hd");
}

// Generate sales page visual
export async function generateSalesPageVisual(
  section: string,
  productName: string,
  niche: string,
  style: "clean-premium" | "feminine-soft" | "modern-dark" = "modern-dark"
): Promise<GeneratedImage> {
  const visualStyle = getVisualStyleForNiche(niche);
  
  const sectionPrompts: Record<string, string> = {
    hero: `Hero section for ${productName}. ${visualStyle.prompt}. Strong headline area, compelling visual, professional landing page header, high conversion design`,
    problem: `Problem/Pain section for ${productName}. ${visualStyle.prompt}. Emotional imagery showing pain points, relatable situation, empathy-inducing`,
    solution: `Solution section for ${productName}. ${visualStyle.prompt}. Product showcase, benefits visualization, positive transformation`,
    benefits: `Benefits section for ${productName}. ${visualStyle.prompt}. Feature highlights, value proposition, clean layout`,
    social_proof: `Social proof section for ${productName}. ${visualStyle.prompt}. Testimonial cards, customer photos, trust signals, credibility`,
    offer: `Offer section for ${productName}. ${visualStyle.prompt}. Product bundle, pricing display, value stack, compelling offer visual`,
    cta: `Call to action section for ${productName}. ${visualStyle.prompt}. Urgent but professional, button highlight, conversion-focused`,
  };
  
  const prompt = sectionPrompts[section] || `Professional business visual for ${productName}. ${visualStyle.prompt}`;
  
  return generateImage(prompt, "1792x1024", "hd");
}

// Batch generate images for multiple ads
export async function generateBatchAdImages(
  adCreatives: Array<{
    frameworkId: string;
    visualConcept: string;
    imagePrompt: string;
    headline: string;
  }>,
  niche: string = "default",
  productName: string = ""
): Promise<AdCreativeWithImage[]> {
  const results: AdCreativeWithImage[] = [];
  
  for (const ad of adCreatives) {
    try {
      const image = await generateAdImage(ad, niche, productName);
      results.push({
        ...ad,
        generatedImage: image,
        score: { hookScore: 0, clarityScore: 0, emotionScore: 0, conversionScore: 0, finalScore: 0 },
      } as AdCreativeWithImage);
    } catch (error) {
      console.error(`Failed to generate image for ad ${ad.frameworkId}:`, error);
      // Add ad without image
      results.push({
        ...ad,
        score: { hookScore: 0, clarityScore: 0, emotionScore: 0, conversionScore: 0, finalScore: 0 },
      } as AdCreativeWithImage);
    }
  }
  
  return results;
}

// Validate image URL is accessible
export async function validateImageUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: "HEAD" });
    return response.ok;
  } catch {
    return false;
  }
}