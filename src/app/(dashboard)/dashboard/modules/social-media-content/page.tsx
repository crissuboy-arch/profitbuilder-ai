"use client";

import { useState } from "react";
import { generateSocialContent, saveSocialToProject, type SocialMediaResult } from "./actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CountrySelect } from "@/components/shared/CountrySelect";
import { LanguageSelect } from "@/components/shared/LanguageSelect";
import { toast } from "sonner";
import { Loader2, Share2, Calendar, MessageSquare, Video, CheckCircle2, Save, Type, Hash } from "lucide-react";

export default function SocialMediaGeneratorPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SocialMediaResult | null>(null);
  const [currentProjectName, setCurrentProjectName] = useState("");
  const [parsedLanguage, setParsedLanguage] = useState("");

  async function onSubmit(formData: FormData) {
    setLoading(true);
    setResult(null);

    const businessType = formData.get("businessType") as string;
    const language = formData.get("language") as string;
    setCurrentProjectName(`${businessType} Social Content`);
    setParsedLanguage(language);

    const params = {
      businessType,
      niche: formData.get("niche") as string,
      targetAudience: formData.get("targetAudience") as string,
      platform: formData.get("platform") as string,
      goal: formData.get("goal") as string,
      country: formData.get("country") as string,
      language: language,
    };

    const { success, data, error } = await generateSocialContent(params);

    if (success && data) {
      setResult(data);
      toast.success(`Social media schedule mapped in ${language}!`);
    } else {
      toast.error(error || "Failed to generate social content.");
    }
    
    setLoading(false);
  }

  async function handleSave() {
    if (!result) return;
    toast.loading("Saving to project...", { id: "save-social" });
    const { success, message, error } = await saveSocialToProject(result, currentProjectName);
    
    if (success) {
      toast.success(message, { id: "save-social" });
    } else {
      toast.error(error, { id: "save-social" });
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto font-[family-name:var(--font-geist-sans)]">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-fuchsia-600/10 rounded-xl">
          <Share2 className="w-8 h-8 text-fuchsia-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Social Media Generator</h1>
          <p className="text-muted-foreground">Automate a week of high-converting organic content tailored for any platform.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Left Column - Input Form */}
        <Card className="xl:col-span-4 h-fit sticky top-24 border-none shadow-md">
          <CardHeader>
            <CardTitle>Content Parameters</CardTitle>
            <CardDescription>Define your brand to structure the 7-day calendar.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="businessType">Business Description</Label>
                <Input id="businessType" name="businessType" placeholder="e.g., SEO Agency" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="niche">Specific Niche</Label>
                <Input id="niche" name="niche" placeholder="e.g., Local Dentists" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetAudience">Target Audience</Label>
                <Input id="targetAudience" name="targetAudience" placeholder="e.g., Private Practice Owners" required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="platform">Priority Platform</Label>
                <Select name="platform" defaultValue="Instagram" required>
                  <SelectTrigger id="platform">
                    <SelectValue placeholder="Select Platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Instagram">Instagram (Reels & Carousels)</SelectItem>
                    <SelectItem value="TikTok">TikTok</SelectItem>
                    <SelectItem value="LinkedIn">LinkedIn (B2B Text/Video)</SelectItem>
                    <SelectItem value="Twitter">X / Twitter</SelectItem>
                    <SelectItem value="Facebook">Facebook Groups/Pages</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="goal">Primary Goal</Label>
                <Select name="goal" defaultValue="Sales" required>
                  <SelectTrigger id="goal">
                    <SelectValue placeholder="Select Goal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sales">Direct Sales & Leads</SelectItem>
                    <SelectItem value="Engagement">Engagement & Community Growth</SelectItem>
                    <SelectItem value="Authority">Brand Authority & Trust</SelectItem>
                    <SelectItem value="Virality">Reach & Virality</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t pt-4 mt-2 border-slate-100">
                  <CountrySelect />
                  <LanguageSelect />
              </div>

              <Button type="submit" className="w-full bg-fuchsia-600 hover:bg-fuchsia-700 text-white shadow-lg mt-6" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Structuring Calendar...
                  </>
                ) : (
                  <>
                    <Calendar className="mr-2 h-4 w-4" />
                    Generate 7-Day Plan
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
                <Share2 className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-medium text-slate-700">Awaiting Profile Data</h3>
              <p className="text-slate-500 max-w-sm text-center mt-2 text-sm">
                Submit your business variables to generate a localized 7-day social media playbook.
              </p>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center h-[600px] border-2 border-dashed rounded-xl bg-fuchsia-50/30">
              <Loader2 className="w-12 h-12 text-fuchsia-600 animate-spin mb-4" />
              <h3 className="text-xl font-medium text-slate-700 animate-pulse">Drafting Scripts & Captions...</h3>
              <p className="text-slate-500 text-sm mt-2">Connecting pain points for the target algorithm.</p>
            </div>
          )}

          {result && !loading && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-2 text-fuchsia-600 font-medium tracking-tight">
                  <CheckCircle2 className="w-5 h-5" />
                  Social Strategy Generated
                </div>
                 <div className="flex items-center gap-3">
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md border border-slate-200">
                    Language: {parsedLanguage}
                  </span>
                  <Button onClick={handleSave} className="bg-slate-900 text-white hover:bg-slate-800 shadow-md">
                    <Save className="w-4 h-4 mr-2" />
                    Save Strategy
                  </Button>
                </div>
              </div>

              {/* 7 Day Content Overview */}
              <Card className="border-none shadow-md overflow-hidden bg-white">
                <div className="bg-slate-900 text-white px-6 py-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-fuchsia-400" />
                  <h3 className="font-bold">7-Day Content Schedule</h3>
                </div>
                <CardContent className="p-0">
                  <div className="divide-y divide-slate-100">
                    {result.weeklySchedule.map((post, i) => (
                      <div key={i} className="flex flex-col md:flex-row p-4 hover:bg-slate-50 transition-colors gap-4">
                         <div className="flex items-center md:items-start gap-3 md:w-48 shrink-0">
                           <div className="w-8 h-8 rounded-md bg-fuchsia-100 text-fuchsia-700 flex items-center justify-center font-bold text-sm shrink-0">
                             D{i+1}
                           </div>
                           <div>
                             <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{post.format}</p>
                           </div>
                         </div>
                         <div className="flex-1">
                           <h4 className="font-bold text-slate-900 mb-1">{post.hook}</h4>
                           <p className="text-slate-600 text-sm leading-relaxed">{post.concept}</p>
                         </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Deep Dives */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Written Captions */}
                <Card className="border-none shadow-sm border border-slate-200">
                  <CardHeader className="pb-2 bg-slate-50/50">
                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                      <Type className="w-4 h-4 text-fuchsia-500" /> Copy & Captions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                    {result.writtenCaptions.map((caption, i) => (
                      <div key={i} className="bg-white border border-slate-100 shadow-sm p-4 rounded-lg relative">
                        <span className="absolute -top-3 -left-3 w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">{i+1}</span>
                        <p className="text-sm text-slate-700 leading-relaxed font-serif whitespace-pre-line">{caption}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <div className="space-y-6">
                  {/* Hooks */}
                  <Card className="border-none shadow-sm border border-orange-100 bg-orange-50/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-bold uppercase tracking-wider text-orange-800 flex items-center gap-2">
                         <MessageSquare className="w-4 h-4" /> Scroll-Stopping Hooks
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {result.shortVideoHooks.map((hook, i) => (
                        <div key={i} className="bg-white p-3 rounded shadow-sm border border-orange-100 text-sm font-bold text-slate-800">
                          "{hook}"
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Hashtags */}
                  <Card className="border-none shadow-sm border border-blue-100 bg-blue-50/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-bold uppercase tracking-wider text-blue-800 flex items-center gap-2">
                         <Hash className="w-4 h-4" /> Keyword Tags
                      </CardTitle>
                      <CardDescription className="text-xs">Optimized for algorithm categorization</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {result.hashtags.map((tag, i) => (
                          <span key={i} className="px-2 py-1 bg-white border border-blue-200 text-blue-700 rounded text-xs font-semibold">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

               {/* Video Scripts */}
               <Card className="border-none shadow-md border-t-4 border-t-purple-500">
                <CardHeader className="bg-slate-50 pb-4 border-b">
                   <CardTitle className="flex items-center gap-2 text-slate-800">
                     <Video className="w-5 h-5 text-purple-600" /> Short Form Video Scripts
                   </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  {result.videoScripts.map((script, i) => (
                    <div key={i} className="bg-slate-900 text-purple-100 p-6 rounded-lg font-mono text-sm leading-relaxed whitespace-pre-line relative">
                      <span className="uppercase text-[10px] font-bold tracking-widest bg-purple-500 text-white px-2 py-1 rounded absolute top-2 right-2">
                        Script {i+1}
                      </span>
                      {script}
                    </div>
                  ))}
                </CardContent>
              </Card>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
