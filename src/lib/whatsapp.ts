/**
 * Builds a WhatsApp click-to-chat link. With no number (still pending), wa.me/ opens
 * WhatsApp's contact picker, so buttons keep working until the real number is set.
 */
export function whatsappLink(number: string | null, message?: string | null): string {
  const digits = number ? number.replace(/\D/g, "") : "";
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${digits}${text}`;
}
