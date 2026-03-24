import type { BusinessType } from "@/types/business";

export type BusinessTheme = {
  primary: string;
  secondary: string;
  surface: string;
  border: string;
  glow: string;
  highlight: string;
  muted: string;
};

const themes: Record<BusinessType, BusinessTheme> = {
  cafe: {
    primary: "#f4b73c",
    secondary: "#fff1c9",
    surface: "#f7f0de",
    border: "rgba(244, 183, 60, 0.24)",
    glow: "rgba(244, 183, 60, 0.32)",
    highlight: "#ffddb0",
    muted: "#d4b57a"
  },
  salon: {
    primary: "#f58db0",
    secondary: "#ffd7e8",
    surface: "#fff3f8",
    border: "rgba(245, 141, 176, 0.24)",
    glow: "rgba(245, 141, 176, 0.26)",
    highlight: "#ffbfd5",
    muted: "#d8a8b8"
  },
  clinic: {
    primary: "#5bc58b",
    secondary: "#d4f7e3",
    surface: "#effbf4",
    border: "rgba(91, 197, 139, 0.22)",
    glow: "rgba(91, 197, 139, 0.26)",
    highlight: "#9fe4bc",
    muted: "#a3d6b8"
  },
  gym: {
    primary: "#7a9cff",
    secondary: "#d7e1ff",
    surface: "#eef2ff",
    border: "rgba(122, 156, 255, 0.24)",
    glow: "rgba(122, 156, 255, 0.28)",
    highlight: "#bfd1ff",
    muted: "#aab9df"
  },
  hotel: {
    primary: "#df8268",
    secondary: "#ffd9cf",
    surface: "#fff4ef",
    border: "rgba(223, 130, 104, 0.24)",
    glow: "rgba(223, 130, 104, 0.26)",
    highlight: "#f6b9a8",
    muted: "#d8b0a6"
  }
};

export function getBusinessTheme(type: BusinessType) {
  return themes[type];
}
