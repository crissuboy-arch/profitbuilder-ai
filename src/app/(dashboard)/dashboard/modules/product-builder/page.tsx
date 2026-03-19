"use client";

import { useState } from "react";
import { buildProduct, saveStructureToProject, type ProductStructureResult } from "./actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CountrySelect } from "@/components/shared/CountrySelect";
import { LanguageSelect } from "@/components/shared/LanguageSelect";
import { toast } from "sonner";
import { Loader2, Package, Layers, Gift, DollarSign, Zap, DownloadCloud, Save, CheckCircle2 } from "lucide-react";

export default function ProductBuilderPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ProductStructureResult | null>(null);
  const [currentProjectName, setCurrentProjectName] = useState("");
  const [parsedLanguage, setParsedLanguage] = useState("");

  async function onSubmit(formData: FormData) {
    setLoading(true);
    setResult(null);

    const idea = formData.get("idea") as string;
    const language = formData.get("language") as string;
    setCurrentProjectName(`${idea.substring(0, 30)}... Structure`);
    setParsedLanguage(language);

    const params = {
      idea,
      targetAudience: formData.get("targetAudience") as string,
      priceRange: formData.get("priceRange") as string,
      businessModel: formData.get("businessModel") as string,
      country: formData.get("country") as string,
      language: language,
    };

    const { success, data, error } = await buildProduct(params);

    if (success && data) {
      setResult(data);
      toast.success(`Product structured successfully mapped to ${language}!`);
    } else {
      toast.error(error || "Failed to structure product. Please try again.");
    }
    
    setLoading(false);
  }

  async function handleSave() {
    if (!result) return;
    toast.loading("Saving to project...", { id: "save-builder" });
    const { success, message, error } = await saveStructureToProject(result, currentProjectName);
    
    if (success) {
      toast.success(message, { id: "save-builder" });
    } else {
      toast.error(error, { id: "save-builder" });
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto font-[family-name:var(--font-geist-sans)]">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-emerald-600/10 rounded-xl">
          <Layers className="w-8 h-8 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Product Builder</h1>
          <p className="text-muted-foreground">Transform your validated idea into a complete structured product offering.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Left Column - Input Form */}
        <Card className="xl:col-span-4 h-fit sticky top-24 border-none shadow-md">
          <CardHeader>
            <CardTitle>Core Foundation</CardTitle>
            <CardDescription>Input the fundamentals to generate the structure.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="idea">Validated Idea</Label>
                <Textarea 
                  id="idea" 
                  name="idea" 
                  placeholder="e.g., A system helping course creators double their completion rates using gamification." 
                  className="min-h-[100px]"
                  required 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetAudience">Target Audience</Label>
                <Input id="targetAudience" name="targetAudience" placeholder="e.g., Established course creators" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priceRange">Target Price Range</Label>
                <Input id="priceRange" name="priceRange" placeholder="e.g., $997 - $1500" required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="businessModel">Business Model</Label>
                <Select name="businessModel" defaultValue="Course" required>
                  <SelectTrigger id="businessModel">
                    <SelectValue placeholder="Select Model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Course">Online Course</SelectItem>
                    <SelectItem value="Ebook">E-book / Guide</SelectItem>
                    <SelectItem value="SaaS">SaaS Platform</SelectItem>
                    <SelectItem value="Membership">Paid Community / Membership</SelectItem>
                    <SelectItem value="Coaching">High-Ticket Coaching</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t pt-4 mt-2 border-slate-100">
                  <CountrySelect />
                  <LanguageSelect />
              </div>

              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg mt-6" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Architecting...
                  </>
                ) : (
                  <>
                    <Package className="mr-2 h-4 w-4" />
                    Build Product Structure
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
                <Layers className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-medium text-slate-700">Awaiting Core Data</h3>
              <p className="text-slate-500 max-w-sm text-center mt-2 text-sm">
                Submit your idea to generate the offer structure, modules, bonuses, and pricing strategy.
              </p>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center h-[600px] border-2 border-dashed rounded-xl bg-emerald-50/30">
              <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mb-4" />
              <h3 className="text-xl font-medium text-slate-700 animate-pulse">Designing Offer Stack...</h3>
              <p className="text-slate-500 text-sm mt-2">Writing modules and positioning pricing.</p>
            </div>
          )}

          {result && !loading && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-2 text-emerald-600 font-medium tracking-tight">
                  <CheckCircle2 className="w-5 h-5" />
                  Product Blueprint Generated
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md border border-slate-200">
                    Language: {parsedLanguage}
                  </span>
                  <Button onClick={handleSave} className="bg-slate-900 text-white hover:bg-slate-800 shadow-md">
                    <Save className="w-4 h-4 mr-2" />
                    Save Blueprint
                  </Button>
                </div>
              </div>

              {/* Core Concept & Offer */}
              <Card className="border-none shadow-sm bg-emerald-50 text-emerald-900 border border-emerald-100">
                <CardContent className="pt-6">
                  <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                    <Package className="w-5 h-5 opacity-70" /> Core Concept
                  </h3>
                  <p className="text-emerald-800 leading-relaxed mb-6">{result.concept}</p>
                  
                  <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                    <Zap className="w-5 h-5 opacity-70" /> Stack Structure
                  </h3>
                  <p className="text-emerald-800 leading-relaxed font-semibold">{result.offerStructure}</p>
                </CardContent>
              </Card>

              {/* Modules & Breakdowns */}
              <Card className="border-none shadow-md">
                <CardHeader className="pb-3 border-b mb-4 bg-slate-50/50">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Layers className="w-5 h-5 text-slate-500" />
                    Curriculum / Implementation Modules
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {result.modules.map((module, i) => (
                    <div key={i} className="flex gap-4 p-4 rounded-lg bg-white border border-slate-100 shadow-sm hover:border-emerald-200 transition-colors">
                       <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0">
                         {i + 1}
                       </span>
                       <p className="text-slate-700 leading-relaxed pt-1">{module}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Bonuses, Pricing & Mechanism */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Bonuses */}
                <Card className="border-none shadow-sm border-t-4 border-t-amber-400">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold uppercase text-slate-500 tracking-wider flex items-center gap-2">
                      <Gift className="w-4 h-4 text-amber-500" />
                      Bonus Stack
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-2">
                    {result.bonuses.map((bonus, i) => (
                      <div key={i} className="bg-amber-50 text-amber-900 p-3 rounded-md text-sm border border-amber-100 font-medium">
                        ✦ {bonus}
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Strategy */}
                <div className="space-y-6">
                  <Card className="border-none shadow-sm border-t-4 border-t-blue-500">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-bold uppercase text-slate-500 tracking-wider flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-blue-500" />
                        Pricing Strategy
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-700 text-sm leading-relaxed">{result.pricingStrategy}</p>
                    </CardContent>
                  </Card>

                  <Card className="border-none shadow-sm border-t-4 border-t-violet-500 text-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-bold uppercase text-slate-500 tracking-wider flex items-center gap-2">
                        <Zap className="w-4 h-4 text-violet-500" />
                        Unique Mechanism
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                       <p className="text-slate-700 leading-relaxed font-semibold">
                         {result.uniqueSellingMechanism}
                       </p>
                    </CardContent>
                  </Card>
                </div>

              </div>

              {/* Delivery Format */}
              <Card className="border-none shadow-sm bg-slate-900 text-white">
                <CardContent className="p-4 flex gap-4 items-center">
                  <DownloadCloud className="w-8 h-8 text-slate-400 shrink-0" />
                  <div>
                    <h4 className="font-bold text-slate-200 mb-1">Recommended Delivery Format</h4>
                    <p className="text-slate-400 text-sm">{result.deliveryFormat}</p>
                  </div>
                </CardContent>
              </Card>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
