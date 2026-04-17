"use client";

import { useState } from "react";
import { generateMarketingAssets, type MarketingAssets, type GeneratedAd, type GeneratedSalesPage, type GeneratedBook } from "@/lib/marketingPipeline";
import { generateAdImage, generateSalesPageVisual, generateBookCover, generateChapterImage } from "@/lib/imageGeneration";
import { getSmartRecommendations, type ProductContext } from "@/lib/smartDecisions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { 
  Loader2, 
  Sparkles, 
  Megaphone, 
  FileText, 
  Image as ImageIcon,
  ArrowRight,
  CheckCircle2,
  Zap,
  Target,
  Palette,
  BookOpen,
  DollarSign,
  TrendingUp,
  Eye,
  MousePointerClick,
  Copy,
  Download,
  RefreshCw,
  Wand2,
  Layout,
  BarChart3,
  Lightbulb,
  Award,
  AlertTriangle
} from "lucide-react";

type ProductType = "digital_product" | "physical_product" | "service" | "course" | "membership" | "ebook" | "software" | "coaching";

export default function MarketingMachinePage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState("");
  const [progress, setProgress] = useState(0);
  
  // Product Input
  const [productName, setProductName] = useState("");
  const [productType, setProductType] = useState<ProductType>("digital_product");
  const [niche, setNiche] = useState("");
  const [price, setPrice] = useState("");
  const [mechanism, setMechanism] = useState("");
  const [promise, setPromise] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [mainPainPoint, setMainPainPoint] = useState("");
  const [language, setLanguage] = useState("pt");
  
  // Generation Options
  const [generateSalesPage, setGenerateSalesPage] = useState(true);
  const [generateAds, setGenerateAds] = useState(true);
  const [generateBook, setGenerateBook] = useState(false);
  const [adCount, setAdCount] = useState(5);
  
  // Results
  const [assets, setAssets] = useState<MarketingAssets | null>(null);
  const [activeTab, setActiveTab] = useState("input");

  const handleGenerate = async () => {
    if (!productName || !niche || !price || !promise) {
      toast.error("Por favor, preencha os campos obrigatórios: Produto, Nicho, Preço e Promessa.");
      return;
    }
    
    setIsGenerating(true);
    setProgress(0);
    setGenerationStep("Analisando produto e gerando recomendações...");
    
    try {
      // Get smart recommendations first
      const priceNum = parseFloat(price) || 0;
      const priceRange = priceNum === 0 ? "free" : priceNum <= 50 ? "low" : priceNum <= 200 ? "medium" : priceNum <= 500 ? "high" : "premium";
      
      const context: ProductContext = {
        productName,
        productType,
        niche,
        price: priceNum,
        priceRange,
        targetAudience: targetAudience || "target audience",
        mainPainPoint: mainPainPoint || "main problem",
        mainPromise: promise,
        mechanism,
      };
      
      const recommendations = getSmartRecommendations(context);
      setProgress(20);
      setGenerationStep("Recomendações geradas! Iniciando geração de conteúdo...");
      
      // Generate all assets
      const result = await generateMarketingAssets({
        productName,
        productType,
        niche,
        price: priceNum,
        mechanism,
        promise,
        targetAudience,
        mainPainPoint,
        language: language as "pt" | "en" | "es",
        generateSalesPage,
        generateAds,
        generateBook,
        adCount,
      });
      
      setProgress(100);
      setGenerationStep("Completo!");
      setAssets(result);
      setActiveTab("results");
      toast.success("Marketing assets gerados com sucesso!");
      
    } catch (error) {
      console.error("Generation error:", error);
      toast.error("Erro ao gerar assets. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-gradient-to-br from-teal-600 to-cyan-600 rounded-xl">
          <Zap className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Marketing Machine</h1>
          <p className="text-muted-foreground"> Gere todos os marketing assets automaticamente</p>
        </div>
      </div>

      {/* Progress Bar */}
      {isGenerating && (
        <Card className="mb-6 border-teal-500/30 bg-teal-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-2">
              <Loader2 className="w-5 h-5 animate-spin text-teal-500" />
              <span className="text-sm font-medium">{generationStep}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="input">
            <Target className="w-4 h-4 mr-2" />
            Produto
          </TabsTrigger>
          <TabsTrigger value="results" disabled={!assets}>
            <Sparkles className="w-4 h-4 mr-2" />
            Resultados
          </TabsTrigger>
        </TabsList>

        {/* Input Tab */}
        <TabsContent value="input">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Product Data */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Dados do Produto
                </CardTitle>
                <CardDescription>
                  Informações básicas do seu produto
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="productName">Nome do Produto *</Label>
                  <Input
                    id="productName"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="Ex: Método Turbo Transformação"
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Tipo de Produto</Label>
                    <Select value={productType} onValueChange={(v) => setProductType(v as ProductType)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="digital_product">Produto Digital</SelectItem>
                        <SelectItem value="course">Curso Online</SelectItem>
                        <SelectItem value="ebook">Ebook</SelectItem>
                        <SelectItem value="software">Software/SaaS</SelectItem>
                        <SelectItem value="membership">Assinatura</SelectItem>
                        <SelectItem value="coaching">Consultoria/Coaching</SelectItem>
                        <SelectItem value="service">Serviço</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="price">Preço (USD) *</Label>
                    <Input
                      id="price"
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="97"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="niche">Nichoo *</Label>
                  <Input
                    id="niche"
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                    placeholder="Ex: fitness, business, saúde, marketing"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="promise">Promessa Principal *</Label>
                  <Input
                    id="promise"
                    value={promise}
                    onChange={(e) => setPromise(e.target.value)}
                    placeholder="Ex: perder 10kg em 30 dias"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="mechanism">Mecanismo (como funciona)</Label>
                  <Textarea
                    id="mechanism"
                    value={mechanism}
                    onChange={(e) => setMechanism(e.target.value)}
                    placeholder="Ex: sistema de treino intervalado + plano alimentar"
                    className="mt-1"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Audience & Options */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Público & Opções
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="targetAudience">Público Alvo</Label>
                  <Input
                    id="targetAudience"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="Ex: mulheres 30-50 anos"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="mainPainPoint">Principal Dor</Label>
                  <Textarea
                    id="mainPainPoint"
                    value={mainPainPoint}
                    onChange={(e) => setMainPainPoint(e.target.value)}
                    placeholder="Ex: já tentou de tudo mas não consegue emagrecer"
                    className="mt-1"
                    rows={2}
                  />
                </div>

                <div>
                  <Label>Idioma</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt">Português</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="border-t pt-4">
                  <Label className="mb-3 block">O que gerar:</Label>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        <span className="text-sm">Sales Page</span>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={generateSalesPage}
                        onChange={(e) => setGenerateSalesPage(e.target.checked)}
                        className="w-4 h-4"
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Megaphone className="w-4 h-4" />
                        <span className="text-sm">Anúncios (imagens + copy)</span>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={generateAds}
                        onChange={(e) => setGenerateAds(e.target.checked)}
                        className="w-4 h-4"
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        <span className="text-sm">Livro/Ebook</span>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={generateBook}
                        onChange={(e) => setGenerateBook(e.target.checked)}
                        className="w-4 h-4"
                      />
                    </div>
                  </div>
                </div>

                {generateAds && (
                  <div>
                    <Label>Quantidade de anúncios</Label>
                    <Select value={String(adCount)} onValueChange={(v) => setAdCount(Number(v))}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 anúncios</SelectItem>
                        <SelectItem value="5">5 anúncios</SelectItem>
                        <SelectItem value="10">10 anúncios</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <Button 
                  onClick={handleGenerate}
                  disabled={isGenerating || !productName || !niche || !price || !promise}
                  className="w-full mt-4"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Gerar Marketing Assets
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Smart Recommendations Preview */}
          {productName && niche && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  Recomendações Inteligentes
                </CardTitle>
                <CardDescription>
                  O sistema irá selecionar automaticamente os melhores frameworks e abordagens
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="p-4 bg-teal-50 dark:bg-teal-950 rounded-lg">
                    <h4 className="font-semibold text-teal-700 dark:text-teal-300 mb-2">🎯 Frameworks Selecionados</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Problem-Agitate-Solution</li>
                      <li>• Hook-Story-Offer</li>
                      <li>• Storytelling</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                    <h4 className="font-semibold text-purple-700 dark:text-purple-300 mb-2">📝 Arquiteturas de Copy</h4>
                    <ul className="text-sm space-y-1">
                      <li>• AIDA Viral</li>
                      <li>• Authority</li>
                      <li>• Mini Aula</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">🎨 Estilo Visual</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Composição: {niche.toLowerCase().includes('fitness') ? 'Transformação' : 'Professional'}</li>
                      <li>• Cores: Teal/Cyan</li>
                      <li>• Tipo: High-contrast</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Results Tab */}
        <TabsContent value="results">
          {assets && (
            <div className="space-y-6">
              {/* Recommendations Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-500" />
                    Recomendações do Sistema
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <h4 className="font-semibold mb-2">Melhores Frameworks</h4>
                      <div className="flex flex-wrap gap-2">
                        {assets.recommendations.frameworks.slice(0, 3).map((f, i) => (
                          <Badge key={i} variant="outline" className="bg-teal-50">
                            {f.frameworkName}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Arquiteturas Recomendadas</h4>
                      <div className="flex flex-wrap gap-2">
                        {assets.recommendations.architectures.slice(0, 3).map((a, i) => (
                          <Badge key={i} variant="outline" className="bg-purple-50">
                            {a.architectureName}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Estilo Visual</h4>
                      <p className="text-sm text-muted-foreground">
                        {assets.recommendations.visualStyle.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sales Page Results */}
              {assets.salesPage && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-teal-500" />
                      Sales Page Gerada
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Hero */}
                    <div className="p-4 bg-gradient-to-r from-teal-950/30 to-cyan-950/30 rounded-lg">
                      <Badge className="mb-2">Hero Section</Badge>
                      <h3 className="text-xl font-bold">{assets.salesPage.headline}</h3>
                      <p className="text-muted-foreground mt-1">{assets.salesPage.subheadline}</p>
                      <div className="flex items-center gap-4 mt-3">
                        <Button size="sm">{assets.salesPage.ctaText}</Button>
                        <span className="text-sm text-muted-foreground">{assets.salesPage.proofText}</span>
                      </div>
                    </div>

                    {/* Problem */}
                    <div>
                      <Badge className="mb-2">Problema</Badge>
                      <h4 className="font-semibold">{assets.salesPage.problemHeadline}</h4>
                      <ul className="mt-2 space-y-1">
                        {assets.salesPage.painPoints.map((p, i) => (
                          <li key={i} className="text-sm flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                            {p}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Solution/Benefits */}
                    <div>
                      <Badge className="mb-2">Solução</Badge>
                      <h4 className="font-semibold">{assets.salesPage.solutionHeadline}</h4>
                      <div className="grid gap-2 mt-2 md:grid-cols-2">
                        {assets.salesPage.benefits.map((b, i) => (
                          <div key={i} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                            <div className="font-medium">{b.title}</div>
                            <div className="text-sm text-muted-foreground">{b.description}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Offer */}
                    <div className="p-4 border-2 border-teal-500/30 rounded-lg">
                      <Badge className="mb-2">Oferta</Badge>
                      <div className="flex items-baseline gap-4">
                        <span className="text-3xl font-bold text-teal-500">
                          {formatCurrency(assets.salesPage.price)}
                        </span>
                        <span className="text-lg text-muted-foreground line-through">
                          {formatCurrency(assets.salesPage.originalPrice)}
                        </span>
                      </div>
                      <div className="mt-3">
                        <h5 className="font-semibold mb-2">Bônus incluídos:</h5>
                        <ul className="space-y-1">
                          {assets.salesPage.bonuses.map((b, i) => (
                            <li key={i} className="text-sm flex items-center gap-2">
                              <Gift className="w-4 h-4 text-teal-500" />
                              {b.title} - <span className="text-teal-600">{formatCurrency(b.value)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* CTA */}
                    <div className="text-center">
                      <Button size="lg" className="w-full md:w-auto">
                        {assets.salesPage.ctaBlocks[0]?.text || "Quero Garantir Agora"}
                      </Button>
                      <p className="text-sm text-muted-foreground mt-2">
                        {assets.salesPage.ctaBlocks[0]?.urgency}
                      </p>
                    </div>

                    {/* Visuals */}
                    {assets.salesPage.heroImage && (
                      <div>
                        <Badge className="mb-2">Visuais Gerados</Badge>
                        <div className="grid gap-4 md:grid-cols-3">
                          <div>
                            <p className="text-sm font-medium mb-1">Hero</p>
                            <img 
                              src={assets.salesPage.heroImage.url} 
                              alt="Hero" 
                              className="rounded-lg w-full"
                            />
                          </div>
                          {assets.salesPage.solutionImage && (
                            <div>
                              <p className="text-sm font-medium mb-1">Solução</p>
                              <img 
                                src={assets.salesPage.solutionImage.url} 
                                alt="Solution" 
                                className="rounded-lg w-full"
                              />
                            </div>
                          )}
                          {assets.salesPage.socialProofImage && (
                            <div>
                              <p className="text-sm font-medium mb-1">Prova Social</p>
                              <img 
                                src={assets.salesPage.socialProofImage.url} 
                                alt="Social Proof" 
                                className="rounded-lg w-full"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Ads Results */}
              {assets.ads && assets.ads.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Megaphone className="w-5 h-5 text-red-500" />
                      Anúncios Gerados ({assets.ads.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6 md:grid-cols-2">
                      {assets.ads.map((ad, index) => (
                        <div key={index} className="border rounded-lg overflow-hidden">
                          {/* Generated Image */}
                          {ad.generatedImage && (
                            <div className="relative">
                              <img 
                                src={ad.generatedImage.url} 
                                alt={ad.headline}
                                className="w-full aspect-video object-cover"
                              />
                              <Badge className="absolute top-2 left-2" variant="secondary">
                                {ad.frameworkName}
                              </Badge>
                            </div>
                          )}
                          
                          {/* Copy */}
                          <div className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">{ad.architectureName}</Badge>
                            </div>
                            <h4 className="font-bold text-lg">{ad.headline}</h4>
                            <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{ad.body}</p>
                            <div className="mt-3 flex items-center justify-between">
                              <span className="text-sm font-medium text-teal-500">{ad.cta}</span>
                              <Button size="sm" variant="outline">
                                <Copy className="w-4 h-4 mr-1" />
                                Copiar
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Book Results */}
              {assets.book && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-purple-500" />
                      Livro Gerado
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-4">
                      {assets.book.coverImage && (
                        <img 
                          src={assets.book.coverImage.url}
                          alt={assets.book.title}
                          className="w-32 h-48 object-cover rounded-lg"
                        />
                      )}
                      <div>
                        <h3 className="text-xl font-bold">{assets.book.title}</h3>
                        <p className="text-muted-foreground">{assets.book.subtitle}</p>
                        <p className="text-sm mt-2">Autor: {assets.book.author}</p>
                        <p className="text-sm text-muted-foreground mt-1">{assets.book.synopsis}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Capítulos ({assets.book.chapters.length})</h4>
                      <div className="space-y-2">
                        {assets.book.chapters.slice(0, 5).map((ch, i) => (
                          <div key={i} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                            <div className="font-medium">{ch.number}. {ch.title}</div>
                            {ch.generatedImage && (
                              <img 
                                src={ch.generatedImage.url}
                                alt={ch.title}
                                className="mt-2 w-full h-32 object-cover rounded"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper icon components
const Package = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16.5 9.4 7.55 4.24"/>
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <polyline points="3.29 7 12 12 20.71 7"/>
    <line x1="12" x2="12" y1="22" y2="12"/>
  </svg>
);

const Users = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const Gift = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="8" width="18" height="4" rx="1"/>
    <path d="M19 8v3"/>
    <path d="M5 8v3"/>
    <path d="M12 12v8"/>
    <path d="M12 3v3"/>
    <path d="M5 3v3"/>
    <path d="M19 3v3"/>
  </svg>
);