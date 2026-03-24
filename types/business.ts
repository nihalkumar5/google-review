export const businessTypes = ["cafe", "salon", "clinic", "gym", "hotel"] as const;

export type BusinessType = (typeof businessTypes)[number];

export type Analytics = {
  scans: number;
  positiveClicks: number;
  negativeClicks: number;
};

export type Business = {
  id: string;
  slug: string;
  name: string;
  type: BusinessType;
  googleReviewLink: string;
  whatsappNumber: string;
  createdAt: string;
  analytics: Analytics;
};

export type Database = {
  businesses: Business[];
};

export type CreateBusinessInput = {
  name: string;
  type: BusinessType;
  googleReviewLink: string;
  whatsappNumber: string;
};

export type AnalyticsKey = keyof Analytics;
export type Sentiment = "positive" | "negative";
