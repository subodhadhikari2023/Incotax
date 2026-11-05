import Link from "next/link";

// The frame every editor page shares: link back, heading and a line about how the page works.
export function AdminSection({
  title,
  intro,
  backHref = "/admin",
  backLabel = "Back to panel",
  children,
}: {
  title: string;
  intro: string;
  backHref?: string;
  backLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <main className="page-container flex-1 py-12">
      <Link href={backHref} className="text-[15px] font-semibold text-navy underline">
        {backLabel}
      </Link>
      <h1 className="mt-4 text-[40px]/[46px] text-navy">{title}</h1>
      <p className="mt-3 max-w-[720px] text-text-body">{intro}</p>
      {children}
    </main>
  );
}
