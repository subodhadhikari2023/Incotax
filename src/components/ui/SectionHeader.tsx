import { Eyebrow } from "./Eyebrow";

// Centered section header: eyebrow label, heading and one-line intro (CLAUDE.md §4.4).
export function SectionHeader({
  id,
  eyebrow,
  title,
  intro,
  onNavy = false,
}: {
  id: string;
  eyebrow: string;
  title: string;
  intro?: string;
  onNavy?: boolean;
}) {
  return (
    <div className="text-center">
      <Eyebrow centered onNavy={onNavy}>
        {eyebrow}
      </Eyebrow>
      <h2
        id={id}
        className={`mt-4 text-[34px]/[1.15] md:text-[40px] lg:text-[48px] ${onNavy ? "text-white" : ""}`}
      >
        {title}
      </h2>
      {intro && (
        <p className={`mt-3 text-lg ${onNavy ? "text-on-navy" : "text-text-muted"}`}>{intro}</p>
      )}
    </div>
  );
}
