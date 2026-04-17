// Full Automation Pipeline - Generate complete marketing assets from product input
import { getSmartRecommendations, type ProductContext, type FrameworkRecommendation, type ArchitectureRecommendation, type VisualStyleRecommendation } from "./smartDecisions";
import { generateAdImage, generateBookCover, generateChapterImage, generateSalesPageVisual, type GeneratedImage } from "./imageGeneration";
import { openai } from "./openai";
import { parseOpenAIResponse } from "./openai";

export interface MarketingAssetInput {
  // Product Data
  productName: string;
  productType?: "digital_product" | "physical_product" | "service" | "course" | "membership" | "ebook" | "software" | "coaching";
  niche: string;
  price: number;
  mechanism?: string;
  promise: string;
  
  // Optional overrides
  targetAudience?: string;
  mainPainPoint?: string;
  language?: "pt" | "en" | "es";
  
  // What to generate
  generateSalesPage?: boolean;
  generateAds?: boolean;
  generateBook?: boolean;
  adCount?: number;
}

export interface GeneratedSalesPage {
  // Hero
  headline: string;
  subheadline: string;
  ctaText: string;
  proofText: string;
  
  // Problem
  problemHeadline: string;
  painPoints: string[];
  
  // Solution
  solutionHeadline: string;
  benefits: { title: string; description: string; icon: string }[];
  
  // Social Proof
  testimonials: { name: string; text: string; result: string }[];
  
  // Offer
  price: number;
  originalPrice: number;
  bonuses: { title: string; value: number }[];
  
  // CTA
  ctaBlocks: { text: string; urgency: string }[];
  
  // FAQ
  faqs: { question: string; answer: string }[];
  
  // Visuals
  heroImage?: GeneratedImage;
  solutionImage?: GeneratedImage;
  socialProofImage?: GeneratedImage;
}

export interface GeneratedAd {
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
  generatedImage?: GeneratedImage;
  score: {
    hookScore: number;
    clarityScore: number;
    emotionScore: number;
    conversionScore: number;
    finalScore: number;
  };
}

export interface GeneratedBook {
  title: string;
  subtitle: string;
  author: string;
  synopsis: string;
  chapters: {
    number: number;
    title: string;
    blocks: { type: string; text: string }[];
    imagePrompt: string;
    generatedImage?: GeneratedImage;
  }[];
  coverImage?: GeneratedImage;
}

export interface MarketingAssets {
  salesPage?: GeneratedSalesPage;
  ads?: GeneratedAd[];
  book?: GeneratedBook;
  recommendations: {
    frameworks: FrameworkRecommendation[];
    architectures: ArchitectureRecommendation[];
    visualStyle: VisualStyleRecommendation;
  };
  metadata: {
    productName: string;
    niche: string;
    language: string;
    generatedAt: string;
  };
}

// Build product context from input
function buildProductContext(input: MarketingAssetInput): ProductContext {
  const priceRange = input.price === 0 ? "free" : input.price <= 50 ? "low" : input.price <= 200 ? "medium" : input.price <= 500 ? "high" : "premium";
  
  return {
    productName: input.productName,
    productType: input.productType || "digital_product",
    niche: input.niche,
    price: input.price,
    priceRange,
    targetAudience: input.targetAudience || "target audience",
    mainPainPoint: input.mainPainPoint || "main problem",
    mainPromise: input.promise,
    mechanism: input.mechanism,
  };
}

