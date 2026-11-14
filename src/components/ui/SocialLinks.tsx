import { Icon, socialIcons } from "@/components/icons";
import { site } from "@/content/site";

// Round icon links to the practice's social pages, opened in a new tab. `tone` matches the
// background: "dark" on the navy footer, "light" on white.
export function SocialLinks({
  links = {},
  tone = "dark",
  className = "",
}: {
  /** Saved addresses; a missing one falls back to the default page. */
  links?: { instagram?: string; facebook?: string };
  tone?: "dark" | "light";
  className?: string;
}) {
  const colours =
    tone === "dark"
      ? "border-navy-line text-on-navy hover:border-gold hover:text-gold"
      : "border-border text-navy hover:border-gold-deep hover:text-gold-darkest";

  return (
    <ul aria-label="Social media" className={`flex gap-3 ${className}`}>
      {site.social.map((link) => (
        <li key={link.platform}>
          <a
            href={(link.platform === "Instagram" ? links.instagram : links.facebook) || link.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`IncoTax on ${link.platform}`}
            className={`flex size-11 items-center justify-center rounded-full border transition-colors ${colours}`}
          >
            <Icon icon={socialIcons[link.platform]} className="text-base" />
          </a>
        </li>
      ))}
    </ul>
  );
}
