import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { ServiceCard } from "@/components/services/ServiceCard";
import { SiteCopyProvider } from "@/components/SiteCopy";
import { WhatsAppBand } from "@/components/ui/WhatsAppBand";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { services } from "@/content/services";
import { defaultSiteCopy, type SiteCopy } from "@/lib/site-copy-schema";

const copy: SiteCopy = {
  ...defaultSiteCopy,
  whatsappMessage: "Hello IncoTax",
  band: { heading: "Talk to us", line: "Tap below" },
  forms: { submitLabel: "Send", afterSubmit: "Thanks for writing", note: "We reply fast" },
};

const decodedHref = () =>
  decodeURIComponent(
    screen.getByRole("link", { name: "Chat on WhatsApp" }).getAttribute("href") ?? "",
  );

describe("site-wide text reaches the browser components", () => {
  it("WhatsAppButton uses the saved message when given none of its own", () => {
    render(
      <SiteCopyProvider copy={copy}>
        <WhatsAppButton />
      </SiteCopyProvider>,
    );
    expect(decodedHref()).toContain("Hello IncoTax");
  });

  it("WhatsAppButton prefers a service's own message", () => {
    render(
      <SiteCopyProvider copy={copy}>
        <WhatsAppButton message="About GST" />
      </SiteCopyProvider>,
    );
    expect(decodedHref()).toContain("About GST");
    expect(decodedHref()).not.toContain("Hello IncoTax");
  });

  it("WhatsAppButton falls back to the saved message for a service with none", () => {
    render(
      <SiteCopyProvider copy={copy}>
        <WhatsAppButton message={null} />
      </SiteCopyProvider>,
    );
    expect(decodedHref()).toContain("Hello IncoTax");
  });

  it("WhatsAppBand shows the saved heading and line", () => {
    render(
      <SiteCopyProvider copy={copy}>
        <WhatsAppBand />
      </SiteCopyProvider>,
    );
    expect(screen.getByRole("heading", { name: "Talk to us" })).toBeInTheDocument();
    expect(screen.getByText("Tap below")).toBeInTheDocument();
  });

  it("EnquiryForm shows the saved button, note and after-submit message", async () => {
    const user = userEvent.setup();
    const open = window.open;
    window.open = () => null;
    render(
      <SiteCopyProvider copy={copy}>
        <EnquiryForm idPrefix="test" />
      </SiteCopyProvider>,
    );
    expect(screen.getByText("We reply fast")).toBeInTheDocument();

    await user.type(screen.getByLabelText("Full Name*"), "Test Person");
    await user.type(screen.getByLabelText("Mobile Number*"), "9000000000");
    await user.click(screen.getByRole("button", { name: "Send" }));

    expect(await screen.findByRole("status")).toHaveTextContent("Thanks for writing");
    window.open = open;
  });

  it("the components work with the defaults outside a provider", () => {
    render(<WhatsAppBand />);
    expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument();
  });
});

describe("ServiceCard", () => {
  it("shows the description it is given", () => {
    render(<ServiceCard service={services[0]} description="Saved description" />);
    expect(screen.getByText("Saved description")).toBeInTheDocument();
  });
});
