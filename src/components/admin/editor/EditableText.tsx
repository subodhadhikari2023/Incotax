"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";

import { fieldLabel } from "@/lib/admin/editor-state";

import { fieldId, useEditor, useFocusWhenAsked } from "./EditorContext";

const editableClass =
  "inline-block max-w-full min-w-8 cursor-text rounded-sm break-words whitespace-pre-wrap outline-1 outline-offset-2 outline-gold-deep outline-dashed hover:bg-gold/15 focus:outline-2 focus:outline-solid empty:before:opacity-70 empty:before:content-[attr(data-placeholder)]";

// A piece of the page's own text that can be typed into where it sits. It keeps the styling of
// whatever surrounds it, so the page looks as it will when published. Its text is set directly, not
// through React, because React re-rendering text being typed would move the cursor.
export function EditableText({
  section,
  name,
  placeholder,
  label: labelOverride,
  display,
}: {
  section: string;
  name: string;
  /** Shown faintly while blank: what the site falls back to. */
  placeholder?: string;
  /** Tells apart fields that would share a name on the page. */
  label?: string;
  /** Styled text to show until the field is clicked, such as the gold words of the headline. */
  display?: (value: string) => React.ReactNode;
}) {
  const editor = useEditor();
  const value = String(valueOf(editor.values[section], name));
  const field = fieldLabel(editor.schemas[section], name);
  const label = labelOverride ?? field?.label ?? name;
  const error = editor.errors[section]?.[name];
  const errorId = useId();

  const element = useRef<HTMLSpanElement>(null);
  const [typing, setTyping] = useState(false);
  const showsDisplay = Boolean(display && value && !typing);
  useFocusWhenAsked(fieldId(section, name), element);

  useLayoutEffect(() => {
    const el = element.current;
    if (!el || showsDisplay) return;
    if (el.ownerDocument.activeElement !== el && el.textContent !== value) el.textContent = value;
  });

  // Clicking styled text swaps in the typing version, which then needs the focus and the cursor.
  useEffect(() => {
    const el = element.current;
    if (!typing || !display || !el) return;
    el.textContent = value;
    el.focus();
    const selection = el.ownerDocument.getSelection?.();
    selection?.selectAllChildren(el);
    selection?.collapseToEnd();
    // Only when typing starts: from then on the text is the editor's own.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typing]);

  const shared = {
    ref: element,
    role: "textbox",
    "aria-label": label,
    "aria-multiline": field?.multiline ? true : undefined,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? errorId : undefined,
    tabIndex: 0,
    className: editableClass,
  } as const;

  const report = (length: number) => editor.setActive({ label, length, max: field?.max ?? 0 });

  return (
    <>
      {showsDisplay ? (
        <span key="styled" {...shared} onFocus={() => setTyping(true)}>
          {display?.(value)}
        </span>
      ) : (
        <span
          key="typing"
          {...shared}
          contentEditable="plaintext-only"
          suppressContentEditableWarning
          data-placeholder={placeholder ?? label}
          onFocus={(e) => report(e.currentTarget.textContent?.length ?? 0)}
          onBlur={() => {
            editor.setActive(null);
            setTyping(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !field?.multiline) e.preventDefault();
          }}
          onInput={(e) => {
            const text = e.currentTarget.textContent ?? "";
            // Pasting can bring line breaks into a one-line field.
            editor.setValue(
              section,
              name,
              field?.multiline ? text : text.replace(/\s*\n\s*/g, " "),
            );
            report(text.length);
          }}
        />
      )}
      {error && (
        <span
          id={errorId}
          role="alert"
          className="mt-1 block w-fit rounded bg-white px-2 py-1 text-sm font-semibold text-error"
        >
          {error}
        </span>
      )}
    </>
  );
}

function valueOf(values: Record<string, unknown> | undefined, name: string) {
  const [list, index, cell] = name.split(".");
  if (cell === undefined) return values?.[name] ?? "";
  return (values?.[list] as Record<string, string>[] | undefined)?.[Number(index)]?.[cell] ?? "";
}
