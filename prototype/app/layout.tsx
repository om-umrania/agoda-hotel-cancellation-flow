import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Voya and Agoda, cancellation flow",
  description:
    "A working prototype of a self-serve hotel cancellation flow for an Android and iOS app, powered by Agoda's Demand API. Switch iOS or Android, wireframe or design, and try real situations and corner cases.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
