import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import en from "./locales/en.json";
import vi from "./locales/vi.json";

// Language registry — keep in sync with the Layout switcher.
// `dir` flags whether the language is right-to-left so the app can mirror the
// layout (sidebar on the right, etc.) when needed.
export const SUPPORTED_LANGUAGES = [
  { code: "vi", label: "Tiếng Việt", dir: "ltr" as const },
  { code: "en", label: "English", dir: "ltr" as const },
] as const;

export type SupportedLanguageCode = (typeof SUPPORTED_LANGUAGES)[number]["code"];

const LANGUAGE_STORAGE_KEY = "i18nextLng";
const VI_DEFAULT_MIGRATION_KEY = "vibeTradingDefaultLanguageVi";
const RTL_CODES = new Set<SupportedLanguageCode>();

function migrateDefaultLanguage(): void {
  if (typeof window === "undefined") return;
  if (window.localStorage.getItem(VI_DEFAULT_MIGRATION_KEY) === "1") return;
  window.localStorage.setItem(LANGUAGE_STORAGE_KEY, "vi");
  window.localStorage.setItem(VI_DEFAULT_MIGRATION_KEY, "1");
}

export function isRtl(code: string): boolean {
  if (RTL_CODES.has(code as SupportedLanguageCode)) return true;
  // Handle regional variants: "ar-EG" → match "ar", "he-IL" → match "he" (if added).
  return [...RTL_CODES].some((rtl) => code.startsWith(rtl + "-"));
}

export function applyDocumentDirection(code: string): void {
  if (typeof document === "undefined") return;
  const dir = isRtl(code) ? "rtl" : "ltr";
  document.documentElement.setAttribute("dir", dir);
  document.documentElement.setAttribute("lang", code);
}

// Keep the <html dir/lang> attributes in sync with the active language and
// keep unsupported saved values from forcing removed languages back into the UI.
i18n.on("languageChanged", (lng) => {
  if (!SUPPORTED_LANGUAGES.some((language) => language.code === lng)) {
    void i18n.changeLanguage("vi");
  } else {
    applyDocumentDirection(lng);
  }
});

migrateDefaultLanguage();

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      vi: { translation: vi },
    },
    initAsync: false,
    // Default to Vietnamese on first visit. Only an explicit toggle persisted
    // to localStorage changes the active language.
    fallbackLng: "vi",
    supportedLngs: SUPPORTED_LANGUAGES.map((l) => l.code),
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage"],
      caches: ["localStorage"],
      lookupLocalStorage: "i18nextLng",
    },
  });

applyDocumentDirection(i18n.language || "vi");
i18n.on("initialized", () => {
  if (i18n.language) applyDocumentDirection(i18n.language);
});

export default i18n;
