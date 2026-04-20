"use client";

import { useState, useRef } from "react";
import {
  generateBook,
  improveBookFromText,
  generateBookCover,
  generateChapterImage,
  saveBook,
  savePlaybook,
  generatePublicationKit,
  type BookResult,
  type BookBlock,
  type BookChapter,
  type ImproveMode,
  type PublicationKit,
} from "./actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  BookOpen, Loader2, CheckCircle2, Save, FileDown, ChevronDown, ChevronUp,
  Image as ImageIcon, Upload, FileText, ChevronLeft, ChevronRight,
  BookMarked, Sparkles, X, Share2, Copy, Check, RefreshCw, Camera,
  Library, ExternalLink, Package, CheckSquare,
  Copy as CopyIcon,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// ── Constants ────────────────────────────────────────────────────────────────

const LANGUAGE_OPTIONS = [
  { value: "Português", label: "PT — Português" },
  { value: "English",   label: "EN — English" },
  { value: "Español",   label: "ES — Español" },
  { value: "Français",  label: "FR — Français" },
];

const GENRE_OPTIONS = [
  { value: "Romance",            label: "Romance" },
  { value: "Romance de Mafia",   label: "Romance de Máfia" },
  { value: "CEO Romance",        label: "CEO Romance" },
  { value: "Dark Romance",       label: "Dark Romance" },
  { value: "Suspense Romântico", label: "Suspense Romântico" },
  { value: "Thriller",           label: "Thriller" },
  { value: "Fantasia",           label: "Fantasia" },
  { value: "Autoajuda",          label: "Autoajuda" },
  { value: "Contos",             label: "Contos" },
  { value: "Emagrecimento",      label: "Emagrecimento" },
  { value: "Dieta e Nutrição",   label: "Dieta e Nutrição" },
  { value: "Fitness",            label: "Fitness" },
  { value: "Gospel/Cristão",     label: "Gospel/Cristão" },
  { value: "Marketing Digital",   label: "Marketing Digital" },
  { value: "Finanças",           label: "Finanças" },
  { value: "Maternidade",        label: "Maternidade" },
  { value: "Autodesenvolvimento", label: "Autodesenvolvimento" },
  { value: "Negócios",           label: "Negócios" },
  { value: "Culinária",          label: "Culinária" },
  { value: "Infantil",           label: "Infantil" },
  { value: "Juvenil",            label: "Juvenil" },
  { value: "Biografia",          label: "Biografia" },
  { value: "Motivacional",       label: "Motivacional" },
  { value: "Espiritualidade",    label: "Espiritualidade" },
  { value: "Relacionamentos",    label: "Relacionamentos" },
  { value: "Educação",           label: "Educação" },
  { value: "História",           label: "História" },
  { value: "Tecnologia",         label: "Tecnologia" },
];

const PAGE_SIZES = [10, 20, 30, 60, 80, 120];

const GENRE_COLORS: Record<string, { bg: string; text: string; badge: string }> = {
  Romance:              { bg: "bg-rose-50",       text: "text-rose-700",    badge: "bg-rose-100 text-rose-700" },
  "Romance de Mafia":   { bg: "bg-red-950/10",    text: "text-red-800",     badge: "bg-red-100 text-red-800" },
  "CEO Romance":        { bg: "bg-sky-50",         text: "text-sky-800",     badge: "bg-sky-100 text-sky-800" },
  "Dark Romance":       { bg: "bg-purple-950/10", text: "text-purple-900",  badge: "bg-purple-100 text-purple-900" },
  "Suspense Romântico": { bg: "bg-teal-50",        text: "text-teal-800",    badge: "bg-teal-100 text-teal-800" },
  Thriller:             { bg: "bg-slate-50",       text: "text-slate-700",   badge: "bg-slate-200 text-slate-800" },
  Fantasia:             { bg: "bg-violet-50",      text: "text-violet-700",  badge: "bg-violet-100 text-violet-700" },
  Autoajuda:            { bg: "bg-amber-50",       text: "text-amber-700",   badge: "bg-amber-100 text-amber-700" },
  Contos:               { bg: "bg-emerald-50",     text: "text-emerald-700", badge: "bg-emerald-100 text-emerald-700" },
  Emagrecimento:        { bg: "bg-green-50",       text: "text-green-700",   badge: "bg-green-100 text-green-700" },
  "Dieta e Nutrição":   { bg: "bg-lime-50",       text: "text-lime-700",   badge: "bg-lime-100 text-lime-700" },
  Fitness:              { bg: "bg-orange-50",      text: "text-orange-700",  badge: "bg-orange-100 text-orange-700" },
  "Gospel/Cristão":     { bg: "bg-yellow-50",      text: "text-yellow-700",  badge: "bg-yellow-100 text-yellow-700" },
  "Marketing Digital":   { bg: "bg-blue-50",       text: "text-blue-700",    badge: "bg-blue-100 text-blue-700" },
  Finanças:             { bg: "bg-emerald-50",    text: "text-emerald-700", badge: "bg-emerald-100 text-emerald-700" },
  Maternidade:          { bg: "bg-pink-50",       text: "text-pink-700",    badge: "bg-pink-100 text-pink-700" },
  Autodesenvolvimento:  { bg: "bg-indigo-50",     text: "text-indigo-700",  badge: "bg-indigo-100 text-indigo-700" },
  Negócios:             { bg: "bg-slate-50",      text: "text-slate-700",   badge: "bg-slate-100 text-slate-700" },
  Culinária:            { bg: "bg-amber-50",      text: "text-amber-700",   badge: "bg-amber-100 text-amber-700" },
  Infantil:             { bg: "bg-rainbow",        text: "text-slate-700",   badge: "bg-pink-100 text-pink-700" },
  Juvenil:              { bg: "bg-cyan-50",        text: "text-cyan-700",    badge: "bg-cyan-100 text-cyan-700" },
  Biografia:            { bg: "bg-stone-50",      text: "text-stone-700",   badge: "bg-stone-100 text-stone-700" },
  Motivacional:         { bg: "bg-yellow-50",     text: "text-yellow-700",  badge: "bg-yellow-100 text-yellow-700" },
  Espiritualidade:      { bg: "bg-violet-50",     text: "text-violet-700",  badge: "bg-violet-100 text-violet-700" },
  Relacionamentos:       { bg: "bg-rose-50",       text: "text-rose-700",    badge: "bg-rose-100 text-rose-700" },
  Educação:             { bg: "bg-blue-50",       text: "text-blue-700",    badge: "bg-blue-100 text-blue-700" },
  História:             { bg: "bg-stone-50",      text: "text-stone-800",   badge: "bg-stone-200 text-stone-800" },
  Tecnologia:           { bg: "bg-sky-50",        text: "text-sky-700",    badge: "bg-sky-100 text-sky-700" },
};

type AppMode  = "create" | "improve" | "rewrite";
type ViewMode = "book" | "playbook" | "kit";
type EbookStyle = "visual" | "traditional";  // Visual = Marketing (with images), Traditional = Amazon (clean)

// ── Component ────────────────────────────────────────────────────────────────

