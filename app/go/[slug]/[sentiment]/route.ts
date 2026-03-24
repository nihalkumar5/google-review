import { NextResponse } from "next/server";

import { buildWhatsAppLink, getBusinessBySlug, incrementAnalytics } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  {
    params
  }: {
    params: Promise<{ slug: string; sentiment: string }>;
  }
) {
  const { slug, sentiment } = await params;
  const business = await getBusinessBySlug(slug);

  if (!business) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (sentiment === "positive") {
    await incrementAnalytics(slug, "positiveClicks");
    return NextResponse.redirect(new URL(business.googleReviewLink));
  }

  if (sentiment !== "negative") {
    return NextResponse.redirect(new URL(`/r/${slug}`, request.url));
  }

  await incrementAnalytics(slug, "negativeClicks");
  return NextResponse.redirect(new URL(buildWhatsAppLink(business)));
}
