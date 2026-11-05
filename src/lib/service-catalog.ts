import { home } from "@/content/home";
import { serviceCategories, services, type CategoryId, type Service } from "@/content/services";

import type { StoredContent } from "./content-store";

// The list of services: those in src/content, plus those added in the admin panel. A service is
// never removed from the list once published, only hidden, so its address and details survive and
// it can be restored. Plain functions over stored content; nothing here reads or writes the store.

export type ServiceStatus = "published" | "draft" | "hidden";
export type CatalogEntry = Service & { status: ServiceStatus };

type AddedService = { slug: string; name: string; category: CategoryId; published: boolean };
type Catalog = { added: AddedService[]; hidden: string[]; homeSlugs?: string[] };

export const MAX_HOME_SERVICES = 9;

const categoryIds = serviceCategories.map((category) => category.id as string);
const strings = (value: unknown) =>
  Array.isArray(value) ? value.filter((each): each is string => typeof each === "string") : [];

function isAdded(value: unknown): value is AddedService {
  if (typeof value !== "object" || value === null) return false;
  const { slug, name, category } = value as Record<string, unknown>;
  return (
    typeof slug === "string" &&
    typeof name === "string" &&
    typeof category === "string" &&
    categoryIds.includes(category)
  );
}

/** What is saved. Ignores anything unexpected, since this is stored data. */
function readCatalog(content: StoredContent): Catalog {
  const stored = content.serviceCatalog;
  const raw = (typeof stored === "object" && stored !== null ? stored : {}) as Record<
    string,
    unknown
  >;
  return {
    added: Array.isArray(raw.added)
      ? raw.added.filter(isAdded).map((each) => ({ ...each, published: each.published === true }))
      : [],
    hidden: strings(raw.hidden),
    homeSlugs: Array.isArray(raw.homeSlugs) ? strings(raw.homeSlugs) : undefined,
  };
}

const withCatalog = (content: StoredContent, catalog: Catalog): StoredContent => ({
  ...content,
  serviceCatalog: catalog,
});

function savedName(content: StoredContent, slug: string) {
  const section = content[`services/${slug}`];
  const name = (section as Record<string, unknown> | undefined)?.name;
  return typeof name === "string" && name ? name : undefined;
}

/** A saved name that matches the original isn't a rename, so it keeps its shorter menu label. */
function named(content: StoredContent, service: Service): Service {
  const name = savedName(content, service.slug);
  if (!name || name === service.name) return service;
  return { ...service, name, shortName: undefined };
}

export function allCatalogEntries(content: StoredContent): CatalogEntry[] {
  const catalog = readCatalog(content);
  const fromCode = services.map((service) => ({
    ...named(content, service),
    status: catalog.hidden.includes(service.slug) ? ("hidden" as const) : ("published" as const),
  }));
  const added = catalog.added.map(({ slug, name, category, published }) => ({
    ...named(content, { slug, name, category }),
    status: catalog.hidden.includes(slug)
      ? ("hidden" as const)
      : published
        ? ("published" as const)
        : ("draft" as const),
  }));
  return [...fromCode, ...added];
}

export const catalogEntry = (content: StoredContent, slug: string) =>
  allCatalogEntries(content).find((entry) => entry.slug === slug);

/** The services visitors can see, in menus, forms, cards and the sitemap. */
export function publicServices(content: StoredContent): Service[] {
  return allCatalogEntries(content)
    .filter((entry) => entry.status === "published")
    .map(({ slug, name, shortName, category, whatsappMessage }) => ({
      slug,
      name,
      category,
      ...(shortName ? { shortName } : {}),
      ...(whatsappMessage ? { whatsappMessage } : {}),
    }));
}

export const groupByCategory = (list: Service[]) =>
  serviceCategories.map((category) => ({
    ...category,
    services: list.filter((service) => service.category === category.id),
  }));

/** Up to `count` other services for the "Other Services" section, same category first. */
export function otherServicesFrom(list: Service[], slug: string, count = 3): Service[] {
  const category = list.find((service) => service.slug === slug)?.category;
  const rest = list.filter((service) => service.slug !== slug);
  return [
    ...rest.filter((service) => service.category === category),
    ...rest.filter((service) => service.category !== category),
  ].slice(0, count);
}

export function homeServiceSlugs(content: StoredContent): string[] {
  const visible = publicServices(content).map((service) => service.slug);
  const chosen = readCatalog(content).homeSlugs ?? home.serviceSlugs;
  return chosen.filter((slug) => visible.includes(slug));
}

export function toggleHomeService(content: StoredContent, slug: string): StoredContent {
  const current = homeServiceSlugs(content);
  const homeSlugs = current.includes(slug)
    ? current.filter((each) => each !== slug)
    : current.length < MAX_HOME_SERVICES
      ? [...current, slug]
      : current;
  return withCatalog(content, { ...readCatalog(content), homeSlugs });
}

/** A page address, set once. It is never reused, so an old link can't reach a different service. */
export function nextSlug(name: string, taken: string[]): string {
  const base =
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "service";
  let slug = base;
  for (let n = 2; taken.includes(slug); n++) slug = `${base}-${n}`;
  return slug;
}

export function addService(content: StoredContent, name: string, category: CategoryId) {
  const catalog = readCatalog(content);
  const slug = nextSlug(
    name,
    allCatalogEntries(content).map((entry) => entry.slug),
  );
  return {
    slug,
    content: withCatalog(content, {
      ...catalog,
      added: [...catalog.added, { slug, name, category, published: false }],
    }),
  };
}

export function publishService(content: StoredContent, slug: string): StoredContent {
  const catalog = readCatalog(content);
  return withCatalog(content, {
    ...catalog,
    added: catalog.added.map((each) => (each.slug === slug ? { ...each, published: true } : each)),
  });
}

export function hideService(content: StoredContent, slug: string): StoredContent {
  const catalog = readCatalog(content);
  return withCatalog(content, {
    ...catalog,
    // Recorded now, so restoring a service doesn't put it back on the home page unasked.
    homeSlugs: homeServiceSlugs(content).filter((each) => each !== slug),
    hidden: [...catalog.hidden.filter((each) => each !== slug), slug],
  });
}

export function restoreService(content: StoredContent, slug: string): StoredContent {
  const catalog = readCatalog(content);
  return withCatalog(content, {
    ...catalog,
    hidden: catalog.hidden.filter((each) => each !== slug),
  });
}

/** Only for a service never made public: anything that was public is hidden instead. */
export function deleteDraft(content: StoredContent, slug: string): StoredContent {
  if (catalogEntry(content, slug)?.status !== "draft") {
    throw new Error(`Only a draft can be deleted: ${slug}`);
  }
  const catalog = readCatalog(content);
  const rest = { ...content };
  delete rest[`services/${slug}`];
  return withCatalog(rest, {
    ...catalog,
    added: catalog.added.filter((each) => each.slug !== slug),
  });
}
