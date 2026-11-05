"use client";

import { deleteServiceDraft } from "@/app/admin/services/catalog-actions";

// Deleting can't be undone, unlike hiding, so it asks first.
export function DeleteDraftButton({
  slug,
  name,
  className,
}: {
  slug: string;
  name: string;
  className: string;
}) {
  return (
    <form
      action={deleteServiceDraft.bind(null, slug)}
      onSubmit={(event) => {
        if (!window.confirm(`Delete the draft "${name}" for good? This can't be undone.`)) {
          event.preventDefault();
        }
      }}
    >
      <button type="submit" aria-label={`Delete ${name}`} className={className}>
        Delete
      </button>
    </form>
  );
}
