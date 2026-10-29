// Section label: 32×2px gold line + uppercase 13px text (CLAUDE.md §4.4). Centered labels get a
// line on both sides.
export function Eyebrow({
  children,
  centered = false,
  onNavy = false,
}: {
  children: React.ReactNode;
  centered?: boolean;
  onNavy?: boolean;
}) {
  const line = <span aria-hidden="true" className="h-0.5 w-8 shrink-0 bg-gold" />;
  return (
    <p
      className={`flex items-center gap-3 text-[13px] font-semibold tracking-[0.1em] uppercase ${
        onNavy ? "text-on-navy" : "text-text-muted"
      } ${centered ? "justify-center" : ""}`}
    >
      {line}
      {children}
      {centered && line}
    </p>
  );
}
