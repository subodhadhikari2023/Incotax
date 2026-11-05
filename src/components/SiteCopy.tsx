"use client";

import { createContext, useContext } from "react";

import { defaultSiteCopy, type SiteCopyNodes } from "@/lib/site-copy-schema";

// Browser components can't read the content store, so the site layout passes the text down here.
const SiteCopyContext = createContext<SiteCopyNodes>(defaultSiteCopy);

export const useSiteCopy = () => useContext(SiteCopyContext);

export function SiteCopyProvider({
  copy,
  children,
}: {
  copy: SiteCopyNodes;
  children: React.ReactNode;
}) {
  return <SiteCopyContext.Provider value={copy}>{children}</SiteCopyContext.Provider>;
}
