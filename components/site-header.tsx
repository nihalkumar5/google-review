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
      <div className="mx-auto w-full max-w-7xl px-5 py-5 sm:px-8">
        <div className="glass-pod flex items-center justify-between rounded-full px-4 py-3 sm:px-5">
          <Link
            href="/"
            className="font-display text-lg font-semibold tracking-[0.18em] text-white"
          >
            {t("common.appName")}
          </Link>

          <div className="flex items-center gap-3">
            <nav className="hidden items-center gap-2 text-sm text-[var(--color-muted)] sm:flex">
              <Link
                href="/"
                className={`rounded-full px-4 py-2 transition ${
                  current === "home"
                    ? "bg-white/12 text-white"
                    : "hover:bg-white/5 hover:text-white"
                }`}
              >
                {t("common.home")}
              </Link>
              <Link
                href="/admin"
                className={`rounded-full px-4 py-2 transition ${
                  current === "admin"
                    ? "bg-white/12 text-white"
                    : "hover:bg-white/5 hover:text-white"
                }`}
              >
                {t("common.admin")}
              </Link>
            </nav>
            <LanguageToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