// Generate sales page content
async function generateSalesPageContent(
  context: ProductContext,
  language: string = "pt"
): Promise<GeneratedSalesPage> {
  const systemPrompt = `You are an expert copywriter specializing in high-converting sales pages. 
Generate a complete sales page structure in ${language === "pt" ? "Portuguese" : language === "en" ? "English" : "Spanish"}.

The sales page must include:
1. Hero section with headline, subheadline, CTA, proof text
2. Problem section with headline and pain points
3. Solution section with headline and benefits
4. Social proof with testimonials
5. Offer section with price, original price, bonuses
6. CTA blocks with urgency
7. FAQ section

Product: ${context.productName}
Niche: ${context.niche}
Price: $${context.price}
Promise: ${context.mainPromise}
Pain Point: ${context.mainPainPoint}
${context.mechanism ? `Mechanism: ${context.mechanism}` : ""}

Return ONLY valid JSON in this exact format:
{
  "headline": "...",
  "subheadline": "...",
  "ctaText": "...",
  "proofText": "...",
  "problemHeadline": "...",
  "painPoints": ["...", "..."],
  "solutionHeadline": "...",
  "benefits": [{"title": "...", "description": "...", "icon": "..."}],
  "testimonials": [{"name": "...", "text": "...", "result": "..."}],
  "price": ${context.price},
  "originalPrice": ${Math.round(context.price * 1.5)},
  "bonuses": [{"title": "...", "value": ...}],
  "ctaBlocks": [{"text": "...", "urgency": "..."}],
  "faqs": [{"question": "...", "answer": "..."}]
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "system", content: systemPrompt }],
    response_format: { type: "json_object" },
    temperature: 0.8,
    max_tokens: 4000,
  });

  const content = parseOpenAIResponse<GeneratedSalesPage>(response.choices[0].message.content);
  return content;
}

// Generate ad creatives
async function generateAdCreatives(
  context: ProductContext,
  recommendations: { frameworks: FrameworkRecommendation[]; architectures: ArchitectureRecommendation[] },
  count: number = 5,
  language: string = "pt"
): Promise<GeneratedAd[]> {
  const selectedFrameworks = recommendations.frameworks.slice(0, Math.ceil(count / 2));
  const selectedArchitectures = recommendations.architectures.slice(0, 2);
  
  const systemPrompt = `You are an expert ad copywriter. Generate ${count} high-converting ad creatives in ${language === "pt" ? "Portuguese" : language === "en" ? "English" : "Spanish"}.

Product: ${context.productName}
Niche: ${context.niche}
Price: $${context.price}
Promise: ${context.mainPromise}
Pain Point: ${context.mainPainPoint}

Use these frameworks: ${selectedFrameworks.map(f => f.frameworkName).join(", ")}
Use these architectures: ${selectedArchitectures.map(a => a.architectureName).join(", ")}

For each ad, generate:
- frameworkId (use: ${selectedFrameworks.map(f => f.frameworkId).join(", ")})
- frameworkName
- architectureId (use: ${selectedArchitectures.map(a => a.architectureId).join(", ")})
- architectureName
- headline (scroll-stopping, max 10 words)
- body (compelling, max 150 words)
- cta (action-oriented)
- visualConcept (describe the visual layout)
- imagePrompt (DALL-E ready, no text, describe the scene)

Return ONLY valid JSON array:
[{
  "id": "ad_1",
  "frameworkId": "...",
  "frameworkName": "...",
  "architectureId": "...",
  "architectureName": "...",
  "headline": "...",
  "body": "...",
  "cta": "...",
  "visualConcept": "...",
  "imagePrompt": "...",
  "score": {"hookScore": 0, "clarityScore": 0, "emotionScore": 0, "conversionScore": 0, "finalScore": 0}
}]`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "system", content: systemPrompt }],
    response_format: { type: "json_object" },
    temperature: 0.85,
    max_tokens: 6000,
  });

  const ads = parseOpenAIResponse<GeneratedAd[]>(response.choices[0].message.content);
  return ads.slice(0, count);
}

// Generate book content
async function generateBookContent(
  context: ProductContext,
  genre: string = "autoajuda",
  pageSize: number = 60,
  language: string = "pt"
): Promise<GeneratedBook> {
  const chapterCount = pageSize <= 20 ? 5 : pageSize <= 40 ? 8 : pageSize <= 60 ? 12 : 15;
  
  const systemPrompt = `You are an expert book writer. Generate a complete book structure in ${language === "pt" ? "Portuguese" : language === "en" ? "English" : "Spanish"}.

Book Topic: ${context.productName}
Niche: ${context.niche}
Genre: ${genre}
Promise: ${context.mainPromise}
Mechanism: ${context.mechanism || "step by step process"}

Generate:
- title (catchy, compelling)
- subtitle (descriptive)
- author (professional name)
- synopsis (back cover text, 2-3 sentences)
- ${chapterCount} chapters with:
  - number
  - title
  - 3-4 content blocks (paragraphs)
  - imagePrompt (description for illustration)

Return ONLY valid JSON:
{
  "title": "...",
  "subtitle": "...",
  "author": "...",
  "synopsis": "...",
  "chapters": [{
    "number": 1,
    "title": "...",
    "blocks": [{"type": "paragraph", "text": "..."}],
    "imagePrompt": "..."
  }]
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "system", content: systemPrompt }],
    response_format: { type: "json_object" },
    temperature: 0.8,
    max_tokens: 8000,
  });

  return parseOpenAIResponse<GeneratedBook>(response.choices[0].message.content);
}

