import Link from "next/link";

import { Eyebrow } from "@/components/ui/Eyebrow";

// 404 page: not designed, built in the site's style (CLAUDE.md §6.7).
export default function NotFound() {
  return (
    <main className="relative flex flex-1 overflow-hidden bg-navy text-white">
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-1/2">
        <span className="absolute top-1/2 -right-40 size-[600px] -translate-y-1/2 rounded-full border border-navy-line" />
        <span className="absolute top-1/2 -right-16 size-[360px] -translate-y-1/2 rounded-full border border-navy-line" />
      </div>
      <div className="relative page-container py-24 lg:py-32">
        <Eyebrow onNavy>Error 404</Eyebrow>
        <h1 className="mt-5 text-[40px]/[46px] text-white md:text-[52px]/[58px] lg:text-[64px]/[70px]">
          Page not found
        </h1>
        <p className="mt-5 max-w-xl text-[17px]/[27px] text-on-navy md:text-[19px]/[30px]">
          The page you are looking for does not exist or may have moved.
        </p>
        <div className="mt-9 flex flex-wrap gap-4">
          <Link
            href="/"
            className="rounded-lg bg-gold px-7 py-3.5 text-base font-semibold text-navy shadow-button hover:bg-gold-arrow"
          >
            Back to Home
          </Link>
          <Link
            href="/contact"
            className="rounded-lg border-[1.5px] border-white px-7 py-3.5 text-base font-semibold text-white hover:bg-white/10"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </main>
  );
}
