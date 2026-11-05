"use client";

import { createContext, useContext, useEffect, type RefObject } from "react";

import type { SectionErrors, SectionSchema, SectionValues } from "@/lib/content-section";

export type ActiveField = { label: string; length: number; max: number };

export type EditorContextValue = {
  schemas: Record<string, SectionSchema>;
  values: Record<string, SectionValues>;
  errors: Record<string, SectionErrors>;
  /** Files waiting for the next save, per section. "remove" asks for the saved one to go. */
  files: Record<string, File | "remove" | undefined>;
  setFile: (section: string, file: File | "remove" | null) => void;
  setValue: (section: string, name: string, value: string) => void;
  add: (section: string, list: string) => void;
  remove: (section: string, list: string, index: number) => void;
  setActive: (field: ActiveField | null) => void;
  /** Where focus should go next, and a count that changes whenever it is set. */
  pendingFocusRef: RefObject<string | null>;
  focusVersion: number;
};

export const EditorContext = createContext<EditorContextValue | null>(null);

export function useEditor() {
  const editor = useContext(EditorContext);
  if (!editor) throw new Error("useEditor must be used inside PageEditor");
  return editor;
}

export const fieldId = (section: string, name: string) => `${section}:${name}`;

/** Moves focus to this element when asked. One field can show twice, so the first to see it wins. */
export function useFocusWhenAsked(id: string, element: RefObject<HTMLElement | null>) {
  const { pendingFocusRef, focusVersion } = useEditor();
  useEffect(() => {
    if (pendingFocusRef.current !== id || !element.current) return;
    pendingFocusRef.current = null;
    element.current.focus();
  }, [id, element, pendingFocusRef, focusVersion]);
}
