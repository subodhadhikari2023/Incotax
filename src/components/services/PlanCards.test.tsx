import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { PLANS, type PlanId } from "@/content/service-details";

import { PlanCards } from "./PlanCards";

const ALL: PlanId[] = ["basic", "standard", "premium"];
const items = [
  ...Array.from({ length: 9 }, (_, i) => ({ name: `Shared item ${i + 1}`, plans: ALL })),
  { name: "Untagged item" },
  { name: "Standard and Premium item", plans: ["standard", "premium"] as PlanId[] },
  { name: "Premium item", plans: ["premium"] as PlanId[] },
];

const renderCards = () =>
  render(<PlanCards serviceName="Private Limited Company" plans={PLANS} items={items} />);

const card = (plan: string) => screen.getByRole("tabpanel", { name: plan });

describe("PlanCards", () => {
  it("shows one card per plan with its price", () => {
    renderCards();

    expect(within(card("Basic")).getByText("₹1,499")).toBeInTheDocument();
    expect(within(card("Standard")).getByText("₹3,499")).toBeInTheDocument();
    expect(within(card("Premium")).getByText("₹7,499")).toBeInTheDocument();
  });

  it("lists only the items each plan includes", async () => {
    const user = userEvent.setup();
    renderCards();
    for (const button of screen.getAllByRole("button", { name: /Show all/ })) {
      await user.click(button);
    }

    const names = (plan: string) =>
      within(card(plan))
        .getAllByRole("listitem")
        .map((li) => li.textContent);
    expect(names("Basic")).toHaveLength(10);
    expect(names("Basic")).not.toContain("Standard and Premium item");
    expect(names("Standard")).toContain("Standard and Premium item");
    expect(names("Standard")).not.toContain("Premium item");
    expect(names("Premium")).toHaveLength(12);
  });

  it("shows eight items at first, and the rest on request", async () => {
    const user = userEvent.setup();
    renderCards();
    const premium = card("Premium");

    expect(within(premium).getAllByRole("listitem")).toHaveLength(8);
    const toggle = within(premium).getByRole("button", { name: "Show all 12 items" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    await user.click(toggle);
    expect(within(premium).getAllByRole("listitem")).toHaveLength(12);
    expect(within(premium).getByRole("button", { name: "Show fewer" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  it("raises Standard with the popular tag", () => {
    renderCards();

    expect(within(card("Standard")).getByText("Most Popular")).toBeInTheDocument();
    expect(within(card("Basic")).queryByText("Most Popular")).toBeNull();
  });

  it("starts on Standard, and a tab switches the card shown on phones", async () => {
    const user = userEvent.setup();
    renderCards();

    expect(screen.getByRole("tab", { name: "Standard" })).toHaveAttribute("aria-selected", "true");
    expect(card("Basic")).toHaveClass("hidden");
    expect(card("Standard")).not.toHaveClass("hidden");

    await user.click(screen.getByRole("tab", { name: "Premium" }));
    expect(screen.getByRole("tab", { name: "Premium" })).toHaveAttribute("aria-selected", "true");
    expect(card("Premium")).not.toHaveClass("hidden");
    expect(card("Standard")).toHaveClass("hidden");
  });

  it("moves between tabs with the arrow keys", async () => {
    const user = userEvent.setup();
    renderCards();

    screen.getByRole("tab", { name: "Standard" }).focus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Premium" })).toHaveFocus();
    expect(screen.getByRole("tab", { name: "Premium" })).toHaveAttribute("aria-selected", "true");
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Basic" })).toHaveFocus();
  });

  it("Get Started opens WhatsApp naming the service and plan", () => {
    renderCards();

    const link = within(card("Basic")).getByRole("link", { name: /Get Started/ });
    expect(decodeURIComponent(link.getAttribute("href") ?? "")).toContain(
      "know more about Private Limited Company (Basic plan)",
    );
  });
});
