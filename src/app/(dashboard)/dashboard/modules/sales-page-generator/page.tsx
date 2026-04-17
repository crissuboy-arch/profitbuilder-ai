"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { 
  generateSalesPage, 
  generateTemplateSalesPage,
  saveSalesPageToProject,
  saveTemplateSalesPage,
  type SalesPageResult 
} from "./actions";
import { TEMPLATE_PRESETS, DEFAULT_TOGGLES, type TemplateType, type StylePreset, type SectionToggle, type GeneratedSalesPage } from "./types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CountrySelect } from "@/components/shared/CountrySelect";
import { LanguageSelect } from "@/components/shared/LanguageSelect";
import { toast } from "sonner";
import { 
  Loader2, 
  FileText, 
  LayoutTemplate, 
  Quote, 
  ShieldCheck, 
  HelpCircle, 
  CheckCircle2, 
  Save, 
  MousePointerClick, 
  TrendingUp,
  Sparkles,
  Palette,
  Eye,
  Zap,
  Package,
  Gift,
  Users,
  Shield,
  MessageCircle,
  ShoppingCart,
  Heart,
  ArrowRight
} from "lucide-react";

const SECTION_ICONS: Record<keyof SectionToggle, React.ReactNode> = {
  hero: <Zap className="w-4 h-4" />,
  pain: <TrendingUp className="w-4 h-4" />,
  solution: <Package className="w-4 h-4" />,
  modules: <FileText className="w-4 h-4" />,
  bonuses: <Gift className="w-4 h-4" />,
  testimonials: <Users className="w-4 h-4" />,
  guarantee: <Shield className="w-4 h-4" />,
  faq: <MessageCircle className="w-4 h-4" />,
  offer: <ShoppingCart className="w-4 h-4" />,
};

const SECTION_LABELS: Record<keyof SectionToggle, string> = {
  hero: "Hero / Headline",
  pain: "Dores / Problemas",
  solution: "Solução / Benefícios",
  modules: "Módulos / Capítulos",
  bonuses: "Bônus",
  testimonials: "Depoimentos",
  guarantee: "Garantia",
  faq: "FAQ",
  offer: "Oferta Final",
};

const TEMPLATE_ICONS: Record<TemplateType, React.ReactNode> = {
  transformacao: <Sparkles className="w-6 h-6" />,
  feminino: <Heart className="w-6 h-6" />,
  checkout: <ShoppingCart className="w-6 h-6" />,
  thankyou: <Heart className="w-6 h-6" />,
};

