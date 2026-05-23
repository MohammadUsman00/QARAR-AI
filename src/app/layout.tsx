import type { Metadata, Viewport } from "next";
import {
  Cinzel,
  Cormorant_Garamond,
  JetBrains_Mono,
  Lora,
} from "next/font/google";
import "./globals.css";

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cinzel",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-lora",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Qarar — Royal Decision Intelligence",
  description:
    "Forensic autopsy of the decisions you regret. Premium cognitive intelligence — not therapy. Precision.",
};

export const viewport: Viewport = {
  themeColor: "#05040a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cinzel.variable} ${cormorant.variable} ${lora.variable} ${jetbrains.variable}`}
    >
      <body className="min-h-screen bg-bg-primary font-sans">{children}</body>
    </html>
  );
}
