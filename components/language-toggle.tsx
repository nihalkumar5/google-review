"use client";

import { useLanguage } from "@/components/language-provider";

export function LanguageToggle() {
  const { locale, setLocale, t } = useLanguage();

  return (
    <div className="inline-flex items-center rounded-full border border-white/15 bg-white/5 p-1 text-sm text-[var(--color-muted)] backdrop-blur">
      <button
        type="button"
        onClick={() => setLocale("en")}
        className={`rounded-full px-3 py-1.5 transition ${
          locale === "en"
            ? "bg-[var(--color-gold)] text-[var(--color-ink)]"
            : "text-[var(--color-muted)] hover:text-white"
        }`}
      >
        {t("common.english")}
      </button>
      <button
        type="button"
        onClick={() => setLocale("hi")}
        className={`rounded-full px-3 py-1.5 transition ${
          locale === "hi"
            ? "bg-[var(--color-gold)] text-[var(--color-ink)]"
            : "text-[var(--color-muted)] hover:text-white"
        }`}
      >
        {t("common.hindi")}
      </button>
    </div>
  );
}
