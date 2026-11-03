import Link from "next/link";

import { BusinessForm } from "@/components/admin/BusinessForm";
import { requireAdmin } from "@/lib/admin/auth";
import { businessFields, savedBusinessDetails, type BusinessFormValues } from "@/lib/business";
import { readStoredContentOrThrow } from "@/lib/content-store";

export default async function AdminBusinessPage() {
  await requireAdmin();

  // Only saved values, so a [placeholder] can't be saved as if it were real. Strict read: if the
  // store is down this fails, rather than offering a blank form that could overwrite real details.
  const saved = savedBusinessDetails(await readStoredContentOrThrow());
  const initial = Object.fromEntries(
    businessFields.map((field) => [field, saved[field] ?? ""]),
  ) as BusinessFormValues;

  return (
    <main className="page-container flex-1 py-12">
      <Link href="/admin" className="text-[15px] font-semibold text-navy underline">
        Back to panel
      </Link>
      <h1 className="mt-4 text-[40px]/[46px] text-navy">Business details</h1>
      <p className="mt-3 max-w-[720px] text-text-body">
        Shown across the public site. A field left blank keeps showing its placeholder.
      </p>
      <BusinessForm initial={initial} />
    </main>
  );
}
