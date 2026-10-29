// Font Awesome (free) icons used across the site. Icons are 1em tall, so size them with a
// font-size class (e.g. text-lg). They are decorative and hidden from screen readers.
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { faBars, faChevronDown, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type IconProps = { className?: string };

export function WhatsAppIcon({ className = "text-lg" }: IconProps) {
  return <FontAwesomeIcon icon={faWhatsapp} className={className} />;
}

export function ChevronDownIcon({ className = "text-xs" }: IconProps) {
  return <FontAwesomeIcon icon={faChevronDown} className={className} />;
}

export function MenuIcon({ className = "text-xl" }: IconProps) {
  return <FontAwesomeIcon icon={faBars} className={className} />;
}

export function CloseIcon({ className = "text-xl" }: IconProps) {
  return <FontAwesomeIcon icon={faXmark} className={className} />;
}
