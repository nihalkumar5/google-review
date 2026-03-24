"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";

import { QrPreview } from "@/components/qr-preview";
import { SiteHeader } from "@/components/site-header";
import { useLanguage } from "@/components/language-provider";
import {
  businessTypeValues,
  getBusinessTypeLabel,
  getReviewSuggestions
} from "@/lib/business-types";
import { buildReviewPath } from "@/lib/site";
import { buildSlugPreview } from "@/lib/slug";
import type { Business, BusinessType } from "@/types/business";

type AdminDashboardProps = {
  initialBusinesses: Business[];
};

type FormState = {
  name: string;
  type: BusinessType;
  googleReviewLink: string;
  whatsappNumber: string;
};

type FilterValue = "all" | BusinessType;

const defaultForm: FormState = {
  name: "",
  type: "cafe",
  googleReviewLink: "",
  whatsappNumber: ""
};

function getTypeAccent(type: BusinessType) {
  switch (type) {
    case "cafe":
      return "bg-[rgba(244,183,60,0.14)] text-[var(--color-gold-soft)]";
    case "salon":
      return "bg-[rgba(255,255,255,0.1)] text-white";
    case "clinic":
      return "bg-[rgba(91,197,139,0.16)] text-[var(--color-green)]";
    case "gym":
      return "bg-[rgba(120,156,255,0.16)] text-[#b7c7ff]";
    case "hotel":
      return "bg-[rgba(223,130,104,0.16)] text-[#f5b6a3]";
    default:
      return "bg-white/10 text-white";
  }
}

