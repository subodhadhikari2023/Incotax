import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Link from "next/link";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { SectionSchema } from "@/lib/content-section";

import { PageEditor, type EditorSection } from "./PageEditor";
import { useFields } from "./useFields";

vi.mock("./PreviewFrame", () => ({
  PreviewFrame: ({ children, device }: { children: React.ReactNode; device: string }) => (
    <div data-testid="frame" data-device={device}>
      {children}
    </div>
  ),
}));

const homeSchema: SectionSchema = [
  {
    title: "Top",
    items: [
      { kind: "text", name: "headline", label: "Headline", max: 50 },
      { kind: "text", name: "label", label: "Label", max: 20 },
      { kind: "text", name: "body", label: "Body", max: 200, multiline: true },
      {
        kind: "text",
        name: "gold",
        label: "Gold words",
        max: 50,
        hint: "Words from the headline.",
      },
      {
        kind: "list",
        name: "clients",
        row: "client",
        max: 2,
        fields: [{ name: "name", label: "name", max: 20 }],
      },
    ],
  },
];
const siteSchema: SectionSchema = [
  { title: "Band", items: [{ kind: "text", name: "band", label: "Band heading", max: 50 }] },
];

function Canvas() {
  const home = useFields("home");
  const site = useFields("site");
  return (
    <main>
      <h1>{home.text("headline", "Default headline")}</h1>
      <p>{home.text("label", "[Label]")}</p>
      <p>{home.text("body")}</p>
      <h2>
        {home.text("headline", "Default headline", {
          display: (v) => <em>{v}</em>,
          label: "Styled",
        })}
      </h2>
      <h2>{site.text("band")}</h2>
      <ul>
        {home.rows("clients").map((_, i) => (
          <li key={i}>
            {home.cell("clients", i, "name")}
            {home.remove("clients", i)}
          </li>
        ))}
      </ul>
      {home.add("clients")}
      <Link href="/services/gst-registration">A link on the page</Link>
    </main>
  );
}

const ok = (values: unknown) => ({ values, errors: {}, saved: true });
const home = { headline: "Hello", label: "", body: "", gold: "", clients: [{ name: "Acme" }] };

function setup(
  overrides: {
    homeAction?: ReturnType<typeof vi.fn>;
    siteAction?: ReturnType<typeof vi.fn>;
    initial?: typeof home;
  } = {},
) {
  const homeAction =
    overrides.homeAction ?? vi.fn(async (_previous: unknown, data: FormData) => ok(toValues(data)));
  const siteAction = overrides.siteAction ?? vi.fn(async () => ok({ band: "Band" }));
  render(
    <PageEditor
      title="Home page"
      publicHref="/"
      sections={[
        {
          key: "home",
          schema: homeSchema,
          action: homeAction as EditorSection["action"],
          initial: overrides.initial ?? home,
        },
        {
          key: "site",
          schema: siteSchema,
          action: siteAction as EditorSection["action"],
          initial: { band: "Band" },
        },
      ]}
      settings={[{ section: "home", name: "gold" }]}
    >
      <Canvas />
    </PageEditor>,
  );
  return { homeAction, siteAction, user: userEvent.setup() };
}

function toValues(data: FormData) {
  return {
    ...home,
    headline: String(data.get("headline") ?? ""),
    clients: data.has("clients.0.name") ? [{ name: String(data.get("clients.0.name")) }] : [],
  };
}

const box = (name: string) => screen.getByRole("textbox", { name });
const save = () => screen.getByRole("button", { name: "Save changes" });

