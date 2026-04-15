"use client";

import { useState } from "react";
import {
  generateBook,
  generateBookCover,
  getImageAsBase64,
  saveBookToProject,
  type BookResult,
} from "./actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  BookOpen,
  Loader2,
  CheckCircle2,
  Save,
  FileDown,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  RefreshCw,
} from "lucide-react";

const LANGUAGE_OPTIONS = [
  { value: "Português", label: "PT — Português" },
  { value: "English", label: "EN — English" },
  { value: "Español", label: "ES — Español" },
  { value: "Français", label: "FR — Français" },
];

const GENRE_OPTIONS = [
  { value: "Romance", label: "Romance" },
  { value: "Thriller", label: "Thriller" },
  { value: "Fantasia", label: "Fantasia" },
  { value: "Autoajuda", label: "Autoajuda" },
  { value: "Contos", label: "Contos" },
];

const GENRE_COLORS: Record<string, { bg: string; text: string; border: string; badge: string }> = {
  Romance:   { bg: "bg-rose-50",    text: "text-rose-700",    border: "border-rose-200",   badge: "bg-rose-100 text-rose-700" },
  Thriller:  { bg: "bg-slate-50",   text: "text-slate-700",   border: "border-slate-200",  badge: "bg-slate-200 text-slate-800" },
  Fantasia:  { bg: "bg-violet-50",  text: "text-violet-700",  border: "border-violet-200", badge: "bg-violet-100 text-violet-700" },
  Autoajuda: { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",  badge: "bg-amber-100 text-amber-700" },
  Contos:    { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", badge: "bg-emerald-100 text-emerald-700" },
};

export default function BookGeneratorPage() {
  const [language, setLanguage] = useState("Português");
  const [genre, setGenre] = useState("Romance");
  const [theme, setTheme] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BookResult | null>(null);
  const [expandedChapter, setExpandedChapter] = useState<number | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [coverLoading, setCoverLoading] = useState(false);

  const colors = GENRE_COLORS[genre] ?? GENRE_COLORS["Romance"];

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!theme.trim()) {
      toast.error("Informe o tema do livro.");
      return;
    }
    setLoading(true);
    setResult(null);
    setCoverUrl(null);
    setExpandedChapter(null);

    const { success, data, error } = await generateBook({ language, genre, theme });

    if (success && data) {
      setResult(data);
      toast.success("Manuscrito gerado com sucesso!");
      // Auto-generate cover after book is ready
      fetchCover(data.title, genre, data.synopsis);
    } else {
      toast.error(error || "Falha ao gerar o livro.");
    }

    setLoading(false);
  }

  async function fetchCover(title: string, bookGenre: string, synopsis: string) {
    setCoverLoading(true);
    toast.loading("Gerando capa com DALL-E...", { id: "cover-gen" });
    const { success, url, error } = await generateBookCover(title, bookGenre, synopsis);
    if (success && url) {
      setCoverUrl(url);
      toast.success("Capa gerada!", { id: "cover-gen" });
    } else {
      toast.error(error || "Falha ao gerar a capa.", { id: "cover-gen" });
    }
    setCoverLoading(false);
  }

  async function handleSave() {
    if (!result) return;
    setSaveLoading(true);
    toast.loading("Salvando no projeto...", { id: "save-book" });
    const { success, message, error } = await saveBookToProject(result, `${result.title.substring(0, 40)} — Livro`);
    if (success) {
      toast.success(message, { id: "save-book" });
    } else {
      toast.error(error, { id: "save-book" });
    }
    setSaveLoading(false);
  }

  async function handleDownloadPDF() {
    if (!result) return;
    setPdfLoading(true);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF("p", "mm", "a4");
      const W = doc.internal.pageSize.getWidth();
      const H = doc.internal.pageSize.getHeight();
      const mg = 18;
      const cw = W - 2 * mg;

      const genreColor: Record<string, [number, number, number]> = {
        Romance:   [220, 38, 38],
        Thriller:  [30, 41, 59],
        Fantasia:  [109, 40, 217],
        Autoajuda: [180, 83, 9],
        Contos:    [4, 120, 87],
      };
      const ACCENT: [number, number, number] = genreColor[genre] ?? [30, 64, 175];
      const WHITE: [number, number, number] = [255, 255, 255];
      const DARK: [number, number, number] = [15, 23, 42];
      const GRAY: [number, number, number] = [248, 250, 252];

      let pn = 1;
      const bookTitle = result.title;

      const sf = (c: [number, number, number]) => doc.setFillColor(c[0], c[1], c[2]);
      const st = (c: [number, number, number]) => doc.setTextColor(c[0], c[1], c[2]);
      const sd = (c: [number, number, number]) => doc.setDrawColor(c[0], c[1], c[2]);

      const footer = () => {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(190, 190, 190);
        doc.text(String(pn++), W / 2, H - 7, { align: "center" });
        doc.setTextColor(210, 210, 210);
        const tl = doc.splitTextToSize(bookTitle, cw - 30);
        doc.text(tl[0], W / 2, H - 12.5, { align: "center" });
      };

      const newPage = () => {
        doc.addPage();
        sf(GRAY);
        doc.rect(0, 0, W, H, "F");
      };

      const wrap = (text: string, x: number, y: number, maxW: number, lh = 6.2): number => {
        const lines = doc.splitTextToSize(text, maxW);
        for (const ln of lines) {
          if (y > H - 28) { footer(); newPage(); y = 28; }
          doc.text(ln, x, y);
          y += lh;
        }
        return y;
      };

      const isSubt = (s: string) => s.length < 68 && s.length > 4 && !/[.!?,;]$/.test(s) && !s.includes("\n");
      const isBullet = (s: string) => /^[-•*✓→▶]\s/.test(s.trim()) || /^\d+[.)]\s/.test(s.trim());

      const renderContent = (content: string, startY: number): number => {
        const blocks = content.split(/\n{2,}/).map(b => b.trim()).filter(Boolean);
        let y = startY;
        let first = true;

        for (const block of blocks) {
          if (y > H - 40) { footer(); newPage(); y = 28; }
          const lines = block.split("\n").map(l => l.trim()).filter(Boolean);

          const bulletLines = lines.filter(isBullet);
          if (bulletLines.length >= 2) {
            for (const bl of bulletLines) {
              if (y > H - 28) { footer(); newPage(); y = 28; }
              const txt = bl.replace(/^[-•*✓→▶]\s*|\d+[.)]\s*/, "");
              sf(ACCENT); doc.circle(mg + 2, y - 2, 1.6, "F");
              doc.setFont("helvetica", "normal"); doc.setFontSize(10.5); doc.setTextColor(40, 40, 40);
              y = wrap(txt, mg + 7, y, cw - 7, 5.8);
              y += 1.5;
            }
            y += 3; first = false; continue;
          }

          if (lines.length === 1 && isSubt(block)) {
            y += 4;
            doc.setFont("helvetica", "bold"); doc.setFontSize(13); st(ACCENT);
            doc.text(block, mg, y);
            y += 4; sd(ACCENT); doc.setLineWidth(0.5); doc.line(mg, y, mg + 32, y);
            y += 7; first = false; continue;
          }

          if (first) {
            doc.setFont("helvetica", "normal"); doc.setFontSize(11.5); st(DARK);
            y = wrap(block, mg, y, cw, 7);
            y += 6; first = false; continue;
          }

          doc.setFont("helvetica", "normal"); doc.setFontSize(10.5); doc.setTextColor(55, 55, 55);
          y = wrap(block, mg, y, cw, 6.2);
          y += 5;
        }
        return y;
      };

      // ── COVER PAGE ──
      if (coverUrl) {
        // Embed DALL-E cover image
        try {
          const base64 = await getImageAsBase64(coverUrl);
          doc.addImage(base64, "PNG", 0, 0, W, H);
          // Overlay gradient strip at bottom for title
          sf(DARK);
          doc.setGlobalAlpha(0.65);
          doc.rect(0, H * 0.58, W, H * 0.42, "F");
          doc.setGlobalAlpha(1);

          doc.setFont("helvetica", "normal");
          doc.setFontSize(8); st(WHITE);
          doc.setGlobalAlpha(0.8);
          doc.text(genre.toUpperCase(), mg, H * 0.64);
          doc.setGlobalAlpha(1);

          doc.setFont("helvetica", "bold");
          doc.setFontSize(28); st(WHITE);
          const titleLines = doc.splitTextToSize(result.title, cw);
          let ty = H * 0.70;
          for (const tl of titleLines) { doc.text(tl, mg, ty); ty += 12; }

          doc.setFont("helvetica", "normal");
          doc.setFontSize(9); st(WHITE);
          doc.setGlobalAlpha(0.7);
          doc.text(language, mg, ty + 4);
          doc.setGlobalAlpha(1);
        } catch {
          // Fallback to solid cover if image fails
          renderSolidCover();
        }
      } else {
        renderSolidCover();
      }

      function renderSolidCover() {
        sf(ACCENT);
        doc.rect(0, 0, W, H, "F");
        sf(WHITE);
        doc.rect(0, H * 0.62, W, H * 0.38, "F");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(9); st(WHITE);
        doc.text(genre.toUpperCase(), mg, 30);

        doc.setFontSize(34); st(WHITE);
        const titleLines = doc.splitTextToSize(result!.title, cw);
        let ty = 55;
        for (const tl of titleLines) { doc.text(tl, mg, ty); ty += 14; }

        doc.setFont("helvetica", "normal");
        doc.setFontSize(11); st(WHITE);
        doc.setGlobalAlpha(0.8);
        doc.text(language, mg, ty + 6);
        doc.setGlobalAlpha(1);

        doc.setFontSize(10); st(DARK);
        const synLines = doc.splitTextToSize(result!.synopsis, cw - 10);
        let sy = H * 0.68;
        for (const sl of synLines.slice(0, 12)) {
          if (sy > H - 25) break;
          doc.text(sl, mg, sy);
          sy += 5.5;
        }
      }

      // ── TABLE OF CONTENTS ──
      newPage();
      doc.setFont("helvetica", "bold"); doc.setFontSize(20); st(ACCENT);
      doc.text("Sumário", mg, 30);
      sd(ACCENT); doc.setLineWidth(1); doc.line(mg, 34, mg + 40, 34);

      let tocY = 46;
      result.chapters.forEach((ch, i) => {
        if (tocY > H - 20) { footer(); newPage(); tocY = 28; }
        doc.setFont("helvetica", "normal"); doc.setFontSize(11); st(DARK);
        doc.text(`${i + 1}.  ${ch.title}`, mg, tocY);
        tocY += 8;
      });
      footer();

      // ── SYNOPSIS PAGE ──
      newPage();
      doc.setFont("helvetica", "bold"); doc.setFontSize(18); st(ACCENT);
      doc.text("Sinopse", mg, 30);
      sd(ACCENT); doc.setLineWidth(0.8); doc.line(mg, 34, mg + 28, 34);

      doc.setFont("helvetica", "normal"); doc.setFontSize(11); st(DARK);
      let synY = 44;
      synY = wrap(result.synopsis, mg, synY, cw, 7);
      footer();

      // ── CHAPTERS ──
      for (let i = 0; i < result.chapters.length; i++) {
        const ch = result.chapters[i];
        newPage();

        sf(ACCENT);
        doc.rect(0, 0, W, 42, "F");

        doc.setFont("helvetica", "normal"); doc.setFontSize(8); st(WHITE);
        doc.setGlobalAlpha(0.7);
        doc.text(`Capítulo ${i + 1}`, mg, 16);
        doc.setGlobalAlpha(1);

        doc.setFont("helvetica", "bold"); doc.setFontSize(18); st(WHITE);
        const chTitleLines = doc.splitTextToSize(ch.title.replace(/^Capítulo \d+[:\s]*/i, ""), cw);
        let chTY = 30;
        for (const tl of chTitleLines) {
          doc.text(tl, mg, chTY); chTY += 9;
        }

        let y = 56;
        renderContent(ch.content, y);
        footer();
      }

      doc.save(`${result.title.substring(0, 50)}.pdf`);
      toast.success("PDF baixado com sucesso!");
    } catch (err) {
      console.error(err);
      toast.error("Falha ao gerar o PDF.");
    }
    setPdfLoading(false);
  }

  return (
    <div className="p-8 max-w-7xl mx-auto font-[family-name:var(--font-geist-sans)]">
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-indigo-600/10 rounded-xl">
          <BookOpen className="w-8 h-8 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gerador de Livros</h1>
          <p className="text-muted-foreground">
            Crie um manuscrito completo com Story Chief + squad Storytelling. Capa gerada por DALL-E.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

        {/* Left Column — Input Form */}
        <Card className="xl:col-span-4 h-fit sticky top-24 border-none shadow-md">
          <CardHeader>
            <CardTitle>Configurações do Livro</CardTitle>
            <CardDescription>Defina o idioma, gênero e tema para gerar seu manuscrito.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-5">

              <div className="space-y-2">
                <Label>Idioma</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o idioma" />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Gênero Literário</Label>
                <Select value={genre} onValueChange={setGenre}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o gênero" />
                  </SelectTrigger>
                  <SelectContent>
                    {GENRE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="theme">Tema do Livro</Label>
                <Input
                  id="theme"
                  placeholder="Ex: Uma jovem que descobre ter poderes mágicos..."
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Descreva o tema, premissa ou ideia central do livro.
                </p>
              </div>

              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg mt-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Escrevendo manuscrito...
                  </>
                ) : (
                  <>
                    <BookOpen className="mr-2 h-4 w-4" />
                    Gerar Livro
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Right Column — Results */}
        <div className="xl:col-span-8 flex flex-col gap-6">

          {!result && !loading && (
            <div className="flex flex-col items-center justify-center h-[600px] border-2 border-dashed rounded-xl bg-slate-50/50">
              <div className="p-4 bg-white rounded-full shadow-sm mb-4">
                <BookOpen className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-medium text-slate-700">Aguardando configurações</h3>
              <p className="text-slate-500 max-w-sm text-center mt-2 text-sm">
                Configure o idioma, gênero e tema do livro e clique em &quot;Gerar Livro&quot;.
              </p>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center h-[600px] border-2 border-dashed rounded-xl bg-indigo-50/30">
              <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
              <h3 className="text-xl font-medium text-slate-700 animate-pulse">Escrevendo seu manuscrito...</h3>
              <p className="text-slate-500 text-sm mt-2">Story Chief + squad Storytelling em ação.</p>
            </div>
          )}

          {result && !loading && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

              {/* Action bar */}
              <div className="flex flex-wrap justify-between items-center gap-3 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-2 text-indigo-600 font-medium tracking-tight">
                  <CheckCircle2 className="w-5 h-5" />
                  Manuscrito gerado
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`text-xs px-2 py-1 rounded-md border ${colors.badge} border-transparent`}>
                    {genre}
                  </span>
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md border border-slate-200">
                    {language}
                  </span>
                  <Button
                    onClick={handleSave}
                    disabled={saveLoading}
                    variant="outline"
                    className="border-slate-200 text-slate-700 hover:bg-slate-50"
                  >
                    {saveLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Salvar
                  </Button>
                  <Button
                    onClick={handleDownloadPDF}
                    disabled={pdfLoading}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md"
                  >
                    {pdfLoading ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Gerando PDF...</>
                    ) : (
                      <><FileDown className="w-4 h-4 mr-2" />Baixar PDF</>
                    )}
                  </Button>
                </div>
              </div>

              {/* Cover Image */}
              <div className="flex gap-6">
                <div className="shrink-0 w-36">
                  {coverLoading ? (
                    <div className="w-36 h-52 rounded-xl bg-slate-100 flex flex-col items-center justify-center gap-2 border border-slate-200">
                      <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
                      <span className="text-xs text-slate-400">DALL-E...</span>
                    </div>
                  ) : coverUrl ? (
                    <div className="relative group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={coverUrl}
                        alt="Capa do livro"
                        className="w-36 h-52 object-cover rounded-xl shadow-lg border border-slate-200"
                      />
                      <button
                        onClick={() => fetchCover(result.title, genre, result.synopsis)}
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition rounded-xl flex items-center justify-center gap-1 text-white text-xs font-medium"
                      >
                        <RefreshCw className="w-4 h-4" /> Gerar nova
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => fetchCover(result.title, genre, result.synopsis)}
                      className="w-36 h-52 rounded-xl bg-slate-100 hover:bg-slate-200 transition flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-300 text-slate-500"
                    >
                      <ImageIcon className="w-6 h-6" />
                      <span className="text-xs text-center px-2">Gerar capa com DALL-E</span>
                    </button>
                  )}
                </div>

                {/* Title card */}
                <Card className={`flex-1 border-none shadow-md overflow-hidden ${colors.bg}`}>
                  <CardContent className="pt-6 pb-6 h-full flex flex-col justify-center">
                    <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${colors.text}`}>{genre}</p>
                    <h2 className={`text-3xl font-black tracking-tight ${colors.text}`}>{result.title}</h2>
                    {coverUrl && (
                      <p className="text-xs mt-3 text-slate-400 flex items-center gap-1">
                        <ImageIcon className="w-3 h-3" /> Capa gerada por DALL-E 3 — incluída no PDF
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Synopsis */}
              <Card className="border-none shadow-sm border border-slate-100">
                <CardHeader className={`pb-3 border-b ${colors.bg}`}>
                  <CardTitle className={`flex items-center gap-2 text-base ${colors.text}`}>
                    <BookOpen className="w-4 h-4" />
                    Sinopse
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-slate-700 leading-relaxed">{result.synopsis}</p>
                </CardContent>
              </Card>

              {/* Chapters */}
              <div className="space-y-3">
                <h3 className="font-semibold text-slate-800 text-sm uppercase tracking-wider px-1">
                  10 Capítulos
                </h3>
                {result.chapters.map((ch, i) => {
                  const isOpen = expandedChapter === i;
                  return (
                    <Card key={i} className="border-none shadow-sm border border-slate-100 overflow-hidden">
                      <div
                        role="button"
                        tabIndex={0}
                        className={`px-6 py-3 flex flex-row items-center justify-between cursor-pointer transition-colors ${isOpen ? colors.bg : "hover:bg-slate-50/80"}`}
                        onClick={() => setExpandedChapter(isOpen ? null : i)}
                        onKeyDown={(e) => e.key === "Enter" && setExpandedChapter(isOpen ? null : i)}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${isOpen ? colors.badge : "bg-slate-100 text-slate-500"}`}>
                            {i + 1}
                          </span>
                          <span className={`text-sm font-semibold ${isOpen ? colors.text : "text-slate-700"}`}>
                            {ch.title}
                          </span>
                        </div>
                        {isOpen ? (
                          <ChevronUp className={`w-4 h-4 shrink-0 ${colors.text}`} />
                        ) : (
                          <ChevronDown className="w-4 h-4 shrink-0 text-slate-400" />
                        )}
                      </div>
                      {isOpen && (
                        <CardContent className="pt-2 pb-5">
                          <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">
                            {ch.content}
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  );
                })}
              </div>

              {/* Bottom download button */}
              <div className="flex justify-center pt-2 pb-4">
                <Button
                  onClick={handleDownloadPDF}
                  disabled={pdfLoading || coverLoading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl text-base px-8 py-5 rounded-full font-bold flex items-center gap-2"
                >
                  {pdfLoading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" />Gerando PDF...</>
                  ) : coverLoading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" />Aguardando capa...</>
                  ) : (
                    <><FileDown className="w-5 h-5" />Baixar Manuscrito em PDF {coverUrl ? "com Capa" : ""}</>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
