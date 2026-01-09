import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supportedLanguages, type SupportedLanguage } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Check, Globe } from "lucide-react";
import { useTranslation } from "react-i18next";

interface LanguageSwitcherProps {
  collapsed?: boolean;
}

export function LanguageSwitcher({ collapsed = false }: LanguageSwitcherProps) {
  const { i18n, t } = useTranslation("settings");
  const currentCode = (i18n.language || "en").split(
    "-"
  )[0] as SupportedLanguage;
  const currentLanguage =
    supportedLanguages.find((l) => l.code === currentCode) ??
    supportedLanguages[0];

  const handleChange = (code: SupportedLanguage) => {
    if (code === currentCode) return;
    i18n.changeLanguage(code);
    if (typeof document !== "undefined") {
      document.documentElement.lang = code;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size={collapsed ? "icon" : "sm"}
          className={cn(
            "w-full gap-2 rounded-lg border border-transparent",
            "hover:border-primary/40 hover:bg-primary",
            "text-xs font-medium tracking-wider uppercase",
            collapsed ? "justify-center px-2" : "justify-start px-3"
          )}
          aria-label={t("language")}
        >
          <Globe className="h-4 w-4 text-muted-foreground" />
          {!collapsed && (
            <>
              <span className="font-semibold">{currentCode.toUpperCase()}</span>
              <span className="text-[11px] text-muted-foreground tracking-normal normal-case">
                {currentLanguage.nativeName}
              </span>
            </>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-48">
        <DropdownMenuLabel className="text-xs uppercase tracking-widest text-muted-foreground">
          {t("language")}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {supportedLanguages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            className="flex cursor-pointer items-center justify-between gap-2 text-sm"
            onClick={() => handleChange(lang.code)}
          >
            <div className="flex items-center gap-2">
              <span className="font-medium">{lang.name}</span>
              <span className="text-xs text-muted-foreground">
                ({lang.nativeName})
              </span>
            </div>
            {currentCode === lang.code && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
