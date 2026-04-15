"use client";

import { useState } from "react";
import {
  generateBook,
  generateBookCover,
  generateChapterImage,
  saveBookToProject,
  type BookResult,
  type BookBlock,
} from "./actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  BookOpen, Loader2, CheckCircle2, Save, FileDown, ChevronDown, ChevronUp, Image as ImageIcon,
} from "lucide-react";

const LANGUAGE_OPTIONS = [
  { value: "Português", label: "PT — Português" },
  { value: "English", label: "EN — English" },
  { value: "Español", label: "ES — Español" },
  { value: "Français", label: "FR — Français" },
];

const GENRE_OPTIONS = [
  { value: "Romance", label: "Romance" },
  { value: "Romance de Mafia", label: "Romance de Máfia" },
  { value: "CEO Romance", label: "CEO Romance" },
  { value: "Dark Romance", label: "Dark Romance" },
  { value: "Suspense Romântico", label: "Suspense Romântico" },
  { value: "Thriller", label: "Thriller" },
  { value: "Fantasia", label: "Fantasia" },
  { value: "Autoajuda", label: "Autoajuda" },
  { value: "Contos", label: "Contos" },
];

const GENRE_COLORS: Record<string, { bg: string; text: string; badge: string }> = {
  Romance:              { bg: "bg-rose-50",    text: "text-rose-700",    badge: "bg-rose-100 text-rose-700" },
  "Romance de Mafia":   { bg: "bg-red-950/10", text: "text-red-800",     badge: "bg-red-100 text-red-800" },
  "CEO Romance":        { bg: "bg-sky-50",     text: "text-sky-800",     badge: "bg-sky-100 text-sky-800" },
  "Dark Romance":       { bg: "bg-purple-950/10", text: "text-purple-900", badge: "bg-purple-100 text-purple-900" },
  "Suspense Romântico": { bg: "bg-teal-50",    text: "text-teal-800",    badge: "bg-teal-100 text-teal-800" },
  Thriller:             { bg: "bg-slate-50",   text: "text-slate-700",   badge: "bg-slate-200 text-slate-800" },
  Fantasia:             { bg: "bg-violet-50",  text: "text-violet-700",  badge: "bg-violet-100 text-violet-700" },
  Autoajuda:            { bg: "bg-amber-50",   text: "text-amber-700",   badge: "bg-amber-100 text-amber-700" },
  Contos:               { bg: "bg-emerald-50", text: "text-emerald-700", badge: "bg-emerald-100 text-emerald-700" },
};

