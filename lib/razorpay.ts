import "server-only";

import { createHmac } from "crypto";

import { BILLING_CURRENCY } from "@/lib/billing";

type CreateRazorpayOrderInput = {
  amount: number;
  receipt: string;
  notes?: Record<string, string>;
};

type RazorpayOrder = {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
};

function getRazorpayCredentials() {
  const keyId = process.env.RAZORPAY_KEY_ID?.trim() || "";
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim() || "";

  if (!keyId || !keySecret) {
    throw new Error("Razorpay is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.");
  }

  return {
    keyId,
    keySecret
  };
}

export function hasRazorpayConfig() {
  return Boolean(
    process.env.RAZORPAY_KEY_ID?.trim() && process.env.RAZORPAY_KEY_SECRET?.trim()
  );
}

export function getRazorpayKeyId() {
  return getRazorpayCredentials().keyId;
}

export async function createRazorpayOrder({
  amount,
  receipt,
  notes
}: CreateRazorpayOrderInput) {
  const { keyId, keySecret } = getRazorpayCredentials();
  const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      amount,
      currency: BILLING_CURRENCY,
      receipt,
      notes
    }),
    cache: "no-store"
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as
      | { error?: { description?: string } }
      | null;

    throw new Error(
      payload?.error?.description || "Could not create a Razorpay order."
    );
  }

  return (await response.json()) as RazorpayOrder;
}

export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
) {
  const { keySecret } = getRazorpayCredentials();
  const expectedSignature = createHmac("sha256", keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  return expectedSignature === signature;
}
