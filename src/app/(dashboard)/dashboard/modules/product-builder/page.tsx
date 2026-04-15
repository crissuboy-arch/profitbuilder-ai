"use client";

import { useState, useEffect, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import {
  buildProduct,
  saveStructureToProject,
  generateEbook,
  generateViralHooks,
  generateCoverImage,
  generateChapterImages,
  generateBonuses,
  generateComplementaryFormats,
  type ProductStructureResult,
  type EbookResult,
  type ViralHooksResult,
  type ComplementaryFormat,
} from "./actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CountrySelect } from "@/components/shared/CountrySelect";
import { LanguageSelect } from "@/components/shared/LanguageSelect";
import { toast } from "sonner";
import {
  Loader2, Package, Layers, Gift, DollarSign, Zap, DownloadCloud,
  Save, CheckCircle2, ArrowRight, BookOpen, ImageIcon, Megaphone,
  FileDown, Sparkles, ChevronDown,
} from "lucide-react";

export default function ProductBuilderPage() {
  const router = useRouter();

  // ── Form prefill state (from localStorage) ──
  const [idea, setIdea] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [priceRange, setPriceRange] = useState("");

  // ── Blueprint state ──
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ProductStructureResult | null>(null);
  const [currentProjectName, setCurrentProjectName] = useState("");
  const [parsedLanguage, setParsedLanguage] = useState("");
  const [currentTargetAudience, setCurrentTargetAudience] = useState("");
  const [currentPriceRange, setCurrentPriceRange] = useState("");

  // ── Ebook state ──
  const [ebookPageCount, setEbookPageCount] = useState<number>(20);
  const [ebookLoading, setEbookLoading] = useState(false);
  const [ebookResult, setEbookResult] = useState<EbookResult | null>(null);
  const [editableEbook, setEditableEbook] = useState<EbookResult | null>(null);
  const [expandedChapter, setExpandedChapter] = useState<number | null>(null);
  const [uploadedImages, setUploadedImages] = useState<{ name: string; base64: string; mimeType: string }[]>([]);

  // ── Format state ──
  const [expandedFormatIndex, setExpandedFormatIndex] = useState<number | null>(null);

  // ── Cover state ──
  const [coverLoading, setCoverLoading] = useState(false);
  const [coverImageBase64, setCoverImageBase64] = useState<string | null>(null);

  // ── Dynamic bonuses state ──
  const [dynamicBonuses, setDynamicBonuses] = useState<string[]>([]);
  const [bonusesLoading, setBonusesLoading] = useState(false);

  // ── Complementary formats state ──
  const [complementaryFormats, setComplementaryFormats] = useState<ComplementaryFormat[]>([]);
  const [formatsLoading, setFormatsLoading] = useState(false);

  // ── Viral hooks state ──
  const [hooksLoading, setHooksLoading] = useState(false);
  const [hooksResult, setHooksResult] = useState<ViralHooksResult | null>(null);

  // ── Chapter images state ──
  const [chapterImages, setChapterImages] = useState<string[]>([]);
  const [chapterImagesLoading, setChapterImagesLoading] = useState(false);

  // ── PDF state ──
  const [pdfLoading, setPdfLoading] = useState(false);

  // ── Read last saved product from localStorage ──
  useEffect(() => {
    try {
      const stored = localStorage.getItem("lastMinedProduct");
      if (stored) {
        const product = JSON.parse(stored);
        setIdea(`${product.productName}: ${product.mainProblemSolved}`);
        setTargetAudience(product.targetAudience ?? "");
        setPriceRange(product.priceRange ?? "");
      }
    } catch {}
  }, []);

  // ── Handlers ──
  async function onSubmit(formData: FormData) {
    setLoading(true);
    setResult(null);
    setEbookResult(null);
    setEditableEbook(null);
    setCoverImageBase64(null);
    setHooksResult(null);
    setDynamicBonuses([]);
    setComplementaryFormats([]);
    setChapterImages([]);

    const ideaVal = formData.get("idea") as string;
    const language = formData.get("language") as string;
    const audience = formData.get("targetAudience") as string;
    const price = formData.get("priceRange") as string;

    setCurrentProjectName(`${ideaVal.substring(0, 30)}... Structure`);
    setParsedLanguage(language);
    setCurrentTargetAudience(audience);
    setCurrentPriceRange(price);

    const params = {
      idea: ideaVal,
      targetAudience: audience,
      priceRange: price,
      businessModel: formData.get("businessModel") as string,
      country: formData.get("country") as string,
      language,
    };

    const { success, data, error } = await buildProduct(params);

    if (success && data) {
      setResult(data);
      setDynamicBonuses(data.bonuses);
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

  function handleGenerateSalesPage() {
    if (!result) return;
    const params = new URLSearchParams({
      concept: result.concept,
      audience: currentTargetAudience,
      price: currentPriceRange,
      mechanism: result.uniqueSellingMechanism,
    });
    router.push(`/dashboard/modules/sales-page-generator?${params.toString()}`);
  }

  async function handleGenerateBonuses() {
    if (!result) return;
    setBonusesLoading(true);
    const { success, data, error } = await generateBonuses({
      concept: result.concept,
      targetAudience: currentTargetAudience,
      language: parsedLanguage || "English",
    });
    if (success && data) {
      setDynamicBonuses(data);
      toast.success("Bônus gerados!");
    } else {
      toast.error(error || "Erro ao gerar bônus.");
    }
    setBonusesLoading(false);
  }

  async function handleGenerateFormats() {
    if (!result) return;
    setFormatsLoading(true);
    const { success, data, error } = await generateComplementaryFormats({
      concept: result.concept,
      targetAudience: currentTargetAudience,
      language: parsedLanguage || "English",
    });
    if (success && data) {
      setComplementaryFormats(data);
      toast.success("Formatos gerados!");
    } else {
      toast.error(error || "Erro ao gerar formatos.");
    }
    setFormatsLoading(false);
  }

  async function handleGenerateEbook() {
    if (!result) return;
    setEbookLoading(true);
    setEbookResult(null);
    setEditableEbook(null);
    setChapterImages([]);
    const { success, data, error } = await generateEbook({
      concept: result.concept,
      targetAudience: currentTargetAudience,
      pageCount: ebookPageCount,
      language: parsedLanguage || "English",
    });
    if (success && data) {
      setEbookResult(data);
      setEditableEbook(data);
      toast.success("E-book gerado com sucesso!");
    } else {
      toast.error(error || "Erro ao gerar e-book.");
    }
    setEbookLoading(false);
  }

  async function handleGenerateCover() {
    if (!editableEbook) return;
    setCoverLoading(true);
    setCoverImageBase64(null);
    const { success, imageBase64, error } = await generateCoverImage({
      title: editableEbook.title,
      concept: result?.concept ?? "",
    });
    if (success && imageBase64) {
      setCoverImageBase64(imageBase64);
      toast.success("Capa gerada com sucesso!");
    } else {
      toast.error(error || "Erro ao gerar capa.");
    }
    setCoverLoading(false);
  }

  async function handleGenerateChapterImages() {
    if (!editableEbook || !result) return;
    setChapterImagesLoading(true);
    toast.loading(`Gerando ${editableEbook.chapters.length} imagens... isso pode levar alguns minutos.`, { id: "ch-imgs" });
    const { success, images, error } = await generateChapterImages({
      chapters: editableEbook.chapters,
      concept: result.concept,
    });
    if (success && images) {
      setChapterImages(images.map((img) => img ?? ""));
      toast.success("Imagens dos capítulos geradas!", { id: "ch-imgs" });
    } else {
      toast.error(error || "Erro ao gerar imagens.", { id: "ch-imgs" });
    }
    setChapterImagesLoading(false);
  }

  async function handleGenerateHooks() {
    if (!result) return;
    setHooksLoading(true);
    setHooksResult(null);
    const { success, data, error } = await generateViralHooks({
      concept: result.concept,
      targetAudience: currentTargetAudience,
      language: parsedLanguage || "English",
    });
    if (success && data) {
      setHooksResult(data);
      toast.success("Ganchos virais gerados!");
    } else {
      toast.error(error || "Erro ao gerar ganchos.");
    }
    setHooksLoading(false);
  }

  async function handleDownloadPDF() {
    if (!editableEbook) return;
    setPdfLoading(true);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF("p", "mm", "a4");
      const W = doc.internal.pageSize.getWidth();
      const H = doc.internal.pageSize.getHeight();
      const mg = 18;
      const cw = W - 2 * mg;

      const palette: Array<[number, number, number]> = [
        [124, 58, 237], [5, 150, 105], [37, 99, 235],
        [217, 119, 6], [220, 38, 38], [15, 118, 110],
        [147, 51, 234], [236, 72, 153],
      ];
      let pn = 1;
      const bkTitle = editableEbook.title;

      // ── color helpers ──
      const lerp = (a: [number,number,number], b: [number,number,number], t: number): [number,number,number] =>
        [Math.round(a[0]+(b[0]-a[0])*t), Math.round(a[1]+(b[1]-a[1])*t), Math.round(a[2]+(b[2]-a[2])*t)];
      const sf = (c: [number,number,number]) => doc.setFillColor(c[0], c[1], c[2]);
      const st = (c: [number,number,number]) => doc.setTextColor(c[0], c[1], c[2]);
      const sd = (c: [number,number,number]) => doc.setDrawColor(c[0], c[1], c[2]);

      const WHITE: [number,number,number] = [255, 255, 255];
      const DARK: [number,number,number]  = [15, 23, 42];
      const GRAY: [number,number,number]  = [248, 250, 252];
      const VIOLET: [number,number,number] = [124, 58, 237];

      // ── page helpers ──
      const footer = () => {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(190, 190, 190);
        doc.text(String(pn++), W / 2, H - 7, { align: "center" });
        const tl = doc.splitTextToSize(bkTitle, cw - 30);
        doc.setTextColor(210, 210, 210);
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

      // ── block type detectors ──
      const isSubt   = (s: string) => s.length < 68 && s.length > 4 && !/[.!?,;]$/.test(s) && !s.includes("\n");
      const isBullet = (s: string) => /^[-•*✓→▶]\s/.test(s.trim()) || /^\d+[.)]\s/.test(s.trim());
      const isTip    = (s: string) => /^(dica|tip|💡|🔑|▶|nota[:\s]|atenção)/i.test(s.trim());

      // ── smart content renderer ──
      const renderContent = (content: string, startY: number, col: [number,number,number]): number => {
        const cleaned = content.replace(/\[IMAGEM:[^\]]*\]/g, "").trim();
        const blocks = cleaned.split(/\n{2,}/).map(b => b.trim()).filter(Boolean);
        let y = startY;
        let first = true;

        for (const block of blocks) {
          if (y > H - 40) { footer(); newPage(); y = 28; }
          const lines = block.split("\n").map(l => l.trim()).filter(Boolean);

          // Tip box
          if (isTip(block)) {
            const tipText = block.replace(/^(dica|tip|💡|🔑|▶|nota)[:\s]*/i, "").trim();
            const tipLines = doc.splitTextToSize(tipText, cw - 14);
            const boxH = tipLines.length * 5.5 + 16;
            sf(lerp(col, WHITE, 0.88)); doc.rect(mg, y, cw, boxH, "F");
            sf(col); doc.rect(mg, y, 3, boxH, "F");
            doc.setFont("helvetica", "bold"); doc.setFontSize(7.5); st(col);
            doc.text("💡  DICA PRÁTICA", mg + 7, y + 7);
            doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(40, 40, 40);
            let ty = y + 12;
            for (const tl of tipLines) { doc.text(tl, mg + 7, ty); ty += 5.5; }
            y += boxH + 6; first = false; continue;
          }

          // Bullet list
          const bulletLines = lines.filter(isBullet);
          if (bulletLines.length >= 2) {
            for (const bl of bulletLines) {
              if (y > H - 28) { footer(); newPage(); y = 28; }
              const txt = bl.replace(/^[-•*✓→▶]\s*|\d+[.)]\s*/, "");
              sf(col); doc.circle(mg + 2, y - 2, 1.6, "F");
              doc.setFont("helvetica", "normal"); doc.setFontSize(10.5); doc.setTextColor(40, 40, 40);
              y = wrap(txt, mg + 7, y, cw - 7, 5.8);
              y += 1.5;
            }
            y += 3; first = false; continue;
          }

          // Subtitle (single short line)
          if (lines.length === 1 && isSubt(block)) {
            y += 4;
            doc.setFont("helvetica", "bold"); doc.setFontSize(13); st(col);
            doc.text(block, mg, y);
            y += 4; sd(col); doc.setLineWidth(0.5); doc.line(mg, y, mg + 32, y);
            y += 7; first = false; continue;
          }

          // Lead paragraph (first block — slightly larger)
          if (first) {
            doc.setFont("helvetica", "normal"); doc.setFontSize(11.5); st(DARK);
            y = wrap(block, mg, y, cw, 7);
            y += 6; first = false; continue;
          }

          // Regular paragraph
          doc.setFont("helvetica", "normal"); doc.setFontSize(10.5); doc.setTextColor(55, 55, 55);
          y = wrap(block, mg, y, cw, 6.2);
          y += 5;
        }
        return y;
      };

      // ── COVER ──
      if (coverImageBase64) {
        doc.addImage(`data:image/png;base64,${coverImageBase64}`, "PNG", 0, 0, W, H);
      } else {
        sf(DARK); doc.rect(0, 0, W, H, "F");
        sf(VIOLET); doc.rect(0, H * 0.64, W, 2, "F");
        sf(VIOLET); doc.rect(mg, 34, 12, 0.8, "F");
        doc.setFont("helvetica", "bold"); doc.setFontSize(30); st(WHITE);
        const tl = doc.splitTextToSize(editableEbook.title, cw);
        doc.text(tl, mg, 48);
        doc.setFont("helvetica", "normal"); doc.setFontSize(13); st([167, 139, 250]);
        const sl = doc.splitTextToSize(editableEbook.subtitle, cw - 10);
        doc.text(sl, mg, 48 + tl.length * 11 + 10);
      }

      // ── BACK COVER ──
      newPage();
      sf(VIOLET); doc.rect(0, 0, W, 4, "F");
      doc.setFont("helvetica", "bold"); doc.setFontSize(20); st(DARK);
      doc.text("Sobre este livro", mg, 30);
      sf(VIOLET); doc.rect(mg, 34, 28, 0.9, "F");
      doc.setFont("helvetica", "normal"); doc.setFontSize(11); st([71, 85, 105]);
      wrap(editableEbook.backCoverText.replace(/\[IMAGEM:[^\]]*\]/g, ""), mg, 44, cw, 6.5);
      footer();

      // ── TOC ──
      newPage();
      sf(DARK); doc.rect(0, 0, W, 46, "F");
      doc.setFont("helvetica", "bold"); doc.setFontSize(20); st(WHITE);
      doc.text("Índice", mg, 32);
      sf(VIOLET); doc.rect(mg, 38, 22, 1, "F");
      let tocY = 60;
      editableEbook.tableOfContents.forEach((item, i) => {
        if (tocY > H - 25) { footer(); newPage(); tocY = 28; }
        const isSpec = i === 0 || i === editableEbook!.tableOfContents.length - 1;
        const dotCol: [number,number,number] = isSpec ? [160,160,160] : palette[(i - 1) % palette.length];
        sf(dotCol); doc.rect(mg, tocY - 3.5, 3.5, 5, "F");
        doc.setFont("helvetica", isSpec ? "italic" : "bold"); doc.setFontSize(11); st(DARK);
        doc.text(item, mg + 7, tocY);
        tocY += 11;
      });
      footer();

      // ── INTRODUCTION ──
      newPage();
      sf(palette[0]); doc.rect(0, 0, W, 52, "F");
      sf(lerp(palette[0], [0,0,0], 0.28)); doc.rect(0, 48, W, 4, "F");
      doc.setFont("helvetica", "normal"); doc.setFontSize(8); st(WHITE);
      doc.text("INTRODUÇÃO", mg, 22);
      doc.setFont("helvetica", "bold"); doc.setFontSize(20);
      doc.text("Tudo começa aqui", mg, 37);
      renderContent(editableEbook.introduction, 64, palette[0]);
      footer();

      // ── CHAPTERS ──
      editableEbook.chapters.forEach((ch, i) => {
        newPage();
        const col = palette[i % palette.length];
        const img = chapterImages[i] && chapterImages[i].length > 0 ? chapterImages[i] : null;
        let bodyY: number;

        if (img) {
          doc.addImage(`data:image/png;base64,${img}`, "PNG", 0, 0, W, 50);
          sf(col); doc.rect(0, 50, W, 14, "F");
          sf(lerp(col, [0,0,0], 0.28)); doc.rect(0, 60, W, 4, "F");
          doc.setFont("helvetica", "bold"); doc.setFontSize(7); st(WHITE);
          doc.text(`CAPÍTULO ${i + 1}`, mg, 57.5);
          doc.setFontSize(10);
          const ct = ch.title.replace(/^Capítulo\s*\d+[:\s-]*/i, "");
          doc.text(doc.splitTextToSize(ct, cw - 24)[0], mg + 22, 57.5);
          bodyY = 74;
        } else {
          sf(col); doc.rect(0, 0, W, 52, "F");
          sf(lerp(col, [0,0,0], 0.28)); doc.rect(0, 48, W, 4, "F");
          doc.setFont("helvetica", "normal"); doc.setFontSize(8); st(WHITE);
          doc.text(`CAPÍTULO ${i + 1}`, mg, 20);
          doc.setFont("helvetica", "bold"); doc.setFontSize(20);
          const cleanTitle = ch.title.replace(/^Capítulo\s*\d+[:\s-]*/i, "");
          const ctLines = doc.splitTextToSize(cleanTitle, cw);
          doc.text(ctLines, mg, 34);
          bodyY = 62;
        }

        renderContent(ch.content, bodyY, col);
        footer();
      });

      // ── CONCLUSION ──
      newPage();
      sf(DARK); doc.rect(0, 0, W, 52, "F");
      sf(VIOLET); doc.rect(0, 48, W, 4, "F");
      doc.setFont("helvetica", "normal"); doc.setFontSize(8); st([180,180,180]);
      doc.text("CONCLUSÃO", mg, 22);
      doc.setFont("helvetica", "bold"); doc.setFontSize(20); st(WHITE);
      doc.text("Sua transformação começa agora", mg, 37);
      renderContent(editableEbook.conclusion, 64, palette[0]);
      footer();

      // ── CTA ──
      doc.addPage();
      sf(DARK); doc.rect(0, 0, W, H, "F");
      sf(VIOLET); doc.rect(0, 0, W, 3, "F");
      sf(VIOLET); doc.rect(0, H - 3, W, 3, "F");
      sf(lerp(VIOLET, DARK, 0.5)); doc.rect(0, H * 0.55, W, H * 0.45, "F");
      doc.setFont("helvetica", "bold"); doc.setFontSize(26); st(WHITE);
      const ctaTitleL = doc.splitTextToSize("Seu próximo passo", cw);
      doc.text(ctaTitleL, W / 2, H * 0.3, { align: "center" });
      sf(VIOLET); doc.rect(W / 2 - 22, H * 0.3 + 6, 44, 0.9, "F");
      doc.setFont("helvetica", "normal"); doc.setFontSize(12); st([167, 139, 250]);
      const ctaLines = doc.splitTextToSize(editableEbook.cta, cw - 10);
      doc.text(ctaLines, W / 2, H * 0.3 + 18, { align: "center" });

      const fname = editableEbook.title.replace(/[^a-zA-Z0-9\s]/g, "").trim().replace(/\s+/g, "_");
      doc.save(`${fname}.pdf`);
      toast.success("E-book premium baixado com sucesso!");
    } catch (e) {
      console.error(e);
      toast.error("Erro ao gerar PDF. Tente novamente.");
    } finally {
      setPdfLoading(false);
    }
  }

  function updateEbookField(
    field: keyof Pick<EbookResult, "title" | "subtitle" | "introduction" | "conclusion" | "cta" | "backCoverText">,
    value: string
  ) {
    setEditableEbook((prev) => (prev ? { ...prev, [field]: value } : prev));
  }

  function updateChapter(index: number, field: "title" | "content", value: string) {
    setEditableEbook((prev) => {
      if (!prev) return prev;
      const chapters = [...prev.chapters];
      chapters[index] = { ...chapters[index], [field]: value };
      return { ...prev, chapters };
    });
  }

  function handleImageUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      setUploadedImages((prev) => [
        ...prev,
        { name: file.name, base64, mimeType: file.type },
      ]);
    };
    reader.readAsDataURL(file);
  }

  async function handleDownloadFormatPDF(fmt: ComplementaryFormat) {
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF("p", "mm", "a4");
      const W = doc.internal.pageSize.getWidth();
      const H = doc.internal.pageSize.getHeight();
      const margin = 22;
      const cw = W - 2 * margin;

      // Cover page
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, W, H, "F");
      doc.setFillColor(6, 182, 212);
      doc.rect(0, H * 0.44, W, 1.5, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(6, 182, 212);
      doc.text(fmt.type.toUpperCase(), W / 2, H * 0.33, { align: "center" });
      doc.setFontSize(22);
      doc.setTextColor(255, 255, 255);
      const titleLines = doc.splitTextToSize(fmt.title, cw);
      doc.text(titleLines, W / 2, H * 0.38, { align: "center" });
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(148, 163, 184);
      const descLines = doc.splitTextToSize(fmt.description, cw - 10);
      doc.text(descLines, W / 2, H * 0.52, { align: "center" });

      // Content page
      doc.addPage();
      doc.setFillColor(248, 250, 252);
      doc.rect(0, 0, W, H, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(15, 23, 42);
      doc.text(fmt.title, margin, 38, { maxWidth: cw });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(71, 85, 105);
      doc.text(fmt.description, margin, 52, { maxWidth: cw });

      let y = 70;
      const items = getFormatItems(fmt.type);
      doc.setFontSize(10);
      for (const item of items) {
        if (y > H - 20) { doc.addPage(); y = 30; }
        doc.setFillColor(241, 245, 249);
        doc.rect(margin, y - 4, cw, 11, "F");
        doc.setTextColor(51, 65, 85);
        doc.text(item, margin + 4, y + 3.5);
        y += 18;
      }

      const filename = fmt.title.replace(/[^a-zA-Z0-9\s]/g, "").trim().replace(/\s+/g, "_");
      doc.save(`${filename}.pdf`);
      toast.success(`PDF "${fmt.type}" baixado!`);
    } catch (e) {
      console.error(e);
      toast.error("Erro ao gerar PDF do formato.");
    }
  }

  function getFormatItems(type: string): string[] {
    const map: Record<string, string[]> = {
      Planner: ["Dia 1:", "Dia 2:", "Dia 3:", "Dia 4:", "Dia 5:", "Dia 6:", "Dia 7:"],
      Checklist: ["☐ Item 1", "☐ Item 2", "☐ Item 3", "☐ Item 4", "☐ Item 5", "☐ Item 6", "☐ Item 7", "☐ Item 8"],
      Planilha: ["Coluna A:", "Coluna B:", "Coluna C:", "Coluna D:", "Total:"],
      Workbook: ["Exercício 1:", "Exercício 2:", "Exercício 3:", "Reflexão:", "Plano de ação:"],
      Templates: ["Template A:", "Template B:", "Template C:", "Notas:"],
      Calendário: ["Semana 1:", "Semana 2:", "Semana 3:", "Semana 4:"],
      "Mini desafio": ["Dia 1:", "Dia 2:", "Dia 3:", "Dia 4:", "Dia 5:"],
      "Grupo de apoio": ["Regra 1:", "Regra 2:", "Regra 3:", "Regra 4:"],
      "Calendário de acompanhamento": ["Janeiro:", "Fevereiro:", "Março:", "Abril:"],
    };
    return map[type] ?? ["Item 1:", "Item 2:", "Item 3:", "Item 4:", "Item 5:"];
  }

  const currentStep = hooksResult ? 5
    : dynamicBonuses.length > 0 || complementaryFormats.length > 0 ? 4
    : editableEbook ? 3
    : result ? 2
    : 1;

  const steps = [
    { n: 1, label: "Ideia validada" },
    { n: 2, label: "Estrutura" },
    { n: 3, label: "E-book" },
    { n: 4, label: "Bônus" },
    { n: 5, label: "Oferta pronta" },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto font-[family-name:var(--font-geist-sans)]">

      {/* ── HEADER ── */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-violet-600 rounded-2xl shadow-lg shadow-violet-200">
            <Layers className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">
              Crie um produto digital pronto para vender em minutos
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Sem aparecer. Sem complicação. Só gerar, baixar e vender.
            </p>
          </div>
        </div>
      </div>

      {/* ── PROGRESS BAR ── */}
      <div className="mb-10 px-2">
        <div className="flex items-start">
          {steps.map((step, i) => {
            const done = currentStep > step.n;
            const active = currentStep === step.n;
            return (
              <div key={step.n} className="flex items-start flex-1">
                <div className="flex flex-col items-center">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 ${
                    done
                      ? "bg-violet-600 border-violet-600 text-white shadow-md shadow-violet-200"
                      : active
                      ? "bg-white border-violet-500 text-violet-600 shadow-md shadow-violet-100 ring-4 ring-violet-100"
                      : "bg-white border-slate-200 text-slate-400"
                  }`}>
                    {done ? <CheckCircle2 className="w-4 h-4" /> : step.n}
                  </div>
                  <span className={`text-[10px] font-semibold mt-1.5 text-center leading-tight max-w-[64px] ${
                    active ? "text-violet-700" : done ? "text-violet-500" : "text-slate-400"
                  }`}>{step.label}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mt-4 mx-1 rounded-full transition-all duration-500 ${
                    done ? "bg-violet-400" : "bg-slate-200"
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

        {/* Left Column - Input Form */}
        <Card className="xl:col-span-4 h-fit sticky top-24 border border-slate-200 shadow-lg rounded-2xl overflow-hidden">
          <CardHeader className="bg-slate-900 px-6 py-5">
            <CardTitle className="text-white text-base font-semibold">Sua ideia, estruturada pela IA</CardTitle>
            <CardDescription className="text-slate-400 text-sm">Preencha os dados e deixe o sistema trabalhar por você.</CardDescription>
          </CardHeader>
          <CardContent className="px-6 pt-6 pb-4">
            <form action={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="idea" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sua ideia de produto</Label>
                <Textarea
                  id="idea"
                  name="idea"
                  placeholder="e.g., A system helping course creators double their completion rates using gamification."
                  className="min-h-[100px]"
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetAudience" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Público-alvo</Label>
                <Input
                  id="targetAudience"
                  name="targetAudience"
                  placeholder="e.g., Established course creators"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priceRange" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Faixa de preço</Label>
                <Input
                  id="priceRange"
                  name="priceRange"
                  placeholder="e.g., $997 - $1500"
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessModel" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Modelo de negócio</Label>
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

              <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-200 mt-6 rounded-xl py-5 font-bold text-base" disabled={loading}>
                {loading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analisando seu produto...</>
                ) : (
                  <><Sparkles className="mr-2 h-4 w-4" />Estruturar meu produto</>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Right Column - Results */}
        <div className="xl:col-span-8 flex flex-col gap-6">

          {!result && !loading && (
            <div className="flex flex-col items-center justify-center h-[600px] border-2 border-dashed border-slate-200 rounded-2xl bg-white">
              <div className="w-16 h-16 rounded-2xl bg-violet-50 flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-violet-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-700">Seu produto começa aqui</h3>
              <p className="text-slate-400 max-w-xs text-center mt-2 text-sm leading-relaxed">
                Preencha os campos ao lado e clique em <strong>Estruturar meu produto</strong>. O sistema faz o resto.
              </p>
              <div className="mt-6 flex flex-col gap-1.5 items-center">
                {["Estrutura otimizada para conversão", "Conteúdo gerado com base em produtos que vendem", "Sistema analisando seu produto..."].map((t) => (
                  <span key={t} className="text-xs text-slate-400 flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-violet-400 inline-block" />{t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center h-[600px] border-2 border-dashed border-violet-100 rounded-2xl bg-violet-50/30">
              <div className="relative mb-6">
                <div className="w-16 h-16 rounded-2xl bg-violet-100 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-700 animate-pulse">Sistema analisando seu produto...</h3>
              <p className="text-slate-500 text-sm mt-2">Estrutura otimizada para conversão sendo montada.</p>
            </div>
          )}

          {result && !loading && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

              {/* Toolbar */}
              <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span className="text-slate-800 font-semibold text-sm">Estrutura do produto gerada</span>
                  <span className="text-xs bg-violet-50 text-violet-600 px-2 py-0.5 rounded-full border border-violet-100 font-medium">
                    {parsedLanguage}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button onClick={handleSave} variant="outline" size="sm" className="rounded-xl shadow-sm text-xs">
                    <Save className="w-3.5 h-3.5 mr-1.5" />
                    Salvar
                  </Button>
                  <Button onClick={handleGenerateSalesPage} size="sm" className="bg-rose-600 hover:bg-rose-700 text-white shadow-md rounded-xl text-xs font-semibold">
                    <ArrowRight className="w-3.5 h-3.5 mr-1.5" />
                    Gerar página de vendas
                  </Button>
                </div>
              </div>

              {/* Core Concept */}
              <Card className="border border-emerald-200 shadow-sm bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="w-4 h-4 text-emerald-600" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Conceito central</span>
                  </div>
                  <p className="text-emerald-900 leading-relaxed mb-5 font-medium">{result.concept}</p>
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-emerald-600" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Estrutura da oferta</span>
                  </div>
                  <p className="text-emerald-900 leading-relaxed font-bold">{result.offerStructure}</p>
                  <p className="text-[11px] text-emerald-600 mt-3 italic">✦ Estrutura otimizada para conversão</p>
                </CardContent>
              </Card>

              {/* Modules */}
              <Card className="border border-slate-200 shadow-md rounded-2xl overflow-hidden">
                <CardHeader className="pb-3 border-b bg-slate-900">
                  <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-slate-400" />
                    Módulos do produto
                  </CardTitle>
                  <CardDescription className="text-slate-400 text-xs">Conteúdo gerado com base em produtos que vendem</CardDescription>
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

              {/* Bonuses + Strategy */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border border-amber-200 shadow-sm rounded-2xl overflow-hidden">
                  <CardHeader className="pb-3 bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-4">
                    <CardTitle className="text-white text-base font-bold flex items-center gap-2">
                      🔥 Bônus que aumentam o valor do seu produto
                    </CardTitle>
                    <CardDescription className="text-amber-100 text-xs">Adicione e regenere bônus irresistíveis</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-4">
                    {dynamicBonuses.map((bonus, i) => (
                      <div key={i} className="bg-gradient-to-r from-amber-50 to-orange-50 p-3.5 rounded-xl border border-amber-200 shadow-sm">
                        <div className="flex items-start gap-2.5">
                          <span className="text-amber-500 mt-0.5 shrink-0 text-base">🎁</span>
                          <span className="text-sm font-semibold text-amber-900 leading-snug">{bonus}</span>
                        </div>
                      </div>
                    ))}
                    <Button
                      type="button"
                      className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl shadow-sm mt-1"
                      onClick={handleGenerateBonuses}
                      disabled={bonusesLoading}
                    >
                      {bonusesLoading ? (
                        <><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />Gerando bônus...</>
                      ) : dynamicBonuses.length > 0 ? (
                        <><Sparkles className="mr-2 h-3.5 w-3.5" />Gerar novos bônus</>
                      ) : (
                        <><Sparkles className="mr-2 h-3.5 w-3.5" />Gerar bônus</>
                      )}
                    </Button>
                  </CardContent>
                </Card>
                <div className="space-y-6">
                  <Card className="border-none shadow-sm border-t-4 border-t-blue-500">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-bold uppercase text-slate-500 tracking-wider flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-blue-500" />Pricing Strategy
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-700 text-sm leading-relaxed">{result.pricingStrategy}</p>
                    </CardContent>
                  </Card>
                  <Card className="border-none shadow-sm border-t-4 border-t-violet-500">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-bold uppercase text-slate-500 tracking-wider flex items-center gap-2">
                        <Zap className="w-4 h-4 text-violet-500" />Unique Mechanism
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-700 leading-relaxed font-semibold text-sm">{result.uniqueSellingMechanism}</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Delivery Format */}
              <Card className="border border-slate-700 shadow-sm bg-slate-900 text-white rounded-2xl">
                <CardContent className="p-5 flex gap-4 items-center">
                  <div className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center shrink-0">
                    <DownloadCloud className="w-5 h-5 text-slate-300" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">Formato de entrega recomendado</p>
                    <p className="text-slate-200 text-sm font-medium">{result.deliveryFormat}</p>
                  </div>
                </CardContent>
              </Card>

              {/* ── FORMATOS ADICIONAIS ── */}
              <Card className="border border-cyan-200 shadow-md rounded-2xl overflow-hidden">
                <CardHeader className="pb-3 border-b bg-gradient-to-r from-cyan-600 to-teal-600 px-6 py-5">
                  <CardTitle className="text-white text-base font-bold">
                    💰 Transforme isso em um produto premium
                  </CardTitle>
                  <CardDescription className="text-cyan-100 text-xs mt-0.5">
                    Combine esses materiais e aumente o valor do seu produto em até 5x
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-5 space-y-4">
                  <Button
                    onClick={handleGenerateFormats}
                    disabled={formatsLoading}
                    className="w-full bg-cyan-600 hover:bg-cyan-700 text-white shadow-md rounded-xl font-semibold"
                  >
                    {formatsLoading ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Gerando formatos...</>
                    ) : (
                      <><Sparkles className="mr-2 h-4 w-4" />Gerar formatos complementares</>
                    )}
                  </Button>

                  {complementaryFormats.length > 0 && (
                    <div className="space-y-2">
                      {complementaryFormats.map((fmt, i) => (
                        <div key={i} className="rounded-xl border border-cyan-100 overflow-hidden">
                          <div className="flex items-center justify-between p-3 bg-cyan-50">
                            <div className="flex-1 min-w-0">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-500">{fmt.type}</span>
                              <p className="font-semibold text-cyan-900 text-sm mt-0.5 truncate">{fmt.title}</p>
                            </div>
                            <div className="flex items-center gap-2 ml-3 shrink-0">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs h-7 border-cyan-200 hover:bg-white text-cyan-700"
                                onClick={() => setExpandedFormatIndex(expandedFormatIndex === i ? null : i)}
                              >
                                {expandedFormatIndex === i ? "Fechar" : "Visualizar"}
                              </Button>
                              <Button
                                size="sm"
                                className="text-xs h-7 bg-cyan-600 hover:bg-cyan-700 text-white"
                                onClick={() => handleDownloadFormatPDF(fmt)}
                              >
                                <FileDown className="w-3 h-3 mr-1" />
                                Baixar
                              </Button>
                            </div>
                          </div>
                          {expandedFormatIndex === i && (
                            <div className="p-4 bg-white border-t border-cyan-100 space-y-3">
                              <p className="text-xs text-slate-500 leading-relaxed">{fmt.description}</p>
                              <div className="space-y-1.5">
                                {getFormatItems(fmt.type).map((item, j) => (
                                  <div key={j} className="flex items-center gap-2 py-1.5 px-3 rounded-lg bg-slate-50 border border-slate-100 text-sm text-slate-600">
                                    {item}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* ── GERAR E-BOOK ── */}
              <Card className="border border-violet-200 shadow-md rounded-2xl overflow-hidden">
                <CardHeader className="pb-3 border-b bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-5">
                  <CardTitle className="text-white text-base font-bold flex items-center gap-2">
                    <BookOpen className="w-5 h-5 opacity-80" />
                    Seu produto está sendo criado automaticamente
                  </CardTitle>
                  <CardDescription className="text-violet-200 text-xs mt-0.5">
                    E-book completo com capa, capítulos, CTA e pronto para vender
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-5 space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Número de páginas</Label>
                    <div className="flex gap-2 flex-wrap">
                      {[10, 20, 30, 60].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setEbookPageCount(n)}
                          className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                            ebookPageCount === n
                              ? "bg-violet-600 text-white border-violet-600"
                              : "bg-white text-slate-600 border-slate-200 hover:border-violet-300"
                          }`}
                        >
                          {n} págs
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={handleGenerateEbook}
                    disabled={ebookLoading}
                    className="w-full bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-200 rounded-xl py-5 font-bold text-base"
                  >
                    {ebookLoading ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Criando seu produto...</>
                    ) : (
                      <><Sparkles className="mr-2 h-4 w-4" />Gerar meu e-book agora</>
                    )}
                  </Button>

                  {editableEbook && (
                    <div className="mt-2 space-y-4 animate-in fade-in duration-300">

                      {/* Chapter images button */}
                      <Button
                        onClick={handleGenerateChapterImages}
                        disabled={chapterImagesLoading}
                        variant="outline"
                        className="w-full border-violet-300 hover:bg-violet-50 text-violet-700 font-semibold rounded-xl"
                      >
                        {chapterImagesLoading ? (
                          <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Gerando imagens dos capítulos...</>
                        ) : chapterImages.filter(Boolean).length > 0 ? (
                          <><ImageIcon className="mr-2 h-4 w-4" />🖼 {chapterImages.filter(Boolean).length} imagens geradas — regenerar</>
                        ) : (
                          <><ImageIcon className="mr-2 h-4 w-4" />🖼 Gerar imagens para os capítulos (IA)</>
                        )}
                      </Button>

                      {chapterImages.filter(Boolean).length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {chapterImages.filter(Boolean).map((img, i) => (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              key={i}
                              src={`data:image/png;base64,${img}`}
                              alt={`Capítulo ${i + 1}`}
                              className="w-20 h-14 object-cover rounded-lg border border-violet-200 shadow-sm"
                            />
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-violet-700">✏️ Edite se quiser, ou apenas baixe e venda</p>
                      </div>

                      {/* Editable title + subtitle */}
                      <div className="p-4 bg-violet-50 border border-violet-100 rounded-xl space-y-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-violet-500">Título</label>
                          <Input
                            value={editableEbook.title}
                            onChange={(e) => updateEbookField("title", e.target.value)}
                            className="font-bold text-violet-900 border-violet-200 bg-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-violet-500">Subtítulo</label>
                          <Input
                            value={editableEbook.subtitle}
                            onChange={(e) => updateEbookField("subtitle", e.target.value)}
                            className="text-violet-700 border-violet-200 bg-white text-sm"
                          />
                        </div>
                      </div>

                      {/* Editable chapters */}
                      <div className="space-y-2">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Capítulos</p>
                        {editableEbook.chapters.map((ch, i) => (
                          <div key={i} className="border border-slate-200 rounded-xl overflow-hidden">
                            <button
                              type="button"
                              className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
                              onClick={() => setExpandedChapter(expandedChapter === i ? null : i)}
                            >
                              <span className="text-sm font-semibold text-slate-700 truncate">{ch.title || `Capítulo ${i + 1}`}</span>
                              <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 ml-2 transition-transform ${expandedChapter === i ? "rotate-180" : ""}`} />
                            </button>
                            {expandedChapter === i && (
                              <div className="px-4 pb-4 pt-3 space-y-3 bg-white">
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Título do capítulo</label>
                                  <Input
                                    value={ch.title}
                                    onChange={(e) => updateChapter(i, "title", e.target.value)}
                                    className="text-sm"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Conteúdo</label>
                                  <Textarea
                                    value={ch.content}
                                    onChange={(e) => updateChapter(i, "content", e.target.value)}
                                    className="min-h-[180px] text-sm leading-relaxed"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Image upload */}
                      <div className="space-y-2">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Imagens do e-book</p>
                        <label className="flex items-center gap-2 cursor-pointer border border-dashed border-violet-300 rounded-xl px-4 py-3 hover:bg-violet-50 transition-colors text-sm text-violet-600 font-medium">
                          <ImageIcon className="w-4 h-4" />
                          Adicionar imagem
                          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                        </label>
                        {uploadedImages.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {uploadedImages.map((img, i) => (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img
                                key={i}
                                src={`data:${img.mimeType};base64,${img.base64}`}
                                alt={img.name}
                                className="w-16 h-16 object-cover rounded-lg border border-slate-200 shadow-sm"
                              />
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Generate cover */}
                      <Button
                        onClick={handleGenerateCover}
                        disabled={coverLoading}
                        variant="outline"
                        className="w-full border-violet-200 hover:bg-violet-50 text-violet-700"
                      >
                        {coverLoading ? (
                          <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Gerando capa...</>
                        ) : (
                          <><ImageIcon className="mr-2 h-4 w-4" />Gerar capa com IA</>
                        )}
                      </Button>

                      {coverImageBase64 && (
                        <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={`data:image/png;base64,${coverImageBase64}`}
                            alt="Capa do e-book"
                            className="w-full object-cover max-h-72"
                          />
                        </div>
                      )}

                      {/* Download PDF */}
                      <Button
                        onClick={handleDownloadPDF}
                        disabled={pdfLoading}
                        className="w-full bg-violet-700 hover:bg-violet-800 text-white shadow-lg shadow-violet-200 rounded-xl py-5 font-bold text-base"
                      >
                        {pdfLoading ? (
                          <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Gerando PDF...</>
                        ) : (
                          <>📥 Baixar meu produto pronto</>
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* ── GANCHOS VIRAIS ── */}
              <Card className="border border-rose-200 shadow-md rounded-2xl overflow-hidden">
                <CardHeader className="pb-3 border-b bg-gradient-to-r from-rose-600 to-pink-600 px-6 py-5">
                  <CardTitle className="text-white text-base font-bold flex items-center gap-2">
                    🚀 Ideias prontas para vender
                  </CardTitle>
                  <CardDescription className="text-rose-100 text-xs mt-0.5">
                    Nomes, headlines, ganchos e promessas de alto impacto para o seu produto
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-5">
                  <Button
                    onClick={handleGenerateHooks}
                    disabled={hooksLoading}
                    className="w-full bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-200 rounded-xl py-5 font-bold text-base"
                  >
                    {hooksLoading ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Gerando nomes...</>
                    ) : (
                      <><Megaphone className="mr-2 h-4 w-4" />Gerar nomes que vendem</>
                    )}
                  </Button>

                  {hooksResult && (
                    <div className="mt-5 space-y-5 animate-in fade-in duration-300">
                      {[
                        { label: "Nomes Poderosos", items: hooksResult.names, color: "bg-violet-50 text-violet-800 border-violet-100" },
                        { label: "Headlines de Anúncio", items: hooksResult.headlines, color: "bg-blue-50 text-blue-800 border-blue-100" },
                        { label: "Ganchos Virais", items: hooksResult.hooks, color: "bg-rose-50 text-rose-800 border-rose-100" },
                        { label: "Promessas de Alto Impacto", items: hooksResult.promises, color: "bg-amber-50 text-amber-800 border-amber-100" },
                      ].map((section) => (
                        <div key={section.label}>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">{section.label}</h4>
                          <div className="space-y-1.5">
                            {section.items.map((item, i) => (
                              <div key={i} className={`text-sm px-3 py-2 rounded-lg border font-medium ${section.color}`}>
                                {i + 1}. {item}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Bottom CTA */}
              <div className="bg-gradient-to-r from-rose-600 to-pink-600 rounded-2xl p-6 flex flex-col items-center gap-4 shadow-xl shadow-rose-200 mt-2">
                <p className="text-white font-bold text-lg text-center">Seu produto está pronto. Agora venda.</p>
                <p className="text-rose-100 text-sm text-center -mt-2">Gere a página de vendas em segundos e comece a faturar hoje.</p>
                <Button
                  onClick={handleGenerateSalesPage}
                  className="bg-white hover:bg-rose-50 text-rose-700 shadow-lg text-base px-10 py-5 rounded-2xl font-black flex items-center gap-2 w-full max-w-sm justify-center"
                >
                  🚀 Gerar página de vendas agora
                </Button>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
