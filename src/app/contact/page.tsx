import type { Metadata } from "next";

import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { contactIcons, Icon } from "@/components/icons";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { PageHero } from "@/components/ui/PageHero";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { contact } from "@/content/pages";
import { site } from "@/content/site";

export const metadata: Metadata = { title: `Contact Us | ${site.name}` };

const details = [
  { label: "Phone", value: site.phone, icon: contactIcons.phone },
  { label: "Email", value: site.email, icon: contactIcons.email },
  { label: "Office", value: site.address, icon: contactIcons.office },
  { label: "Hours", value: site.hours, icon: contactIcons.hours },
];

// Contact Us: form card + navy WhatsApp card + details list + social links + map block
// (CLAUDE.md §6.4). The form sends to WhatsApp like the pop-up (destination PENDING).
export default function ContactPage() {
  return (
    <main>
      <PageHero
        size="inner"
        title={contact.title}
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Contact Us" }]}
      >
        <p className="mt-5 max-w-3xl text-[17px]/[27px] text-on-navy md:text-[19px]/[30px]">
          {contact.intro}
        </p>
      </PageHero>

      <div className="bg-white">
        <div className="page-container grid items-start gap-10 py-[53px] md:py-[77px] lg:grid-cols-[minmax(0,1fr)_440px] lg:gap-14 lg:py-24">
          <section
            aria-labelledby="form-heading"
            className="rounded-[20px] border border-border bg-bg p-6 md:p-10"
          >
            <Eyebrow>Write to us</Eyebrow>
            <h2 id="form-heading" className="mt-4 text-[32px]/[1.15] md:text-[38px] lg:text-[44px]">
              {contact.formHeading}
            </h2>
            <p className="mt-3 mb-7 text-[17px] text-text-muted">{contact.formLine}</p>
            <EnquiryForm idPrefix="contact" label="Contact form" withMessage twoColumns />
          </section>

          <div className="space-y-6">
            <section
              aria-labelledby="whatsapp-card-heading"
              className="rounded-[20px] bg-navy p-7 text-white shadow-raised md:p-9"
            >
              <Eyebrow onNavy>{contact.whatsappLabel}</Eyebrow>
              <h2
                id="whatsapp-card-heading"
                className="mt-4 text-[30px]/[1.15] text-white md:text-[34px] lg:text-[38px]"
              >
                {contact.whatsappHeading}
              </h2>
              <p className="mt-3 text-[17px] text-on-navy">{contact.whatsappLine}</p>
              <WhatsAppButton className="mt-7 w-full" />
            </section>

            <ul className="rounded-[20px] border border-border bg-white px-7 py-2">
              {details.map((d) => (
                <li
                  key={d.label}
                  className="flex items-center gap-4 border-b border-border py-5 last:border-b-0"
                >
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gold-tint text-navy">
                    <Icon icon={d.icon} className="text-base" />
                  </span>
                  <div>
                    <p className="text-[13px] font-semibold tracking-[0.1em] text-text-muted uppercase">
                      {d.label}
                    </p>
                    <p className="text-[17px] font-semibold text-navy">{d.value}</p>
                  </div>
                </li>
              ))}
            </ul>
            <p className="text-[15px] text-text-muted">{site.socialLinks}</p>
          </div>
        </div>
      </div>

      <section aria-labelledby="map-heading" className="bg-tint">
        <div className="page-container py-[53px] md:py-[77px] lg:py-24">
          <Eyebrow as="h2" id="map-heading">
            Find the office
          </Eyebrow>
          {/* Map embed goes here once the office address is chosen (CLAUDE.md §10). */}
          <div className="mt-6 flex h-[280px] items-center justify-center rounded-[20px] bg-placeholder text-center text-sm text-text-muted md:h-[380px]">
            {contact.map}
          </div>
        </div>
      </section>
    </main>
  );
}
