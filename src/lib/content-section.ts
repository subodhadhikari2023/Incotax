// How an editable section of the admin panel is described, read and checked. Plain data and pure
// functions only, because the form in the browser uses them too.

export type TextDef = {
  kind: "text";
  name: string;
  label: string;
  max: number;
  hint?: string;
  multiline?: boolean;
  /** The keyboard a phone shows, such as "tel". */
  inputType?: "tel" | "email";
};

export type ListFieldDef = {
  name: string;
  /** Follows the row's name and number in the label: "Stat 1 value". Empty for one-field rows. */
  label: string;
  max: number;
  optional?: boolean;
  multiline?: boolean;
  hint?: string;
};

export type ListDef = {
  kind: "list";
  name: string;
  /** One row's name, as in "Add stat" and "Stat 1 value". Lowercase. */
  row: string;
  max: number;
  hint?: string;
  fields: ListFieldDef[];
};

export type SectionSchema = {
  title: string;
  /** Where these fields appear on the site, so the editor never has to guess. */
  where: string;
  /** A page of this site showing them, when there is one place to look. */
  href?: string;
  items: (TextDef | ListDef)[];
}[];

export type ListRow = Record<string, string>;
export type SectionValues = Record<string, string | ListRow[]>;
export type SectionErrors = Record<string, string>;

export type SectionState<V> =
  { values: V; errors: SectionErrors; saved?: boolean; error?: string } | undefined;

const defs = (schema: SectionSchema) => schema.flatMap((group) => group.items);
const textDefs = (schema: SectionSchema) =>
  defs(schema).filter((def): def is TextDef => def.kind === "text");
const listDefs = (schema: SectionSchema) =>
  defs(schema).filter((def): def is ListDef => def.kind === "list");

/** What is saved for a section. Ignores anything unexpected, since this is stored data. */
export function savedSection(schema: SectionSchema, stored: unknown): Partial<SectionValues> {
  if (typeof stored !== "object" || stored === null || Array.isArray(stored)) return {};
  const raw = stored as Record<string, unknown>;
  const saved: Partial<SectionValues> = {};

  for (const def of textDefs(schema)) {
    const value = raw[def.name];
    if (typeof value === "string" && value) saved[def.name] = value;
  }
  for (const def of listDefs(schema)) {
    const value = raw[def.name];
    if (!Array.isArray(value)) continue;
    saved[def.name] = value.flatMap((entry: unknown) => {
      if (typeof entry !== "object" || entry === null) return [];
      const row: ListRow = {};
      for (const field of def.fields) {
        const cell = (entry as Record<string, unknown>)[field.name];
        if (typeof cell === "string" && cell) row[field.name] = cell;
        else if (field.optional) row[field.name] = "";
        else return [];
      }
      return [row];
    });
  }
  return saved;
}

const isPlaceholder = (value: string) => value.includes("[");

/**
 * What the form starts with: saved values, else defaults that are real. A placeholder must never
 * be offered as a value, or saving the form would publish it as if it were real content.
 */
export function sectionFormValues(
  schema: SectionSchema,
  stored: unknown,
  defaults: SectionValues,
): SectionValues {
  const saved = savedSection(schema, stored);
  const values: SectionValues = {};
  for (const def of textDefs(schema)) {
    const fallback = defaults[def.name] as string;
    values[def.name] = saved[def.name] ?? (isPlaceholder(fallback) ? "" : fallback);
  }
  for (const def of listDefs(schema)) {
    const fallback = (defaults[def.name] as ListRow[]).filter(
      (row) => !Object.values(row).some(isPlaceholder),
    );
    values[def.name] = saved[def.name] ?? fallback;
  }
  return values;
}

export function parseSectionForm(schema: SectionSchema, data: FormData): SectionValues {
  const values: SectionValues = {};
  for (const def of textDefs(schema)) {
    const value = data.get(def.name);
    values[def.name] = typeof value === "string" ? value : "";
  }
  for (const def of listDefs(schema)) {
    const rows = new Map<number, ListRow>();
    for (const [key, value] of data.entries()) {
      const match = key.match(new RegExp(`^${def.name}\\.(\\d+)\\.(\\w+)$`));
      if (!match || typeof value !== "string") continue;
      const index = Number(match[1]);
      if (!rows.has(index)) {
        rows.set(index, Object.fromEntries(def.fields.map((field) => [field.name, ""])));
      }
      const row = rows.get(index)!;
      if (match[2] in row) row[match[2]] = value;
    }
    values[def.name] = [...rows.entries()].sort(([a], [b]) => a - b).map(([, row]) => row);
  }
  return values;
}

const tooLong = (max: number) => `Please keep this under ${max} characters.`;

/** Blank text is valid (it keeps the default) and a completely blank row is dropped. */
export function validateSection(
  schema: SectionSchema,
  submitted: SectionValues,
): { values: SectionValues; errors: SectionErrors } {
  const values: SectionValues = {};
  const errors: SectionErrors = {};

  for (const def of textDefs(schema)) {
    const value = (submitted[def.name] as string).trim();
    values[def.name] = value;
    if (value.length > def.max) errors[def.name] = tooLong(def.max);
  }
  for (const def of listDefs(schema)) {
    const rows = (submitted[def.name] as ListRow[])
      .map((row) => Object.fromEntries(Object.entries(row).map(([k, v]) => [k, v.trim()])))
      .filter((row) => Object.values(row).some(Boolean));
    values[def.name] = rows;
    if (rows.length > def.max) errors[def.name] = `Please keep this list to ${def.max}.`;
    rows.forEach((row, i) => {
      for (const field of def.fields) {
        const key = `${def.name}.${i}.${field.name}`;
        if (!row[field.name] && !field.optional) {
          errors[key] = "Please fill this in, or remove this row.";
        } else if (row[field.name].length > field.max) {
          errors[key] = tooLong(field.max);
        }
      }
    });
  }
  return { values, errors };
}

/** What to save: lists as they are, so an empty one stays empty; blank text is left out. */
export function sectionToStore(values: SectionValues): SectionValues {
  return Object.fromEntries(Object.entries(values).filter(([, value]) => value !== ""));
}

/** One row's field label, such as "Stat 1 value" or "Fee highlight 1". */
export function rowLabel(def: ListDef, field: ListFieldDef, index: number) {
  const row = `${def.row.charAt(0).toUpperCase()}${def.row.slice(1)} ${index + 1}`;
  return field.label ? `${row} ${field.label}` : row;
}
