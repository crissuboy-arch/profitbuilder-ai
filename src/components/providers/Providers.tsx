"use client";

import { ThemeProvider } from "next-themes";
import {
  LanguageContext,
  TRANSLATIONS,
  type LangCode,
} from "@/lib/i18n";
import {
  CurrencyContext,
  CURRENCIES,
  CURRENCY_RATES,
  type CurrencyCode,
} from "@/lib/currency";
import { Toaster } from "@/components/ui/sonner";
import { useState, useEffect, type ReactNode } from "react";

// ── Language Provider ─────────────────────────────────────────────────────────

function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LangCode>("pt");

  useEffect(() => {
    const saved = localStorage.getItem("pb-lang") as LangCode | null;
    if (saved && TRANSLATIONS[saved]) setLangState(saved);
  }, []);

  const setLang = (l: LangCode) => {
    setLangState(l);
    localStorage.setItem("pb-lang", l);
  };

  const t = (key: string): string =>
    TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS["pt"]?.[key] ?? key;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

// ── Currency Provider ─────────────────────────────────────────────────────────

function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>("BRL");

  useEffect(() => {
    const saved = localStorage.getItem("pb-currency") as CurrencyCode | null;
    if (saved && CURRENCY_RATES[saved] !== undefined) setCurrencyState(saved);
  }, []);

  const setCurrency = (c: CurrencyCode) => {
    setCurrencyState(c);
    localStorage.setItem("pb-currency", c);
  };

  const convert = (amountBRL: number) => amountBRL * CURRENCY_RATES[currency];
  const symbol   = CURRENCIES.find((c) => c.code === currency)?.symbol ?? "R$";

  const format = (amountBRL: number): string => {
    const converted = convert(amountBRL);
    return `${symbol} ${converted.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, format, convert, symbol }}>
      {children}
    </CurrencyContext.Provider>
  );
}

// ── Combined Providers ────────────────────────────────────────────────────────

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      storageKey="pb-theme"
      enableSystem={false}
    >
      <LanguageProvider>
        <CurrencyProvider>
          {children}
          <Toaster />
        </CurrencyProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
