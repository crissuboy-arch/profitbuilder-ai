"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, X, BookOpen, Loader2 } from "lucide-react";

// ── Types (mirrors actions.ts) ────────────────────────────────────────────────

type BookBlock = {
  type: "heading" | "bullet" | "paragraph";
  text: string;
};

type PlaybookChapter = {
  number:      number;
  title:       string;
  blocks:      BookBlock[];
  imageBase64: string | null;
};

type PlaybookData = {
  id:           string;
  title:        string;
  author:       string;
  genre:        string;
  cover_base64: string | null;
  chapters:     PlaybookChapter[];
  created_at:   string;
};

// ── Component ──────────────────────────────────────────────────────────────────

export default function PlaybookViewerPage() {
  const { id } = useParams<{ id: string }>();
  const [data,     setData]    = useState<PlaybookData | null>(null);
  const [loading,  setLoading] = useState(true);
  const [error,    setError]   = useState<string | null>(null);
  const [current,  setCurrent] = useState(0);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    if (!id) return;
    const supabase = createClient();
    supabase
      .from("playbooks")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data: row, error: err }) => {
        if (err || !row) {
          setError("Playbook não encontrado ou link inválido.");
        } else {
          setData(row as PlaybookData);
        }
        setLoading(false);
      });
  }, [id]);

  // ── Loading ──────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4 text-white">
        <Loader2 className="w-10 h-10 animate-spin text-purple-400" />
        <p className="text-white/50 text-sm font-mono">Carregando playbook...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4 text-white px-6 text-center">
        <BookOpen className="w-12 h-12 text-white/20" />
        <h1 className="text-xl font-bold">{error ?? "Erro desconhecido"}</h1>
        <p className="text-white/40 text-sm">Verifique o link ou tente novamente.</p>
      </div>
    );
  }

  const chapters = data.chapters;
  const ch       = chapters[current];
  const prevCh   = current > 0 ? chapters[current - 1] : null;
  const nextCh   = current < chapters.length - 1 ? chapters[current + 1] : null;

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-black text-white flex flex-col select-none">

      {/* ── Top bar ──────────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 bg-black/90 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse shrink-0" />
          <span className="text-[10px] text-white/40 font-mono uppercase tracking-widest shrink-0 hidden sm:block">
            Playbook
          </span>
          <span className="text-white/20 shrink-0 hidden sm:block">|</span>
          <span className="text-xs text-white/60 truncate max-w-[160px] sm:max-w-xs">
            {data.title}
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs text-white/40 font-mono">{current + 1}/{chapters.length}</span>
          {/* Chapter menu toggle */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => setShowMenu((v) => !v)}
            onKeyDown={(e) => { if (e.key === "Enter") setShowMenu((v) => !v); }}
            className="text-xs text-white/40 hover:text-white px-2 py-1 rounded transition cursor-pointer"
          >
            {showMenu ? <X className="w-4 h-4" /> : "≡"}
          </div>
        </div>
      </div>

      {/* ── Chapter menu (slide-in) ───────────────────────────────────────────── */}
      {showMenu && (
        <div className="fixed inset-0 z-30 flex">
          <div
            role="button"
            tabIndex={-1}
            className="flex-1 bg-black/60 backdrop-blur-sm cursor-pointer"
            onClick={() => setShowMenu(false)}
            onKeyDown={() => {}}
          />
          <div className="w-72 max-w-full bg-zinc-950 border-l border-white/10 overflow-y-auto py-4">
            <div className="px-5 mb-4">
              <p className="text-xs text-white/40 uppercase tracking-widest font-mono">Capítulos</p>
              <h2 className="text-sm font-bold text-white mt-1 truncate">{data.title}</h2>
              <p className="text-xs text-white/40 mt-0.5">por {data.author}</p>
            </div>
            <div className="space-y-0.5">
              {chapters.map((c, idx) => (
                <div
                  key={idx}
                  role="button"
                  tabIndex={0}
                  onClick={() => { setCurrent(idx); setShowMenu(false); }}
                  onKeyDown={(e) => { if (e.key === "Enter") { setCurrent(idx); setShowMenu(false); } }}
                  className={cn(
                    "w-full text-left px-5 py-3 text-sm transition cursor-pointer",
                    idx === current
                      ? "bg-purple-600/20 text-purple-300"
                      : "text-white/50 hover:text-white hover:bg-white/5"
                  )}
                >
                  <span className="text-xs font-mono text-white/30 mr-2">{idx + 1}.</span>
                  <span className="line-clamp-1">{c.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Chapter image — full width hero ──────────────────────────────────── */}
      <div className="relative w-full" style={{ height: "52vw", minHeight: 220, maxHeight: 420 }}>
        {ch.imageBase64 ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={ch.imageBase64}
              alt={ch.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/90" />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-900 via-purple-950 to-black flex items-center justify-center">
            <span className="text-white/10 font-mono text-sm uppercase tracking-widest">
              Cap. {ch.number}
            </span>
          </div>
        )}

        {/* Chapter label + title overlay */}
        <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6">
          <div className="inline-flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 bg-purple-600/80 backdrop-blur-sm text-white text-[10px] font-mono uppercase tracking-widest rounded">
              Cena {current + 1}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white drop-shadow-lg leading-tight line-clamp-2">
            {ch.title}
          </h2>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-6 sm:px-6 sm:py-8 space-y-4">
          {ch.blocks.map((block, i) => {
            if (block.type === "heading") {
              return (
                <div key={i} className="flex items-center gap-3 py-1">
                  <div className="h-px flex-1 bg-white/10" />
                  <span className="text-[10px] font-mono uppercase tracking-widest text-purple-400 px-3 shrink-0">
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
            return (
              <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl px-5 py-4">
                <p className="text-sm text-white/90 leading-relaxed">{block.text}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Navigation ───────────────────────────────────────────────────────── */}
      <div className="sticky bottom-0 z-10 flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 bg-black/90 backdrop-blur-sm border-t border-white/10">
        <div
          role="button"
          tabIndex={0}
          onClick={() => prevCh && setCurrent(current - 1)}
          onKeyDown={(e) => { if (e.key === "Enter" && prevCh) setCurrent(current - 1); }}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition",
            prevCh
              ? "text-white/70 hover:text-white hover:bg-white/10 cursor-pointer"
              : "text-white/20 cursor-default"
          )}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">{prevCh ? `Cena ${current}` : "Início"}</span>
        </div>

        {/* Progress dots */}
        <div className="flex gap-1 items-center overflow-x-auto max-w-[50vw] py-1 px-1">
          {chapters.map((_, idx) => (
            <div
              key={idx}
              role="button"
              tabIndex={0}
              onClick={() => setCurrent(idx)}
              onKeyDown={(e) => { if (e.key === "Enter") setCurrent(idx); }}
              className={cn(
                "h-1.5 rounded-full transition-all cursor-pointer shrink-0",
                idx === current ? "bg-purple-400 w-4" : "w-1.5 bg-white/20 hover:bg-white/40"
              )}
            />
          ))}
        </div>

        <div
          role="button"
          tabIndex={0}
          onClick={() => nextCh && setCurrent(current + 1)}
          onKeyDown={(e) => { if (e.key === "Enter" && nextCh) setCurrent(current + 1); }}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition",
            nextCh
              ? "text-white/70 hover:text-white hover:bg-white/10 cursor-pointer"
              : "text-white/20 cursor-default"
          )}
        >
          <span className="hidden sm:inline">{nextCh ? `Cena ${current + 2}` : "Fim"}</span>
          <ChevronRight className="h-4 w-4" />
        </div>
      </div>

      {/* ── Cover credit strip ────────────────────────────────────────────────── */}
      <div className="bg-black/90 border-t border-white/5 px-6 py-3 flex items-center justify-between">
        <p className="text-[10px] text-white/20 font-mono truncate">
          {data.title} · {data.author} · {chapters.length} cenas
        </p>
        <p className="text-[10px] text-white/15 font-mono shrink-0 ml-3">ProfitBuilder AI</p>
      </div>
    </div>
  );
}
