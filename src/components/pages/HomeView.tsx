import { ClientsSection } from "@/components/home/ClientsSection";
import { FeesSection } from "@/components/home/FeesSection";
import { HeroSection } from "@/components/home/HeroSection";
import { HowItWorks } from "@/components/home/HowItWorks";
import { ReviewsSection } from "@/components/home/ReviewsSection";
import { ServicesSection } from "@/components/home/ServicesSection";
import { WhatsAppBand } from "@/components/ui/WhatsAppBand";
import type { Plan } from "@/content/service-details";
import type { HomeNodes } from "@/lib/home-content";

/** The panel's add controls, one per list. */
export type HomeSlots = {
  stats?: React.ReactNode;
  clients?: React.ReactNode;
  steps?: React.ReactNode;
  highlights?: React.ReactNode;
  reviews?: React.ReactNode;
};

// Home page, sections in the designed order. The public page and the panel both draw this.
export function HomeView({
  content,
  descriptions,
  plainHighlights,
  feePlans,
  slots = {},
}: {
  content: HomeNodes;
  descriptions: Record<string, React.ReactNode>;
  plainHighlights?: string[];
  feePlans?: Plan[];
  slots?: HomeSlots;
}) {
  return (
    <>
      <HeroSection content={content} statsAfter={slots.stats} />
      <ClientsSection content={content} after={slots.clients} />
      <ServicesSection content={content} descriptions={descriptions} />
      <HowItWorks content={content} after={slots.steps} />
      <FeesSection
        content={content}
        after={slots.highlights}
        plainHighlights={plainHighlights}
        plans={feePlans}
      />
      <ReviewsSection content={content} after={slots.reviews} />
      <WhatsAppBand />
    </>
  );
}
