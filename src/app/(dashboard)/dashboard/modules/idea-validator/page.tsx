"use client";

import { useState } from "react";
import { validateIdea, saveValidationToProject, type IdeaValidationResult, type ValidateIdeaParams } from "./actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CountrySelect } from "@/components/shared/CountrySelect";
import { LanguageSelect } from "@/components/shared/LanguageSelect";
import { toast } from "sonner";
import { Loader2, Search, Lightbulb, PieChart, Target, DollarSign, TrendingUp, Share2, Save, CheckCircle2 } from "lucide-react";

export default function IdeaValidatorPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IdeaValidationResult | null>(null);
  const [lastParams, setLastParams] = useState<ValidateIdeaParams | null>(null);
  const [currentProjectName, setCurrentProjectName] = useState("");
  const [parsedLanguage, setParsedLanguage] = useState("");

  async function onSubmit(formData: FormData) {
    setLoading(true);
    setResult(null);

    const ideaDescription = formData.get("ideaDescription") as string;
    const language = formData.get("language") as string;
    setCurrentProjectName(`${ideaDescription.substring(0, 30)}... Validation`);
    setParsedLanguage(language);

    const params = {
      ideaDescription,
      targetAudience: formData.get("targetAudience") as string,
      pricePoint: formData.get("pricePoint") as string,
      country: formData.get("country") as string,
      language: language,
    };

    const { success, data, error } = await validateIdea(params);

    if (success && data) {
      setResult(data);
      setLastParams(params);
      toast.success(`Idea validated successfully in ${language}!`);
    } else {
      toast.error(error || "Failed to validate idea. Please try again.");
    }
    
    setLoading(false);
  }

  async function handleSave() {
    if (!result || !lastParams) return;
    toast.loading("Saving to project...", { id: "save-validation" });
    const { success, message, error } = await saveValidationToProject(result, currentProjectName, lastParams);
    
    if (success) {
      toast.success(message, { id: "save-validation" });
    } else {
      toast.error(error, { id: "save-validation" });
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-500 bg-emerald-50";
    if (score >= 60) return "text-amber-500 bg-amber-50";
    return "text-rose-500 bg-rose-50";
  };

  return (
    <div className="p-8 max-w-7xl mx-auto font-[family-name:var(--font-geist-sans)]">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-blue-600/10 rounded-xl">
          <Lightbulb className="w-8 h-8 text-blue-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Idea Validator</h1>
          <p className="text-muted-foreground">Score and validate your product concepts before you build them.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <Card className="lg:col-span-4 h-fit sticky top-24 border-none shadow-md">
          <CardHeader>
            <CardTitle>Idea Details</CardTitle>
            <CardDescription>Describe your product concept for AI scoring.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ideaDescription">What is your product idea?</Label>
                <Textarea 
                  id="ideaDescription" 
                  name="ideaDescription" 
                  placeholder="e.g., A SaaS tool that automates Instagram DMs for e-commerce brands." 
                  className="min-h-[120px]"
                  required 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetAudience">Who is it for?</Label>
                <Input id="targetAudience" name="targetAudience" placeholder="e.g., E-commerce owners doing $10k/mo" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pricePoint">Planned Price Point</Label>
                <Input id="pricePoint" name="pricePoint" placeholder="e.g., $49/mo or $997 one-time" required />
              </div>

              <div className="grid grid-cols-2 gap-4 border-t pt-4 mt-2 border-slate-100">
                  <CountrySelect />
                  <LanguageSelect />
              </div>

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg mt-6" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Validating...
                  </>
                ) : (
                  <>
                    <PieChart className="mr-2 h-4 w-4" />
                    Run Validation Scan
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Right Column - Results */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {!result && !loading && (
            <div className="flex flex-col items-center justify-center h-[500px] border-2 border-dashed rounded-xl bg-slate-50/50">
              <div className="p-4 bg-white rounded-full shadow-sm mb-4">
                <Target className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-medium text-slate-700">Awaiting Concept</h3>
              <p className="text-slate-500 max-w-sm text-center mt-2">
                Provide your idea details to generate a comprehensive viability score and feedback.
              </p>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center h-[500px] border-2 border-dashed rounded-xl bg-blue-50/30">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
              <h3 className="text-xl font-medium text-slate-700 animate-pulse">Running Market Algorithms...</h3>
              <p className="text-slate-500">Cross-referencing demand, competition, and psychology.</p>
            </div>
          )}

          {result && !loading && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-2 text-blue-600 font-medium">
                  <CheckCircle2 className="w-5 h-5" />
                  Validation Complete
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md border border-slate-200">
                    Language: {parsedLanguage}
                  </span>
                  <Button onClick={handleSave} className="bg-slate-900 text-white hover:bg-slate-800">
                    <Save className="w-4 h-4 mr-2" />
                    Save Validation
                  </Button>
                </div>
              </div>

              {/* High Level Score */}
              <Card className="border-none shadow-md overflow-hidden">
                <div className={`p-6 flex flex-col items-center justify-center ${getScoreColor(result.overallViabilityScore)} bg-opacity-20 border-b border-opacity-10`}>
                  <div className="text-sm font-bold uppercase tracking-wider mb-2 opacity-80">Overall Viability Score</div>
                  <div className="text-6xl font-black tracking-tighter">
                    {result.overallViabilityScore}<span className="text-3xl opacity-50">/100</span>
                  </div>
                </div>
                <CardContent className="pt-6">
                  <p className="text-slate-700 leading-relaxed text-center font-medium max-w-2xl mx-auto">
                    {result.overallFeedback}
                  </p>
                </CardContent>
              </Card>

              {/* Individual Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <Card className="shadow-sm border-slate-200">
                  <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-sm font-bold uppercase text-slate-500 flex items-center gap-2">
                       <TrendingUp className="w-4 h-4" /> Market Demand
                    </CardTitle>
                    <span className={`px-2 py-1 rounded font-bold text-sm ${getScoreColor(result.demandScore)}`}>
                      {result.demandScore}/100
                    </span>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600">{result.demandFeedback}</p>
                  </CardContent>
                </Card>

                <Card className="shadow-sm border-slate-200">
                  <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-sm font-bold uppercase text-slate-500 flex items-center gap-2">
                       <Target className="w-4 h-4" /> Competition Gap
                    </CardTitle>
                    <span className={`px-2 py-1 rounded font-bold text-sm ${getScoreColor(result.competitionScore)}`}>
                      {result.competitionScore}/100
                    </span>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600">{result.competitionFeedback}</p>
                  </CardContent>
                </Card>

                <Card className="shadow-sm border-slate-200">
                  <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-sm font-bold uppercase text-slate-500 flex items-center gap-2">
                       <DollarSign className="w-4 h-4" /> Monetization
                    </CardTitle>
                    <span className={`px-2 py-1 rounded font-bold text-sm ${getScoreColor(result.monetizationScore)}`}>
                      {result.monetizationScore}/100
                    </span>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600">{result.monetizationFeedback}</p>
                  </CardContent>
                </Card>

                <Card className="shadow-sm border-slate-200">
                  <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-sm font-bold uppercase text-slate-500 flex items-center gap-2">
                       <Share2 className="w-4 h-4" /> Virality Potential
                    </CardTitle>
                    <span className={`px-2 py-1 rounded font-bold text-sm ${getScoreColor(result.viralityScore)}`}>
                      {result.viralityScore}/100
                    </span>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600">{result.viralityFeedback}</p>
                  </CardContent>
                </Card>

              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
