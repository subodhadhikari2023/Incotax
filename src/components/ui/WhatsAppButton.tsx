"use client";

import { WhatsAppIcon } from "@/components/icons";
import { useSiteCopy } from "@/components/SiteCopy";
import { useWhatsAppNumber } from "@/components/WhatsAppNumber";
import { whatsappLink } from "@/lib/whatsapp";

const variants = {
  gold: "bg-gold text-navy shadow-button hover:bg-gold-arrow",
  navy: "bg-navy text-white hover:bg-navy-deep",
  outline: "border-[1.5px] border-navy bg-white text-navy hover:bg-bg",
};

// Opens WhatsApp in a new tab, using the saved number. With no message of its own (a service page
// may have one), it uses the site-wide message.
export function WhatsAppButton({
  label = "Chat on WhatsApp",
  variant = "gold",
  className = "",
  message,
}: {
  label?: string;
  variant?: keyof typeof variants;
  className?: string;
  message?: string | null;
}) {
  const whatsappNumber = useWhatsAppNumber();
  const copy = useSiteCopy();
  return (
    <a
      href={whatsappLink(whatsappNumber, message ?? copy.whatsappMessage)}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2.5 rounded-lg px-7 py-3.5 text-base font-semibold transition-colors ${variants[variant]} ${className}`}
    >
      <WhatsAppIcon />
      {label}
    </a>
  );
}
