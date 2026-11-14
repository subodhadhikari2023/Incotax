import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { getServiceDetail } from "@/content/service-details";
import { getService } from "@/content/services";

import { ServiceView } from "./ServiceView";

const renderService = (slug: string, slots = {}) =>
  render(
    <ServiceView
      service={getService(slug)!}
      detail={getServiceDetail(slug)}
      copy={{ shortDescription: "Short", overviewOne: "One", overviewTwo: "Two" }}
      message={null}
      coversIntro="Intro"
      otherServicesIntro="Others"
      descriptions={{}}
      others={[]}
      slots={slots}
    />,
  );

describe("ServiceView", () => {
  it("shows a plan service as three plan cards instead of tagged items", () => {
    renderService("private-limited-company-incorporation");

    expect(screen.getByRole("heading", { name: "Choose your plan" })).toBeInTheDocument();
    expect(screen.getAllByRole("tabpanel")).toHaveLength(3);
    expect(screen.queryByText(/^Included in:/)).toBeNull();
    expect(screen.queryByRole("heading", { name: "What this service covers" })).toBeNull();
  });

  it("keeps the numbered list for a service without plans", () => {
    renderService("gst-registration");

    expect(screen.getByRole("heading", { name: "What this service covers" })).toBeInTheDocument();
    expect(screen.queryByRole("tabpanel")).toBeNull();
  });

  it("keeps the item list under the cards in the panel, where items are edited", () => {
    renderService("private-limited-company-incorporation", { included: <button>Add</button> });

    expect(screen.getAllByRole("tabpanel")).toHaveLength(3);
    expect(screen.getByRole("heading", { name: "What this service covers" })).toBeInTheDocument();
  });
});
