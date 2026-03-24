"use client";

import { useState } from "react";

import { SiteHeader } from "@/components/site-header";
import { useLanguage } from "@/components/language-provider";
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
  const isPro = business.plan === "pro";
  const showChoiceStep = !isPro || positiveStep === "choice";
  const planLabel = t(business.plan === "pro" ? "common.pro" : "common.basic");

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
    <div className="relative min-h-screen overflow-hidden">
      <div className="mesh" />
      <SiteHeader />

      <main className="mx-auto flex min-h-[calc(100svh-88px)] max-w-5xl items-center px-5 pb-10 sm:px-8">
        <section className="section-frame w-full rounded-[38px] p-6 sm:p-8 lg:p-10">
          <div className="flex flex-wrap items-center gap-3">
            <div className="eyebrow">{business.name}</div>
            <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-muted)]">
              {typeLabel}
            </span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${
                isPro
                  ? "bg-[rgba(244,183,60,0.16)] text-[var(--color-gold-soft)]"
                  : "border border-white/10 text-[var(--color-muted)]"
              }`}
            >
              {planLabel}
            </span>
            {isPro && !showChoiceStep ? (
              <span className="rounded-full bg-[rgba(244,183,60,0.16)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-gold-soft)]">
                {t("review.photoStepEyebrow")}
              </span>
            ) : null}
          </div>

          <h1 className="mt-5 max-w-3xl font-display text-4xl font-semibold leading-[1.02] tracking-[-0.04em] text-white sm:text-5xl">
            {showChoiceStep
              ? t("review.headlineWithName", { name: business.name })
              : t("review.photoStepTitle")}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--color-muted)] sm:text-lg">
            {showChoiceStep
              ? t("review.subheadlineWithType", { type: typeLabel })
              : t("review.photoStepBody")}
          </p>

          {redirecting ? (
            <div className="mt-6 rounded-[24px] border border-[rgba(244,183,60,0.32)] bg-[rgba(244,183,60,0.12)] px-5 py-4 text-sm font-medium text-[var(--color-gold-soft)]">
              {redirecting === "positive"
                ? t("review.positiveSuccess")
                : t("review.negativeSuccess")}
            </div>
          ) : null}

          {showChoiceStep ? (
            <>
              <div className="mt-8 grid gap-4 lg:grid-cols-2">
                <button
                  type="button"
                  onClick={handlePositiveClick}
                  disabled={redirecting !== null}
                  className="rounded-[30px] bg-[var(--color-gold)] px-6 py-6 text-left text-[var(--color-ink)] transition hover:translate-y-[-1px] hover:shadow-halo disabled:cursor-not-allowed disabled:opacity-80"
                >
                  <span className="block text-xl font-semibold">
                    {t("review.positive")}
                  </span>
                  <span className="mt-1 block text-sm text-black/65">
                    {t("review.publicNote")}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRedirect("negative")}
                  disabled={redirecting !== null}
                  className="rounded-[30px] border border-white/10 bg-black/15 px-6 py-6 text-left text-white transition hover:border-white/20 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-80"
                >
                  <span className="block text-xl font-semibold">
                    {t("review.negative")}
                  </span>
                  <span className="mt-1 block text-sm text-[var(--color-muted)]">
                    {t("review.privateNote")}
                  </span>
                </button>
              </div>

              {isPro ? (
                <div className="mt-8 rounded-[30px] bg-[var(--color-paper)] p-5 text-[var(--color-ink)] sm:p-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-black/45">
                        {typeLabel}
                      </p>
                      <h2 className="mt-2 font-display text-2xl font-semibold">
                        {t("review.suggestionsTitle")}
                      </h2>
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-black/65">
                        {t("review.suggestionsBody")}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 lg:grid-cols-2">
                    {suggestions.map((suggestion) => (
                      <div
                        key={suggestion}
                        className="rounded-[24px] border border-black/10 bg-black/[0.03] p-4"
                      >
                        <p className="text-base leading-7 text-black/75">
                          {suggestion}
                        </p>
                        <button
                          type="button"
                          onClick={() => handleCopy(suggestion)}
                          className="mt-4 inline-flex rounded-full bg-[var(--color-ink)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-black"
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
                <div className="mt-8 rounded-[30px] bg-[var(--color-paper)] p-5 text-[var(--color-ink)] sm:p-6">
                  <p className="text-xs uppercase tracking-[0.18em] text-black/45">
                    {planLabel}
                  </p>
                  <h2 className="mt-2 font-display text-2xl font-semibold">
                    {t("review.basicFlowTitle")}
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-black/65">
                    {t("review.basicFlowBody")}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {[t("admin.basicFeatureOne"), t("admin.basicFeatureTwo"), t("admin.basicFeatureThree")].map(
                      (feature) => (
                        <span
                          key={feature}
                          className="rounded-full bg-black/5 px-4 py-2 text-sm text-black/70"
                        >
                          {feature}
                        </span>
                      )
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="mt-8 grid gap-4 lg:grid-cols-[0.92fr_1.08fr]">
              <div className="rounded-[30px] bg-[var(--color-paper)] p-5 text-[var(--color-ink)] sm:p-6">
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

                <div className="mt-5 grid gap-3">
                  {photoSuggestions.map((idea) => (
                    <div
                      key={idea}
                      className="rounded-[22px] border border-black/10 bg-black/[0.03] px-4 py-4"
                    >
                      <p className="text-base font-medium text-black/75">
                        {idea}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 grid gap-3">
                  <button
                    type="button"
                    onClick={() => handleRedirect("positive")}
                    disabled={redirecting !== null}
                    className="inline-flex items-center justify-center rounded-full bg-[var(--color-ink)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-80"
                  >
                    {t("review.continueToGoogle")}
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

              <div className="rounded-[30px] border border-white/10 bg-black/15 p-5 sm:p-6">
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
                  {typeLabel}
                </p>
                <h2 className="mt-2 font-display text-2xl font-semibold text-white">
                  {t("review.comboTitle")}
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-muted)]">
                  {t("review.comboBody")}
                </p>

                <div className="mt-5 grid gap-4">
                  {suggestions.map((suggestion) => (
                    <div
                      key={suggestion}
                      className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4"
                    >
                      <p className="text-base leading-7 text-white/85">
                        {suggestion}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleCopy(suggestion)}
                        className="mt-4 inline-flex rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/5"
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

          <p className="mt-8 text-sm uppercase tracking-[0.18em] text-[var(--color-muted)]">
            {t("review.powered")}
          </p>
        </section>
      </main>
    </div>
  );
}
