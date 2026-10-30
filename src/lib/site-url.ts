/**
 * The site's public address, for absolute links (sitemap, canonical, Open Graph). SITE_URL wins;
 * on Netlify the built-in URL variable holds the main domain at build time; locally, the dev server.
 */
export function siteUrl(): string {
  const url = process.env.SITE_URL || process.env.URL || "http://localhost:3000";
  return url.replace(/\/+$/, "");
}
