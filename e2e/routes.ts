import { services } from "../src/content/services";
import { legalLinks } from "../src/content/site";

// Every public page, for checks that must cover the whole site (accessibility, security).
export const routes = [
  "/",
  "/why-incotax",
  "/contact",
  ...services.map((s) => `/services/${s.slug}`),
  ...legalLinks.map((l) => l.href),
];
