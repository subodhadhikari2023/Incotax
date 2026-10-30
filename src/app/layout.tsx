import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { TopBar } from "@/components/layout/TopBar";
import { site } from "@/content/site";
import { openGraphDefaults } from "@/lib/metadata";
import { siteUrl } from "@/lib/site-url";
import { businessJsonLd } from "@/lib/structured-data";

// Font Awesome CSS is imported above; stop it injecting a second copy at runtime.
config.autoAddCss = false;

// Fonts come from the installed @fontsource packages (no Google download at build time);
// next/font/local still self-hosts, preloads and sizes the fallback to limit layout shift.
// Paths must be plain string literals (next/font rejects template strings). next/font names each
// font after its variable ("inter", "cormorant"); fallback stacks are in globals.css.

// Body text: Inter 400, with 600 for labels, nav links and buttons.
const inter = localFont({
  variable: "--font-inter",
  src: [
    {
      path: "../../node_modules/@fontsource/inter/files/inter-latin-400-normal.woff2",
      weight: "400",
    },
    {
      path: "../../node_modules/@fontsource/inter/files/inter-latin-600-normal.woff2",
      weight: "600",
    },
  ],
});

// Headings: Cormorant Garamond 700, italic for the gold hero phrase.
const cormorant = localFont({
  variable: "--font-cormorant",
  src: [
    {
      path: "../../node_modules/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-700-normal.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../node_modules/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-700-italic.woff2",
      weight: "700",
      style: "italic",
    },
  ],
  adjustFontFallback: "Times New Roman",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: site.name,
  description: site.tagline,
  openGraph: { ...openGraphDefaults, title: site.name, description: site.tagline },
  twitter: { card: "summary" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${cormorant.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <script
          type="application/ld+json"
          // Built from our own content files; escape "<" so the JSON can't close the tag.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(businessJsonLd()).replace(/</g, "\\u003c"),
          }}
        />
        <TopBar />
        <Header />
        <div className="flex flex-1 flex-col">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
