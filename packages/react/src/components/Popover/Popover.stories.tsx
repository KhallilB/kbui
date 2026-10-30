import type { Meta, StoryObj } from "@storybook/react-vite";
import { type CSSProperties, useId, useRef, useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Button } from "../Button/Button";
import { Checkbox } from "../Checkbox/Checkbox";
import { Dialog } from "../Dialog/Dialog";
import { Input } from "../Input/Input";
import { Popover } from "./Popover";

const meta = { title: "Components/Popover", component: Popover, tags: ["autodocs"] } satisfies Meta<
  typeof Popover
>;
export default meta;
type Story = StoryObj<typeof meta>;

function ViewOptions() {
  const [open, setOpen] = useState(false);
  const [descriptions, setDescriptions] = useState(true);
  const [compact, setCompact] = useState(false);
  const activity = [
    { title: "Design review", description: "Review the latest interface changes." },
    { title: "Accessibility audit", description: "Check keyboard and screen-reader behavior." },
    { title: "Release checklist", description: "Prepare the next package release." },
  ];
  return (
    <section aria-label="Activity workspace" style={{ width: "min(100%, 28rem)" }}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "var(--kb-space-3)",
        }}
      >
        <h3 style={{ margin: 0 }}>Project activity</h3>
        <Popover open={open} onOpenChange={setOpen}>
          <Popover.Trigger render={<Button variant="secondary" />}>
            View options
            <svg
              aria-hidden="true"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              style={{ transform: open ? "rotate(180deg)" : undefined }}
            >
              <path
                d="m4 6 4 4 4-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Popover.Trigger>
          <Popover.Content
            title="View options"
            description="Changes apply immediately."
            align="end"
          >
            <Popover.Body style={{ display: "grid", gap: "var(--kb-space-3)" }}>
              <Checkbox
                label="Show descriptions"
                checked={descriptions}
                onCheckedChange={setDescriptions}
              />
              <Checkbox label="Compact spacing" checked={compact} onCheckedChange={setCompact} />
            </Popover.Body>
            <Popover.Footer>
              <Button
                variant="ghost"
                disabled={descriptions && !compact}
                onClick={() => {
                  setDescriptions(true);
                  setCompact(false);
                }}
              >
                Reset
              </Button>
              <Popover.Close render={<Button />}>Done</Popover.Close>
            </Popover.Footer>
          </Popover.Content>
        </Popover>
      </div>
      <p
        role="status"
        style={{
          marginBlock: "var(--kb-space-3)",
          color: "var(--kb-color-muted)",
          fontSize: "var(--kb-text-small-size)",
        }}
      >
        {descriptions ? "Descriptions shown" : "Descriptions hidden"} ·{" "}
        {compact ? "Compact spacing" : "Comfortable spacing"}
      </p>
      <ul aria-label="Project activity" style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {activity.map((item) => (
          <li
            key={item.title}
            style={{
              paddingBlock: compact ? "var(--kb-space-2)" : "var(--kb-space-4)",
              borderBlockStart: "1px solid var(--kb-color-border)",
            }}
          >
            <strong>{item.title}</strong>
            {descriptions ? (
              <p
                style={{
                  margin: 0,
                  color: "var(--kb-color-muted)",
                  fontSize: "var(--kb-text-small-size)",
                }}
              >
                {item.description}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
export const Default: Story = {
  render: () => <ViewOptions />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole("button", { name: "View options" });
    await userEvent.click(trigger);
    const popup = await page.findByRole("dialog", { name: "View options" });
    const descriptions = within(popup).getByRole("checkbox", { name: "Show descriptions" });
    const compact = within(popup).getByRole("checkbox", { name: "Compact spacing" });
    await waitFor(() => expect(descriptions).toHaveFocus(), { timeout: 5000 });
    await userEvent.click(descriptions);
    await expect(canvas.queryByText("Review the latest interface changes.")).toBeNull();
    const rows = canvas.getByRole("list", { name: "Project activity" });
    const roomy = rows.getBoundingClientRect().height;
    await userEvent.click(compact);
    await expect(rows.getBoundingClientRect().height).toBeLessThan(roomy);
    await userEvent.click(within(popup).getByRole("button", { name: "Done" }));
    await waitFor(() => expect(page.queryByRole("dialog")).toBeNull(), { timeout: 5000 });
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Descriptions hidden · Compact spacing",
    );
    await userEvent.click(trigger);
    const reopened = await page.findByRole("dialog", { name: "View options" });
    await expect(
      within(reopened).getByRole("checkbox", { name: "Show descriptions" }),
    ).not.toBeChecked();
    await userEvent.click(within(reopened).getByRole("button", { name: "Reset" }));
    await expect(canvas.getByText("Review the latest interface changes.")).toBeVisible();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(page.queryByRole("dialog")).toBeNull(), { timeout: 5000 });
    await waitFor(() => expect(trigger).toHaveFocus(), { timeout: 5000 });
  },
};
function ControlledExample() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("Website refresh");
  const [draft, setDraft] = useState(name);
  const form = useId();
  return (
    <section aria-label="Project settings">
      <p role="status">Project: {name}</p>
      <Popover
        open={open}
        onOpenChange={(next) => {
          if (next) setDraft(name);
          setOpen(next);
        }}
      >
        <Popover.Trigger render={<Button variant="secondary" />}>Rename project</Popover.Trigger>
        <Popover.Content title="Rename project" description="Save to update the project name.">
          <Popover.Body>
            <form
              id={form}
              onSubmit={(event) => {
                event.preventDefault();
                if (!draft.trim()) return;
                setName(draft.trim());
                setOpen(false);
              }}
            >
              <Input
                label="Project name"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                required
              />
            </form>
          </Popover.Body>
          <Popover.Footer>
            <Popover.Close render={<Button variant="ghost" />}>Cancel</Popover.Close>
            <Button type="submit" form={form} disabled={!draft.trim()}>
              Save changes
            </Button>
          </Popover.Footer>
        </Popover.Content>
      </Popover>
    </section>
  );
}
export const Controlled: Story = {
  render: () => <ControlledExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole("button", { name: "Rename project" });
    await userEvent.click(trigger);
    let popup = await page.findByRole("dialog", { name: "Rename project" });
    let name = within(popup).getByRole("textbox", { name: "Project name" });
    await userEvent.clear(name);
    await userEvent.type(name, "Discard this draft");
    await userEvent.click(within(popup).getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(page.queryByRole("dialog")).toBeNull(), { timeout: 5000 });
    await userEvent.click(trigger);
    popup = await page.findByRole("dialog", { name: "Rename project" });
    name = within(popup).getByRole("textbox", { name: "Project name" });
    await expect(name).toHaveValue("Website refresh");
    await userEvent.clear(name);
    await expect(within(popup).getByRole("button", { name: "Save changes" })).toBeDisabled();
    await userEvent.type(name, "Updated project");
    await userEvent.click(within(popup).getByRole("button", { name: "Save changes" }));
    await waitFor(() => expect(page.queryByRole("dialog")).toBeNull(), { timeout: 5000 });
    await expect(canvas.getByRole("status")).toHaveTextContent("Updated project");
    await waitFor(() => expect(trigger).toHaveFocus(), { timeout: 5000 });
  },
};