function SalesPageGeneratorContent() {
  const searchParams = useSearchParams();

  const prefillConcept = searchParams.get("concept") || "";
  const prefillAudience = searchParams.get("audience") || "";
  const prefillPrice = searchParams.get("price") || "";
  const prefillMechanism = searchParams.get("mechanism") || "";

  const [activeTab, setActiveTab] = useState<"classic" | "template">("template");
  const [loading, setLoading] = useState(false);
  const [templateLoading, setTemplateLoading] = useState(false);
  const [result, setResult] = useState<SalesPageResult | null>(null);
  const [templateResult, setTemplateResult] = useState<GeneratedSalesPage | null>(null);
  const [currentProjectName, setCurrentProjectName] = useState("");
  const [parsedLanguage, setParsedLanguage] = useState("");

  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>("transformacao");
  const [selectedStyle, setSelectedStyle] = useState<StylePreset>("clean-premium");
  const [sectionToggles, setSectionToggles] = useState<SectionToggle>(DEFAULT_TOGGLES);
  const [showPreview, setShowPreview] = useState(false);

  const [productName, setProductName] = useState("");
  const [niche, setNiche] = useState("");
  const [promise, setPromise] = useState("");
  const [audience, setAudience] = useState(prefillAudience);
  const [price, setPrice] = useState(prefillPrice);
  const [originalPrice, setOriginalPrice] = useState("");
  const [ctaText, setCtaText] = useState("Quero Garantir Meu Acesso Agora");
  const [guaranteeDays, setGuaranteeDays] = useState(7);

  async function onSubmit(formData: FormData) {
    setLoading(true);
    setResult(null);

    const productConcept = formData.get("productConcept") as string;
    const language = formData.get("language") as string;
    setCurrentProjectName(`${productConcept.substring(0, 30)}... Sales Page`);
    setParsedLanguage(language);

    const params = {
      productConcept,
      targetAudience: formData.get("targetAudience") as string,
      price: formData.get("price") as string,
      uniqueMechanism: formData.get("uniqueMechanism") as string,
      country: formData.get("country") as string,
      language: language,
    };

    const { success, data, error } = await generateSalesPage(params);

    if (success && data) {
      setResult(data);
      toast.success(`Sales page copy mapped to ${language}!`);
    } else {
      toast.error(error || "Failed to generate sales page copy.");
    }

    setLoading(false);
  }

  async function handleGenerateTemplate() {
    if (!productName || !promise || !audience || !price) {
      toast.error("Por favor, preencha os campos obrigatórios: Nome do Produto, Promessa, Público e Preço.");
      return;
    }

    setTemplateLoading(true);
    setTemplateResult(null);
    setShowPreview(false);

    const { success, data, error } = await generateTemplateSalesPage({
      templateType: selectedTemplate,
      stylePreset: selectedStyle,
      sections: sectionToggles,
      productData: {
        productName,
        niche,
        promise,
        audience,
        price,
        originalPrice,
        ctaText,
        guaranteeDays,
      },
      language: parsedLanguage || "Português",
    });

    if (success && data) {
      setTemplateResult(data);
      setShowPreview(true);
      setCurrentProjectName(`${productName.substring(0, 30)}... Template Page`);
      toast.success("Página de vendas gerada com sucesso!");
    } else {
      toast.error(error || "Erro ao gerar página de vendas.");
    }

    setTemplateLoading(false);
  }

  async function handleSave() {
    if (activeTab === "classic" && result) {
      toast.loading("Saving to project...", { id: "save-sales-page" });
      const { success, message, error } = await saveSalesPageToProject(result, currentProjectName);

      if (success) {
        toast.success(message, { id: "save-sales-page" });
      } else {
        toast.error(error, { id: "save-sales-page" });
      }
    } else if (activeTab === "template" && templateResult) {
      toast.loading("Salvando página...", { id: "save-sales-page" });
      const { success, message, error } = await saveTemplateSalesPage(templateResult, currentProjectName);

      if (success) {
        toast.success(message, { id: "save-sales-page" });
      } else {
        toast.error(error, { id: "save-sales-page" });
      }
    }
  }

  const renderTemplatePreview = () => {
    if (!templateResult) return null;
    
    const isFeminine = templateResult.stylePreset === "feminine-soft";
    const accentClass = isFeminine ? "from-pink-500 to-rose-400" : "from-rose-600 to-rose-900";
    const textAccentClass = isFeminine ? "text-pink-600" : "text-rose-600";
    const bgAccentClass = isFeminine ? "bg-pink-50" : "bg-slate-50";
    const borderAccentClass = isFeminine ? "border-pink-200" : "border-slate-200";

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100">
          <div className={`flex items-center gap-2 ${textAccentClass} font-medium tracking-tight`}>
            <CheckCircle2 className="w-5 h-5" />
            Página Gerada - {TEMPLATE_PRESETS[templateResult.templateType].name}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md border border-slate-200">
              Estilo: {templateResult.stylePreset}
            </span>
            <Button onClick={handleSave} className="bg-slate-900 text-white hover:bg-slate-800 shadow-md">
              <Save className="w-4 h-4 mr-2" />
              Salvar Página
            </Button>
          </div>
        </div>

        {templateResult.sections.hero && (
          <Card className={`border-none shadow-lg overflow-hidden bg-gradient-to-br ${accentClass} text-white text-center py-12`}>
            <CardContent className="space-y-6 max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-black leading-tight tracking-tight">
                {templateResult.sections.hero.headline}
              </h1>
              <p className="text-xl text-white/90 leading-relaxed font-medium">
                {templateResult.sections.hero.subheadline}
              </p>
              <Button className={`bg-white ${isFeminine ? 'text-pink-600 hover:bg-pink-50' : 'text-rose-600 hover:bg-rose-50'} shadow-xl text-lg px-8 py-6 rounded-full font-bold mt-4`}>
                {templateResult.sections.hero.ctaText}
              </Button>
              {templateResult.sections.hero.proofText && (
                <p className="text-sm text-white/70">{templateResult.sections.hero.proofText}</p>
              )}
            </CardContent>
          </Card>
        )}

        {templateResult.sections.pain && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {templateResult.sections.pain.painCards.map((card, i) => (
              <Card key={i} className={`border-none shadow-md ${isFeminine ? 'bg-rose-50' : 'bg-slate-50'}`}>
                <CardContent className="p-5 text-center space-y-3">
                  <span className="text-3xl">{card.icon}</span>
                  <h3 className={`font-bold ${textAccentClass}`}>{card.title}</h3>
                  <p className="text-sm text-slate-600">{card.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {templateResult.sections.solution && (
          <Card className={`border-none shadow-lg ${borderAccentClass} border-l-4 ${isFeminine ? 'border-l-pink-500' : 'border-l-rose-500'}`}>
            <CardHeader>
              <CardTitle className={textAccentClass}>{templateResult.sections.solution.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-700 leading-relaxed">{templateResult.sections.solution.description}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {templateResult.sections.solution.benefits.map((benefit, i) => (
                  <div key={i} className={`flex items-start gap-2 ${bgAccentClass} p-3 rounded-lg`}>
                    <CheckCircle2 className={`w-5 h-5 ${textAccentClass} shrink-0 mt-0.5`} />
                    <span className="text-sm text-slate-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {templateResult.sections.modules && (
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className={`w-5 h-5 ${textAccentClass}`} />
                {templateResult.sections.modules.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {templateResult.sections.modules.chapters.map((chapter, i) => (
                  <div key={i} className={`flex items-start gap-4 p-4 ${bgAccentClass} rounded-lg`}>
                    <span className={`w-8 h-8 rounded-full ${isFeminine ? 'bg-pink-500' : 'bg-rose-600'} text-white flex items-center justify-center font-bold text-sm shrink-0`}>
                      {chapter.number}
                    </span>
                    <div>
                      <h4 className="font-semibold text-slate-800">{chapter.title}</h4>
                      <p className="text-sm text-slate-600">{chapter.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {templateResult.sections.bonuses && (
          <Card className={`border-none shadow-lg ${isFeminine ? 'bg-amber-50/50' : 'bg-amber-50/30'}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-700">
                <Gift className="w-5 h-5" />
                {templateResult.sections.bonuses.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templateResult.sections.bonuses.items.map((bonus, i) => (
                  <div key={i} className="bg-white p-4 rounded-lg border border-amber-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-amber-900 flex items-center gap-2">
                        <span className="text-lg">{bonus.icon}</span>
                        {bonus.title}
                      </h4>
                      {bonus.value && (
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">
                          +{bonus.value}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-amber-800/80">{bonus.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {templateResult.sections.testimonials && (
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Quote className={`w-5 h-5 ${textAccentClass}`} />
                {templateResult.sections.testimonials.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templateResult.sections.testimonials.items.map((testimonial, i) => (
                  <div key={i} className={`${bgAccentClass} p-5 rounded-xl`}>
                    <Quote className={`w-6 h-6 ${textAccentClass} mb-3 opacity-50`} />
                    <p className="text-slate-700 italic mb-3">&ldquo;{testimonial.quote}&rdquo;</p>
                    <p className="font-semibold text-slate-800">— {testimonial.author}</p>
                    {testimonial.role && (
                      <p className="text-xs text-slate-500">{testimonial.role}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {templateResult.sections.guarantee && (
          <Card className={`border-none shadow-lg ${isFeminine ? 'border border-green-200 bg-green-50' : 'border border-indigo-100 bg-indigo-50/50'}`}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-full ${isFeminine ? 'bg-green-100' : 'bg-indigo-100'} flex items-center justify-center shrink-0`}>
                  <ShieldCheck className={`w-8 h-8 ${isFeminine ? 'text-green-600' : 'text-indigo-600'}`} />
                </div>
                <div>
                  <h3 className={`font-bold text-lg ${isFeminine ? 'text-green-800' : 'text-indigo-800'}`}>
                    {templateResult.sections.guarantee.title}
                  </h3>
                  <p className="text-slate-700">{templateResult.sections.guarantee.description}</p>
                  <p className={`text-sm font-medium mt-1 ${isFeminine ? 'text-green-600' : 'text-indigo-600'}`}>
                    {templateResult.sections.guarantee.days} dias de garantia incondicional
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {templateResult.sections.faq && (
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className={`w-5 h-5 ${textAccentClass}`} />
                {templateResult.sections.faq.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {templateResult.sections.faq.items.map((item, i) => (
                <div key={i} className={`${bgAccentClass} p-4 rounded-lg`}>
                  <h4 className="font-semibold text-slate-800 mb-1">{item.question}</h4>
                  <p className="text-sm text-slate-600">{item.answer}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {templateResult.sections.offer && (
          <Card className={`border-none shadow-xl overflow-hidden bg-gradient-to-br ${accentClass} text-white`}>
            <CardContent className="p-8 text-center space-y-6">
              {templateResult.sections.offer.urgencyText && (
                <p className="text-white/80 font-medium">{templateResult.sections.offer.urgencyText}</p>
              )}
              <div className="space-y-2">
                {templateResult.sections.offer.originalPrice && (
                  <p className="text-white/60 line-through text-xl">{templateResult.sections.offer.originalPrice}</p>
                )}
                <p className="text-5xl font-black">{templateResult.sections.offer.price}</p>
              </div>
              <Button className="bg-white text-rose-600 hover:bg-rose-50 shadow-xl text-xl px-12 py-8 rounded-full font-bold animate-pulse">
                <ArrowRight className="w-6 h-6 mr-2" />
                {templateResult.sections.offer.ctaText}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  return (
    <div className="p-8 max-w-7xl mx-auto font-[family-name:var(--font-geist-sans)]">
      <div className="flex items-center gap-3 mb-8">
        <div className={`p-3 ${selectedStyle === 'feminine-soft' ? 'bg-pink-100' : 'bg-rose-600/10'} rounded-xl`}>
          <FileText className={`w-8 h-8 ${selectedStyle === 'feminine-soft' ? 'text-pink-600' : 'text-rose-600'}`} />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales Page Generator</h1>
          <p className="text-muted-foreground">Gere páginas de vendas premium com templates e IA.</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "classic" | "template")}>
        <TabsList className="mb-6">
          <TabsTrigger value="classic" className="gap-2">
            <FileText className="w-4 h-4" />
            Clássico
          </TabsTrigger>
          <TabsTrigger value="template" className="gap-2">
            <LayoutTemplate className="w-4 h-4" />
            Templates Premium
          </TabsTrigger>
        </TabsList>

        <TabsContent value="classic">
          {prefillConcept && (
            <div className="mb-6 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-700 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              Dados importados do Product Builder. Revise e clique em &quot;Generate Sales Page&quot;.
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            <Card className="xl:col-span-4 h-fit sticky top-24 border-none shadow-md">
              <CardHeader>
                <CardTitle>Offer Variables</CardTitle>
                <CardDescription>Input the core data parsed from the Product Builder.</CardDescription>
              </CardHeader>
              <CardContent>
                <form action={onSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="productConcept">Core Product Concept</Label>
                    <Textarea
                      id="productConcept"
                      name="productConcept"
                      placeholder="e.g., A comprehensive online course designed for established agency owners..."
                      className="min-h-[100px]"
                      defaultValue={prefillConcept}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="targetAudience">Target Audience</Label>
                    <Input
                      id="targetAudience"
                      name="targetAudience"
                      placeholder="e.g., Struggling Agency Owners"
                      defaultValue={prefillAudience}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Offer Price</Label>
                    <Input
                      id="price"
                      name="price"
                      placeholder="e.g., $997"
                      defaultValue={prefillPrice}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="uniqueMechanism">Unique Selling Mechanism</Label>
                    <Textarea
                      id="uniqueMechanism"
                      name="uniqueMechanism"
                      placeholder='e.g., The "Reverse-Engineering Drop" protocol'
                      className="min-h-[80px]"
                      defaultValue={prefillMechanism}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t pt-4 mt-2 border-slate-100">
                    <CountrySelect />
                    <LanguageSelect />
                  </div>

                  <Button type="submit" className="w-full bg-rose-600 hover:bg-rose-700 text-white shadow-lg mt-6" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Writing Copy...
                      </>
                    ) : (
                      <>
                        <LayoutTemplate className="mr-2 h-4 w-4" />
                        Generate Sales Page
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
                    <FileText className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-medium text-slate-700">Awaiting Offer Data</h3>
                  <p className="text-slate-500 max-w-sm text-center mt-2 text-sm">
                    Submit the variables to generate the direct response copy sections.
                  </p>
                </div>
              )}

              {loading && (
                <div className="flex flex-col items-center justify-center h-[600px] border-2 border-dashed rounded-xl bg-rose-50/30">
                  <Loader2 className="w-12 h-12 text-rose-600 animate-spin mb-4" />
                  <h3 className="text-xl font-medium text-slate-700 animate-pulse">Running Copywriting Formulas...</h3>
                  <p className="text-slate-500 text-sm mt-2">Connecting pain points to your unique mechanism.</p>
                </div>
              )}

              {result && !loading && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                  <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-2 text-rose-600 font-medium tracking-tight">
                      <CheckCircle2 className="w-5 h-5" />
                      Sales Copy Generated
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md border border-slate-200">
                        Language: {parsedLanguage}
                      </span>
                      <Button onClick={handleSave} className="bg-slate-900 text-white hover:bg-slate-800 shadow-md">
                        <Save className="w-4 h-4 mr-2" />
                        Save Copy
                      </Button>
                    </div>
                  </div>

                  <Card className="border-none shadow-md overflow-hidden bg-gradient-to-br from-rose-600 to-rose-900 text-white text-center py-10">
                    <CardContent className="space-y-6 max-w-3xl mx-auto">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold tracking-wider uppercase mb-2">
                        Attention: Your Target Audience
                      </div>
                      <h1 className="text-4xl md:text-5xl font-black leading-tight tracking-tight">
                        {result.headline}
                      </h1>
                      <p className="text-xl text-rose-100 leading-relaxed font-medium">
                        {result.subheadline}
                      </p>
                      <Button className="bg-white text-rose-600 hover:bg-rose-50 shadow-xl text-lg px-8 py-6 rounded-full font-bold mt-4">
                        {result.callsToAction[0]}
                      </Button>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="border-none shadow-sm border border-slate-100">
                      <CardHeader className="pb-3 border-b bg-slate-50/50">
                        <CardTitle className="text-blue-700 flex items-center gap-2 text-lg">
                          <TrendingUp className="w-5 h-5" /> The Problem Formulation
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <p className="text-slate-700 leading-relaxed">{result.problemSection}</p>
                      </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm border border-slate-100">
                      <CardHeader className="pb-3 border-b bg-slate-50/50">
                        <CardTitle className="text-emerald-700 flex items-center gap-2 text-lg">
                          <LayoutTemplate className="w-5 h-5" /> The Epiphany Bridge (Story)
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <p className="text-slate-700 leading-relaxed">{result.storySection}</p>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="border-none shadow-md border-l-4 border-l-rose-500">
                    <CardContent className="pt-6">
                      <h3 className="text-xl font-bold mb-4 opacity-80 uppercase tracking-widest text-xs">The Offer Details</h3>
                      <p className="text-lg font-medium text-slate-800 leading-relaxed">{result.offerPresentation}</p>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="border-none shadow-sm bg-amber-50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-amber-800">Free Bonuses</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {result.bonuses.map((bonus, i) => (
                          <div key={i} className="flex gap-2 text-amber-900 border-b border-amber-200/50 pb-2 last:border-0 font-medium">
                            ✦ {bonus}
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm bg-slate-50">
                      <CardHeader className="pb-2 flex flex-row items-center gap-2">
                        <Quote className="w-4 h-4 text-slate-400" />
                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-600">Proof Elements</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {result.testimonials.map((test, i) => (
                          <p key={i} className="text-slate-700 italic border-l-2 border-slate-300 pl-3 text-sm">
                            {test}
                          </p>
                        ))}
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="border-none shadow-sm border border-indigo-100">
                      <CardHeader className="pb-2 bg-indigo-50/50">
                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-indigo-700 flex items-center gap-2">
                          <ShieldCheck className="w-5 h-5" /> Risk Reversal
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <p className="text-slate-700 leading-relaxed font-semibold">{result.guarantee}</p>
                      </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm border border-slate-100">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
                          <HelpCircle className="w-4 h-4" /> Final Logic (FAQ)
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 pt-2">
                        {result.faq.map((q, i) => (
                          <div key={i} className="bg-slate-50 p-3 rounded text-sm text-slate-700">
                            {q}
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>

                  <div className="flex justify-center p-8">
                    <Button className="bg-rose-600 hover:bg-rose-700 text-white shadow-xl text-lg px-8 py-6 rounded-full font-bold flex items-center gap-2">
                      <MousePointerClick className="w-5 h-5" />
                      {result.callsToAction[1]}
                    </Button>
                  </div>

                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="template">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            <div className="xl:col-span-4 space-y-6">
              <Card className="border-none shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LayoutTemplate className="w-5 h-5" />
                    Template & Estilo
                  </CardTitle>
                  <CardDescription>Escolha o template e estilo visual para sua página.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-3">
                    {(Object.entries(TEMPLATE_PRESETS) as [TemplateType, typeof TEMPLATE_PRESETS[TemplateType]][]).map(([key, template]) => (
                      <button
                        key={key}
                        onClick={() => setSelectedTemplate(key)}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          selectedTemplate === key
                            ? (key === 'feminino' ? 'border-pink-500 bg-pink-50' : 'border-rose-500 bg-rose-50')
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-lg ${key === 'feminino' ? 'bg-pink-100 text-pink-600' : 'bg-rose-100 text-rose-600'} flex items-center justify-center mb-3`}>
                          {TEMPLATE_ICONS[key]}
                        </div>
                        <h4 className="font-semibold text-sm text-slate-800">{template.name}</h4>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{template.description}</p>
                      </button>
                    ))}
                  </div>

                  <div className="border-t pt-4">
                    <Label className="mb-3 block flex items-center gap-2">
                      <Palette className="w-4 h-4" />
                      Estilo Visual
                    </Label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setSelectedStyle("clean-premium")}
                        className={`p-3 rounded-lg border-2 text-left transition-all ${
                          selectedStyle === "clean-premium"
                            ? 'border-rose-500 bg-rose-50'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full bg-gradient-to-br from-rose-600 to-rose-900" />
                          <span className="text-sm font-medium">Premium Clean</span>
                        </div>
                      </button>
                      <button
                        onClick={() => setSelectedStyle("feminine-soft")}
                        className={`p-3 rounded-lg border-2 text-left transition-all ${
                          selectedStyle === "feminine-soft"
                            ? 'border-pink-500 bg-pink-50'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full bg-gradient-to-br from-pink-400 to-rose-300" />
                          <span className="text-sm font-medium">Feminino Soft</span>
                        </div>
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Seções
                  </CardTitle>
                  <CardDescription>Marque as seções que deseja incluir.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(Object.keys(DEFAULT_TOGGLES) as (keyof SectionToggle)[]).map((section) => (
                      <div key={section} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-slate-600">{SECTION_ICONS[section]}</span>
                          <span className="text-sm font-medium text-slate-700">{SECTION_LABELS[section]}</span>
                        </div>
                        <Switch
                          checked={sectionToggles[section]}
                          onCheckedChange={(checked) => setSectionToggles(prev => ({ ...prev, [section]: checked }))}
                        />
                      </div>
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
                    <Label htmlFor="productName">Nome do Produto *</Label>
                    <Input
                      id="productName"
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      placeholder="Ex: Método Transformação 3.0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="niche">Nicho</Label>
                    <Input
                      id="niche"
                      value={niche}
                      onChange={(e) => setNiche(e.target.value)}
                      placeholder="Ex: Saúde e Emagrecimento"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="promise">Promessa Principal *</Label>
                    <Textarea
                      id="promise"
                      value={promise}
                      onChange={(e) => setPromise(e.target.value)}
                      placeholder="Ex: Perca até 10kg em 30 dias sem dietas radicais"
                      className="min-h-[80px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="audienceTemplate">Público-Alvo *</Label>
                    <Input
                      id="audienceTemplate"
                      value={audience}
                      onChange={(e) => setAudience(e.target.value)}
                      placeholder="Ex: Mulheres de 30-50 anos que querem emagrecer"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="priceTemplate">Preço *</Label>
                      <Input
                        id="priceTemplate"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="Ex: R$ 197"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="originalPrice">Preço Original</Label>
                      <Input
                        id="originalPrice"
                        value={originalPrice}
                        onChange={(e) => setOriginalPrice(e.target.value)}
                        placeholder="Ex: R$ 497"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ctaText">Texto do Botão</Label>
                      <Input
                        id="ctaText"
                        value={ctaText}
                        onChange={(e) => setCtaText(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="guaranteeDays">Dias de Garantia</Label>
                      <Input
                        id="guaranteeDays"
                        type="number"
                        value={guaranteeDays}
                        onChange={(e) => setGuaranteeDays(parseInt(e.target.value) || 7)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 border-t pt-4">
                    <LanguageSelect value={parsedLanguage} onChange={setParsedLanguage} />
                  </div>
                </CardContent>
              </Card>

              <Button 
                onClick={handleGenerateTemplate} 
                className={`w-full ${selectedStyle === 'feminine-soft' ? 'bg-pink-600 hover:bg-pink-700' : 'bg-rose-600 hover:bg-rose-700'} text-white shadow-lg text-lg py-6`}
                disabled={templateLoading}
              >
                {templateLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Gerando Página...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Gerar Página com IA
                  </>
                )}
              </Button>
            </div>

            <div className="xl:col-span-8">
              {!templateResult && !templateLoading && (
                <div className="flex flex-col items-center justify-center h-[800px] border-2 border-dashed rounded-xl bg-slate-50/50">
                  <div className={`p-4 bg-white rounded-full shadow-sm mb-4 ${selectedStyle === 'feminine-soft' ? 'text-pink-400' : 'text-rose-400'}`}>
                    <Eye className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-medium text-slate-700">Preview da Página</h3>
                  <p className="text-slate-500 max-w-sm text-center mt-2 text-sm">
                    Preencha os dados do produto e clique em &quot;Gerar Página com IA&quot; para ver o preview.
                  </p>
                </div>
              )}

              {templateLoading && (
                <div className="flex flex-col items-center justify-center h-[800px] border-2 border-dashed rounded-xl bg-rose-50/30">
                  <Loader2 className={`w-16 h-16 ${selectedStyle === 'feminine-soft' ? 'text-pink-600' : 'text-rose-600'} animate-spin mb-6`} />
                  <h3 className="text-xl font-medium text-slate-700 animate-pulse">Criando sua página premium...</h3>
                  <p className="text-slate-500 text-sm mt-2">Gerando copy de alta conversão com IA.</p>
                </div>
              )}

              {showPreview && templateResult && renderTemplatePreview()}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function SalesPageGenerator() {
  return (
    <Suspense>
      <SalesPageGeneratorContent />
    </Suspense>
  );
}
