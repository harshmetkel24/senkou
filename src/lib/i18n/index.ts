import i18n, { type Resource } from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import enAnime from "./locales/en/anime.json";
import enAuth from "./locales/en/auth.json";
import enCharacters from "./locales/en/characters.json";
import enCommon from "./locales/en/common.json";
import enErrors from "./locales/en/errors.json";
import enHome from "./locales/en/home.json";
import enManga from "./locales/en/manga.json";
import enNav from "./locales/en/nav.json";
import enSearch from "./locales/en/search.json";
import enSettings from "./locales/en/settings.json";
import enWatchlist from "./locales/en/watchlist.json";

import jaAnime from "./locales/ja/anime.json";
import jaAuth from "./locales/ja/auth.json";
import jaCharacters from "./locales/ja/characters.json";
import jaCommon from "./locales/ja/common.json";
import jaErrors from "./locales/ja/errors.json";
import jaHome from "./locales/ja/home.json";
import jaManga from "./locales/ja/manga.json";
import jaNav from "./locales/ja/nav.json";
import jaSearch from "./locales/ja/search.json";
import jaSettings from "./locales/ja/settings.json";
import jaWatchlist from "./locales/ja/watchlist.json";

export const supportedLanguages = [
  { code: "en" as const, name: "English", nativeName: "English" },
  { code: "ja" as const, name: "Japanese", nativeName: "日本語" },
];

export type SupportedLanguage = (typeof supportedLanguages)[number]["code"];

export const i18nNamespaces = [
  "common",
  "nav",
  "auth",
  "home",
  "anime",
  "manga",
  "characters",
  "watchlist",
  "search",
  "errors",
  "settings",
] as const;

export type I18nNamespace = (typeof i18nNamespaces)[number];

const resources: Resource = {
  en: {
    common: enCommon,
    nav: enNav,
    auth: enAuth,
    home: enHome,
    anime: enAnime,
    manga: enManga,
    characters: enCharacters,
    watchlist: enWatchlist,
    search: enSearch,
    errors: enErrors,
    settings: enSettings,
  },
  ja: {
    common: jaCommon,
    nav: jaNav,
    auth: jaAuth,
    home: jaHome,
    anime: jaAnime,
    manga: jaManga,
    characters: jaCharacters,
    watchlist: jaWatchlist,
    search: jaSearch,
    errors: jaErrors,
    settings: jaSettings,
  },
};

const isBrowser = typeof window !== "undefined";

i18n.use(initReactI18next);

if (isBrowser) {
  i18n.use(LanguageDetector);
}

i18n.init({
  resources,
  fallbackLng: "en",
  supportedLngs: supportedLanguages.map((l) => l.code),
  ns: i18nNamespaces as unknown as string[],
  defaultNS: "common",
  load: "languageOnly",
  interpolation: {
    escapeValue: false,
  },
  detection: isBrowser
    ? {
        order: ["localStorage", "navigator", "htmlTag"],
        caches: ["localStorage"],
        lookupLocalStorage: "senkou-language",
      }
    : undefined,
  react: {
    useSuspense: false,
  },
});

export default i18n;
