import Link from "next/link";

import { AddServiceForm } from "@/components/admin/AddServiceForm";
import { AdminSection } from "@/components/admin/AdminSection";
import { DeleteDraftButton } from "@/components/admin/DeleteDraftButton";
import { serviceCategories } from "@/content/services";
import { requireAdmin } from "@/lib/admin/auth";
import { readStoredContent } from "@/lib/content-store";
import {
  allCatalogEntries,
  homeServiceSlugs,
  MAX_HOME_SERVICES,
  type CatalogEntry,
} from "@/lib/service-catalog";
import { serviceCopyKey } from "@/lib/service-copy";

import {
  hideServiceAction,
  publishServiceAction,
  restoreServiceAction,
  toggleHomeServiceAction,
} from "./catalog-actions";

const button =
  "relative z-10 rounded-lg border-[1.5px] border-navy bg-white px-3 py-1.5 text-sm font-semibold text-navy hover:bg-tint disabled:cursor-not-allowed disabled:opacity-60";

function statusText(entry: CatalogEntry, edited: boolean) {
  if (entry.status === "draft") return "Draft: not on the site yet";
  if (entry.status === "hidden") return "Hidden from the site";
  return edited ? "Edited" : "Not edited yet";
}

export default async function AdminServicesPage() {
  await requireAdmin();
  const stored = await readStoredContent();
  const entries = allCatalogEntries(stored);
  const onHome = homeServiceSlugs(stored);

  return (
    <AdminSection
      title="Service pages"
      intro="Choose a service to edit it on its page, add a new one, or decide what shows on the site."
    >
      <AddServiceForm />
      {serviceCategories.map((category) => (
        <section key={category.id} className="mt-8">
          <h2 className="text-[28px]/[1.2] text-navy">{category.name}</h2>
          <ul className="mt-4 grid gap-3 md:grid-cols-2">
            {entries
              .filter((entry) => entry.category === category.id)
              .map((entry) => {
                const home = onHome.includes(entry.slug);
                return (
                  <li
                    key={entry.slug}
                    className={`relative rounded-[14px] border border-border p-5 shadow-card hover:border-navy ${
                      entry.status === "published" ? "bg-white" : "bg-tint"
                    }`}
                  >
                    <Link
                      href={`/admin/services/${entry.slug}`}
                      className="font-semibold text-navy after:absolute after:inset-0"
                    >
                      {entry.name}
                    </Link>
                    <p className="mt-1 text-sm text-text-muted">
                      {statusText(entry, serviceCopyKey(entry.slug) in stored)}
                      {home && " · On the home page"}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {entry.status === "draft" && (
                        <>
                          <form action={publishServiceAction.bind(null, entry.slug)}>
                            <button
                              type="submit"
                              aria-label={`Publish ${entry.name}`}
                              className={button}
                            >
                              Publish
                            </button>
                          </form>
                          <DeleteDraftButton
                            slug={entry.slug}
                            name={entry.name}
                            className={button}
                          />
                        </>
                      )}
                      {entry.status === "published" && (
                        <>
                          <form action={toggleHomeServiceAction.bind(null, entry.slug)}>
                            <button
                              type="submit"
                              disabled={!home && onHome.length >= MAX_HOME_SERVICES}
                              aria-label={
                                home
                                  ? `Take ${entry.name} off the home page`
                                  : `Add ${entry.name} to the home page`
                              }
                              className={button}
                            >
                              {home ? "Off home page" : "On home page"}
                            </button>
                          </form>
                          <form action={hideServiceAction.bind(null, entry.slug)}>
                            <button
                              type="submit"
                              aria-label={`Hide ${entry.name}`}
                              className={button}
                            >
                              Hide
                            </button>
                          </form>
                        </>
                      )}
                      {entry.status === "hidden" && (
                        <form action={restoreServiceAction.bind(null, entry.slug)}>
                          <button
                            type="submit"
                            aria-label={`Restore ${entry.name}`}
                            className={button}
                          >
                            Restore
                          </button>
                        </form>
                      )}
                    </div>
                  </li>
                );
              })}
          </ul>
        </section>
      ))}
      {onHome.length >= MAX_HOME_SERVICES && (
        <p className="mt-6 text-sm text-text-muted">
          {`The home page is full (${MAX_HOME_SERVICES} services). Take one off to add another.`}
        </p>
      )}
    </AdminSection>
  );
}
