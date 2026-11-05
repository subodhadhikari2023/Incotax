"use client";

import { useSiteCopy } from "@/components/SiteCopy";

import { WhatsAppButton } from "./WhatsAppButton";

// Gold call-to-action band near the bottom of most pages. Service pages pass
// that service's message; elsewhere the site-wide one is used.
export function WhatsAppBand({ message }: { message?: string | null }) {
  const { band } = useSiteCopy();

  return (
    <section className="bg-gold text-navy">
      <div className="page-container flex flex-col gap-7 py-14 md:py-16 lg:flex-row lg:items-center lg:justify-between lg:py-20">
        <div>
          <h2 className="text-[34px]/[1.15] md:text-[40px] lg:text-[48px]">{band.heading}</h2>
          <p className="mt-3 text-lg">{band.line}</p>
        </div>
        <WhatsAppButton variant="navy" message={message} className="self-start lg:self-auto" />
      </div>
    </section>
  );
}