export default function BookGeneratorPage() {
  // Form
  const [appMode, setAppMode]         = useState<AppMode>("create");
  const [improveMode, setImproveMode] = useState<ImproveMode>("spelling");
  const [language, setLanguage]       = useState("Português");
  const [genre, setGenre]             = useState("Autoajuda");
  const [theme, setTheme]             = useState("");
  const [authorName, setAuthorName]   = useState("");
  const [pageSize, setPageSize]       = useState(60);
  const [playbookMode, setPlaybookMode] = useState(false);
  const [ebookStyle, setEbookStyle] = useState<EbookStyle>("visual");  // Visual (marketing) vs Traditional (Amazon)

  // PDF upload
  const [pdfText, setPdfText]             = useState("");
  const [pdfFileName, setPdfFileName]     = useState("");
  const [pdfExtracting, setPdfExtracting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generation
  const [loading, setLoading]         = useState(false);
  const [result, setResult]           = useState<BookResult | null>(null);
  const [expandedChapter, setExpandedChapter] = useState<number | null>(null);
  const [pdfLoading, setPdfLoading]   = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  // View
  const [viewMode, setViewMode]             = useState<ViewMode>("book");
  const [playbookChapter, setPlaybookChapter] = useState(0);

  // Playbook share
  const [shareLoading, setShareLoading] = useState(false);
  const [shareUrl, setShareUrl]         = useState<string | null>(null);
  const [copied, setCopied]             = useState(false);

  // Kit de Publicação
  const [kitLoading, setKitLoading] = useState(false);
  const [publicationKit, setPublicationKit] = useState<PublicationKit | null>(null);
  const [activeKitTab, setActiveKitTab] = useState<"amazon" | "hotmart" | "kiwify" | "eduzz" | "gumroad">("amazon");

  // Images
  const [coverBase64, setCoverBase64]     = useState<string | null>(null);
  const [chapterImages, setChapterImages] = useState<Record<number, string>>({});
  const [imgStep, setImgStep]             = useState("");
  const [imgDone, setImgDone]             = useState(0);
  const [imgTotal, setImgTotal]           = useState(0);
  const generatingImages = imgDone < imgTotal && imgTotal > 0;

  // Cover custom upload / regenerate
  const coverUploadRef                      = useRef<HTMLInputElement>(null);
  const [coverRegenLoading, setCoverRegenLoading] = useState(false);

  // Chapter image replacement
  const chapterImgUploadRef                         = useRef<HTMLInputElement>(null);
  const [chapterReplaceOpen, setChapterReplaceOpen] = useState<number | null>(null);
  const [chapterRegenLoading, setChapterRegenLoading] = useState<number | null>(null);
  const [pendingChapterImg, setPendingChapterImg]   = useState<{ num: number; base64: string } | null>(null);
  const [pendingUploadChapter, setPendingUploadChapter] = useState<number | null>(null);

  const colors = GENRE_COLORS[genre] ?? GENRE_COLORS["Autoajuda"];

  // ── PDF text extraction ────────────────────────────────────────────────────

  async function handlePdfFile(file: File) {
    setPdfExtracting(true);
    setPdfText("");
    setPdfFileName(file.name);
    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const tc = await page.getTextContent();
        fullText += (tc.items as { str?: string }[]).map((it) => it.str ?? "").join(" ") + "\n";
      }
      setPdfText(fullText.trim());
      toast.success(`PDF lido: ${pdf.numPages} páginas extraídas`);
    } catch (err) {
      console.error("PDF extract error:", err);
      toast.error("Falha ao extrair texto do PDF.");
    } finally {
      setPdfExtracting(false);
    }
  }

  // ── Generate ───────────────────────────────────────────────────────────────

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (appMode === "create" && !theme.trim()) {
      toast.error("Informe o tema do livro.");
      return;
    }
    if ((appMode === "improve" || appMode === "rewrite") && !pdfText.trim()) {
      toast.error("Faça o upload de um PDF primeiro.");
      return;
    }

    setLoading(true);
    setResult(null);
    setCoverBase64(null);
    setChapterImages({});
    setImgDone(0);
    setImgTotal(0);
    setExpandedChapter(null);
    setViewMode("book");

    const author = authorName || undefined;

    let genResult;
    if (appMode === "create") {
      genResult = await generateBook({ language, genre, theme, authorName: author, pageSize });
    } else {
      const mode: ImproveMode = appMode === "rewrite" ? "rewrite" : improveMode;
      genResult = await improveBookFromText({ originalText: pdfText, improveMode: mode, genre, language, authorName: author, pageSize });
    }

    if (!genResult.success || !genResult.data) {
      toast.error(genResult.error || "Falha ao gerar o livro.");
      setLoading(false);
      return;
    }

    const data = genResult.data;
    setResult(data);
    setLoading(false);
    toast.success("Manuscrito gerado! Gerando imagens...");

    const isVisual = ebookStyle === "visual";
    const total = isVisual ? 1 + data.chapters.length : 1;
    setImgTotal(total);

    // Cover
    setImgStep(isVisual ? "Gerando capa visual profissional..." : "Gerando capa limpa para Amazon KDP...");
    const coverRes = await generateBookCover(data.title, data.subtitle, data.author || authorName, genre);
    if (coverRes.success && coverRes.base64) setCoverBase64(coverRes.base64);
    setImgDone(1);

    // Chapter images — only for Ebook Visual mode
    if (isVisual) {
      for (const ch of data.chapters) {
        setImgStep(`Gerando imagem — Capítulo ${ch.number}/${data.chapters.length}...`);
        const imgRes = await generateChapterImage(ch.number, ch.title, ch.imageDesc, genre, playbookMode);
        if (imgRes.success && imgRes.base64) {
          setChapterImages(prev => ({ ...prev, [ch.number]: imgRes.base64! }));
        }
        setImgDone(prev => prev + 1);
      }
    }

    setImgStep("");
    toast.success(playbookMode ? "Livro pronto! Explore o Playbook ou baixe o PDF." : "Livro pronto! Baixe o PDF.");
  }

  // ── Save ───────────────────────────────────────────────────────────────────

  async function handleSave() {
    if (!result) return;
    setSaveLoading(true);
    toast.loading("Salvando livro...", { id: "save-book" });
    try {
      const { success, error } = await saveBook({
        result,
        language,
        genre,
        pageSize,
        authorName,
      });
      if (success) toast.success("Livro salvo em Meus Livros!", { id: "save-book" });
      else toast.error(error ?? "Falha ao salvar.", { id: "save-book" });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Falha ao salvar.", { id: "save-book" });
    } finally {
      setSaveLoading(false);
    }
  }

  // ── Cover upload / regenerate ──────────────────────────────────────────────

  function handleCoverUpload(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      setCoverBase64(e.target?.result as string);
      toast.success("Capa personalizada aplicada!");
    };
    reader.readAsDataURL(file);
  }

  async function handleCoverRegenerate() {
    if (!result) return;
    setCoverRegenLoading(true);
    const coverRes = await generateBookCover(result.title, result.subtitle, result.author || authorName, genre);
    if (coverRes.success && coverRes.base64) {
      setCoverBase64(coverRes.base64);
      toast.success("Nova capa gerada!");
    } else {
      toast.error("Falha ao gerar nova capa.");
    }
    setCoverRegenLoading(false);
  }

  // ── Chapter image replace ──────────────────────────────────────────────────

  function handleChapterImgUpload(file: File, chapterNum: number) {
    const reader = new FileReader();
    reader.onload = (e) => {
      setPendingChapterImg({ num: chapterNum, base64: e.target?.result as string });
    };
    reader.readAsDataURL(file);
  }

  async function handleChapterRegenerate(ch: BookChapter) {
    setChapterRegenLoading(ch.number);
    const imgRes = await generateChapterImage(ch.number, ch.title, ch.imageDesc, genre, playbookMode);
    if (imgRes.success && imgRes.base64) {
      setChapterImages(prev => ({ ...prev, [ch.number]: imgRes.base64! }));
      setChapterReplaceOpen(null);
      toast.success(`Imagem do Capítulo ${ch.number} atualizada!`);
    } else {
      toast.error("Falha ao gerar imagem.");
    }
    setChapterRegenLoading(null);
  }

  function confirmChapterImg() {
    if (!pendingChapterImg) return;
    setChapterImages(prev => ({ ...prev, [pendingChapterImg.num]: pendingChapterImg.base64 }));
    setChapterReplaceOpen(null);
    setPendingChapterImg(null);
    setPendingUploadChapter(null);
    toast.success("Imagem atualizada!");
  }

  // ── Share Playbook ─────────────────────────────────────────────────────────

  async function handleSharePlaybook() {
    if (!result) return;
    setShareLoading(true);
    setShareUrl(null);
    toast.loading("Salvando playbook...", { id: "share-playbook" });

    const { success, id, error } = await savePlaybook({
      result,
      coverBase64,
      chapterImages,
      authorName,
      genre,
    });

    if (success && id) {
      const url = `${window.location.origin}/playbook/${id}`;
      setShareUrl(url);
      await navigator.clipboard.writeText(url).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
      toast.success("Link copiado! Playbook público criado.", { id: "share-playbook" });
    } else {
      toast.error(error ?? "Falha ao criar link.", { id: "share-playbook" });
    }
    setShareLoading(false);
  }

  // ── Kit de Publicação ───────────────────────────────────────────────────────

  async function handleGenerateKit() {
    if (!result) return;
    setKitLoading(true);
    toast.loading("Gerando kit de publicação...", { id: "kit" });
    try {
      const { success, data, error } = await generatePublicationKit(
        result.title,
        result.subtitle,
        result.synopsis,
        genre,
        language,
        authorName
      );
      if (success && data) {
        setPublicationKit(data);
        toast.success("Kit de publicação gerado!", { id: "kit" });
      } else {
        toast.error(error ?? "Erro ao gerar kit.", { id: "kit" });
      }
    } catch (err) {
      console.error("Kit generation error:", err);
      toast.error("Erro ao gerar kit de publicação.", { id: "kit" });
    }
    setKitLoading(false);
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).catch(() => {});
    toast.success("Copiado!");
  }

  // ── PDF generation ─────────────────────────────────────────────────────────

  async function handleDownloadPDF() {
    if (!result) return;
    setPdfLoading(true);
    try {
      const { jsPDF, GState } = await import("jspdf");
      const doc = new jsPDF("p", "mm", [148, 210]);
      const PW = 148, PH = 210, ML = 18, MT = 18, MR = 18;
      const W  = PW - ML - MR;
      const NAVY: [number, number, number]  = [30, 30, 100];
      const GOLD: [number, number, number]  = [180, 140, 60];
      const GRAY: [number, number, number]  = [120, 120, 140];
      const WHITE: [number, number, number] = [255, 255, 255];
      const DARK: [number, number, number]  = [20, 20, 50];
      let pageNum = 1;

      const setColor = (r: number, g: number, b: number) => doc.setTextColor(r, g, b);
      const resetColor = () => setColor(0, 0, 0);

      const drawHeader = () => {
        if (pageNum === 1) return;
        doc.setFont("helvetica", "italic");
        doc.setFontSize(7);
        setColor(...GRAY);
        doc.text(`${result!.title}  |  ${authorName || result!.author}`, PW / 2, 10, { align: "center" });
        resetColor();
      };

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

      const writeLines = (
        text: string, x: number, y: number, maxW: number, lineH: number,
        align: "left" | "center" = "left"
      ): number => {
        const lines = doc.splitTextToSize(text, maxW);
        for (const ln of lines) {
          if (y > PH - 22) { newPage(); y = MT + 10; }
          doc.text(ln, align === "center" ? x + maxW / 2 : x, y, { align });
          y += lineH;
        }
        return y;
      };

      const displayAuthor = authorName || result.author;

      // ── Cover Page ──────────────────────────────────────────────────────────
      if (coverBase64) {
        doc.addImage(coverBase64, "PNG", 0, 0, PW, PH);
      } else {
        doc.setFillColor(...DARK);
        doc.rect(0, 0, PW, PH, "F");
        doc.setFillColor(255, 255, 255);
        doc.rect(0, PH * 0.55, PW, PH * 0.45, "F");
      }

      // Title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      setColor(...WHITE);
      let y = 25;
      for (const tl of doc.splitTextToSize(result.title, W)) {
        doc.text(tl, PW / 2, y, { align: "center" });
        y += 10;
      }

      // Subtitle
      if (result.subtitle) {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(9);
        setColor(...WHITE);
        for (const sl of doc.splitTextToSize(result.subtitle.split(".")[0], W)) {
          doc.text(sl, PW / 2, y, { align: "center" });
          y += 5;
        }
      }

      // Author
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      setColor(...GOLD);
      doc.text(displayAuthor, PW / 2, PH - 35, { align: "center" });

      // Genre tag
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      setColor(...GRAY);
      doc.text(genre.toUpperCase(), PW / 2, PH - 27, { align: "center" });
      resetColor();

      // ── Back Cover Page ────────────────────────────────────────────────────
      newPage();
      pageNum--; // Don't count back cover as a page number

      // Back cover background
      doc.setFillColor(...DARK);
      doc.rect(0, 0, PW, PH, "F");
      
      // Top decorative line
      doc.setDrawColor(...GOLD);
      doc.setLineWidth(0.5);
      doc.line(ML, 20, PW - ML, 20);

      // Book title on back
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      setColor(...WHITE);
      let by = 42;
      for (const tl of doc.splitTextToSize(result.title, W)) {
        doc.text(tl, PW / 2, by, { align: "center" });
        by += 8;
      }

      // Impact phrase
      if (result.impactPhrase) {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(10);
        setColor(...GOLD);
        by += 4;
        const impactLines = doc.splitTextToSize(`"${result.impactPhrase}"`, W - 10);
        for (const il of impactLines) {
          doc.text(il, PW / 2, by, { align: "center" });
          by += 6;
        }
      }

      // Synopsis on back cover
      by += 6;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      setColor(...WHITE);
      const synopsisLines = doc.splitTextToSize(result.synopsis, W);
      for (const sl of synopsisLines) {
        if (by > PH - 40) break;
        doc.text(sl, ML, by, { align: "left" });
        by += 5;
      }

      // Bottom decorative line
      doc.setDrawColor(...GOLD);
      doc.setLineWidth(0.5);
      doc.line(ML, PH - 30, PW - ML, PH - 30);

      // Author credit
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      setColor(...GRAY);
      doc.text(`por ${displayAuthor}`, PW / 2, PH - 22, { align: "center" });
      doc.text("ProfitBuilder AI", PW / 2, PH - 16, { align: "center" });
      resetColor();

      // ── Table of Contents Page ──────────────────────────────────────────────
      newPage();

      // TOC header
      doc.setFillColor(...NAVY);
      doc.rect(0, 0, PW, 40, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      setColor(...WHITE);
      doc.text("SUMÁRIO", PW / 2, 20, { align: "center" });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      setColor(...GOLD);
      doc.text(result.title, PW / 2, 30, { align: "center" });

      // TOC content
      let ty = 55;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      setColor(...NAVY);
      doc.text("CAPÍTULOS", ML, ty);
      ty += 8;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      setColor(...DARK);

      for (const ch of result.chapters) {
        if (ty > PH - 20) { newPage(); ty = MT + 10; }
        
        // Chapter number
        doc.setFont("helvetica", "bold");
        setColor(...NAVY);
        doc.text(`${ch.number}.`, ML, ty);
        
        // Chapter title
        doc.setFont("helvetica", "normal");
        setColor(...DARK);
        const titleText = ch.title.length > 40 ? ch.title.substring(0, 40) + "..." : ch.title;
        doc.text(titleText, ML + 10, ty);
        
        // Dots
        const dotX = ML + 10 + doc.getTextWidth(titleText) + 2;
        const endX = PW - ML - 15;
        if (dotX < endX) {
          const dotCount = Math.floor((endX - dotX) / 2);
          doc.setTextColor(...GRAY);
          doc.text(".".repeat(Math.max(0, dotCount)), dotX, ty);
        }
        
        ty += 7;
      }

      // Conclusion entry
      if (result.conclusion) {
        if (ty > PH - 20) { newPage(); ty = MT + 10; }
        doc.setFont("helvetica", "bold");
        setColor(...NAVY);
        doc.text("→", ML, ty);
        doc.setFont("helvetica", "normal");
        setColor(...DARK);
        doc.text(result.conclusion.title || "Conclusão", ML + 10, ty);
        ty += 7;
      }

      // Bottom decorative element
      ty += 10;
      doc.setDrawColor(...GOLD);
      doc.setLineWidth(0.3);
      doc.line(ML, ty, PW - ML, ty);

      // ── Chapter pages ──────────────────────────────────────────────────────
      for (const ch of result.chapters) {
        newPage();
        let cy = MT + 8;

        // Chapter header box
        doc.setFillColor(...NAVY);
        doc.roundedRect(ML, cy - 4, W, 30, 2, 2, "F");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        setColor(...WHITE);
        doc.text(`CAPÍTULO ${ch.number}`, PW / 2, cy + 6, { align: "center" });

        doc.setFontSize(10);
        for (const tl of doc.splitTextToSize(ch.title, W)) {
          doc.text(tl, PW / 2, cy + 14, { align: "center" });
        }

        cy += 32;

        // Decorative line
        doc.setDrawColor(...GOLD);
        doc.setLineWidth(0.3);
        const lineStart = ML + W * 0.25;
        doc.line(lineStart, cy, lineStart + W * 0.5, cy);
        cy += 8;

        // Chapter image
        const chImg = chapterImages[ch.number];
        if (chImg) {
          const imgH = W * (1024 / 1792);
          if (cy + imgH > PH - 22) { newPage(); cy = MT + 10; }
          doc.addImage(chImg, "PNG", ML, cy, W, imgH);
          cy += imgH + 8;
        }

        resetColor();
        for (const block of ch.blocks) {
          if (cy > PH - 22) { newPage(); cy = MT + 10; }
          if (block.type === "heading") {
            cy += 4;
            doc.setFont("helvetica", "bold");
            doc.setFontSize(10);
            setColor(...NAVY);
            doc.text(block.text.toUpperCase(), ML, cy, { align: "left" });
            resetColor();
            cy += 6;
          } else if (block.type === "bullet") {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            resetColor();
            cy = writeLines(`•  ${block.text}`, ML + 5, cy, W - 5, 5.5);
            cy += 2;
          } else {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            resetColor();
            cy = writeLines(block.text, ML, cy, W, 5.8);
            cy += 4;
          }
        }
      }

      // ── Conclusion Page ────────────────────────────────────────────────────
      if (result.conclusion) {
        newPage();

        // Conclusion header
        doc.setFillColor(...GOLD);
        doc.roundedRect(ML, 15, W, 25, 2, 2, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        setColor(...DARK);
        doc.text(result.conclusion.title || "CONCLUSÃO", PW / 2, 25, { align: "center" });

        let concY = 50;
        resetColor();
        for (const block of result.conclusion.blocks) {
          if (concY > PH - 22) { newPage(); concY = MT + 10; }
          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);
          resetColor();
          concY = writeLines(block.text, ML, concY, W, 6);
          concY += 6;
        }

        // Final decorative element
        concY += 15;
        doc.setDrawColor(...GOLD);
        doc.setLineWidth(0.5);
        doc.line(ML, concY, PW - ML, concY);
      }

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

  // ── Render helpers ─────────────────────────────────────────────────────────

  const renderBlocks = (blocks: BookBlock[]) => (
    <div className="space-y-2 text-sm text-slate-700">
      {blocks.map((b, i) => {
        if (b.type === "heading") return (
          <p key={i} className="font-bold text-xs uppercase tracking-wider text-slate-500 pt-3 pb-1">{b.text}</p>
        );
        if (b.type === "bullet") return (
          <p key={i} className="pl-4 leading-relaxed">• {b.text}</p>
        );
        return <p key={i} className="leading-relaxed">{b.text}</p>;
      })}
    </div>
  );

  const imageCount  = Object.keys(chapterImages).length;

  // ── Playbook view — full dark manga reader ─────────────────────────────────
  if (result && viewMode === "playbook") {
    const chapters = result.chapters;
    const ch       = chapters[playbookChapter];
    const prevCh   = playbookChapter > 0 ? chapters[playbookChapter - 1] : null;
    const nextCh   = playbookChapter < chapters.length - 1 ? chapters[playbookChapter + 1] : null;

    return (
      <div className="min-h-screen bg-black text-white flex flex-col">
        {/* Top bar */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-3 bg-black/90 backdrop-blur-sm border-b border-white/10">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse shrink-0" />
            <span className="text-xs text-white/40 font-mono uppercase tracking-widest shrink-0">Playbook</span>
            <span className="text-white/20 shrink-0">|</span>
            <span className="text-xs text-white/60 truncate">{result.title}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-3">
            <span className="text-xs text-white/40 font-mono">{playbookChapter + 1}/{chapters.length}</span>
            <div
              role="button"
              tabIndex={0}
              onClick={() => setViewMode("book")}
              onKeyDown={e => e.key === "Enter" && setViewMode("book")}
              className="flex items-center gap-1 px-3 py-1.5 text-xs text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition cursor-pointer"
            >
              <X className="h-3.5 w-3.5" /> Fechar
            </div>
          </div>
        </div>

        {/* Scene */}
        <div className="flex-1 overflow-y-auto">
          {/* Chapter image — full width */}
          <div className="relative w-full h-[55vh] overflow-hidden">
            {chapterImages[ch.number] ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={chapterImages[ch.number]} alt={ch.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/50" />
              </>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-slate-900 via-purple-950 to-black flex items-center justify-center">
                <span className="text-white/10 font-mono text-sm uppercase tracking-widest">Capítulo {ch.number}</span>
              </div>
            )}

            {/* Chapter label + title overlay */}
            <div className="absolute bottom-6 left-6 right-6">
              <div className="inline-flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 bg-purple-600/80 backdrop-blur-sm text-white text-xs font-mono uppercase tracking-widest rounded">
                  Cap. {ch.number}
                </span>
              </div>
              <h2 className="text-2xl font-black text-white drop-shadow-lg leading-tight">{ch.title}</h2>
            </div>
          </div>

          {/* Content — manga panel style */}
          <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">
            {ch.blocks.map((block, i) => {
              if (block.type === "heading") {
                return (
                  <div key={i} className="flex items-center gap-3 py-1">
                    <div className="h-px flex-1 bg-white/10" />
                    <span className="text-xs font-mono uppercase tracking-widest text-purple-400 px-3 shrink-0">
                      {block.text}
                    </span>
                    <div className="h-px flex-1 bg-white/10" />
                  </div>
                );
              }
              if (block.type === "bullet") {
                return (
                  <div key={i} className="ml-4 pl-4 border-l-2 border-purple-600/50">
                    <p className="text-sm text-white/80 leading-relaxed">{block.text}</p>
                  </div>
                );
              }
              // paragraph — speech-bubble panel
              return (
                <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl px-5 py-4">
                  <p className="text-sm text-white/90 leading-relaxed">{block.text}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Navigation bar */}
        <div className="sticky bottom-0 flex items-center justify-between px-6 py-4 bg-black/90 backdrop-blur-sm border-t border-white/10">
          <div
            role="button"
            tabIndex={0}
            onClick={() => prevCh && setPlaybookChapter(playbookChapter - 1)}
            onKeyDown={e => e.key === "Enter" && prevCh && setPlaybookChapter(playbookChapter - 1)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition",
              prevCh ? "text-white/70 hover:text-white hover:bg-white/10 cursor-pointer" : "text-white/20 cursor-default"
            )}
          >
            <ChevronLeft className="h-4 w-4" />
            {prevCh ? `Cap. ${prevCh.number}` : "Início"}
          </div>

          {/* Chapter dots */}
          <div className="flex gap-1 items-center">
            {chapters.map((_, idx) => (
              <div
                key={idx}
                role="button"
                tabIndex={0}
                onClick={() => setPlaybookChapter(idx)}
                onKeyDown={e => e.key === "Enter" && setPlaybookChapter(idx)}
                className={cn(
                  "h-1.5 rounded-full transition-all cursor-pointer",
                  idx === playbookChapter ? "bg-purple-400 w-4" : "w-1.5 bg-white/20 hover:bg-white/40"
                )}
              />
            ))}
          </div>

          <div
            role="button"
            tabIndex={0}
            onClick={() => nextCh && setPlaybookChapter(playbookChapter + 1)}
            onKeyDown={e => e.key === "Enter" && nextCh && setPlaybookChapter(playbookChapter + 1)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition",
              nextCh ? "text-white/70 hover:text-white hover:bg-white/10 cursor-pointer" : "text-white/20 cursor-default"
            )}
          >
            {nextCh ? `Cap. ${nextCh.number}` : "Fim"}
            <ChevronRight className="h-4 w-4" />
          </div>
        </div>
      </div>
    );
  }

  // ── Kit de Publicação view ────────────────────────────────────────────────
  if (result && viewMode === "kit") {
    const kitTabs = [
      { id: "amazon", label: "Amazon KDP", icon: "🇺🇸", color: "bg-orange-500" },
      { id: "hotmart", label: "Hotmart", icon: "🔥", color: "bg-red-500" },
      { id: "kiwify", label: "Kiwify", icon: "💜", color: "bg-violet-500" },
      { id: "eduzz", label: "Eduzz", icon: "💙", color: "bg-blue-500" },
      { id: "gumroad", label: "Gumroad", icon: "🟡", color: "bg-yellow-500" },
    ] as const;

    return (
      <div className="min-h-screen bg-slate-50">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-white border-b border-slate-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-600/10 rounded-lg">
                <Package className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="font-bold text-lg">Kit de Publicação</h2>
                <p className="text-xs text-slate-500">{result.title}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode("book")}
              >
                <X className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </div>
          </div>
          {/* Tabs */}
          <div className="max-w-7xl mx-auto px-6 flex gap-1 overflow-x-auto pb-3">
            {kitTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveKitTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap",
                  activeKitTab === tab.id
                    ? "bg-indigo-600 text-white"
                    : "bg-white text-slate-600 hover:bg-slate-100"
                )}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          {!publicationKit ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="p-6 bg-indigo-100 rounded-2xl mb-6">
                <Package className="w-12 h-12 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Preparar para Publicação</h3>
              <p className="text-slate-500 text-center max-w-md mb-6">
                Gere um kit completo com títulos otimizados, descrições, palavras-chave,
                preços e checklists para publicar em todas as plataformas.
              </p>
              <Button
                onClick={handleGenerateKit}
                disabled={kitLoading}
                className="bg-indigo-600 hover:bg-indigo-700 text-lg px-8 py-4"
              >
                {kitLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Gerando kit...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Gerar Kit de Publicação
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Active tab content */}
              <Card className="border-none shadow-lg">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">
                      {kitTabs.find(t => t.id === activeKitTab)?.icon}{" "}
                      {kitTabs.find(t => t.id === activeKitTab)?.label}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleGenerateKit}
                      disabled={kitLoading}
                    >
                      <RefreshCw className={cn("w-4 h-4 mr-2", kitLoading && "animate-spin")} />
                      Regenerar
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Amazon KDP */}
                  {activeKitTab === "amazon" && publicationKit.amazon && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <Label className="text-xs font-semibold text-slate-500 uppercase">Título</Label>
                            <div className="flex gap-2 mt-1">
                              <Input value={publicationKit.amazon.title} readOnly className="font-medium" />
                              <Button variant="outline" size="icon" onClick={() => copyToClipboard(publicationKit.amazon!.title)}>
                                <CopyIcon className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs font-semibold text-slate-500 uppercase">Subtítulo</Label>
                            <div className="flex gap-2 mt-1">
                              <Input value={publicationKit.amazon.subtitle} readOnly />
                              <Button variant="outline" size="icon" onClick={() => copyToClipboard(publicationKit.amazon!.subtitle)}>
                                <CopyIcon className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs font-semibold text-slate-500 uppercase">Preço Sugerido</Label>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-2xl font-bold text-green-600">
                                USD {publicationKit.amazon.suggestedPriceUSD.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs font-semibold text-slate-500 uppercase">Palavras-chave</Label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {publicationKit.amazon.keywords.map((kw, i) => (
                              <span key={i} className="px-3 py-1 bg-slate-100 rounded-full text-sm">
                                {kw}
                              </span>
                            ))}
                          </div>
                          <div className="mt-4">
                            <Label className="text-xs font-semibold text-slate-500 uppercase">Categorias</Label>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {publicationKit.amazon.categories.map((cat, i) => (
                                <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                                  {cat}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs font-semibold text-slate-500 uppercase">Descrição</Label>
                        <div className="flex gap-2 mt-1">
                          <textarea
                            value={publicationKit.amazon.description}
                            readOnly
                            rows={8}
                            className="w-full p-3 rounded-lg border bg-slate-50 text-sm"
                          />
                          <Button variant="outline" size="icon" onClick={() => copyToClipboard(publicationKit.amazon!.description)}>
                            <CopyIcon className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="border-t pt-6">
                        <h4 className="font-bold mb-4 flex items-center gap-2">
                          <CheckSquare className="w-5 h-5 text-green-600" />
                          Checklist Amazon KDP
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {publicationKit.amazon.kdpChecklist.map((item, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                                <Check className="w-4 h-4 text-green-600" />
                              </div>
                              <span className="text-sm">{item}</span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 flex gap-3">
                          <Button className="bg-orange-500 hover:bg-orange-600">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Publicar na Amazon KDP
                          </Button>
                          <Button variant="outline" onClick={() => copyToClipboard(publicationKit.amazon!.kdpChecklist.join("\n"))}>
                            <CopyIcon className="w-4 h-4 mr-2" />
                            Copiar Checklist
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Hotmart */}
                  {activeKitTab === "hotmart" && publicationKit.hotmart && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <Label className="text-xs font-semibold text-slate-500 uppercase">Título do Produto</Label>
                            <div className="flex gap-2 mt-1">
                              <Input value={publicationKit.hotmart.productTitle} readOnly className="font-medium" />
                              <Button variant="outline" size="icon" onClick={() => copyToClipboard(publicationKit.hotmart!.productTitle)}>
                                <CopyIcon className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs font-semibold text-slate-500 uppercase">Preço Sugerido</Label>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-2xl font-bold text-green-600">
                                R$ {publicationKit.hotmart.suggestedPriceBRL.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs font-semibold text-slate-500 uppercase">Descrição de Vendas</Label>
                        <div className="flex gap-2 mt-1">
                          <textarea
                            value={publicationKit.hotmart.salesDescription}
                            readOnly
                            rows={6}
                            className="w-full p-3 rounded-lg border bg-slate-50 text-sm"
                          />
                          <Button variant="outline" size="icon" onClick={() => copyToClipboard(publicationKit.hotmart!.salesDescription)}>
                            <CopyIcon className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs font-semibold text-slate-500 uppercase">Página de Vendas</Label>
                        <div className="flex gap-2 mt-1">
                          <textarea
                            value={publicationKit.hotmart.salesPageContent}
                            readOnly
                            rows={12}
                            className="w-full p-3 rounded-lg border bg-slate-50 text-sm"
                          />
                          <Button variant="outline" size="icon" onClick={() => copyToClipboard(publicationKit.hotmart!.salesPageContent)}>
                            <CopyIcon className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Button className="bg-red-500 hover:bg-red-600">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Criar na Hotmart
                          <span className="ml-2 text-xs opacity-75">
                            {publicationKit.hotmart.registrationUrl.replace("https://www.", "")}
                          </span>
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Kiwify */}
                  {activeKitTab === "kiwify" && publicationKit.kiwify && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <Label className="text-xs font-semibold text-slate-500 uppercase">Título do Produto</Label>
                            <div className="flex gap-2 mt-1">
                              <Input value={publicationKit.kiwify.productTitle} readOnly className="font-medium" />
                              <Button variant="outline" size="icon" onClick={() => copyToClipboard(publicationKit.kiwify!.productTitle)}>
                                <CopyIcon className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs font-semibold text-slate-500 uppercase">Preço Sugerido</Label>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-2xl font-bold text-green-600">
                                R$ {publicationKit.kiwify.suggestedPriceBRL.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs font-semibold text-slate-500 uppercase">Descrição</Label>
                        <div className="flex gap-2 mt-1">
                          <textarea
                            value={publicationKit.kiwify.description}
                            readOnly
                            rows={6}
                            className="w-full p-3 rounded-lg border bg-slate-50 text-sm"
                          />
                          <Button variant="outline" size="icon" onClick={() => copyToClipboard(publicationKit.kiwify!.description)}>
                            <CopyIcon className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs font-semibold text-slate-500 uppercase">Elementos de Vendas</Label>
                        <div className="space-y-2 mt-2">
                          {publicationKit.kiwify.salesElements.map((el, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                              <div className="w-6 h-6 bg-violet-100 rounded-full flex items-center justify-center shrink-0 text-violet-600 font-bold text-sm">
                                {i + 1}
                              </div>
                              <span className="text-sm">{el}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Button className="bg-violet-500 hover:bg-violet-600">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Criar na Kiwify
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Eduzz */}
                  {activeKitTab === "eduzz" && publicationKit.eduzz && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <Label className="text-xs font-semibold text-slate-500 uppercase">Título do Produto</Label>
                            <div className="flex gap-2 mt-1">
                              <Input value={publicationKit.eduzz.productTitle} readOnly className="font-medium" />
                              <Button variant="outline" size="icon" onClick={() => copyToClipboard(publicationKit.eduzz!.productTitle)}>
                                <CopyIcon className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs font-semibold text-slate-500 uppercase">Preço Sugerido</Label>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-2xl font-bold text-green-600">
                                R$ {publicationKit.eduzz.suggestedPriceBRL.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs font-semibold text-slate-500 uppercase">Descrição</Label>
                        <div className="flex gap-2 mt-1">
                          <textarea
                            value={publicationKit.eduzz.description}
                            readOnly
                            rows={6}
                            className="w-full p-3 rounded-lg border bg-slate-50 text-sm"
                          />
                          <Button variant="outline" size="icon" onClick={() => copyToClipboard(publicationKit.eduzz!.description)}>
                            <CopyIcon className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs font-semibold text-slate-500 uppercase">Elementos de Vendas</Label>
                        <div className="space-y-2 mt-2">
                          {publicationKit.eduzz.salesElements.map((el, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center shrink-0 text-blue-600 font-bold text-sm">
                                {i + 1}
                              </div>
                              <span className="text-sm">{el}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Button className="bg-blue-500 hover:bg-blue-600">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Criar na Eduzz
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Gumroad */}
                  {activeKitTab === "gumroad" && publicationKit.gumroad && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <Label className="text-xs font-semibold text-slate-500 uppercase">Título do Produto</Label>
                            <div className="flex gap-2 mt-1">
                              <Input value={publicationKit.gumroad.productTitle} readOnly className="font-medium" />
                              <Button variant="outline" size="icon" onClick={() => copyToClipboard(publicationKit.gumroad!.productTitle)}>
                                <CopyIcon className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs font-semibold text-slate-500 uppercase">Preço Sugerido</Label>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-2xl font-bold text-green-600">
                                USD {publicationKit.gumroad.suggestedPriceUSD.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs font-semibold text-slate-500 uppercase">Descrição</Label>
                        <div className="flex gap-2 mt-1">
                          <textarea
                            value={publicationKit.gumroad.description}
                            readOnly
                            rows={6}
                            className="w-full p-3 rounded-lg border bg-slate-50 text-sm"
                          />
                          <Button variant="outline" size="icon" onClick={() => copyToClipboard(publicationKit.gumroad!.description)}>
                            <CopyIcon className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs font-semibold text-slate-500 uppercase">Dicas para Landing Page</Label>
                        <div className="space-y-2 mt-2">
                          {publicationKit.gumroad.landingPageTips.map((tip, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                              <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center shrink-0 text-yellow-600 font-bold text-sm">
                                {i + 1}
                              </div>
                              <span className="text-sm">{tip}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Button className="bg-yellow-500 hover:bg-yellow-600">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Criar no Gumroad
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Main layout ────────────────────────────────────────────────────────────
  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-600/10 rounded-xl">
            <BookOpen className="w-8 h-8 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gerador de Livros</h1>
            <p className="text-muted-foreground text-sm">
              Story Chief + DALL-E 3 · PDF profissional B5 · Playbook interativo anime/mangá
            </p>
          </div>
        </div>
        <Link href="/dashboard/meus-livros">
          <Button variant="outline" className="gap-2">
            <Library className="w-4 h-4" />
            Meus Livros
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

        {/* ── Form ──────────────────────────────────────────────────────────── */}
        <Card className="xl:col-span-4 h-fit sticky top-24 border-none shadow-md">
          <CardHeader>
            <CardTitle>Configurações</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-5">

              {/* ── Ebook Mode Selector ── */}
              <div className="space-y-2">
                <Label className="text-sm font-bold">Escolha o Modo</Label>
                <div className="grid grid-cols-1 gap-2">
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setEbookStyle("visual")}
                    onKeyDown={e => e.key === "Enter" && setEbookStyle("visual")}
                    className={cn(
                      "relative p-4 rounded-xl border-2 cursor-pointer transition select-none",
                      ebookStyle === "visual"
                        ? "border-teal-500 bg-teal-50"
                        : "border-slate-200 hover:border-teal-300 bg-white"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "flex items-center justify-center w-10 h-10 rounded-xl shrink-0 text-lg",
                        ebookStyle === "visual" ? "bg-teal-500 text-white" : "bg-slate-100 text-slate-500"
                      )}>
                        🎨
                      </div>
                      <div className="min-w-0">
                        <div className={cn("font-bold text-sm", ebookStyle === "visual" ? "text-teal-700" : "text-slate-700")}>
                          Modo A — Ebook Visual
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">Imagem DALL-E em cada capítulo · Capa premium · Design moderno</div>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {["Romance", "Infantil", "Fantasia", "Fitness", "Receitas"].map(tag => (
                            <span key={tag} className={cn("text-xs px-1.5 py-0.5 rounded-full", ebookStyle === "visual" ? "bg-teal-100 text-teal-700" : "bg-slate-100 text-slate-500")}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      {ebookStyle === "visual" && (
                        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>

                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setEbookStyle("traditional")}
                    onKeyDown={e => e.key === "Enter" && setEbookStyle("traditional")}
                    className={cn(
                      "relative p-4 rounded-xl border-2 cursor-pointer transition select-none",
                      ebookStyle === "traditional"
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-200 hover:border-blue-300 bg-white"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "flex items-center justify-center w-10 h-10 rounded-xl shrink-0 text-lg",
                        ebookStyle === "traditional" ? "bg-blue-500 text-white" : "bg-slate-100 text-slate-500"
                      )}>
                        📖
                      </div>
                      <div className="min-w-0">
                        <div className={cn("font-bold text-sm", ebookStyle === "traditional" ? "text-blue-700" : "text-slate-700")}>
                          Modo B — Livro Tradicional
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">Layout limpo Amazon KDP · Sem imagens nos capítulos · Índice + Conclusão</div>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {["Autoajuda", "Negócios", "Amazon KDP", "Educação", "Motivacional"].map(tag => (
                            <span key={tag} className={cn("text-xs px-1.5 py-0.5 rounded-full", ebookStyle === "traditional" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500")}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      {ebookStyle === "traditional" && (
                        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100" />

              {/* Mode selector */}
              <div className="space-y-1.5">
                <Label>Modo</Label>
                <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-lg">
                  {(["create", "improve", "rewrite"] as AppMode[]).map((m) => (
                    <div
                      key={m}
                      role="button"
                      tabIndex={0}
                      onClick={() => setAppMode(m)}
                      onKeyDown={e => e.key === "Enter" && setAppMode(m)}
                      className={cn(
                        "px-2 py-1.5 text-xs font-medium rounded-md text-center cursor-pointer transition select-none",
                        appMode === m
                          ? "bg-white shadow-sm text-slate-900"
                          : "text-slate-500 hover:text-slate-700"
                      )}
                    >
                      {m === "create" ? "Criar" : m === "improve" ? "Melhorar" : "Reescrever"}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-400 px-0.5">
                  {appMode === "create"
                    ? "Cria um livro do zero a partir do tema."
                    : appMode === "improve"
                    ? "Melhora um PDF existente mantendo o conteúdo."
                    : "Reescreve completamente um PDF no novo estilo."}
                </p>
              </div>

              {/* PDF upload — improve / rewrite */}
              {(appMode === "improve" || appMode === "rewrite") && (
                <div className="space-y-1.5">
                  <Label>PDF para processar</Label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) handlePdfFile(file);
                    }}
                  />
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => fileInputRef.current?.click()}
                    onKeyDown={e => e.key === "Enter" && fileInputRef.current?.click()}
                    className={cn(
                      "w-full border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition",
                      pdfText
                        ? "border-green-300 bg-green-50"
                        : "border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30"
                    )}
                  >
                    {pdfExtracting ? (
                      <div className="flex flex-col items-center gap-1.5">
                        <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
                        <span className="text-xs text-indigo-500">Extraindo texto...</span>
                      </div>
                    ) : pdfText ? (
                      <div className="flex flex-col items-center gap-1">
                        <FileText className="w-5 h-5 text-green-600" />
                        <span className="text-xs text-green-700 font-medium truncate max-w-full px-2">{pdfFileName}</span>
                        <span className="text-xs text-green-500">{pdfText.length.toLocaleString()} chars extraídos</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1.5">
                        <Upload className="w-5 h-5 text-slate-400" />
                        <span className="text-xs text-slate-500">Clique para selecionar o PDF</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Improve sub-mode */}
              {appMode === "improve" && (
                <div className="space-y-1.5">
                  <Label>Tipo de melhoria</Label>
                  <Select value={improveMode} onValueChange={v => { if (v) setImproveMode(v as ImproveMode); }}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="spelling">Corrigir ortografia</SelectItem>
                      <SelectItem value="expand">Melhorar e expandir</SelectItem>
                      <SelectItem value="reformat">Reformatar estrutura</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Genre */}
              <div className="space-y-1.5">
                <Label>Gênero Literário</Label>
                <Select value={genre} onValueChange={v => { if (v) setGenre(v); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {GENRE_OPTIONS.map(o => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Language */}
              <div className="space-y-1.5">
                <Label>Idioma</Label>
                <Select value={language} onValueChange={v => { if (v) setLanguage(v); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {LANGUAGE_OPTIONS.map(o => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Theme — create mode */}
              {appMode === "create" && (
                <div className="space-y-1.5">
                  <Label htmlFor="theme">Tema do Livro</Label>
                  <Input
                    id="theme"
                    placeholder="Ex: Como construir relações saudáveis..."
                    value={theme}
                    onChange={e => setTheme(e.target.value)}
                    required
                  />
                </div>
              )}

              {/* Author name */}
              <div className="space-y-1.5">
                <Label htmlFor="authorName">
                  Nome da Autora{" "}
                  <span className="text-slate-400 font-normal text-xs">(opcional)</span>
                </Label>
                <Input
                  id="authorName"
                  placeholder="Ex: Ana Clara Souza"
                  value={authorName}
                  onChange={e => setAuthorName(e.target.value)}
                />
              </div>

              {/* Page size */}
              <div className="space-y-1.5">
                <Label>Tamanho do Livro</Label>
                <div className="grid grid-cols-3 gap-1.5">
                  {PAGE_SIZES.map(size => (
                    <div
                      key={size}
                      role="button"
                      tabIndex={0}
                      onClick={() => setPageSize(size)}
                      onKeyDown={e => e.key === "Enter" && setPageSize(size)}
                      className={cn(
                        "px-2 py-2 text-xs font-medium rounded-lg border text-center cursor-pointer transition select-none",
                        pageSize === size
                          ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                          : "border-slate-200 text-slate-500 hover:border-indigo-300 hover:text-indigo-600"
                      )}
                    >
                      {size}p
                    </div>
                  ))}
                </div>
              </div>

              {/* Playbook toggle */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => setPlaybookMode(!playbookMode)}
                onKeyDown={e => e.key === "Enter" && setPlaybookMode(!playbookMode)}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition select-none",
                  playbookMode
                    ? "bg-purple-950/20 border-purple-700/40"
                    : "border-slate-200 hover:border-purple-300"
                )}
              >
                <div className={cn("relative w-8 h-4 rounded-full shrink-0 transition-colors", playbookMode ? "bg-purple-600" : "bg-slate-300")}>
                  <div className={cn("absolute top-0 w-4 h-4 rounded-full bg-white shadow transition-transform", playbookMode ? "translate-x-4" : "translate-x-0")} />
                </div>
                <div>
                  <div className={cn("text-xs font-semibold", playbookMode ? "text-purple-300" : "text-slate-600")}>
                    Playbook Interativo
                  </div>
                  <div className="text-xs text-slate-400">Imagens estilo anime/mangá escuro</div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg"
                disabled={loading || generatingImages || pdfExtracting}
              >
                {loading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Escrevendo manuscrito...</>
                ) : generatingImages ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Gerando imagens...</>
                ) : appMode === "create" ? (
                  <><BookOpen className="mr-2 h-4 w-4" />Gerar Livro Completo</>
                ) : appMode === "improve" ? (
                  <><Sparkles className="mr-2 h-4 w-4" />Melhorar PDF</>
                ) : (
                  <><Sparkles className="mr-2 h-4 w-4" />Reescrever PDF</>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* ── Results ───────────────────────────────────────────────────────── */}
        <div className="xl:col-span-8 flex flex-col gap-6">

          {/* Empty state */}
          {!result && !loading && (
            <div className="flex flex-col items-center justify-center h-[600px] border-2 border-dashed rounded-xl bg-slate-50/50">
              <BookOpen className="w-10 h-10 text-slate-300 mb-3" />
              <p className="text-lg font-medium text-slate-600">Aguardando configurações</p>
              <p className="text-slate-400 text-sm mt-1 text-center max-w-xs">
                Preencha as configurações e clique em &quot;Gerar&quot;
              </p>
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div className="flex flex-col items-center justify-center h-[600px] border-2 border-dashed rounded-xl bg-indigo-50/30">
              <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
              <p className="text-lg font-medium text-slate-700 animate-pulse">
                {appMode === "create" ? "Escrevendo manuscrito..." : "Processando livro..."}
              </p>
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
                  {ebookStyle === "visual" && imageCount > 0 && (
                    <span className="text-xs text-slate-400 font-normal">
                      · {imageCount}/{result.chapters.length} ilustrações{coverBase64 ? " + capa" : ""}
                    </span>
                  )}
                  {ebookStyle === "traditional" && coverBase64 && (
                    <span className="text-xs text-slate-400 font-normal">· capa gerada</span>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs px-2 py-1 rounded-md ${colors.badge}`}>{genre}</span>
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md">{language}</span>
                  {result && (
                    <Button
                      onClick={() => { setViewMode("playbook"); setPlaybookChapter(0); }}
                      variant="outline"
                      size="sm"
                      className="border-purple-300 text-purple-700 hover:bg-purple-50"
                    >
                      <BookMarked className="w-3.5 h-3.5 mr-1.5" /> Playbook
                    </Button>
                  )}
                  <Button onClick={handleSave} disabled={saveLoading} variant="outline" size="sm">
                    {saveLoading
                      ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                      : <Save className="w-3.5 h-3.5 mr-1.5" />}
                    Salvar
                  </Button>
                  <Button
                    onClick={handleSharePlaybook}
                    disabled={shareLoading}
                    variant="outline"
                    size="sm"
                    className="border-purple-300 text-purple-700 hover:bg-purple-50"
                  >
                    {shareLoading
                      ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                      : copied
                      ? <Check className="w-3.5 h-3.5 mr-1.5 text-green-600" />
                      : <Share2 className="w-3.5 h-3.5 mr-1.5" />}
                    {copied ? "Copiado!" : "Compartilhar"}
                  </Button>
                  <Button
                    onClick={() => setViewMode("kit")}
                    variant="outline"
                    size="sm"
                    className="border-indigo-300 text-indigo-700 hover:bg-indigo-50"
                  >
                    <Package className="w-3.5 h-3.5 mr-1.5" />
                    Kit Pub.
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

              {/* Share URL display */}
              {shareUrl && (
                <div className="flex items-center gap-2 bg-purple-50 border border-purple-200 rounded-xl px-4 py-3">
                  <Share2 className="w-4 h-4 text-purple-500 shrink-0" />
                  <a
                    href={shareUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-purple-700 font-mono truncate flex-1 hover:underline"
                  >
                    {shareUrl}
                  </a>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      navigator.clipboard.writeText(shareUrl).catch(() => {});
                      setCopied(true);
                      setTimeout(() => setCopied(false), 3000);
                    }}
                    onKeyDown={e => {
                      if (e.key === "Enter") {
                        navigator.clipboard.writeText(shareUrl).catch(() => {});
                        setCopied(true);
                        setTimeout(() => setCopied(false), 3000);
                      }
                    }}
                    className="shrink-0 p-1.5 rounded-lg hover:bg-purple-100 cursor-pointer transition"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-purple-500" />}
                  </div>
                </div>
              )}

              {/* Cover + book info */}
              <div className="flex gap-5">
                <div className="shrink-0 w-32 flex flex-col gap-2">
                  {coverBase64 ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={coverBase64}
                      alt="Capa"
                      className="w-32 h-48 object-cover rounded-lg shadow-md border border-slate-200"
                    />
                  ) : (
                    <div className="w-32 h-48 rounded-lg bg-slate-100 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-1 text-slate-400">
                      <ImageIcon className="w-5 h-5" />
                      <span className="text-xs text-center">capa DALL-E</span>
                    </div>
                  )}
                  {/* Cover actions */}
                  <button
                    type="button"
                    onClick={() => coverUploadRef.current?.click()}
                    className="w-full flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-medium transition"
                  >
                    <Camera className="w-3 h-3" /> Minha capa
                  </button>
                  <button
                    type="button"
                    onClick={handleCoverRegenerate}
                    disabled={coverRegenLoading}
                    className="w-full flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-medium transition disabled:opacity-50"
                  >
                    {coverRegenLoading
                      ? <Loader2 className="w-3 h-3 animate-spin" />
                      : <RefreshCw className="w-3 h-3" />}
                    {coverRegenLoading ? "Gerando..." : "Regenerar"}
                  </button>
                </div>
                <Card className={`flex-1 border-none shadow-md ${colors.bg}`}>
                  <CardContent className="pt-5 pb-5">
                    <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${colors.text}`}>{genre}</p>
                    <p className={`text-2xl font-black tracking-tight ${colors.text}`}>{result.title}</p>
                    {result.subtitle && (
                      <p className={`text-sm mt-1 italic ${colors.text} opacity-80`}>{result.subtitle}</p>
                    )}
                    <p className={`text-xs mt-2 font-medium ${colors.text} opacity-70`}>
                      por {authorName || result.author}
                    </p>
                    <p className="text-xs mt-1 text-slate-400">
                      {pageSize} páginas · {result.chapters.length} capítulos
                    </p>
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
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
                  {result.chapters.length} Capítulos
                </p>
                {result.chapters.map((ch) => {
                  const isOpen = expandedChapter === ch.number;
                  const hasImg = !!chapterImages[ch.number];
                  return (
                    <Card key={ch.number} className="border-none shadow-sm overflow-hidden">
                      <div
                        role="button"
                        tabIndex={0}
                        className={cn(
                          "px-5 py-3 flex items-center justify-between cursor-pointer transition-colors",
                          isOpen ? colors.bg : "hover:bg-slate-50"
                        )}
                        onClick={() => setExpandedChapter(isOpen ? null : ch.number)}
                        onKeyDown={e => e.key === "Enter" && setExpandedChapter(isOpen ? null : ch.number)}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className={cn(
                            "text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0",
                            isOpen ? colors.badge : "bg-slate-100 text-slate-500"
                          )}>
                            {ch.number}
                          </span>
                          <span className={cn("text-sm font-medium truncate", isOpen ? colors.text : "text-slate-700")}>
                            {ch.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          {hasImg && <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />}
                          {isOpen
                            ? <ChevronUp className={cn("w-4 h-4", colors.text)} />
                            : <ChevronDown className="w-4 h-4 text-slate-400" />}
                        </div>
                      </div>
                      {isOpen && (
                        <CardContent className="pt-3 pb-5">
                          {/* Chapter image + replace UI — only in Visual mode */}
                          <div className={ebookStyle === "traditional" ? "hidden" : "mb-4"}>
                            {/* Preview pending upload */}
                            {pendingChapterImg?.num === ch.number ? (
                              <div className="space-y-2">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={pendingChapterImg.base64}
                                  alt="Preview"
                                  className="w-full rounded-lg shadow-sm border-2 border-indigo-300"
                                />
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={confirmChapterImg}
                                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition"
                                  >
                                    <Check className="w-3.5 h-3.5" /> Confirmar
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => { setPendingChapterImg(null); setPendingUploadChapter(null); }}
                                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-medium transition"
                                  >
                                    <X className="w-3.5 h-3.5" /> Cancelar
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div>
                                {chapterImages[ch.number] && (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={chapterImages[ch.number]}
                                    alt={`Ilustração capítulo ${ch.number}`}
                                    className="w-full rounded-lg shadow-sm"
                                  />
                                )}
                                {/* Trocar imagem toggle */}
                                {chapterReplaceOpen === ch.number ? (
                                  <div className="mt-2 p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Trocar imagem</p>
                                    <div className="flex gap-2">
                                      <button
                                        type="button"
                                        onClick={() => handleChapterRegenerate(ch)}
                                        disabled={chapterRegenLoading === ch.number}
                                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-medium transition disabled:opacity-60"
                                      >
                                        {chapterRegenLoading === ch.number
                                          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                          : <Sparkles className="w-3.5 h-3.5" />}
                                        {chapterRegenLoading === ch.number ? "Gerando..." : "Nova (DALL-E)"}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => { setPendingUploadChapter(ch.number); chapterImgUploadRef.current?.click(); }}
                                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-medium transition"
                                      >
                                        <Upload className="w-3.5 h-3.5" /> Upload próprio
                                      </button>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => setChapterReplaceOpen(null)}
                                      className="w-full text-xs text-slate-400 hover:text-slate-600 transition py-0.5"
                                    >
                                      Cancelar
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => setChapterReplaceOpen(ch.number)}
                                    className="mt-2 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 text-xs font-medium transition"
                                  >
                                    <RefreshCw className="w-3 h-3" /> Trocar imagem
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                          {renderBlocks(ch.blocks)}
                        </CardContent>
                      )}
                    </Card>
                  );
                })}
              </div>

              {/* Bottom CTA */}
              {result && (
                <div className="flex flex-wrap justify-center gap-3 pt-2 pb-4">
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => { setViewMode("playbook"); setPlaybookChapter(0); }}
                    onKeyDown={e => e.key === "Enter" && (() => { setViewMode("playbook"); setPlaybookChapter(0); })()}
                    className="flex items-center gap-2 px-6 py-3 rounded-full border-2 border-purple-400 text-purple-700 font-bold text-sm hover:bg-purple-50 transition cursor-pointer"
                  >
                    <BookMarked className="w-5 h-5" /> Ver Playbook Interativo
                  </div>
                  <Button
                    onClick={handleDownloadPDF}
                    disabled={pdfLoading}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl text-base px-8 py-3 rounded-full font-bold"
                  >
                    {pdfLoading
                      ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Gerando PDF...</>
                      : <><FileDown className="w-5 h-5 mr-2" />Baixar PDF Completo</>
                    }
                  </Button>
                </div>
              )}

            </div>
          )}
        </div>
      </div>

      {/* Hidden file inputs */}
      <input
        ref={coverUploadRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleCoverUpload(file);
          e.target.value = "";
        }}
      />
      <input
        ref={chapterImgUploadRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && pendingUploadChapter !== null) handleChapterImgUpload(file, pendingUploadChapter);
          e.target.value = "";
        }}
      />
    </div>
  );
}
