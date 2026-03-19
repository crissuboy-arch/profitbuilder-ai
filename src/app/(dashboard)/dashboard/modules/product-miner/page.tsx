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
import { Loader2, PlusCircle, Search, Sparkles, CheckCircle2, Save } from "lucide-react";

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
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-violet-500/10 rounded-xl">
          <Search className="w-8 h-8 text-violet-500" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Product Miner</h1>
          <p className="text-muted-foreground">Discover high-converting product opportunities in any niche.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <Card className="lg:col-span-4 h-fit sticky top-24 border-none shadow-md">
          <CardHeader>
            <CardTitle>Mining Parameters</CardTitle>
            <CardDescription>Enter details to find your next winning product.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="niche">Niche</Label>
                <Input id="niche" name="niche" placeholder="e.g., Finance, Health, Technology" required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="subniche">Sub-niche</Label>
                <Input id="subniche" name="subniche" placeholder="e.g., Day Trading, Keto Diet" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessType">Business Type</Label>
                <Select name="businessType" defaultValue="Info-product">
                  <SelectTrigger>
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

              <div className="space-y-2">
                <Label htmlFor="targetAudience">Target Audience</Label>
                <Input id="targetAudience" name="targetAudience" placeholder="e.g., Small business owners, new parents" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetGoal">Your Main Goal</Label>
                <Input id="targetGoal" name="targetGoal" placeholder="e.g., High ticket sales, recurring MRR" required />
              </div>

              <div className="grid grid-cols-2 gap-4 border-t pt-4 mt-2 border-slate-100">
                  <CountrySelect />
                  <LanguageSelect />
              </div>

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg mt-6" disabled={loading}>
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
        </Card>

        <div className="lg:col-span-8 flex flex-col gap-6">
          {results.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center h-[500px] border-2 border-dashed rounded-xl bg-slate-50/50">
              <div className="p-4 bg-white rounded-full shadow-sm mb-4">
                <Search className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-medium text-slate-700">Awaiting Instructions</h3>
              <p className="text-slate-500 max-w-sm text-center mt-2">
                Fill out the parameters on the left and hit generate to discover your next hit product.
              </p>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center h-[500px] border-2 border-dashed rounded-xl bg-violet-50/30">
              <Loader2 className="w-12 h-12 text-violet-500 animate-spin mb-4" />
              <h3 className="text-xl font-medium text-slate-700 animate-pulse">Analyzing Market Gaps...</h3>
              <p className="text-slate-500">Parsing through localized market data...</p>
            </div>
          )}

          {results.length > 0 && !loading && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-2 text-violet-600 font-medium">
                  <CheckCircle2 className="w-5 h-5" />
                  10 Profitable Ideas Generated
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md border border-slate-200">
                    Output: {parsedLanguage}
                  </span>
                  <Button onClick={handleSaveAll} className="bg-slate-900 text-white hover:bg-slate-800">
                    <Save className="w-4 h-4 mr-2" />
                    Save All to Project
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.map((product, index) => (
                  <Card key={index} className="flex flex-col shadow-sm border-slate-200 hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
                      <div className="flex justify-between items-start gap-4">
                        <CardTitle className="text-lg leading-tight text-slate-900">
                          {product.productName}
                        </CardTitle>
                        <span className="px-2.5 py-0.5 rounded-full bg-violet-100 text-violet-700 text-xs font-semibold shrink-0">
                          {product.priceRange}
                        </span>
                      </div>
                      <CardDescription className="text-xs pt-1">
                        <span className="font-semibold text-slate-700">Format:</span> {product.recommendedFormat}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4 flex-1 space-y-3 text-sm">
                      <div>
                        <span className="font-semibold text-slate-900 block mb-1">Target Audience:</span>
                        <p className="text-slate-600 leading-relaxed">{product.targetAudience}</p>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-900 block mb-1">Problem Solved:</span>
                        <p className="text-slate-600 leading-relaxed">{product.mainProblemSolved}</p>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0 pb-4 px-4">
                      <Button 
                        variant="outline" 
                        className="w-full border-slate-200 hover:bg-slate-50"
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
