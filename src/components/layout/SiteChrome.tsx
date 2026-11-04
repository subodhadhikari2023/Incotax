import { WhatsAppNumberProvider } from "@/components/WhatsAppNumber";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { TopBar } from "@/components/layout/TopBar";
import { getBusinessDetails } from "@/lib/business";
import { businessJsonLd } from "@/lib/structured-data";

// What every public page shares. Used by the (site) layout and the 404 page, which renders
// outside that layout.
export async function SiteChrome({ children }: { children: React.ReactNode }) {
  const business = await getBusinessDetails();

  return (
    <WhatsAppNumberProvider number={business.whatsappNumber}>
      <script
        type="application/ld+json"
        // Built from our own content files; escape "<" so the JSON can't close the tag.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(businessJsonLd(business)).replace(/</g, "\\u003c"),
        }}
      />
      <TopBar business={business} />
      <Header />
      <div className="flex flex-1 flex-col">{children}</div>
      <Footer business={business} />
    </WhatsAppNumberProvider>
  );
}
