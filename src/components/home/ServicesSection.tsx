import { ServiceCard } from "@/components/services/ServiceCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { home } from "@/content/home";
import { getService, type Service } from "@/content/services";

// Navy "Our Services" section with the selected services. id="services" is the target of the
// footer and breadcrumb "Services" links (/#services).
export function ServicesSection() {
  const selected = home.serviceSlugs.map(getService).filter((s): s is Service => Boolean(s));

  return (
    <section id="services" aria-labelledby="services-heading" className="scroll-mt-4 bg-navy">
      <div className="page-container py-[53px] md:py-[77px] lg:py-24">
        <SectionHeader
          id="services-heading"
          eyebrow="Services"
          title="Our Services"
          intro={home.servicesIntro}
          onNavy
        />
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {selected.map((service) => (
            <ServiceCard key={service.slug} service={service} />
          ))}
        </div>
      </div>
    </section>
  );
}
