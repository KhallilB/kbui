import { cleanup, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, test } from "vitest";
import { FormSection } from "../FormSection/FormSection";
import { Heading } from "../Heading/Heading";
import { Input } from "../Input/Input";
import { Settings } from "./Settings";

afterEach(cleanup);

describe("Settings", () => {
  test("renders header and sections regions around caller sections", () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(
      <Settings ref={ref} header={<Heading level={1}>Account</Heading>}>
        <FormSection title="Profile">
          <Input label="Display name" />
        </FormSection>
        <form aria-label="Email settings">
          <FormSection title="Email">
            <Input label="Address" />
          </FormSection>
        </form>
      </Settings>,
    );
    const root = container.querySelector(".kb-settings");
    expect(ref.current).toBe(root);
    expect([...(root?.children ?? [])].map((node) => node.className)).toEqual([
      "kb-settings-header",
      "kb-settings-sections",
    ]);
    const sections = root?.querySelector(".kb-settings-sections");
    expect(sections?.children).toHaveLength(2);
    expect(screen.getByRole("heading", { level: 1, name: "Account" })).toBeDefined();
    expect(screen.getByRole("group", { name: "Email" })).toBeDefined();
  });

  test("omits the header region when unset", () => {
    const { container } = render(
      <Settings>
        <FormSection title="Profile">x</FormSection>
      </Settings>,
    );
    expect(container.querySelector(".kb-settings-header")).toBeNull();
  });

  test("passes native attributes to the root", () => {
    const { container } = render(
      <Settings aria-label="Workspace settings" id="workspace" className="app-settings">
        <FormSection title="General">x</FormSection>
      </Settings>,
    );
    const root = container.querySelector(".kb-settings");
    expect(root).toHaveAttribute("id", "workspace");
    expect(root).toHaveAttribute("aria-label", "Workspace settings");
    expect(root).toHaveClass("app-settings");
  });
});
