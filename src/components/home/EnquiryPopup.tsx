"use client";

import { useEffect, useRef, useState } from "react";

import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { CloseIcon } from "@/components/icons";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { popup } from "@/content/pages";

import { POPUP_SEEN_KEY } from "./popup-key";

export { POPUP_SEEN_KEY };

const seen = () => {
  try {
    return sessionStorage.getItem(POPUP_SEEN_KEY) === "1";
  } catch {
    return false;
  }
};

const markSeen = () => {
  try {
    sessionStorage.setItem(POPUP_SEEN_KEY, "1");
  } catch {
    // Storage blocked (private mode): the pop-up may show again, which is harmless.
  }
};

// Pop-up enquiry form shown over the home page when the site opens (CLAUDE.md §6.6). Shown once
// per browser session (frequency PENDING; Claude's default). Closes on ×, Escape or overlay click.
export function EnquiryPopup() {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (seen()) return;
    // Open after mount so the server-rendered page and the first client render match.
    const id = window.setTimeout(() => {
      markSeen();
      setOpen(true);
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.querySelector<HTMLInputElement>("input")?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[rgba(7,21,42,0.78)] px-4 py-10 md:items-center"
      onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="popup-heading"
        className="relative w-full max-w-[500px] rounded-[20px] border-t-[6px] border-gold bg-white p-7 shadow-popup md:p-10"
      >
        <button
          type="button"
          aria-label="Close"
          onClick={() => setOpen(false)}
          className="absolute top-4 right-4 flex size-11 items-center justify-center rounded-full bg-bg text-navy hover:bg-tint"
        >
          <CloseIcon className="text-lg" />
        </button>
        <Eyebrow>{popup.label}</Eyebrow>
        <h2
          id="popup-heading"
          className="mt-4 pr-10 text-[30px]/[1.15] md:text-[34px] lg:text-[38px]"
        >
          {popup.heading}
        </h2>
        <p className="mt-3 mb-6 text-[15px] text-text-muted">{popup.line}</p>
        <EnquiryForm idPrefix="popup" compact note={popup.note} />
      </div>
    </div>
  );
}
