"use client";

import { useState } from "react";
import { generateProducts, saveProductToProject, saveMultipleProductsToProject, type ProductIdea } from "./actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CountrySelect } from "@/components/shared/CountrySelect";
import { LanguageSelect } from "@/components/shared/LanguageSelect";
import { toast } from "sonner";
import { Loader2, PlusCircle, Search, Sparkles, CheckCircle2, Save, DollarSign, Users, Zap, Package } from "lucide-react";

export default function ProductMinerPage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ProductIdea[]>([]);
  const [currentProjectName, setCurrentProjectName] = useState("");
  const [parsedLanguage, setParsedLanguage] = useState("");

  async function onSubmit(formData: FormData) {
    setLoading(true);
    setResults([]);

    const language = formData.get("language") as string;
    setParsedLanguage(language);

    const niche = formData.get("niche") as string;
    setCurrentProjectName(`${niche} Products`);

    const params = {
      niche: niche,
      subniche: formData.get("subniche") as string,
      businessType: formData.get("businessType") as string,
      country: formData.get("country") as string,
      language: language,
      targetAudience: formData.get("targetAudience") as string,
      targetGoal: formData.get("targetGoal") as string,
    };

    const { success, data, error } = await generateProducts(params);

    if (success && data) {
      setResults(data);
      toast.success(`Successfully generated ideas translated to ${language}!`);
    } else {
      toast.error(error || "Failed to generate ideas. Please try again.");
    }

    setLoading(false);
  }

  async function handleSave(product: ProductIdea) {
    toast.loading("Saving to project...", { id: product.productName });
    const { success, message, error } = await saveProductToProject(product, currentProjectName);

    if (success) {
      toast.success(message, { id: product.productName });
      localStorage.setItem("lastMinedProduct", JSON.stringify(product));
    } else {
      toast.error(error, { id: product.productName });
    }
  }

  async function handleSaveAll() {
    if (results.length === 0) return;
    toast.loading("Saving cluster to project...", { id: "save-all" });
    const { success, message, error } = await saveMultipleProductsToProject(results, currentProjectName);

    if (success) {
      toast.success(message, { id: "save-all" });
    } else {
      toast.error(error, { id: "save-all" });
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto font-[family-name:var(--font-geist-sans)]">

      {/* Header */}
      <div className="flex items-center gap-4 mb-10">
        <div className="p-3 bg-violet-600 rounded-2xl shadow-lg shadow-violet-200">
          <Search className="w-7 h-7 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Product Miner</h1>
          <p className="text-slate-500 text-sm mt-0.5">Discover high-converting product opportunities in any niche.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left — Form */}
        <div className="lg:col-span-4">
          <Card className="sticky top-24 border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="bg-slate-900 px-6 py-5">
              <CardTitle className="text-white text-base font-semibold">Mining Parameters</CardTitle>
              <CardDescription className="text-slate-400 text-sm">Enter details to find your next winning product.</CardDescription>
            </CardHeader>
            <CardContent className="px-6 pt-6 pb-2">
              <form action={onSubmit} className="space-y-5">

                <div className="space-y-1.5">
                  <Label htmlFor="niche" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Niche</Label>
                  <Input id="niche" name="niche" placeholder="e.g., Finance, Health, Technology" className="rounded-lg border-slate-200 focus:border-violet-400 focus:ring-violet-400 bg-slate-50" required />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="subniche" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sub-niche</Label>
                  <Input id="subniche" name="subniche" placeholder="e.g., Day Trading, Keto Diet" className="rounded-lg border-slate-200 bg-slate-50" required />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="businessType" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Business Type</Label>
                  <Select name="businessType" defaultValue="Info-product">
                    <SelectTrigger className="rounded-lg border-slate-200 bg-slate-50">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Info-product">Info-product (Courses/E-books)</SelectItem>
                      <SelectItem value="SaaS">SaaS (Software)</SelectItem>
                      <SelectItem value="Service">Agency / Service</SelectItem>
                      <SelectItem value="Physical">Physical Product / Dropshipping</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="targetAudience" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Target Audience</Label>
                  <Input id="targetAudience" name="targetAudience" placeholder="e.g., Small business owners" className="rounded-lg border-slate-200 bg-slate-50" required />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="targetGoal" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Your Main Goal</Label>
                  <Input id="targetGoal" name="targetGoal" placeholder="e.g., High ticket sales, recurring MRR" className="rounded-lg border-slate-200 bg-slate-50" required />
                </div>

                <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-5">
                  <CountrySelect />
                  <LanguageSelect />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl py-5 shadow-md shadow-violet-100 transition-all"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Mining Intel...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Ideas
                    </>
                  )}
                </Button>

              </form>
            </CardContent>
            <div className="px-6 pb-6" />
          </Card>
        </div>

        {/* Right — Results */}
        <div className="lg:col-span-8 flex flex-col gap-6">

          {results.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center h-[520px] rounded-2xl border-2 border-dashed border-slate-200 bg-white">
              <div className="w-16 h-16 rounded-2xl bg-violet-50 flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-violet-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-700">Awaiting Instructions</h3>
              <p className="text-slate-400 text-sm max-w-xs text-center mt-2 leading-relaxed">
                Fill out the parameters and hit generate to discover your next winning product.
              </p>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center h-[520px] rounded-2xl border-2 border-dashed border-violet-100 bg-violet-50/40">
              <div className="relative mb-6">
                <div className="w-16 h-16 rounded-2xl bg-violet-100 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-700 animate-pulse">Analyzing Market Gaps...</h3>
              <p className="text-slate-500 text-sm mt-2">Parsing through localized market data...</p>
            </div>
          )}

          {results.length > 0 && !loading && (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">

              {/* Toolbar */}
              <div className="flex justify-between items-center bg-white border border-slate-200 rounded-2xl px-5 py-3.5 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-violet-600" />
                  </div>
                  <span className="text-sm font-semibold text-slate-800">10 Profitable Ideas Generated</span>
                  <span className="ml-1 text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full border border-slate-200">
                    {parsedLanguage}
                  </span>
                </div>
                <Button
                  onClick={handleSaveAll}
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl px-4 py-2 shadow-sm"
                >
                  <Save className="w-3.5 h-3.5 mr-1.5" />
                  Save All to Project
                </Button>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.map((product, index) => (
                  <Card key={index} className="flex flex-col rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-violet-200 transition-all duration-200 bg-white overflow-hidden">

                    {/* Card Top Accent */}
                    <div className="h-1 w-full bg-gradient-to-r from-violet-500 to-purple-400" />

                    <CardHeader className="pb-3 px-5 pt-4">
                      <div className="flex justify-between items-start gap-3">
                        <CardTitle className="text-base font-bold leading-snug text-slate-900">
                          {product.productName}
                        </CardTitle>
                        <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-violet-50 border border-violet-100 text-violet-700 text-xs font-bold">
                          <DollarSign className="w-3 h-3" />
                          {product.priceRange}
                        </span>
                      </div>
                      <div className="mt-1.5 inline-flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-xs text-slate-500 font-medium">{product.recommendedFormat}</span>
                      </div>
                    </CardHeader>

                    <CardContent className="px-5 pt-0 flex-1 space-y-3">
                      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <Users className="w-4 h-4 text-violet-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Target Audience</p>
                          <p className="text-sm text-slate-700 leading-snug">{product.targetAudience}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <Zap className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Problem Solved</p>
                          <p className="text-sm text-slate-700 leading-snug">{product.mainProblemSolved}</p>
                        </div>
                      </div>
                    </CardContent>

                    <CardFooter className="px-5 pb-4 pt-3 border-t border-slate-100">
                      <Button
                        variant="outline"
                        className="w-full border-slate-200 hover:bg-violet-50 hover:border-violet-200 hover:text-violet-700 text-slate-600 text-sm font-semibold rounded-xl transition-colors"
                        onClick={() => handleSave(product)}
                      >
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Save to Project
                      </Button>
                    </CardFooter>

                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
