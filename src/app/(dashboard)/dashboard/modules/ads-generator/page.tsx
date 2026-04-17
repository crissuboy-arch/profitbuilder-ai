"use client";

import { useState, useEffect } from "react";
import { 
  generateFrameworkAds,
  saveFrameworkAdsToProject,
  saveSingleAdToDatabase,
  getSavedAds,
  deleteSavedAd,
  type AdCreative
} from "./actions";
import { adFrameworks, FRAMEWORK_CATEGORIES, type AdFramework } from "./adFrameworks";
import { copyArchitectures, FUNNEL_STAGE_LABELS, type CopyArchitecture } from "./copyArchitectures";
import { getScoreBadge } from "./adScorer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { LanguageSelect } from "@/components/shared/LanguageSelect";
import { toast } from "sonner";
import { 
  Loader2, 
  Megaphone, 
  CheckCircle2, 
  Save, 
  MousePointerClick, 
  Grid3X3,
  Layers,
  Copy,
  Image as ImageIcon, 
  Shuffle,
  Filter,
  Sparkles,
  Trophy,
  Star,
  Bookmark,
  Trash2,
  Download,
  TrendingUp,
  Target,
  Eye,
  Zap,
  Award,
  Heart,
  PenTool,
  ArrowRight
} from "lucide-react";

type SavedAd = {
  id: string;
  product_name: string;
  framework_name: string;
  architecture_name: string;
  headline: string;
  body: string;
  cta: string;
  visual_concept: string;
  image_prompt: string;
  final_score: number;
  is_top_ad: boolean;
  created_at: string;
};

