import {
  rowLabel,
  type ListDef,
  type ListRow,
  type SectionSchema,
  type SectionValues,
} from "@/lib/content-section";

// The in-place editor's state changes, as pure functions: values are never changed in place.

const items = (schema: SectionSchema) => schema.flatMap((group) => group.items);

const listDef = (schema: SectionSchema, name: string) =>
  items(schema).find((item): item is ListDef => item.kind === "list" && item.name === name);

/** The fields a section's save action reads: "headline", "reviews.0.text". */
export function sectionFormData(values: SectionValues): FormData {
  const data = new FormData();
  for (const [name, value] of Object.entries(values)) {
    if (typeof value === "string") data.set(name, value);
    else {
      value.forEach((row, index) => {
        for (const [field, cell] of Object.entries(row))
          data.set(`${name}.${index}.${field}`, cell);
      });
    }
  }
  return data;
}

/** Sets a text field, or a list cell named like "reviews.0.text". */
export function setField(values: SectionValues, name: string, value: string): SectionValues {
  const [list, index, field] = name.split(".");
  if (field === undefined) return { ...values, [name]: value };
  const rows = (values[list] as ListRow[]).map((row, i) =>
    i === Number(index) ? { ...row, [field]: value } : row,
  );
  return { ...values, [list]: rows };
}

export function addRow(schema: SectionSchema, values: SectionValues, list: string): SectionValues {
  const blank = Object.fromEntries((listDef(schema, list)?.fields ?? []).map((f) => [f.name, ""]));
  return { ...values, [list]: [...(values[list] as ListRow[]), blank] };
}

export function removeRow(values: SectionValues, list: string, index: number): SectionValues {
  return { ...values, [list]: (values[list] as ListRow[]).filter((_, i) => i !== index) };
}

export const listDefinition = (schema: SectionSchema, list: string) => listDef(schema, list);

/** What a field is called and how long it may be, for the page and the toolbar. */
export function fieldLabel(schema: SectionSchema, name: string) {
  const [list, index, cell] = name.split(".");
  if (cell === undefined) {
    const def = items(schema).find((item) => item.kind === "text" && item.name === name);
    if (def?.kind !== "text") return undefined;
    return { label: def.label, max: def.max, multiline: def.multiline };
  }
  const def = listDef(schema, list);
  const field = def?.fields.find((f) => f.name === cell);
  if (!def || !field) return undefined;
  return {
    label: rowLabel(def, field, Number(index)),
    max: field.max,
    multiline: field.multiline,
  };
}

/** A setting's hint, for those shown off the page. */
export function fieldHint(schema: SectionSchema, name: string) {
  const def = items(schema).find((item) => item.kind === "text" && item.name === name);
  return def?.kind === "text" ? def.hint : undefined;
}
