import { pageCopy } from "@/content/site";

import { WhatsAppButton } from "./WhatsAppButton";

// Gold call-to-action band near the bottom of most pages (CLAUDE.md §6).
export function WhatsAppBand() {
  return (
    <section className="bg-gold text-navy">
      <div className="page-container flex flex-col gap-7 py-14 md:py-16 lg:flex-row lg:items-center lg:justify-between lg:py-20">
        <div>
          <h2 className="text-[34px]/[1.15] md:text-[40px] lg:text-[48px]">
            {pageCopy.whatsappBandHeading}
          </h2>
          <p className="mt-3 text-lg">{pageCopy.whatsappBandLine}</p>
        </div>
        <WhatsAppButton variant="navy" className="self-start lg:self-auto" />
      </div>
    </section>
  );
}
