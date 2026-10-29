import { test as base } from "@playwright/test";

import { POPUP_SEEN_KEY } from "../src/components/home/popup-key";

// Shared test: marks the home page pop-up as already seen so it doesn't cover the page.
// e2e/popup.spec.ts uses the plain Playwright test to check the pop-up itself.
export const test = base.extend({
  page: async ({ page }, provide) => {
    await page.addInitScript((key) => sessionStorage.setItem(key, "1"), POPUP_SEEN_KEY);
    await provide(page);
  },
});

export { expect } from "@playwright/test";
