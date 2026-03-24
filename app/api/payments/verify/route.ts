import { NextResponse } from "next/server";

import { finalizePayment } from "@/lib/db";
import { verifyRazorpaySignature } from "@/lib/razorpay";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json()) as Record<string, string | undefined>;

  const orderId = body.razorpay_order_id?.trim() ?? "";
  const paymentId = body.razorpay_payment_id?.trim() ?? "";
  const signature = body.razorpay_signature?.trim() ?? "";

  if (!orderId || !paymentId || !signature) {
    return NextResponse.json(
      { error: "Missing Razorpay verification fields." },
      { status: 400 }
    );
  }

  if (!verifyRazorpaySignature(orderId, paymentId, signature)) {
    return NextResponse.json(
      { error: "Razorpay signature verification failed." },
      { status: 400 }
    );
  }

  try {
    const result = await finalizePayment({
      orderId,
      paymentId,
      signature
    });

    if (!result || !result.business) {
      return NextResponse.json(
        { error: "Payment record could not be matched to a business." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      business: result.business,
      payment: result.payment
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not verify the payment.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
