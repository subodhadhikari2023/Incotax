import { useEffect } from "react";

const LEAVE_WARNING = "You have unsaved changes. Leave without saving them?";

/** Whether a click on this link would take the editor away from the page being edited. */
function leavesPage(event: MouseEvent, link: HTMLAnchorElement) {
  if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey) return false;
  return !link.target || link.target === "_self";
}

/** Warns before anything takes the editor away from unsaved work. */
export function useUnsavedWarning(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;

    const onBeforeUnload = (event: BeforeUnloadEvent) => event.preventDefault();
    // Capture phase: Next.js handles its links further down, and the browser warning can't see it.
    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element).closest?.<HTMLAnchorElement>("a[href]");
      if (!link || !leavesPage(event, link) || window.confirm(LEAVE_WARNING)) return;
      event.preventDefault();
      event.stopPropagation();
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("click", onClick, true);
    };
  }, [dirty]);
}
