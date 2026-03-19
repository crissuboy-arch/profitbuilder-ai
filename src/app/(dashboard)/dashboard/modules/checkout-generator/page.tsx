"use client";

import { useState } from "react";
import { generateCheckout, saveCheckoutToProject, type CheckoutResult } from "./actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CountrySelect } from "@/components/shared/CountrySelect";
import { LanguageSelect } from "@/components/shared/LanguageSelect";
import { toast } from "sonner";
import { Loader2, CreditCard, ShoppingCart, TrendingUp, ArrowDownRight, Layers, CreditCard as CardIcon, ShieldCheck, CheckCircle2, Save, FileCheck } from "lucide-react";

export default function CheckoutGeneratorPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckoutResult | null>(null);
  const [currentProjectName, setCurrentProjectName] = useState("");
  const [parsedLanguage, setParsedLanguage] = useState("");

  async function onSubmit(formData: FormData) {
    setLoading(true);
    setResult(null);

    const productName = formData.get("productName") as string;
    const language = formData.get("language") as string;
    setCurrentProjectName(`${productName} Checkout Flow`);
    setParsedLanguage(language);

    const params = {
      productName,
      price: formData.get("price") as string,
      offerStructure: formData.get("offerStructure") as string,
      bonuses: formData.get("bonuses") as string,
      guarantee: formData.get("guarantee") as string,
      country: formData.get("country") as string,
      language: language,
    };

    const { success, data, error } = await generateCheckout(params);

    if (success && data) {
      setResult(data);
      toast.success(`Checkout strategy generated in ${language}!`);
    } else {
      toast.error(error || "Failed to generate checkout strategy.");
    }
    
    setLoading(false);
  }

  async function handleSave() {
    if (!result) return;
    toast.loading("Saving to project...", { id: "save-checkout" });
    const { success, message, error } = await saveCheckoutToProject(result, currentProjectName);
    
    if (success) {
      toast.success(message, { id: "save-checkout" });
    } else {
      toast.error(error, { id: "save-checkout" });
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto font-[family-name:var(--font-geist-sans)]">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-amber-500/10 rounded-xl">
          <CreditCard className="w-8 h-8 text-amber-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Checkout Generator</h1>
          <p className="text-muted-foreground">Architect high-converting order bumps, upsell flows, and payment structures.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Left Column - Input Form */}
        <Card className="xl:col-span-4 h-fit sticky top-24 border-none shadow-md">
          <CardHeader>
            <CardTitle>Checkout Variables</CardTitle>
            <CardDescription>Input your offer details to build the cart architecture.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="productName">Product Name</Label>
                <Input id="productName" name="productName" placeholder="e.g., The AI Launchpad" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Base Price</Label>
                <Input id="price" name="price" placeholder="e.g., $497" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="offerStructure">Core Offer Highlights</Label>
                <Textarea 
                  id="offerStructure" 
                  name="offerStructure" 
                  placeholder="e.g., 6-week program, private community, weekly calls." 
                  className="min-h-[80px]"
                  required 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bonuses">Bonuses Offered</Label>
                <Textarea 
                  id="bonuses" 
                  name="bonuses" 
                  placeholder="e.g., Swipe files, execution templates." 
                  className="min-h-[60px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="guarantee">Guarantee / Risk Reversal</Label>
                <Input id="guarantee" name="guarantee" placeholder="e.g., 30-Day Money Back" required />
              </div>

              <div className="grid grid-cols-2 gap-4 border-t pt-4 mt-2 border-slate-100">
                  <CountrySelect />
                  <LanguageSelect />
              </div>

              <Button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-white shadow-lg mt-6" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Structuring Cart...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Generate Checkout Flow
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
                <ShoppingCart className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-medium text-slate-700">Awaiting Product Data</h3>
              <p className="text-slate-500 max-w-sm text-center mt-2 text-sm">
                Submit your product parameters to generate localized cart copy, bumps, and upsells.
              </p>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center h-[600px] border-2 border-dashed rounded-xl bg-amber-50/30">
              <Loader2 className="w-12 h-12 text-amber-500 animate-spin mb-4" />
              <h3 className="text-xl font-medium text-slate-700 animate-pulse">Calculating Revenue Multipliers...</h3>
              <p className="text-slate-500 text-sm mt-2">Writing high-converting bumps and upsells.</p>
            </div>
          )}

          {result && !loading && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-2 text-amber-600 font-medium tracking-tight">
                  <CheckCircle2 className="w-5 h-5" />
                  Cart Architecture Ready
                </div>
                 <div className="flex items-center gap-3">
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md border border-slate-200">
                    Language: {parsedLanguage}
                  </span>
                  <Button onClick={handleSave} className="bg-slate-900 text-white hover:bg-slate-800 shadow-md">
                    <Save className="w-4 h-4 mr-2" />
                    Save Flow
                  </Button>
                </div>
              </div>

              {/* Top: Structure & Copy */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <Card className="border-none shadow-sm bg-gradient-to-br from-slate-900 to-slate-800 text-white">
                  <CardContent className="pt-6">
                    <h3 className="font-bold flex items-center gap-2 mb-3 text-amber-400">
                      <Layers className="w-5 h-5" /> Checkout Page Setup
                    </h3>
                    <p className="text-slate-300 text-sm leading-relaxed">{result.checkoutStructure}</p>

                    <div className="mt-6 pt-4 border-t border-slate-700">
                      <h4 className="font-semibold text-sm text-slate-400 mb-2 flex items-center gap-2">
                        <CardIcon className="w-4 h-4" /> Payment Plan Options
                      </h4>
                      <div className="space-y-2">
                         {result.paymentPlans.map((plan, i) => (
                           <div key={i} className="text-sm bg-slate-800/80 p-2 rounded border border-slate-700 font-medium">
                             {plan}
                           </div>
                         ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm border border-slate-200">
                  <CardHeader className="pb-3 border-b bg-slate-50/50">
                     <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                       <ShoppingCart className="w-4 h-4 text-amber-500" /> Cart Micro-Copy
                     </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                     <p className="text-slate-700 leading-relaxed font-medium italic border-l-4 border-amber-300 pl-4 py-1">
                       {result.checkoutCopy}
                     </p>
                  </CardContent>
                </Card>
              </div>

              {/* Expansion: Bumps, Upsells, Downsells */}
              <Card className="border-none shadow-md border-t-8 border-t-amber-500">
                <CardHeader className="border-b border-slate-100 pb-4">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <TrendingUp className="w-6 h-6 text-emerald-500" /> 
                    Average Order Value (AOV) Expansion
                  </CardTitle>
                  <CardDescription>Strategically placed offers to maximize customer value during checkout.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Order Bumps */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-slate-800 flex items-center gap-2 border-b pb-2">
                      <div className="w-2 h-2 rounded-full bg-amber-500"></div> Order Bumps
                    </h4>
                    <p className="text-xs text-slate-500 mb-4">Presented right before the submit button.</p>
                    {result.orderBumps.map((bump, i) => (
                      <div key={i} className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-sm text-amber-900 font-medium shadow-sm">
                        + {bump}
                      </div>
                    ))}
                  </div>

                  {/* Upsells */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-slate-800 flex items-center gap-2 border-b pb-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div> 1-Click Upsells
                    </h4>
                    <p className="text-xs text-slate-500 mb-4">Shown immediately after checkout completion.</p>
                    {result.upsells.map((upsell, i) => (
                      <div key={i} className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg text-sm text-emerald-900 font-medium shadow-sm">
                        {upsell}
                      </div>
                    ))}
                  </div>

                   {/* Downsells */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-slate-800 flex items-center gap-2 border-b pb-2">
                      <div className="w-2 h-2 rounded-full bg-rose-500"></div> Downsells
                    </h4>
                    <p className="text-xs text-slate-500 mb-4">Triggered only if an upsell is declined.</p>
                    {result.downsells.map((downsell, i) => (
                      <div key={i} className="bg-rose-50 border border-rose-200 p-3 rounded-lg text-sm text-rose-900 font-medium shadow-sm">
                        <ArrowDownRight className="inline w-3 h-3 mr-1" /> {downsell}
                      </div>
                    ))}
                  </div>

                </CardContent>
              </Card>

              {/* Thank You Page */}
              <Card className="border-none shadow-sm bg-slate-50">
                <CardContent className="p-4 flex gap-4 items-center">
                  <FileCheck className="w-8 h-8 text-blue-500 shrink-0" />
                  <div>
                    <h4 className="font-bold text-slate-800 mb-1">Thank You Page Copy</h4>
                    <p className="text-slate-600 font-medium">"{result.thankYouPage}"</p>
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
