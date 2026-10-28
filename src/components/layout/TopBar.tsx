import { site } from "@/content/site";

// Navy strip above the header: three across from tablet up; on phones the hours wrap to row two.
export function TopBar() {
  return (
    <div className="bg-navy-deep text-sm text-on-navy">
      <div className="page-container grid grid-cols-2 gap-x-4 gap-y-1 py-2.5 md:flex md:items-center md:justify-between">
        <span>{site.phone}</span>
        <span className="text-right md:text-center">{site.email}</span>
        <span className="col-span-2 md:text-right">{site.hours}</span>
      </div>
    </div>
  );
}
