import { ClientsSection } from "@/components/home/ClientsSection";
import { EnquiryPopup } from "@/components/home/EnquiryPopup";
import { FeesSection } from "@/components/home/FeesSection";
import { HeroSection } from "@/components/home/HeroSection";
import { HowItWorks } from "@/components/home/HowItWorks";
import { ReviewsSection } from "@/components/home/ReviewsSection";
import { ServicesSection } from "@/components/home/ServicesSection";
import { WhatsAppBand } from "@/components/ui/WhatsAppBand";
import { site } from "@/content/site";
import { readStoredContent } from "@/lib/content-store";
import { mergeHomeContent } from "@/lib/home-content";
import { pageMetadata } from "@/lib/metadata";
import { serviceCardDescriptions } from "@/lib/service-copy";

export const metadata = pageMetadata(site.name, "/");

// Home page, sections in the designed order.
export default async function Home() {
  const stored = await readStoredContent();
  const content = mergeHomeContent(stored);

  return (
    <main>
      <HeroSection content={content} />
      <ClientsSection content={content} />
      <ServicesSection content={content} descriptions={serviceCardDescriptions(stored)} />
      <HowItWorks content={content} />
      <FeesSection content={content} />
      <ReviewsSection content={content} />
      <WhatsAppBand />
      <EnquiryPopup />
    </main>
  );
}
