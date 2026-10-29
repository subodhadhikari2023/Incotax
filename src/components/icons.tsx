// Font Awesome (free) icons used across the site. Icons are 1em tall, so size them with a
// font-size class (e.g. text-lg). They are decorative and hidden from screen readers.
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import {
  faArrowRight,
  faBars,
  faBuilding,
  faBuildingColumns,
  faClock,
  faEnvelope,
  faLocationDot,
  faPhone,
  faScaleBalanced,
  faCertificate,
  faCheck,
  faChevronRight,
  faChevronDown,
  faFileInvoice,
  faStar,
  faXmark,
  type IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import type { CategoryId } from "@/content/services";

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

export function ArrowRightIcon({ className = "text-sm" }: IconProps) {
  return <FontAwesomeIcon icon={faArrowRight} className={className} />;
}

export function CheckIcon({ className = "text-sm" }: IconProps) {
  return <FontAwesomeIcon icon={faCheck} className={className} />;
}

export function StarIcon({ className = "text-sm" }: IconProps) {
  return <FontAwesomeIcon icon={faStar} className={className} />;
}

export function ChevronRightIcon({ className = "text-xs" }: IconProps) {
  return <FontAwesomeIcon icon={faChevronRight} className={className} />;
}

export const contactIcons = {
  phone: faPhone,
  email: faEnvelope,
  office: faLocationDot,
  hours: faClock,
  court: faBuildingColumns,
  law: faScaleBalanced,
};

export function Icon({ icon, className = "text-lg" }: IconProps & { icon: IconDefinition }) {
  return <FontAwesomeIcon icon={icon} className={className} />;
}

const categoryIcons: Record<CategoryId, IconDefinition> = {
  registration: faBuilding,
  "compliance-taxation": faFileInvoice,
  "business-licenses": faCertificate,
};

export function CategoryIcon({
  category,
  className = "text-xl",
}: IconProps & { category: CategoryId }) {
  return <FontAwesomeIcon icon={categoryIcons[category]} className={className} />;
}
