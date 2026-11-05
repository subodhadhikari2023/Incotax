"use client";

import { useRef, useState } from "react";

import { FounderPhoto } from "@/components/ui/FounderPhoto";
import { checkPhoto, PHOTO_TYPES } from "@/lib/admin/photo";

import { fieldId, useEditor, useFocusWhenAsked } from "./EditorContext";

const control =
  "cursor-pointer rounded-lg border-[1.5px] border-navy bg-white px-3 py-1.5 text-sm font-semibold text-navy shadow-card hover:bg-tint";

// A founder's photo on the page being edited. A chosen file shows here at once, and is only sent
// when the editor saves, like every other change.
export function PhotoSlot({
  section,
  index,
  name,
}: {
  section: string;
  index: number;
  name: string;
}) {
  const editor = useEditor();
  const input = useRef<HTMLInputElement>(null);
  useFocusWhenAsked(fieldId(section, "photo"), input);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [problem, setProblem] = useState<string | null>(null);

  const version = String(editor.values[section]?.version ?? "");
  const pending = editor.files[section];
  const saved = version ? `/media/founder-${index}?v=${version}` : null;
  const src = pending === "remove" ? null : pending ? previewUrl : saved;
  const error = problem ?? editor.errors[section]?.photo;
  const inputId = `founder-photo-${index}`;

  async function choose(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    // Choosing the same file again must still count as a change.
    event.target.value = "";
    if (!file) return;
    const checked = await checkPhoto(file);
    if ("error" in checked) {
      setProblem(String(checked.error));
      return;
    }
    setProblem(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
    editor.setFile(section, file);
  }

  return (
    <FounderPhoto src={src} name={name} preview={Boolean(pending)}>
      <div className="absolute inset-x-2 bottom-3 z-10 flex flex-col items-center gap-2">
        {error && (
          <p
            role="alert"
            className="rounded bg-white px-2 py-1 text-center font-semibold text-error"
          >
            {error}
          </p>
        )}
        <div className="flex flex-wrap justify-center gap-2">
          <input
            ref={input}
            id={inputId}
            type="file"
            accept={PHOTO_TYPES}
            aria-label={`Upload a photo of ${name}`}
            onChange={choose}
            className="peer sr-only"
          />
          <label
            htmlFor={inputId}
            className={`${control} peer-focus-visible:outline-2 peer-focus-visible:outline-gold`}
          >
            {src ? "Replace photo" : "Upload photo"}
          </label>
          {src && (
            <button
              type="button"
              aria-label={`Remove photo of ${name}`}
              className={control}
              onClick={() => {
                setProblem(null);
                editor.setFile(section, version ? "remove" : null);
              }}
            >
              Remove
            </button>
          )}
        </div>
      </div>
    </FounderPhoto>
  );
}
