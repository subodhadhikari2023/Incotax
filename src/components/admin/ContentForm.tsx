"use client";

import { useActionState, useEffect, useRef, useState } from "react";

import {
  rowLabel,
  type ListDef,
  type ListRow,
  type SectionErrors,
  type SectionSchema,
  type SectionState,
  type SectionValues,
} from "@/lib/content-section";

// The scroll margins keep a field clear of the sticky bars when it is jumped to.
const fieldClass =
  "w-full scroll-mt-24 scroll-mb-28 rounded-lg border border-border-field bg-white px-3.5 text-base text-navy focus:border-navy focus:outline-2 focus:outline-gold";
const smallButton =
  "rounded-lg border-[1.5px] px-4 py-2 text-[15px] font-semibold disabled:cursor-not-allowed disabled:opacity-50";

const LEAVE_WARNING = "You have unsaved changes. Leave without saving them?";

type FieldProps = {
  id: string;
  name: string;
  label: string;
  hint?: string;
  error?: string;
  multiline?: boolean;
  inputType?: string;
  /** Text fields are uncontrolled; list rows pass value and onChange, as rows come and go. */
  control: { defaultValue: string } | { value: string; onChange: (value: string) => void };
};

function Field({ id, name, label, hint, error, multiline, inputType, control }: FieldProps) {
  const described = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ");
  const value =
    "value" in control
      ? {
          value: control.value,
          onChange: (e: { target: { value: string } }) => control.onChange(e.target.value),
        }
      : { defaultValue: control.defaultValue };
  const props = {
    id,
    name,
    ...value,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": described || undefined,
  };
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[15px] font-semibold text-navy">
        {label}
      </label>
      {multiline ? (
        <textarea {...props} rows={4} className={`${fieldClass} py-3`} />
      ) : (
        <input {...props} type={inputType ?? "text"} className={`${fieldClass} h-[50px]`} />
      )}
      {hint && (
        <p id={`${id}-hint`} className="mt-1.5 text-sm text-text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-sm font-semibold text-error">
          {error}
        </p>
      )}
    </div>
  );
}

function ListEditor({
  def,
  rows,
  errors,
  onChange,
}: {
  def: ListDef;
  rows: ListRow[];
  errors: SectionErrors;
  onChange: (rows: ListRow[]) => void;
}) {
  const addButton = useRef<HTMLButtonElement>(null);
  // Adding or removing a row replaces what has focus, so say where focus goes next.
  const focusNext = useRef<"new row" | "add button" | null>(null);

  useEffect(() => {
    if (focusNext.current === "new row") {
      const first = `content-${def.name}.${rows.length - 1}.${def.fields[0].name}`;
      document.getElementById(first)?.focus();
    } else if (focusNext.current === "add button") {
      addButton.current?.focus();
    }
    focusNext.current = null;
  });

  const isFull = rows.length >= def.max;
  const fullId = `content-${def.name}-full`;
  const blankRow = () => Object.fromEntries(def.fields.map((field) => [field.name, ""]));
  const setCell = (index: number, field: string, value: string) =>
    onChange(rows.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  const rowTitle = (index: number) => rowLabel(def, { ...def.fields[0], label: "" }, index);

  return (
    <div className="space-y-4 border-t border-border pt-5">
      {def.hint && <p className="text-[15px] text-text-muted">{def.hint}</p>}
      {errors[def.name] && (
        <p role="alert" className="text-sm font-semibold text-error">
          {errors[def.name]}
        </p>
      )}
      {rows.length === 0 && (
        <p className="rounded-lg border border-dashed border-border-field px-4 py-5 text-center text-[15px] text-text-muted">
          Nothing added yet.
        </p>
      )}
      {rows.map((row, index) => (
        <div key={index} className="space-y-4 rounded-[14px] border border-border bg-bg p-4 md:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[15px] font-semibold text-navy">{rowTitle(index)}</p>
            <button
              type="button"
              className={`${smallButton} border-error bg-white text-error hover:bg-tint`}
              onClick={() => {
                focusNext.current = "add button";
                onChange(rows.filter((_, i) => i !== index));
              }}
            >
              {`Remove ${def.row} ${index + 1}`}
            </button>
          </div>
          {def.fields.map((field) => {
            const name = `${def.name}.${index}.${field.name}`;
            return (
              <Field
                key={field.name}
                id={`content-${name}`}
                name={name}
                label={rowLabel(def, field, index)}
                hint={field.hint}
                error={errors[name]}
                multiline={field.multiline}
                control={{
                  value: row[field.name] ?? "",
                  onChange: (value) => setCell(index, field.name, value),
                }}
              />
            );
          })}
        </div>
      ))}
      <button
        ref={addButton}
        type="button"
        className={`${smallButton} border-navy bg-white text-navy hover:bg-tint`}
        disabled={isFull}
        aria-describedby={isFull ? fullId : undefined}
        onClick={() => {
          focusNext.current = "new row";
          onChange([...rows, blankRow()]);
        }}
      >
        {`Add ${def.row}`}
      </button>
      {isFull && (
        <p id={fullId} className="text-sm text-text-muted">
          {`This list is full (${def.max} of ${def.max}). Remove one to add another.`}
        </p>
      )}
    </div>
  );
}

const listsOf = (schema: SectionSchema, values: SectionValues) =>
  Object.fromEntries(
    schema
      .flatMap((group) => group.items)
      .filter((item) => item.kind === "list")
      .map((item) => [item.name, (values[item.name] as ListRow[]) ?? []]),
  );

/** Whether a click on this link would take the editor away from the form. */
function leavesForm(event: MouseEvent, link: HTMLAnchorElement) {
  if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey) return false;
  if (link.target && link.target !== "_self") return false;
  const url = new URL(link.href, window.location.href);
  const samePage =
    url.pathname === window.location.pathname && url.search === window.location.search;
  return !(samePage && url.hash);
}

