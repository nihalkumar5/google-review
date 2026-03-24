"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import Script from "next/script";

import { QrPreview } from "@/components/qr-preview";
import { SiteHeader } from "@/components/site-header";
import { useLanguage } from "@/components/language-provider";
import { formatInrAmount, getPlanPricePaisa, getUpgradePricePaisa } from "@/lib/billing";
import {
  businessTypeValues,
  getBusinessTypeLabel,
  getReviewSuggestions
} from "@/lib/business-types";
import { buildReviewPath } from "@/lib/site";
import { buildSlugPreview } from "@/lib/slug";
import type { Business, BusinessType, PlanType } from "@/types/business";
import type { PaymentMode, PaymentRecord } from "@/types/payment";

type AdminDashboardProps = {
  initialBusinesses: Business[];
  initialPayments: PaymentRecord[];
};

type FormState = {
  name: string;
  type: BusinessType;
  plan: PlanType;
  googleReviewLink: string;
  whatsappNumber: string;
};

type FilterValue = "all" | BusinessType;
type Translator = (key: string, values?: Record<string, string | number>) => string;
type ActionState =
  | {
      kind: "create";
    }
  | {
      kind: "upgrade";
      businessId: string;
    }
  | null;

type OrderResponse = {
  keyId: string;
  mode: PaymentMode;
  plan: PlanType;
  businessName: string;
  description: string;
  order: {
    id: string;
    amount: number;
    currency: string;
  };
  prefill?: {
    name?: string;
    contact?: string;
  };
};

type VerifyResponse = {
  business: Business;
  payment: PaymentRecord;
};

type RazorpaySuccessResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayCheckoutOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpaySuccessResponse) => void | Promise<void>;
  prefill?: {
    name?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  modal?: {
    ondismiss?: () => void;
  };
  theme?: {
    color: string;
  };
};

type RazorpayConstructor = new (options: RazorpayCheckoutOptions) => {
  open: () => void;
};

