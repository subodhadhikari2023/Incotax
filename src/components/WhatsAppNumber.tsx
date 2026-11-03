"use client";

import { createContext, useContext } from "react";

import { site } from "@/content/site";

// Browser components can't read the content store, so the site layout passes the number down here.
const WhatsAppNumberContext = createContext(site.whatsappNumber);

export const useWhatsAppNumber = () => useContext(WhatsAppNumberContext);

export function WhatsAppNumberProvider({
  number,
  children,
}: {
  number: string | null;
  children: React.ReactNode;
}) {
  return <WhatsAppNumberContext.Provider value={number}>{children}</WhatsAppNumberContext.Provider>;
}
