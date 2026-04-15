"use client";

import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { useLanguage, LANGUAGES, type LangCode } from "@/lib/i18n";
import { useCurrency, CURRENCIES, type CurrencyCode } from "@/lib/currency";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { logout } from "@/app/(auth)/actions";
import { Globe, DollarSign, ChevronDown } from "lucide-react";

interface NavbarControlsProps {
  userEmail?: string;
  userInitial: string;
  avatarUrl?: string;
}

export function NavbarControls({ userEmail, userInitial, avatarUrl }: NavbarControlsProps) {
  const { lang, setLang, t } = useLanguage();
  const { currency, setCurrency } = useCurrency();

  const currentLang = LANGUAGES.find((l) => l.code === lang);
  const currentCurrency = CURRENCIES.find((c) => c.code === currency);

  return (
    <div className="flex items-center gap-1">
      {/* Theme toggle */}
      <ThemeToggle />

      {/* Language picker */}
      <DropdownMenu>
        <DropdownMenuTrigger className="outline-none">
          <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-slate-400 hover:text-foreground hover:bg-white/10 dark:hover:bg-white/10 transition text-xs cursor-pointer">
            <span className="text-base leading-none">{currentLang?.flag}</span>
            <span className="hidden sm:inline font-medium">{currentLang?.code.toUpperCase()}</span>
            <ChevronDown className="w-3 h-3" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {t("common.language")}
          </div>
          <DropdownMenuSeparator />
          {LANGUAGES.map((l) => (
            <DropdownMenuItem
              key={l.code}
              className={`cursor-pointer flex items-center gap-2 ${lang === l.code ? "text-[#00d4aa] font-medium" : ""}`}
              onClick={() => setLang(l.code as LangCode)}
            >
              <span className="text-base">{l.flag}</span>
              <span className="text-sm">{l.label}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Currency picker */}
      <DropdownMenu>
        <DropdownMenuTrigger className="outline-none">
          <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-slate-400 hover:text-foreground hover:bg-white/10 dark:hover:bg-white/10 transition text-xs cursor-pointer">
            <span className="text-base leading-none">{currentCurrency?.flag}</span>
            <span className="hidden sm:inline font-medium">{currentCurrency?.code}</span>
            <ChevronDown className="w-3 h-3" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {t("common.currency")}
          </div>
          <DropdownMenuSeparator />
          {CURRENCIES.map((c) => (
            <DropdownMenuItem
              key={c.code}
              className={`cursor-pointer flex items-center gap-2 ${currency === c.code ? "text-[#00d4aa] font-medium" : ""}`}
              onClick={() => setCurrency(c.code as CurrencyCode)}
            >
              <span className="text-base">{c.flag}</span>
              <span className="text-sm">{c.symbol} — {c.label}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Separator */}
      <div className="w-px h-5 bg-border mx-1" />

      {/* User menu */}
      <DropdownMenu>
        <DropdownMenuTrigger className="outline-none">
          <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-transparent hover:ring-[#00d4aa]/40 transition">
            <AvatarImage src={avatarUrl || ""} />
            <AvatarFallback className="btn-cta text-white text-xs font-bold">
              {userInitial}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          {userEmail && (
            <>
              <div className="px-3 py-2">
                <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
              </div>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem className="cursor-pointer">{t("navbar.profile")}</DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer">{t("navbar.settings")}</DropdownMenuItem>
          <DropdownMenuSeparator />
          <form action={logout}>
            <DropdownMenuItem
              render={
                <button type="submit" className="w-full text-left text-red-500 cursor-pointer" />
              }
            >
              {t("navbar.logout")}
            </DropdownMenuItem>
          </form>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
