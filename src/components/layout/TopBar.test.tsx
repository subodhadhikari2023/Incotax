import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TopBar } from "./TopBar";

describe("TopBar", () => {
  it("shows phone, email and working hours, with placeholders for pending details", () => {
    render(<TopBar />);

    expect(screen.getByText("[Phone number]")).toBeInTheDocument();
    expect(screen.getByText("[Email address]")).toBeInTheDocument();
    expect(screen.getByText("[Working days], 10 AM to 8 PM")).toBeInTheDocument();
  });
});