// Main function - Generate all marketing assets
export async function generateMarketingAssets(input: MarketingAssetInput): Promise<MarketingAssets> {
  const language = input.language || "pt";
  
  // Build product context
  const context = buildProductContext(input);
  
  // Get smart recommendations
  const recommendations = getSmartRecommendations(context);
  
  const result: MarketingAssets = {
    recommendations,
    metadata: {
      productName: input.productName,
      niche: input.niche,
      language,
      generatedAt: new Date().toISOString(),
    },
  };
  
  // Generate sales page if requested
  if (input.generateSalesPage) {
    console.log("Generating sales page...");
    const salesPage = await generateSalesPageContent(context, language);
    
    // Generate visuals for sales page
    try {
      salesPage.heroImage = await generateSalesPageVisual("hero", input.productName, input.niche);
      salesPage.solutionImage = await generateSalesPageVisual("solution", input.productName, input.niche);
      salesPage.socialProofImage = await generateSalesPageVisual("social_proof", input.productName, input.niche);
    } catch (e) {
      console.error("Failed to generate some sales page visuals:", e);
    }
    
    result.salesPage = salesPage;
  }
  
  // Generate ads if requested
  if (input.generateAds) {
    console.log("Generating ads...");
    const ads = await generateAdCreatives(
      context, 
      { frameworks: recommendations.frameworks, architectures: recommendations.architectures },
      input.adCount || 5,
      language
    );
    
    // Generate images for each ad
    for (let i = 0; i < ads.length; i++) {
      try {
        ads[i].generatedImage = await generateAdImage(
          {
            frameworkId: ads[i].frameworkId,
            visualConcept: ads[i].visualConcept,
            imagePrompt: ads[i].imagePrompt,
            headline: ads[i].headline,
          },
          input.niche,
          input.productName
        );
      } catch (e) {
        console.error(`Failed to generate image for ad ${i}:`, e);
      }
    }
    
    result.ads = ads;
  }
  
  // Generate book if requested
  if (input.generateBook) {
    console.log("Generating book...");
    const book = await generateBookContent(context, "autoajuda", 60, language);
    
    // Generate cover
    try {
      book.coverImage = await generateBookCover(book.title, book.subtitle, "autoajuda", "visual");
    } catch (e) {
      console.error("Failed to generate book cover:", e);
    }
    
    // Generate chapter images (first 3)
    for (let i = 0; i < Math.min(3, book.chapters.length); i++) {
      try {
        book.chapters[i].generatedImage = await generateChapterImage(
          book.chapters[i].number,
          book.chapters[i].title,
          book.chapters[i].blocks[0]?.text || "",
          "autoajuda"
        );
      } catch (e) {
        console.error(`Failed to generate chapter ${i} image:`, e);
      }
    }
    
    result.book = book;
  }
  
  return result;
}

// Quick generate - just ads with images
export async function quickGenerateAds(
  productName: string,
  niche: string,
  price: number,
  promise: string,
  painPoint: string,
  count: number = 5,
  language: string = "pt"
): Promise<GeneratedAd[]> {
  const input: MarketingAssetInput = {
    productName,
    niche,
    price,
    promise,
    mainPainPoint: painPoint,
    generateAds: true,
    adCount: count,
    language: language as "pt" | "en" | "es",
  };
  
  const result = await generateMarketingAssets(input);
  return result.ads || [];
}

// Quick generate - just sales page
export async function quickGenerateSalesPage(
  productName: string,
  niche: string,
  price: number,
  promise: string,
  painPoint: string,
  mechanism?: string,
  language: string = "pt"
): Promise<GeneratedSalesPage> {
  const input: MarketingAssetInput = {
    productName,
    niche,
    price,
    promise,
    mainPainPoint: painPoint,
    mechanism,
    generateSalesPage: true,
    language: language as "pt" | "en" | "es",
  };
  
  const result = await generateMarketingAssets(input);
  return result.salesPage!;
}