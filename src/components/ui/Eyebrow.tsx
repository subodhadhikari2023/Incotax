// Section label: 32×2px gold line + uppercase 13px text (CLAUDE.md §4.4). Centered labels get a
// line on both sides.
export function Eyebrow({
  children,
  centered = false,
  onNavy = false,
  as: Tag = "p",
  id,
}: {
  children: React.ReactNode;
  centered?: boolean;
  onNavy?: boolean;
  /** Render as a heading when the label is the section's only title. */
  as?: "p" | "h2";
  id?: string;
}) {
  const line = <span aria-hidden="true" className="h-0.5 w-8 shrink-0 bg-gold" />;
  return (
    <Tag
      id={id}
      className={`flex items-center gap-3 font-sans text-[13px] font-semibold tracking-[0.1em] uppercase ${
        onNavy ? "text-on-navy" : "text-text-muted"
      } ${centered ? "justify-center" : ""}`}
    >
      {line}
      {children}
      {centered && line}
    </Tag>
  );
}
