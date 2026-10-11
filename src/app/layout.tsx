import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";

// Body text: Inter 400, with 600 for labels, nav links and buttons.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "600"],
});

// Headings: Cormorant Garamond 700, italic for the gold hero phrase.
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: "700",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "IncoTax Legal Services",
  description: "Your Trust, Our Commitment!",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${cormorant.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
