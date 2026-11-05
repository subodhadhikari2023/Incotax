import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Link from "next/link";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { SectionSchema, SectionState, SectionValues } from "@/lib/content-section";

import { ContentForm } from "./ContentForm";

const schema: SectionSchema = [
  {
    title: "Intro",
    where: "At the top of the page.",
    href: "/#intro",
    items: [
      { kind: "text", name: "headline", label: "Headline", max: 50 },
      { kind: "text", name: "phone", label: "Phone", max: 20, inputType: "tel" },
    ],
  },
  {
    title: "Clients",
    where: "Just under the intro.",
    items: [
      {
        kind: "list",
        name: "clients",
        row: "client",
        max: 3,
        hint: "Leaving this list empty hides this section.",
        fields: [
          { name: "name", label: "name", max: 20 },
          { name: "city", label: "city", max: 20, optional: true },
        ],
      },
    ],
  },
];

const initial: SectionValues = { headline: "Hello", phone: "", clients: [] };
type Action = (
  previous: SectionState<SectionValues>,
  data: FormData,
) => Promise<SectionState<SectionValues>>;

function setup(action: Action = vi.fn()) {
  const user = userEvent.setup();
  render(
    <>
      <Link href="/somewhere-else">Elsewhere</Link>
      <a href="/" target="_blank" rel="noreferrer">
        New tab
      </a>
      <ContentForm schema={schema} action={action} initial={initial} />
    </>,
  );
  return user;
}

const save = () => screen.getByRole("button", { name: "Save changes" });

/** Clicks a link and says whether the click got through to it. */
function clickGetsThrough(name: string) {
  const link = screen.getByRole("link", { name });
  const reached = vi.fn();
  const listener = (event: Event) => {
    reached();
    event.preventDefault();
  };
  link.addEventListener("click", listener);
  fireEvent.click(link);
  link.removeEventListener("click", listener);
  return reached.mock.calls.length > 0;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ContentForm: knowing where you are", () => {
  it("offers a jump link to each group of fields", () => {
    setup();
    const jump = screen.getByRole("navigation", { name: "Parts of this page" });
    const links = within(jump).getAllByRole("link");
    expect(links.map((link) => link.textContent)).toEqual(["Intro", "Clients"]);
    for (const link of links) {
      const target = link.getAttribute("href")!.slice(1);
      expect(document.getElementById(target)).toHaveAccessibleName(link.textContent!);
    }
  });

  it("does not offer jump links for a form with one group", () => {
    render(<ContentForm schema={[schema[0]]} action={vi.fn()} initial={initial} />);
    expect(
      screen.queryByRole("navigation", { name: "Parts of this page" }),
    ).not.toBeInTheDocument();
  });

  it("says where each group appears, and links to it when it can", () => {
    setup();
    expect(screen.getByText("At the top of the page.")).toBeInTheDocument();
    expect(screen.getByText("Just under the intro.")).toBeInTheDocument();
    const see = screen.getByRole("link", { name: "See Intro on the site" });
    expect(see).toHaveAttribute("href", "/#intro");
    expect(see).toHaveAttribute("target", "_blank");
    expect(screen.queryByRole("link", { name: "See Clients on the site" })).not.toBeInTheDocument();
  });

  it("uses the keyboard a field needs on a phone", () => {
    setup();
    expect(screen.getByLabelText("Phone")).toHaveAttribute("type", "tel");
    expect(screen.getByLabelText("Headline")).toHaveAttribute("type", "text");
  });
});

describe("ContentForm: lists", () => {
  it("says plainly when a list is empty, and stops once it has a row", async () => {
    const user = setup();
    expect(screen.getByText("Nothing added yet.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Add client" }));
    expect(screen.queryByText("Nothing added yet.")).not.toBeInTheDocument();
  });

  it("moves to the new row after adding one", async () => {
    const user = setup();
    await user.click(screen.getByRole("button", { name: "Add client" }));
    expect(screen.getByLabelText("Client 1 name")).toHaveFocus();
  });

  it("moves to the add button after removing a row, so focus is not lost", async () => {
    const user = setup();
    await user.click(screen.getByRole("button", { name: "Add client" }));
    await user.click(screen.getByRole("button", { name: "Remove client 1" }));
    expect(screen.getByRole("button", { name: "Add client" })).toHaveFocus();
  });

  it("explains why a full list can't take another row", async () => {
    const user = setup();
    const add = screen.getByRole("button", { name: "Add client" });
    expect(screen.queryByText(/this list is full/i)).not.toBeInTheDocument();

    for (let i = 0; i < 3; i++) await user.click(add);

    expect(add).toBeDisabled();
    expect(add).toHaveAccessibleDescription(
      "This list is full (3 of 3). Remove one to add another.",
    );
  });

  it("does not take focus when the page first loads", () => {
    setup();
    expect(document.body).toHaveFocus();
  });
});

