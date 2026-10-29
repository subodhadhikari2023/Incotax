import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { EnquiryForm } from "./EnquiryForm";

const open = vi.spyOn(window, "open").mockImplementation(() => null);
afterEach(() => open.mockClear());

describe("EnquiryForm", () => {
  it("has the designed fields, with name and mobile required", () => {
    render(<EnquiryForm idPrefix="t" withMessage />);

    expect(screen.getByLabelText(/Full Name/)).toBeRequired();
    expect(screen.getByLabelText(/Mobile Number/)).toBeRequired();
    expect(screen.getByLabelText("Email")).not.toBeRequired();
    expect(screen.getByLabelText("Select Service")).toBeInTheDocument();
    expect(screen.getByLabelText("Message")).toBeInTheDocument();
  });

  it("leaves out the message field when not asked for", () => {
    render(<EnquiryForm idPrefix="t" />);

    expect(screen.queryByLabelText("Message")).toBeNull();
  });

  it("shows errors and does not open WhatsApp when required fields are missing", async () => {
    const user = userEvent.setup();
    render(<EnquiryForm idPrefix="t" />);

    await user.click(screen.getByRole("button"));

    expect(screen.getByText("Please enter your full name.")).toBeInTheDocument();
    expect(screen.getByText("Please enter your mobile number.")).toBeInTheDocument();
    expect(open).not.toHaveBeenCalled();
  });

  it("opens WhatsApp with the details and shows the after-submit message", async () => {
    const user = userEvent.setup();
    render(<EnquiryForm idPrefix="t" />);

    await user.type(screen.getByLabelText(/Full Name/), "Asha Verma");
    await user.type(screen.getByLabelText(/Mobile Number/), "9876543210");
    await user.selectOptions(screen.getByLabelText("Select Service"), "GST Registration");
    await user.click(screen.getByRole("button"));

    expect(open).toHaveBeenCalledTimes(1);
    const [url, target] = open.mock.calls[0];
    expect(url).toMatch(/^https:\/\/wa\.me\/\?text=/);
    expect(decodeURIComponent(String(url))).toContain("Name: Asha Verma");
    expect(decodeURIComponent(String(url))).toContain("Service: GST Registration");
    expect(target).toBe("_blank");
    expect(screen.getByRole("status")).toBeInTheDocument();
  });
});
