import { expect, test } from "@playwright/test";

// Colour tokens from CLAUDE.md §4.1, exposed as Tailwind theme variables.
const colours: Record<string, string> = {
  navy: "#0b1f3a",
  "navy-deep": "#07152a",
  "navy-line": "#1e3555",
  gold: "#e3b341",
  "gold-arrow": "#d4a72c",
  "gold-deep": "#b7791f",
  "gold-darkest": "#a16207",
  "gold-tint": "#fbf3dc",
  bg: "#f8fafc",
  white: "#ffffff",
  tint: "#eef2f7",
  "text-body": "#334155",
  "text-muted": "#475569",
  "border-field": "#64748b",
  "footer-muted": "#94a3b8",
  "on-navy": "#cbd5e1",
  border: "#e2e8f0",
};

const toRgb = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return `rgb(${r}, ${g}, ${b})`;
};

test("colour tokens are defined", async ({ page }) => {
  await page.goto("/");
  // Resolve each variable through a real element so "#fff" and "#ffffff" compare equal.
  const values = await page.evaluate((names) => {
    const probe = document.createElement("span");
    document.body.append(probe);
    return Object.fromEntries(
      names.map((name) => {
        probe.style.color = "";
        probe.style.color = `var(--color-${name})`;
        return [name, getComputedStyle(probe).color];
      }),
    );
  }, Object.keys(colours));

  expect(values).toEqual(
    Object.fromEntries(Object.entries(colours).map(([name, hex]) => [name, toRgb(hex)])),
  );
});

test("body uses Inter 16px / 1.5 on the page background", async ({ page }) => {
  await page.goto("/");
  const body = await page.evaluate(() => {
    const style = getComputedStyle(document.body);
    return {
      font: style.fontFamily,
      size: style.fontSize,
      lineHeight: style.lineHeight,
      background: style.backgroundColor,
    };
  });

  expect(body.font).toContain("Inter");
  expect(body.size).toBe("16px");
  expect(body.lineHeight).toBe("24px");
  expect(body.background).toBe("rgb(248, 250, 252)");
});

test("headings use Cormorant Garamond bold", async ({ page }) => {
  await page.goto("/");
  const heading = await page.evaluate(() => {
    const h = document.createElement("h2");
    h.textContent = "Heading";
    document.body.append(h);
    const style = getComputedStyle(h);
    return { font: style.fontFamily, weight: style.fontWeight };
  });

  expect(heading.font).toContain("Cormorant Garamond");
  expect(heading.weight).toBe("700");
});

test("light mode only: dark colour scheme changes nothing", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");
  const background = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);

  expect(background).toBe("rgb(248, 250, 252)");
});
