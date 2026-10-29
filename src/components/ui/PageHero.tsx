import Link from "next/link";

export type Crumb = { label: string; href?: string };

// Navy inner-page hero: breadcrumb, title, supporting text and optional actions, with the two
// decorative rings on the right (CLAUDE.md §6).
export function PageHero({
  breadcrumb,
  title,
  size = "title",
  children,
}: {
  breadcrumb: Crumb[];
  title: React.ReactNode;
  /** "title" = legal/service page title (60/48/38); "inner" = inner page hero (64/52/40). */
  size?: "title" | "inner";
  children?: React.ReactNode;
}) {
  const titleSize =
    size === "inner"
      ? "text-[40px]/[46px] md:text-[52px]/[58px] lg:text-[64px]/[70px]"
      : "text-[38px]/[44px] md:text-[48px]/[54px] lg:text-[60px]/[66px]";
  return (
    <section className="relative overflow-hidden bg-navy text-white">
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-1/2">
        <span className="absolute top-1/2 -right-40 size-[600px] -translate-y-1/2 rounded-full border border-navy-line" />
        <span className="absolute top-1/2 -right-16 size-[360px] -translate-y-1/2 rounded-full border border-navy-line" />
      </div>
      <div className="relative page-container py-14 md:py-16 lg:py-20">
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-2 text-[15px] text-on-navy">
            {breadcrumb.map((crumb, i) => (
              <li key={crumb.label} className="flex items-center gap-2">
                {i > 0 && <span aria-hidden="true">/</span>}
                {crumb.href ? (
                  <Link href={crumb.href} className="underline underline-offset-2 hover:text-gold">
                    {crumb.label}
                  </Link>
                ) : (
                  <span aria-current="page">{crumb.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
        <h1 className={`mt-5 max-w-4xl text-white ${titleSize}`}>{title}</h1>
        {children}
      </div>
    </section>
  );
}
