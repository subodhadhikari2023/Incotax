import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// next/font only works inside Next's compiler. In tests, every font loader
// (Inter, Cormorant_Garamond, ...) returns stub class names instead.
const fontStub = () => ({ className: "font-stub", variable: "font-stub", style: {} });
const isFontName = (key: string | symbol) => typeof key === "string" && key !== "then";
vi.mock(
  "next/font/google",
  () =>
    new Proxy(
      {},
      {
        has: (_, key) => isFontName(key),
        get: (_, key) => (isFontName(key) ? fontStub : undefined),
      },
    ),
);
vi.mock("next/font/local", () => ({ default: fontStub }));

afterEach(() => {
  cleanup();
});
