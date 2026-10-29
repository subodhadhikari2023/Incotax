import { expect, test } from "./test";

test("hero shows the headline, WhatsApp button and four stats", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Turn Your Business Vision Into Reality",
  );
  const hero = page.getByRole("region", { name: "Introduction" });
  await expect(hero.getByRole("link", { name: "Chat on WhatsApp" })).toBeVisible();
  await expect(hero.getByRole("listitem")).toHaveCount(4);
});

test("home page sections are in the designed order", async ({ page }) => {
  await page.goto("/");
  const headings = await page.locator("main h2").allTextContents();

  expect(headings.slice(0, 5)).toEqual([
    "Clients We Have Worked With",
    "Our Services",
    expect.any(String), // How it works heading (PENDING placeholder)
    "Fees",
    "What Clients Say",
  ]);
});

test("Our Services has six service cards linking to their pages", async ({ page }) => {
  await page.goto("/");
  const servicesSection = page.locator("#services");

  await expect(servicesSection.getByRole("link", { name: /Learn more/ })).toHaveCount(6);
  await servicesSection
    .getByRole("link", { name: /Learn more/ })
    .first()
    .click();
  await expect(page).toHaveURL(/\/services\//);
});

test("Fees: three plans, Standard highlighted", async ({ page }) => {
  await page.goto("/");
  const cards = page.getByRole("region", { name: "Fees" }).getByRole("article");

  await expect(cards).toHaveCount(3);
  await expect(cards.nth(1)).toHaveAttribute("data-featured", "true");
});

test("stats are 4 across on desktop and tablet, 2×2 on phone", async ({ page }, testInfo) => {
  await page.goto("/");
  const stats = page.getByRole("region", { name: "Introduction" }).getByRole("listitem");
  const tops = await stats.evaluateAll((items) =>
    items.map((el) => Math.round(el.getBoundingClientRect().top)),
  );

  const rows = new Set(tops).size;
  expect(rows).toBe(testInfo.project.name === "phone" ? 2 : 1);
});

test("fee cards are 3 across on desktop and tablet, stacked on phone", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  const cards = page.getByRole("region", { name: "Fees" }).getByRole("article");
  const tops = await cards.evaluateAll((items) =>
    items.map((el) => Math.round(el.getBoundingClientRect().left)),
  );

  expect(new Set(tops).size).toBe(testInfo.project.name === "phone" ? 1 : 3);
});

test("How it works has four steps and reviews show three cards", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("region", { name: "How it works" }).getByRole("listitem"),
  ).toHaveCount(4);
  await expect(
    page.getByRole("region", { name: "What Clients Say" }).getByRole("article"),
  ).toHaveCount(3);
});
