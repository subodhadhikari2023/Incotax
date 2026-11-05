import { FeeBox, type FeePricing } from "@/components/services/FeeBox";
import { IncludedList, type IncludedItemNodes } from "@/components/services/IncludedList";
import { ServiceCard } from "@/components/services/ServiceCard";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { PageHero } from "@/components/ui/PageHero";
import { WhatsAppBand } from "@/components/ui/WhatsAppBand";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { otherServices, type Service } from "@/content/services";

const sectionHeading = "text-[30px]/[1.15] md:text-[34px] lg:text-[40px]";

/** What a service page shows beyond its text. */
export type ServiceDetailNodes = {
  included: IncludedItemNodes[];
  pricing: FeePricing;
  notIncluded?: React.ReactNode;
  timeline?: React.ReactNode;
  note?: React.ReactNode;
};

// One service's page. The public page and the panel both draw this.
export function ServiceView({
  service,
  detail,
  copy,
  message,
  coversIntro,
  otherServicesIntro,
  descriptions,
  slots = {},
}: {
  service: Service;
  detail: ServiceDetailNodes;
  copy: {
    shortDescription: React.ReactNode;
    overviewOne: React.ReactNode;
    overviewTwo: React.ReactNode;
  };
  message: string | null;
  coversIntro: React.ReactNode;
  otherServicesIntro: React.ReactNode;
  descriptions: Record<string, React.ReactNode>;
  /** The panel's controls for what can be added or chosen. */
  slots?: {
    included?: React.ReactNode;
    feeBefore?: React.ReactNode;
    priceRows?: React.ReactNode;
  };
}) {
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
          {copy.shortDescription}
        </p>
        <WhatsAppButton message={message} className="mt-8" />
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
                <p>{copy.overviewOne}</p>
                <p>{copy.overviewTwo}</p>
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
              <p className="mt-4 mb-7 text-[17px] text-text-muted">{coversIntro}</p>
              <IncludedList items={detail.included} />
              {slots.included}
              {detail.note && (
                <p className="mt-6 text-sm text-text-muted">
                  <span className="font-semibold">Please note: </span>
                  {detail.note}
                </p>
              )}
            </section>
          </div>

          <div className="lg:sticky lg:top-8">
            <FeeBox
              pricing={detail.pricing}
              notIncluded={detail.notIncluded}
              message={message}
              before={slots.feeBefore}
              rowsAfter={slots.priceRows}
            />
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
          <p className="mt-3 text-center text-lg text-text-muted">{otherServicesIntro}</p>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {otherServices(service.slug).map((other) => (
              <ServiceCard
                key={other.slug}
                service={other}
                description={descriptions[other.slug]}
              />
            ))}
          </div>
        </div>
      </section>

      <WhatsAppBand message={message} />
    </>
  );
}
