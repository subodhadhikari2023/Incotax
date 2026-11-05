import { SiteCopyProvider } from "@/components/SiteCopy";
import { WhatsAppNumberProvider } from "@/components/WhatsAppNumber";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { TopBar } from "@/components/layout/TopBar";
import { mergeBusinessDetails } from "@/lib/business";
import { readStoredContent } from "@/lib/content-store";
import { mergeSiteCopy } from "@/lib/site-copy";
import { businessJsonLd } from "@/lib/structured-data";

// What every public page shares. Used by the (site) layout and the 404 page, which renders
// outside that layout.
export async function SiteChrome({ children }: { children: React.ReactNode }) {
  const content = await readStoredContent();
  const business = mergeBusinessDetails(content);

  return (
    <WhatsAppNumberProvider number={business.whatsappNumber}>
      <script
        type="application/ld+json"
        // Built from our own content files; escape "<" so the JSON can't close the tag.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(businessJsonLd(business)).replace(/</g, "\\u003c"),
        }}
      />
      <SiteCopyProvider copy={mergeSiteCopy(content)}>
        <TopBar business={business} />
        <Header />
        <div className="flex flex-1 flex-col">{children}</div>
        <Footer business={business} />
      </SiteCopyProvider>
    </WhatsAppNumberProvider>
  );
}
