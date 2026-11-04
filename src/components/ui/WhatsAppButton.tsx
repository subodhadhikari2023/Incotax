"use client";

import { WhatsAppIcon } from "@/components/icons";
import { useWhatsAppNumber } from "@/components/WhatsAppNumber";
import { site } from "@/content/site";
import { whatsappLink } from "@/lib/whatsapp";

const variants = {
  gold: "bg-gold text-navy shadow-button hover:bg-gold-arrow",
  navy: "bg-navy text-white hover:bg-navy-deep",
  outline: "border-[1.5px] border-navy bg-white text-navy hover:bg-bg",
};

// Opens WhatsApp in a new tab, using the saved number; the default message comes from site.ts.
export function WhatsAppButton({
  label = "Chat on WhatsApp",
  variant = "gold",
  className = "",
  message = site.whatsappMessage,
}: {
  label?: string;
  variant?: keyof typeof variants;
  className?: string;
  message?: string | null;
}) {
  const whatsappNumber = useWhatsAppNumber();
  return (
    <a
      href={whatsappLink(whatsappNumber, message)}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2.5 rounded-lg px-7 py-3.5 text-base font-semibold transition-colors ${variants[variant]} ${className}`}
    >
      <WhatsAppIcon />
      {label}
    </a>
  );
}
