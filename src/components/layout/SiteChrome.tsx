import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { TopBar } from "@/components/layout/TopBar";
import { businessJsonLd } from "@/lib/structured-data";

// What every public page shares. Used by the (site) layout and the 404 page, which renders
// outside that layout.
export function SiteChrome({ children }: { children: React.ReactNode }) {
  return (
    <>
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
    </>
  );
}
