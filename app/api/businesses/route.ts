import { NextResponse } from "next/server";

import { isBusinessType, isPlanType } from "@/lib/business-types";
import { createBusiness, listBusinesses, normalizeWhatsappNumber } from "@/lib/db";

export const runtime = "nodejs";

function isValidUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export async function GET() {
  const businesses = await listBusinesses();
  return NextResponse.json({ businesses });
}

export async function POST(request: Request) {
  const body = (await request.json()) as Record<string, string | undefined>;

  const name = body.name?.trim() ?? "";
  const type = body.type?.trim() ?? "";
  const plan = body.plan?.trim() ?? "";
  const googleReviewLink = body.googleReviewLink?.trim() ?? "";
  const whatsappNumber = body.whatsappNumber?.trim() ?? "";

  if (!name || !type || !plan || !googleReviewLink || !whatsappNumber) {
    return NextResponse.json(
      {
        error:
          "Name, business type, plan, Google review link, and WhatsApp number are required."
      },
      { status: 400 }
    );
  }

  if (!isBusinessType(type)) {
    return NextResponse.json(
      { error: "Please choose a valid business type." },
      { status: 400 }
    );
  }

  if (!isPlanType(plan)) {
    return NextResponse.json(
      { error: "Please choose a valid plan." },
      { status: 400 }
    );
  }

  if (!isValidUrl(googleReviewLink)) {
    return NextResponse.json(
      { error: "Please provide a valid Google review URL." },
      { status: 400 }
    );
  }

  if (normalizeWhatsappNumber(whatsappNumber).length < 8) {
    return NextResponse.json(
      { error: "Please provide a valid WhatsApp number with country code." },
      { status: 400 }
    );
  }

  const business = await createBusiness({
    name,
    type,
    plan,
    googleReviewLink,
    whatsappNumber
  });

  return NextResponse.json({ business }, { status: 201 });
}
