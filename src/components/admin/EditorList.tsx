import Link from "next/link";

// A list page's cards. The status sits outside the link, so the link is named by the page alone;
// the link's ::after stretches over the card to keep the whole card clickable.
export function EditorList({
  items,
}: {
  items: { href: string; label: string; edited: boolean }[];
}) {
  return (
    <ul className="mt-4 grid gap-3 md:grid-cols-2">
      {items.map((item) => (
        <li
          key={item.href}
          className="relative rounded-[14px] border border-border bg-white p-5 shadow-card hover:border-navy"
        >
          <Link href={item.href} className="font-semibold text-navy after:absolute after:inset-0">
            {item.label}
          </Link>
          <p className="mt-1 text-sm text-text-muted">
            {item.edited ? "Edited" : "Not edited yet"}
          </p>
        </li>
      ))}
    </ul>
  );
}
