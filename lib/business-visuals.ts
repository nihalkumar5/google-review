import type { Locale } from "@/lib/translations";
import type { BusinessType } from "@/types/business";

const showcaseTitles: Record<Locale, Record<BusinessType, string>> = {
  en: {
    cafe: "Coffee, corners, and warm table moments",
    salon: "Mirror glow, clean setup, and fresh results",
    clinic: "Calm spaces, clear care, and clean details",
    gym: "Strong energy, solid equipment, and active frames",
    hotel: "Warm rooms, soft lighting, and stay details"
  },
  hi: {
    cafe: "Coffee, cozy corners, aur warm table moments",
    salon: "Mirror glow, clean setup, aur fresh results",
    clinic: "Calm spaces, clear care, aur clean details",
    gym: "Strong energy, solid equipment, aur active frames",
    hotel: "Warm rooms, soft lighting, aur stay details"
  }
};

export function getVisualShowcaseTitle(type: BusinessType, locale: Locale) {
  return showcaseTitles[locale][type];
}
