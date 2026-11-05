"use client";

import { useRef } from "react";

import { CloseIcon } from "@/components/icons";
import { PLANS } from "@/content/service-details";
import { fieldLabel, listDefinition } from "@/lib/admin/editor-state";
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

function SelectField({
  section,
  name,
  options,
}: {
  section: string;
  name: string;
  options: { value: string; label: string }[];
}) {
  const editor = useEditor();
  const element = useRef<HTMLSelectElement>(null);
  useFocusWhenAsked(fieldId(section, name), element);
  const id = `select-${section}-${name}`.replace(/\W/g, "-");
  const error = editor.errors[section]?.[name];
  return (
    <div className="mt-3 rounded-lg border border-dashed border-gold p-3">
      <label htmlFor={id} className="mb-1 block text-sm font-semibold">
        {fieldLabel(editor.schemas[section], name)?.label ?? name}
      </label>
      <select
        ref={element}
        id={id}
        value={String(editor.values[section]?.[name] ?? "")}
        onChange={(event) => editor.setValue(section, name, event.target.value)}
        className="w-full rounded-lg border border-border-field bg-white px-3 py-2 text-[15px] text-navy"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p
          role="alert"
          className="mt-1 w-fit rounded bg-white px-2 py-1 text-sm font-semibold text-error"
        >
          {error}
        </p>
      )}
    </div>
  );
}

/** Tick boxes for the plans an included item belongs to. Blank means every plan. */
function PlanChecks({ section, list, index }: { section: string; list: string; index: number }) {
  const editor = useEditor();
  const rows = editor.values[section]?.[list] as ListRow[];
  const current = rows[index]?.plans;
  const chosen = current ? current.split(",") : PLANS.map((plan) => plan.id as string);

  function toggle(id: string, on: boolean) {
    const next = PLANS.map((plan) => plan.id as string).filter((each) =>
      each === id ? on : chosen.includes(each),
    );
    editor.setValue(section, `${list}.${index}.plans`, next.join(","));
  }

  return (
    <fieldset className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-navy">
      <legend className="font-semibold">In these plans:</legend>
      {PLANS.map((plan) => (
        <label key={plan.id} className="flex items-center gap-1.5">
          <input
            type="checkbox"
            aria-label={`Item ${index + 1} in ${plan.name}`}
            checked={chosen.includes(plan.id)}
            // An item must stay in at least one plan, or it would show nowhere.
            disabled={chosen.length === 1 && chosen.includes(plan.id)}
            onChange={(event) => toggle(plan.id, event.target.checked)}
          />
          {plan.name}
        </label>
      ))}
    </fieldset>
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
    select: (name: string, options: { value: string; label: string }[]) => (
      <SelectField section={section} name={name} options={options} />
    ),
    planChecks: (list: string, index: number) => (
      <PlanChecks section={section} list={list} index={index} />
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
