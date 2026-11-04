"use client";

import { saveHomeContent } from "@/app/admin/home/actions";
import { homeSchema, type HomeFormValues } from "@/lib/home-schema";

import { ContentForm } from "./ContentForm";

export function HomeForm({ initial }: { initial: HomeFormValues }) {
  return <ContentForm schema={homeSchema} action={saveHomeContent} initial={initial} />;
}
