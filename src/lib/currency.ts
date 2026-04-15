import { createContext, useContext } from "react";

export type CurrencyCode = "BRL" | "USD" | "EUR";

export const CURRENCIES: { code: CurrencyCode; symbol: string; label: string; flag: string }[] = [
  { code: "BRL", symbol: "R$", label: "Real Brasileiro", flag: "🇧🇷" },
  { code: "USD", symbol: "$",  label: "US Dollar",       flag: "🇺🇸" },
  { code: "EUR", symbol: "€",  label: "Euro",            flag: "🇪🇺" },
];

// Static exchange rates relative to BRL (configurable)
export const CURRENCY_RATES: Record<CurrencyCode, number> = {
  BRL: 1,
  USD: 0.19,
  EUR: 0.175,
};

export interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  format: (amountBRL: number) => string;
  convert: (amountBRL: number) => number;
  symbol: string;
}

export const CurrencyContext = createContext<CurrencyContextType>({
  currency: "BRL",
  setCurrency: () => {},
  format: (n) => `R$ ${n.toFixed(2)}`,
  convert: (n) => n,
  symbol: "R$",
});

export function useCurrency() {
  return useContext(CurrencyContext);
}