/** Warns before anything takes the editor away from unsaved work. */
function useUnsavedWarning(dirty: boolean, form: React.RefObject<HTMLFormElement | null>) {
  useEffect(() => {
    if (!dirty) return;

    const onBeforeUnload = (event: BeforeUnloadEvent) => event.preventDefault();
    const stopUnlessConfirmed = (event: Event) => {
      if (window.confirm(LEAVE_WARNING)) return;
      event.preventDefault();
      event.stopPropagation();
    };
    // Capture phase: Next.js handles its links further down, and the browser warning can't see it.
    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element).closest?.<HTMLAnchorElement>("a[href]");
      if (link && leavesForm(event, link)) stopUnlessConfirmed(event);
    };
    // Other forms on the page, such as logging out, leave without a full page load too.
    const onSubmit = (event: SubmitEvent) => {
      if (event.target !== form.current) stopUnlessConfirmed(event);
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("click", onClick, true);
    document.addEventListener("submit", onSubmit, true);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("submit", onSubmit, true);
    };
  }, [dirty, form]);
}

// Renders any section of the admin panel from its schema. noValidate: the Server Action checks every
// field and shows its messages in the same way.
export function ContentForm<V extends SectionValues>({
  schema,
  action,
  initial,
}: {
  schema: SectionSchema;
  action: (previous: SectionState<V>, formData: FormData) => Promise<SectionState<V>>;
  initial: V;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const values = state?.values ?? initial;
  const errors = state?.errors ?? {};
  const errorCount = Object.keys(errors).length;

  const form = useRef<HTMLFormElement>(null);
  const [dirty, setDirty] = useState(false);
  const [lists, setLists] = useState(() => listsOf(schema, initial));

  // A finished save returns the checked rows (trimmed, blank rows dropped), so show those.
  const [shownState, setShownState] = useState(state);
  if (state !== shownState) {
    setShownState(state);
    if (state) setLists(listsOf(schema, state.values));
    if (state?.saved) setDirty(false);
  }

  useUnsavedWarning(dirty, form);

  // A refused save may be far from the field at fault, so go to the first one.
  useEffect(() => {
    if (state && Object.keys(state.errors).length > 0) {
      form.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
    }
  }, [state]);

  return (
    <form
      ref={form}
      action={formAction}
      noValidate
      onChange={() => setDirty(true)}
      className="mt-8 space-y-6"
    >
      {schema.length > 1 && (
        <nav
          aria-label="Parts of this page"
          className="z-10 -mx-1 flex gap-2 overflow-x-auto bg-bg px-1 py-2 md:sticky md:top-0 md:flex-wrap"
        >
          {schema.map((group, index) => (
            <a
              key={group.title}
              href={`#part-${index}`}
              className="shrink-0 rounded-full border border-border bg-white px-3.5 py-1.5 text-sm font-semibold text-navy hover:border-navy"
            >
              {group.title}
            </a>
          ))}
        </nav>
      )}

      {schema.map((group, index) => (
        <section
          key={group.title}
          id={`part-${index}`}
          aria-labelledby={`part-${index}-title`}
          className="scroll-mt-16 space-y-5 rounded-[20px] border border-border bg-white p-5 shadow-card md:p-7"
        >
          <div>
            <h2 id={`part-${index}-title`} className="text-[28px]/[1.2] text-navy">
              {group.title}
            </h2>
            <p className="mt-1 text-[15px] text-text-muted">{group.where}</p>
            {group.href && (
              <a
                href={group.href}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-block text-[15px] font-semibold text-navy underline"
              >
                {`See ${group.title} on the site`} <span aria-hidden="true">↗</span>
              </a>
            )}
          </div>
          {group.items.map((item) =>
            item.kind === "list" ? (
              <ListEditor
                key={item.name}
                def={item}
                rows={lists[item.name]}
                errors={errors}
                onChange={(rows) => {
                  setDirty(true);
                  setLists((current) => ({ ...current, [item.name]: rows }));
                }}
              />
            ) : (
              <Field
                key={item.name}
                id={`content-${item.name}`}
                name={item.name}
                label={item.label}
                hint={item.hint}
                error={errors[item.name]}
                multiline={item.multiline}
                inputType={item.inputType}
                control={{ defaultValue: (values[item.name] as string) ?? "" }}
              />
            ),
          )}
        </section>
      ))}

      <div className="sticky bottom-3 z-10 flex flex-wrap items-center justify-between gap-x-5 gap-y-2 rounded-[14px] border border-border bg-white p-3 shadow-raised md:px-5">
        <div className="min-w-0 flex-1 space-y-0.5 text-[15px]">
          <p aria-live="polite" className="flex items-center gap-2 font-semibold text-navy">
            <span
              aria-hidden="true"
              className={`size-2.5 shrink-0 rounded-full ${dirty ? "bg-gold-deep" : "bg-border"}`}
            />
            <span>{dirty ? "Unsaved changes" : "No unsaved changes"}</span>
          </p>
          {state?.saved && !dirty && (
            <p role="status" className="text-text-body">
              Saved. The live site now shows these changes.
            </p>
          )}
          {errorCount > 0 && (
            <p role="alert" className="font-semibold text-error">
              {`Please fix the ${errorCount} ${errorCount === 1 ? "field" : "fields"} marked in red.`}
            </p>
          )}
          {state?.error && (
            <p role="alert" className="font-semibold text-error">
              {state.error}
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-gold px-7 py-3 text-base font-semibold text-navy shadow-button transition-colors hover:bg-gold-arrow disabled:opacity-70"
        >
          {pending ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
