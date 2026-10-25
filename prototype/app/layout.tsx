import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Caveat } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });
const hand = Caveat({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-hand", display: "swap" });

export const metadata: Metadata = {
  title: "Voya × Agoda — Cancellation Flow",
  description:
    "Interactive prototype: an Android hotel-cancellation flow for Voya, powered by Agoda's Demand API. Wireframe ⇄ hi-fi, the full flow, and 55 corner cases.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${mono.variable} ${hand.variable}`}>{children}</body>
    </html>
  );
}
