"use client";

import Link from "next/link";

import { SiteHeader } from "@/components/site-header";
import { useLanguage } from "@/components/language-provider";
import {
  businessTypeValues,
  getBusinessTypeLabel
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

export function LandingPage() {
  const { t, locale } = useLanguage();

  return (
    <div className="relative overflow-hidden">
      <div className="mesh animate-pulse-glow" />
      <section className="relative min-h-[100svh]">
        <SiteHeader current="home" />

        <div className="mx-auto grid min-h-[calc(100svh-88px)] w-full max-w-7xl items-center gap-12 px-5 pb-16 pt-6 sm:px-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:pb-24">
          <div className="max-w-2xl">
            <div className="eyebrow animate-fade-up">{t("landing.badge")}</div>
            <h1 className="mt-6 max-w-3xl font-display text-5xl font-semibold leading-[0.95] tracking-[-0.05em] text-balance text-white sm:text-6xl lg:text-7xl">
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

            <div className="mt-6 flex flex-wrap gap-2">
              {businessTypeValues.map((type) => (
                <span
                  key={type}
                  className="rounded-full border border-white/10 px-4 py-2 text-sm text-[var(--color-muted)]"
                >
                  {getBusinessTypeLabel(type, locale)}
                </span>
              ))}
            </div>
          </div>

          <div className="relative flex min-h-[420px] items-center justify-center lg:min-h-[560px]">
            <div className="absolute inset-x-8 top-12 h-72 rounded-full bg-[radial-gradient(circle,rgba(244,183,60,0.35),transparent_65%)] blur-2xl" />
            <div className="relative w-full max-w-[520px] rounded-[36px] border border-white/10 bg-white/[0.06] p-4 shadow-halo backdrop-blur">
              <div className="review-grid rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-5 sm:p-7">
                <div className="grid gap-5 lg:grid-cols-[0.88fr_1.12fr]">
                  <div className="rounded-[28px] bg-[var(--color-paper)] p-4 text-[var(--color-ink)]">
                    <div className="grid grid-cols-5 gap-2">
                      {Array.from({ length: 25 }).map((_, index) => (
                        <div
                          key={index}
                          className={`aspect-square rounded-sm ${
                            [0, 1, 5, 6, 12, 17, 18, 22, 24].includes(index)
                              ? "bg-[var(--color-ink)]"
                              : "bg-black/15"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="mt-4 text-sm font-semibold">
                      /r/urban-brew-cafe
                    </p>
                  </div>

                  <div className="rounded-[32px] border border-white/10 bg-[var(--color-ink)] p-5 text-white">
                    <p className="text-xs uppercase tracking-[0.24em] text-[var(--color-muted)]">
                      {t("review.headlineWithName", {
                        name: "Urban Brew Cafe"
                      })}
                    </p>
                    <div className="mt-6 space-y-4">
                      <div className="rounded-[24px] bg-[var(--color-gold)] px-5 py-4 text-[var(--color-ink)]">
                        <p className="text-lg font-semibold">
                          {t("review.positive")}
                        </p>
                        <p className="mt-1 text-sm text-black/70">
                          {t("review.publicNote")}
                        </p>
                      </div>
                      <div className="rounded-[24px] border border-white/10 px-5 py-4">
                        <p className="text-lg font-semibold">
                          {t("review.negative")}
                        </p>
                        <p className="mt-1 text-sm text-[var(--color-muted)]">
                          {t("review.privateNote")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-4 border-t border-white/10 pt-4 text-sm text-[var(--color-muted)] sm:grid-cols-3">
                <div>/r/[slug] pages</div>
                <div>Type suggestions</div>
                <div>Client analytics</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-black/10">
        <div className="mx-auto grid max-w-7xl gap-6 px-5 py-8 sm:px-8 lg:grid-cols-[0.95fr_1.05fr]">
          <h2 className="font-display text-2xl font-semibold text-white sm:text-3xl">
            {t("landing.supportTitle")}
          </h2>
          <p className="max-w-2xl text-base leading-7 text-[var(--color-muted)]">
            {t("landing.supportBody")}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="grid gap-8 border-y border-white/10 py-10 lg:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.titleKey} className="space-y-3 lg:pr-8">
              <h3 className="font-display text-2xl font-semibold text-white">
                {t(feature.titleKey)}
              </h3>
              <p className="leading-7 text-[var(--color-muted)]">
                {t(feature.bodyKey)}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-8 lg:pb-24">
        <div className="section-frame rounded-[36px] p-6 sm:p-8 lg:p-12">
          <div className="max-w-2xl">
            <div className="eyebrow">{t("landing.detailTitle")}</div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {steps.map((step) => (
              <div
                key={step.number}
                className="rounded-[28px] border border-white/10 bg-black/10 p-6"
              >
                <p className="text-sm font-semibold tracking-[0.18em] text-[var(--color-gold-soft)]">
                  {step.number}
                </p>
                <h3 className="mt-4 font-display text-2xl font-semibold text-white">
                  {t(step.titleKey)}
                </h3>
                <p className="mt-3 leading-7 text-[var(--color-muted)]">
                  {t(step.bodyKey)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col items-start justify-between gap-5 border-t border-white/10 pt-8 lg:flex-row lg:items-center">
            <div>
              <h3 className="font-display text-3xl font-semibold text-white">
                {t("landing.finalTitle")}
              </h3>
              <p className="mt-3 max-w-2xl leading-7 text-[var(--color-muted)]">
                {t("landing.finalBody")}
              </p>
            </div>
            <Link
              href="/admin"
              className="inline-flex items-center justify-center rounded-full bg-[var(--color-gold)] px-6 py-3 text-base font-semibold text-[var(--color-ink)] transition hover:translate-y-[-1px] hover:shadow-halo"
            >
              {t("landing.finalCta")}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
