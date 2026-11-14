import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { ClientsSection } from "@/components/home/ClientsSection";
import { Footer } from "@/components/layout/Footer";
import { ContactView } from "@/components/pages/ContactView";
import { WhyIncotaxView } from "@/components/pages/WhyIncotaxView";
import { home } from "@/content/home";
import { contact, whyIncotax } from "@/content/pages";
import { site } from "@/content/site";

describe("checklist answers on the page", () => {
  it("Footer links to Instagram and Facebook in a new tab", () => {
    render(<Footer />);
    const social = screen.getByRole("list", { name: "Social media" });
    const links = within(social).getAllByRole("link");

    expect(links.map((link) => link.getAttribute("aria-label"))).toEqual([
      "IncoTax on Instagram",
      "IncoTax on Facebook",
    ]);
    for (const link of links) {
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", expect.stringContaining("noopener"));
    }
  });

  it("ClientsSection shows each client's logo, named for screen readers", () => {
    render(<ClientsSection />);

    for (const client of home.clients) {
      expect(screen.getByRole("img", { name: client })).toBeInTheDocument();
    }
  });

  it("ClientsSection shows the name of a client without a logo", () => {
    render(<ClientsSection content={{ ...home, clients: ["Acme Traders"] }} />);

    expect(screen.getByText("Acme Traders")).toBeInTheDocument();
    expect(screen.queryByRole("img")).toBeNull();
  });

  it("Why IncoTax picks out the gold words and leaves out photos", () => {
    render(<WhyIncotaxView content={whyIncotax} stats={home.stats} />);
    const heading = screen.getByRole("heading", { level: 1 });

    expect(heading).toHaveTextContent("The Right Partner for Business Growth.");
    expect(within(heading).getByText("Business Growth").tagName).toBe("EM");
    expect(screen.queryByText("[Professional photo]")).toBeNull();
  });

  it("the form has a WhatsApp button that opens a chat straight away", () => {
    render(<EnquiryForm idPrefix="t" />);

    const link = screen.getByRole("link", { name: /WhatsApp/ });
    expect(link.getAttribute("href")).toMatch(/^https:\/\/wa\.me\/918893789730\?text=/);
    expect(screen.getByRole("button", { name: "Get My Quote" })).toBeInTheDocument();
  });

  it("Get My Quote shows the thank-you message with its heading in bold", async () => {
    vi.spyOn(window, "open").mockImplementation(() => null);
    const user = userEvent.setup();
    render(<EnquiryForm idPrefix="t" />);

    await user.type(screen.getByLabelText(/Full Name/), "Asha Verma");
    await user.type(screen.getByLabelText(/Mobile Number/), "9876543210");
    await user.click(screen.getByRole("button", { name: "Get My Quote" }));

    const status = screen.getByRole("status");
    expect(within(status).getByText("Thank You for Your Enquiry!").tagName).toBe("STRONG");
    expect(
      within(status).getByText(/Your form has been submitted successfully/),
    ).toBeInTheDocument();
    expect(within(status).getByText("Your Trust, Our Commitment.").tagName).toBe("STRONG");
  });

  it("Why IncoTax shows a founder's photo only once one is uploaded", () => {
    render(
      <WhyIncotaxView
        content={whyIncotax}
        stats={home.stats}
        photos={["/media/founder-0?v=abc", null]}
      />,
    );

    expect(screen.getByRole("img", { name: "Zeeshan Khan" })).toBeInTheDocument();
    expect(screen.queryByRole("img", { name: "Palak Khemka" })).toBeNull();
    expect(screen.queryByText("[Professional photo]")).toBeNull();
  });

  it("Why IncoTax offers the panel's photo upload for both founders", () => {
    render(
      <WhyIncotaxView
        content={whyIncotax}
        stats={home.stats}
        slots={{ photo: (i) => <button>{`Upload photo ${i}`}</button> }}
      />,
    );

    expect(screen.getByRole("button", { name: "Upload photo 0" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Upload photo 1" })).toBeInTheDocument();
  });

  it("Footer uses the saved social links", () => {
    render(
      <Footer
        business={{
          phone: "+91 90000 00000",
          email: "a@example.test",
          address: "Patna",
          hours: "Daily",
          instagram: "https://www.instagram.com/someone.else",
          facebook: "https://www.facebook.com/someone.else",
        }}
      />,
    );

    expect(screen.getByRole("link", { name: "IncoTax on Instagram" })).toHaveAttribute(
      "href",
      "https://www.instagram.com/someone.else",
    );
    expect(screen.getByRole("link", { name: "IncoTax on Facebook" })).toHaveAttribute(
      "href",
      "https://www.facebook.com/someone.else",
    );
  });

  it("ClientsSection shows an uploaded logo", () => {
    render(
      <ClientsSection
        content={{
          ...home,
          clients: ["Acme Traders"],
          clientLogos: { "Acme Traders": "/media/client-abc123?v=k1" },
        }}
      />,
    );

    expect(screen.getByRole("img", { name: "Acme Traders" })).toBeInTheDocument();
  });

  it("Footer shows the panel's social link fields under the icons", () => {
    render(<Footer business={{ ...site, socialEdit: <p>Instagram link field</p> }} />);
    expect(screen.getByText("Instagram link field")).toBeInTheDocument();
  });

  it("Contact shows the office map and a link to open it", () => {
    render(
      <ContactView
        business={site}
        contact={contact}
        map={{
          embed: "https://www.google.com/maps?q=Patna&output=embed",
          open: "https://maps.app.goo.gl/x",
        }}
      />,
    );
    expect(screen.getByTitle("Office location map")).toHaveAttribute(
      "src",
      "https://www.google.com/maps?q=Patna&output=embed",
    );
    expect(screen.getByRole("link", { name: /Open in Google Maps/ })).toHaveAttribute(
      "href",
      "https://maps.app.goo.gl/x",
    );
  });

  it("Contact leaves out the map until there is one", () => {
    render(<ContactView business={site} contact={contact} map={null} />);
    expect(screen.queryByRole("heading", { name: "Find the office" })).toBeNull();
  });

  it("Contact shows only the Google Maps link when there is no map to embed", () => {
    render(
      <ContactView
        business={site}
        contact={contact}
        map={{ embed: null, open: "https://maps.app.goo.gl/x" }}
      />,
    );
    expect(screen.queryByTitle("Office location map")).toBeNull();
    expect(screen.getByRole("link", { name: /Open in Google Maps/ })).toBeInTheDocument();
  });
});
