"use client";

import { useActionState, useState } from "react";

import {
  rowLabel,
  type ListDef,
  type ListFieldDef,
  type ListRow,
  type SectionErrors,
  type SectionSchema,
  type SectionState,
  type SectionValues,
  type TextDef,
} from "@/lib/content-section";

const fieldClass =
  "w-full rounded-lg border border-border-field bg-white px-3.5 text-base text-navy focus:border-navy focus:outline-2 focus:outline-gold";
const smallButton =
  "rounded-lg border-[1.5px] border-navy bg-white px-4 py-2 text-[15px] font-semibold text-navy hover:bg-tint disabled:cursor-not-allowed disabled:opacity-50";

type FieldProps = {
  id: string;
  name: string;
  label: string;
  hint?: string;
  error?: string;
  multiline?: boolean;
  /** Text fields are uncontrolled; list rows pass value and onChange, as rows come and go. */
  control: { defaultValue: string } | { value: string; onChange: (value: string) => void };
};

function Field({ id, name, label, hint, error, multiline, control }: FieldProps) {
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
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-navy">
        {label}
      </label>
      {multiline ? (
        <textarea {...props} rows={4} className={`${fieldClass} py-3`} />
      ) : (
        <input {...props} type="text" className={`${fieldClass} h-[50px]`} />
      )}
      {hint && (
        <p id={`${id}-hint`} className="mt-1.5 text-sm text-text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-sm text-error">
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
  const blankRow = () =>
    Object.fromEntries(def.fields.map((field: ListFieldDef) => [field.name, ""]));
  const setCell = (index: number, field: string, value: string) =>
    onChange(rows.map((row, i) => (i === index ? { ...row, [field]: value } : row)));

  return (
    <div className="space-y-4">
      {def.hint && <p className="text-sm text-text-muted">{def.hint}</p>}
      {errors[def.name] && (
        <p role="alert" className="text-sm text-error">
          {errors[def.name]}
        </p>
      )}
      {rows.map((row, index) => (
        <div key={index} className="space-y-3 rounded-[14px] border border-border bg-white p-4">
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
          <button
            type="button"
            className={smallButton}
            onClick={() => onChange(rows.filter((_, i) => i !== index))}
          >
            {`Remove ${def.row} ${index + 1}`}
          </button>
        </div>
      ))}
      <button
        type="button"
        className={smallButton}
        disabled={rows.length >= def.max}
        onClick={() => onChange([...rows, blankRow()])}
      >
        {`Add ${def.row}`}
      </button>
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

  const [lists, setLists] = useState(() => listsOf(schema, initial));
  // A finished save returns the checked rows (trimmed, blank rows dropped), so show those.
  const [shownState, setShownState] = useState(state);
  if (state !== shownState) {
    setShownState(state);
    if (state) setLists(listsOf(schema, state.values));
  }

  return (
    <form action={formAction} noValidate className="mt-8 max-w-[720px] space-y-10">
      {schema.map((group) => (
        <fieldset key={group.title} className="space-y-5">
          <legend className="mb-4 font-heading text-[28px] font-bold text-navy">
            {group.title}
          </legend>
          {group.items.map((item) =>
            item.kind === "list" ? (
              <ListEditor
                key={item.name}
                def={item}
                rows={lists[item.name]}
                errors={errors}
                onChange={(rows) => setLists((current) => ({ ...current, [item.name]: rows }))}
              />
            ) : (
              <TextItem key={item.name} def={item} values={values} errors={errors} />
            ),
          )}
        </fieldset>
      ))}

      <div className="flex flex-wrap items-center gap-4 pt-1">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-gold px-7 py-3.5 text-base font-semibold text-navy shadow-button transition-colors hover:bg-gold-arrow disabled:opacity-70"
        >
          Save
        </button>
        {state?.saved && (
          <p role="status" className="text-[15px] font-semibold text-navy">
            Saved. The public pages now show these changes.
          </p>
        )}
        {state?.error && (
          <p role="alert" className="text-[15px] text-error">
            {state.error}
          </p>
        )}
      </div>
    </form>
  );
}

function TextItem({
  def,
  values,
  errors,
}: {
  def: TextDef;
  values: SectionValues;
  errors: SectionErrors;
}) {
  return (
    <Field
      id={`content-${def.name}`}
      name={def.name}
      label={def.label}
      hint={def.hint}
      error={errors[def.name]}
      multiline={def.multiline}
      control={{ defaultValue: (values[def.name] as string) ?? "" }}
    />
  );
}