describe("ContentForm: unsaved changes", () => {
  it("starts with nothing unsaved", () => {
    setup();
    expect(screen.getByText("No unsaved changes")).toBeInTheDocument();
  });

  it("notices typing in a field", async () => {
    const user = setup();
    await user.type(screen.getByLabelText("Headline"), "!");
    expect(screen.getByText("Unsaved changes")).toBeInTheDocument();
  });

  it("notices adding a row and typing in it", async () => {
    const user = setup();
    await user.click(screen.getByRole("button", { name: "Add client" }));
    expect(screen.getByText("Unsaved changes")).toBeInTheDocument();
  });

  it("clears after a save that worked, and confirms it", async () => {
    const user = setup(vi.fn().mockResolvedValue({ values: initial, errors: {}, saved: true }));
    await user.type(screen.getByLabelText("Headline"), "!");
    await user.click(save());

    expect(await screen.findByRole("status")).toHaveTextContent(/saved/i);
    expect(screen.getByText("No unsaved changes")).toBeInTheDocument();
  });

  it("removes the saved message as soon as there is a new change", async () => {
    const user = setup(vi.fn().mockResolvedValue({ values: initial, errors: {}, saved: true }));
    await user.click(save());
    await screen.findByRole("status");

    await user.type(screen.getByLabelText("Headline"), "!");

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.getByText("Unsaved changes")).toBeInTheDocument();
  });

  it("stays unsaved after a save that failed", async () => {
    const user = setup(
      vi.fn().mockResolvedValue({ values: initial, errors: {}, error: "Could not save." }),
    );
    await user.type(screen.getByLabelText("Headline"), "!");
    await user.click(save());

    expect(await screen.findByText("Could not save.")).toHaveAttribute("role", "alert");
    expect(screen.getByText("Unsaved changes")).toBeInTheDocument();
  });

  it("lets links work while nothing is unsaved", () => {
    const confirm = vi.spyOn(window, "confirm");
    setup();
    expect(clickGetsThrough("Elsewhere")).toBe(true);
    expect(confirm).not.toHaveBeenCalled();
  });

  it("asks before a link leaves unsaved work, and stays if told to", async () => {
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    const user = setup();
    await user.type(screen.getByLabelText("Headline"), "!");

    expect(clickGetsThrough("Elsewhere")).toBe(false);
    expect(confirm).toHaveBeenCalledOnce();
  });

  it("follows the link if the editor chooses to leave", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const user = setup();
    await user.type(screen.getByLabelText("Headline"), "!");
    expect(clickGetsThrough("Elsewhere")).toBe(true);
  });

  it("does not ask for links that keep the form open", async () => {
    const confirm = vi.spyOn(window, "confirm");
    const user = setup();
    await user.type(screen.getByLabelText("Headline"), "!");

    expect(clickGetsThrough("New tab")).toBe(true);
    expect(clickGetsThrough("Clients")).toBe(true);
    expect(confirm).not.toHaveBeenCalled();
  });

  it("asks before another form, such as logging out, leaves unsaved work", async () => {
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    const logOut = vi.fn((event: React.FormEvent) => event.preventDefault());
    const user = userEvent.setup();
    render(
      <>
        <form onSubmit={logOut}>
          <button type="submit">Log out</button>
        </form>
        <ContentForm schema={schema} action={vi.fn()} initial={initial} />
      </>,
    );
    await user.type(screen.getByLabelText("Headline"), "!");
    await user.click(screen.getByRole("button", { name: "Log out" }));

    expect(confirm).toHaveBeenCalledOnce();
    expect(logOut).not.toHaveBeenCalled();
  });

  it("does not ask when saving the form itself", async () => {
    const confirm = vi.spyOn(window, "confirm");
    const user = setup(vi.fn().mockResolvedValue({ values: initial, errors: {}, saved: true }));
    await user.type(screen.getByLabelText("Headline"), "!");
    await user.click(save());

    await screen.findByRole("status");
    expect(confirm).not.toHaveBeenCalled();
  });

  it("asks the browser to warn before closing the tab, only with unsaved work", async () => {
    const user = setup();
    const unload = () => {
      const event = new Event("beforeunload", { cancelable: true });
      window.dispatchEvent(event);
      return event.defaultPrevented;
    };
    expect(unload()).toBe(false);
    await user.type(screen.getByLabelText("Headline"), "!");
    expect(unload()).toBe(true);
  });
});

describe("ContentForm: mistakes", () => {
  const refused = {
    values: { ...initial, clients: [{ name: "", city: "Patna" }] },
    errors: { headline: "Too long.", "clients.0.name": "Please fill this in." },
  };

  it("counts what needs fixing beside the save button", async () => {
    const user = setup(vi.fn().mockResolvedValue(refused));
    await user.click(save());
    expect(await screen.findByText("Please fix the 2 fields marked in red.")).toHaveAttribute(
      "role",
      "alert",
    );
  });

  it("uses the singular for one field", async () => {
    const user = setup(
      vi.fn().mockResolvedValue({ values: initial, errors: { headline: "Too long." } }),
    );
    await user.click(save());
    expect(await screen.findByText("Please fix the 1 field marked in red.")).toBeInTheDocument();
  });

  it("takes the editor to the first field to fix", async () => {
    const user = setup(vi.fn().mockResolvedValue(refused));
    await user.click(save());
    await waitFor(() => expect(screen.getByLabelText("Headline")).toHaveFocus());
  });
});
