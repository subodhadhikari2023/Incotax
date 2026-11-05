// @vitest-environment node
import { describe, expect, it } from "vitest";

import { businessSchema } from "@/lib/business-schema";

describe("the business details form", () => {
  it("keeps its fields, with the phone keyboard and email keyboard on phones", () => {
    const fields = businessSchema.flatMap((group) => group.items);
    expect(fields.map((field) => field.name)).toEqual([
      "phone",
      "whatsappNumber",
      "email",
      "address",
      "hours",
    ]);
    expect(fields.map((field) => field.kind === "text" && field.inputType)).toEqual([
      "tel",
      "tel",
      "email",
      undefined,
      undefined,
    ]);
  });
});
