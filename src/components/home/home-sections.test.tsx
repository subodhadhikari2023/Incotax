import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { home } from "@/content/home";

import { ClientsSection } from "./ClientsSection";
import { FeesSection } from "./FeesSection";
import { HeroSection } from "./HeroSection";
import { HowItWorks } from "./HowItWorks";
import { ReviewsSection } from "./ReviewsSection";
import { ServicesSection } from "./ServicesSection";

describe("home sections with saved content", () => {
  it("HeroSection shows the saved text, gold words and stats", () => {
    render(
      <HeroSection
        content={{
          ...home,
          hero: {
            label: "Trusted advisers",
            headline: "Build It Right",
            goldPhrase: "It Right",
            text: "Support text",
          },
          stats: [
            { value: "5+", label: "Years" },
            { value: "9", label: "Cases" },
          ],
        }}
      />,
    );

    expect(screen.getByText("Trusted advisers")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Build It Right");
    expect(screen.getByText("It Right").tagName).toBe("EM");
    expect(screen.getByText("Support text")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("HeroSection allows two stats with the same label", () => {
    render(
      <HeroSection
        content={{
          ...home,
          stats: [
            { value: "1", label: "Same" },
            { value: "2", label: "Same" },
          ],
        }}
      />,
    );
    expect(screen.getAllByText("Same")).toHaveLength(2);
  });

  it("HeroSection leaves out the stats row when there are no stats", () => {
    render(<HeroSection content={{ ...home, stats: [] }} />);
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });

  it("ClientsSection shows the saved clients, and is hidden when there are none", () => {
    const { container, rerender } = render(
      <ClientsSection content={{ ...home, clients: ["Acme Traders", "Beta Stores"] }} />,
    );
    expect(screen.getAllByRole("listitem").map((item) => item.textContent)).toEqual([
      "Acme Traders",
      "Beta Stores",
    ]);

    rerender(<ClientsSection content={{ ...home, clients: [] }} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("ServicesSection shows the saved intro", () => {
    render(<ServicesSection content={{ ...home, servicesIntro: "Services line" }} />);
    expect(screen.getByText("Services line")).toBeInTheDocument();
  });

  it("HowItWorks shows the saved steps with a joining arrow only between them", () => {
    render(
      <HowItWorks
        content={{
          ...home,
          howItWorks: { heading: "How we work", intro: "Process line" },
          steps: [
            { title: "Message us", text: "On WhatsApp" },
            { title: "We file", text: "You relax" },
          ],
        }}
      />,
    );

    expect(screen.getByRole("heading", { name: "How we work" })).toBeInTheDocument();
    expect(screen.getByText("Process line")).toBeInTheDocument();
    const steps = screen.getAllByRole("listitem");
    expect(steps).toHaveLength(2);
    expect(within(steps[0]).getByText("Message us")).toBeInTheDocument();
    expect(steps[0].querySelector('[aria-hidden="true"]')).not.toBeNull();
    expect(steps[1].querySelector('[aria-hidden="true"]')).toBeNull();
  });

  it("HowItWorks is hidden when there are no steps", () => {
    const { container } = render(<HowItWorks content={{ ...home, steps: [] }} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("FeesSection shows the saved intro, tag and highlights on every plan", () => {
    render(
      <FeesSection
        content={{
          ...home,
          fees: {
            ...home.fees,
            intro: "Clear fees",
            featuredTag: "Most chosen",
            highlights: ["Name approval"],
          },
        }}
      />,
    );

    expect(screen.getByText("Clear fees")).toBeInTheDocument();
    expect(screen.getByText("Most chosen")).toBeInTheDocument();
    for (const card of screen.getAllByRole("article")) {
      expect(within(card).getByText("Name approval")).toBeInTheDocument();
    }
  });

  it("FeesSection keeps its plans and prices but drops the list when there are no highlights", () => {
    render(<FeesSection content={{ ...home, fees: { ...home.fees, highlights: [] } }} />);
    const cards = screen.getAllByRole("article");
    expect(cards).toHaveLength(3);
    expect(within(cards[1]).getByText("₹3,499")).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("ReviewsSection shows the saved reviews, leaving out a blank city or service", () => {
    render(
      <ReviewsSection
        content={{
          ...home,
          reviewsIntro: "Reviews line",
          reviews: [{ text: "Very helpful", name: "A. Client", detail: "" }],
        }}
      />,
    );

    expect(screen.getByText("Reviews line")).toBeInTheDocument();
    const review = screen.getByRole("article");
    expect(within(review).getByText("Very helpful")).toBeInTheDocument();
    expect(within(review).getByText("A. Client")).toBeInTheDocument();
    // Stars, text and name only: no empty line for the missing detail.
    expect(review.querySelectorAll("p")).toHaveLength(3);
  });

  it("ReviewsSection is hidden when there are no reviews", () => {
    const { container } = render(<ReviewsSection content={{ ...home, reviews: [] }} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("each section falls back to the default content when given none", () => {
    render(<ClientsSection />);
    expect(screen.getAllByRole("listitem")).toHaveLength(home.clients.length);
  });
});
