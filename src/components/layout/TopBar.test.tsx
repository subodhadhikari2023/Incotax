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

  it("shows the details it is given", () => {
    render(
      <TopBar
        business={{
          phone: "+91 90000 00000",
          whatsappNumber: null,
          email: "a@example.test",
          address: "Patna",
          hours: "Monday to Saturday",
        }}
      />,
    );

    expect(screen.getByText("+91 90000 00000")).toBeInTheDocument();
    expect(screen.getByText("a@example.test")).toBeInTheDocument();
    expect(screen.getByText("Monday to Saturday")).toBeInTheDocument();
    expect(screen.queryByText("[Phone number]")).not.toBeInTheDocument();
  });
});
