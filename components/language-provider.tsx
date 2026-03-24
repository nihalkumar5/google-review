"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode
} from "react";

import { localeOptions, messages, type Locale } from "@/lib/translations";

type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, values?: Record<string, string | number>) => string;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(
  undefined
);

function resolveMessage(
  locale: Locale,
  key: string,
  values?: Record<string, string | number>
) {
  let value: unknown = messages[locale];

  for (const part of key.split(".")) {
    if (!value || typeof value !== "object" || !(part in value)) {
      return key;
    }

    value = (value as Record<string, unknown>)[part];
  }

  if (typeof value !== "string") {
    return key;
  }

  if (!values) {
    return value;
  }

  return Object.entries(values).reduce(
    (resolved, [token, tokenValue]) =>
      resolved.replaceAll(`{{${token}}}`, String(tokenValue)),
    value
  );
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("en");

  useEffect(() => {
    const savedLocale = window.localStorage.getItem("smart-review-locale");

    if (
      savedLocale &&
      localeOptions.includes(savedLocale as Locale)
    ) {
      setLocale(savedLocale as Locale);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("smart-review-locale", locale);
  }, [locale]);

  const value: LanguageContextValue = {
    locale,
    setLocale,
    t: (key: string, values?: Record<string, string | number>) =>
      resolveMessage(locale, key, values)
  };

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }

  return context;
}
