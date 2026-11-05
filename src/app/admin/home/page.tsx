import { HomeCanvas } from "@/components/admin/editor/canvases";
import { PageEditor } from "@/components/admin/editor/PageEditor";
import { requireAdmin } from "@/lib/admin/auth";
import { readStoredContentOrThrow } from "@/lib/content-store";

import { home } from "@/content/home";

import { homeSection, serviceSection, sharedSections, sharedSettings } from "../editor-sections";

export default async function AdminHomePage() {
  await requireAdmin();

  // Strict read: if the store is down this fails, rather than offering a page that could overwrite
  // real content.
  const stored = await readStoredContentOrThrow();

  return (
    <PageEditor
      title="Home page"
      publicHref="/"
      sections={[
        homeSection(stored),
        ...home.serviceSlugs.map((slug) => serviceSection(stored, slug)),
        ...sharedSections(stored),
      ]}
      settings={[{ section: "home", name: "goldPhrase" }, ...sharedSettings]}
    >
      <HomeCanvas />
    </PageEditor>
  );
}
