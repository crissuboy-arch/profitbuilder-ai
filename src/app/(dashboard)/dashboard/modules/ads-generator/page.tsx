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
  Heart
} from "lucide-react";

type SavedAd = {
  id: string;
  product_name: string;
  framework_name: string;
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
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
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
  const [frameworkCount, setFrameworkCount] = useState(7);

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

  const selectRandomFrameworks = (count: number) => {
    const shuffled = [...adFrameworks].sort(() => Math.random() - 0.5);
    setSelectedFrameworks(shuffled.slice(0, count).map(f => f.id));
  };

  const filteredFrameworks = shuffledFrameworks.filter(f => {
    const matchesCategory = categoryFilter === "all" || f.category === categoryFilter;
    const matchesSearch = frameworkSearch === "" || 
      f.name.toLowerCase().includes(frameworkSearch.toLowerCase()) ||
      f.description.toLowerCase().includes(frameworkSearch.toLowerCase());
    return matchesCategory && matchesSearch;
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

    const projectName = `${productName} - Framework Ads`;
    setCurrentProjectName(projectName);

    const { success, data, error } = await generateFrameworkAds({
      productName,
      niche,
      promise,
      targetAudience: audience,
      price,
      language: parsedLanguage || "Português",
      selectedFrameworks: selectedFrameworks.length > 0 ? selectedFrameworks : undefined,
      count: selectedFrameworks.length > 0 ? undefined : frameworkCount,
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

  return (
    <div className="p-8 max-w-7xl mx-auto font-[family-name:var(--font-geist-sans)]">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-pink-600/10 rounded-xl">
          <Megaphone className="w-8 h-8 text-pink-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ads Creator Pro</h1>
          <p className="text-muted-foreground">40 frameworks • Scoring inteligente • Copy Hormozi • Niche Intelligence</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="framework" className="gap-2">
            <Grid3X3 className="w-4 h-4" />
            Framework Ads
          </TabsTrigger>
          <TabsTrigger value="saved" className="gap-2">
            <Bookmark className="w-4 h-4" />
            Salvos ({savedAds.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="framework">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            <div className="xl:col-span-4 space-y-6">
              <Card className="border-none shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layers className="w-5 h-5" />
                    Frameworks ({selectedFrameworks.length} selecionados)
                  </CardTitle>
                  <CardDescription>
                    Selecione frameworks ou deixe aleatório
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
                        placeholder="Buscar framework..."
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

                  <div className="grid grid-cols-2 gap-2 max-h-[350px] overflow-y-auto p-1">
                    {filteredFrameworks.map((framework) => (
                      <button
                        key={framework.id}
                        onClick={() => toggleFramework(framework.id)}
                        className={`p-3 rounded-lg border-2 text-left transition-all ${
                          selectedFrameworks.includes(framework.id)
                            ? 'border-pink-500 bg-pink-50'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-slate-700">{framework.name}</span>
                          {selectedFrameworks.includes(framework.id) && (
                            <CheckCircle2 className="w-4 h-4 text-pink-500" />
                          )}
                        </div>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded border ${getCategoryColor(framework.category)}`}>
                          {FRAMEWORK_CATEGORIES[framework.category]}
                        </span>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-md">
                <CardHeader>
                  <CardTitle>Dados do Produto</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="productNameFW">Nome do Produto *</Label>
                    <Input 
                      id="productNameFW" 
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      placeholder="Ex: Método Transformação 3.0" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="productTypeFW">Tipo de Produto</Label>
                    <Input 
                      id="productTypeFW" 
                      value={productType}
                      onChange={(e) => setProductType(e.target.value)}
                      placeholder="Ex: Curso Online, Ebook, Mentoria" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nicheFW">Nicho *</Label>
                    <Input 
                      id="nicheFW" 
                      value={niche}
                      onChange={(e) => setNiche(e.target.value)}
                      placeholder="Ex: Saúde, Emagrecimento, Marketing" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="promiseFW">Promessa Principal *</Label>
                    <Textarea 
                      id="promiseFW" 
                      value={promise}
                      onChange={(e) => setPromise(e.target.value)}
                      placeholder="Ex: Perca 10kg em 30 dias sem dietas radicais"
                      className="min-h-[80px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="audienceFW">Público-Alvo *</Label>
                    <Input 
                      id="audienceFW" 
                      value={audience}
                      onChange={(e) => setAudience(e.target.value)}
                      placeholder="Ex: Mulheres de 30-50 anos" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priceFW">Preço</Label>
                    <Input 
                      id="priceFW" 
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="Ex: R$ 197" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="countFW">Quantidade de Ads</Label>
                    <Input 
                      id="countFW" 
                      type="number"
                      min={3}
                      max={15}
                      value={frameworkCount}
                      onChange={(e) => setFrameworkCount(parseInt(e.target.value) || 7)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4 border-t pt-4">
                    <LanguageSelect value={parsedLanguage} onChange={setParsedLanguage} />
                  </div>
                </CardContent>
              </Card>

              <Button 
                onClick={handleGenerateFrameworkAds} 
                className="w-full bg-pink-600 hover:bg-pink-700 text-white shadow-lg text-lg py-6"
                disabled={frameworkLoading}
              >
                {frameworkLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Gerando {selectedFrameworks.length > 0 ? selectedFrameworks.length : frameworkCount} Creatives...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Gerar com Frameworks
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
                  <p className="text-slate-500 max-w-sm text-center mt-2 text-sm">
                    Selecione frameworks e clique em &quot;Gerar com Frameworks&quot; para criar seus ads com scoring inteligente.
                  </p>
                </div>
              )}

              {frameworkLoading && (
                <div className="flex flex-col items-center justify-center h-[800px] border-2 border-dashed rounded-xl bg-pink-50/30">
                  <Loader2 className="w-16 h-16 text-pink-600 animate-spin mb-6" />
                  <h3 className="text-xl font-medium text-slate-700 animate-pulse">Criando creatives com IA...</h3>
                  <p className="text-slate-500 text-sm mt-2">Aplicando estrutura Hormozi + Niche Intelligence + Scoring</p>
                </div>
              )}

              {frameworkResults && !frameworkLoading && (
                <div className="space-y-6">
                  <div className="flex flex-wrap justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-2 text-pink-600 font-medium tracking-tight">
                      <CheckCircle2 className="w-5 h-5" />
                      {frameworkResults.length} Creatives Gerados
                      <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full ml-2">
                        TOP 3 Selecionados
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <select 
                        value={scoreFilter}
                        onChange={(e) => setScoreFilter(e.target.value)}
                        className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                      >
                        <option value="all">Todos Scores</option>
                        <option value="top">TOP Ads Only</option>
                        <option value="high">Alto (70+)</option>
                        <option value="medium">Médio (55-70)</option>
                      </select>
                      <Button onClick={handleSaveAll} className="bg-slate-900 text-white hover:bg-slate-800 shadow-md">
                        <Save className="w-4 h-4 mr-2" />
                        Salvar Todos
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    {filteredResults.map((creative, index) => {
                      const scoreBadge = creative.score ? getScoreBadge(creative.score.finalScore) : null;
                      
                      return (
                        <Card key={creative.id} className={`border-none shadow-lg overflow-hidden ${
                          creative.isTopAd ? 'ring-2 ring-pink-500' : ''
                        }`}>
                          <div className={`px-6 py-4 border-b flex items-center justify-between flex-wrap gap-2 ${
                            creative.isTopAd 
                              ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white'
                              : creative.frameworkId.includes('oferta') || creative.frameworkId.includes('hard') 
                              ? 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200'
                              : creative.frameworkId.includes('checklist') || creative.frameworkId.includes('passo')
                              ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
                              : creative.frameworkId.includes('ebook') || creative.frameworkId.includes('pov')
                              ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200'
                              : 'bg-gradient-to-r from-pink-50 to-rose-50 border-pink-200'
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
                              {scoreBadge && (
                                <span className={`text-xs px-2 py-1 rounded font-bold flex items-center gap-1 ${scoreBadge.bgColor} ${scoreBadge.color}`}>
                                  <Award className="w-3 h-3" />
                                  {creative.score?.finalScore}% {scoreBadge.label}
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
                                <Bookmark className="w-4 h-4 mr-1" />
                                Salvar
                              </Button>
                              <Button 
                                size="sm" 
                                variant={creative.isTopAd ? "outline" : "ghost"}
                                className={creative.isTopAd ? "border-white/30 text-white hover:bg-white/20" : ""}
                                onClick={() => copyToClipboard(`${creative.headline}\n\n${creative.body}\n\n${creative.cta}`, 'Copy')}
                              >
                                <Copy className="w-4 h-4 mr-1" />
                                Copy
                              </Button>
                            </div>
                          </div>
                          
                          {creative.score && (
                            <div className="px-6 py-3 bg-slate-50 border-b flex gap-4 flex-wrap">
                              <div className="flex items-center gap-1">
                                <Zap className="w-4 h-4 text-amber-500" />
                                <span className="text-xs text-slate-600">Hook:</span>
                                <span className="text-xs font-bold text-slate-800">{creative.score.hookScore}%</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Eye className="w-4 h-4 text-blue-500" />
                                <span className="text-xs text-slate-600">Clareza:</span>
                                <span className="text-xs font-bold text-slate-800">{creative.score.clarityScore}%</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Heart className="w-4 h-4 text-rose-500" />
                                <span className="text-xs text-slate-600">Emoção:</span>
                                <span className="text-xs font-bold text-slate-800">{creative.score.emotionScore}%</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Target className="w-4 h-4 text-emerald-500" />
                                <span className="text-xs text-slate-600">Conversão:</span>
                                <span className="text-xs font-bold text-slate-800">{creative.score.conversionScore}%</span>
                              </div>
                            </div>
                          )}
                          
                          <CardContent className="p-6 space-y-4">
                            <div>
                              <h3 className="font-bold text-xl text-slate-900 mb-2">{creative.headline}</h3>
                              <p className="text-slate-700 whitespace-pre-line">{creative.body}</p>
                            </div>
                            
                            <div className="flex items-center gap-2 p-4 bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg border border-pink-100">
                              <MousePointerClick className="w-5 h-5 text-pink-600" />
                              <span className="font-bold text-lg text-slate-800">{creative.cta}</span>
                            </div>

                            <div className="border-t pt-4">
                              <div className="flex items-center gap-2 mb-2">
                                <Eye className="w-4 h-4 text-blue-500" />
                                <span className="text-sm font-medium text-slate-700">Conceito Visual</span>
                              </div>
                              <p className="text-sm text-slate-600 mb-3">{creative.visualConcept}</p>
                              
                              <div className="flex items-center gap-2 mb-2">
                                <ImageIcon className="w-4 h-4 text-purple-500" />
                                <span className="text-sm font-medium text-slate-700">Image Prompt (DALL-E)</span>
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => copyToClipboard(creative.imagePrompt, 'Image Prompt')}
                                  className="ml-auto"
                                >
                                  <Copy className="w-3 h-3 mr-1" />
                                  Copiar
                                </Button>
                              </div>
                              <div className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-xs leading-relaxed">
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
                            <span className="text-xs text-slate-500">{ad.framework_name}</span>
                            <CardTitle className="text-base mt-1">{ad.headline}</CardTitle>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className={`text-xs px-2 py-1 rounded font-bold ${scoreBadge.bgColor} ${scoreBadge.color}`}>
                              {ad.final_score}% {scoreBadge.label}
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
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => copyToClipboard(`${ad.headline}\n\n${ad.body}\n\n${ad.cta}`, 'Ad')}
                          >
                            <Copy className="w-3 h-3 mr-1" />
                            Copy
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => copyToClipboard(ad.image_prompt, 'Image Prompt')}
                          >
                            <ImageIcon className="w-3 h-3 mr-1" />
                            Image
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleDeleteSavedAd(ad.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 ml-auto"
                          >
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
