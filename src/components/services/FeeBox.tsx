import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { formatINR } from "@/lib/format";

/** A fee: numbers and text on the public page, editable elements in the admin panel. */
export type FeePricing =
  | {
      kind: "from" | "fixed";
      amount: number | React.ReactNode;
      suffix?: React.ReactNode;
      rows: { label: React.ReactNode; value: React.ReactNode }[];
    }
  | { kind: "quote"; text: React.ReactNode };

// Navy fee card on a service page. "Starting from" is the lowest price (Subodh, Oct 29); quote-only
// services show no price, only a WhatsApp quote button.
export function FeeBox({
  pricing,
  notIncluded,
  message,
  before,
  rowsAfter,
}: {
  pricing: FeePricing;
  notIncluded?: React.ReactNode;
  /** The panel's choice of how the fee is shown. */
  before?: React.ReactNode;
  /** The panel's add control for price rows. */
  rowsAfter?: React.ReactNode;
  /** This service's WhatsApp message (see whatsappMessageFor). */
  message?: string | null;
}) {
  return (
    <section
      aria-labelledby="fee-heading"
      className="rounded-[20px] bg-navy p-7 text-white shadow-raised md:p-9"
    >
      <h2 id="fee-heading" className="font-sans text-xl font-semibold text-white">
        Fee for this service
      </h2>
      {before}

      {pricing.kind === "quote" ? (
        <>
          <p className="mt-4 text-[15px] text-on-navy">{pricing.text}</p>
          <WhatsAppButton
            label="Get a quote on WhatsApp"
            message={message}
            className="mt-7 w-full"
          />
        </>
      ) : (
        <>
          <p className="mt-4 text-[15px] text-on-navy">
            {pricing.kind === "fixed" ? "Fixed fee" : "Starting from"}
          </p>
          <p className="font-heading text-[48px] leading-tight font-bold text-gold">
            {typeof pricing.amount === "number" ? formatINR(pricing.amount) : pricing.amount}
          </p>
          {pricing.suffix && <p className="text-sm text-on-navy">{pricing.suffix}</p>}

          {(pricing.rows.length > 0 || rowsAfter) && (
            <div className="mt-6 border-t border-navy-line pt-6">
              <h3 className="font-sans text-[13px] font-semibold tracking-[0.1em] text-gold uppercase">
                Price breakdown
              </h3>
              <dl className="mt-4 space-y-3 text-[15px]">
                {pricing.rows.map((row, i) => (
                  <div key={i} className="relative flex justify-between gap-4">
                    <dt className="font-semibold">{row.label}</dt>
                    <dd className="shrink-0 text-right font-semibold">{row.value}</dd>
                  </div>
                ))}
              </dl>
              {rowsAfter}
            </div>
          )}

          {notIncluded && (
            <p className="mt-6 border-t border-navy-line pt-6 text-sm text-on-navy">
              Not included: {notIncluded}
            </p>
          )}
          <WhatsAppButton message={message} className="mt-7 w-full" />
        </>
      )}
    </section>
  );
}
