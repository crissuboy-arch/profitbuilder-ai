import { NextRequest, NextResponse } from "next/server";
import { tavily } from "@tavily/core";
import { openai, DEFAULT_MODEL } from "@/lib/openai";
import type { ProductIdea } from "@/app/(dashboard)/dashboard/modules/product-miner/actions";

// ── Route handler ──────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const { niche, subniche, businessType, country, language, targetAudience, targetGoal } =
      await req.json();

    const tavilyKey = process.env.TAVILY_API_KEY;
    if (!tavilyKey || tavilyKey.startsWith("tvly-your")) {
      return NextResponse.json(
        { success: false, error: "TAVILY_API_KEY não configurada. Adicione sua chave no .env.local" },
        { status: 400 }
      );
    }

    const client = tavily({ apiKey: tavilyKey });

    // ── 3 parallel Tavily searches ─────────────────────────────────────────────
    const [resProducts, resPricing, resAudience] = await Promise.all([
      client.search(
        `produtos digitais ${niche} ${subniche} ${country} 2025 melhores vendendo Hotmart Kiwify`,
        { maxResults: 5, searchDepth: "advanced" }
      ),
      client.search(
        `${niche} ${subniche} curso online preço mercado concorrência 2025 infoproduto`,
        { maxResults: 5, searchDepth: "advanced" }
      ),
      client.search(
        `${subniche} ${targetAudience} dores problemas desafios ${country} 2025`,
        { maxResults: 5, searchDepth: "advanced" }
      ),
    ]);

    // Combine results from all 3 searches
    type TavilyResult = { title: string; url: string; content: string; score: number };
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const allRaw = [
      ...((resProducts as any).results ?? []),
      ...((resPricing  as any).results ?? []),
      ...((resAudience as any).results ?? []),
    ] as TavilyResult[];
    /* eslint-enable @typescript-eslint/no-explicit-any */

    // Deduplicate by URL, sort by score descending
    const seen  = new Set<string>();
    const allResults: TavilyResult[] = [];
    for (const r of allRaw) {
      if (r.url && !seen.has(r.url)) {
        seen.add(r.url);
        allResults.push(r);
      }
    }
    allResults.sort((a, b) => b.score - a.score);

    // Top sources for attribution fallback
    const topSources = allResults.slice(0, 8).map((r) => ({ title: r.title, url: r.url }));

    // Context blob for the synthesis prompt
    const webContext = allResults
      .slice(0, 12)
      .map((r) => `### [${r.title}](${r.url})\n${r.content}`)
      .join("\n\n");

    // ── Claude synthesis ──────────────────────────────────────────────────────
    const systemPrompt = `You are a top-tier digital product strategist with access to LIVE web data from ${country}.

REAL WEB DATA RETRIEVED RIGHT NOW:
${webContext}

Based EXCLUSIVELY on the real web data above, generate exactly 10 high-potential digital product ideas.

ABSOLUTE RULES:
1. ALL text fields MUST be written entirely in ${language}. NO language mixing.
2. competitionLevel MUST always be exactly: "Low", "Medium", or "High" (English, for programmatic use)
3. priceBRL, priceUSD, priceEUR: realistic numeric values (no symbols, just numbers)
4. recommendedPlatforms: 2–3 platforms most relevant for ${country}
5. marketTrend: MUST cite or reference specific evidence from the web data above
6. dataSource: MUST be "web" for all ideas
7. webSources: pick 2–3 URLs from the web data that most support this specific idea

Return ONLY valid JSON:
{
  "ideas": [
    {
      "productName":          "Benefit-driven name in ${language}",
      "productType":          "Product type in ${language}",
      "targetAudience":       "Detailed profile in ${language}",
      "mainProblemSolved":    "Pain + transformation in ${language}",
      "priceBRL":             297,
      "priceUSD":             57,
      "priceEUR":             52,
      "competitionLevel":     "Low",
      "profitPotential":      "Revenue estimate in ${language}",
      "recommendedPlatforms": ["Hotmart", "Kiwify"],
      "recommendedFormat":    "Delivery format in ${language}",
      "marketTrend":          "Real evidence from web data in ${language}",
      "dataSource":           "web",
      "webSources":           [{"title": "Source Name", "url": "https://..."}]
    }
  ]
}`;

    const userPrompt = `Analyze the real web data and generate 10 product ideas for ${country}:
- Niche: ${niche}
- Sub-niche: ${subniche}
- Business model: ${businessType}
- Target audience: ${targetAudience}
- Creator's goal: ${targetGoal}`;

    const response = await openai.chat.completions.create({
      model:           DEFAULT_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user",   content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature:     0.65,
      max_tokens:      8000,
    });

    const raw    = response.choices[0].message.content ?? "{}";
    const parsed = JSON.parse(raw) as { ideas: ProductIdea[] };

    // Ensure every idea has dataSource + fallback webSources
    const ideas: ProductIdea[] = (parsed.ideas ?? []).map((idea) => ({
      ...idea,
      dataSource: "web",
      webSources: idea.webSources?.length ? idea.webSources : topSources.slice(0, 3),
    }));

    return NextResponse.json({ success: true, data: ideas });
  } catch (err: unknown) {
    console.error("deep-search error:", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Deep search failed." },
      { status: 500 }
    );
  }
}
