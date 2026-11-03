import { ClientsSection } from "@/components/home/ClientsSection";
import { EnquiryPopup } from "@/components/home/EnquiryPopup";
import { FeesSection } from "@/components/home/FeesSection";
import { HeroSection } from "@/components/home/HeroSection";
import { HowItWorks } from "@/components/home/HowItWorks";
import { ReviewsSection } from "@/components/home/ReviewsSection";
import { ServicesSection } from "@/components/home/ServicesSection";
import { WhatsAppBand } from "@/components/ui/WhatsAppBand";
import { site } from "@/content/site";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(site.name, "/");

// Home page, sections in the designed order.
export default function Home() {
  return (
    <main>
      <HeroSection />
      <ClientsSection />
      <ServicesSection />
      <HowItWorks />
      <FeesSection />
      <ReviewsSection />
      <WhatsAppBand />
      <EnquiryPopup />
    </main>
  );
}