export function AdminDashboard({ initialBusinesses }: AdminDashboardProps) {
  const { t, locale } = useLanguage();
  const [businesses, setBusinesses] = useState(initialBusinesses);
  const [createdBusiness, setCreatedBusiness] = useState<Business | null>(null);
  const [form, setForm] = useState<FormState>(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [copiedKey, setCopiedKey] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [filter, setFilter] = useState<FilterValue>("all");

  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  const previewSlug = buildSlugPreview(form.name);
  const previewSuggestions = getReviewSuggestions(form.type, locale);
  const filteredBusinesses =
    filter === "all"
      ? businesses
      : businesses.filter((business) => business.type === filter);
  const totals = businesses.reduce(
    (accumulator, business) => ({
      scans: accumulator.scans + business.analytics.scans,
      positiveClicks:
        accumulator.positiveClicks + business.analytics.positiveClicks,
      negativeClicks:
        accumulator.negativeClicks + business.analytics.negativeClicks
    }),
    {
      scans: 0,
      positiveClicks: 0,
      negativeClicks: 0
    }
  );
  const highlightedBusiness = createdBusiness ?? businesses[0] ?? null;
  const highlightedType = highlightedBusiness?.type ?? form.type;
  const highlightedName = highlightedBusiness?.name || form.name || "Cafe XYZ";
  const highlightedSlug = highlightedBusiness?.slug ?? previewSlug;
  const highlightedPath = buildReviewPath(highlightedSlug);
  const highlightedLink = baseUrl ? `${baseUrl}${highlightedPath}` : highlightedPath;
  const highlightedSuggestions = getReviewSuggestions(highlightedType, locale);

  async function handleCopy(value: string, key: string) {
    await navigator.clipboard.writeText(value);
    setCopiedKey(key);
    window.setTimeout(() => setCopiedKey(""), 1400);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch("/api/businesses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      if (!response.ok) {
        throw new Error();
      }

      const payload = (await response.json()) as { business: Business };
      setBusinesses((current) => [payload.business, ...current]);
      setCreatedBusiness(payload.business);
      setForm(defaultForm);
      setMessage({
        type: "success",
        text: t("admin.success")
      });
    } catch {
      setMessage({
        type: "error",
        text: t("admin.error")
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="mesh" />
      <SiteHeader current="admin" />

      <main className="mx-auto max-w-7xl px-5 pb-14 sm:px-8">
        <section className="grid gap-8 pb-10 pt-4 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div className="max-w-3xl">
            <div className="eyebrow">{t("admin.sampleLabel")}</div>
            <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.02] tracking-[-0.04em] text-white sm:text-5xl">
              {t("admin.title")}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--color-muted)] sm:text-lg">
              {t("admin.subtitle")}
            </p>
          </div>

          <div className="section-frame rounded-[30px] px-5 py-5">
            <div className="grid gap-5 text-center sm:grid-cols-4">
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-[var(--color-muted)]">
                  {t("admin.activePages")}
                </p>
                <p className="mt-2 font-display text-4xl font-semibold text-white">
                  {businesses.length}
                </p>
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-[var(--color-muted)]">
                  {t("admin.totalScans")}
                </p>
                <p className="mt-2 font-display text-4xl font-semibold text-white">
                  {totals.scans}
                </p>
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-[var(--color-muted)]">
                  {t("admin.positive")}
                </p>
                <p className="mt-2 font-display text-4xl font-semibold text-white">
                  {totals.positiveClicks}
                </p>
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-[var(--color-muted)]">
                  {t("admin.negative")}
                </p>
                <p className="mt-2 font-display text-4xl font-semibold text-white">
                  {totals.negativeClicks}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="section-frame rounded-[34px] p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-3xl font-semibold text-white">
                  {t("admin.formTitle")}
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-7 text-[var(--color-muted)]">
                  {t("admin.helperBody")}
                </p>
              </div>
            </div>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-white">
                  {t("admin.name")}
                </span>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      name: event.target.value
                    }))
                  }
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-[var(--color-gold)]"
                  placeholder="Cafe XYZ"
                />
              </label>

              <div className="grid gap-5 sm:grid-cols-[0.9fr_1.1fr]">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-white">
                    {t("admin.businessType")}
                  </span>
                  <select
                    value={form.type}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        type: event.target.value as BusinessType
                      }))
                    }
                    className="w-full appearance-none rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-[var(--color-gold)]"
                  >
                    {businessTypeValues.map((type) => (
                      <option key={type} value={type} className="text-black">
                        {getBusinessTypeLabel(type, locale)}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="rounded-2xl border border-white/10 bg-black/10 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-muted)]">
                    {t("admin.slugPreview")}
                  </p>
                  <p className="mt-2 break-all font-display text-xl font-semibold text-white">
                    /r/{previewSlug}
                  </p>
                </div>
              </div>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-white">
                  {t("admin.googleLink")}
                </span>
                <input
                  type="url"
                  required
                  value={form.googleReviewLink}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      googleReviewLink: event.target.value
                    }))
                  }
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-[var(--color-gold)]"
                  placeholder="https://search.google.com/local/writereview?placeid=..."
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-white">
                  {t("admin.whatsapp")}
                </span>
                <input
                  type="tel"
                  required
                  value={form.whatsappNumber}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      whatsappNumber: event.target.value
                    }))
                  }
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-[var(--color-gold)]"
                  placeholder="+91 9876543210"
                />
                <p className="mt-2 text-sm text-[var(--color-muted)]">
                  {t("admin.whatsappHelp")}
                </p>
              </label>

              <div className="rounded-[28px] border border-white/10 bg-black/10 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
                      {t("admin.smartSuggestions")}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
                      {t("admin.suggestionsHelp")}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${getTypeAccent(
                      form.type
                    )}`}
                  >
                    {getBusinessTypeLabel(form.type, locale)}
                  </span>
                </div>

                <div className="mt-4 grid gap-3">
                  {previewSuggestions.map((suggestion) => (
                    <div
                      key={suggestion}
                      className="rounded-2xl border border-white/10 bg-black/15 px-4 py-3 text-sm leading-6 text-white/85"
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              </div>

              {message ? (
                <div
                  className={`rounded-2xl px-4 py-3 text-sm ${
                    message.type === "success"
                      ? "bg-[rgba(91,197,139,0.14)] text-[var(--color-green)]"
                      : "bg-[rgba(223,130,104,0.14)] text-[var(--color-danger)]"
                  }`}
                >
                  {message.text}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center rounded-full bg-[var(--color-gold)] px-6 py-3 text-base font-semibold text-[var(--color-ink)] transition hover:translate-y-[-1px] hover:shadow-halo disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? t("admin.creating") : t("admin.submit")}
              </button>
            </form>
          </div>

          <div className="rounded-[34px] bg-[var(--color-paper)] p-6 text-[var(--color-ink)] sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-black/45">
                  {t("admin.generated")}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <h2 className="font-display text-3xl font-semibold">
                    {highlightedName}
                  </h2>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${getTypeAccent(
                      highlightedType
                    )}`}
                  >
                    {getBusinessTypeLabel(highlightedType, locale)}
                  </span>
                </div>
                <p className="mt-3 max-w-lg text-sm leading-7 text-black/65">
                  {t("admin.generatedHelp")}
                </p>
              </div>
              <Link
                href={highlightedPath}
                className="rounded-full border border-black/10 px-4 py-2 text-sm font-semibold text-black/70 transition hover:border-black/20 hover:text-black"
              >
                {t("admin.open")}
              </Link>
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-[0.72fr_1fr]">
              <QrPreview
                url={highlightedLink}
                label={highlightedName}
                downloadName={highlightedSlug}
                downloadLabel={t("admin.download")}
              />

              <div className="space-y-4">
                <div className="rounded-[24px] border border-black/10 bg-black/[0.03] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-black/45">
                    {t("admin.reviewPageLink")}
                  </p>
                  <p className="mt-2 break-all text-sm leading-6 text-black/70">
                    {highlightedLink}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopy(highlightedLink, "highlight-link")}
                      className="rounded-full bg-[var(--color-ink)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-black"
                    >
                      {copiedKey === "highlight-link"
                        ? t("common.copied")
                        : t("common.copy")}
                    </button>
                    <a
                      href={highlightedLink}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-black/10 px-4 py-2 text-sm font-semibold text-black/70 transition hover:border-black/20 hover:text-black"
                    >
                      {t("admin.open")}
                    </a>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[24px] border border-black/10 bg-black/[0.03] p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-black/45">
                      {t("admin.googleDestination")}
                    </p>
                    <p className="mt-2 break-all text-sm leading-6 text-black/70">
                      {highlightedBusiness?.googleReviewLink ||
                        form.googleReviewLink ||
                        "https://search.google.com/local/writereview?placeid=..."}
                    </p>
                  </div>
                  <div className="rounded-[24px] border border-black/10 bg-black/[0.03] p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-black/45">
                      {t("admin.whatsapp")}
                    </p>
                    <p className="mt-2 break-all text-sm leading-6 text-black/70">
                      {highlightedBusiness?.whatsappNumber ||
                        form.whatsappNumber ||
                        "+91 9876543210"}
                    </p>
                  </div>
                </div>

                <div className="rounded-[24px] border border-black/10 bg-black/[0.03] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-black/45">
                    {t("admin.smartSuggestions")}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {highlightedSuggestions.map((suggestion) => (
                      <span
                        key={suggestion}
                        className="rounded-full bg-black/5 px-4 py-2 text-sm text-black/70"
                      >
                        {suggestion}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section-frame mt-6 rounded-[34px]">
          <div className="flex flex-col gap-4 border-b border-white/10 px-6 py-5 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="font-display text-2xl font-semibold text-white">
                {t("admin.listTitle")}
              </h2>
              <p className="mt-1 text-sm text-[var(--color-muted)]">
                {t("admin.tenantCount", { count: filteredBusinesses.length })}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setFilter("all")}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  filter === "all"
                    ? "bg-[var(--color-gold)] text-[var(--color-ink)]"
                    : "border border-white/10 text-white hover:border-white/20 hover:bg-white/5"
                }`}
              >
                {t("admin.filterAll")}
              </button>
              {businessTypeValues.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFilter(type)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    filter === type
                      ? "bg-white text-[var(--color-ink)]"
                      : "border border-white/10 text-white hover:border-white/20 hover:bg-white/5"
                  }`}
                >
                  {getBusinessTypeLabel(type, locale)}
                </button>
              ))}
            </div>
          </div>

          {filteredBusinesses.length === 0 ? (
            <div className="px-6 py-12 text-[var(--color-muted)] sm:px-8">
              {t("admin.filteredEmpty")}
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {filteredBusinesses.map((business) => {
                const reviewPagePath = buildReviewPath(business.slug);
                const reviewPageLink = baseUrl
                  ? `${baseUrl}${reviewPagePath}`
                  : reviewPagePath;
                const suggestions = getReviewSuggestions(business.type, locale);

                return (
                  <article
                    key={business.id}
                    className="grid gap-6 px-6 py-6 sm:px-8 lg:grid-cols-[1.1fr_1.05fr_auto]"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="font-display text-2xl font-semibold text-white">
                          {business.name}
                        </h3>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${getTypeAccent(
                            business.type
                          )}`}
                        >
                          {getBusinessTypeLabel(business.type, locale)}
                        </span>
                      </div>

                      <div className="mt-4 grid gap-3 text-sm text-[var(--color-muted)] sm:grid-cols-2">
                        <div className="rounded-[22px] border border-white/10 bg-black/10 px-4 py-4">
                          <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
                            {t("admin.slugPreview")}
                          </p>
                          <p className="mt-2 break-all font-medium text-white">
                            /r/{business.slug}
                          </p>
                        </div>
                        <div className="rounded-[22px] border border-white/10 bg-black/10 px-4 py-4">
                          <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
                            {t("admin.whatsapp")}
                          </p>
                          <p className="mt-2 break-all font-medium text-white">
                            {business.whatsappNumber}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 rounded-[22px] border border-white/10 bg-black/10 px-4 py-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
                          {t("admin.googleDestination")}
                        </p>
                        <p className="mt-2 break-all text-sm leading-6 text-white/80">
                          {business.googleReviewLink}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="rounded-[24px] border border-white/10 bg-black/10 p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
                          {t("admin.reviewPageLink")}
                        </p>
                        <p className="mt-2 break-all text-sm leading-6 text-white/80">
                          {reviewPageLink}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleCopy(reviewPageLink, `${business.id}-review-link`)
                            }
                            className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/5"
                          >
                            {copiedKey === `${business.id}-review-link`
                              ? t("common.copied")
                              : t("common.copy")}
                          </button>
                          <a
                            href={reviewPagePath}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-full bg-[var(--color-gold)] px-4 py-2 text-sm font-semibold text-[var(--color-ink)] transition hover:translate-y-[-1px]"
                          >
                            {t("admin.open")}
                          </a>
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-3">
                        <div className="rounded-[22px] border border-white/10 bg-black/10 p-4">
                          <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
                            {t("admin.totalScans")}
                          </p>
                          <p className="mt-3 font-display text-3xl font-semibold text-white">
                            {business.analytics.scans}
                          </p>
                        </div>
                        <div className="rounded-[22px] border border-white/10 bg-black/10 p-4">
                          <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
                            {t("admin.positive")}
                          </p>
                          <p className="mt-3 font-display text-3xl font-semibold text-white">
                            {business.analytics.positiveClicks}
                          </p>
                        </div>
                        <div className="rounded-[22px] border border-white/10 bg-black/10 p-4">
                          <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
                            {t("admin.negative")}
                          </p>
                          <p className="mt-3 font-display text-3xl font-semibold text-white">
                            {business.analytics.negativeClicks}
                          </p>
                        </div>
                      </div>

                      <div className="rounded-[24px] border border-white/10 bg-black/10 p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
                          {t("admin.smartSuggestions")}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {suggestions.map((suggestion) => (
                            <span
                              key={suggestion}
                              className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/75"
                            >
                              {suggestion}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-start lg:justify-end">
                      <QrPreview
                        url={reviewPageLink}
                        label={business.name}
                        downloadName={business.slug}
                        downloadLabel={t("admin.download")}
                        compact
                      />
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
