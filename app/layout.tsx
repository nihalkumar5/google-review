import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Sora } from "next/font/google";
import type { ReactNode } from "react";

import { LanguageProvider } from "@/components/language-provider";

import "./globals.css";

const bodyFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap"
});

const displayFont = Sora({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap"
});

export const metadata: Metadata = {
  title: "SmartReview QR SaaS",
  description:
    "Boost Google reviews with QR codes that route happy customers to Google and unhappy customers to private WhatsApp feedback."
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${bodyFont.variable} ${displayFont.variable} font-body antialiased`}
      >
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
