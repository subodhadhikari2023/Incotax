// @vitest-environment node
import { describe, expect, it } from "vitest";

import { site } from "@/content/site";

import {
  mergeBusinessDetails,
  officeMap,
  savedBusinessDetails,
  validateBusinessDetails,
} from "./business";

const blank = {
  phone: "",
  whatsappNumber: "",
  email: "",
  address: "",
  hours: "",
  instagram: "",
  facebook: "",
  mapLink: "",
};
const socialHref = (platform: string) => site.social.find((s) => s.platform === platform)?.href;

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
      instagram: socialHref("Instagram"),
      facebook: socialHref("Facebook"),
    });
  });

  it("uses saved social links over Zeeshan's pages", () => {
    const merged = mergeBusinessDetails({
      business: { instagram: "https://www.instagram.com/someone.else" },
    });
    expect(merged.instagram).toBe("https://www.instagram.com/someone.else");
    expect(merged.facebook).toBe(socialHref("Facebook"));
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

describe("validateBusinessDetails", () => {
  it("accepts full social links and refuses anything else", () => {
    expect(
      validateBusinessDetails({
        ...blank,
        instagram: "https://www.instagram.com/incotax.in",
        facebook: "https://www.facebook.com/incotax",
      }).errors,
    ).toEqual({});
    const { errors } = validateBusinessDetails({
      ...blank,
      instagram: "instagram.com/incotax.in",
      facebook: "javascript:alert(1)",
    });
    expect(errors.instagram).toBe("Please paste the full link, starting with https://");
    expect(errors.facebook).toBe("Please paste the full link, starting with https://");
  });

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

describe("the office map", () => {
  it("accepts a Google Maps link, or Google's embed code reduced to its address", () => {
    const check = (mapLink: string) => validateBusinessDetails({ ...blank, mapLink });

    expect(check("https://maps.app.goo.gl/AbC123").errors).toEqual({});
    expect(check("https://www.google.com/maps/place/Patna").errors).toEqual({});
    const embed = check(
      '<iframe src="https://www.google.com/maps/embed?pb=!1m18!2d85" width="600" loading="lazy"></iframe>',
    );
    expect(embed.errors).toEqual({});
    expect(embed.values.mapLink).toBe("https://www.google.com/maps/embed?pb=!1m18!2d85");
  });

  it("refuses links that are not Google Maps", () => {
    for (const bad of ["https://example.com/map", "javascript:alert(1)", "maps.app.goo.gl/x"]) {
      expect(validateBusinessDetails({ ...blank, mapLink: bad }).errors.mapLink, bad).toBe(
        "Please paste a Google Maps link, or the code from Share → Embed a map.",
      );
    }
  });

  it("only offers the link when a share link is saved but the address is still pending", () => {
    expect(officeMap("[Office address]", "https://maps.app.goo.gl/AbC123")).toEqual({
      embed: null,
      open: "https://maps.app.goo.gl/AbC123",
    });
  });

  it("is hidden until there is a real address or a link", () => {
    expect(officeMap("[Office address]", "")).toBeNull();
  });

  it("finds the address on the map, and opens the pasted link", () => {
    expect(officeMap("Furqan Villa, Patna – 801505", "https://maps.app.goo.gl/AbC123")).toEqual({
      embed:
        "https://www.google.com/maps?q=Furqan%20Villa%2C%20Patna%20%E2%80%93%20801505&output=embed",
      open: "https://maps.app.goo.gl/AbC123",
    });
  });

  it("shows exactly the pin from an embed code", () => {
    const embed = "https://www.google.com/maps/embed?pb=!1m18!2d85";
    expect(officeMap("Patna", embed)).toEqual({
      embed,
      open: "https://www.google.com/maps/search/?api=1&query=Patna",
    });
  });
});
