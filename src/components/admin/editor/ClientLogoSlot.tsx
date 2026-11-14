"use client";

import Image from "next/image";
import { useState, useTransition } from "react";

import { uploadClientLogo } from "@/app/admin/home/logo-actions";
import type { ListRow } from "@/lib/content-section";
import { checkPhoto, PHOTO_TYPES } from "@/lib/admin/photo";

import { useEditor } from "./EditorContext";

const control =
  "cursor-pointer rounded-md border border-navy bg-white px-2 py-1 text-xs font-semibold text-navy hover:bg-tint";

// One client box in the panel: its logo (or nothing), the editable name below it, and buttons to
// upload, replace or remove the logo. The file is stored on choosing; the row only points to it
// once the page is saved, so leaving without saving changes nothing on the site.
export function ClientLogoSlot({
  section,
  index,
  name,
}: {
  section: string;
  index: number;
  /** The editable client name. */
  name: React.ReactNode;
}) {
  const editor = useEditor();
  const [problem, setProblem] = useState<string | null>(null);
  const [uploading, startUpload] = useTransition();

  const rows = (editor.values[section]?.clients ?? []) as ListRow[];
  const logo = rows[index]?.logo ?? "";
  const field = `clients.${index}.logo`;
  const error = problem ?? editor.errors[section]?.[field];
  const inputId = `client-logo-${index}`;

  async function choose(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const checked = await checkPhoto(file);
    if ("error" in checked) {
      setProblem(String(checked.error));
      return;
    }
    setProblem(null);
    startUpload(async () => {
      const data = new FormData();
      data.set("logo", file);
      const result = await uploadClientLogo(data);
      if ("error" in result) setProblem(result.error);
      else editor.setValue(section, field, result.url);
    });
  }

  return (
    <div className="flex w-full flex-col items-center gap-1.5 py-2">
      {logo && (
        <span className="relative block h-12 w-full">
          <Image src={logo} alt="" fill unoptimized className="object-contain" />
        </span>
      )}
      <span className={logo ? "text-xs" : ""}>{name}</span>
      <div className="flex flex-wrap justify-center gap-1">
        <input
          id={inputId}
          type="file"
          accept={PHOTO_TYPES}
          aria-label={`Upload a logo for client ${index + 1}`}
          onChange={choose}
          disabled={uploading}
          className="peer sr-only"
        />
        <label
          htmlFor={inputId}
          className={`${control} peer-focus-visible:outline-2 peer-focus-visible:outline-gold`}
        >
          {uploading ? "Uploading…" : logo ? "Replace logo" : "Upload logo"}
        </label>
        {logo && (
          <button
            type="button"
            aria-label={`Remove logo of client ${index + 1}`}
            className={control}
            onClick={() => {
              setProblem(null);
              editor.setValue(section, field, "");
            }}
          >
            Remove logo
          </button>
        )}
      </div>
      {error && (
        <p role="alert" className="text-center text-xs font-semibold text-error">
          {error}
        </p>
      )}
    </div>
  );
}
