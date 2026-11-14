import { describe, expect, it } from "vitest";

import { home } from "./home";
import { contact, forms, popup, whyIncotax, whyIncotaxOptions } from "./pages";
import { getService, whatsappMessageFor } from "./services";
import { site } from "./site";

// Zeeshan's answers from the content checklist (Nov 14) are the defaults every page starts from.
describe("content checklist answers", () => {
  it("has the business details", () => {
    expect(site.phone).toBe("+91 88937 89730");
    expect(site.whatsappNumber).toBe("918893789730");
    expect(site.email).toBe("info@incotax.in");
    expect(site.hours).toBe("Monday to Saturday, 10 AM to 8 PM");
    // Which office to show is still not answered.
    expect(site.address).toBe("[Office address]");
  });

  it("lists the Instagram and Facebook pages", () => {
    expect(site.social.map((s) => s.platform)).toEqual(["Instagram", "Facebook"]);
    for (const link of site.social)
      expect(link.href).toMatch(/^https:\/\/www\.(instagram|facebook)\.com\//);
  });

  it("pre-fills WhatsApp with the service the visitor came from", () => {
    expect(site.whatsappMessage).toBe(
      "Hello Team, I came from your website 🌐. I would like to know more about your services. Kindly share details. Thank You!",
    );
    expect(whatsappMessageFor(getService("gst-registration")!)).toBe(
      "Hello Team, I came from your website 🌐. I would like to know more about GST Registration. Kindly share details. Thank You!",
    );
  });

  it("has the form buttons, reply note and thank-you message", () => {
    expect(forms.submitLabel).toBe("Get My Quote");
    expect(forms.whatsappLabel).toBe("WhatsApp");
    expect(forms.note).toBe("Reply within 30 minutes.");
    expect(forms.afterSubmit).toMatch(/^Thank You for Your Enquiry!/);
    expect(forms.afterSubmit).toMatch(/Your Trust, Our Commitment\.$/);
    expect(popup.note).toBe("Reply within 30 minutes.");
  });

  it("has the home page copy", () => {
    expect(home.hero.label).toBe("You Grow. We Handle The Rest.");
    expect(home.hero.goldPhrase).toBe("Reality");
    expect(home.servicesIntro).toBe("Complete Business & Compliance Solutions");
    expect(home.howItWorks.intro).toMatch(/^Get started with IncoTax in four simple steps/);
    expect(home.steps.map((s) => s.title)).toEqual([
      "Understanding Your Requirements",
      "Document Collection & Verification",
      "Registration & Compliance Filing",
      "Government Review & Approval",
    ]);
    expect(home.fees.intro).toBe("Transparent Pricing, No Surprises");
    expect(home.fees.featuredTag).toBe("Most Popular");
    expect(home.reviewsIntro).toBe("Trusted Feedback, Real Experiences");
  });

  it("shows the six real clients, each with a logo", () => {
    expect(home.clients).toHaveLength(6);
    for (const client of home.clients)
      expect(home.clientLogos[client], client).toMatch(/^\/clients\//);
  });

  it("shows no reviews until real ones arrive", () => {
    expect(home.reviews).toEqual([]);
  });

  it("has the Why IncoTax copy", () => {
    expect(whyIncotax.title).toBe("The Right Partner for Business Growth.");
    expect(whyIncotaxOptions.goldPhrase).toBe("Business Growth");
    expect(whyIncotax.intro).toMatch(/^At IncoTax, we simplify/);
    expect(whyIncotax.aboutParagraphs).toHaveLength(2);
    expect(whyIncotax.aboutParagraphs[0]).toMatch(/^IncoTax is a professional business/);
    expect(whyIncotax.aboutParagraphs[1]).toMatch(/^We believe that every business/);
    expect(whyIncotax.practiceIntro).toBe("Expertise Across Legal Practice Areas");
    for (const founder of whyIncotax.founders) {
      expect(founder.points.join(" ")).not.toMatch(/\[/);
    }
    // The list was confirmed but no one-liners were sent, so cards show the name only.
    expect(whyIncotax.courtLine).toBe("");
    expect(whyIncotax.areaLine).toBe("");
  });

  it("has the Contact page copy", () => {
    expect(contact.title).toBe("Contact Us");
    expect(contact.intro).toBe("We’re Just a Message Away.");
    expect(contact.formHeading).toBe("Let’s Discuss Your Requirements");
    expect(contact.formLine).toMatch(/^Share your details, and our team will get in touch/);
    expect(contact.whatsappLabel).toBe("Fastest Reply");
  });
});
