"use client";

import Link from "next/link";

import { SiteHeader } from "@/components/site-header";
import { useLanguage } from "@/components/language-provider";

export function NotFoundPage() {
  const { t } = useLanguage();

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="mesh" />
      <SiteHeader />

      <main className="mx-auto flex min-h-[calc(100svh-88px)] max-w-4xl items-center px-5 py-10 sm:px-8">
        <section className="section-frame w-full rounded-[36px] p-8 text-center sm:p-12">
          <h1 className="font-display text-4xl font-semibold text-white sm:text-5xl">
            {t("notFound.title")}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-[var(--color-muted)]">
            {t("notFound.body")}
          </p>
          <Link
            href="/"
            className="mt-8 inline-flex items-center justify-center rounded-full bg-[var(--color-gold)] px-6 py-3 text-base font-semibold text-[var(--color-ink)] transition hover:translate-y-[-1px] hover:shadow-halo"
          >
            {t("notFound.cta")}
          </Link>
        </section>
      </main>
    </div>
  );
}