export default function BookGeneratorPage() {
  const [language, setLanguage]       = useState("Português");
  const [genre, setGenre]             = useState("Autoajuda");
  const [theme, setTheme]             = useState("");
  const [loading, setLoading]         = useState(false);
  const [result, setResult]           = useState<BookResult | null>(null);
  const [expandedChapter, setExpandedChapter] = useState<number | null>(null);
  const [pdfLoading, setPdfLoading]   = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  // Images
  const [coverBase64, setCoverBase64] = useState<string | null>(null);
  const [chapterImages, setChapterImages] = useState<Record<number, string>>({});
  const [imgStep, setImgStep]         = useState<string>("");
  const [imgDone, setImgDone]         = useState(0);
  const [imgTotal, setImgTotal]       = useState(0);
  const generatingImages              = imgDone < imgTotal && imgTotal > 0;

  const colors = GENRE_COLORS[genre] ?? GENRE_COLORS["Autoajuda"];

  // ── Generate everything ───────────────────────────────────────────────────

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!theme.trim()) { toast.error("Informe o tema do livro."); return; }

    setLoading(true);
    setResult(null);
    setCoverBase64(null);
    setChapterImages({});
    setImgDone(0);
    setImgTotal(0);
    setExpandedChapter(null);

    const { success, data, error } = await generateBook({ language, genre, theme });

    if (!success || !data) {
      toast.error(error || "Falha ao gerar o livro.");
      setLoading(false);
      return;
    }

    setResult(data);
    setLoading(false);
    toast.success("Manuscrito gerado! Gerando imagens...");

    // Generate cover + chapter images sequentially with progress
    const total = 1 + data.chapters.length;
    setImgTotal(total);

    // Cover
    setImgStep("Gerando capa...");
    const coverRes = await generateBookCover(data.title, data.subtitle, data.author, genre);
    if (coverRes.success && coverRes.base64) setCoverBase64(coverRes.base64);
    setImgDone(1);

    // Chapter images
    for (const ch of data.chapters) {
      setImgStep(`Gerando imagem — Capítulo ${ch.number}/${data.chapters.length}...`);
      const imgRes = await generateChapterImage(ch.number, ch.title, ch.imageDesc, genre);
      if (imgRes.success && imgRes.base64) {
        setChapterImages(prev => ({ ...prev, [ch.number]: imgRes.base64! }));
      }
      setImgDone(prev => prev + 1);
    }

    setImgStep("");
    toast.success("Livro e imagens prontos! Baixe o PDF.");
  }

  // ── Save ──────────────────────────────────────────────────────────────────

  async function handleSave() {
    if (!result) return;
    setSaveLoading(true);
    toast.loading("Salvando no projeto...", { id: "save-book" });
    try {
      const { success, message, error } = await saveBookToProject(
        result,
        `${result.title.substring(0, 40)} — Livro`
      );
      if (success) toast.success(message ?? "Salvo!", { id: "save-book" });
      else toast.error(error ?? "Falha ao salvar.", { id: "save-book" });
    } catch (err: any) {
      toast.error(err?.message ?? "Falha ao salvar.", { id: "save-book" });
    } finally {
      setSaveLoading(false);
    }
  }

  // ── PDF generation — matching book-factory specs exactly ─────────────────

  async function handleDownloadPDF() {
    if (!result) return;
    setPdfLoading(true);
    try {
      const { jsPDF, GState } = await import("jspdf");

      // B5 format — 148×210mm (same as book-factory)
      const doc = new jsPDF("p", "mm", [148, 210]);
      const PW = 148;
      const PH = 210;
      const ML = 18; // left margin
      const MT = 18; // top margin
      const MR = 18; // right margin
      const W  = PW - ML - MR; // content width = 112mm
      const NAVY: [number,number,number] = [30, 30, 100];
      const GRAY: [number,number,number] = [150, 150, 150];
      const WHITE: [number,number,number] = [255, 255, 255];
      const DARK: [number,number,number]  = [20, 20, 60];

      let pageNum = 1;

      const setColor = (r: number, g: number, b: number) => doc.setTextColor(r, g, b);
      const resetColor = () => setColor(0, 0, 0);

      // Header — shown on all pages except cover
      const drawHeader = () => {
        if (pageNum === 1) return;
        doc.setFont("helvetica", "italic");
        doc.setFontSize(7);
        setColor(...GRAY);
        doc.text(`${result!.title}  |  ${result!.author}`, PW / 2, 10, { align: "center" });
        resetColor();
      };

      // Footer — page number
      const drawFooter = () => {
        if (pageNum === 1) return;
        doc.setFont("helvetica", "italic");
        doc.setFontSize(8);
        setColor(...GRAY);
        doc.text(String(pageNum), PW / 2, PH - 6, { align: "center" });
        resetColor();
      };

      const newPage = () => {
        drawFooter();
        doc.addPage();
        pageNum++;
        drawHeader();
      };

      // Wrapping text — returns new Y position
      // auto page-break if near bottom
      const writeLines = (
        text: string,
        x: number,
        y: number,
        maxW: number,
        lineH: number,
        align: "left" | "center" = "left"
      ): number => {
        const lines = doc.splitTextToSize(text, maxW);
        for (const ln of lines) {
          if (y > PH - 22) { newPage(); y = MT + 10; }
          doc.text(ln, align === "center" ? x + maxW / 2 : x, y, {
            align: align === "center" ? "center" : "left",
          });
          y += lineH;
        }
        return y;
      };

      // ── COVER PAGE ───────────────────────────────────────────────────────
      if (coverBase64) {
        doc.addImage(coverBase64, "PNG", 0, 0, PW, PH);
        // Dark overlay at bottom for text readability
        doc.saveGraphicsState();
        doc.setGState(new GState({ opacity: 0.55 }));
        doc.setFillColor(10, 10, 40);
        doc.rect(0, PH * 0.55, PW, PH * 0.45, "F");
        doc.restoreGraphicsState();
        setColor(...WHITE);
      } else {
        // Solid cover fallback
        doc.setFillColor(...DARK);
        doc.rect(0, 0, PW, PH, "F");
        doc.setFillColor(255, 255, 255);
        doc.rect(0, PH * 0.6, PW, PH * 0.4, "F");
        setColor(...WHITE);
      }

      // Cover title (top area)
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      setColor(...WHITE);
      let y = 26;
      const titleLines = doc.splitTextToSize(result.title, W);
      for (const tl of titleLines) {
        doc.text(tl, PW / 2, y, { align: "center" });
        y += 12;
      }

      // Cover subtitle
      if (result.subtitle) {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(11);
        setColor(...WHITE);
        const subLines = doc.splitTextToSize(result.subtitle.split(".")[0], W);
        for (const sl of subLines) {
          doc.text(sl, PW / 2, y, { align: "center" });
          y += 7;
        }
      }

      // Author at bottom
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      setColor(...WHITE);
      doc.text(result.author, PW / 2, PH - 18, { align: "center" });
      resetColor();

      // ── CHAPTER PAGES ────────────────────────────────────────────────────
      for (const ch of result.chapters) {
        newPage();
        let cy = MT + 8; // start below header

        // Chapter number
        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        setColor(...NAVY);
        doc.text(`Capítulo ${ch.number}`, PW / 2, cy, { align: "center" });
        cy += 8;

        // Chapter title
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        const chTLines = doc.splitTextToSize(ch.title, W);
        for (const tl of chTLines) {
          doc.text(tl, PW / 2, cy, { align: "center" });
          cy += 7;
        }

        // Decorative line (navy, 0.4pt, centered 50% width)
        cy += 3;
        const lineStart = ML + W * 0.25;
        doc.setDrawColor(...NAVY);
        doc.setLineWidth(0.4);
        doc.line(lineStart, cy, lineStart + W * 0.5, cy);
        cy += 6;

        // Chapter illustration
        const chImg = chapterImages[ch.number];
        if (chImg) {
          // landscape 1792×1024 → aspect ratio 1024/1792 ≈ 0.5714
          const imgH = W * (1024 / 1792);
          if (cy + imgH > PH - 22) { newPage(); cy = MT + 10; }
          doc.addImage(chImg, "PNG", ML, cy, W, imgH);
          cy += imgH + 6;
        }

        resetColor();

        // Content blocks
        for (const block of ch.blocks) {
          if (cy > PH - 22) { newPage(); cy = MT + 10; }

          if (block.type === "heading") {
            cy += 3;
            doc.setFont("helvetica", "bold");
            doc.setFontSize(10);
            setColor(...NAVY);
            cy = writeLines(block.text.toUpperCase(), ML, cy, W, 6);
            resetColor();
            cy += 1;

          } else if (block.type === "bullet") {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            resetColor();
            cy = writeLines(`\u2022  ${block.text}`, ML + 5, cy, W - 5, 5.5);
            cy += 0.5;

          } else {
            // paragraph
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            resetColor();
            cy = writeLines(block.text, ML, cy, W, 5.8);
            cy += 2.5;
          }
        }
      }

      // Draw final page footer
      drawFooter();

      const filename = result.title.replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "_").substring(0, 50);
      doc.save(`${filename}.pdf`);
      toast.success("PDF baixado com sucesso!");
    } catch (err) {
      console.error("PDF error:", err);
      toast.error("Falha ao gerar o PDF.");
    }
    setPdfLoading(false);
  }

  // ── Render ────────────────────────────────────────────────────────────────

  const renderBlocks = (blocks: BookBlock[]) => (
    <div className="space-y-2 text-sm text-slate-700">
      {blocks.map((b, i) => {
        if (b.type === "heading") return (
          <p key={i} className="font-bold text-xs uppercase tracking-wider text-slate-500 pt-3 pb-1">
            {b.text}
          </p>
        );
        if (b.type === "bullet") return (
          <p key={i} className="pl-4 leading-relaxed">• {b.text}</p>
        );
        return <p key={i} className="leading-relaxed">{b.text}</p>;
      })}
    </div>
  );

  const imagesReady = imgTotal > 0 && imgDone >= imgTotal;
  const imageCount  = Object.keys(chapterImages).length;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-indigo-600/10 rounded-xl">
          <BookOpen className="w-8 h-8 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gerador de Livros</h1>
          <p className="text-muted-foreground text-sm">
            Story Chief + DALL-E 3 por capítulo · PDF profissional B5 com capa e ilustrações
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

        {/* Form */}
        <Card className="xl:col-span-4 h-fit sticky top-24 border-none shadow-md">
          <CardHeader>
            <CardTitle>Configurações</CardTitle>
            <CardDescription>Idioma, gênero e tema do livro.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label>Idioma</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {LANGUAGE_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Gênero Literário</Label>
                <Select value={genre} onValueChange={setGenre}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {GENRE_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="theme">Tema do Livro</Label>
                <Input
                  id="theme"
                  placeholder="Ex: Como construir relações saudáveis..."
                  value={theme}
                  onChange={e => setTheme(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg"
                disabled={loading || generatingImages}
              >
                {loading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Escrevendo manuscrito...</>
                ) : generatingImages ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Gerando imagens...</>
                ) : (
                  <><BookOpen className="mr-2 h-4 w-4" />Gerar Livro Completo</>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="xl:col-span-8 flex flex-col gap-6">

          {/* Empty state */}
          {!result && !loading && (
            <div className="flex flex-col items-center justify-center h-[600px] border-2 border-dashed rounded-xl bg-slate-50/50">
              <BookOpen className="w-10 h-10 text-slate-300 mb-3" />
              <h3 className="text-lg font-medium text-slate-600">Aguardando configurações</h3>
              <p className="text-slate-400 text-sm mt-1 text-center max-w-xs">
                Preencha o tema e clique em &quot;Gerar Livro Completo&quot;
              </p>
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div className="flex flex-col items-center justify-center h-[600px] border-2 border-dashed rounded-xl bg-indigo-50/30">
              <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
              <h3 className="text-lg font-medium text-slate-700 animate-pulse">Escrevendo manuscrito...</h3>
              <p className="text-slate-400 text-sm mt-1">Story Chief + squad Storytelling em ação</p>
            </div>
          )}

          {result && !loading && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

              {/* Image generation progress */}
              {imgTotal > 0 && imgDone < imgTotal && (
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Loader2 className="w-4 h-4 text-indigo-600 animate-spin shrink-0" />
                    <span className="text-sm font-medium text-indigo-700">{imgStep}</span>
                  </div>
                  <div className="w-full bg-indigo-100 rounded-full h-1.5">
                    <div
                      className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${(imgDone / imgTotal) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-indigo-500 mt-1">{imgDone}/{imgTotal} imagens geradas</p>
                </div>
              )}

              {/* Action bar */}
              <div className="flex flex-wrap justify-between items-center gap-3 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-2 text-indigo-600 font-medium text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  Manuscrito gerado
                  {imageCount > 0 && (
                    <span className="text-xs text-slate-400 font-normal">
                      · {imageCount}/{result.chapters.length} ilustrações
                      {coverBase64 ? " + capa" : ""}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs px-2 py-1 rounded-md ${colors.badge}`}>{genre}</span>
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md">{language}</span>
                  <Button onClick={handleSave} disabled={saveLoading} variant="outline" size="sm">
                    {saveLoading ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Save className="w-3.5 h-3.5 mr-1.5" />}
                    Salvar
                  </Button>
                  <Button
                    onClick={handleDownloadPDF}
                    disabled={pdfLoading || generatingImages}
                    size="sm"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    {pdfLoading ? (
                      <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />Gerando PDF...</>
                    ) : generatingImages ? (
                      <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />Aguardando imagens...</>
                    ) : (
                      <><FileDown className="w-3.5 h-3.5 mr-1.5" />Baixar PDF</>
                    )}
                  </Button>
                </div>
              </div>

              {/* Cover + Title */}
              <div className="flex gap-5">
                <div className="shrink-0 w-32">
                  {coverBase64 ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={coverBase64} alt="Capa" className="w-32 h-48 object-cover rounded-lg shadow-md border border-slate-200" />
                  ) : (
                    <div className="w-32 h-48 rounded-lg bg-slate-100 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-1 text-slate-400">
                      <ImageIcon className="w-5 h-5" />
                      <span className="text-xs text-center">capa DALL-E</span>
                    </div>
                  )}
                </div>
                <Card className={`flex-1 border-none shadow-md ${colors.bg}`}>
                  <CardContent className="pt-5 pb-5">
                    <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${colors.text}`}>{genre}</p>
                    <h2 className={`text-2xl font-black tracking-tight ${colors.text}`}>{result.title}</h2>
                    {result.subtitle && (
                      <p className={`text-sm mt-1 italic ${colors.text} opacity-80`}>{result.subtitle}</p>
                    )}
                    <p className={`text-xs mt-2 ${colors.text} opacity-60`}>por {result.author}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Synopsis */}
              <Card className="border-none shadow-sm">
                <CardHeader className={`pb-2 border-b ${colors.bg}`}>
                  <CardTitle className={`flex items-center gap-2 text-sm ${colors.text}`}>
                    <BookOpen className="w-4 h-4" /> Sinopse
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-slate-700 text-sm leading-relaxed">{result.synopsis}</p>
                </CardContent>
              </Card>

              {/* Chapters accordion */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
                  {result.chapters.length} Capítulos
                </h3>
                {result.chapters.map((ch) => {
                  const isOpen = expandedChapter === ch.number;
                  const hasImg = !!chapterImages[ch.number];
                  return (
                    <Card key={ch.number} className="border-none shadow-sm overflow-hidden">
                      <div
                        role="button"
                        tabIndex={0}
                        className={`px-5 py-3 flex items-center justify-between cursor-pointer transition-colors ${isOpen ? colors.bg : "hover:bg-slate-50"}`}
                        onClick={() => setExpandedChapter(isOpen ? null : ch.number)}
                        onKeyDown={e => e.key === "Enter" && setExpandedChapter(isOpen ? null : ch.number)}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${isOpen ? colors.badge : "bg-slate-100 text-slate-500"}`}>
                            {ch.number}
                          </span>
                          <span className={`text-sm font-medium truncate ${isOpen ? colors.text : "text-slate-700"}`}>
                            {ch.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          {hasImg && <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />}
                          {isOpen
                            ? <ChevronUp className={`w-4 h-4 ${colors.text}`} />
                            : <ChevronDown className="w-4 h-4 text-slate-400" />}
                        </div>
                      </div>
                      {isOpen && (
                        <CardContent className="pt-3 pb-5">
                          {chapterImages[ch.number] && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={chapterImages[ch.number]}
                              alt={`Ilustração capítulo ${ch.number}`}
                              className="w-full rounded-lg mb-4 shadow-sm"
                            />
                          )}
                          {renderBlocks(ch.blocks)}
                        </CardContent>
                      )}
                    </Card>
                  );
                })}
              </div>

              {/* Bottom CTA */}
              {imagesReady && (
                <div className="flex justify-center pt-2 pb-4">
                  <Button
                    onClick={handleDownloadPDF}
                    disabled={pdfLoading}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl text-base px-8 py-5 rounded-full font-bold"
                  >
                    {pdfLoading
                      ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Gerando PDF...</>
                      : <><FileDown className="w-5 h-5 mr-2" />Baixar Manuscrito Completo em PDF</>
                    }
                  </Button>
                </div>
              )}

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
