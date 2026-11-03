import { site } from "@/content/site";
import type { BusinessDetails } from "@/lib/business";

// Navy strip above the header: three across from tablet up; on phones the hours wrap to row two.
export function TopBar({ business = site }: { business?: BusinessDetails }) {
  return (
    <div className="bg-navy-deep text-sm text-on-navy">
      <div className="page-container grid grid-cols-2 gap-x-4 gap-y-1 py-2.5 md:flex md:items-center md:justify-between">
        <span>{business.phone}</span>
        <span className="text-right md:text-center">{business.email}</span>
        <span className="col-span-2 md:text-right">{business.hours}</span>
      </div>
    </div>
  );
}
