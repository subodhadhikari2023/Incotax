import { existsSync } from "node:fs";
import { join } from "node:path";

import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Footer } from "./Footer";
import { Header } from "./Header";

vi.mock("next/navigation", () => ({ usePathname: () => "/" }));

const root = join(__dirname, "../../..");

// The IncoTax "IT" emblem: navy and gold in the header, white and gold on the navy footer, and the
// browser tab icon. The brand name next to it stays real text, so the image itself is decorative.
describe("IncoTax logo", () => {
  it("shows the emblem in the header", () => {
    const { container } = render(<Header />);
    const logo = container.querySelector("header img");

    expect(logo?.getAttribute("src")).toContain("incotax-icon.png");
    expect(logo).toHaveAttribute("alt", "");
    expect(container.textContent).not.toContain("Logo");
  });

  it("shows the light emblem in the footer", () => {
    const { container } = render(<Footer />);

    expect(container.querySelector("footer img")?.getAttribute("src")).toContain(
      "incotax-icon-on-dark.png",
    );
  });

  it("ships the logo files and the browser tab icons", () => {
    for (const file of [
      "public/logo/incotax-icon.png",
      "public/logo/incotax-icon-on-dark.png",
      "src/app/icon.png",
      "src/app/apple-icon.png",
      "src/app/favicon.ico",
    ]) {
      expect(existsSync(join(root, file)), file).toBe(true);
    }
  });

  it("drops the old emblem files, so the browser has one tab icon to choose", () => {
    for (const file of [
      "public/logo/incotax-icon.svg",
      "public/logo/incotax-icon-on-dark.svg",
      "src/app/icon.svg",
    ]) {
      expect(existsSync(join(root, file)), file).toBe(false);
    }
  });
});
