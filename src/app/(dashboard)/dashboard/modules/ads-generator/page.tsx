"use client";

import { useState, useCallback } from "react";
import { 
  generateAds, 
  generateFrameworkAds,
  saveAdsToProject,
  saveFrameworkAdsToProject,
  type AdsResult,
  type AdCreative
} from "./actions";
import { adFrameworks, FRAMEWORK_CATEGORIES, PSYCHOLOGICAL_TRIGGER_LABELS, type AdFramework } from "./adFrameworks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { LanguageSelect } from "@/components/shared/LanguageSelect";
import { toast } from "sonner";
import { 
  Loader2, 
  Megaphone, 
  Video, 
  Image as ImageIcon, 
  CheckCircle2, 
  Save, 
  MousePointerClick, 
  AlignLeft, 
  HeartPulse,
  Sparkles,
  Grid3X3,
  Layers,
  Copy,
  Download,
  Eye,
  Shuffle,
  Filter
} from "lucide-react";

export default function AdsGeneratorPage() {
  const [activeTab, setActiveTab] = useState<string>("classic");
  const [loading, setLoading] = useState(false);
  const [frameworkLoading, setFrameworkLoading] = useState(false);
  const [result, setResult] = useState<AdsResult | null>(null);
  const [frameworkResults, setFrameworkResults] = useState<AdCreative[] | null>(null);
  const [currentProjectName, setCurrentProjectName] = useState("");
  const [parsedLanguage, setParsedLanguage] = useState("");

  const [selectedFrameworks, setSelectedFrameworks] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [shuffledFrameworks, setShuffledFrameworks] = useState<AdFramework[]>(() => 
    [...adFrameworks].sort(() => Math.random() - 0.5)
  );

  const [productName, setProductName] = useState("");
  const [niche, setNiche] = useState("");
  const [promise, setPromise] = useState("");
  const [audience, setAudience] = useState("");
  const [price, setPrice] = useState("");
  const [frameworkCount, setFrameworkCount] = useState(7);

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

  const filteredFrameworks = categoryFilter === "all" 
    ? shuffledFrameworks 
    : shuffledFrameworks.filter(f => f.category === categoryFilter);

  async function onSubmit(formData: FormData) {
    setLoading(true);
    setResult(null);

    const product = formData.get("productName") as string;
    const language = formData.get("language") as string;
    setCurrentProjectName(`${product} Ads`);
    setParsedLanguage(language);

    const params = {
      productName: product,
      targetAudience: formData.get("targetAudience") as string,
      price: formData.get("price") as string,
      uniqueMechanism: formData.get("uniqueMechanism") as string,
      platform: formData.get("platform") as string,
      country: "Brazil",
      language: language,
    };

    const { success, data, error } = await generateAds(params);

    if (success && data) {
      setResult(data);
      toast.success(`Ad creatives generated in ${language}!`);
    } else {
      toast.error(error || "Failed to generate creatives.");
    }
    
    setLoading(false);
  }

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
    });

    if (success && data && data.length > 0) {
      setFrameworkResults(data);
      toast.success(`${data.length} ad creatives gerados!`);
    } else {
      toast.error(error || "Erro ao gerar creatives.");
    }

    setFrameworkLoading(false);
  }

  async function handleSave() {
    if (activeTab === "classic" && result) {
      toast.loading("Saving to project...", { id: "save-ads" });
      const { success, message, error } = await saveAdsToProject(result, currentProjectName);

      if (success) {
        toast.success(message, { id: "save-ads" });
      } else {
        toast.error(error, { id: "save-ads" });
      }
    } else if (activeTab === "framework" && frameworkResults) {
      toast.loading("Salvando creatives...", { id: "save-ads" });
      const { success, message, error } = await saveFrameworkAdsToProject(frameworkResults, currentProjectName);

      if (success) {
        toast.success(message, { id: "save-ads" });
      } else {
        toast.error(error, { id: "save-ads" });
      }
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
          <h1 className="text-3xl font-bold tracking-tight">Creative Ads Engine</h1>
          <p className="text-muted-foreground">40 frameworks de alta conversão para seus anúncios.</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="classic" className="gap-2">
            <AlignLeft className="w-4 h-4" />
            Clássico
          </TabsTrigger>
          <TabsTrigger value="framework" className="gap-2">
            <Grid3X3 className="w-4 h-4" />
            Framework Ads
          </TabsTrigger>
        </TabsList>

        <TabsContent value="classic">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            <Card className="xl:col-span-4 h-fit sticky top-24 border-none shadow-md">
              <CardHeader>
                <CardTitle>Ad Parameters</CardTitle>
                <CardDescription>Configure targeting variables for the ad network.</CardDescription>
              </CardHeader>
              <CardContent>
                <form action={onSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="productName">Product Name</Label>
                    <Input id="productName" name="productName" placeholder="e.g., The Growth System" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="targetAudience">Target Audience</Label>
                    <Input id="targetAudience" name="targetAudience" placeholder="e.g., Agency Owners" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Price Point / Offer</Label>
                    <Input id="price" name="price" placeholder="e.g., $997 or 'Free Masterclass'" required />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="uniqueMechanism">Unique Mechanism</Label>
                    <Textarea 
                      id="uniqueMechanism" 
                      name="uniqueMechanism" 
                      placeholder='e.g., The Arbitrage Protocol.' 
                      className="min-h-[80px]"
                      required 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="platform">Traffic Platform</Label>
                    <Input id="platform" name="platform" placeholder="Facebook/Instagram, TikTok..." required />
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t pt-4 mt-2 border-slate-100">
                    <LanguageSelect />
                  </div>

                  <Button type="submit" className="w-full bg-pink-600 hover:bg-pink-700 text-white shadow-lg mt-6" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating Hooks...
                      </>
                    ) : (
                      <>
                        <Megaphone className="mr-2 h-4 w-4" />
                        Write Creatives
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="xl:col-span-8 flex flex-col gap-6">
              {!result && !loading && (
                <div className="flex flex-col items-center justify-center h-[600px] border-2 border-dashed rounded-xl bg-slate-50/50">
                  <div className="p-4 bg-white rounded-full shadow-sm mb-4">
                    <Megaphone className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-medium text-slate-700">Awaiting Targeting Data</h3>
                  <p className="text-slate-500 max-w-sm text-center mt-2 text-sm">
                    Submit product variables to generate native translated hooks, video scripts, and ad body copy.
                  </p>
                </div>
              )}

              {loading && (
                <div className="flex flex-col items-center justify-center h-[600px] border-2 border-dashed rounded-xl bg-pink-50/30">
                  <Loader2 className="w-12 h-12 text-pink-600 animate-spin mb-4" />
                  <h3 className="text-xl font-medium text-slate-700 animate-pulse">Modeling Psychology...</h3>
                  <p className="text-slate-500 text-sm mt-2">Connecting emotional triggers for local compliance.</p>
                </div>
              )}

              {result && !loading && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  
                  <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-2 text-pink-600 font-medium tracking-tight">
                      <CheckCircle2 className="w-5 h-5" />
                      Performance Creatives Locked
                    </div>
                     <div className="flex items-center gap-3">
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md border border-slate-200">
                        Language: {parsedLanguage}
                      </span>
                      <Button onClick={handleSave} className="bg-slate-900 text-white hover:bg-slate-800 shadow-md">
                        <Save className="w-4 h-4 mr-2" />
                        Save Creatives
                      </Button>
                    </div>
                  </div>

                  <Card className="border-none shadow-md overflow-hidden bg-white">
                    <div className="bg-gradient-to-r from-pink-50 to-white px-6 py-4 border-b border-pink-100 flex items-center justify-between">
                      <h3 className="font-bold flex items-center gap-2 text-pink-900">
                        <AlignLeft className="w-5 h-5 text-pink-500" /> Primary Ad Copy (Long Form)
                      </h3>
                       <span className="text-xs uppercase tracking-wider font-bold text-pink-500 border border-pink-200 px-2 py-1 rounded bg-white">
                         Scroll-Stopping Hook
                       </span>
                    </div>
                    <CardContent className="p-6">
                      <h2 className="text-2xl font-black mb-4 tracking-tight leading-tight text-slate-900">
                        {result.scrollStoppingHook}
                      </h2>
                      <p className="text-slate-700 leading-relaxed whitespace-pre-line text-[15px]">
                        {result.primaryAdCopy}
                      </p>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="border-none shadow-sm border border-slate-200 bg-slate-50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                           <MousePointerClick className="w-4 h-4 text-slate-400" /> Retargeting (Short)
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-slate-700 leading-relaxed font-medium">
                          &ldquo;{result.shortAdCopy}&rdquo;
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm bg-rose-50 border-rose-100">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-rose-800 flex items-center gap-2">
                           <HeartPulse className="w-4 h-4" /> Emotional Triggers
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {result.emotionalTriggers.map((trigger, i) => (
                          <div key={i} className="text-sm text-rose-900 font-medium">
                            • {trigger}
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="border-none shadow-md border-l-4 border-l-purple-500">
                    <CardHeader className="bg-slate-50 pb-4 border-b">
                       <CardTitle className="flex items-center gap-2 text-slate-800">
                         <Video className="w-5 h-5 text-purple-600" /> UGC Video Script Template
                       </CardTitle>
                       <CardDescription>Hand this directly to your creator or read it yourself.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="bg-slate-900 text-purple-100 p-6 rounded-lg font-mono text-sm leading-relaxed whitespace-pre-line">
                        {result.videoAdScript}
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="border-none shadow-sm border border-blue-100 bg-blue-50/50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-blue-700 flex items-center gap-2">
                          <ImageIcon className="w-4 h-4" /> Image/Banner Headlines
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {result.imageHeadlines.map((headline, i) => (
                          <div key={i} className="bg-white p-3 rounded shadow-sm border border-blue-100 font-bold text-slate-800">
                            {headline}
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm border border-emerald-100 bg-emerald-50/50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-2">
                          <MousePointerClick className="w-4 h-4" /> CTA Suggestions
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {result.callsToAction.map((cta, i) => (
                          <div key={i} className="bg-white p-3 rounded shadow-sm border border-emerald-100 font-bold text-slate-800 flex justify-between items-center">
                            {cta}
                            <Button size="sm" variant="outline" className="border-emerald-200 text-emerald-600 h-7 text-xs ml-2">Use CTA</Button>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

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
                      Aleatório ({frameworkCount})
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-slate-500" />
                    <select 
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="flex-1 h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                    >
                      <option value="all">Todas Categorias</option>
                      <option value="conversion">Conversão</option>
                      <option value="awareness">Consciência</option>
                      <option value="retargeting">Retargeting</option>
                      <option value="native">Orgânico</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2 max-h-[400px] overflow-y-auto p-1">
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
                    <Label htmlFor="nicheFW">Nicho</Label>
                    <Input 
                      id="nicheFW" 
                      value={niche}
                      onChange={(e) => setNiche(e.target.value)}
                      placeholder="Ex: Saúde e Emagrecimento" 
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
                    Selecione frameworks e clique em &quot;Gerar com Frameworks&quot; para criar seus ads.
                  </p>
                </div>
              )}

              {frameworkLoading && (
                <div className="flex flex-col items-center justify-center h-[800px] border-2 border-dashed rounded-xl bg-pink-50/30">
                  <Loader2 className="w-16 h-16 text-pink-600 animate-spin mb-6" />
                  <h3 className="text-xl font-medium text-slate-700 animate-pulse">Criando creatives com IA...</h3>
                  <p className="text-slate-500 text-sm mt-2">Aplicando {selectedFrameworks.length > 0 ? selectedFrameworks.length : frameworkCount} frameworks de alta conversão.</p>
                </div>
              )}

              {frameworkResults && !frameworkLoading && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-2 text-pink-600 font-medium tracking-tight">
                      <CheckCircle2 className="w-5 h-5" />
                      {frameworkResults.length} Creatives Gerados
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md border border-slate-200">
                        {selectedFrameworks.length > 0 ? `${selectedFrameworks.length} frameworks` : `${frameworkCount} aleatórios`}
                      </span>
                      <Button onClick={handleSave} className="bg-slate-900 text-white hover:bg-slate-800 shadow-md">
                        <Save className="w-4 h-4 mr-2" />
                        Salvar Creatives
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    {frameworkResults.map((creative) => (
                      <Card key={creative.id} className="border-none shadow-lg overflow-hidden">
                        <div className={`px-6 py-4 border-b flex items-center justify-between ${
                          creative.frameworkId.includes('oferta') || creative.frameworkId.includes('hard') 
                            ? 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200'
                            : creative.frameworkId.includes('checklist') || creative.frameworkId.includes('passo')
                            ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
                            : creative.frameworkId.includes('ebook') || creative.frameworkId.includes('pov')
                            ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200'
                            : 'bg-gradient-to-r from-pink-50 to-rose-50 border-pink-200'
                        }`}>
                          <div>
                            <span className={`text-xs px-2 py-1 rounded border font-medium ${getCategoryColor(
                              adFrameworks.find(f => f.id === creative.frameworkId)?.category || 'native'
                            )}`}>
                              {creative.frameworkName}
                            </span>
                            <span className="ml-2 text-xs text-slate-500">
                              {PSYCHOLOGICAL_TRIGGER_LABELS[
                                adFrameworks.find(f => f.id === creative.frameworkId)?.psychologicalTrigger || 'curiosity'
                              ]}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => copyToClipboard(`${creative.headline}\n\n${creative.body}\n\n${creative.cta}`, 'Copy')}
                            >
                              <Copy className="w-4 h-4 mr-1" />
                              Copy
                            </Button>
                          </div>
                        </div>
                        <CardContent className="p-6 space-y-4">
                          <div>
                            <h3 className="font-bold text-lg text-slate-900 mb-2">{creative.headline}</h3>
                            <p className="text-slate-700 whitespace-pre-line">{creative.body}</p>
                          </div>
                          
                          <div className="flex items-center gap-2 p-3 bg-slate-100 rounded-lg">
                            <MousePointerClick className="w-4 h-4 text-slate-500" />
                            <span className="font-semibold text-slate-800">{creative.cta}</span>
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
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
