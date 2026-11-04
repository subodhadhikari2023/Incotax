import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { saveHomeContent } from "@/app/admin/home/actions";
import { homeListLimits, type HomeFormValues } from "@/lib/home-content";

import { HomeForm } from "./HomeForm";

vi.mock("@/app/admin/home/actions", () => ({ saveHomeContent: vi.fn() }));

const initial: HomeFormValues = {
  heroLabel: "",
  headline: "Build It Right",
  goldPhrase: "",
  heroText: "Support text",
  servicesIntro: "",
  howHeading: "",
  howIntro: "",
  feesIntro: "",
  featuredTag: "",
  reviewsIntro: "",
  stats: [{ value: "5+", label: "Years" }],
  clients: [{ name: "First client" }, { name: "Second client" }],
  steps: [],
  highlights: [],
  reviews: [],
};

const save = () => screen.getByRole("button", { name: "Save" });

afterEach(() => {
  vi.clearAllMocks();
});

describe("HomeForm", () => {
  it("shows the starting values in text fields and list rows", () => {
    render(<HomeForm initial={initial} />);
    expect(screen.getByLabelText("Headline")).toHaveValue("Build It Right");
    expect(screen.getByLabelText("Supporting text")).toHaveValue("Support text");
    expect(screen.getByLabelText("Stat 1 value")).toHaveValue("5+");
    expect(screen.getByLabelText("Stat 1 label")).toHaveValue("Years");
    expect(screen.getByLabelText("Client 2 name")).toHaveValue("Second client");
  });

  it("adds an empty row to a list", async () => {
    const user = userEvent.setup();
    render(<HomeForm initial={initial} />);
    expect(screen.queryByLabelText("Review 1 text")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Add review" }));

    expect(screen.getByLabelText("Review 1 text")).toHaveValue("");
    expect(screen.getByLabelText("Review 1 name")).toHaveValue("");
    expect(screen.getByLabelText("Review 1 city or service")).toHaveValue("");
  });

  it("removes the chosen row and renumbers the rest", async () => {
    const user = userEvent.setup();
    render(<HomeForm initial={initial} />);

    await user.click(screen.getByRole("button", { name: "Remove client 1" }));

    expect(screen.getByLabelText("Client 1 name")).toHaveValue("Second client");
    expect(screen.queryByLabelText("Client 2 name")).not.toBeInTheDocument();
  });

  it("keeps what was typed in other rows when a row is removed", async () => {
    const user = userEvent.setup();
    render(<HomeForm initial={initial} />);

    await user.clear(screen.getByLabelText("Client 2 name"));
    await user.type(screen.getByLabelText("Client 2 name"), "Edited client");
    await user.click(screen.getByRole("button", { name: "Remove client 1" }));

    expect(screen.getByLabelText("Client 1 name")).toHaveValue("Edited client");
  });

  it("stops offering new rows when a list is full", async () => {
    const user = userEvent.setup();
    render(<HomeForm initial={{ ...initial, clients: [] }} />);
    const add = screen.getByRole("button", { name: "Add client" });

    for (let i = 0; i < homeListLimits.clients; i++) await user.click(add);

    expect(screen.getByLabelText(`Client ${homeListLimits.clients} name`)).toBeInTheDocument();
    expect(add).toBeDisabled();
  });

  it("explains that an empty list hides its section", () => {
    render(<HomeForm initial={initial} />);
    expect(screen.getAllByText(/hides this section/i).length).toBeGreaterThan(0);
  });

  it("sends list rows under numbered names, so the action can read them in order", async () => {
    const user = userEvent.setup();
    vi.mocked(saveHomeContent).mockResolvedValue({ values: initial, errors: {}, saved: true });
    render(<HomeForm initial={initial} />);

    await user.click(screen.getByRole("button", { name: "Remove client 1" }));
    await user.click(save());

    await waitFor(() => expect(saveHomeContent).toHaveBeenCalled());
    const data = vi.mocked(saveHomeContent).mock.calls[0][1];
    expect(data.get("headline")).toBe("Build It Right");
    expect(data.get("stats.0.value")).toBe("5+");
    expect(data.get("clients.0.name")).toBe("Second client");
    expect(data.has("clients.1.name")).toBe(false);
  });

  it("confirms a save and shows the saved rows", async () => {
    const user = userEvent.setup();
    vi.mocked(saveHomeContent).mockResolvedValue({
      values: { ...initial, clients: [{ name: "Saved client" }] },
      errors: {},
      saved: true,
    });
    render(<HomeForm initial={initial} />);

    await user.click(save());

    expect(await screen.findByRole("status")).toHaveTextContent(/saved/i);
    expect(screen.getByLabelText("Client 1 name")).toHaveValue("Saved client");
    expect(screen.queryByLabelText("Client 2 name")).not.toBeInTheDocument();
  });

  it("ties each error to its own field, for text and list rows", async () => {
    const user = userEvent.setup();
    vi.mocked(saveHomeContent).mockResolvedValue({
      values: { ...initial, goldPhrase: "Elsewhere" },
      errors: {
        goldPhrase: "Those words are not in the headline.",
        "stats.0.label": "Please fill this in.",
      },
    });
    render(<HomeForm initial={initial} />);

    await user.click(save());

    const gold = await screen.findByLabelText("Gold words in the headline");
    await waitFor(() => expect(gold).toHaveAttribute("aria-invalid", "true"));
    expect(gold).toHaveAccessibleDescription(/not in the headline/i);
    const label = screen.getByLabelText("Stat 1 label");
    expect(label).toHaveAttribute("aria-invalid", "true");
    expect(label).toHaveAccessibleDescription("Please fill this in.");
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("shows an error for a whole list and for a failed save", async () => {
    const user = userEvent.setup();
    vi.mocked(saveHomeContent).mockResolvedValue({
      values: initial,
      errors: { clients: "Please keep this list to 12." },
      error: "Could not save. Nothing changed; please try again.",
    });
    render(<HomeForm initial={initial} />);

    await user.click(save());

    expect(await screen.findByText("Please keep this list to 12.")).toHaveAttribute(
      "role",
      "alert",
    );
    expect(screen.getByText(/could not save/i)).toHaveAttribute("role", "alert");
  });
});
