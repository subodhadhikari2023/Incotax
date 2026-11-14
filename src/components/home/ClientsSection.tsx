import Image from "next/image";

import { SectionHeader } from "@/components/ui/SectionHeader";
import { home } from "@/content/home";
import type { HomeNodes } from "@/lib/home-content";

// "Clients We Have Worked With": boxes centred in rows of 6 on desktop, 3 on tablet, 2 on phones,
// so one or two clients still look deliberate. Real clients only; none hides the section. A client
// with a logo shows it, any other its name.
export function ClientsSection({
  content = home,
  after,
}: {
  content?: HomeNodes;
  /** The panel's add control. With it, the section stays on screen while empty. */
  after?: React.ReactNode;
}) {
  if (content.clients.length === 0 && !after) return null;

  return (
    <section aria-labelledby="clients-heading" className="bg-bg">
      <div className="page-container py-[53px] md:py-[77px] lg:py-24">
        <SectionHeader id="clients-heading" eyebrow="Clients" title="Clients We Have Worked With" />
        <ul className="mt-10 flex flex-wrap justify-center gap-4 lg:gap-5">
          {content.clients.map((client, i) => (
            <li
              key={i}
              className="relative flex min-h-24 w-[calc(50%-0.5rem)] items-center justify-center overflow-hidden rounded-[14px] border border-border bg-white px-3 text-center text-sm text-text-muted md:w-[calc((100%-2rem)/3)] lg:w-[calc((100%-6.25rem)/6)]"
            >
              {typeof client === "string" && content.clientLogos[client] ? (
                <Image
                  src={content.clientLogos[client]}
                  alt={client}
                  fill
                  sizes="(min-width: 1024px) 190px, (min-width: 768px) 33vw, 50vw"
                  className="object-contain p-3"
                />
              ) : (
                client
              )}
            </li>
          ))}
        </ul>
        {after}
      </div>
    </section>
  );
}
