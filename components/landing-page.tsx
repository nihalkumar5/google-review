"use client";

import Link from "next/link";
import type { CSSProperties } from "react";

import { SiteHeader } from "@/components/site-header";
import { useLanguage } from "@/components/language-provider";
import { getBusinessTheme } from "@/lib/business-theme";
import {
  businessTypeValues,
  getBusinessTypeLabel,
  getReviewSuggestions
} from "@/lib/business-types";

const features = [
  {
    titleKey: "landing.featureOneTitle",
    bodyKey: "landing.featureOneBody"
  },
  {
    titleKey: "landing.featureTwoTitle",
    bodyKey: "landing.featureTwoBody"
  },
  {
    titleKey: "landing.featureThreeTitle",
    bodyKey: "landing.featureThreeBody"
  }
];

const steps = [
  {
    number: "01",
    titleKey: "landing.stepOneTitle",
    bodyKey: "landing.stepOneBody"
  },
  {
    number: "02",
    titleKey: "landing.stepTwoTitle",
    bodyKey: "landing.stepTwoBody"
  },
  {
    number: "03",
    titleKey: "landing.stepThreeTitle",
    bodyKey: "landing.stepThreeBody"
  }
];

const previewTypes = ["cafe", "salon", "clinic"] as const;

export function LandingPage() {
  const { t, locale } = useLanguage();
  const heroTheme = getBusinessTheme("cafe");
  const heroThemeStyle = {
    "--theme-primary": heroTheme.primary,
    "--theme-highlight": heroTheme.highlight,
    "--theme-glow": heroTheme.glow
  } as CSSProperties;
  const previewSuggestions = getReviewSuggestions("cafe", locale);

  return (
    <div className="relative overflow-hidden">
      <div className="mesh animate-pulse-glow" />
      <section className="relative min-h-[100svh]" style={heroThemeStyle}>
        <SiteHeader current="home" />

        <div className="mx-auto grid min-h-[calc(100svh-112px)] w-full max-w-7xl items-center gap-12 px-5 pb-16 pt-4 sm:px-8 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] lg:pb-20">
          <div className="max-w-xl">
            <div className="eyebrow animate-fade-up">{t("landing.badge")}</div>
            <h1 className="mt-6 font-display text-5xl font-semibold leading-[0.92] tracking-[-0.06em] text-white sm:text-6xl lg:text-[5.1rem]">
              {t("landing.headline")}
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-[var(--color-muted)] sm:text-lg">
              {t("landing.description")}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/admin"
                className="inline-flex items-center justify-center rounded-full bg-[var(--color-gold)] px-6 py-3 text-base font-semibold text-[var(--color-ink)] transition hover:translate-y-[-1px] hover:shadow-halo"
              >
                {t("landing.primaryCta")}
              </Link>
              <Link
                href="/r/urban-brew-cafe"
                className="inline-flex items-center justify-center rounded-full border border-white/15 px-6 py-3 text-base font-semibold text-white transition hover:border-white/30 hover:bg-white/5"
              >
                {t("landing.secondaryCta")}
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              {businessTypeValues.map((type) => {
                const theme = getBusinessTheme(type);

                return (
                  <span
                    key={type}
                    style={
                      {
                        borderColor: theme.border,
                        color: theme.secondary
                      } as CSSProperties
                    }
                    className="rounded-full border px-4 py-2 text-sm"
                  >
                    {getBusinessTypeLabel(type, locale)}
                  </span>
                );
              })}
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {features.map((feature) => (
                <div
                  key={feature.titleKey}
                  className="rounded-[24px] border border-white/10 bg-white/[0.03] px-4 py-4"
                >
                  <p className="text-sm font-semibold text-white">
                    {t(feature.titleKey)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative min-h-[540px] lg:min-h-[620px]">
            <div className="theme-orb right-[-2rem] top-10 h-48 w-48 bg-[var(--theme-glow)]" />
            <div className="glass-pod hero-grid theme-shell relative h-full rounded-[42px] p-4 sm:p-5">
              <div className="grid h-full gap-5 lg:grid-cols-[0.42fr_0.58fr]">
                <div className="float-soft flex flex-col justify-between rounded-[32px] border border-white/10 bg-black/20 p-5">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-[var(--color-muted)]">
                      /r/urban-brew-cafe
                    </p>
                    <h2 className="mt-3 font-display text-3xl font-semibold text-white">
                      QR to review in one tap
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">
                      One SaaS, multiple businesses, each with a direct conversion page.
                    </p>
                  </div>

                  <div className="rounded-[30px] bg-[var(--color-paper)] p-4 text-[var(--color-ink)]">
                    <div className="grid grid-cols-5 gap-2">
                      {Array.from({ length: 25 }).map((_, index) => (
                        <div
                          key={index}
                          className={`aspect-square rounded-sm ${
                            [0, 1, 5, 6, 12, 17, 18, 22, 24].includes(index)
                              ? "bg-[var(--color-ink)]"
                              : "bg-black/12"
                          }`}
                        />
                      ))}
                    </div>
                    <div className="mt-4 grid gap-3">
                      <div className="rounded-[20px] bg-black/5 px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.2em] text-black/45">
                          Flow
                        </p>
                        <p className="mt-1 text-sm font-semibold">
                          Scan → choose → review
                        </p>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-[20px] bg-black/5 px-4 py-3">
                          <p className="text-xs uppercase tracking-[0.2em] text-black/45">
                            Plans
                          </p>
                          <p className="mt-1 text-sm font-semibold">Basic + Pro</p>
                        </div>
                        <div className="rounded-[20px] bg-black/5 px-4 py-3">
                          <p className="text-xs uppercase tracking-[0.2em] text-black/45">
                            Output
                          </p>
                          <p className="mt-1 text-sm font-semibold">Google + WhatsApp</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col rounded-[34px] bg-[rgba(13,13,13,0.74)] p-5 text-white">
                  <div className="flex items-center justify-between gap-3">
                    <div className="eyebrow border-white/10 text-[var(--color-muted)]">
                      Urban Brew Cafe
                    </div>
                    <div className="min-w-[160px]">
                      <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
                        <span>Step 1</span>
                        <span>of 2</span>
                      </div>
                      <div className="progress-track mt-2">
                        <span style={{ width: "54%" }} />
                      </div>
                    </div>
                  </div>

                  <h2 className="mt-6 max-w-md font-display text-3xl font-semibold leading-[1.02] tracking-[-0.04em]">
                    {t("review.headlineWithName", {
                      name: "Urban Brew Cafe"
                    })}
                  </h2>
                  <p className="mt-3 max-w-md text-sm leading-6 text-[var(--color-muted)]">
                    Emotion first, then the action. Happy customers go public, unhappy ones go private.
                  </p>

                  <div className="mt-6 space-y-4">
                    <div className="decision-card rounded-[30px] bg-[var(--theme-primary)] px-5 py-5 text-[var(--color-ink)]">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-lg font-semibold">{t("review.positive")}</p>
                          <p className="mt-1 text-sm text-black/65">
                            {t("review.publicNote")}
                          </p>
                        </div>
                        <span className="rounded-full bg-black/10 px-3 py-2 text-sm font-semibold">
                          5★
                        </span>
                      </div>
                    </div>
                    <div className="decision-card rounded-[30px] border border-white/10 bg-white/[0.04] px-5 py-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-lg font-semibold">{t("review.negative")}</p>
                          <p className="mt-1 text-sm text-[var(--color-muted)]">
                            {t("review.privateNote")}
                          </p>
                        </div>
                        <span className="rounded-full border border-white/10 px-3 py-2 text-sm font-semibold text-white/80">
                          WA
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto pt-6">
                    <p className="text-xs uppercase tracking-[0.22em] text-[var(--color-muted)]">
                      {t("review.suggestionsTitle")}
                    </p>
                    <div className="quick-scroll mt-4">
                      {previewSuggestions.map((suggestion) => (
                        <div
                          key={suggestion}
                          className="min-w-[220px] rounded-[24px] border border-white/10 bg-white/[0.04] p-4"
                        >
                          <p className="text-sm leading-6 text-white/88">{suggestion}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-4 left-6 right-6 hidden gap-3 lg:flex">
              {previewTypes.map((type) => {
                const theme = getBusinessTheme(type);

                return (
                  <div
                    key={type}
                    style={
                      {
                        borderColor: theme.border,
                        color: theme.secondary,
                        background: "rgba(255,255,255,0.06)"
                      } as CSSProperties
                    }
                    className="glass-pod flex-1 rounded-[26px] px-4 py-4"
                  >
                    <p className="text-xs uppercase tracking-[0.18em] opacity-70">
                      {getBusinessTypeLabel(type, locale)}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-white">
                      {t(type === "cafe" ? "landing.featureTwoTitle" : "landing.featureOneTitle")}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-black/10">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[0.82fr_1.18fr]">
          <div>
            <h2 className="font-display text-3xl font-semibold text-white sm:text-4xl">
              {t("landing.supportTitle")}
            </h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-[var(--color-muted)]">
              {t("landing.supportBody")}
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.titleKey} className="border-t border-white/10 pt-5">
                <p className="font-display text-2xl font-semibold text-white">
                  {t(feature.titleKey)}
                </p>
                <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">
                  {t(feature.bodyKey)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-[0.88fr_1.12fr]">
          <div>
            <div className="eyebrow">{t("landing.detailTitle")}</div>
            <h2 className="mt-5 font-display text-4xl font-semibold leading-[1.02] tracking-[-0.04em] text-white">
              {t("landing.finalTitle")}
            </h2>
            <p className="mt-4 max-w-xl leading-7 text-[var(--color-muted)]">
              {t("landing.finalBody")}
            </p>
          </div>

          <div className="space-y-6">
            {steps.map((step) => (
              <div
                key={step.number}
                className="flex gap-5 border-t border-white/10 pt-5"
              >
                <div className="min-w-[68px]">
                  <span className="inline-flex rounded-full bg-white/5 px-4 py-2 text-sm font-semibold tracking-[0.18em] text-[var(--color-gold-soft)]">
                    {step.number}
                  </span>
                </div>
                <div>
                  <h3 className="font-display text-2xl font-semibold text-white">
                    {t(step.titleKey)}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">
                    {t(step.bodyKey)}
                  </p>
                </div>
              </div>
            ))}

            <div className="pt-4">
              <Link
                href="/admin"
                className="inline-flex items-center justify-center rounded-full bg-[var(--color-gold)] px-6 py-3 text-base font-semibold text-[var(--color-ink)] transition hover:translate-y-[-1px] hover:shadow-halo"
              >
                {t("landing.finalCta")}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
