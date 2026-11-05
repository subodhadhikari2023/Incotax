"use client";

import { useRef } from "react";

import { CloseIcon } from "@/components/icons";
import { listDefinition } from "@/lib/admin/editor-state";
import type { ListRow } from "@/lib/content-section";

import { EditableText } from "./EditableText";
import { fieldId, useEditor, useFocusWhenAsked, type EditorContextValue } from "./EditorContext";

type TextOptions = { label?: string; display?: (value: string) => React.ReactNode };

function RemoveButton({ section, list, index }: { section: string; list: string; index: number }) {
  const editor = useEditor();
  const row = listDefinition(editor.schemas[section], list)?.row ?? "row";
  return (
    <button
      type="button"
      aria-label={`Remove ${row} ${index + 1}`}
      onClick={() => editor.remove(section, list, index)}
      className="absolute -top-3 -right-3 z-10 flex size-7 items-center justify-center rounded-full border-[1.5px] border-error bg-white text-base leading-none font-semibold text-error shadow-card hover:bg-tint"
    >
      <CloseIcon className="text-sm" />
    </button>
  );
}

function AddButton({
  section,
  list,
  emptyNote,
}: {
  section: string;
  list: string;
  emptyNote?: string;
}) {
  const editor = useEditor();
  const button = useRef<HTMLButtonElement>(null);
  const id = fieldId(section, `add:${list}`);
  useFocusWhenAsked(id, button);

  const def = listDefinition(editor.schemas[section], list);
  const count = ((editor.values[section]?.[list] as ListRow[] | undefined) ?? []).length;
  const full = count >= (def?.max ?? 0);
  const fullId = `${id}-full`;

  return (
    <div className="mt-6 flex flex-col items-center gap-2 text-center">
      {count === 0 && emptyNote && (
        <p className="rounded-lg border border-dashed border-border-field bg-white px-4 py-3 text-[15px] text-navy">
          {emptyNote}
        </p>
      )}
      <button
        ref={button}
        type="button"
        disabled={full}
        aria-describedby={full ? fullId : undefined}
        onClick={() => editor.add(section, list)}
        className="rounded-lg border-[1.5px] border-dashed border-navy bg-white px-4 py-2 text-[15px] font-semibold text-navy hover:bg-tint disabled:cursor-not-allowed disabled:opacity-60"
      >
        {`Add ${def?.row ?? "row"}`}
      </button>
      {full && (
        <p id={fullId} className="rounded bg-white px-2 py-1 text-sm text-navy">
          {`This list is full (${def?.max} of ${def?.max}). Remove one to add another.`}
        </p>
      )}
    </div>
  );
}

/** Editable pieces of one saved section, ready to hand to a page's own components. */
export function fieldsFor(editor: EditorContextValue, section: string) {
  const values = editor.values[section];
  return {
    /** The current text, for what must stay plain: links, messages, repeated lines. */
    value: (name: string) => String(values?.[name] ?? ""),
    rows: (list: string) => (values?.[list] as ListRow[] | undefined) ?? [],
    text: (name: string, placeholder?: string, options: TextOptions = {}) => (
      <EditableText section={section} name={name} placeholder={placeholder} {...options} />
    ),
    cell: (list: string, index: number, field: string, placeholder?: string) => (
      <EditableText
        section={section}
        name={`${list}.${index}.${field}`}
        placeholder={placeholder}
      />
    ),
    remove: (list: string, index: number) => (
      <RemoveButton section={section} list={list} index={index} />
    ),
    add: (list: string, emptyNote = HIDDEN_NOTE) => (
      <AddButton section={section} list={list} emptyNote={emptyNote || undefined} />
    ),
  };
}

export const HIDDEN_NOTE = "This section is hidden on the site until you add one.";

export function useFields(section: string) {
  return fieldsFor(useEditor(), section);
}
