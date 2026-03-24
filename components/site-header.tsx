"use client";

import Link from "next/link";

import { LanguageToggle } from "@/components/language-toggle";
import { useLanguage } from "@/components/language-provider";

type SiteHeaderProps = {
  current?: "home" | "admin";
};

export function SiteHeader({ current }: SiteHeaderProps) {
  const { t } = useLanguage();

  return (
    <header className="relative z-20">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <Link
          href="/"
          className="font-display text-lg font-semibold tracking-[0.2em] text-white"
        >
          {t("common.appName")}
        </Link>

        <div className="flex items-center gap-3">
          <nav className="hidden items-center gap-2 text-sm text-[var(--color-muted)] sm:flex">
            <Link
              href="/"
              className={`rounded-full px-4 py-2 transition ${
                current === "home" ? "bg-white/10 text-white" : "hover:text-white"
              }`}
            >
              {t("common.home")}
            </Link>
            <Link
              href="/admin"
              className={`rounded-full px-4 py-2 transition ${
                current === "admin"
                  ? "bg-white/10 text-white"
                  : "hover:text-white"
              }`}
            >
              {t("common.admin")}
            </Link>
          </nav>
          <LanguageToggle />
        </div>
      </div>
    </header>
  );
}
