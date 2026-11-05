"use client";

import { createContext, useContext } from "react";

import { services as defaults, type Service } from "@/content/services";

// Browser components can't read the content store, so the site layout passes the services down here.
const ServiceListContext = createContext<Service[]>(defaults);

export const useServiceList = () => useContext(ServiceListContext);

export function ServiceListProvider({
  services,
  children,
}: {
  services: Service[];
  children: React.ReactNode;
}) {
  return <ServiceListContext.Provider value={services}>{children}</ServiceListContext.Provider>;
}
