import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { contactIcons, Icon } from "@/components/icons";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { PageHero } from "@/components/ui/PageHero";
import { SocialLinks } from "@/components/ui/SocialLinks";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import type { contact as contactContent } from "@/content/pages";
import type { BusinessNodes } from "@/lib/business";
import type { Nodes } from "@/lib/editable-content";

// Contact Us: form card + navy WhatsApp card + details list + social links + map block.
// The form sends to WhatsApp like the pop-up (destination PENDING). The public page and the panel
// both draw this.
export function ContactView({
  contact,
  business,
  map = null,
  mapEdit,
  preview = false,
}: {
  contact: Nodes<typeof contactContent>;
  business: BusinessNodes;
  /** The office map (see officeMap); null hides the block. */
  map?: { embed: string | null; open: string } | null;
  /** The panel's Google Maps link field. With it, the block stays on screen. */
  mapEdit?: React.ReactNode;
  /** The panel shows the form as it looks, with nothing to fill in. */
  preview?: boolean;
}) {
  const details = [
    { label: "Phone", value: business.phone, icon: contactIcons.phone },
    { label: "Email", value: business.email, icon: contactIcons.email },
    { label: "Office", value: business.address, icon: contactIcons.office },
    { label: "Hours", value: business.hours, icon: contactIcons.hours },
  ];

  return (
    <>
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
            <EnquiryForm
              idPrefix="contact"
              label="Contact form"
              withMessage
              twoColumns
              preview={preview}
              serviceFromAddress
            />
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
            <SocialLinks links={business} tone="light" />
          </div>
        </div>
      </div>

      {(map || mapEdit) && (
        <section aria-labelledby="map-heading" className="bg-tint">
          <div className="page-container py-[53px] md:py-[77px] lg:py-24">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <Eyebrow as="h2" id="map-heading">
                Find the office
              </Eyebrow>
              {map && (
                <a
                  href={map.open}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center gap-2 rounded-lg border-[1.5px] border-navy bg-white px-5 font-semibold text-navy hover:bg-bg"
                >
                  <Icon icon={contactIcons.office} className="text-base" />
                  Open in Google Maps
                </a>
              )}
            </div>
            {mapEdit}
            {map?.embed ? (
              <iframe
                title="Office location map"
                src={map.embed}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="mt-6 h-[280px] w-full rounded-[20px] border-0 md:h-[380px]"
              />
            ) : (
              !map && (
                <div className="mt-6 flex h-[280px] items-center justify-center rounded-[20px] bg-placeholder text-center text-sm text-text-muted md:h-[380px]">
                  The map appears once the office address or a Google Maps link is added.
                </div>
              )
            )}
          </div>
        </section>
      )}
    </>
  );
}
