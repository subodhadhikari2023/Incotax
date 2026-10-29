import { describe, expect, it } from "vitest";

import { enquiryMessage, validateEnquiry } from "./enquiry";

const valid = { name: "Asha Verma", mobile: "9876543210", email: "", service: "", message: "" };

describe("validateEnquiry", () => {
  it("accepts a name and a 10-digit Indian mobile number", () => {
    expect(validateEnquiry(valid)).toEqual({});
  });

  it("requires a name and a mobile number", () => {
    expect(validateEnquiry({ ...valid, name: " ", mobile: "" })).toEqual({
      name: "Please enter your full name.",
      mobile: "Please enter your mobile number.",
    });
  });

  it("rejects mobile numbers that are not 10 digits starting 6–9", () => {
    expect(validateEnquiry({ ...valid, mobile: "12345" }).mobile).toBe(
      "Please enter a valid 10-digit mobile number.",
    );
    expect(validateEnquiry({ ...valid, mobile: "5876543210" }).mobile).toBeDefined();
  });

  it("accepts +91, spaces and dashes around the mobile number", () => {
    expect(validateEnquiry({ ...valid, mobile: "+91 98765-43210" })).toEqual({});
  });

  it("checks the email only when one is given", () => {
    expect(validateEnquiry({ ...valid, email: "not-an-email" }).email).toBe(
      "Please enter a valid email address.",
    );
    expect(validateEnquiry({ ...valid, email: "asha@example.com" })).toEqual({});
  });
});

describe("enquiryMessage", () => {
  it("lists the filled-in details, one per line", () => {
    expect(
      enquiryMessage({
        name: "Asha Verma",
        mobile: "9876543210",
        email: "asha@example.com",
        service: "GST Registration",
        message: "Need help soon.",
      }),
    ).toBe(
      [
        "New enquiry from the website",
        "Name: Asha Verma",
        "Mobile: 9876543210",
        "Email: asha@example.com",
        "Service: GST Registration",
        "Message: Need help soon.",
      ].join("\n"),
    );
  });

  it("leaves out empty optional fields", () => {
    expect(enquiryMessage(valid)).toBe(
      ["New enquiry from the website", "Name: Asha Verma", "Mobile: 9876543210"].join("\n"),
    );
  });
});
