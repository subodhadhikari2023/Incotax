import type { Metadata } from "next";

import { site } from "@/content/site";

export const metadata: Metadata = {
  title: `Admin | ${site.name}`,
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-1 flex-col bg-bg">{children}</div>;
}
