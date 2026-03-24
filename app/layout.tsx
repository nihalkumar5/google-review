import type { Metadata } from "next";
import type { ReactNode } from "react";

import { LanguageProvider } from "@/components/language-provider";

import "./globals.css";

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
      <body className="font-body antialiased">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