/** What typing does in the page: the element's text changes, then an input event fires. */
function typeInto(element: HTMLElement, text: string) {
  act(() => element.focus());
  element.textContent = text;
  fireEvent.input(element);
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("PageEditor: editing on the page", () => {
  it("makes the page's text editable where it sits", () => {
    setup();
    const headline = within(
      within(screen.getByRole("main")).getByRole("heading", { level: 1 }),
    ).getByRole("textbox");
    expect(headline).toHaveAccessibleName("Headline");
    expect(headline).toHaveTextContent("Hello");
    expect(headline).toHaveAttribute("contenteditable", "plaintext-only");
  });

  it("shows what the site falls back to while a field is blank", () => {
    setup();
    expect(box("Label")).toHaveTextContent("");
    expect(box("Label")).toHaveAttribute("data-placeholder", "[Label]");
  });

  it("names a field and its limit while it is being edited", () => {
    setup();
    expect(screen.getByText(/dashed outline/i)).toBeInTheDocument();
    act(() => box("Headline").focus());
    expect(screen.getByText("Editing: Headline (5 of 50 characters)")).toBeInTheDocument();
  });

  it("keeps two places showing one field in step", () => {
    setup();
    typeInto(box("Headline"), "New words");
    expect(screen.getByRole("textbox", { name: "Styled" })).toHaveTextContent("New words");
  });

  it("can show styled text until it is clicked", async () => {
    const { user } = setup();
    const styled = box("Styled");
    expect(within(styled).getByText("Hello").tagName).toBe("EM");
    expect(styled).not.toHaveAttribute("contenteditable");

    await user.click(styled);

    await waitFor(() => expect(box("Styled")).toHaveAttribute("contenteditable", "plaintext-only"));
    expect(box("Styled")).toHaveFocus();
    expect(box("Styled")).toHaveTextContent("Hello");
  });

  it("stops Enter adding a line to a one-line field, and allows it in a long one", () => {
    setup();
    expect(fireEvent.keyDown(box("Headline"), { key: "Enter" })).toBe(false);
    expect(fireEvent.keyDown(box("Body"), { key: "Enter" })).toBe(true);
  });

  it("does not follow links on the page, and says why", async () => {
    const { user } = setup();
    const link = screen.getByRole("link", { name: "A link on the page" });
    const reached = vi.fn((event: Event) => event.defaultPrevented);
    link.addEventListener("click", reached);

    await user.click(link);

    expect(reached).toHaveReturnedWith(true);
    expect(screen.getByText(/links don't open while you edit/i)).toBeInTheDocument();
  });
});

describe("PageEditor: phone and desktop", () => {
  it("starts on desktop and switches the page to phone width", async () => {
    const { user } = setup();
    expect(screen.getByTestId("frame")).toHaveAttribute("data-device", "desktop");
    expect(screen.getByRole("button", { name: "Desktop" })).toHaveAttribute("aria-pressed", "true");

    await user.click(screen.getByRole("button", { name: "Phone" }));

    expect(screen.getByTestId("frame")).toHaveAttribute("data-device", "phone");
    expect(screen.getByRole("button", { name: "Phone" })).toHaveAttribute("aria-pressed", "true");
  });

  it("opens the live page in a new tab", () => {
    setup();
    const live = screen.getByRole("link", { name: "View live page" });
    expect(live).toHaveAttribute("href", "/");
    expect(live).toHaveAttribute("target", "_blank");
  });
});

describe("PageEditor: lists", () => {
  it("adds a row and goes straight to it", async () => {
    const { user } = setup();
    await user.click(screen.getByRole("button", { name: "Add client" }));
    expect(box("Client 2 name")).toHaveFocus();
    expect(screen.getByText("Unsaved changes")).toBeInTheDocument();
  });

  it("removes a row, returning to the add button", async () => {
    const { user } = setup();
    await user.click(screen.getByRole("button", { name: "Remove client 1" }));
    expect(screen.queryByRole("textbox", { name: "Client 1 name" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add client" })).toHaveFocus();
  });

  it("says a section is hidden on the site while its list is empty", async () => {
    const { user } = setup();
    expect(screen.queryByText(/hidden on the site/i)).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Remove client 1" }));
    expect(screen.getByText(/hidden on the site/i)).toBeInTheDocument();
  });

  it("explains why a full list can't take another row", async () => {
    const { user } = setup();
    const add = screen.getByRole("button", { name: "Add client" });
    await user.click(add);
    expect(add).toBeDisabled();
    expect(add).toHaveAccessibleDescription(/this list is full \(2 of 2\)/i);
  });
});

describe("PageEditor: saving", () => {
  it("starts with nothing unsaved", () => {
    setup();
    expect(screen.getByText("No unsaved changes")).toBeInTheDocument();
  });

  it("saves only what changed, so an untouched section is never rewritten", async () => {
    const { homeAction, siteAction, user } = setup();
    typeInto(box("Headline"), "New words");
    await user.click(save());

    await screen.findByRole("status");
    expect(homeAction).toHaveBeenCalledOnce();
    expect(siteAction).not.toHaveBeenCalled();
    const data = homeAction.mock.calls[0][1] as FormData;
    expect(data.get("headline")).toBe("New words");
    expect(data.get("clients.0.name")).toBe("Acme");
  });

  it("saves every section that changed, one after the other", async () => {
    const order: string[] = [];
    const { user } = setup({
      homeAction: vi.fn(async () => (order.push("home"), ok(home))),
      siteAction: vi.fn(async () => (order.push("site"), ok({ band: "New" }))),
    });
    typeInto(box("Headline"), "New words");
    typeInto(box("Band heading"), "New");
    await user.click(save());

    await screen.findByRole("status");
    expect(order).toEqual(["home", "site"]);
  });

  it("confirms a save, clears the unsaved state and shows the checked values", async () => {
    const { user } = setup({ homeAction: vi.fn(async () => ok({ ...home, headline: "Trimmed" })) });
    typeInto(box("Headline"), "  Trimmed  ");
    act(() => box("Headline").blur());
    await user.click(save());

    expect(await screen.findByRole("status")).toHaveTextContent(/saved/i);
    expect(screen.getByText("No unsaved changes")).toBeInTheDocument();
    expect(box("Headline")).toHaveTextContent("Trimmed");
  });

  it("removes the saved message on the next change", async () => {
    const { user } = setup();
    typeInto(box("Headline"), "One");
    await user.click(save());
    await screen.findByRole("status");

    typeInto(box("Headline"), "Two");

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.getByText("Unsaved changes")).toBeInTheDocument();
  });

  it("marks a refused field on the page, counts it and goes to it", async () => {
    const { user } = setup({
      homeAction: vi.fn(async () => ({
        values: home,
        errors: { headline: "Too long." },
      })),
    });
    typeInto(box("Headline"), "Too long");
    await user.click(save());

    expect(await screen.findByText("Please fix the 1 field marked in red.")).toBeInTheDocument();
    expect(box("Headline")).toHaveAttribute("aria-invalid", "true");
    expect(box("Headline")).toHaveAccessibleDescription("Too long.");
    await waitFor(() => expect(box("Headline")).toHaveFocus());
    expect(screen.getByText("Unsaved changes")).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("clears a field's error once it is edited", async () => {
    const { user } = setup({
      homeAction: vi.fn(async () => ({ values: home, errors: { headline: "Too long." } })),
    });
    typeInto(box("Headline"), "Too long");
    await user.click(save());
    await screen.findAllByText("Too long.");

    typeInto(box("Headline"), "Short");

    expect(screen.queryByText("Too long.")).not.toBeInTheDocument();
    expect(box("Headline")).not.toHaveAttribute("aria-invalid");
  });

  it("keeps what failed unsaved when one of several sections is refused", async () => {
    const { homeAction, user } = setup({
      siteAction: vi.fn(async () => ({
        values: { band: "Bad" },
        errors: {},
        error: "Could not save. Nothing changed; please try again.",
      })),
    });
    typeInto(box("Headline"), "Good");
    typeInto(box("Band heading"), "Bad");
    await user.click(save());

    expect(await screen.findByText(/could not save/i)).toHaveAttribute("role", "alert");
    expect(screen.getByText("Unsaved changes")).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();

    await user.click(save());
    await waitFor(() => expect(homeAction).toHaveBeenCalledOnce());
  });

  it("reports a save that could not reach the server", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { user } = setup({ homeAction: vi.fn().mockRejectedValue(new Error("offline")) });
    typeInto(box("Headline"), "New");
    await user.click(save());

    expect(await screen.findByText(/could not save/i)).toHaveAttribute("role", "alert");
    expect(screen.getByText("Unsaved changes")).toBeInTheDocument();
  });
});

describe("PageEditor: settings that aren't on the page", () => {
  const settings = () => screen.getByRole("button", { name: /not on the page/i });

  it("keeps them out of the way until asked for", async () => {
    const { user } = setup();
    expect(settings()).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByLabelText("Gold words")).not.toBeInTheDocument();

    await user.click(settings());

    expect(settings()).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByLabelText("Gold words")).toBeInTheDocument();
    expect(screen.getByText("Words from the headline.")).toBeInTheDocument();
  });

  it("saves them with the rest of the section", async () => {
    const { homeAction, user } = setup();
    await user.click(settings());
    await user.type(screen.getByLabelText("Gold words"), "Hello");
    await user.click(save());

    await screen.findByRole("status");
    expect((homeAction.mock.calls[0][1] as FormData).get("gold")).toBe("Hello");
  });

  it("opens by itself when a refused field is in there", async () => {
    const { user } = setup({
      homeAction: vi.fn(async () => ({ values: home, errors: { gold: "Not in the headline." } })),
    });
    typeInto(box("Headline"), "New");
    await user.click(save());

    expect(await screen.findByText("Not in the headline.")).toBeInTheDocument();
    expect(screen.getByLabelText("Gold words")).toHaveAttribute("aria-invalid", "true");
  });
});

describe("PageEditor: not losing work", () => {
  it("asks before the way back leaves unsaved work", async () => {
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    const { user } = setup();
    const back = screen.getByRole("link", { name: "Admin panel" });
    const reached = vi.fn((event: Event) => event.preventDefault());
    back.addEventListener("click", reached);

    await user.click(back);
    expect(confirm).not.toHaveBeenCalled();
    expect(reached).toHaveBeenCalledOnce();

    typeInto(box("Headline"), "New");
    await user.click(back);
    expect(confirm).toHaveBeenCalledOnce();
    expect(reached).toHaveBeenCalledOnce();
  });

  it("asks the browser to warn before closing the tab, only with unsaved work", () => {
    setup();
    const unload = () => {
      const event = new Event("beforeunload", { cancelable: true });
      window.dispatchEvent(event);
      return event.defaultPrevented;
    };
    expect(unload()).toBe(false);
    typeInto(box("Headline"), "New");
    expect(unload()).toBe(true);
  });
});
