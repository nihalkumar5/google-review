import enMessages from "@/messages/en.json";
import hiMessages from "@/messages/hi.json";

export const messages = {
  en: enMessages,
  hi: hiMessages
} as const;

export type Locale = keyof typeof messages;
export type MessageTree = (typeof messages)["en"];

export const localeOptions: Locale[] = ["en", "hi"];
