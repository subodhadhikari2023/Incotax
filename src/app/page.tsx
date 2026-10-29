import { ClientsSection } from "@/components/home/ClientsSection";
import { FeesSection } from "@/components/home/FeesSection";
import { HeroSection } from "@/components/home/HeroSection";
import { HowItWorks } from "@/components/home/HowItWorks";
import { ReviewsSection } from "@/components/home/ReviewsSection";
import { ServicesSection } from "@/components/home/ServicesSection";
import { WhatsAppBand } from "@/components/ui/WhatsAppBand";

// Home page, sections in the order of CLAUDE.md §6.1.
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
    </main>
  );
}
