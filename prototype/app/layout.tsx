import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Voya hotel cancellation, Android prototype",
  description: "Interactive prototype of a hotel cancellation flow for Voya on Android, using simulated Agoda API responses.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
