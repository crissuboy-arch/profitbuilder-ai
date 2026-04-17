import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  try {
    // Get user from auth header
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user token
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const reportName = formData.get("reportName") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Determine file type
    const fileType = file.name.endsWith(".xlsx") ? "xlsx" : "csv";
    const fileName = file.name;

    // Parse file content
    let parsedData: any[] = [];

    if (fileType === "csv") {
      const text = await file.text();
      parsedData = parseCSV(text);
    } else {
      // For XLSX, we'll handle it on client side and send JSON
      const text = await file.text();
      parsedData = JSON.parse(text);
    }

    // Calculate metrics
    const metrics = calculateMetrics(parsedData);

    // Get top and worst performing ads
    const topAds = getTopAds(parsedData, 5);
    const worstAds = getWorstAds(parsedData, 5);

    // Generate AI insights
    const aiInsights = await generateAIInsights(metrics, topAds, worstAds);

    // Get suggested frameworks based on performance
    const suggestedFrameworks = getSuggestedFrameworks(metrics);

    // Save to database
    const { data: report, error: insertError } = await supabaseAdmin
      .from("ads_reports")
      .insert({
        user_id: user.id,
        report_name: reportName || fileName,
        file_name: fileName,
        file_type: fileType,
        raw_data: parsedData,
        summary: metrics,
        top_ads: topAds,
        worst_ads: worstAds,
        ai_insights: aiInsights,
        suggested_frameworks: suggestedFrameworks,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Database insert error:", insertError);
      return NextResponse.json({ error: "Failed to save report" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      report: {
        id: report.id,
        report_name: report.report_name,
        summary: metrics,
        top_ads: topAds,
        worst_ads: worstAds,
        ai_insights: aiInsights,
        suggested_frameworks: suggestedFrameworks,
      },
    });
  } catch (error) {
    console.error("Ads analytics error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const reportId = searchParams.get("id");

    if (reportId) {
      // Get specific report
      const { data: report, error } = await supabaseAdmin
        .from("ads_reports")
        .select("*")
        .eq("id", reportId)
        .eq("user_id", user.id)
        .single();

      if (error || !report) {
        return NextResponse.json({ error: "Report not found" }, { status: 404 });
      }

      return NextResponse.json({ report });
    }

    // Get all reports for user
    const { data: reports, error } = await supabaseAdmin
      .from("ads_reports")
      .select("id, report_name, file_name, summary, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
    }

    return NextResponse.json({ reports: reports || [] });
  } catch (error) {
    console.error("Get reports error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const reportId = searchParams.get("id");

    if (!reportId) {
      return NextResponse.json({ error: "Report ID required" }, { status: 400 });
    }

    const { error: deleteError } = await supabaseAdmin
      .from("ads_reports")
      .delete()
      .eq("id", reportId)
      .eq("user_id", user.id);

    if (deleteError) {
      return NextResponse.json({ error: "Failed to delete report" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete report error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// CSV Parser
function parseCSV(csvText: string): any[] {
  const lines = csvText.trim().split("\n");
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/"/g, ""));
  
  // Map common column names
  const columnMap = {
    campaign: headers.findIndex((h) => h.includes("campaign")),
    ad: headers.findIndex((h) => h.includes("ad") || h.includes("advertisement")),
    spend: headers.findIndex((h) => h.includes("spend") || h.includes("amount")),
    impressions: headers.findIndex((h) => h.includes("impression")),
    clicks: headers.findIndex((h) => h.includes("click")),
    conversions: headers.findIndex((h) => h.includes("conversion") || h.includes("result")),
    revenue: headers.findIndex((h) => h.includes("revenue") || h.includes("value") || h.includes("purchase")),
  };

  const data: any[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length < 3) continue;

    const row: any = {};
    
    if (columnMap.campaign >= 0) row.campaign_name = values[columnMap.campaign];
    if (columnMap.ad >= 0) row.ad_name = values[columnMap.ad];
    if (columnMap.spend >= 0) row.spend = parseFloat(values[columnMap.spend].replace(/[R$€£$,]/g, "")) || 0;
    if (columnMap.impressions >= 0) row.impressions = parseInt(values[columnMap.impressions].replace(/,/g, "")) || 0;
    if (columnMap.clicks >= 0) row.clicks = parseInt(values[columnMap.clicks].replace(/,/g, "")) || 0;
    if (columnMap.conversions >= 0) row.conversions = parseInt(values[columnMap.conversions].replace(/,/g, "")) || 0;
    if (columnMap.revenue >= 0) row.revenue = parseFloat(values[columnMap.revenue].replace(/[R$€£$,]/g, "")) || 0;

    // Only add if has meaningful data
    if (row.spend > 0 || row.impressions > 0) {
      data.push(row);
    }
  }

  return data;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

// Metrics Calculator
function calculateMetrics(data: any[]): any {
  const totals = data.reduce(
    (acc, row) => ({
      spend: acc.spend + (row.spend || 0),
      revenue: acc.revenue + (row.revenue || 0),
      conversions: acc.conversions + (row.conversions || 0),
      clicks: acc.clicks + (row.clicks || 0),
      impressions: acc.impressions + (row.impressions || 0),
    }),
    { spend: 0, revenue: 0, conversions: 0, clicks: 0, impressions: 0 }
  );

  const avgCTR = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0;
  const avgCPC = totals.clicks > 0 ? totals.spend / totals.clicks : 0;
  const avgCPA = totals.conversions > 0 ? totals.spend / totals.conversions : 0;
  const avgROAS = totals.spend > 0 ? totals.revenue / totals.spend : 0;

  return {
    totalSpend: Math.round(totals.spend * 100) / 100,
    totalRevenue: Math.round(totals.revenue * 100) / 100,
    totalConversions: totals.conversions,
    totalClicks: totals.clicks,
    totalImpressions: totals.impressions,
    avgCTR: Math.round(avgCTR * 100) / 100,
    avgCPC: Math.round(avgCPC * 100) / 100,
    avgCPA: Math.round(avgCPA * 100) / 100,
    avgROAS: Math.round(avgROAS * 100) / 100,
  };
}

// Top performing ads (by ROAS)
function getTopAds(data: any[], limit: number): any[] {
  return [...data]
    .filter((ad) => ad.spend > 0 && ad.conversions > 0)
    .sort((a, b) => {
      const roasA = a.revenue / a.spend;
      const roasB = b.revenue / b.spend;
      return roasB - roasA;
    })
    .slice(0, limit)
    .map((ad) => ({
      campaign_name: ad.campaign_name,
      ad_name: ad.ad_name,
      spend: ad.spend,
      revenue: ad.revenue,
      conversions: ad.conversions,
      clicks: ad.clicks,
      roas: Math.round((ad.revenue / ad.spend) * 100) / 100,
      cpa: Math.round((ad.spend / ad.conversions) * 100) / 100,
    }));
}

// Worst performing ads
function getWorstAds(data: any[], limit: number): any[] {
  return [...data]
    .filter((ad) => ad.spend > 10) // Only ads with meaningful spend
    .sort((a, b) => {
      const roasA = a.revenue / (a.spend || 1);
      const roasB = b.revenue / (b.spend || 1);
      return roasA - roasB;
    })
    .slice(0, limit)
    .map((ad) => ({
      campaign_name: ad.campaign_name,
      ad_name: ad.ad_name,
      spend: ad.spend,
      revenue: ad.revenue,
      conversions: ad.conversions,
      clicks: ad.clicks,
      roas: ad.spend > 0 ? Math.round((ad.revenue / ad.spend) * 100) / 100 : 0,
      cpa: ad.conversions > 0 ? Math.round((ad.spend / ad.conversions) * 100) / 100 : 0,
    }));
}

// AI Insights Generator (simplified - can be enhanced with OpenAI)
async function generateAIInsights(metrics: any, topAds: any[], worstAds: any[]): Promise<string> {
  const insights: string[] = [];

  // ROAS analysis
  if (metrics.avgROAS >= 3) {
    insights.push("🎯 Your campaigns are highly profitable with an average ROAS of " + metrics.avgROAS + "x. Consider scaling your top performers.");
  } else if (metrics.avgROAS >= 1.5) {
    insights.push("📈 Your campaigns are profitable but have room for optimization. Focus on improving conversion rates.");
  } else if (metrics.avgROAS >= 1) {
    insights.push("⚠️ Your campaigns are breaking even. Review ad creative and targeting to improve ROAS.");
  } else {
    insights.push("🚨 Your campaigns are losing money. Immediate action needed - review targeting, creative, and landing pages.");
  }

  // CPA analysis
  if (metrics.avgCPA < 20) {
    insights.push("💰 Your cost per acquisition is excellent ( $" + metrics.avgCPA + "). Your ads are efficiently converting.");
  } else if (metrics.avgCPA < 50) {
    insights.push("✅ Your CPA is reasonable. Look for opportunities to reduce it further.");
  } else {
    insights.push("📉 Your CPA is high. Consider testing new creatives or narrowing your audience.");
  }

  // CTR analysis
  if (metrics.avgCTR > 2) {
    insights.push("👁️ Your ad creative has strong engagement with a " + metrics.avgCTR + "% CTR.");
  } else if (metrics.avgCTR > 1) {
    insights.push("📊 Your CTR is average. Test new hooks and visuals to improve engagement.");
  } else {
    insights.push("🔽 Your CTR is low (" + metrics.avgCTR + "%). Your ads may not be resonating with the audience.");
  }

  // Top ad recommendations
  if (topAds.length > 0) {
    const bestAd = topAds[0];
    insights.push("🏆 Best performing ad: '" + bestAd.ad_name + "' in '" + bestAd.campaign_name + "' with " + bestAd.roas + "x ROAS.");
  }

  // Worst ad warnings
  if (worstAds.length > 0) {
    const worstAd = worstAds[0];
    insights.push("⚠️ Underperforming ad: '" + worstAd.ad_name + "' in '" + worstAd.campaign_name + "' is wasting $" + worstAd.spend + " with only " + worstAd.conversions + " conversions.");
  }

  return insights.join("\n\n");
}

// Get suggested frameworks based on performance
function getSuggestedFrameworks(metrics: any): any[] {
  const frameworks: any[] = [];

  // Based on ROAS
  if (metrics.avgROAS >= 3) {
    frameworks.push(
      { id: "pas", name: "Problem-Agitate-Solution", reason: "High ROAS - proven to convert" },
      { id: "story", name: "Storytelling Framework", reason: "Strong engagement - use narrative" }
    );
  } else if (metrics.avgROAS >= 1.5) {
    frameworks.push(
      { id: "aida", name: "AIDA Model", reason: "Moderate ROAS - optimize funnel" },
      { id: "features-benefits", name: "Features-Benefits", reason: "Clear value proposition needed" }
    );
  } else {
    frameworks.push(
      { id: "hook-story-offer", name: "Hook-Story-Offer", reason: "Low ROAS - need stronger hooks" },
      { id: "star", name: "STAR Method", reason: "Build trust before selling" }
    );
  }

  // Based on CTR
  if (metrics.avgCTR < 1) {
    frameworks.push(
      { id: "curiosity-gap", name: "Curiosity Gap", reason: "Low CTR - need more intriguing hooks" }
    );
  }

  return frameworks;
}