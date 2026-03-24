"use client";

import { useState, type CSSProperties } from "react";

import { BusinessVisualCard } from "@/components/business-visual-card";
import { SiteHeader } from "@/components/site-header";
import { useLanguage } from "@/components/language-provider";
import { getBusinessTheme } from "@/lib/business-theme";
import { getVisualShowcaseTitle } from "@/lib/business-visuals";
import {
  getBusinessTypeLabel,
  getPhotoSuggestions,
  getReviewSuggestions
} from "@/lib/business-types";
import type { Business, Sentiment } from "@/types/business";

type ReviewFlowProps = {
  business: Business;
};

type PositiveStep = "choice" | "photo";

export function ReviewFlow({ business }: ReviewFlowProps) {
  const { t, locale } = useLanguage();
  const [copiedSuggestion, setCopiedSuggestion] = useState("");
  const [redirecting, setRedirecting] = useState<Sentiment | null>(null);
  const [positiveStep, setPositiveStep] = useState<PositiveStep>("choice");

  const typeLabel = getBusinessTypeLabel(business.type, locale);
  const suggestions = getReviewSuggestions(business.type, locale);
  const photoSuggestions = getPhotoSuggestions(business.type, locale);
  const showcaseTitle = getVisualShowcaseTitle(business.type, locale);
  const isPro = business.plan === "pro";
  const showChoiceStep = positiveStep === "choice";
  const currentStep = showChoiceStep ? 1 : 2;
  const totalSteps = 2;
  const planLabel = t(business.plan === "pro" ? "common.pro" : "common.basic");
  const theme = getBusinessTheme(business.type);
  const themeStyle = {
    "--theme-primary": theme.primary,
    "--theme-highlight": theme.highlight,
    "--theme-glow": theme.glow
  } as CSSProperties;

  async function handleCopy(suggestion: string) {
    await navigator.clipboard.writeText(suggestion);
    setCopiedSuggestion(suggestion);
    window.setTimeout(() => setCopiedSuggestion(""), 1400);
  }

  function handleRedirect(sentiment: Sentiment) {
    setRedirecting(sentiment);
    window.setTimeout(() => {
      window.location.assign(`/go/${business.slug}/${sentiment}`);
    }, 850);
  }

  function handlePositiveClick() {
    if (isPro) {
      setPositiveStep("photo");
      return;
    }

    handleRedirect("positive");
  }

  return (
    <div className="relative min-h-screen overflow-hidden" style={themeStyle}>
      <div className="mesh" />
      <SiteHeader />

      <main className="mx-auto flex min-h-[calc(100svh-112px)] max-w-6xl items-center px-5 pb-10 sm:px-8">
        <section className="glass-pod theme-shell w-full rounded-[42px] p-5 sm:p-7 lg:p-8">
          <div className="relative z-10">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <div className="eyebrow">{business.name}</div>
                <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-muted)]">
                  {typeLabel}
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${
                    isPro
                      ? "bg-[rgba(255,255,255,0.08)] text-white"
                      : "border border-white/10 text-[var(--color-muted)]"
                  }`}
                >
                  {planLabel}
                </span>
                {isPro && !showChoiceStep ? (
                  <span className="rounded-full bg-[rgba(255,255,255,0.08)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white">
                    {t("review.photoStepEyebrow")}
                  </span>
                ) : null}
              </div>

              <div className="w-full max-w-xs rounded-[28px] border border-white/10 bg-black/20 px-4 py-4">
                <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
                  <span>{t("review.stepCounter", { current: currentStep, total: totalSteps })}</span>
                  <span>
                    {currentStep}/{totalSteps}
                  </span>
                </div>
                <div className="progress-track mt-3">
                  <span style={{ width: `${(currentStep / totalSteps) * 100}%` }} />
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-8 lg:grid-cols-[1.06fr_0.94fr]">
              <div>
                <h1 className="max-w-3xl font-display text-4xl font-semibold leading-[0.98] tracking-[-0.05em] text-white sm:text-5xl">
                  {showChoiceStep
                    ? t("review.headlineWithName", { name: business.name })
                    : t("review.photoStepTitle")}
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--color-muted)] sm:text-lg">
                  {showChoiceStep
                    ? t("review.subheadlineWithType", { type: typeLabel })
                    : t("review.photoStepBody")}
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  <span className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/80">
                    {t("review.trustScans", { count: business.analytics.scans })}
                  </span>
                  <span className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/80">
                    {t("review.trustPositive", {
                      count: business.analytics.positiveClicks
                    })}
                  </span>
                  <span className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/80">
                    {t("review.trustAssist")}
                  </span>
                </div>

                {redirecting ? (
                  <div className="mt-6 rounded-[24px] border border-white/10 bg-white/[0.08] px-5 py-4 text-sm font-medium text-white">
                    {redirecting === "positive"
                      ? t("review.positiveSuccess")
                      : t("review.negativeSuccess")}
                  </div>
                ) : null}

                {showChoiceStep ? (
                  <div className="mt-8 grid gap-4">
                    <button
                      type="button"
                      onClick={handlePositiveClick}
                      disabled={redirecting !== null}
                      style={
                        {
                          background: `linear-gradient(135deg, ${theme.primary}, ${theme.highlight})`
                        } as CSSProperties
                      }
                      className="decision-card group px-6 py-6 text-left text-[var(--color-ink)] shadow-halo disabled:cursor-not-allowed disabled:opacity-80 sm:px-7 sm:py-7"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <span className="rounded-full bg-black/10 px-3 py-2 text-sm font-semibold">
                            5★
                          </span>
                          <p className="mt-4 text-2xl font-semibold">
                            {t("review.positive")}
                          </p>
                          <p className="mt-2 max-w-xl text-sm leading-6 text-black/68">
                            {t("review.publicNote")}
                          </p>
                        </div>
                        <span className="text-3xl transition-transform duration-200 group-hover:translate-x-1">
                          ↗
                        </span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRedirect("negative")}
                      disabled={redirecting !== null}
                      className="decision-card group border border-white/10 bg-white/[0.04] px-6 py-6 text-left text-white disabled:cursor-not-allowed disabled:opacity-80 sm:px-7 sm:py-7"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <span className="rounded-full border border-white/10 px-3 py-2 text-sm font-semibold text-white/80">
                            WA
                          </span>
                          <p className="mt-4 text-2xl font-semibold">
                            {t("review.negative")}
                          </p>
                          <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--color-muted)]">
                            {t("review.privateNote")}
                          </p>
                        </div>
                        <span className="text-3xl transition-transform duration-200 group-hover:translate-y-1">
                          ↘
                        </span>
                      </div>
                    </button>
                  </div>
                ) : (
                  <div className="mt-8 rounded-[32px] bg-[var(--color-paper)] p-5 text-[var(--color-ink)] sm:p-6">
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-black/5 px-4 py-2 text-sm font-medium text-black/70">
                        {t("review.photoStepProofOne")}
                      </span>
                      <span className="rounded-full bg-black/5 px-4 py-2 text-sm font-medium text-black/70">
                        {t("review.photoStepProofTwo")}
                      </span>
                    </div>

                    <div className="mt-6">
                      <h2 className="font-display text-2xl font-semibold">
                        {t("review.photoIdeasTitle")}
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-black/65">
                        {t("review.photoIdeasBody")}
                      </p>
                    </div>

                    <div className="mt-6">
                      <BusinessVisualCard
                        type={business.type}
                        businessName={business.name}
                        label={t("review.sampleVisualLabel")}
                        title={photoSuggestions[0] || showcaseTitle}
                        description={t("review.sampleVisualBody")}
                        chips={photoSuggestions}
                        mode="photo"
                      />
                    </div>

                    <div className="quick-scroll mt-5">
                      {photoSuggestions.map((idea) => (
                        <div
                          key={idea}
                          className="min-w-[220px] rounded-[24px] border border-black/10 bg-black/[0.03] px-4 py-4"
                        >
                          <p className="text-base font-medium text-black/75">{idea}</p>
                        </div>
                      ))}
                    </div>

                    <p className="mt-6 text-sm leading-6 text-black/60">
                      {t("review.photoActionHint")}
                    </p>

                    <div className="mt-4 grid gap-3">
                      <button
                        type="button"
                        onClick={() => handleRedirect("positive")}
                        disabled={redirecting !== null}
                        className="cta-sheen group inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-ink)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-80"
                      >
                        <span>{t("review.continueToGoogle")}</span>
                        <span className="text-base transition-transform duration-200 group-hover:translate-x-1">
                          →
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRedirect("positive")}
                        disabled={redirecting !== null}
                        className="inline-flex items-center justify-center rounded-full border border-black/10 px-5 py-3 text-sm font-semibold text-black/65 transition hover:border-black/20 hover:text-black disabled:cursor-not-allowed disabled:opacity-80"
                      >
                        {t("review.skipToGoogle")}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div>
                {showChoiceStep ? (
                  <div className="space-y-5">
                    <BusinessVisualCard
                      type={business.type}
                      businessName={business.name}
                      label={planLabel}
                      title={t("review.sceneTitle", { type: typeLabel })}
                      description={t("review.sceneBody")}
                      chips={photoSuggestions}
                    />

                    {isPro ? (
                      <div className="rounded-[34px] bg-[var(--color-paper)] p-5 text-[var(--color-ink)] sm:p-6">
                        <p className="text-xs uppercase tracking-[0.18em] text-black/45">
                          {t("review.suggestionsTitle")}
                        </p>
                        <h2 className="mt-3 font-display text-3xl font-semibold">
                          {t("review.quickActionTitle")}
                        </h2>
                        <p className="mt-3 max-w-xl text-sm leading-6 text-black/65">
                          {t("review.quickActionBody")}
                        </p>

                        <div className="quick-scroll mt-6">
                          {suggestions.map((suggestion) => (
                            <div
                              key={suggestion}
                              className="min-w-[260px] rounded-[28px] border border-black/10 bg-black/[0.03] p-4 transition hover:-translate-y-1 hover:bg-black/[0.05]"
                            >
                              <p className="text-base leading-7 text-black/75">
                                {suggestion}
                              </p>
                              <button
                                type="button"
                                onClick={() => handleCopy(suggestion)}
                                className="mt-5 inline-flex rounded-full bg-[var(--color-ink)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-black"
                              >
                                {copiedSuggestion === suggestion
                                  ? t("common.copied")
                                  : t("review.copySuggestion")}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-[34px] border border-white/10 bg-white/[0.04] p-5 sm:p-6">
                        <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
                          {showcaseTitle}
                        </p>
                        <h2 className="mt-3 font-display text-3xl font-semibold text-white">
                          {t("review.basicFlowTitle")}
                        </h2>
                        <p className="mt-3 max-w-xl text-sm leading-7 text-[var(--color-muted)]">
                          {t("review.basicFlowBody")}
                        </p>

                        <div className="mt-6 flex flex-wrap gap-2">
                          {[t("admin.basicFeatureOne"), t("admin.basicFeatureTwo"), t("admin.basicFeatureThree")].map(
                            (feature) => (
                              <span
                                key={feature}
                                className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/80"
                              >
                                {feature}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-5">
                    <BusinessVisualCard
                      type={business.type}
                      businessName={business.name}
                      label={t("review.sampleVisualLabel")}
                      title={photoSuggestions[1] || showcaseTitle}
                      description={t("review.sampleVisualBody")}
                      chips={photoSuggestions}
                    />

                    <div className="rounded-[34px] border border-white/10 bg-white/[0.04] p-5 sm:p-6">
                      <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
                        {typeLabel}
                      </p>
                      <h2 className="mt-3 font-display text-3xl font-semibold text-white">
                        {isPro ? t("review.comboTitle") : t("review.photoIdeasTitle")}
                      </h2>
                      <p className="mt-3 max-w-xl text-sm leading-7 text-[var(--color-muted)]">
                        {isPro ? t("review.comboBody") : t("review.photoIdeasBody")}
                      </p>

                      <div className="quick-scroll mt-6">
                        {(isPro ? suggestions : photoSuggestions).map((suggestion) => (
                          <div
                            key={suggestion}
                            className="min-w-[260px] rounded-[28px] border border-white/10 bg-white/[0.04] p-4 transition hover:-translate-y-1 hover:bg-white/[0.06]"
                          >
                            <p className="text-base leading-7 text-white/88">
                              {suggestion}
                            </p>
                            <button
                              type="button"
                              onClick={() => handleCopy(suggestion)}
                              className="mt-5 inline-flex rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/5"
                            >
                              {copiedSuggestion === suggestion
                                ? t("common.copied")
                                : t("review.copySuggestion")}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <p className="mt-8 text-sm uppercase tracking-[0.18em] text-[var(--color-muted)]">
              {t("review.powered")}
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
