"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  generateProducts,
  saveProductToProject,
  saveMultipleProductsToProject,
  type ProductIdea,
  type CompetitionLevel,
} from "./actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CountrySelect } from "@/components/shared/CountrySelect";
import { toast } from "sonner";
import { useLanguage } from "@/lib/i18n";
import { useCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";
import {
  Loader2, PlusCircle, Search, Sparkles, CheckCircle2, Save,
  Users, Zap, TrendingUp, ArrowRight, BarChart2, Package2,
  ExternalLink, Globe, Wifi,
} from "lucide-react";

// ── Output language options (for AI content, separate from UI language) ────────

const OUTPUT_LANGS = [
  { value: "Português (PT-BR)", label: "🇧🇷 Português (PT-BR)" },
  { value: "English",           label: "🇺🇸 English" },
  { value: "Spanish",           label: "🇪🇸 Español" },
  { value: "French",            label: "🇫🇷 Français" },
  { value: "German",            label: "🇩🇪 Deutsch" },
  { value: "Italian",           label: "🇮🇹 Italiano" },
];

// ── Competition level style config ─────────────────────────────────────────────

const COMPETITION_STYLE: Record<CompetitionLevel, { bg: string; text: string; dot: string }> = {
  Low:    { bg: "bg-emerald-500/15", text: "text-emerald-400", dot: "bg-emerald-400" },
  Medium: { bg: "bg-amber-500/15",   text: "text-amber-400",   dot: "bg-amber-400" },
  High:   { bg: "bg-red-500/15",     text: "text-red-400",     dot: "bg-red-400" },
};

const DEFAULT_COMPETITION_STYLE = COMPETITION_STYLE["Medium"];

// ── Platform badge colors ──────────────────────────────────────────────────────

const PLATFORM_COLORS: Record<string, string> = {
  Hotmart:    "bg-[#FF6B35]/15 text-[#FF6B35] border-[#FF6B35]/20",
  Kiwify:     "bg-violet-500/15 text-violet-400 border-violet-500/20",
  Eduzz:      "bg-blue-500/15 text-blue-400 border-blue-500/20",
  Monetizze:  "bg-cyan-500/15 text-cyan-400 border-cyan-500/20",
  Teachable:  "bg-pink-500/15 text-pink-400 border-pink-500/20",
  Kajabi:     "bg-indigo-500/15 text-indigo-400 border-indigo-500/20",
  Gumroad:    "bg-rose-500/15 text-rose-400 border-rose-500/20",
  Thinkific:  "bg-teal-500/15 text-teal-400 border-teal-500/20",
  Udemy:      "bg-orange-500/15 text-orange-400 border-orange-500/20",
};

function getPlatformStyle(platform: string): string {
  return PLATFORM_COLORS[platform] ?? "bg-slate-500/15 text-slate-400 border-slate-500/20";
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function ProductMinerPage() {
  const router    = useRouter();
  const { t }     = useLanguage();
  const { format: formatCurrency, currency } = useCurrency();

  const [loading, setLoading]             = useState(false);
  const [results, setResults]             = useState<ProductIdea[]>([]);
  const [currentProjectName, setCurrentProjectName] = useState("");
  const [outputLang, setOutputLang]       = useState("Português (PT-BR)");
  const [deepSearch, setDeepSearch]       = useState(false);

  // ── Submit ──────────────────────────────────────────────────────────────────

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd   = new FormData(form);

    setLoading(true);
    setResults([]);

    const niche = fd.get("niche") as string;
    setCurrentProjectName(`${niche} — Products`);

    const params = {
      niche,
      subniche:       fd.get("subniche")       as string,
      businessType:   fd.get("businessType")   as string,
      country:        fd.get("country")        as string,
      language:       outputLang,
      targetAudience: fd.get("targetAudience") as string,
      targetGoal:     fd.get("targetGoal")     as string,
    };

    if (deepSearch) {
      // ── Deep Search via API route ────────────────────────────────────────
      try {
        const resp = await fetch("/api/deep-search", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify(params),
        });
        const json = await resp.json();
        if (json.success && json.data) {
          setResults(json.data);
          toast.success(`${json.data.length} ${t("pm.ds.results.count")} ✓`);
        } else {
          toast.error(json.error || "Deep search failed.");
        }
      } catch (err: any) {
        toast.error(err.message || "Network error.");
      }
    } else {
      // ── Standard AI generation ───────────────────────────────────────────
      const { success, data, error } = await generateProducts(params);
      if (success && data) {
        setResults(data);
        toast.success(`${data.length} ${t("pm.results.count")} ✓`);
      } else {
        toast.error(error || "Failed to generate ideas.");
      }
    }

    setLoading(false);
  }

  // ── Save single ─────────────────────────────────────────────────────────────

  async function handleSave(product: ProductIdea) {
    toast.loading(`${t("pm.results.save")}...`, { id: product.productName });
    const { success, message, error } = await saveProductToProject(product, currentProjectName);
    if (success) {
      toast.success(message ?? t("pm.results.save"), { id: product.productName });
    } else {
      toast.error(error ?? "Failed to save.", { id: product.productName });
    }
  }

  // ── Save all ────────────────────────────────────────────────────────────────

  async function handleSaveAll() {
    if (results.length === 0) return;
    toast.loading(`${t("pm.results.saveAll")}...`, { id: "save-all" });
    const { success, message, error } = await saveMultipleProductsToProject(results, currentProjectName);
    if (success) {
      toast.success(message ?? "Saved!", { id: "save-all" });
    } else {
      toast.error(error ?? "Failed.", { id: "save-all" });
    }
  }

  // ── Navigate to Product Builder with pre-fill ────────────────────────────────

  function handleCreateProduct(product: ProductIdea) {
    localStorage.setItem(
      "prefill-product",
      JSON.stringify({
        name:     product.productName,
        type:     product.productType,
        audience: product.targetAudience,
        problem:  product.mainProblemSolved,
        format:   product.recommendedFormat,
      })
    );
    router.push("/dashboard/modules/product-builder");
  }

  // ── Price display ────────────────────────────────────────────────────────────

  function displayPrice(product: ProductIdea): string {
    if (currency === "USD") return `$ ${product.priceUSD}`;
    if (currency === "EUR") return `€ ${product.priceEUR}`;
    return `R$ ${product.priceBRL}`;
  }

  // ── Competition label ────────────────────────────────────────────────────────

  function competitionLabel(level: CompetitionLevel): string {
    if (level === "Low")    return t("pm.competition.low");
    if (level === "High")   return t("pm.competition.high");
    return t("pm.competition.medium");
  }

  const competitionStyle = (level?: CompetitionLevel) =>
    COMPETITION_STYLE[level as CompetitionLevel] ?? DEFAULT_COMPETITION_STYLE;

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 btn-cta rounded-2xl shadow-lg">
          <Search className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">{t("pm.title")}</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{t("pm.subtitle")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* ── Form ──────────────────────────────────────────────────────────── */}
        <div className="lg:col-span-4">
          <Card className="sticky top-24 glass card-premium rounded-2xl overflow-hidden border-border/50">
            <CardHeader className="px-6 py-5 bg-gradient-to-r from-violet-600/20 to-purple-600/10 border-b border-border/50">
              <CardTitle className="text-sm font-semibold">{t("pm.form.title")}</CardTitle>
              <p className="text-xs text-muted-foreground">{t("pm.form.desc")}</p>
            </CardHeader>
            <CardContent className="px-6 pt-6 pb-2">
              <form onSubmit={onSubmit} className="space-y-4">

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {t("pm.form.niche")}
                  </Label>
                  <Input
                    name="niche"
                    placeholder={t("pm.form.niche.ph")}
                    className="rounded-lg"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {t("pm.form.subniche")}
                  </Label>
                  <Input
                    name="subniche"
                    placeholder={t("pm.form.subniche.ph")}
                    className="rounded-lg"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {t("pm.form.businessType")}
                  </Label>
                  <Select name="businessType" defaultValue="Info-product">
                    <SelectTrigger className="rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Info-product">{t("pm.form.bt.info")}</SelectItem>
                      <SelectItem value="SaaS">{t("pm.form.bt.saas")}</SelectItem>
                      <SelectItem value="Service">{t("pm.form.bt.service")}</SelectItem>
                      <SelectItem value="Physical">{t("pm.form.bt.physical")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {t("pm.form.audience")}
                  </Label>
                  <Input
                    name="targetAudience"
                    placeholder={t("pm.form.audience.ph")}
                    className="rounded-lg"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {t("pm.form.goal")}
                  </Label>
                  <Input
                    name="targetGoal"
                    placeholder={t("pm.form.goal.ph")}
                    className="rounded-lg"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/50">
                  <CountrySelect label={t("pm.form.country")} />
                  {/* Output language (for AI content) */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {t("pm.form.outputLang")}
                    </Label>
                    <Select
                      value={outputLang}
                      onValueChange={(v) => { if (v) setOutputLang(v); }}
                    >
                      <SelectTrigger className="rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {OUTPUT_LANGS.map((l) => (
                          <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* ── Deep Search toggle ────────────────────────────────────── */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setDeepSearch((v) => !v)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setDeepSearch((v) => !v); }}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 cursor-pointer select-none",
                    deepSearch
                      ? "bg-[#00d4aa]/10 border-[#00d4aa]/40"
                      : "bg-white/5 border-border/40 hover:border-border/70"
                  )}
                >
                  <span className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                    deepSearch ? "bg-[#00d4aa]/20" : "bg-white/10"
                  )}>
                    <Wifi className={cn("w-4 h-4", deepSearch ? "text-[#00d4aa]" : "text-muted-foreground")} />
                  </span>
                  <span className="flex-1 min-w-0 flex flex-col">
                    <span className="flex items-center gap-2">
                      <span className={cn(
                        "text-xs font-bold",
                        deepSearch ? "text-[#00d4aa]" : "text-foreground"
                      )}>
                        {t("pm.ds.label")}
                      </span>
                      {deepSearch && (
                        <span className="text-[10px] font-bold bg-[#00d4aa]/20 text-[#00d4aa] px-1.5 py-0.5 rounded-full">
                          ON
                        </span>
                      )}
                    </span>
                    <span className="text-[10px] text-muted-foreground mt-0.5 leading-snug">
                      {t("pm.ds.desc")}
                    </span>
                  </span>
                  {/* Toggle pill */}
                  <span className={cn(
                    "w-10 h-5 rounded-full transition-colors duration-200 relative shrink-0 inline-flex items-center",
                    deepSearch ? "bg-[#00d4aa]" : "bg-border"
                  )}>
                    <span className={cn(
                      "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200",
                      deepSearch ? "left-5" : "left-0.5"
                    )} />
                  </span>
                </div>

                <Button
                  type="submit"
                  className="w-full btn-cta font-semibold rounded-xl py-5"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {deepSearch ? t("pm.ds.loading") : t("pm.form.mining")}
                    </>
                  ) : (
                    <>
                      {deepSearch
                        ? <Globe className="mr-2 h-4 w-4" />
                        : <Sparkles className="mr-2 h-4 w-4" />
                      }
                      {t("pm.form.generate")}
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
            <div className="px-6 pb-6" />
          </Card>
        </div>

        {/* ── Results ───────────────────────────────────────────────────────── */}
        <div className="lg:col-span-8 flex flex-col gap-6">

          {/* Empty state */}
          {results.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center h-[520px] rounded-2xl border-2 border-dashed border-border/50 bg-background/40">
              <div className="w-16 h-16 rounded-2xl bg-violet-500/10 flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-violet-400" />
              </div>
              <h3 className="text-base font-bold">{t("pm.empty.title")}</h3>
              <p className="text-muted-foreground text-sm max-w-xs text-center mt-2 leading-relaxed">
                {t("pm.empty.desc")}
              </p>
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div className={cn(
              "flex flex-col items-center justify-center h-[520px] rounded-2xl border-2 border-dashed",
              deepSearch
                ? "border-[#00d4aa]/20 bg-[#00d4aa]/5"
                : "border-violet-500/20 bg-violet-500/5"
            )}>
              <div className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center mb-5",
                deepSearch ? "bg-[#00d4aa]/10" : "bg-violet-500/10"
              )}>
                {deepSearch
                  ? <Globe className="w-8 h-8 text-[#00d4aa] animate-pulse" />
                  : <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
                }
              </div>
              <h3 className="text-base font-bold animate-pulse">
                {deepSearch ? t("pm.ds.loading") : t("pm.loading.title")}
              </h3>
              <p className="text-muted-foreground text-sm mt-2">
                {deepSearch
                  ? "Tavily → OpenAI synthesis"
                  : t("pm.loading.desc")
                }
              </p>
            </div>
          )}

          {results.length > 0 && !loading && (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">

              {/* Toolbar */}
              <div className="flex justify-between items-center glass rounded-2xl px-5 py-3.5 border border-border/50">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00d4aa]" />
                  <span className="text-sm font-semibold">
                    {results.length}{" "}
                    {results[0]?.dataSource === "web"
                      ? t("pm.ds.results.count")
                      : t("pm.results.count")
                    }
                  </span>
                  {/* Mode badge */}
                  {results[0]?.dataSource === "web" ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold bg-[#00d4aa]/15 text-[#00d4aa] px-2 py-0.5 rounded-full border border-[#00d4aa]/25">
                      <Wifi className="w-2.5 h-2.5" />
                      {t("pm.ds.badge.web")}
                    </span>
                  ) : (
                    <span className="text-xs bg-violet-500/15 text-violet-400 px-2 py-0.5 rounded-full border border-violet-500/20">
                      {outputLang.split(" ")[0]}
                    </span>
                  )}
                </div>
                <Button
                  onClick={handleSaveAll}
                  size="sm"
                  className="btn-cta text-xs font-semibold rounded-xl px-4"
                >
                  <Save className="w-3.5 h-3.5 mr-1.5" />
                  {t("pm.results.saveAll")}
                </Button>
              </div>

              {/* Cards grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.map((product, index) => {
                  const compStyle  = competitionStyle(product.competitionLevel as CompetitionLevel);
                  const isWebData  = product.dataSource === "web";

                  return (
                    <Card
                      key={index}
                      className="flex flex-col rounded-2xl glass card-premium border border-border/50 hover:border-violet-500/30 transition-all duration-200 overflow-hidden"
                    >
                      {/* Top accent bar */}
                      <div className={cn(
                        "h-0.5 w-full",
                        isWebData
                          ? "bg-gradient-to-r from-[#00d4aa] via-teal-400 to-[#00d4aa]"
                          : "bg-gradient-to-r from-violet-500 via-[#00d4aa] to-purple-500"
                      )} />

                      {/* Header */}
                      <CardHeader className="pb-2 px-5 pt-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {/* Data source badge */}
                              {isWebData ? (
                                <span className="flex items-center gap-1 text-[9px] font-bold bg-[#00d4aa]/15 text-[#00d4aa] px-1.5 py-0.5 rounded-full border border-[#00d4aa]/25 shrink-0">
                                  <Wifi className="w-2 h-2" />
                                  {t("pm.ds.badge.web")}
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-[9px] font-bold bg-violet-500/15 text-violet-400 px-1.5 py-0.5 rounded-full border border-violet-500/20 shrink-0">
                                  <Sparkles className="w-2 h-2" />
                                  {t("pm.ds.badge.ai")}
                                </span>
                              )}
                            </div>
                            <CardTitle className="text-base font-bold leading-snug line-clamp-2">
                              {product.productName}
                            </CardTitle>
                            <div className="flex items-center gap-1.5 mt-1.5">
                              <Package2 className="w-3 h-3 text-muted-foreground shrink-0" />
                              <span className="text-xs text-muted-foreground font-medium">
                                {product.productType}
                              </span>
                            </div>
                          </div>
                          {/* Competition badge */}
                          <div
                            className={cn(
                              "shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border",
                              compStyle.bg,
                              compStyle.text,
                              "border-current/20"
                            )}
                          >
                            <span className={cn("w-1.5 h-1.5 rounded-full", compStyle.dot)} />
                            {competitionLabel(product.competitionLevel as CompetitionLevel)}
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="px-5 pt-0 flex-1 space-y-3">

                        {/* Audience */}
                        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/5 border border-border/40">
                          <Users className="w-4 h-4 text-violet-400 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">
                              {t("pm.card.audience")}
                            </p>
                            <p className="text-xs leading-snug">{product.targetAudience}</p>
                          </div>
                        </div>

                        {/* Problem solved */}
                        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/5 border border-border/40">
                          <Zap className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">
                              {t("pm.card.problem")}
                            </p>
                            <p className="text-xs leading-snug">{product.mainProblemSolved}</p>
                          </div>
                        </div>

                        {/* Metrics row: price | competition | profit */}
                        <div className="grid grid-cols-3 gap-2">
                          <div className="p-2.5 rounded-xl bg-[#00d4aa]/10 border border-[#00d4aa]/20 text-center">
                            <p className="text-sm font-black text-[#00d4aa]">{displayPrice(product)}</p>
                            <p className="text-[9px] text-muted-foreground uppercase tracking-wide mt-0.5">
                              {t("pm.card.price")}
                            </p>
                          </div>
                          <div className={cn("p-2.5 rounded-xl border text-center", compStyle.bg, "border-current/20")}>
                            <p className={cn("text-sm font-black", compStyle.text)}>
                              {competitionLabel(product.competitionLevel as CompetitionLevel)}
                            </p>
                            <p className="text-[9px] text-muted-foreground uppercase tracking-wide mt-0.5">
                              {t("pm.card.competition")}
                            </p>
                          </div>
                          <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-center">
                            <BarChart2 className="w-3.5 h-3.5 text-purple-400 mx-auto" />
                            <p className="text-[9px] text-muted-foreground uppercase tracking-wide mt-0.5">
                              {t("pm.card.profit")}
                            </p>
                          </div>
                        </div>

                        {/* Profit potential full text */}
                        <p className="text-xs text-muted-foreground leading-relaxed px-1">
                          <span className="font-semibold text-purple-400">{t("pm.card.profit")}: </span>
                          {product.profitPotential}
                        </p>

                        {/* Market trend */}
                        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/5 border border-border/40">
                          <TrendingUp className="w-4 h-4 text-[#00d4aa] mt-0.5 shrink-0" />
                          <div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">
                              {t("pm.card.trend")}
                            </p>
                            <p className="text-xs leading-snug">{product.marketTrend}</p>
                          </div>
                        </div>

                        {/* Platforms */}
                        {product.recommendedPlatforms?.length > 0 && (
                          <div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                              {t("pm.card.platforms")}
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {product.recommendedPlatforms.map((p) => (
                                <span
                                  key={p}
                                  className={cn(
                                    "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                                    getPlatformStyle(p)
                                  )}
                                >
                                  {p}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Web sources (only for deep search results) */}
                        {isWebData && product.webSources && product.webSources.length > 0 && (
                          <div className="pt-1">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                              <Globe className="w-3 h-3 text-[#00d4aa]" />
                              {t("pm.ds.sources")}
                            </p>
                            <div className="space-y-1">
                              {product.webSources.slice(0, 3).map((src, i) => (
                                <a
                                  key={i}
                                  href={src.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1.5 text-[10px] text-[#00d4aa]/80 hover:text-[#00d4aa] transition-colors group"
                                >
                                  <ExternalLink className="w-2.5 h-2.5 shrink-0 opacity-60 group-hover:opacity-100" />
                                  <span className="truncate">{src.title}</span>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                      </CardContent>

                      {/* Footer actions */}
                      <CardFooter className="px-5 pb-4 pt-3 border-t border-border/40 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-xs font-semibold rounded-xl hover:border-violet-500/40"
                          onClick={() => handleSave(product)}
                        >
                          <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
                          {t("pm.results.save")}
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1 btn-cta text-xs font-semibold rounded-xl"
                          onClick={() => handleCreateProduct(product)}
                        >
                          {t("pm.results.create")}
                          <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
