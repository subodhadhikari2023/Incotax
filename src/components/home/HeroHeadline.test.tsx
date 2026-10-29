import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HeroHeadline } from "./HeroHeadline";

describe("HeroHeadline", () => {
  it("renders the gold italic phrase inside the headline", () => {
    render(
      <HeroHeadline text="Turn Your Business Vision Into Reality" goldPhrase="Into Reality" />,
    );
    const heading = screen.getByRole("heading", { level: 1 });

    expect(heading).toHaveTextContent("Turn Your Business Vision Into Reality");
    expect(heading.querySelector("em")).toHaveTextContent("Into Reality");
  });

  it("renders a plain headline while the gold phrase is pending", () => {
    render(<HeroHeadline text="Turn Your Business Vision Into Reality" goldPhrase={null} />);

    expect(screen.getByRole("heading", { level: 1 }).querySelector("em")).toBeNull();
  });

  it("ignores a gold phrase that is not in the headline", () => {
    render(<HeroHeadline text="Turn Your Business Vision Into Reality" goldPhrase="Elsewhere" />);

    expect(screen.getByRole("heading", { level: 1 }).querySelector("em")).toBeNull();
  });
});
