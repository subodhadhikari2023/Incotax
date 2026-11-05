import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { ServiceView } from "@/components/pages/ServiceView";
import { serviceHref, services } from "@/content/services";
import { site } from "@/content/site";
import { readStoredContent } from "@/lib/content-store";
import { pageMetadata } from "@/lib/metadata";
import { catalogEntry, otherServicesFrom, publicServices } from "@/lib/service-catalog";
import { serviceCardDescriptions, serviceCopyFor, serviceDetailFor } from "@/lib/service-copy";
import { mergeSiteCopy } from "@/lib/site-copy";

// One static page per service in the services PDF. Services added in the admin panel are rendered
// on their first visit; an address that was never created is a 404.

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/services/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const service = catalogEntry(await readStoredContent(), slug);
  return service
    ? pageMetadata(`${service.name} | ${site.name}`, serviceHref(slug))
    : { title: site.name };
}

export default async function ServicePage({ params }: PageProps<"/services/[slug]">) {
  const { slug } = await params;
  const stored = await readStoredContent();
  const service = catalogEntry(stored, slug);
  if (!service || service.status === "draft") notFound();
  // A hidden service may still be linked from elsewhere, so send those visitors to the services.
  if (service.status === "hidden") redirect("/#services");

  const copy = serviceCopyFor(stored, slug);
  const siteCopy = mergeSiteCopy(stored);

  return (
    <ServiceView
      service={service}
      detail={serviceDetailFor(stored, slug)}
      copy={copy}
      message={copy.whatsappMessage}
      coversIntro={siteCopy.serviceCoversIntro}
      otherServicesIntro={siteCopy.otherServicesIntro}
      descriptions={serviceCardDescriptions(stored)}
      others={otherServicesFrom(publicServices(stored), slug)}
    />
  );
}
