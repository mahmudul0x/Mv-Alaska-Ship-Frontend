import { createContext, useCallback, useContext, useMemo, useState } from "react";

import { STRINGS, type StringKey } from "./strings";

export type Lang = "en" | "bn";

const STORAGE_KEY = "mv-staff-lang";

/** The chosen language, remembered per browser.
 *
 *  Read defensively: a private window or a browser set to block site data
 *  throws on access rather than returning null, and a dashboard that refuses
 *  to render because it could not read a preference would be absurd. */
function storedLang(): Lang {
  try {
    return localStorage.getItem(STORAGE_KEY) === "bn" ? "bn" : "en";
  } catch {
    return "en";
  }
}

type Ctx = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: StringKey, vars?: Record<string, string | number>) => string;
};

const LanguageContext = createContext<Ctx | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(storedLang);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // A preference that cannot be saved is still worth honouring for this
      // session; there is nothing useful to tell the user about it.
    }
  }, []);

  const t = useCallback<Ctx["t"]>(
    (key, vars) => {
      const entry = STRINGS[key];
      // Falls back to English, then to the key itself. A missing translation
      // should leave a readable dashboard, never an empty button — and the key
      // showing through is how an untranslated string gets noticed.
      // Annotated: STRINGS is `as const`, so without this the inferred type is
      // the one literal that happened to be read first.
      let text: string = entry ? (entry[lang] ?? entry.en) : key;
      if (vars) {
        for (const [name, value] of Object.entries(vars)) {
          text = text.replaceAll(`{${name}}`, String(value));
        }
      }
      return text;
    },
    [lang],
  );

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

/** Throws outside the provider on purpose: a component rendering raw keys
 *  because it sits outside the tree is a bug worth failing loudly for. */
export function useLanguage(): Ctx {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside <LanguageProvider>");
  return ctx;
}

/** Just the translate function, for the many components that need nothing else. */
export function useT() {
  return useLanguage().t;
}
