import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Noir-Brew — Coffee with Character",
  description: "Small-batch coffee, slow evenings, and a room designed for lingering. Visit Noir-Brew on Mercer Street.",
  keywords: ["Noir-Brew", "coffee", "café", "SoHo", "New York"],
  openGraph: {
    title: "Noir-Brew — Coffee with Character",
    description: "Your new nightly coffee ritual in the heart of SoHo.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#100f0d",
  colorScheme: "dark light",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