const defaultForm: FormState = {
  name: "",
  type: "cafe",
  plan: "basic",
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

function getPlanAccent(plan: PlanType) {
  return plan === "pro"
    ? "bg-[rgba(244,183,60,0.18)] text-[var(--color-gold-soft)]"
    : "border border-white/10 text-[var(--color-muted)]";
}

function getPlanLabel(plan: PlanType, t: Translator) {
  return t(plan === "pro" ? "common.pro" : "common.basic");
}

function getPlanSummary(plan: PlanType, t: Translator) {
  return t(plan === "pro" ? "admin.proSummary" : "admin.basicSummary");
}

function getPlanFeatures(plan: PlanType, t: Translator) {
  return plan === "pro"
    ? [
        t("admin.proFeatureOne"),
        t("admin.proFeatureTwo"),
        t("admin.proFeatureThree"),
        t("admin.proFeatureFour")
      ]
    : [
        t("admin.basicFeatureOne"),
        t("admin.basicFeatureTwo"),
        t("admin.basicFeatureThree")
      ];
}

function getPaymentModeLabel(mode: PaymentMode, t: Translator) {
  return t(mode === "upgrade" ? "admin.paymentModeUpgrade" : "admin.paymentModeCreate");
}

function formatDateStamp(value: string) {
  return value.slice(0, 10);
}

function upsertBusiness(businesses: Business[], business: Business) {
  const existingIndex = businesses.findIndex((entry) => entry.id === business.id);

  if (existingIndex === -1) {
    return [business, ...businesses];
  }

  return businesses.map((entry) => (entry.id === business.id ? business : entry));
}

function upsertPayment(payments: PaymentRecord[], payment: PaymentRecord) {
  const existingIndex = payments.findIndex((entry) => entry.id === payment.id);

  if (existingIndex === -1) {
    return [payment, ...payments];
  }

  return payments.map((entry) => (entry.id === payment.id ? payment : entry));
}

async function readErrorMessage(response: Response, fallback: string) {
  const payload = (await response.json().catch(() => null)) as { error?: string } | null;
  return payload?.error || fallback;
}

export function AdminDashboard({
  initialBusinesses,
  initialPayments
}: AdminDashboardProps) {
  const { t, locale } = useLanguage();
  const [businesses, setBusinesses] = useState(initialBusinesses);
  const [payments, setPayments] = useState(initialPayments);
  const [createdBusiness, setCreatedBusiness] = useState<Business | null>(null);
  const [form, setForm] = useState<FormState>(defaultForm);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [copiedKey, setCopiedKey] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [filter, setFilter] = useState<FilterValue>("all");
  const [checkoutReady, setCheckoutReady] = useState(false);
  const [actionState, setActionState] = useState<ActionState>(null);

  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  const previewSlug = buildSlugPreview(form.name);
  const previewSuggestions =
    form.plan === "pro" ? getReviewSuggestions(form.type, locale) : [];
  const filteredBusinesses =
    filter === "all"
      ? businesses
      : businesses.filter((business) => business.type === filter);
  const paidPayments = payments.filter((payment) => payment.status === "paid");
  const latestPaymentByBusiness = paidPayments.reduce((map, payment) => {
    if (payment.businessId && !map.has(payment.businessId)) {
      map.set(payment.businessId, payment);
    }

    return map;
  }, new Map<string, PaymentRecord>());
  const totals = businesses.reduce(
    (accumulator, business) => ({
      scans: accumulator.scans + business.analytics.scans,
      positiveClicks:
        accumulator.positiveClicks + business.analytics.positiveClicks,
      negativeClicks:
        accumulator.negativeClicks + business.analytics.negativeClicks,
      basicCount: accumulator.basicCount + (business.plan === "basic" ? 1 : 0),
      proCount: accumulator.proCount + (business.plan === "pro" ? 1 : 0)
    }),
    {
      scans: 0,
      positiveClicks: 0,
      negativeClicks: 0,
      basicCount: 0,
      proCount: 0
    }
  );
  const totalRevenue = paidPayments.reduce(
    (sum, payment) => sum + payment.amount,
    0
  );
  const highlightedBusiness = createdBusiness ?? businesses[0] ?? null;
  const highlightedType = highlightedBusiness?.type ?? form.type;
  const highlightedPlan = highlightedBusiness?.plan ?? form.plan;
  const highlightedName = highlightedBusiness?.name || form.name || "Cafe XYZ";
  const highlightedSlug = highlightedBusiness?.slug ?? previewSlug;
  const highlightedPath = buildReviewPath(highlightedSlug);
  const highlightedLink = baseUrl ? `${baseUrl}${highlightedPath}` : highlightedPath;
  const highlightedSuggestions =
    highlightedPlan === "pro" ? getReviewSuggestions(highlightedType, locale) : [];
  const highlightedPlanFeatures = getPlanFeatures(highlightedPlan, t);
  const highlightedPayment = highlightedBusiness
    ? latestPaymentByBusiness.get(highlightedBusiness.id) || null
    : null;
  const selectedPlanPrice = formatInrAmount(
    getPlanPricePaisa(form.plan),
    locale
  );
  const isCreating = actionState?.kind === "create";
  const activeUpgradeId = actionState?.kind === "upgrade" ? actionState.businessId : "";

  async function handleCopy(value: string, key: string) {
    await navigator.clipboard.writeText(value);
    setCopiedKey(key);
    window.setTimeout(() => setCopiedKey(""), 1400);
  }

  async function verifyPayment(
    razorpayResponse: RazorpaySuccessResponse,
    currentAction: Exclude<ActionState, null>
  ) {
    try {
      const response = await fetch("/api/payments/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(razorpayResponse)
      });

      if (!response.ok) {
        throw new Error(
          await readErrorMessage(response, t("admin.paymentVerifyError"))
        );
      }

      const payload = (await response.json()) as VerifyResponse;
      setBusinesses((current) => upsertBusiness(current, payload.business));
      setPayments((current) => upsertPayment(current, payload.payment));
      setCreatedBusiness(payload.business);

      if (currentAction.kind === "create") {
        setForm(defaultForm);
      }

      setMessage({
        type: "success",
        text:
          currentAction.kind === "create"
            ? t("admin.paymentSuccessCreate")
            : t("admin.paymentSuccessUpgrade")
      });
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error ? error.message : t("admin.paymentVerifyError")
      });
    } finally {
      setActionState(null);
    }
  }

  function openCheckout(payload: OrderResponse, currentAction: Exclude<ActionState, null>) {
    const Razorpay = (
      window as Window & {
        Razorpay?: RazorpayConstructor;
      }
    ).Razorpay;

    if (!Razorpay) {
      setActionState(null);
      setMessage({
        type: "error",
        text: t("admin.checkoutUnavailable")
      });
      return;
    }

    const checkout = new Razorpay({
      key: payload.keyId,
      amount: payload.order.amount,
      currency: payload.order.currency,
      name: t("common.appName"),
      description: payload.description,
      order_id: payload.order.id,
      prefill: payload.prefill,
      notes: {
        businessName: payload.businessName,
        plan: payload.plan,
        mode: payload.mode
      },
      theme: {
        color: "#f4b73c"
      },
      modal: {
        ondismiss: () => {
          setActionState(null);
          setMessage({
            type: "error",
            text: t("admin.checkoutDismissed")
          });
        }
      },
      handler: async (response) => {
        await verifyPayment(response, currentAction);
      }
    });

    checkout.open();
  }

  async function startCheckout(
    requestBody: Record<string, string>,
    currentAction: Exclude<ActionState, null>
  ) {
    if (!checkoutReady) {
      setMessage({
        type: "error",
        text: t("admin.checkoutLoading")
      });
      return;
    }

    setActionState(currentAction);
    setMessage(null);

    try {
      const response = await fetch("/api/payments/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(await readErrorMessage(response, t("admin.paymentOrderError")));
      }

      const payload = (await response.json()) as OrderResponse;
      openCheckout(payload, currentAction);
    } catch (error) {
      setActionState(null);
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : t("admin.paymentOrderError")
      });
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await startCheckout(
      {
        mode: "create",
        name: form.name,
        type: form.type,
        plan: form.plan,
        googleReviewLink: form.googleReviewLink,
        whatsappNumber: form.whatsappNumber
      },
      {
        kind: "create"
      }
    );
  }

  async function handleUpgrade(business: Business) {
    await startCheckout(
      {
        mode: "upgrade",
        businessId: business.id
      },
      {
        kind: "upgrade",
        businessId: business.id
      }
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
        onLoad={() => setCheckoutReady(true)}
      />
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
            <div className="grid gap-5 text-center sm:grid-cols-5">
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
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-[var(--color-muted)]">
                  {t("admin.totalRevenue")}
                </p>
                <p className="mt-2 font-display text-4xl font-semibold text-white">
                  {formatInrAmount(totalRevenue, locale)}
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2 border-t border-white/10 pt-4 text-sm text-[var(--color-muted)]">
              <span className="rounded-full border border-white/10 px-3 py-1">
                {totals.basicCount} {t("common.basic")}
              </span>
              <span className="rounded-full border border-white/10 px-3 py-1">
                {totals.proCount} {t("common.pro")}
              </span>
              <span className="rounded-full border border-white/10 px-3 py-1">
                {paidPayments.length} {t("admin.successfulPayments")}
              </span>
              <span className="rounded-full border border-white/10 px-3 py-1">
                {checkoutReady ? t("admin.billingReady") : t("admin.checkoutLoading")}
              </span>
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

              <div>
                <span className="mb-2 block text-sm font-medium text-white">
                  {t("admin.plan")}
                </span>
                <div className="grid gap-4 sm:grid-cols-2">
                  {(["basic", "pro"] as PlanType[]).map((plan) => {
                    const isActive = form.plan === plan;
                    const features = getPlanFeatures(plan, t);

                    return (
                      <button
                        key={plan}
                        type="button"
                        onClick={() =>
                          setForm((current) => ({
                            ...current,
                            plan
                          }))
                        }
                        className={`rounded-[28px] border p-5 text-left transition ${
                          isActive
                            ? "border-[var(--color-gold)] bg-[rgba(244,183,60,0.09)]"
                            : "border-white/10 bg-black/10 hover:border-white/20 hover:bg-white/5"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-display text-2xl font-semibold text-white">
                              {getPlanLabel(plan, t)}
                            </p>
                            <p className="mt-1 text-sm text-[var(--color-gold-soft)]">
                              {formatInrAmount(getPlanPricePaisa(plan), locale)}
                            </p>
                          </div>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${getPlanAccent(
                              plan
                            )}`}
                          >
                            {getPlanLabel(plan, t)}
                          </span>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">
                          {getPlanSummary(plan, t)}
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {features.map((feature) => (
                            <span
                              key={feature}
                              className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/75"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      </button>
                    );
                  })}
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
                      {form.plan === "pro"
                        ? t("admin.smartSuggestions")
                        : t("admin.planIncludes")}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
                      {form.plan === "pro"
                        ? t("admin.suggestionsHelp")
                        : t("admin.basicFlowBody")}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${getPlanAccent(
                      form.plan
                    )}`}
                  >
                    {getPlanLabel(form.plan, t)}
                  </span>
                </div>

                {form.plan === "pro" ? (
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
                ) : (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {getPlanFeatures("basic", t).map((feature) => (
                      <span
                        key={feature}
                        className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/75"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-[28px] border border-[rgba(244,183,60,0.18)] bg-[rgba(244,183,60,0.07)] p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-gold-soft)]">
                  {t("admin.paymentRequired")}
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
                  {t("admin.paymentHelper")}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-black/20 px-4 py-2 text-sm font-semibold text-white">
                    {getPlanLabel(form.plan, t)}
                  </span>
                  <span className="rounded-full bg-black/20 px-4 py-2 text-sm font-semibold text-white">
                    {selectedPlanPrice}
                  </span>
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
                disabled={actionState !== null || !checkoutReady}
                className="inline-flex items-center justify-center rounded-full bg-[var(--color-gold)] px-6 py-3 text-base font-semibold text-[var(--color-ink)] transition hover:translate-y-[-1px] hover:shadow-halo disabled:cursor-not-allowed disabled:opacity-70"
              >
                {!checkoutReady
                  ? t("admin.checkoutLoading")
                  : isCreating
                    ? t("admin.startingPayment")
                    : t("admin.payAndCreate", { amount: selectedPlanPrice })}
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
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${getPlanAccent(
                      highlightedPlan
                    )}`}
                  >
                    {getPlanLabel(highlightedPlan, t)}
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
                    {t("admin.planIncludes")}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {highlightedPlanFeatures.map((feature) => (
                      <span
                        key={feature}
                        className="rounded-full bg-black/5 px-4 py-2 text-sm text-black/70"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="rounded-[24px] border border-black/10 bg-black/[0.03] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-black/45">
                    {t("admin.latestPayment")}
                  </p>
                  {highlightedPayment ? (
                    <>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="rounded-full bg-black/5 px-4 py-2 text-sm font-semibold text-black/70">
                          {formatInrAmount(highlightedPayment.amount, locale)}
                        </span>
                        <span className="rounded-full bg-black/5 px-4 py-2 text-sm font-semibold text-black/70">
                          {getPaymentModeLabel(highlightedPayment.mode, t)}
                        </span>
                        <span className="rounded-full bg-black/5 px-4 py-2 text-sm font-semibold text-black/70">
                          {formatDateStamp(highlightedPayment.paidAt || highlightedPayment.createdAt)}
                        </span>
                      </div>
                      <p className="mt-3 break-all text-sm leading-6 text-black/70">
                        {t("admin.paymentReference")}:{" "}
                        {highlightedPayment.paymentId || highlightedPayment.orderId}
                      </p>
                    </>
                  ) : (
                    <p className="mt-2 text-sm leading-6 text-black/65">
                      {t("admin.noPaymentHistory")}
                    </p>
                  )}
                </div>

                <div className="rounded-[24px] border border-black/10 bg-black/[0.03] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-black/45">
                    {highlightedPlan === "pro"
                      ? t("admin.proFlowTitle")
                      : t("admin.basicFlowTitle")}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-black/70">
                    {highlightedPlan === "pro"
                      ? t("admin.proFlowBody")
                      : t("admin.basicFlowBody")}
                  </p>
                  {highlightedPlan === "pro" ? (
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
                  ) : null}
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
                const features = getPlanFeatures(business.plan, t);
                const suggestions =
                  business.plan === "pro"
                    ? getReviewSuggestions(business.type, locale)
                    : [];
                const latestPayment = latestPaymentByBusiness.get(business.id) || null;
                const upgradePrice = formatInrAmount(
                  getUpgradePricePaisa(business.plan, "pro"),
                  locale
                );

                return (
                  <article
                    key={business.id}
                    className="px-6 py-7 sm:px-8"
                  >
                    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_312px] xl:items-start">
                      <div className="space-y-4">
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
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${getPlanAccent(
                              business.plan
                            )}`}
                          >
                            {getPlanLabel(business.plan, t)}
                          </span>
                        </div>

                        <div className="grid gap-4 text-sm text-[var(--color-muted)] sm:grid-cols-2">
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

                        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
                          <div className="rounded-[22px] border border-white/10 bg-black/10 px-4 py-4">
                            <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
                              {t("admin.googleDestination")}
                            </p>
                            <p className="mt-2 break-all text-sm leading-6 text-white/80">
                              {business.googleReviewLink}
                            </p>
                          </div>

                          <div className="rounded-[24px] border border-white/10 bg-black/10 p-4">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
                                  {t("admin.latestPayment")}
                                </p>
                                {latestPayment ? (
                                  <>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                      <span className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/75">
                                        {formatInrAmount(latestPayment.amount, locale)}
                                      </span>
                                      <span className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/75">
                                        {getPaymentModeLabel(latestPayment.mode, t)}
                                      </span>
                                    </div>
                                    <p className="mt-3 break-all text-sm leading-6 text-white/80">
                                      {t("admin.paymentReference")}:{" "}
                                      {latestPayment.paymentId || latestPayment.orderId}
                                    </p>
                                  </>
                                ) : (
                                  <p className="mt-2 text-sm leading-6 text-white/80">
                                    {t("admin.noPaymentHistory")}
                                  </p>
                                )}
                              </div>

                              {business.plan === "basic" ? (
                                <button
                                  type="button"
                                  onClick={() => handleUpgrade(business)}
                                  disabled={actionState !== null || !checkoutReady}
                                  className="rounded-full bg-[var(--color-gold)] px-4 py-2 text-sm font-semibold text-[var(--color-ink)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                  {activeUpgradeId === business.id
                                    ? t("admin.upgrading")
                                    : t("admin.upgradeToPro", { amount: upgradePrice })}
                                </button>
                              ) : (
                                <span className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white/75">
                                  {t("admin.paymentActive")}
                                </span>
                              )}
                            </div>
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

                        <div className="grid gap-4 xl:grid-cols-[minmax(0,0.96fr)_minmax(0,1.04fr)]">
                          <div className="rounded-[24px] border border-white/10 bg-black/10 p-4">
                            <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
                              {t("admin.planIncludes")}
                            </p>
                            <div className="mt-3 flex flex-wrap gap-2">
                              {features.map((feature) => (
                                <span
                                  key={feature}
                                  className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/75"
                                >
                                  {feature}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="rounded-[24px] border border-white/10 bg-black/10 p-4">
                            <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
                              {business.plan === "pro"
                                ? t("admin.proFlowTitle")
                                : t("admin.basicFlowTitle")}
                            </p>
                            <p className="mt-2 text-sm leading-6 text-white/80">
                              {business.plan === "pro"
                                ? t("admin.proFlowBody")
                                : t("admin.basicFlowBody")}
                            </p>
                            {business.plan === "pro" ? (
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
                            ) : null}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4 xl:justify-self-end">
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

                          <div className="mt-5 flex justify-center">
                            <QrPreview
                              url={reviewPageLink}
                              label={business.name}
                              downloadName={business.slug}
                              downloadLabel={t("admin.download")}
                              size="showcase"
                            />
                          </div>
                        </div>
                      </div>
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
