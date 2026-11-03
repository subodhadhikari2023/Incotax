// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

import { site } from "@/content/site";

import {
  getBusinessDetails,
  mergeBusinessDetails,
  savedBusinessDetails,
  validateBusinessDetails,
} from "./business";
import { readStoredContent } from "./content-store";

vi.mock("./content-store", () => ({ readStoredContent: vi.fn() }));

const blank = { phone: "", whatsappNumber: "", email: "", address: "", hours: "" };

afterEach(() => {
  vi.clearAllMocks();
});

describe("savedBusinessDetails", () => {
  it("is empty when nothing is saved or the saved section has the wrong shape", () => {
    expect(savedBusinessDetails({})).toEqual({});
    expect(savedBusinessDetails({ business: "text" })).toEqual({});
    expect(savedBusinessDetails({ business: null })).toEqual({});
    expect(savedBusinessDetails({ business: [] })).toEqual({});
  });

  it("keeps only known fields holding non-empty text", () => {
    expect(
      savedBusinessDetails({
        business: { phone: "+91 90000 00000", email: "", hours: 10, name: "Not editable" },
      }),
    ).toEqual({ phone: "+91 90000 00000" });
  });
});

describe("mergeBusinessDetails", () => {
  it("shows the src/content defaults for everything that is not saved", () => {
    expect(mergeBusinessDetails({})).toEqual({
      phone: site.phone,
      whatsappNumber: site.whatsappNumber,
      email: site.email,
      address: site.address,
      hours: site.hours,
    });
  });

  it("prefers saved values, field by field", () => {
    const merged = mergeBusinessDetails({
      business: { phone: "+91 90000 00000", whatsappNumber: "919000000000" },
    });
    expect(merged.phone).toBe("+91 90000 00000");
    expect(merged.whatsappNumber).toBe("919000000000");
    expect(merged.email).toBe(site.email);
  });
});

describe("getBusinessDetails", () => {
  it("merges what the store holds over the defaults", async () => {
    vi.mocked(readStoredContent).mockResolvedValue({ business: { email: "a@example.test" } });
    const details = await getBusinessDetails();
    expect(details.email).toBe("a@example.test");
    expect(details.phone).toBe(site.phone);
  });
});

describe("validateBusinessDetails", () => {
  it("allows every field to be blank, since details arrive a few at a time", () => {
    expect(validateBusinessDetails(blank)).toEqual({ values: blank, errors: {} });
  });

  it("trims every field", () => {
    const { values, errors } = validateBusinessDetails({
      ...blank,
      phone: "  +91 90000 00000 ",
      address: " Patna ",
    });
    expect(errors).toEqual({});
    expect(values.phone).toBe("+91 90000 00000");
    expect(values.address).toBe("Patna");
  });

  it.each(["+91 90000 00000", "033-2345 6789", "(033) 23456789", "9000000000"])(
    "accepts the phone number %s",
    (phone) => {
      expect(validateBusinessDetails({ ...blank, phone }).errors).toEqual({});
    },
  );

  it.each(["call us", "12345", "+91 90000 00000 ext", "1".repeat(16)])(
    "rejects the phone number %s",
    (phone) => {
      expect(validateBusinessDetails({ ...blank, phone }).errors.phone).toEqual(expect.any(String));
    },
  );

  it("stores the WhatsApp number as digits only", () => {
    const { values, errors } = validateBusinessDetails({
      ...blank,
      whatsappNumber: "+91 90000-00000",
    });
    expect(errors).toEqual({});
    expect(values.whatsappNumber).toBe("919000000000");
  });

  // wa.me needs the country code: a bare 10-digit number would open a chat with the wrong person.
  it.each(["9000000000", "not a number", "9".repeat(16)])(
    "rejects the WhatsApp number %s",
    (whatsappNumber) => {
      expect(validateBusinessDetails({ ...blank, whatsappNumber }).errors.whatsappNumber).toEqual(
        expect.any(String),
      );
    },
  );

  it("checks the email format", () => {
    expect(validateBusinessDetails({ ...blank, email: "a@example.test" }).errors).toEqual({});
    expect(validateBusinessDetails({ ...blank, email: "not-an-email" }).errors.email).toEqual(
      expect.any(String),
    );
  });

  it("limits the length of the address and hours", () => {
    const { errors } = validateBusinessDetails({
      ...blank,
      address: "a".repeat(301),
      hours: "h".repeat(101),
    });
    expect(errors.address).toEqual(expect.any(String));
    expect(errors.hours).toEqual(expect.any(String));
    expect(
      validateBusinessDetails({ ...blank, address: "a".repeat(300), hours: "h".repeat(100) })
        .errors,
    ).toEqual({});
  });
});
