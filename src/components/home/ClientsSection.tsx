import { SectionHeader } from "@/components/ui/SectionHeader";
import { home } from "@/content/home";

// "Clients We Have Worked With": 6 boxes — one row on desktop, 3 across on tablet, 2 on phones.
// Names/logos are PENDING (real clients only).
export function ClientsSection() {
  return (
    <section aria-labelledby="clients-heading" className="bg-bg">
      <div className="page-container py-[53px] md:py-[77px] lg:py-24">
        <SectionHeader id="clients-heading" eyebrow="Clients" title="Clients We Have Worked With" />
        <ul className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6 lg:gap-5">
          {home.clients.map((client, i) => (
            <li
              key={i}
              className="flex h-24 items-center justify-center rounded-[14px] border border-border bg-white px-3 text-center text-sm text-text-muted"
            >
              {client}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
