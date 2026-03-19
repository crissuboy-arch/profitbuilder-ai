"use client";

import { useState } from "react";
import { generateSEO, saveSEOToProject, type SEOResult } from "./actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CountrySelect } from "@/components/shared/CountrySelect";
import { LanguageSelect } from "@/components/shared/LanguageSelect";
import { toast } from "sonner";
import { 
  Loader2, 
  Search,
  Type,
  Link as LinkIcon,
  AlignLeft,
  KeyRound,
  CodeXml,
  CheckCircle2,
  Save,
  Globe,
  MessageSquare
} from "lucide-react";

export default function SEOGeneratorPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SEOResult | null>(null);
  const [currentProjectName, setCurrentProjectName] = useState("");

  async function onSubmit(formData: FormData) {
    setLoading(true);
    setResult(null);

    const keyword = formData.get("keyword") as string;
    setCurrentProjectName(`${keyword} SEO Strategy`);

    const params = {
      keyword,
      niche: formData.get("niche") as string,
      targetAudience: formData.get("targetAudience") as string,
      contentType: formData.get("contentType") as string,
      country: formData.get("country") as string,
      language: formData.get("language") as string,
    };

    const { success, data, error } = await generateSEO(params);

    if (success && data) {
      setResult(data);
      toast.success("Localized SEO Strategy mapped!");
    } else {
      toast.error(error || "Failed to generate SEO strategy.");
    }
    
    setLoading(false);
  }

  async function handleSave() {
    if (!result) return;
    toast.loading("Saving to project...", { id: "save-seo" });
    const { success, message, error } = await saveSEOToProject(result, currentProjectName);
    
    if (success) {
      toast.success(message, { id: "save-seo" });
    } else {
      toast.error(error, { id: "save-seo" });
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto font-[family-name:var(--font-geist-sans)]">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-violet-600/10 rounded-xl">
          <Search className="w-8 h-8 text-violet-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">SEO Generator</h1>
          <p className="text-muted-foreground">Architect native organic traffic funnels tailored for global and local markets.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Left Column - Input Form */}
        <Card className="xl:col-span-4 h-fit sticky top-24 border-none shadow-md">
          <CardHeader>
            <CardTitle>Content Parameters</CardTitle>
            <CardDescription>Enter the data to model search intent.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="keyword">Target Root Keyword</Label>
                <Input id="keyword" name="keyword" placeholder="e.g., SAAS Marketing" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="niche">Specific Niche/Industry</Label>
                <Input id="niche" name="niche" placeholder="e.g., B2B Software" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetAudience">Target Audience</Label>
                <Input id="targetAudience" name="targetAudience" placeholder="e.g., Startup Founders" required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contentType">Content Type</Label>
                <Select name="contentType" defaultValue="Blog Post" required>
                  <SelectTrigger id="contentType">
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Blog Post">Pillar Blog Post</SelectItem>
                    <SelectItem value="Product Page">E-Commerce Product Page</SelectItem>
                    <SelectItem value="Landing Page">Lead Gen Landing Page</SelectItem>
                    <SelectItem value="Service Page">Local Service Page</SelectItem>
                  </SelectContent>
                </Select>
              </div>

               <div className="grid grid-cols-2 gap-4 border-t pt-4 mt-2 border-slate-100">
                  <CountrySelect />
                  <LanguageSelect />
              </div>

              <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700 text-white shadow-lg mt-6" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing SERP...
                  </>
                ) : (
                  <>
                    <Globe className="mr-2 h-4 w-4" />
                    Generate Architecture
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
                <Search className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-medium text-slate-700">Awaiting Target Data</h3>
              <p className="text-slate-500 max-w-sm text-center mt-2 text-sm">
                Provide your keyword and audience to generate properly translated SEO HTML structures and entities.
              </p>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center h-[600px] border-2 border-dashed rounded-xl bg-violet-50/30">
              <Loader2 className="w-12 h-12 text-violet-600 animate-spin mb-4" />
              <h3 className="text-xl font-medium text-slate-700 animate-pulse">Translating & Mapping Entities...</h3>
              <p className="text-slate-500 text-sm mt-2">Writing properly localized semantic clusters...</p>
            </div>
          )}

          {result && !loading && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* Header Action Bar */}
              <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-3">
                   <div className="flex items-center gap-2 text-violet-600 font-medium tracking-tight">
                    <CheckCircle2 className="w-5 h-5" />
                    SEO Architecture Built
                  </div>
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md border border-slate-200">
                    {result.languageUsed} • {result.countryTargeted}
                  </span>
                </div>
                <Button onClick={handleSave} className="bg-slate-900 text-white hover:bg-slate-800 shadow-md">
                  <Save className="w-4 h-4 mr-2" />
                  Save Blueprint
                </Button>
              </div>

              {/* Native Introduction */}
              <Card className="border-none shadow-sm bg-violet-50 text-violet-900 border border-violet-100">
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    <MessageSquare className="w-6 h-6 text-violet-400 shrink-0" />
                    <div>
                      <h4 className="font-bold mb-2">Generated Introduction ({result.languageUsed})</h4>
                      <p className="text-sm leading-relaxed">{result.introduction}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Head Tags (Titles, Meta, Slugs) */}
              <Card className="border-none shadow-sm border-t-4 border-t-blue-500">
                <CardHeader className="pb-4 border-b border-slate-100 mb-4 bg-slate-50/50">
                  <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
                    <CodeXml className="w-5 h-5 text-blue-500" />
                    SERP Presence (Metadata)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* Titles */}
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2 mb-3">
                      <Type className="w-4 h-4 text-slate-400" /> Title Tags
                    </h3>
                    <div className="space-y-2">
                       {result.titles.map((title, i) => (
                         <div key={i} className="flex gap-2 items-center bg-blue-50/50 p-2 rounded border border-blue-100">
                           <span className="w-6 h-6 rounded-full bg-white border border-blue-200 text-blue-700 flex items-center justify-center text-xs font-bold leading-none shrink-0">{i+1}</span>
                           <span className="text-slate-900 font-medium text-sm">{title}</span>
                         </div>
                       ))}
                    </div>
                  </div>

                  {/* Metas */}
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2 mb-3">
                      <AlignLeft className="w-4 h-4 text-slate-400" /> Meta Descriptions
                    </h3>
                    <div className="space-y-3">
                       {result.metaDescriptions.map((meta, i) => (
                         <div key={i} className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-sm text-slate-600 leading-relaxed shadow-sm">
                           {meta}
                         </div>
                       ))}
                    </div>
                  </div>

                  {/* Slugs */}
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2 mb-3">
                      <LinkIcon className="w-4 h-4 text-slate-400" /> URL Slugs
                    </h3>
                    <div className="flex flex-wrap gap-2">
                       {result.slugs.map((slug, i) => (
                         <span key={i} className="px-3 py-1.5 bg-slate-100 text-slate-700 text-sm font-mono rounded-md border border-slate-300">
                           {slug}
                         </span>
                       ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Article Outline */}
              <Card className="border-none shadow-md">
                <CardHeader className="pb-3 border-b mb-4 bg-slate-900 text-white rounded-t-xl">
                  <CardTitle className="text-lg flex items-center gap-2 text-slate-50">
                    <AlignLeft className="w-5 h-5 text-violet-400" />
                    On-Page Header Outline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-violet-50/50 border border-violet-100 rounded-lg mb-4">
                    <h2 className="text-xl font-bold text-violet-900">
                      <span className="text-violet-500 mr-2 opacity-60">H1</span> {result.outline.h1}
                    </h2>
                  </div>
                  
                  <div className="ml-4 space-y-6 border-l-2 border-slate-200 pl-4">
                    {result.outline.sections.map((sec, i) => (
                      <div key={i} className="space-y-3">
                        <h3 className="text-lg font-bold text-slate-800">
                           <span className="text-slate-400 text-sm mr-2">H2</span> {sec.h2}
                        </h3>
                        {sec.h3s.length > 0 && (
                          <div className="ml-6 space-y-2">
                            {sec.h3s.map((h3, j) => (
                               <h4 key={j} className="text-sm font-medium text-slate-600">
                                 <span className="text-slate-400 text-xs mr-2">H3</span> {h3}
                               </h4>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Keyword Clusters and Links */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* LSI/Keyword Clusters */}
                <Card className="border-none shadow-sm border-t-4 border-t-emerald-500">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold uppercase text-slate-500 tracking-wider flex items-center gap-2">
                      <KeyRound className="w-4 h-4 text-emerald-500" />
                      Localized Keyword Clusters
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-2">
                     {result.keywordClusters.map((cluster, i) => (
                        <div key={i}>
                          <h4 className="text-xs font-bold text-slate-800 mb-2">{cluster.category}</h4>
                          <div className="flex flex-wrap gap-2">
                            {cluster.keywords.map((kw, j) => (
                              <span key={j} className="text-xs text-emerald-800 bg-emerald-100 px-2 py-1 rounded font-semibold border border-emerald-200">
                                {kw}
                              </span>
                            ))}
                          </div>
                        </div>
                     ))}
                  </CardContent>
                </Card>

                {/* FAQ Schema and Links */}
                <div className="space-y-6">
                  {/* Schema */}
                  <Card className="border-none shadow-sm border-t-4 border-t-orange-500 bg-slate-900 border-x border-b">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-bold uppercase text-slate-400 tracking-wider flex items-center gap-2">
                        <CodeXml className="w-4 h-4 text-orange-500" />
                        FAQ Schema Entities
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                       {result.faqSchema.map((faq, i) => (
                         <div key={i} className="bg-slate-800 p-3 rounded">
                           <h5 className="text-orange-300 font-bold text-sm mb-1">Q: {faq.question}</h5>
                           <p className="text-slate-300 text-sm">A: {faq.answer}</p>
                         </div>
                       ))}
                    </CardContent>
                  </Card>

                  {/* Links */}
                  <Card className="border-none shadow-sm border-t-4 border-t-indigo-500 text-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-bold uppercase text-slate-500 tracking-wider flex items-center gap-2">
                        <LinkIcon className="w-4 h-4 text-indigo-500" />
                        Internal Linking Protocol
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                       <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                         {result.internalLinking}
                       </p>
                    </CardContent>
                  </Card>
                </div>

              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
