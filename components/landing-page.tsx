"use client";

import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

import { SiteHeader } from "@/components/site-header";
import { useLanguage } from "@/components/language-provider";
import { getBusinessTheme } from "@/lib/business-theme";
import { businessTypeValues, getBusinessTypeLabel } from "@/lib/business-types";

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
  const heroTheme = getBusinessTheme("cafe");
  const heroThemeStyle = {
    "--theme-primary": heroTheme.primary,
    "--theme-highlight": heroTheme.highlight,
    "--theme-glow": heroTheme.glow
  } as CSSProperties;
  const heroProofs = [
    t("landing.heroProofOne"),
    t("landing.heroProofTwo"),
    t("landing.heroProofThree")
  ];

  return (
    <div className="relative overflow-hidden">
      <div className="mesh animate-pulse-glow" />
      <section className="relative min-h-[100svh]" style={heroThemeStyle}>
        <SiteHeader current="home" />

        <div className="mx-auto grid min-h-[calc(100svh-112px)] w-full max-w-7xl items-center gap-12 px-5 pb-14 pt-6 sm:px-8 lg:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)] lg:gap-16 lg:pb-16">
          <div className="max-w-[36rem]">
            <div className="eyebrow animate-fade-up">{t("landing.badge")}</div>
            <h1 className="mt-6 max-w-[10ch] font-display text-5xl font-semibold leading-[0.92] tracking-[-0.065em] text-white sm:text-6xl lg:text-[5rem]">
              {t("landing.headline")}
            </h1>
            <p className="mt-6 max-w-[33rem] text-base leading-8 text-[var(--color-muted)] sm:text-lg">
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

            <div className="mt-8 flex flex-wrap gap-2.5">
              {heroProofs.map((proof) => (
                <div
                  key={proof}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white/78 backdrop-blur"
                >
                  {proof}
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap gap-2">
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
                    className="rounded-full border bg-white/[0.02] px-4 py-2 text-sm"
                  >
                    {getBusinessTypeLabel(type, locale)}
                  </span>
                );
              })}
            </div>
          </div>

          <div className="relative">
            <div className="theme-orb right-[-2rem] top-14 h-52 w-52 bg-[var(--theme-glow)]" />
            <div className="glass-pod theme-shell relative overflow-hidden rounded-[42px] p-3 sm:p-4">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(244,183,60,0.16),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(91,197,139,0.12),transparent_28%)]" />
              <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-black/25">
                <Image
                  src="/hero-review-scene.svg"
                  alt="Minimal illustration of a QR stand, a phone review flow, and a warm local business setup."
                  width={1600}
                  height={1200}
                  priority
                  className="h-auto w-full"
                />

                <div className="pointer-events-none absolute left-4 top-4 rounded-full border border-white/12 bg-black/38 px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-white/68 backdrop-blur sm:left-6 sm:top-6">
                  {t("landing.heroPanelEyebrow")}
                </div>

                <div className="absolute inset-x-3 bottom-3 rounded-[28px] border border-white/12 bg-[rgba(10,10,10,0.58)] p-5 backdrop-blur-xl sm:inset-x-6 sm:bottom-6 sm:p-6">
                  <p className="text-xs uppercase tracking-[0.22em] text-[var(--theme-highlight)]">
                    /r/urban-brew-cafe
                  </p>
                  <h2 className="mt-3 max-w-[18ch] font-display text-2xl font-semibold leading-[1.02] tracking-[-0.045em] text-white sm:text-[2rem]">
                    {t("landing.heroPanelTitle")}
                  </h2>
                  <p className="mt-3 max-w-[34rem] text-sm leading-6 text-white/72 sm:text-base">
                    {t("landing.heroPanelBody")}
                  </p>
                </div>
              </div>
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
