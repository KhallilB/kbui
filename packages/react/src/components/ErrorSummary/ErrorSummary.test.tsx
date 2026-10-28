import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { Fieldset } from "../Fieldset/Fieldset";
import { FileInput } from "../FileInput/FileInput";
import { Input } from "../Input/Input";
import { NumberField } from "../NumberField/NumberField";
import { RadioGroup } from "../RadioGroup/RadioGroup";
import { ErrorSummary } from "./ErrorSummary";

afterEach(cleanup);

describe("ErrorSummary", () => {
  test("renders nothing when items is empty", () => {
    const { container } = render(<ErrorSummary items={[]} />);
    expect(container.firstChild).toBeNull();
  });

  test("renders a focusable alert summary named by its heading and lists recovery links", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <ErrorSummary
        ref={ref}
        description="Fix the highlighted fields before saving."
        items={[
          { href: "#workspace-name", label: "Enter a workspace name" },
          { href: "#contact-email", label: "Enter a valid contact email" },
        ]}
      />,
    );

    const alert = screen.getByRole("alert");
    expect(ref.current).toBe(alert);
    expect(alert.tabIndex).toBe(-1);
    const heading = screen.getByRole("heading", { level: 2, name: "There is a problem" });
    expect(alert.getAttribute("aria-labelledby")).toBe(heading.id);
    const describedBy = alert.getAttribute("aria-describedby") ?? "";
    expect(document.getElementById(describedBy)?.textContent).toBe(
      "Fix the highlighted fields before saving.",
    );

    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(2);
    expect(links[0]?.getAttribute("href")).toBe("#workspace-name");
    expect(links[0]?.textContent).toBe("Enter a workspace name");
  });

  test("supports custom title, headingLevel, and moves focus across Input, Fieldset, NumberField, FileInput and RadioGroup", () => {
    const onItemSelect = vi.fn();
    render(
      <div>
        <ErrorSummary
          title="Unable to save settings"
          headingLevel={3}
          onItemSelect={onItemSelect}
          items={[
            { href: "#workspace-name", label: "Enter a workspace name" },
            { href: "#billing-group", label: "Provide a billing contact" },
            { href: "#seat-limit", label: "Enter a valid seat limit" },
            { href: "#brand-logo", label: "Upload a brand logo" },
            { href: "#plan-tier", label: "Confirm selected plan tier" },
          ]}
        />
        <Input id="workspace-name" label="Workspace name" error="Enter a workspace name" />
        <Fieldset id="billing-group" legend="Billing" tabIndex={-1}>
          <Input id="billing-contact" label="Billing contact" />
        </Fieldset>
        <NumberField id="seat-limit" label="Seat limit" value={5} onValueChange={() => {}} />
        <FileInput
          id="brand-logo"
          label="Brand logo"
          items={[]}
          onFiles={() => {}}
          onRemove={() => {}}
        />
        <RadioGroup id="plan-tier" label="Plan tier" value="pro" onValueChange={() => {}}>
          <RadioGroup.Item value="starter">Starter</RadioGroup.Item>
          <RadioGroup.Item value="pro">Pro</RadioGroup.Item>
        </RadioGroup>
      </div>,
    );

    expect(
      screen.getByRole("heading", { level: 3, name: "Unable to save settings" }),
    ).toBeDefined();

    fireEvent.click(screen.getByRole("link", { name: "Enter a workspace name" }));
    expect(onItemSelect).toHaveBeenCalledWith("#workspace-name", expect.any(Object));
    expect(document.activeElement).toBe(screen.getByLabelText("Workspace name"));

    fireEvent.click(screen.getByRole("link", { name: "Provide a billing contact" }));
    expect(document.activeElement).toBe(screen.getByLabelText("Billing contact"));

    fireEvent.click(screen.getByRole("link", { name: "Enter a valid seat limit" }));
    expect(document.activeElement).toBe(screen.getByLabelText("Seat limit"));

    fireEvent.click(screen.getByRole("link", { name: "Upload a brand logo" }));
    expect(document.activeElement).toBe(screen.getByRole("button", { name: /Brand logo/i }));

    fireEvent.click(screen.getByRole("link", { name: "Confirm selected plan tier" }));
    expect(document.activeElement).toBe(screen.getByRole("radio", { name: "Pro" }));
  });

  test("handles duplicate href items (string and JSX labels) without console key warnings and preserves default navigation for unfocusable targets", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <div>
        <ErrorSummary
          items={[
            { href: "#password", label: <span>Password must be at least 12 characters</span> },
            { href: "#password", label: <span>Password must include a symbol</span> },
            { href: "#locked-group", label: "Locked group requires review" },
          ]}
        />
        <fieldset id="locked-group">
          <legend>Locked</legend>
        </fieldset>
      </div>,
    );

    expect(consoleError).not.toHaveBeenCalled();
    consoleError.mockRestore();

    const lockedLink = screen.getByRole("link", { name: "Locked group requires review" });
    const clickSucceeded = fireEvent.click(lockedLink);
    expect(clickSucceeded).toBe(true);
  });
});
