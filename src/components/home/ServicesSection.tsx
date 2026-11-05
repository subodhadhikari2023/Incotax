import { ServiceCard } from "@/components/services/ServiceCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { home } from "@/content/home";
import { getService, type Service } from "@/content/services";
import type { HomeNodes } from "@/lib/home-content";

// Navy "Our Services" section with the selected services. id="services" is the target of the
// footer and breadcrumb "Services" links (/#services).
export function ServicesSection({
  content = home,
  descriptions = {},
  services,
}: {
  content?: HomeNodes;
  /** Saved card text by service slug. */
  descriptions?: Record<string, React.ReactNode>;
  /** The services that can be shown, when some were added or hidden in the panel. */
  services?: Service[];
}) {
  const find = (slug: string) =>
    services ? services.find((service) => service.slug === slug) : getService(slug);
  const selected = content.serviceSlugs.map(find).filter((s): s is Service => Boolean(s));

  return (
    <section id="services" aria-labelledby="services-heading" className="scroll-mt-4 bg-navy">
      <div className="page-container py-[53px] md:py-[77px] lg:py-24">
        <SectionHeader
          id="services-heading"
          eyebrow="Services"
          title="Our Services"
          intro={content.servicesIntro}
          onNavy
        />
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {selected.map((service) => (
            <ServiceCard
              key={service.slug}
              service={service}
              description={descriptions[service.slug]}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
