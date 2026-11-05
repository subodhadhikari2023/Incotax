import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ServiceView } from "@/components/pages/ServiceView";
import { getServiceDetail } from "@/content/service-details";
import { getService, serviceHref, services } from "@/content/services";
import { site } from "@/content/site";
import { readStoredContent } from "@/lib/content-store";
import { pageMetadata } from "@/lib/metadata";
import { serviceCardDescriptions, serviceCopyFor } from "@/lib/service-copy";
import { mergeSiteCopy } from "@/lib/site-copy";

// One static page per service in the services PDF; any other slug is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/services/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  return service
    ? pageMetadata(`${service.name} | ${site.name}`, serviceHref(slug))
    : { title: site.name };
}

export default async function ServicePage({ params }: PageProps<"/services/[slug]">) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();
  const stored = await readStoredContent();
  const copy = serviceCopyFor(stored, slug);
  const siteCopy = mergeSiteCopy(stored);

  return (
    <ServiceView
      service={service}
      detail={getServiceDetail(slug)}
      copy={copy}
      message={copy.whatsappMessage}
      coversIntro={siteCopy.serviceCoversIntro}
      otherServicesIntro={siteCopy.otherServicesIntro}
      descriptions={serviceCardDescriptions(stored)}
    />
  );
}
