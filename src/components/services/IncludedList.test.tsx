import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { IncludedList } from "./IncludedList";

const items = [
  { name: "Expert Assistance", description: "Guidance.", plans: ["basic", "standard", "premium"] },
  { name: "GST Registration", description: "GST help.", plans: ["standard", "premium"] },
] as const;

describe("IncludedList", () => {
  it("numbers each item with its name and description", () => {
    render(<IncludedList items={[...items]} />);
    const rows = screen.getAllByRole("listitem");

    expect(rows).toHaveLength(2);
    expect(within(rows[0]).getByText("1")).toBeInTheDocument();
    expect(within(rows[1]).getByText("GST Registration")).toBeInTheDocument();
    expect(within(rows[1]).getByText("GST help.")).toBeInTheDocument();
  });

  it("tags only the items that are not in every plan", () => {
    render(<IncludedList items={[...items]} />);
    const rows = screen.getAllByRole("listitem");

    expect(within(rows[0]).queryByText(/^Included in/)).toBeNull();
    expect(within(rows[1]).getByText("Included in: Standard, Premium")).toBeInTheDocument();
  });
});
