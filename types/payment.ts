import type { CreateBusinessInput, PlanType } from "@/types/business";

export const paymentModes = ["create", "upgrade"] as const;
export const paymentStatuses = ["created", "paid", "failed"] as const;

export type PaymentMode = (typeof paymentModes)[number];
export type PaymentStatus = (typeof paymentStatuses)[number];

export type PaymentRecord = {
  id: string;
  mode: PaymentMode;
  status: PaymentStatus;
  plan: PlanType;
  amount: number;
  currency: string;
  orderId: string;
  receipt: string;
  businessId?: string;
  businessSlug?: string;
  businessName: string;
  draft?: CreateBusinessInput;
  paymentId?: string;
  signature?: string;
  createdAt: string;
  paidAt?: string;
};

export type CreatePendingPaymentInput = {
  mode: PaymentMode;
  plan: PlanType;
  amount: number;
  orderId: string;
  receipt: string;
  currency?: string;
  businessId?: string;
  businessSlug?: string;
  businessName: string;
  draft?: CreateBusinessInput;
};
