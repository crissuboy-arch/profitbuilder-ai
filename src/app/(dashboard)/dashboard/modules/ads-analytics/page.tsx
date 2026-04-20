"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Upload,
  FileSpreadsheet,
  TrendingUp,
  DollarSign,
  MousePointerClick,
  Target,
  Eye,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  Trash2,
  BarChart3,
  Activity,
  Zap,
  Award,
  X,
  Save,
  Megaphone
} from "lucide-react";
import { toast } from "sonner";

type AdData = {
  campaign_name: string;
  ad_name: string;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  ctr?: number;
  cpc?: number;
  cpa?: number;
  roas?: number;
};

type MetricsSummary = {
  totalSpend: number;
  totalRevenue: number;
  totalConversions: number;
  totalClicks: number;
  totalImpressions: number;
  avgCTR: number;
  avgCPC: number;
  avgCPA: number;
  avgROAS: number;
};

type SuggestedFramework = {
  id: string;
  name: string;
  reason: string;
};

type SavedReport = {
  id: string;
  report_name: string;
  file_name: string;
  summary: MetricsSummary;
  created_at: string;
};

export default function AdsAnalyticsPage() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [reportName, setReportName] = useState("");
  const [activeTab, setActiveTab] = useState("upload");
  
  // Data states
  const [parsedData, setParsedData] = useState<AdData[]>([]);
  const [metrics, setMetrics] = useState<MetricsSummary | null>(null);
  const [topAds, setTopAds] = useState<AdData[]>([]);
  const [worstAds, setWorstAds] = useState<AdData[]>([]);
  const [aiInsights, setAiInsights] = useState<string>("");
  const [suggestedFrameworks, setSuggestedFrameworks] = useState<SuggestedFramework[]>([]);
  const [savedReports, setSavedReports] = useState<SavedReport[]>([]);
  const [currentReportId, setCurrentReportId] = useState<string | null>(null);

  useEffect(() => {
    loadSavedReports();
  }, []);

  const loadSavedReports = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch("/api/ads-analytics", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const data = await response.json();
      if (data.reports) {
        setSavedReports(data.reports);
      }
    } catch (error) {
      console.error("Error loading reports:", error);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.name.endsWith(".csv") || droppedFile.name.endsWith(".xlsx"))) {
      setFile(droppedFile);
      if (!reportName) {
        setReportName(droppedFile.name.replace(/\.(csv|xlsx)$/i, ""));
      }
    } else {
      toast.error("Please upload a CSV or XLSX file");
    }
  }, [reportName]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && (selectedFile.name.endsWith(".csv") || selectedFile.name.endsWith(".xlsx"))) {
      setFile(selectedFile);
      if (!reportName) {
        setReportName(selectedFile.name.replace(/\.(csv|xlsx)$/i, ""));
      }
    } else {
      toast.error("Please upload a CSV or XLSX file");
    }
  };

  const parseCSV = (text: string): AdData[] => {
    const lines = text.trim().split("\n");
    if (lines.length < 2) return [];

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/"/g, ""));
    
    // Map common column names from Meta Ads export
    const columnMap = {
      campaign: headers.findIndex((h) => h.includes("campaign") || h.includes("nome da campanha")),
      ad: headers.findIndex((h) => h.includes("ad") || h.includes("advertisement") || h.includes("anúncio")),
      spend: headers.findIndex((h) => h.includes("spend") || h.includes("amount") || h.includes("gasto")),
      impressions: headers.findIndex((h) => h.includes("impression") || h.includes("impressão")),
      clicks: headers.findIndex((h) => h.includes("click") || h.includes("clique")),
      conversions: headers.findIndex((h) => h.includes("conversion") || h.includes("result") || h.includes("conversão")),
      revenue: headers.findIndex((h) => h.includes("revenue") || h.includes("value") || h.includes("purchase") || h.includes("receita")),
    };

    const data: AdData[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      if (values.length < 3) continue;

      const row: AdData = {
        campaign_name: columnMap.campaign >= 0 ? values[columnMap.campaign] || "Unknown" : "Unknown",
        ad_name: columnMap.ad >= 0 ? values[columnMap.ad] || "Unknown" : "Unknown",
        spend: columnMap.spend >= 0 ? parseFloat(values[columnMap.spend]?.replace(/[R$€£$,]/g, "") || "0") : 0,
        impressions: columnMap.impressions >= 0 ? parseInt(values[columnMap.impressions]?.replace(/,/g, "") || "0") : 0,
        clicks: columnMap.clicks >= 0 ? parseInt(values[columnMap.clicks]?.replace(/,/g, "") || "0") : 0,
        conversions: columnMap.conversions >= 0 ? parseInt(values[columnMap.conversions]?.replace(/,/g, "") || "0") : 0,
        revenue: columnMap.revenue >= 0 ? parseFloat(values[columnMap.revenue]?.replace(/[R$€£$,]/g, "") || "0") : 0,
      };

      if (row.spend > 0 || row.impressions > 0) {
        // Calculate individual metrics
        row.ctr = row.impressions > 0 ? (row.clicks / row.impressions) * 100 : 0;
        row.cpc = row.clicks > 0 ? row.spend / row.clicks : 0;
        row.cpa = row.conversions > 0 ? row.spend / row.conversions : 0;
        row.roas = row.spend > 0 ? row.revenue / row.spend : 0;
        data.push(row);
      }
    }

    return data;
  };

  const parseCSVLine = (line: string): string[] => {
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
  };

  const calculateMetrics = (data: AdData[]): MetricsSummary => {
    const totals = data.reduce(
      (acc, row) => ({
        spend: acc.spend + row.spend,
        revenue: acc.revenue + row.revenue,
        conversions: acc.conversions + row.conversions,
        clicks: acc.clicks + row.clicks,
        impressions: acc.impressions + row.impressions,
      }),
      { spend: 0, revenue: 0, conversions: 0, clicks: 0, impressions: 0 }
    );

    return {
      totalSpend: Math.round(totals.spend * 100) / 100,
      totalRevenue: Math.round(totals.revenue * 100) / 100,
      totalConversions: totals.conversions,
      totalClicks: totals.clicks,
      totalImpressions: totals.impressions,
      avgCTR: totals.impressions > 0 ? Math.round((totals.clicks / totals.impressions) * 10000) / 100 : 0,
      avgCPC: totals.clicks > 0 ? Math.round((totals.spend / totals.clicks) * 100) / 100 : 0,
      avgCPA: totals.conversions > 0 ? Math.round((totals.spend / totals.conversions) * 100) / 100 : 0,
      avgROAS: totals.spend > 0 ? Math.round((totals.revenue / totals.spend) * 100) / 100 : 0,
    };
  };

  const getTopAds = (data: AdData[], limit: number): AdData[] => {
    return [...data]
      .filter((ad) => ad.spend > 0 && ad.conversions > 0)
      .sort((a, b) => (b.roas || 0) - (a.roas || 0))
      .slice(0, limit);
  };

  const getWorstAds = (data: AdData[], limit: number): AdData[] => {
    return [...data]
      .filter((ad) => ad.spend > 10)
      .sort((a, b) => (a.roas || 0) - (b.roas || 0))
      .slice(0, limit);
  };

  const generateInsights = (metrics: MetricsSummary, topAds: AdData[], worstAds: AdData[]): string => {
    const insights: string[] = [];

    // ROAS analysis
    if (metrics.avgROAS >= 3) {
      insights.push("🎯 **Excellent ROAS**: Your campaigns are highly profitable with " + metrics.avgROAS + "x return. Consider scaling top performers.");
    } else if (metrics.avgROAS >= 1.5) {
      insights.push("📈 **Good ROAS**: Your campaigns are profitable but have room for optimization.");
    } else if (metrics.avgROAS >= 1) {
      insights.push("⚠️ **Break-even**: Your campaigns are barely profitable. Review ad creative and targeting.");
    } else {
      insights.push("🚨 **Loss**: Your campaigns are losing money. Immediate action needed.");
    }

    // CPA analysis
    if (metrics.avgCPA < 20) {
      insights.push("💰 **Excellent CPA**: $" + metrics.avgCPA + " per acquisition is highly efficient.");
    } else if (metrics.avgCPA < 50) {
      insights.push("✅ **Reasonable CPA**: $" + metrics.avgCPA + " - look for optimization opportunities.");
    } else {
      insights.push("📉 **High CPA**: $" + metrics.avgCPA + " - test new creatives or narrow audience.");
    }

    // CTR analysis
    if (metrics.avgCTR > 2) {
      insights.push("👁️ **Strong Engagement**: " + metrics.avgCTR + "% CTR shows compelling creative.");
    } else if (metrics.avgCTR > 1) {
      insights.push("📊 **Average CTR**: " + metrics.avgCTR + "% - test new hooks and visuals.");
    } else {
      insights.push("🔽 **Low CTR**: " + metrics.avgCTR + "% - ads may not resonate with audience.");
    }

    // Top ad
    if (topAds.length > 0) {
      insights.push("🏆 **Top Performer**: '" + topAds[0].ad_name + "' (" + topAds[0].roas?.toFixed(1) + "x ROAS)");
    }

    // Worst ad
    if (worstAds.length > 0) {
      insights.push("⚠️ **Needs Attention**: '" + worstAds[0].ad_name + "' - $" + worstAds[0].spend.toFixed(0) + " spend, only " + worstAds[0].conversions + " conversions");
    }

    return insights.join("\n\n");
  };

  const getSuggestedFrameworks = (metrics: MetricsSummary): SuggestedFramework[] => {
    const frameworks: SuggestedFramework[] = [];

    if (metrics.avgROAS >= 3) {
      frameworks.push(
        { id: "dor_solucao", name: "Dor → Solução", reason: "ROAS alto — comprova conversão por contraste emocional" },
        { id: "revelacao", name: "Revelação", reason: "Engajamento forte — narrativa de descoberta" }
      );
    } else if (metrics.avgROAS >= 1.5) {
      frameworks.push(
        { id: "super_headline", name: "Super Headline", reason: "ROAS moderado — headline poderosa melhora CTR" },
        { id: "oferta_beneficios", name: "Oferta + Benefícios", reason: "Proposta de valor mais clara aumenta conversão" }
      );
    } else {
      frameworks.push(
        { id: "problema_vs_solucao", name: "Problema vs. Solução", reason: "ROAS baixo — contraste direto aumenta urgência" },
        { id: "prova_explicada", name: "Prova Explicada", reason: "Construa confiança antes de vender" }
      );
    }

    if (metrics.avgCTR < 1) {
      frameworks.push({ id: "caixinha_pergunta", name: "Caixinha de Perguntas", reason: "CTR baixo — perguntas criam curiosidade e cliques" });
    }

    return frameworks;
  };

  const handleSendToAdsGenerator = (frameworkIds: string[]) => {
    const params = new URLSearchParams({ frameworks: frameworkIds.join(",") });
    router.push(`/dashboard/modules/ads-generator?${params.toString()}`);
  };

  const processFile = async () => {
    if (!file) {
      toast.error("Please select a file first");
      return;
    }

    setIsLoading(true);

    try {
      let data: AdData[] = [];
      
      if (file.name.endsWith(".csv")) {
        const text = await file.text();
        data = parseCSV(text);
      } else {
        toast.error("XLSX parsing not implemented yet. Please use CSV format.");
        setIsLoading(false);
        return;
      }

      if (data.length === 0) {
        toast.error("No valid data found in the file");
        setIsLoading(false);
        return;
      }

      // Calculate metrics
      const calculatedMetrics = calculateMetrics(data);
      setMetrics(calculatedMetrics);

      // Get top/worst ads
      const top = getTopAds(data, 5);
      const worst = getWorstAds(data, 5);
      setTopAds(top);
      setWorstAds(worst);

      // Generate insights
      const insights = generateInsights(calculatedMetrics, top, worst);
      setAiInsights(insights);

      // Get suggested frameworks
      const frameworks = getSuggestedFrameworks(calculatedMetrics);
      setSuggestedFrameworks(frameworks);

      setParsedData(data);
      setActiveTab("dashboard");
      toast.success("Report processed successfully!");
    } catch (error) {
      console.error("Error processing file:", error);
      toast.error("Failed to process file");
    } finally {
      setIsLoading(false);
    }
  };

  const saveReport = async () => {
    if (!metrics) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please log in to save reports");
        return;
      }

      const formData = new FormData();
      formData.append("file", file || new Blob());
      formData.append("reportName", reportName || file?.name || "Report");

      // For saving, we need to send the already parsed data
      // Since we can't re-send the file easily, we'll create a simplified version
      const response = await fetch("/api/ads-analytics", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        if (data.report) {
          setCurrentReportId(data.report.id);
          toast.success("Report saved!");
          loadSavedReports();
        }
      } else {
        toast.error("Failed to save report");
      }
    } catch (error) {
      console.error("Error saving report:", error);
      toast.error("Failed to save report");
    }
  };

  const deleteReport = async (reportId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`/api/ads-analytics?id=${reportId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        toast.success("Report deleted");
        loadSavedReports();
      }
    } catch (error) {
      console.error("Error deleting report:", error);
      toast.error("Failed to delete report");
    }
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatNumber = (value: number): string => {
    return new Intl.NumberFormat("en-US").format(value);
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl">
          <BarChart3 className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Ads Analytics</h1>
          <p className="text-muted-foreground">Upload Meta Ads reports and get AI-powered insights</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="upload">
            <Upload className="w-4 h-4 mr-2" />
            Upload Report
          </TabsTrigger>
          <TabsTrigger value="dashboard">
            <BarChart3 className="w-4 h-4 mr-2" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="insights">
            <Sparkles className="w-4 h-4 mr-2" />
            AI Insights
          </TabsTrigger>
          <TabsTrigger value="history">
            <Activity className="w-4 h-4 mr-2" />
            History
          </TabsTrigger>
        </TabsList>

        {/* Upload Tab */}
        <TabsContent value="upload">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Drop Zone */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5" />
                  Upload Meta Ads Report
                </CardTitle>
                <CardDescription>
                  Drag and drop your CSV or XLSX file here
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`
                    border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer
                    ${isDragging 
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-950" 
                      : "border-gray-300 dark:border-gray-700 hover:border-gray-400"
                    }
                  `}
                >
                  <input
                    type="file"
                    accept=".csv,.xlsx"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    {file ? (
                      <div className="text-sm">
                        <p className="font-medium text-gray-900 dark:text-gray-100">{file.name}</p>
                        <p className="text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="mt-2"
                          onClick={(e) => {
                            e.preventDefault();
                            setFile(null);
                          }}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">
                        Drop your file here or click to browse
                      </p>
                    )}
                  </label>
                </div>

                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <h4 className="font-medium text-sm mb-2">Expected columns:</h4>
                  <div className="flex flex-wrap gap-2">
                    {["Campaign Name", "Ad Name", "Spend", "Impressions", "Clicks", "Conversions", "Revenue"].map((col) => (
                      <Badge key={col} variant="secondary" className="text-xs">
                        {col}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Report Details */}
            <Card>
              <CardHeader>
                <CardTitle>Report Details</CardTitle>
                <CardDescription>Name your report for easy identification</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="reportName">Report Name</Label>
                  <Input
                    id="reportName"
                    value={reportName}
                    onChange={(e) => setReportName(e.target.value)}
                    placeholder="e.g., Q1 2024 Campaign Results"
                    className="mt-1"
                  />
                </div>

                <Button 
                  onClick={processFile} 
                  disabled={!file || isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Analyze Report
                    </>
                  )}
                </Button>

                {parsedData.length > 0 && (
                  <Button 
                    variant="outline" 
                    onClick={saveReport}
                    className="w-full"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Report
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard">
          {!metrics ? (
            <Card>
              <CardContent className="py-12 text-center">
                <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">No data yet</h3>
                <p className="text-muted-foreground mb-4">Upload a report to see your analytics</p>
                <Button onClick={() => setActiveTab("upload")}>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Report
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Spend</p>
                        <p className="text-2xl font-bold">{formatCurrency(metrics.totalSpend)}</p>
                      </div>
                      <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
                        <DollarSign className="w-5 h-5 text-red-600 dark:text-red-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Revenue</p>
                        <p className="text-2xl font-bold">{formatCurrency(metrics.totalRevenue)}</p>
                      </div>
                      <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">ROAS</p>
                        <p className={`text-2xl font-bold ${metrics.avgROAS >= 2 ? 'text-green-600' : metrics.avgROAS >= 1 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {metrics.avgROAS}x
                        </p>
                      </div>
                      <div className={`p-3 rounded-lg ${metrics.avgROAS >= 2 ? 'bg-green-100 dark:bg-green-900' : metrics.avgROAS >= 1 ? 'bg-yellow-100 dark:bg-yellow-900' : 'bg-red-100 dark:bg-red-900'}`}>
                        <Activity className={`w-5 h-5 ${metrics.avgROAS >= 2 ? 'text-green-600 dark:text-green-400' : metrics.avgROAS >= 1 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">CPA</p>
                        <p className="text-2xl font-bold">{formatCurrency(metrics.avgCPA)}</p>
                      </div>
                      <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                        <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Secondary Metrics */}
              <div className="grid gap-4 md:grid-cols-4">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
                  <CardContent className="pt-6 text-center">
                    <Eye className="w-5 h-5 mx-auto mb-2 text-blue-600" />
                    <p className="text-sm text-muted-foreground">Impressions</p>
                    <p className="text-xl font-bold">{formatNumber(metrics.totalImpressions)}</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
                  <CardContent className="pt-6 text-center">
                    <MousePointerClick className="w-5 h-5 mx-auto mb-2 text-purple-600" />
                    <p className="text-sm text-muted-foreground">Clicks</p>
                    <p className="text-xl font-bold">{formatNumber(metrics.totalClicks)}</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
                  <CardContent className="pt-6 text-center">
                    <Target className="w-5 h-5 mx-auto mb-2 text-orange-600" />
                    <p className="text-sm text-muted-foreground">Conversions</p>
                    <p className="text-xl font-bold">{formatNumber(metrics.totalConversions)}</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-950 dark:to-cyan-900">
                  <CardContent className="pt-6 text-center">
                    <Zap className="w-5 h-5 mx-auto mb-2 text-cyan-600" />
                    <p className="text-sm text-muted-foreground">CTR</p>
                    <p className="text-xl font-bold">{metrics.avgCTR}%</p>
                  </CardContent>
                </Card>
              </div>

              {/* Top & Worst Ads */}
              <div className="grid gap-6 md:grid-cols-2">
                {/* Top Performing Ads */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-yellow-500" />
                      Top Performing Ads
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {topAds.map((ad, index) => (
                        <div key={index} className="p-4 border rounded-lg bg-green-50 dark:bg-green-950">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-medium">{ad.ad_name}</p>
                              <p className="text-xs text-muted-foreground">{ad.campaign_name}</p>
                            </div>
                            <Badge variant="default" className="bg-green-600">
                              {ad.roas?.toFixed(1)}x ROAS
                            </Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div>
                              <p className="text-muted-foreground">Spend</p>
                              <p className="font-medium">{formatCurrency(ad.spend)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Revenue</p>
                              <p className="font-medium">{formatCurrency(ad.revenue)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Conv.</p>
                              <p className="font-medium">{ad.conversions}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                      {topAds.length === 0 && (
                        <p className="text-center text-muted-foreground py-4">No ads with conversions found</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Worst Performing Ads */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                      Needs Optimization
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {worstAds.map((ad, index) => (
                        <div key={index} className="p-4 border rounded-lg bg-red-50 dark:bg-red-950">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-medium">{ad.ad_name}</p>
                              <p className="text-xs text-muted-foreground">{ad.campaign_name}</p>
                            </div>
                            <Badge variant="destructive">
                              {ad.roas?.toFixed(1)}x ROAS
                            </Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div>
                              <p className="text-muted-foreground">Spend</p>
                              <p className="font-medium">{formatCurrency(ad.spend)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Revenue</p>
                              <p className="font-medium">{formatCurrency(ad.revenue)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Conv.</p>
                              <p className="font-medium">{ad.conversions}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                      {worstAds.length === 0 && (
                        <p className="text-center text-muted-foreground py-4">No underperforming ads found</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="insights">
          {!metrics ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Sparkles className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">No insights yet</h3>
                <p className="text-muted-foreground mb-4">Upload a report to get AI-powered insights</p>
                <Button onClick={() => setActiveTab("upload")}>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Report
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {/* Insights */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-500" />
                    AI Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose dark:prose-invert max-w-none">
                    {aiInsights.split("\n\n").map((insight, index) => (
                      <div key={index} className="mb-4 p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                        <p className="text-sm">{insight}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Suggested Frameworks */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-blue-500" />
                    Recommended Frameworks
                  </CardTitle>
                  <CardDescription>
                    Based on your ad performance, these frameworks may improve results
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {suggestedFrameworks.map((framework, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{framework.name}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{framework.reason}</p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSendToAdsGenerator([framework.id])}
                            title="Usar no Ads Generator"
                          >
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {suggestedFrameworks.length === 0 && (
                      <p className="text-center text-muted-foreground py-4">No recommendations available</p>
                    )}
                  </div>

                  {suggestedFrameworks.length > 0 && (
                    <Button
                      className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                      onClick={() => handleSendToAdsGenerator(suggestedFrameworks.map(f => f.id))}
                    >
                      <Megaphone className="w-4 h-4 mr-2" />
                      Criar Anúncios com Esses Frameworks
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Saved Reports</CardTitle>
              <CardDescription>View and manage your previously uploaded reports</CardDescription>
            </CardHeader>
            <CardContent>
              {savedReports.length === 0 ? (
                <div className="text-center py-12">
                  <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium mb-2">No saved reports</h3>
                  <p className="text-muted-foreground mb-4">Upload and save reports to see them here</p>
                  <Button onClick={() => setActiveTab("upload")}>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Report
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {savedReports.map((report) => (
                    <div key={report.id} className="p-4 border rounded-lg flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">{report.report_name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {report.file_name} • {new Date(report.created_at).toLocaleDateString()}
                        </p>
                        {report.summary && (
                          <div className="flex gap-4 mt-2 text-xs">
                            <span>Spend: {formatCurrency(report.summary.totalSpend)}</span>
                            <span>ROAS: {report.summary.avgROAS}x</span>
                            <span>CPA: {formatCurrency(report.summary.avgCPA)}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <BarChart3 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteReport(report.id)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}