export const Scrolling: Story = {
  render: () => (
    <section
      aria-label="Scrollable workspace"
      style={{
        width: "min(100%, 36rem)",
        height: "min(24rem, 60dvh)",
        overflow: "auto",
        padding: "var(--kb-space-4)",
        border: "1px solid var(--kb-color-border)",
      }}
    >
      <p>Scroll this workspace while keeping the view options beside their trigger.</p>
      <ViewOptions />
      {Array.from({ length: 14 }, (_, index) => index + 1).map((number) => (
        <p key={number}>Workspace item {number}: review supporting project details.</p>
      ))}
    </section>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const workspace = canvas.getByRole("region", { name: "Scrollable workspace" });
    const trigger = canvas.getByRole("button", { name: "View options" });
    await userEvent.click(trigger);
    const popup = await page.findByRole("dialog", { name: "View options" });
    await waitFor(
      () => {
        expect(popup.getAnimations().length).toBe(0);
        expect(popup.getBoundingClientRect().top).toBeGreaterThanOrEqual(0);
        expect(popup.getBoundingClientRect().bottom).toBeLessThanOrEqual(window.innerHeight + 1);
      },
      { timeout: 5000 },
    );
    const apply = within(popup).getByRole("button", { name: "Done" });
    const option = within(popup).getByRole("checkbox", { name: "Show descriptions" });
    const bounds = popup.getBoundingClientRect();
    for (const control of [option, apply]) {
      expect(control.getBoundingClientRect().top).toBeGreaterThanOrEqual(bounds.top);
      expect(control.getBoundingClientRect().bottom).toBeLessThanOrEqual(bounds.bottom);
    }
    await expect(popup.scrollHeight).toBeLessThanOrEqual(popup.clientHeight + 1);
    const before = bounds.top;
    workspace.scrollTop = 24;
    await waitFor(() => expect(popup.getBoundingClientRect().top).toBeLessThan(before - 16));
    const workspaceScroll = workspace.scrollTop;
    await userEvent.click(option);
    await expect(canvas.queryByText("Review the latest interface changes.")).toBeNull();
    await expect(workspace.scrollTop).toBe(workspaceScroll);
    await userEvent.click(apply);
    await waitFor(() => expect(page.queryByRole("dialog")).toBeNull(), { timeout: 5000 });
    await waitFor(() => expect(trigger).toHaveFocus(), { timeout: 5000 });
  },
};
function NestedThemeExample() {
  const host = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={host}
      data-theme="dark"
      style={{
        padding: "var(--kb-space-4)",
        background: "var(--kb-color-bg)",
        color: "var(--kb-color-fg)",
      }}
    >
      <Popover>
        <Popover.Trigger render={<Button />}>Scoped details</Popover.Trigger>
        <Popover.Content
          container={host}
          title="Nested theme"
          description="This popup inherits the local theme."
        >
          <Popover.Close render={<Button />}>Close</Popover.Close>
        </Popover.Content>
      </Popover>
    </div>
  );
}
export const ScopedPortal: Story = {
  render: () => <NestedThemeExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Scoped details" }));
    const popup = await canvas.findByRole("dialog");
    await expect(popup.closest('[data-theme="dark"]')).not.toBeNull();
    await expect(getComputedStyle(popup).backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
    await userEvent.click(canvas.getByRole("button", { name: "Close" }));
    await waitFor(() => expect(canvas.queryByRole("dialog")).toBeNull());
  },
};
export const InsideDialog: Story = {
  render: () => (
    <Dialog>
      <Dialog.Trigger render={<Button />}>Edit project</Dialog.Trigger>
      <Dialog.Content title="Project editor">
        <ViewOptions />
        <Dialog.Actions>
          <Dialog.Close render={<Button />}>Close editor</Dialog.Close>
        </Dialog.Actions>
      </Dialog.Content>
    </Dialog>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole("button", { name: "Edit project" }));
    await userEvent.click(await page.findByRole("button", { name: "View options" }));
    await page.findByRole("dialog", { name: "View options" });
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(page.queryByRole("dialog", { name: "View options" })).toBeNull(), {
      timeout: 5000,
    });
    await waitFor(() => expect(page.getByRole("dialog", { name: "Project editor" })).toBeVisible());
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(page.queryByRole("dialog")).toBeNull(), { timeout: 5000 });
  },
};
export const TokenOverrides: Story = {
  tags: ["!dev", "!autodocs"],
  render: () => (
    <Popover>
      <Popover.Trigger render={<Button />}>Custom width</Popover.Trigger>
      <Popover.Content
        title="Compact details"
        style={{ "--kb-popover-width": "16rem", "--kb-popover-padding": "12px" } as CSSProperties}
      >
        <Popover.Close render={<Button />}>Close</Popover.Close>
      </Popover.Content>
    </Popover>
  ),
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Custom width" }));
    const popup = await page.findByRole("dialog");
    await expect(getComputedStyle(popup).padding).toBe("12px");
    await waitFor(() => expect(popup.getBoundingClientRect().width).toBe(256));
    await userEvent.click(page.getByRole("button", { name: "Close" }));
    await waitFor(() => expect(page.queryByRole("dialog")).toBeNull(), { timeout: 5000 });
    const document = canvasElement.ownerDocument;
    const reduced = document.defaultView?.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fixture = document.createElement("div");
    fixture.style.cssText = "position:fixed;visibility:hidden;pointer-events:none";
    const idle = document.createElement("div");
    idle.className = "kb-popover";
    idle.style.cssText =
      "position:fixed;left:100px;top:100px;width:160px;height:80px;transform-origin:0 0;--kb-popover-motion-duration:0s;--kb-popover-enter-offset:12px;--kb-popover-enter-scale:.9";
    const edge = idle.cloneNode() as HTMLElement;
    document.body.appendChild(fixture).append(idle, edge);
    try {
      for (const dir of ["ltr", "rtl"]) {
        fixture.dir = dir;
        const offsets = [
          ["top", 0, 12],
          ["bottom", 0, -12],
          ["left", 12, 0],
          ["right", -12, 0],
          ["inline-start", dir === "ltr" ? 12 : -12, 0],
          ["inline-end", dir === "ltr" ? -12 : 12, 0],
        ] as const;
        for (const [side, x, y] of offsets) {
          edge.dataset.side = side;
          for (const phase of ["data-starting-style", "data-ending-style"]) {
            edge.setAttribute(phase, "");
            const resting = idle.getBoundingClientRect();
            const moving = edge.getBoundingClientRect();
            const label = `${dir} ${side} ${phase}`;
            await expect(moving.left - resting.left, label).toBeCloseTo(reduced ? 0 : x, 3);
            await expect(moving.top - resting.top, label).toBeCloseTo(reduced ? 0 : y, 3);
            await expect(moving.width, label).toBeCloseTo(reduced ? 160 : 144, 3);
            await expect(moving.height, label).toBeCloseTo(reduced ? 80 : 72, 3);
            edge.removeAttribute(phase);
          }
        }
      }
    } finally {
      fixture.remove();
    }
  },
};

export const Open: Story = {
  tags: ["!dev", "!autodocs"],
  render: () => (
    <Popover defaultOpen>
      <Popover.Trigger render={<Button />}>Details</Popover.Trigger>
      <Popover.Content title="Project details" description="Supporting controls remain in context.">
        <Popover.Body>
          <Input label="Search details" />
        </Popover.Body>
        <Popover.Footer>
          <Popover.Close render={<Button />}>Close</Popover.Close>
        </Popover.Footer>
      </Popover.Content>
    </Popover>
  ),
};
