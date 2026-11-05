"use client";

import Link from "next/link";
import { useMemo, useRef, useState, useTransition } from "react";

import {
  addRow,
  fieldHint,
  fieldLabel,
  removeRow,
  sectionFormData,
  setField,
} from "@/lib/admin/editor-state";
import { services as defaultServices, type Service } from "@/content/services";
import type {
  SectionErrors,
  SectionSchema,
  SectionState,
  SectionValues,
} from "@/lib/content-section";

import {
  EditorContext,
  fieldId,
  useEditor,
  useFocusWhenAsked,
  type ActiveField,
} from "./EditorContext";
import { PreviewFrame, type Device } from "./PreviewFrame";
import { useUnsavedWarning } from "./useUnsavedWarning";

export type EditorSection = {
  key: string;
  schema: SectionSchema;
  /** Each section's own save action. `never`: this accepts them whatever their values look like. */
  action: (previous: never, formData: FormData) => Promise<SectionState<SectionValues>>;
  initial: SectionValues;
};

/** Text that never shows on the page, such as a pre-filled WhatsApp message. */
export type EditorSetting = { section: string; name: string };

const SAVE_FAILED = "Could not save. Nothing changed; please try again.";

// In-place editing of one public page: toolbar above, the page itself in a frame below. A page can
// show several saved sections (the footer is business details), so each changed section is saved by
// its own action, and untouched sections are never rewritten.
export function PageEditor({
  title,
  publicHref,
  backHref = "/admin",
  backLabel = "Admin panel",
  notice,
  publish,
  serviceList = defaultServices,
  sections,
  settings = [],
  children,
}: {
  title: string;
  /** The live page, if there is one: a draft isn't public yet. */
  publicHref?: string;
  /** Something the editor must know about this page, such as it being a draft. */
  notice?: string;
  /** Makes a draft public. */
  publish?: () => Promise<void>;
  serviceList?: Service[];
  backHref?: string;
  backLabel?: string;
  sections: EditorSection[];
  settings?: EditorSetting[];
  children: React.ReactNode;
}) {
  const schemas = useMemo(
    () => Object.fromEntries(sections.map((section) => [section.key, section.schema])),
    [sections],
  );
  const [values, setValues] = useState(() =>
    Object.fromEntries(sections.map((section) => [section.key, section.initial])),
  );
  const [errors, setErrors] = useState<Record<string, SectionErrors>>({});
  const [files, setFiles] = useState<Record<string, File | "remove" | undefined>>({});
  const [dirty, setDirty] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const [active, setActive] = useState<ActiveField | null>(null);
  const [linkHint, setLinkHint] = useState(false);
  const [device, setDevice] = useState<Device>("desktop");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [saving, startSaving] = useTransition();
  const [publishing, startPublishing] = useTransition();

  const pendingFocusRef = useRef<string | null>(null);
  const [focusVersion, setFocusVersion] = useState(0);
  const askFocus = (id: string) => {
    pendingFocusRef.current = id;
    setFocusVersion((version) => version + 1);
  };

  useUnsavedWarning(dirty.length > 0);

  const changed = (section: string) => {
    setDirty((current) => (current.includes(section) ? current : [...current, section]));
    setSaved(false);
    setFailure(null);
    setLinkHint(false);
  };

  const context = {
    schemas,
    serviceList,
    values,
    errors,
    setActive,
    pendingFocusRef,
    focusVersion,
    files,
    setFile: (section: string, file: File | "remove" | null) => {
      setFiles((all) => ({ ...all, [section]: file ?? undefined }));
      setErrors((all) => ({ ...all, [section]: {} }));
      if (file) changed(section);
    },
    setValue: (section: string, name: string, value: string) => {
      setValues((all) => ({ ...all, [section]: setField(all[section], name, value) }));
      setErrors((all) => {
        if (!all[section]?.[name]) return all;
        const remaining = { ...all[section] };
        delete remaining[name];
        return { ...all, [section]: remaining };
      });
      changed(section);
    },
    add: (section: string, list: string) => {
      const count = (values[section][list] as unknown[]).length;
      const first = editorFirstField(schemas[section], list);
      setValues((all) => ({ ...all, [section]: addRow(schemas[section], all[section], list) }));
      changed(section);
      askFocus(fieldId(section, `${list}.${count}.${first}`));
    },
    remove: (section: string, list: string, index: number) => {
      setValues((all) => ({ ...all, [section]: removeRow(all[section], list, index) }));
      setErrors((all) => ({ ...all, [section]: {} }));
      changed(section);
      askFocus(fieldId(section, `add:${list}`));
    },
  };

  function save() {
    startSaving(async () => {
      const refused: Record<string, SectionErrors> = {};
      const stillDirty: string[] = [];
      let failed: string | null = null;

      for (const section of sections.filter(({ key }) => dirty.includes(key))) {
        try {
          const data = sectionFormData(values[section.key]);
          const file = files[section.key];
          if (file === "remove") data.set("removePhoto", "1");
          else if (file) data.set("photo", file);
          const result = await section.action(undefined as never, data);
          if (result?.saved) {
            setValues((all) => ({ ...all, [section.key]: result.values }));
            setFiles((all) => ({ ...all, [section.key]: undefined }));
            continue;
          }
          stillDirty.push(section.key);
          if (result?.error) failed = result.error;
          if (result && Object.keys(result.errors).length > 0) refused[section.key] = result.errors;
        } catch (error) {
          console.error(`Could not save ${section.key}`, error);
          stillDirty.push(section.key);
          failed = SAVE_FAILED;
        }
      }

      setErrors(refused);
      setDirty(stillDirty);
      setFailure(failed);
      setSaved(stillDirty.length === 0);

      // A refused save may be far from the field at fault, so go to the first one.
      const firstSection = Object.keys(refused)[0];
      if (firstSection) {
        const firstName = Object.keys(refused[firstSection])[0];
        if (settings.some((s) => s.section === firstSection && s.name === firstName)) {
          setSettingsOpen(true);
        }
        askFocus(fieldId(firstSection, firstName));
      }
    });
  }

  const errorCount = Object.values(errors).reduce(
    (total, section) => total + Object.keys(section).length,
    0,
  );

  // Links would leave the editor, and a form on the page isn't there to be sent.
  const blockLinks = (event: React.MouseEvent) => {
    if ((event.target as Element).closest?.("a[href]")) {
      event.preventDefault();
      setLinkHint(true);
    }
  };

  return (
    <EditorContext.Provider value={context}>
      <div className="flex h-dvh flex-col">
        <header className="z-10 border-b border-border bg-white shadow-card">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-4 py-2.5">
            <Link href={backHref} className="text-[15px] font-semibold text-navy underline">
              <span aria-hidden="true">← </span>
              {backLabel}
            </Link>
            <h1 className="min-w-0 font-sans text-[17px] font-semibold text-navy">{title}</h1>

            <div className="ml-auto flex flex-wrap items-center gap-x-3 gap-y-2">
              <div
                role="group"
                aria-label="Page width"
                className="flex rounded-lg border border-border"
              >
                {(
                  [
                    ["desktop", "Desktop"],
                    ["phone", "Phone"],
                  ] as const
                ).map(([option, name]) => (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={device === option}
                    onClick={() => setDevice(option)}
                    className={`px-3 py-1.5 text-sm font-semibold first:rounded-l-lg last:rounded-r-lg ${
                      device === option ? "bg-navy text-white" : "bg-white text-navy hover:bg-tint"
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
              {settings.length > 0 && (
                <button
                  type="button"
                  aria-expanded={settingsOpen}
                  onClick={() => setSettingsOpen((open) => !open)}
                  className="rounded-lg border border-border bg-white px-3 py-1.5 text-sm font-semibold text-navy hover:bg-tint"
                >
                  {`Not on the page (${settings.length})`}
                </button>
              )}
              {publicHref && (
                <a
                  href={publicHref}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="View live page"
                  className="px-1 text-sm font-semibold text-navy underline"
                >
                  View live <span aria-hidden="true">↗</span>
                </a>
              )}
              {publish && (
                <button
                  type="button"
                  disabled={dirty.length > 0 || publishing}
                  title={dirty.length > 0 ? "Save your changes first" : undefined}
                  onClick={() => startPublishing(publish)}
                  className="rounded-lg border-[1.5px] border-navy bg-white px-4 py-1.5 text-[15px] font-semibold text-navy hover:bg-tint disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Publish
                </button>
              )}
              <button
                type="button"
                onClick={save}
                disabled={saving}
                className="rounded-lg bg-gold px-5 py-2 text-[15px] font-semibold text-navy shadow-button transition-colors hover:bg-gold-arrow disabled:opacity-70"
              >
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 border-t border-border bg-bg px-4 py-1.5 text-sm">
            <p aria-live="polite" className="flex items-center gap-2 font-semibold text-navy">
              <span
                aria-hidden="true"
                className={`size-2.5 shrink-0 rounded-full ${dirty.length > 0 ? "bg-gold-deep" : "bg-border-field"}`}
              />
              <span>{dirty.length > 0 ? "Unsaved changes" : "No unsaved changes"}</span>
            </p>
            {notice && <p className="font-semibold text-gold-darkest">{notice}</p>}
            {saved && (
              <p role="status" className="text-text-body">
                Saved. The live site now shows these changes.
              </p>
            )}
            {errorCount > 0 && (
              <p role="alert" className="font-semibold text-error">
                {`Please fix the ${errorCount} ${errorCount === 1 ? "field" : "fields"} marked in red.`}
              </p>
            )}
            {failure && (
              <p role="alert" className="font-semibold text-error">
                {failure}
              </p>
            )}
            <p className="text-text-muted">
              {active
                ? `Editing: ${active.label} (${active.length} of ${active.max} characters)`
                : linkHint
                  ? "Links don't open while you edit. Use View live to try them."
                  : "Click any text with a dashed outline and type. Nothing goes live until you save."}
            </p>
          </div>
        </header>

        <div className="flex min-h-0 flex-1">
          <PreviewFrame device={device}>
            <div
              className="contents"
              onClickCapture={blockLinks}
              onSubmitCapture={(event) => event.preventDefault()}
            >
              {children}
            </div>
          </PreviewFrame>
          {settingsOpen && (
            <aside
              aria-label="Text that isn't on the page"
              className="w-[340px] max-w-[85vw] shrink-0 space-y-5 overflow-y-auto border-l border-border bg-white p-5"
            >
              <p className="text-[15px] text-text-muted">
                These don&apos;t show on the page itself, so they&apos;re changed here.
              </p>
              {settings.map((setting) => (
                <SettingField key={`${setting.section}:${setting.name}`} {...setting} />
              ))}
            </aside>
          )}
        </div>
      </div>
    </EditorContext.Provider>
  );
}

function editorFirstField(schema: SectionSchema, list: string) {
  for (const group of schema) {
    for (const item of group.items) {
      if (item.kind === "list" && item.name === list) return item.fields[0].name;
    }
  }
  return "";
}

function SettingField({ section, name }: EditorSetting) {
  const editor = useEditor();
  const schema = editor.schemas[section];
  const field = fieldLabel(schema, name);
  const hint = fieldHint(schema, name);
  const error = editor.errors[section]?.[name];
  const id = `setting-${section}-${name}`.replace(/\W/g, "-");

  const element = useRef<HTMLElement>(null);
  useFocusWhenAsked(fieldId(section, name), element);

  const described = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ");
  const props = {
    id,
    value: String(editor.values[section]?.[name] ?? ""),
    onChange: (e: { target: { value: string } }) => editor.setValue(section, name, e.target.value),
    "aria-invalid": error ? true : undefined,
    "aria-describedby": described || undefined,
    className:
      "w-full rounded-lg border border-border-field bg-white px-3 py-2 text-[15px] text-navy focus:border-navy focus:outline-2 focus:outline-gold",
  };

  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-semibold text-navy">
        {field?.label ?? name}
      </label>
      {field?.multiline ? (
        <textarea {...props} ref={element as React.RefObject<HTMLTextAreaElement>} rows={4} />
      ) : (
        <input {...props} ref={element as React.RefObject<HTMLInputElement>} type="text" />
      )}
      {hint && (
        <p id={`${id}-hint`} className="mt-1 text-sm text-text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1 text-sm font-semibold text-error">
          {error}
        </p>
      )}
    </div>
  );
}
