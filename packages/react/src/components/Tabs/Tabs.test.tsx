import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, useState } from "react";
import { describe, expect, test, vi } from "vitest";
import { Tabs } from "./Tabs";

describe("Tabs", () => {
  test("renders accessible tablist, switches panels via arrow keys and clicks, and forwards refs", async () => {
    const rootRef = createRef<HTMLDivElement>();
    const listRef = createRef<HTMLDivElement>();
    const tabRef = createRef<HTMLButtonElement>();
    const panelRef = createRef<HTMLDivElement>();
    const onValueChange = vi.fn();

    render(
      <Tabs ref={rootRef} defaultValue="overview" onValueChange={onValueChange}>
        <Tabs.List ref={listRef} aria-label="Service sections">
          <Tabs.Tab ref={tabRef} value="overview" badge="3">
            Overview
          </Tabs.Tab>
          <Tabs.Tab value="metrics">Metrics</Tabs.Tab>
          <Tabs.Tab value="audit" disabled>
            Audit
          </Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel ref={panelRef} value="overview">
          Overview panel content
        </Tabs.Panel>
        <Tabs.Panel value="metrics">Metrics panel content</Tabs.Panel>
        <Tabs.Panel value="audit">Audit panel content</Tabs.Panel>
      </Tabs>,
    );

    const list = screen.getByRole("tablist", { name: "Service sections" });
    expect(rootRef.current).toHaveClass("kb-tabs");
    expect(rootRef.current).toHaveAttribute("data-variant", "line");
    expect(rootRef.current).toHaveAttribute("data-size", "md");
    expect(listRef.current).toBe(list);
    expect(list.querySelector(".kb-tabs-indicator")).not.toBeNull();

    const overviewTab = screen.getByRole("tab", { name: /Overview/ });
    const metricsTab = screen.getByRole("tab", { name: "Metrics" });
    const auditTab = screen.getByRole("tab", { name: "Audit" });
    expect(tabRef.current).toBe(overviewTab);
    expect(overviewTab).toHaveAttribute("aria-selected", "true");
    expect(auditTab).toHaveAttribute("aria-disabled", "true");
    expect(auditTab).toHaveAttribute("data-disabled", "");
    expect(panelRef.current).toBe(screen.getByRole("tabpanel"));
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Overview panel content");

    overviewTab.focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(metricsTab).toHaveFocus();
    expect(metricsTab).toHaveAttribute("aria-selected", "true");
    expect(onValueChange).toHaveBeenCalledWith("metrics", expect.anything());
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Metrics panel content");
  });

  test("supports vertical orientation, pill variant, sm size, manual activation, and controlled value", async () => {
    function ControlledTabs() {
      const [value, setValue] = useState<string | number | null>("general");
      return (
        <Tabs
          value={value}
          onValueChange={setValue}
          orientation="vertical"
          variant="pill"
          size="sm"
          classNames={{
            root: "custom-tabs-root",
            list: "custom-tabs-list",
            tab: "custom-tabs-tab",
            indicator: "custom-tabs-indicator",
            panel: "custom-tabs-panel",
          }}
        >
          <Tabs.List aria-label="Settings" activateOnFocus={false}>
            <Tabs.Tab value="general" icon={<span data-testid="tab-icon">G</span>}>
              General
            </Tabs.Tab>
            <Tabs.Tab value="security">Security</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="general" keepMounted>
            General settings
          </Tabs.Panel>
          <Tabs.Panel value="security" keepMounted>
            Security settings
          </Tabs.Panel>
        </Tabs>
      );
    }

    const { container } = render(<ControlledTabs />);
    const root = container.querySelector(".kb-tabs");
    expect(root).toHaveClass("custom-tabs-root");
    expect(root).toHaveAttribute("data-orientation", "vertical");
    expect(root).toHaveAttribute("data-variant", "pill");
    expect(root).toHaveAttribute("data-size", "sm");
    expect(screen.getByTestId("tab-icon").closest(".kb-tabs-tab-icon")).toHaveAttribute(
      "aria-hidden",
      "true",
    );

    const generalTab = screen.getByRole("tab", { name: "General" });
    const securityTab = screen.getByRole("tab", { name: "Security" });
    expect(generalTab).toHaveClass("custom-tabs-tab");
    expect(container.querySelector(".kb-tabs-indicator")).toHaveClass("custom-tabs-indicator");

    generalTab.focus();
    await userEvent.keyboard("{ArrowDown}");
    expect(securityTab).toHaveFocus();
    expect(generalTab).toHaveAttribute("aria-selected", "true");
    await userEvent.keyboard("{Enter}");
    expect(securityTab).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Security settings");
    expect(screen.getByRole("tabpanel")).toHaveClass("custom-tabs-panel");
  });
  test("owns variant and size attributes while preserving caller props", () => {
    const { container } = render(
      <Tabs variant="pill" size="sm" data-variant="line" data-size="md" data-testid="settings-tabs">
        <Tabs.List aria-label="Settings">
          <Tabs.Tab value="profile">Profile</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="profile">Profile settings</Tabs.Panel>
      </Tabs>,
    );
    expect(container.firstChild).toHaveAttribute("data-variant", "pill");
    expect(container.firstChild).toHaveAttribute("data-size", "sm");
    expect(screen.getByTestId("settings-tabs")).toHaveClass("kb-tabs");
  });

  test("keeps disabled tabs discoverable without selecting them and respects navigation limits", async () => {
    render(
      <Tabs defaultValue="a">
        <Tabs.List aria-label="Sections" loopFocus={false}>
          <Tabs.Tab value="a">Alpha</Tabs.Tab>
          <Tabs.Tab value="b" disabled>
            Beta
          </Tabs.Tab>
          <Tabs.Tab value="c">Gamma</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="a">A</Tabs.Panel>
        <Tabs.Panel value="c">C</Tabs.Panel>
      </Tabs>,
    );
    const alpha = screen.getByRole("tab", { name: "Alpha" });
    const gamma = screen.getByRole("tab", { name: "Gamma" });
    alpha.focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Beta" })).toHaveFocus();
    expect(alpha).toHaveAttribute("aria-selected", "true");
    await userEvent.keyboard("{ArrowRight}");
    expect(gamma).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    expect(gamma).toHaveFocus();
    await userEvent.keyboard("{Home}");
    expect(alpha).toHaveFocus();
    await userEvent.keyboard("{End}");
    expect(gamma).toHaveFocus();
    await userEvent.click(screen.getByRole("tab", { name: "Beta" }));
    expect(gamma).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel")).toHaveAccessibleName("Gamma");
  });

  test("controlled selection waits for parent updates and supports no selection", async () => {
    const change = vi.fn();
    const content = (value: string | null) => (
      <Tabs value={value} onValueChange={change}>
        <Tabs.List aria-label="Views">
          <Tabs.Tab value="a">Alpha</Tabs.Tab>
          <Tabs.Tab value="b">Beta</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="a">A</Tabs.Panel>
        <Tabs.Panel value="b">B</Tabs.Panel>
      </Tabs>
    );
    const { rerender } = render(content("a"));
    await userEvent.click(screen.getByRole("tab", { name: "Beta" }));
    expect(change).toHaveBeenCalledWith("b", expect.anything());
    expect(screen.getByRole("tab", { name: "Alpha" })).toHaveAttribute("aria-selected", "true");
    rerender(content("b"));
    expect(screen.getByRole("tabpanel")).toHaveTextContent("B");
    rerender(content(null));
    expect(screen.queryByRole("tabpanel")).not.toBeInTheDocument();
  });

  test("retains hidden panel drafts and restores them after manual activation", async () => {
    render(
      <Tabs defaultValue={0}>
        <Tabs.List aria-label="Settings" activateOnFocus={false}>
          <Tabs.Tab value={0}>Profile</Tabs.Tab>
          <Tabs.Tab value={1}>Security</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value={0} keepMounted>
          <input aria-label="Name" />
        </Tabs.Panel>
        <Tabs.Panel value={1}>Security options</Tabs.Panel>
      </Tabs>,
    );
    await userEvent.type(screen.getByRole("textbox", { name: "Name" }), "Ada");
    screen.getByRole("tab", { name: "Profile" }).focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("textbox", { name: "Name" })).toBeVisible();
    await userEvent.keyboard(" ");
    expect(screen.queryByRole("textbox", { name: "Name" })).not.toBeInTheDocument();
    expect(screen.getByLabelText("Name")).toHaveValue("Ada");
    await userEvent.click(screen.getByRole("tab", { name: "Profile" }));
    expect(screen.getByRole("textbox", { name: "Name" })).toHaveValue("Ada");
  });

  test("forwards cancellable selection details", async () => {
    render(
      <Tabs defaultValue="a" onValueChange={(_value, details) => details.cancel()}>
        <Tabs.List aria-label="Views">
          <Tabs.Tab value="a">Alpha</Tabs.Tab>
          <Tabs.Tab value="b">Beta</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="a">A</Tabs.Panel>
        <Tabs.Panel value="b">B</Tabs.Panel>
      </Tabs>,
    );
    await userEvent.click(screen.getByRole("tab", { name: "Beta" }));
    expect(screen.getByRole("tab", { name: "Alpha" })).toHaveAttribute("aria-selected", "true");
  });

  test("supports an explicit indicator without duplication and optional indicator removal", () => {
    const ref = createRef<HTMLSpanElement>();
    const content = (explicit: boolean) => (
      <Tabs defaultValue="a">
        <Tabs.List aria-label="Sections" showIndicator={explicit}>
          <Tabs.Tab value="a">Alpha</Tabs.Tab>
          {explicit && <Tabs.Indicator ref={ref} />}
        </Tabs.List>
        <Tabs.Panel value="a">A</Tabs.Panel>
      </Tabs>
    );
    const { container, rerender } = render(content(true));
    expect(container.querySelectorAll(".kb-tabs-indicator")).toHaveLength(1);
    expect(ref.current).toHaveClass("kb-tabs-indicator");
    rerender(content(false));
    expect(container.querySelector(".kb-tabs-indicator")).toBeNull();
  });
});
