import { NextResponse } from "next/server";

import { getPlanPricePaisa, getUpgradePricePaisa } from "@/lib/billing";
import { isBusinessType, isPlanType } from "@/lib/business-types";
import {
  createPendingPayment,
  getBusinessById,
  normalizeWhatsappNumber
} from "@/lib/db";
import {
  createRazorpayOrder,
  getRazorpayKeyId,
  hasRazorpayConfig
} from "@/lib/razorpay";
import type { CreateBusinessInput } from "@/types/business";

export const runtime = "nodejs";

function isValidUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function parseCreateDraft(body: Record<string, string | undefined>) {
  const name = body.name?.trim() ?? "";
  const type = body.type?.trim() ?? "";
  const plan = body.plan?.trim() ?? "";
  const googleReviewLink = body.googleReviewLink?.trim() ?? "";
  const whatsappNumber = body.whatsappNumber?.trim() ?? "";

  if (!name || !type || !plan || !googleReviewLink || !whatsappNumber) {
    return {
      error:
        "Name, business type, plan, Google review link, and WhatsApp number are required."
    };
  }

  if (!isBusinessType(type)) {
    return {
      error: "Please choose a valid business type."
    };
  }

  if (!isPlanType(plan)) {
    return {
      error: "Please choose a valid plan."
    };
  }

  if (!isValidUrl(googleReviewLink)) {
    return {
      error: "Please provide a valid Google review URL."
    };
  }

  if (normalizeWhatsappNumber(whatsappNumber).length < 8) {
    return {
      error: "Please provide a valid WhatsApp number with country code."
    };
  }

  return {
    data: {
      name,
      type,
      plan,
      googleReviewLink,
      whatsappNumber
    } satisfies CreateBusinessInput
  };
}

function buildReceipt(prefix: string) {
  return `${prefix}_${Date.now().toString(36).slice(-8)}_${Math.random()
    .toString(36)
    .slice(2, 8)}`.slice(0, 40);
}

export async function POST(request: Request) {
  if (!hasRazorpayConfig()) {
    return NextResponse.json(
      {
        error:
          "Razorpay is not configured yet. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET first."
      },
      { status: 503 }
    );
  }

  const body = (await request.json()) as Record<string, string | undefined>;
  const mode = body.mode?.trim();

  try {
    if (mode === "create") {
      const parsed = parseCreateDraft(body);

      if ("error" in parsed) {
        return NextResponse.json({ error: parsed.error }, { status: 400 });
      }

      const draft = parsed.data;
      const amount = getPlanPricePaisa(draft.plan);
      const receipt = buildReceipt(`${draft.plan}_${draft.name}`);
      const order = await createRazorpayOrder({
        amount,
        receipt,
        notes: {
          mode,
          plan: draft.plan,
          business: draft.name.slice(0, 64)
        }
      });

      await createPendingPayment({
        mode,
        plan: draft.plan,
        amount,
        orderId: order.id,
        receipt,
        currency: order.currency,
        businessName: draft.name,
        draft
      });

      return NextResponse.json({
        keyId: getRazorpayKeyId(),
        order,
        mode,
        plan: draft.plan,
        businessName: draft.name,
        description: `${draft.plan === "pro" ? "Pro" : "Basic"} plan for ${draft.name}`,
        prefill: {
          name: draft.name,
          contact: normalizeWhatsappNumber(draft.whatsappNumber).replace(/^\+/, "")
        }
      });
    }

    if (mode === "upgrade") {
      const businessId = body.businessId?.trim() ?? "";

      if (!businessId) {
        return NextResponse.json(
          { error: "Business id is required for upgrades." },
          { status: 400 }
        );
      }

      const business = await getBusinessById(businessId);

      if (!business) {
        return NextResponse.json({ error: "Business not found." }, { status: 404 });
      }

      if (business.plan === "pro") {
        return NextResponse.json(
          { error: "This business is already on the Pro plan." },
          { status: 400 }
        );
      }

      const amount = getUpgradePricePaisa(business.plan, "pro");
      const receipt = buildReceipt(`upgrade_${business.slug}`);
      const order = await createRazorpayOrder({
        amount,
        receipt,
        notes: {
          mode,
          plan: "pro",
          business: business.name.slice(0, 64)
        }
      });

      await createPendingPayment({
        mode,
        plan: "pro",
        amount,
        orderId: order.id,
        receipt,
        currency: order.currency,
        businessId: business.id,
        businessSlug: business.slug,
        businessName: business.name
      });

      return NextResponse.json({
        keyId: getRazorpayKeyId(),
        order,
        mode,
        plan: "pro",
        businessName: business.name,
        description: `Upgrade ${business.name} to Pro`,
        prefill: {
          name: business.name,
          contact: normalizeWhatsappNumber(business.whatsappNumber).replace(/^\+/, "")
        }
      });
    }

    return NextResponse.json(
      { error: "Unsupported payment mode." },
      { status: 400 }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not create a payment order.";

    return NextResponse.json({ error: message }, { status: 502 });
  }
}
