import type { Metadata } from "next";
import {
  Cormorant_Garamond,
  DM_Sans,
  JetBrains_Mono,
  Syne,
} from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Qarar — Decision Autopsy",
  description:
    "A forensic autopsy of why you made the decision you regret. Not therapy. Precision.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${syne.variable} ${dmSans.variable} ${jetbrains.variable}`}
    >
      <body className="min-h-screen bg-bg-primary">{children}</body>
    </html>
  );
}
