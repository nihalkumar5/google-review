import type { PlanType } from "@/types/business";

export const PLAN_PRICES_PAISE: Record<PlanType, number> = {
  basic: 19900,
  pro: 39900
};

export const BILLING_CURRENCY = "INR";

export function getPlanPricePaisa(plan: PlanType) {
  return PLAN_PRICES_PAISE[plan];
}

export function getUpgradePricePaisa(currentPlan: PlanType, targetPlan: PlanType) {
  return Math.max(0, PLAN_PRICES_PAISE[targetPlan] - PLAN_PRICES_PAISE[currentPlan]);
}

export function formatInrAmount(amountPaisa: number, locale: string) {
  const localeTag = locale === "hi" ? "hi-IN" : "en-IN";

  return new Intl.NumberFormat(localeTag, {
    style: "currency",
    currency: BILLING_CURRENCY,
    maximumFractionDigits: 0
  }).format(amountPaisa / 100);
}
