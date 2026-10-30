import { whyIncotax } from "@/content/pages";
import { site } from "@/content/site";

import { siteUrl } from "./site-url";

/** Bracketed values are PENDING placeholders and must not reach search engines. */
const known = (value: string) => (value.includes("[") ? undefined : value);

/** schema.org LegalService description of the firm, rendered as JSON-LD in the root layout. */
export function businessJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "LegalService",
    name: site.name,
    slogan: site.tagline,
    url: siteUrl(),
    founder: whyIncotax.founders.map((f) => ({
      "@type": "Person",
      name: f.name,
      jobTitle: f.role,
    })),
    telephone: known(site.phone),
    email: known(site.email),
    address: known(site.address),
  };
  // Drop the fields that are still pending.
  return Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined));
}
