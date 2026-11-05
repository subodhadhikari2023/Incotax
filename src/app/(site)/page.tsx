import { EnquiryPopup } from "@/components/home/EnquiryPopup";
import { HomeView } from "@/components/pages/HomeView";
import { site } from "@/content/site";
import { readStoredContent } from "@/lib/content-store";
import { mergeHomeContent } from "@/lib/home-content";
import { pageMetadata } from "@/lib/metadata";
import { serviceCardDescriptions, serviceDetailFor } from "@/lib/service-copy";

export const metadata = pageMetadata(site.name, "/");

// Home page, sections in the designed order.
export default async function Home() {
  const stored = await readStoredContent();
  const content = mergeHomeContent(stored);

  return (
    <main>
      <HomeView
        content={content}
        descriptions={serviceCardDescriptions(stored)}
        feePlans={serviceDetailFor(stored, content.fees.serviceSlug).plans ?? []}
      />
      <EnquiryPopup />
    </main>
  );
}
