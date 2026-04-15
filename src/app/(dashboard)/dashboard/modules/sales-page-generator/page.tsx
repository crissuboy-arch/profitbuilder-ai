"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { generateSalesPage, saveSalesPageToProject, type SalesPageResult } from "./actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CountrySelect } from "@/components/shared/CountrySelect";
import { LanguageSelect } from "@/components/shared/LanguageSelect";
import { toast } from "sonner";
import { Loader2, FileText, LayoutTemplate, Quote, ShieldCheck, HelpCircle, CheckCircle2, Save, MousePointerClick, TrendingUp } from "lucide-react";

function SalesPageGeneratorContent() {
  const searchParams = useSearchParams();

  const prefillConcept = searchParams.get("concept") || "";
  const prefillAudience = searchParams.get("audience") || "";
  const prefillPrice = searchParams.get("price") || "";
  const prefillMechanism = searchParams.get("mechanism") || "";

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SalesPageResult | null>(null);
  const [currentProjectName, setCurrentProjectName] = useState("");
  const [parsedLanguage, setParsedLanguage] = useState("");

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

  async function handleSave() {
    if (!result) return;
    toast.loading("Saving to project...", { id: "save-sales-page" });
    const { success, message, error } = await saveSalesPageToProject(result, currentProjectName);

    if (success) {
      toast.success(message, { id: "save-sales-page" });
    } else {
      toast.error(error, { id: "save-sales-page" });
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto font-[family-name:var(--font-geist-sans)]">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-rose-600/10 rounded-xl">
          <FileText className="w-8 h-8 text-rose-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales Page Generator</h1>
          <p className="text-muted-foreground">Turn your product structure into a high-converting direct response sales page.</p>
        </div>
      </div>

      {prefillConcept && (
        <div className="mb-6 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-700 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          Dados importados do Product Builder. Revise e clique em &quot;Generate Sales Page&quot;.
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

        {/* Left Column - Input Form */}
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

        {/* Right Column - Results */}
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

              {/* Above the Fold (Hero) */}
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

              {/* Story / Problem */}
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

              {/* Offer Presentation */}
              <Card className="border-none shadow-md border-l-4 border-l-rose-500">
                <CardContent className="pt-6">
                  <h3 className="text-xl font-bold mb-4 opacity-80 uppercase tracking-widest text-xs">The Offer Details</h3>
                  <p className="text-lg font-medium text-slate-800 leading-relaxed">{result.offerPresentation}</p>
                </CardContent>
              </Card>

              {/* Grid: Bonuses & Testimonials */}
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

              {/* Grid: Guarantee & FAQ */}
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
