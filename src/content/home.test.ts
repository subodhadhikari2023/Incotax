import { describe, expect, it } from "vitest";

import { home } from "./home";
import { getServiceDetail } from "./service-details";
import { getService } from "./services";

describe("home content", () => {
  it("uses the confirmed hero headline and supporting text", () => {
    expect(home.hero.headline).toBe("Turn Your Business Vision Into Reality");
    expect(home.hero.text).toMatch(/^Your vision deserves the right foundation/);
  });

  it("has the four stats from Zeeshan's answers", () => {
    expect(home.stats.map((s) => s.value)).toEqual(["3+", "150+", "7+", "100%"]);
  });

  it("shows six real services on the home page", () => {
    expect(home.serviceSlugs).toHaveLength(6);
    for (const slug of home.serviceSlugs) {
      expect(getService(slug), slug).toBeDefined();
    }
  });

  it("uses the Private Limited plans for the Fees section, Standard highlighted", () => {
    const plans = getServiceDetail(home.fees.serviceSlug).plans;

    expect(plans?.map((p) => p.id)).toEqual(["basic", "standard", "premium"]);
    expect(home.fees.featuredPlan).toBe("standard");
  });

  it("has four How it works steps", () => {
    expect(home.steps).toHaveLength(4);
  });
});
