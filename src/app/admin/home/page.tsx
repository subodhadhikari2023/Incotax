import { HomeCanvas } from "@/components/admin/editor/canvases";
import { PageEditor } from "@/components/admin/editor/PageEditor";
import { requireAdmin } from "@/lib/admin/auth";
import { readStoredContentOrThrow } from "@/lib/content-store";

import { homeServiceSlugs, publicServices } from "@/lib/service-catalog";

import { homeSection, serviceSection, sharedSections, sharedSettings } from "../editor-sections";

export default async function AdminHomePage() {
  await requireAdmin();

  // Strict read: if the store is down this fails, rather than offering a page that could overwrite
  // real content.
  const stored = await readStoredContentOrThrow();
  const slugs = homeServiceSlugs(stored);

  return (
    <PageEditor
      title="Home page"
      serviceList={publicServices(stored)}
      publicHref="/"
      sections={[
        homeSection(stored),
        ...slugs.map((slug) => serviceSection(stored, slug)),
        ...sharedSections(stored),
      ]}
      settings={[{ section: "home", name: "goldPhrase" }, ...sharedSettings]}
    >
      <HomeCanvas serviceSlugs={slugs} />
    </PageEditor>
  );
}
