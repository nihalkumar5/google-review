import { notFound } from "next/navigation";

import { ReviewFlow } from "@/components/review-flow";
import { incrementAnalytics } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ReviewPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const business = await incrementAnalytics(slug, "scans");

  if (!business) {
    notFound();
  }

  return <ReviewFlow business={business} />;
}