export default function AdsGeneratorPage() {
  const [activeTab, setActiveTab] = useState<string>("framework");
  const [frameworkLoading, setFrameworkLoading] = useState(false);
  const [frameworkResults, setFrameworkResults] = useState<AdCreative[] | null>(null);
  const [currentProjectName, setCurrentProjectName] = useState("");
  const [parsedLanguage, setParsedLanguage] = useState("");

  const [selectedFrameworks, setSelectedFrameworks] = useState<string[]>([]);
  const [selectedArchitectures, setSelectedArchitectures] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [architectureStageFilter, setArchitectureStageFilter] = useState<string>("all");
  const [scoreFilter, setScoreFilter] = useState<string>("all");
  const [frameworkSearch, setFrameworkSearch] = useState("");
  const [shuffledFrameworks, setShuffledFrameworks] = useState<AdFramework[]>(() => 
    [...adFrameworks].sort(() => Math.random() - 0.5)
  );

  const [productName, setProductName] = useState("");
  const [niche, setNiche] = useState("");
  const [promise, setPromise] = useState("");
  const [audience, setAudience] = useState("");
  const [price, setPrice] = useState("");
  const [productType, setProductType] = useState("");
  const [frameworkCount, setFrameworkCount] = useState(5);
  const [architectureCount, setArchitectureCount] = useState(2);

  const [savedAds, setSavedAds] = useState<SavedAd[]>([]);
  const [loadingSavedAds, setLoadingSavedAds] = useState(false);

  useEffect(() => {
    if (activeTab === "saved") {
      loadSavedAds();
    }
  }, [activeTab]);

  const loadSavedAds = async () => {
    setLoadingSavedAds(true);
    const { success, data, error } = await getSavedAds();
    if (success && data) {
      setSavedAds(data as SavedAd[]);
    } else if (error) {
      toast.error("Erro ao carregar anúncios salvos");
    }
    setLoadingSavedAds(false);
  };

  const handleShuffleFrameworks = () => {
    setShuffledFrameworks([...adFrameworks].sort(() => Math.random() - 0.5));
    setSelectedFrameworks([]);
  };

  const toggleFramework = (frameworkId: string) => {
    setSelectedFrameworks(prev => 
      prev.includes(frameworkId)
        ? prev.filter(id => id !== frameworkId)
        : [...prev, frameworkId]
    );
  };

  const toggleArchitecture = (architectureId: string) => {
    setSelectedArchitectures(prev => 
      prev.includes(architectureId)
        ? prev.filter(id => id !== architectureId)
        : [...prev, architectureId]
    );
  };

  const selectRandomFrameworks = (count: number) => {
    const shuffled = [...adFrameworks].sort(() => Math.random() - 0.5);
    setSelectedFrameworks(shuffled.slice(0, count).map(f => f.id));
  };

  const selectRandomArchitectures = (count: number) => {
    const shuffled = [...copyArchitectures].sort(() => Math.random() - 0.5);
    setSelectedArchitectures(shuffled.slice(0, count).map(a => a.id));
  };

  const filteredFrameworks = shuffledFrameworks.filter(f => {
    const matchesCategory = categoryFilter === "all" || f.category === categoryFilter;
    const matchesSearch = frameworkSearch === "" || 
      f.name.toLowerCase().includes(frameworkSearch.toLowerCase()) ||
      f.description.toLowerCase().includes(frameworkSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const filteredArchitectures = copyArchitectures.filter(a => {
    const matchesStage = architectureStageFilter === "all" || a.funnelStage === architectureStageFilter;
    return matchesStage;
  });

  const filteredResults = frameworkResults?.filter(c => {
    if (scoreFilter === "top" && !c.isTopAd) return false;
    if (scoreFilter === "high" && (c.score?.finalScore ?? 0) < 70) return false;
    if (scoreFilter === "medium" && ((c.score?.finalScore ?? 0) < 55 || (c.score?.finalScore ?? 0) >= 70)) return false;
    if (scoreFilter === "low" && (c.score?.finalScore ?? 0) >= 55) return false;
    return true;
  }) ?? [];

  async function handleGenerateFrameworkAds() {
    if (!productName || !promise || !audience) {
      toast.error("Por favor, preencha: Nome do Produto, Promessa e Público-Alvo.");
      return;
    }

    setFrameworkLoading(true);
    setFrameworkResults(null);

    const projectName = `${productName} - Ads Creator Pro`;
    setCurrentProjectName(projectName);

    const { success, data, error } = await generateFrameworkAds({
      productName,
      niche,
      promise,
      targetAudience: audience,
      price,
      language: parsedLanguage || "Português",
      selectedFrameworks: selectedFrameworks.length > 0 ? selectedFrameworks : undefined,
      selectedArchitectures: selectedArchitectures.length > 0 ? selectedArchitectures : undefined,
      count: selectedFrameworks.length > 0 ? undefined : frameworkCount,
      architectureCount: selectedArchitectures.length > 0 ? undefined : architectureCount,
      productType,
    });

    if (success && data && data.length > 0) {
      setFrameworkResults(data);
      toast.success(`${data.length} ad creatives gerados com sucesso!`);
    } else {
      toast.error(error || "Erro ao gerar creatives.");
    }

    setFrameworkLoading(false);
  }

  async function handleSaveAll() {
    if (!frameworkResults || frameworkResults.length === 0) return;
    
    toast.loading("Salvando creatives...", { id: "save-ads" });
    const { success, message, error } = await saveFrameworkAdsToProject(frameworkResults, currentProjectName);

    if (success) {
      toast.success(message, { id: "save-ads" });
    } else {
      toast.error(error, { id: "save-ads" });
    }
  }

  async function handleSaveSingleAd(creative: AdCreative) {
    const { success, message, error } = await saveSingleAdToDatabase(creative, productName);
    if (success) {
      toast.success(message);
    } else {
      toast.error(error || "Erro ao salvar anúncio");
    }
  }

  async function handleDeleteSavedAd(adId: string) {
    const { success, message, error } = await deleteSavedAd(adId);
    if (success) {
      toast.success(message);
      setSavedAds(prev => prev.filter(ad => ad.id !== adId));
    } else {
      toast.error(error || "Erro ao excluir");
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado!`);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "conversion": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "awareness": return "bg-blue-100 text-blue-700 border-blue-200";
      case "retargeting": return "bg-purple-100 text-purple-700 border-purple-200";
      case "native": return "bg-amber-100 text-amber-700 border-amber-200";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getArchitectureStageColor = (stage: string) => {
    switch (stage) {
      case "top": return "bg-rose-100 text-rose-700 border-rose-200";
      case "middle": return "bg-violet-100 text-violet-700 border-violet-200";
      case "bottom": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto font-[family-name:var(--font-geist-sans)]">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-pink-600/10 rounded-xl">
          <Megaphone className="w-8 h-8 text-pink-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ads Creator Pro</h1>
          <p className="text-muted-foreground">40 Frameworks • 12 Copy Architectures • Scoring Intelligent • Niche Intelligence</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="framework" className="gap-2">
            <Grid3X3 className="w-4 h-4" />
            Creator
          </TabsTrigger>
          <TabsTrigger value="saved" className="gap-2">
            <Bookmark className="w-4 h-4" />
            Salvos ({savedAds.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="framework">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            <div className="xl:col-span-4 space-y-6">
              
              {/* Frameworks Card */}
              <Card className="border-none shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-pink-600" />
                    Frameworks ({selectedFrameworks.length})
                  </CardTitle>
                  <CardDescription>
                    Visual + Layout patterns
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleShuffleFrameworks}
                      className="flex-1"
                    >
                      <Shuffle className="w-4 h-4 mr-2" />
                      Embaralhar
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => selectRandomFrameworks(frameworkCount)}
                      className="flex-1"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Aleatório
                    </Button>
                  </div>
                  
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        placeholder="Buscar..."
                        value={frameworkSearch}
                        onChange={(e) => setFrameworkSearch(e.target.value)}
                        className="h-9"
                      />
                    </div>
                    <select 
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                    >
                      <option value="all">Todos</option>
                      <option value="conversion">Conversão</option>
                      <option value="awareness">Consciência</option>
                      <option value="retargeting">Retargeting</option>
                      <option value="native">Orgânico</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto p-1">
                    {filteredFrameworks.slice(0, 20).map((framework) => (
                      <button
                        key={framework.id}
                        onClick={() => toggleFramework(framework.id)}
                        className={`p-2 rounded-lg border-2 text-left transition-all ${
                          selectedFrameworks.includes(framework.id)
                            ? 'border-pink-500 bg-pink-50'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-bold text-slate-700">{framework.name}</span>
                          {selectedFrameworks.includes(framework.id) && (
                            <CheckCircle2 className="w-3 h-3 text-pink-500" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Qtd:</span>
                    <Input 
                      type="number" 
                      min={1} 
                      max={15} 
                      value={frameworkCount}
                      onChange={(e) => setFrameworkCount(parseInt(e.target.value) || 5)}
                      className="w-16 h-8 text-sm"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Copy Architectures Card */}
              <Card className="border-none shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PenTool className="w-5 h-5 text-violet-600" />
                    Copy Styles ({selectedArchitectures.length})
                  </CardTitle>
                  <CardDescription>
                    Copy + Tone patterns
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setSelectedArchitectures([])}
                      className="flex-1"
                    >
                      <Shuffle className="w-4 h-4 mr-2" />
                      Limpar
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => selectRandomArchitectures(architectureCount)}
                      className="flex-1"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Aleatório
                    </Button>
                  </div>
                  
                  <select 
                    value={architectureStageFilter}
                    onChange={(e) => setArchitectureStageFilter(e.target.value)}
                    className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                  >
                    <option value="all">Todos os Estágios</option>
                    <option value="top">Topo de Funil</option>
                    <option value="middle">Meio de Funil</option>
                    <option value="bottom">Fundo de Funil</option>
                  </select>

                  <div className="space-y-2 max-h-[280px] overflow-y-auto">
                    {filteredArchitectures.map((arch) => (
                      <button
                        key={arch.id}
                        onClick={() => toggleArchitecture(arch.id)}
                        className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                          selectedArchitectures.includes(arch.id)
                            ? 'border-violet-500 bg-violet-50'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <span className="text-lg">{arch.emoji}</span>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-bold text-slate-800">{arch.name}</span>
                              {selectedArchitectures.includes(arch.id) && (
                                <CheckCircle2 className="w-4 h-4 text-violet-500" />
                              )}
                            </div>
                            <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{arch.description}</p>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded border mt-1 inline-block ${getArchitectureStageColor(arch.funnelStage)}`}>
                              {FUNNEL_STAGE_LABELS[arch.funnelStage]}
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Qtd:</span>
                    <Input 
                      type="number" 
                      min={1} 
                      max={5} 
                      value={architectureCount}
                      onChange={(e) => setArchitectureCount(parseInt(e.target.value) || 2)}
                      className="w-16 h-8 text-sm"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Product Data Card */}
              <Card className="border-none shadow-md">
                <CardHeader>
                  <CardTitle>Dados do Produto</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="productNameFW" className="text-xs">Nome do Produto *</Label>
                    <Input 
                      id="productNameFW" 
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      placeholder="Ex: Método Transformação" 
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="productTypeFW" className="text-xs">Tipo</Label>
                    <Input 
                      id="productTypeFW" 
                      value={productType}
                      onChange={(e) => setProductType(e.target.value)}
                      placeholder="Curso, Ebook, Mentoria" 
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="nicheFW" className="text-xs">Nicho *</Label>
                    <Input 
                      id="nicheFW" 
                      value={niche}
                      onChange={(e) => setNiche(e.target.value)}
                      placeholder="Ex: Emagrecimento, Marketing" 
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="promiseFW" className="text-xs">Promessa *</Label>
                    <Textarea 
                      id="promiseFW" 
                      value={promise}
                      onChange={(e) => setPromise(e.target.value)}
                      placeholder="Ex: Perca 10kg em 30 dias"
                      className="min-h-[60px] text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="audienceFW" className="text-xs">Público-Alvo *</Label>
                    <Input 
                      id="audienceFW" 
                      value={audience}
                      onChange={(e) => setAudience(e.target.value)}
                      placeholder="Ex: Mulheres 30-50 anos" 
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="priceFW" className="text-xs">Preço</Label>
                    <Input 
                      id="priceFW" 
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="Ex: R$ 197" 
                      className="h-9"
                    />
                  </div>
                  <div className="border-t pt-3">
                    <LanguageSelect value={parsedLanguage} onChange={setParsedLanguage} />
                  </div>
                </CardContent>
              </Card>

              <Button 
                onClick={handleGenerateFrameworkAds} 
                className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white shadow-lg text-lg py-6"
                disabled={frameworkLoading}
              >
                {frameworkLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Gerando Creatives...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Gerar Ads com IA
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </div>

            <div className="xl:col-span-8">
              {!frameworkResults && !frameworkLoading && (
                <div className="flex flex-col items-center justify-center h-[800px] border-2 border-dashed rounded-xl bg-slate-50/50">
                  <div className="p-4 bg-white rounded-full shadow-sm mb-4">
                    <Grid3X3 className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-medium text-slate-700">Preview dos Creatives</h3>
                  <p className="text-slate-500 max-w-md text-center mt-2 text-sm">
                    Selecione frameworks, copy styles e clique em &quot;Gerar Ads com IA&quot; para criar seus anúncios.
                  </p>
                </div>
              )}

              {frameworkLoading && (
                <div className="flex flex-col items-center justify-center h-[800px] border-2 border-dashed rounded-xl bg-gradient-to-br from-pink-50 to-violet-50">
                  <Loader2 className="w-16 h-16 text-pink-600 animate-spin mb-6" />
                  <h3 className="text-xl font-medium text-slate-700 animate-pulse">Criando creatives...</h3>
                  <p className="text-slate-500 text-sm mt-2">Combinando frameworks + copy architectures</p>
                </div>
              )}

              {frameworkResults && !frameworkLoading && (
                <div className="space-y-6">
                  <div className="flex flex-wrap justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-2 text-pink-600 font-medium">
                      <CheckCircle2 className="w-5 h-5" />
                      {frameworkResults.length} Creatives
                      <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                        TOP {frameworkResults.filter(c => c.isTopAd).length}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <select 
                        value={scoreFilter}
                        onChange={(e) => setScoreFilter(e.target.value)}
                        className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                      >
                        <option value="all">Todos</option>
                        <option value="top">TOP Only</option>
                        <option value="high">70+</option>
                        <option value="medium">55-70</option>
                      </select>
                      <Button onClick={handleSaveAll} className="bg-slate-900 text-white hover:bg-slate-800">
                        <Save className="w-4 h-4 mr-2" />
                        Salvar Todos
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {filteredResults.map((creative, index) => {
                      const scoreBadge = creative.score ? getScoreBadge(creative.score.finalScore) : null;
                      
                      return (
                        <Card key={creative.id} className={`border overflow-hidden ${creative.isTopAd ? 'ring-2 ring-pink-500 shadow-lg' : 'shadow-md'}`}>
                          <div className={`px-5 py-4 border-b flex items-center justify-between flex-wrap gap-2 ${
                            creative.isTopAd 
                              ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white'
                              : 'bg-slate-50'
                          }`}>
                            <div className="flex items-center gap-2 flex-wrap">
                              {creative.isTopAd && (
                                <span className="bg-white/20 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                  <Trophy className="w-3 h-3" />
                                  TOP {index + 1}
                                </span>
                              )}
                              <span className={`text-xs px-2 py-1 rounded border font-medium ${
                                creative.isTopAd 
                                  ? 'bg-white/20 text-white border-white/30'
                                  : getCategoryColor(adFrameworks.find(f => f.id === creative.frameworkId)?.category || 'native')
                              }`}>
                                {creative.frameworkName}
                              </span>
                              <span className={`text-xs px-2 py-1 rounded border font-medium ${
                                creative.isTopAd 
                                  ? 'bg-white/20 text-white border-white/30'
                                  : 'bg-violet-100 text-violet-700 border-violet-200'
                              }`}>
                                {creative.architectureName || copyArchitectures.find(a => a.id === creative.architectureId)?.name || 'Custom'}
                              </span>
                              {scoreBadge && (
                                <span className={`text-xs px-2 py-1 rounded font-bold flex items-center gap-1 ${scoreBadge.bgColor} ${scoreBadge.color}`}>
                                  <Award className="w-3 h-3" />
                                  {creative.score?.finalScore ?? 0}% {scoreBadge.label}
                                </span>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant={creative.isTopAd ? "outline" : "ghost"}
                                className={creative.isTopAd ? "border-white/30 text-white hover:bg-white/20" : ""}
                                onClick={() => handleSaveSingleAd(creative)}
                              >
                                <Bookmark className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant={creative.isTopAd ? "outline" : "ghost"}
                                className={creative.isTopAd ? "border-white/30 text-white hover:bg-white/20" : ""}
                                onClick={() => copyToClipboard(`${creative.headline}\n\n${creative.body}\n\n${creative.cta}`, 'Copy')}
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          
                          {creative.score && (
                            <div className="px-5 py-2 bg-slate-50 border-b flex gap-4 text-xs flex-wrap">
                              <div className="flex items-center gap-1">
                                <Zap className="w-3 h-3 text-amber-500" />
                                <span className="text-slate-500">Hook:</span>
                                <span className="font-bold">{creative.score.hookScore}%</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Eye className="w-3 h-3 text-blue-500" />
                                <span className="text-slate-500">Clareza:</span>
                                <span className="font-bold">{creative.score.clarityScore}%</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Heart className="w-3 h-3 text-rose-500" />
                                <span className="text-slate-500">Emoção:</span>
                                <span className="font-bold">{creative.score.emotionScore}%</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Target className="w-3 h-3 text-emerald-500" />
                                <span className="text-slate-500">Conversão:</span>
                                <span className="font-bold">{creative.score.conversionScore}%</span>
                              </div>
                            </div>
                          )}
                          
                          <CardContent className="p-5 space-y-4">
                            <div>
                              <h3 className={`font-bold text-lg ${creative.isTopAd ? 'text-white' : 'text-slate-900'}`}>
                                {creative.headline}
                              </h3>
                              <p className={`mt-2 whitespace-pre-line ${creative.isTopAd ? 'text-white/90' : 'text-slate-700'}`}>
                                {creative.body}
                              </p>
                            </div>
                            
                            <div className={`flex items-center gap-2 p-3 rounded-lg ${
                              creative.isTopAd ? 'bg-white/20' : 'bg-pink-50 border border-pink-100'
                            }`}>
                              <MousePointerClick className={`w-5 h-5 ${creative.isTopAd ? 'text-white' : 'text-pink-600'}`} />
                              <span className={`font-bold ${creative.isTopAd ? 'text-white' : 'text-slate-800'}`}>{creative.cta}</span>
                            </div>

                            <div className="border-t pt-4">
                              <div className="flex items-center gap-2 mb-2">
                                <Eye className={`w-4 h-4 ${creative.isTopAd ? 'text-white/70' : 'text-blue-500'}`} />
                                <span className={`text-sm font-medium ${creative.isTopAd ? 'text-white/80' : 'text-slate-700'}`}>Visual</span>
                              </div>
                              <p className={`text-sm mb-3 ${creative.isTopAd ? 'text-white/70' : 'text-slate-600'}`}>{creative.visualConcept}</p>
                              
                              <div className="flex items-center gap-2 mb-2">
                                <ImageIcon className={`w-4 h-4 ${creative.isTopAd ? 'text-white/70' : 'text-purple-500'}`} />
                                <span className={`text-sm font-medium ${creative.isTopAd ? 'text-white/80' : 'text-slate-700'}`}>DALL-E Prompt</span>
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => copyToClipboard(creative.imagePrompt, 'Prompt')}
                                  className={`ml-auto ${creative.isTopAd ? 'text-white/80 hover:bg-white/10' : ''}`}
                                >
                                  <Copy className="w-3 h-3 mr-1" />
                                  Copiar
                                </Button>
                              </div>
                              <div className={`p-3 rounded-lg font-mono text-xs leading-relaxed ${
                                creative.isTopAd ? 'bg-white/10 text-white/90' : 'bg-slate-900 text-slate-100'
                              }`}>
                                {creative.imagePrompt}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="saved">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-pink-600" />
                Anúncios Salvos
              </h2>
              <Button variant="outline" onClick={loadSavedAds} size="sm">
                <Loader2 className={`w-4 h-4 mr-2 ${loadingSavedAds ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
            </div>

            {loadingSavedAds && (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 text-pink-600 animate-spin" />
              </div>
            )}

            {!loadingSavedAds && savedAds.length === 0 && (
              <div className="flex flex-col items-center justify-center h-[400px] border-2 border-dashed rounded-xl bg-slate-50/50">
                <Bookmark className="w-12 h-12 text-slate-300 mb-4" />
                <h3 className="text-lg font-medium text-slate-700">Nenhum anúncio salvo</h3>
                <p className="text-slate-500 text-sm mt-2">Salve seus melhores ads para acessá-los aqui depois.</p>
              </div>
            )}

            {!loadingSavedAds && savedAds.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savedAds.map((ad) => {
                  const scoreBadge = getScoreBadge(ad.final_score);
                  
                  return (
                    <Card key={ad.id} className="border border-slate-200 shadow-sm">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] text-slate-500">{ad.framework_name} • {ad.architecture_name || 'Custom'}</span>
                            <CardTitle className="text-base mt-1">{ad.headline}</CardTitle>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className={`text-xs px-2 py-1 rounded font-bold ${scoreBadge.bgColor} ${scoreBadge.color}`}>
                              {ad.final_score}%
                            </span>
                            {ad.is_top_ad && (
                              <span className="text-xs bg-pink-100 text-pink-700 px-2 py-0.5 rounded flex items-center gap-1">
                                <Trophy className="w-3 h-3" />
                                TOP
                              </span>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-slate-600 line-clamp-2 mb-3">{ad.body}</p>
                        <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
                          <MousePointerClick className="w-4 h-4" />
                          <span>{ad.cta}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => copyToClipboard(`${ad.headline}\n\n${ad.body}\n\n${ad.cta}`, 'Ad')}>
                            <Copy className="w-3 h-3 mr-1" />
                            Copy
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => copyToClipboard(ad.image_prompt, 'Image')}>
                            <ImageIcon className="w-3 h-3 mr-1" />
                            Image
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDeleteSavedAd(ad.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50 ml-auto">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
