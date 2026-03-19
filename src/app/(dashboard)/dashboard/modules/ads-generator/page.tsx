"use client";

import { useState } from "react";
import { generateAds, saveAdsToProject, type AdsResult } from "./actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CountrySelect } from "@/components/shared/CountrySelect";
import { LanguageSelect } from "@/components/shared/LanguageSelect";
import { toast } from "sonner";
import { Loader2, Megaphone, Video, Image as ImageIcon, CheckCircle2, Save, MousePointerClick, AlignLeft, HeartPulse } from "lucide-react";

export default function AdsGeneratorPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AdsResult | null>(null);
  const [currentProjectName, setCurrentProjectName] = useState("");
  const [parsedLanguage, setParsedLanguage] = useState("");

  async function onSubmit(formData: FormData) {
    setLoading(true);
    setResult(null);

    const productName = formData.get("productName") as string;
    const language = formData.get("language") as string;
    setCurrentProjectName(`${productName} Ads`);
    setParsedLanguage(language);

    const params = {
      productName,
      targetAudience: formData.get("targetAudience") as string,
      price: formData.get("price") as string,
      uniqueMechanism: formData.get("uniqueMechanism") as string,
      platform: formData.get("platform") as string,
      country: formData.get("country") as string,
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

  async function handleSave() {
    if (!result) return;
    toast.loading("Saving to project...", { id: "save-ads" });
    const { success, message, error } = await saveAdsToProject(result, currentProjectName);
    
    if (success) {
      toast.success(message, { id: "save-ads" });
    } else {
      toast.error(error, { id: "save-ads" });
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto font-[family-name:var(--font-geist-sans)]">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-pink-600/10 rounded-xl">
          <Megaphone className="w-8 h-8 text-pink-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ads Generator</h1>
          <p className="text-muted-foreground">Generate high-converting direct response creatives for structured ad platforms.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Left Column - Input Form */}
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
                <Select name="platform" defaultValue="Facebook/Instagram" required>
                  <SelectTrigger id="platform">
                    <SelectValue placeholder="Select Platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Facebook/Instagram">Meta (Facebook/Instagram)</SelectItem>
                    <SelectItem value="TikTok">TikTok</SelectItem>
                    <SelectItem value="YouTube">YouTube Ads</SelectItem>
                    <SelectItem value="Google">Google Search/Display</SelectItem>
                    <SelectItem value="LinkedIn">LinkedIn B2B</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t pt-4 mt-2 border-slate-100">
                  <CountrySelect />
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

        {/* Right Column - Results */}
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

              {/* Core Output: Primary Text & Hook */}
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

              {/* Grid: Short Form & Video Script */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Short Copy */}
                <Card className="border-none shadow-sm border border-slate-200 bg-slate-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                       <MousePointerClick className="w-4 h-4 text-slate-400" /> Retargeting (Short)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-700 leading-relaxed font-medium">
                      "{result.shortAdCopy}"
                    </p>
                  </CardContent>
                </Card>

                {/* Emotional Triggers */}
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

              {/* Video Script */}
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

              {/* Grid: Headlines & CTA */}
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
                        <Button size="sm" variant="outline" className="border-emerald-200 text-emerald-600 h-7 text-xs">Use CTA</Button>
                      </div>
                    ))}
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
