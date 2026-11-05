import { EnquiryPopup } from "@/components/home/EnquiryPopup";
import { HomeView } from "@/components/pages/HomeView";
import { site } from "@/content/site";
import { readStoredContent } from "@/lib/content-store";
import { mergeHomeContent } from "@/lib/home-content";
import { pageMetadata } from "@/lib/metadata";
import { serviceCardDescriptions } from "@/lib/service-copy";

export const metadata = pageMetadata(site.name, "/");

// Home page, sections in the designed order.
export default async function Home() {
  const stored = await readStoredContent();

  return (
    <main>
      <HomeView content={mergeHomeContent(stored)} descriptions={serviceCardDescriptions(stored)} />
      <EnquiryPopup />
    </main>
  );
}
