import { CheckIcon } from "@/components/icons";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { home } from "@/content/home";
import { getServiceDetail } from "@/content/service-details";
import { formatINR } from "@/lib/format";

// Fees: the Private Limited plans, Standard raised and highlighted (Subodh, Oct 29). Prices come
// from the service data so they always match the service page. 3 across from tablet up.
export function FeesSection() {
  const { fees } = home;
  const plans = getServiceDetail(fees.serviceSlug).plans ?? [];

  return (
    <section aria-labelledby="fees-heading" className="bg-white">
      <div className="page-container py-[53px] md:py-[77px] lg:py-24">
        <SectionHeader id="fees-heading" eyebrow="Fees" title="Fees" intro={fees.intro} />
        <div className="mt-12 grid items-center gap-6 md:grid-cols-3">
          {plans.map((plan) => {
            const featured = plan.id === fees.featuredPlan;
            return (
              <article
                key={plan.id}
                data-featured={featured}
                className={
                  featured
                    ? "rounded-[20px] bg-navy p-8 text-white shadow-raised md:py-10"
                    : "rounded-[20px] border border-border bg-bg p-8"
                }
              >
                {featured && (
                  <p className="mb-4 inline-block rounded-md bg-gold px-2.5 py-1 text-[11px] font-semibold tracking-[0.08em] text-navy uppercase">
                    {fees.featuredTag}
                  </p>
                )}
                <h3
                  className={`font-sans text-lg font-semibold ${featured ? "text-white" : "text-navy"}`}
                >
                  {`${fees.serviceLabel} – ${plan.name}`}
                </h3>
                <p
                  className={`mt-4 font-heading text-[48px] leading-none font-bold ${featured ? "text-gold" : "text-navy"}`}
                >
                  {formatINR(plan.price)}
                </p>
                <p className={`mt-3 text-sm ${featured ? "text-on-navy" : "text-text-muted"}`}>
                  Starting from (professional fee)
                </p>
                <ul className="mt-6 space-y-3 text-[15px]">
                  {fees.highlights.map((highlight, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <CheckIcon
                        className={`text-sm ${featured ? "text-gold" : "text-gold-deep"}`}
                      />
                      <span className={featured ? "font-semibold" : ""}>{highlight}</span>
                    </li>
                  ))}
                </ul>
                <WhatsAppButton variant={featured ? "gold" : "outline"} className="mt-8 w-full" />
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
