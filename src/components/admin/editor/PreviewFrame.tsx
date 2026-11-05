"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export type Device = "desktop" | "phone";

const EMPTY_PAGE =
  '<!doctype html><html lang="en"><head><title>Page preview</title></head><body></body></html>';

// Holds the page being edited. The site's layout responds to the width of the window, so a true
// phone view needs its own window: a same-origin frame whose content is rendered from here, which
// keeps it inside the editor's React tree. It is given the same styles as this page.
export function PreviewFrame({ device, children }: { device: Device; children: React.ReactNode }) {
  // Created after mount, so its load event can't fire before this component is listening.
  const [mounted, setMounted] = useState(false);
  const [body, setBody] = useState<HTMLElement | null>(null);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  function onLoad(event: React.SyntheticEvent<HTMLIFrameElement>) {
    const frame = event.currentTarget.contentDocument;
    if (!frame) return;
    for (const style of document.querySelectorAll('link[rel="stylesheet"], style')) {
      frame.head.appendChild(style.cloneNode(true));
    }
    frame.documentElement.className = document.documentElement.className;
    frame.body.className = document.body.className;
    setBody(frame.body);
  }

  return (
    <div className="flex min-h-0 flex-1 justify-center overflow-hidden bg-tint">
      {mounted && (
        <iframe
          title="Page preview"
          srcDoc={EMPTY_PAGE}
          onLoad={onLoad}
          className={`h-full bg-white ${device === "phone" ? "w-[390px] max-w-full shadow-raised" : "w-full"}`}
        />
      )}
      {body && createPortal(children, body)}
    </div>
  );
}
