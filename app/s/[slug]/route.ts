import { NextResponse } from "next/server";

import { getBusinessBySlug } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const business = await getBusinessBySlug(slug);

  if (!business) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.redirect(new URL(`/r/${slug}`, request.url));
}
