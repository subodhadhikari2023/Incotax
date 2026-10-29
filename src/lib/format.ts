const inr = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

/** Formats a rupee amount with Indian digit grouping, e.g. 150000 → "₹1,50,000". */
export function formatINR(amount: number): string {
  return `₹${inr.format(amount)}`;
}
