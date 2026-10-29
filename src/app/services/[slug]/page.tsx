import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { FeeBox } from "@/components/services/FeeBox";
import { IncludedList } from "@/components/services/IncludedList";
import { ServiceCard } from "@/components/services/ServiceCard";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { PageHero } from "@/components/ui/PageHero";
import { WhatsAppBand } from "@/components/ui/WhatsAppBand";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { getServiceDetail } from "@/content/service-details";
import { getService, otherServices, services } from "@/content/services";
import { pageCopy, site } from "@/content/site";

// One static page per service in the services PDF; any other slug is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/services/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  return { title: service ? `${service.name} | ${site.name}` : site.name };
}

const sectionHeading = "text-[30px]/[1.15] md:text-[34px] lg:text-[40px]";

export default async function ServicePage({ params }: PageProps<"/services/[slug]">) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();
  const detail = getServiceDetail(slug);

  return (
    <>
      <PageHero
        title={service.name}
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Services", href: "/#services" },
          { label: service.shortName ?? service.name },
        ]}
      >
        <p className="mt-5 max-w-3xl text-[17px]/[27px] text-on-navy md:text-[19px]/[30px]">
          {pageCopy.serviceShortDescription}
        </p>
        <WhatsAppButton className="mt-8" />
      </PageHero>

      <div className="bg-white">
        <div className="page-container grid items-start gap-12 py-[53px] md:py-[77px] lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-16 lg:py-24">
          <div>
            <section aria-labelledby="overview-heading">
              <Eyebrow>Overview</Eyebrow>
              <h2 id="overview-heading" className={`mt-4 ${sectionHeading}`}>
                About this service
              </h2>
              <div className="mt-5 space-y-4 text-[17px] text-text-body">
                <p>{detail.overview ?? pageCopy.serviceOverviewOne}</p>
                <p>{pageCopy.serviceOverviewTwo}</p>
                {detail.timeline && (
                  <p>
                    <span className="font-semibold text-navy">Estimated timeline: </span>
                    {detail.timeline}
                  </p>
                )}
              </div>
            </section>

            <section aria-labelledby="covers-heading" className="mt-14">
              <Eyebrow>Included</Eyebrow>
              <h2 id="covers-heading" className={`mt-4 ${sectionHeading}`}>
                What this service covers
              </h2>
              <p className="mt-4 mb-7 text-[17px] text-text-muted">{pageCopy.serviceCoversIntro}</p>
              <IncludedList items={detail.included} />
              {detail.note && (
                <p className="mt-6 text-sm text-text-muted">
                  <span className="font-semibold">Please note: </span>
                  {detail.note}
                </p>
              )}
            </section>
          </div>

          <div className="lg:sticky lg:top-8">
            <FeeBox pricing={detail.pricing} notIncluded={detail.notIncluded} />
          </div>
        </div>
      </div>

      <section aria-labelledby="other-services-heading" className="bg-tint">
        <div className="page-container py-[53px] md:py-[77px] lg:py-24">
          <Eyebrow centered>More</Eyebrow>
          <h2
            id="other-services-heading"
            className="mt-4 text-center text-[34px] md:text-[40px] lg:text-[48px]"
          >
            Other Services
          </h2>
          <p className="mt-3 text-center text-lg text-text-muted">{pageCopy.otherServicesIntro}</p>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {otherServices(slug).map((other) => (
              <ServiceCard key={other.slug} service={other} />
            ))}
          </div>
        </div>
      </section>

      <WhatsAppBand />
    </>
  );
}
