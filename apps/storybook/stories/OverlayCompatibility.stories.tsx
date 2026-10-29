import { Accordion, Button, Dialog, Disclosure, Input, Popover } from "@kb.ui/react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import axe from "axe-core";
import { useRef, useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { page as browserPage, userEvent as browserUserEvent } from "vitest/browser";

const meta = { title: "Validation/Overlay compatibility" } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const CompactPopoverOnMobile: Story = {
  render: () => (
    <Popover>
      <Popover.Trigger render={<Button />}>View options</Popover.Trigger>
      <Popover.Content title="View options">
        <Popover.Body>
          <Input label="Contains text" />
        </Popover.Body>
        <Popover.Footer>
          <Popover.Close render={<Button />}>Done</Popover.Close>
        </Popover.Footer>
      </Popover.Content>
    </Popover>
  ),
  play: async ({ canvasElement }) => {
    const { innerWidth, innerHeight } = window;
    const page = within(canvasElement.ownerDocument.body);
    try {
      await browserPage.viewport(320, 480);
      const trigger = page.getByRole("button", { name: "View options" });
      await browserUserEvent.click(trigger);
      const popup = await page.findByRole("dialog", { name: "View options" });
      const input = within(popup).getByRole("textbox", { name: "Contains text" });
      const label = within(popup).getByText("Contains text");
      const done = within(popup).getByRole("button", { name: "Done" });
      await waitFor(() => {
        const bounds = popup.getBoundingClientRect();
        expect(popup.getAnimations().length).toBe(0);
        expect(bounds.top).toBeGreaterThanOrEqual(0);
        expect(bounds.bottom).toBeLessThanOrEqual(window.innerHeight);
        for (const control of [label, input, done]) {
          expect(control.getBoundingClientRect().top).toBeGreaterThanOrEqual(bounds.top);
          expect(control.getBoundingClientRect().bottom).toBeLessThanOrEqual(bounds.bottom);
        }
        expect(popup.scrollHeight).toBeLessThanOrEqual(popup.clientHeight + 1);
      });
      await waitFor(() => expect(input).toHaveFocus());
      await browserUserEvent.keyboard("Design notes");
      await browserUserEvent.tab();
      await expect(done).toHaveFocus();
      await browserUserEvent.keyboard("{Enter}");
      await waitFor(() => expect(page.queryByRole("dialog")).toBeNull());
      await waitFor(() => expect(trigger).toHaveFocus());
    } finally {
      await browserPage.viewport(innerWidth, innerHeight);
    }
  },
};

function ConstrainedPopover() {
  const input = useRef<HTMLInputElement>(null);
  return (
    <Popover>
      <Popover.Trigger render={<Button />}>Filter projects</Popover.Trigger>
      <Popover.Content
        title="Project filters"
        initialFocus={input}
        style={{ maxBlockSize: "min(20rem, var(--available-height))" }}
      >
        <Popover.Body role="region" aria-label="Filter fields" tabIndex={0}>
          <Input ref={input} label="Project name" />
          {Array.from({ length: 20 }, (_, index) => index + 1).map((number) => (
            <p key={number}>Supporting option {number}</p>
          ))}
        </Popover.Body>
        <Popover.Footer>
          <Popover.Close render={<Button />}>Done filtering</Popover.Close>
        </Popover.Footer>
      </Popover.Content>
    </Popover>
  );
}

export const PopoverBodyAndActions: Story = {
  render: () => <ConstrainedPopover />,
  play: async ({ canvasElement }) => {
    const { innerWidth, innerHeight } = window;
    const page = within(canvasElement.ownerDocument.body);
    try {
      await browserPage.viewport(320, 480);
      const trigger = page.getByRole("button", { name: "Filter projects" });
      await browserUserEvent.click(trigger);
      const popup = await page.findByRole("dialog", { name: "Project filters" });
      const body = within(popup).getByRole("region", { name: "Filter fields" });
      const title = within(popup).getByRole("heading", { name: "Project filters" });
      const done = within(popup).getByRole("button", { name: "Done filtering" });
      await waitFor(() => expect(within(popup).getByRole("textbox")).toHaveFocus());
      for (const [width, height] of [
        [320, 480],
        [560, 320],
      ] as const) {
        await browserPage.viewport(width, height);
        await waitFor(() => {
          const bounds = popup.getBoundingClientRect();
          expect(popup.getAnimations().length).toBe(0);
          expect(bounds.left).toBeGreaterThanOrEqual(0);
          expect(bounds.top).toBeGreaterThanOrEqual(0);
          expect(bounds.right).toBeLessThanOrEqual(width);
          expect(bounds.bottom).toBeLessThanOrEqual(height);
          expect(done.getBoundingClientRect().bottom).toBeLessThanOrEqual(bounds.bottom);
          expect(title.getBoundingClientRect().top).toBeGreaterThanOrEqual(bounds.top);
          expect(body.clientHeight).toBeGreaterThan(0);
        });
        body.focus();
        await browserUserEvent.keyboard("{End}");
        await waitFor(() => expect(body.scrollTop).toBeGreaterThan(0));
        const titleTop = title.getBoundingClientRect().top;
        await browserUserEvent.wheel(body, { delta: { y: 1200 } });
        await expect(title.getBoundingClientRect().top).toBe(titleTop);
        await expect(done.getBoundingClientRect().bottom).toBeLessThanOrEqual(
          popup.getBoundingClientRect().bottom,
        );
        await expect(popup.scrollTop).toBe(0);
      }
      done.focus();
      await expect(done).toHaveFocus();
      await browserUserEvent.keyboard("{Enter}");
      await waitFor(() => expect(page.queryByRole("dialog")).toBeNull());
      await waitFor(() => expect(trigger).toHaveFocus());
    } finally {
      await browserPage.viewport(innerWidth, innerHeight);
    }
  },
};

function ScrollableDrawer() {
  const title = useRef<HTMLHeadingElement>(null);
  return (
    <div style={{ minHeight: "200vh" }}>
      <Dialog>
        <Dialog.Trigger render={<Button />}>Open scroll test</Dialog.Trigger>
        <Dialog.Content layout="drawer" initialFocus={title}>
          <Dialog.Header>
            <Dialog.Title ref={title} tabIndex={-1}>
              Scrollable review
            </Dialog.Title>
          </Dialog.Header>
          <Dialog.Body role="region" aria-label="Review context" tabIndex={0}>
            {Array.from({ length: 30 }, (_, index) => index + 1).map((number) => (
              <p key={number}>Context item {number}</p>
            ))}
          </Dialog.Body>
          <Dialog.Footer>
            <Dialog.Actions>
              <Dialog.Close render={<Button />}>Finish review</Dialog.Close>
            </Dialog.Actions>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>
    </div>
  );
}

export const DrawerScrollAndResize: Story = {
  render: () => <ScrollableDrawer />,
  play: async ({ canvasElement }) => {
    const { innerWidth, innerHeight } = window;
    const root = canvasElement.ownerDocument.documentElement;
    const direction = root.dir;
    const page = within(canvasElement.ownerDocument.body);
    try {
      await browserPage.viewport(320, 480);
      const trigger = page.getByRole("button", { name: "Open scroll test" });
      await browserUserEvent.click(trigger);
      const popup = await page.findByRole("dialog", { name: "Scrollable review" });
      const body = within(popup).getByRole("region", { name: "Review context" });
      const title = within(popup).getByRole("heading", { name: "Scrollable review" });
      const close = within(popup).getByRole("button", { name: "Finish review" });
      await waitFor(() => expect(title).toHaveFocus());
      await browserUserEvent.tab();
      await waitFor(() => expect(body).toHaveFocus());
      await browserUserEvent.keyboard("{End}");
      await waitFor(() => expect(body.scrollTop).toBeGreaterThan(0));
      const scroll = window.scrollY;
      await browserUserEvent.wheel(body, { delta: { y: 1600 } });
      await expect(window.scrollY).toBe(scroll);
      for (const [width, height] of [
        [320, 480],
        [560, 320],
      ] as const) {
        await browserPage.viewport(width, height);
        await waitFor(() => {
          expect(popup.getAnimations().length).toBe(0);
          expect(popup.getBoundingClientRect().left).toBeGreaterThanOrEqual(-1);
          expect(popup.getBoundingClientRect().right).toBeLessThanOrEqual(width + 1);
          expect(close.getBoundingClientRect().bottom).toBeLessThanOrEqual(height);
          expect(title.getBoundingClientRect().top).toBeGreaterThanOrEqual(0);
          expect(body.clientHeight).toBeGreaterThan(0);
        });
      }
      root.dir = "rtl";
      await waitFor(() =>
        expect(Math.abs(popup.getBoundingClientRect().left)).toBeLessThanOrEqual(1),
      );
      await browserUserEvent.keyboard("{Escape}");
      await waitFor(() => expect(page.queryByRole("dialog")).toBeNull());
      await waitFor(() => expect(trigger).toHaveFocus());
    } finally {
      root.dir = direction;
      await browserPage.viewport(innerWidth, innerHeight);
    }
  },
};

function GrowingContent() {
  const [rows, setRows] = useState(1);
  return (
    <>
      <Button onClick={() => setRows(8)}>Load more context</Button>
      {Array.from({ length: rows }, (_, index) => index + 1).map((number) => (
        <p key={number}>Supporting context {number}</p>
      ))}
    </>
  );
}
function GrowingPanels() {
  return (
    <>
      <Disclosure>
        <Disclosure.Trigger>Reveal context</Disclosure.Trigger>
        <Disclosure.Panel data-testid="motion-disclosure">
          <GrowingContent />
        </Disclosure.Panel>
      </Disclosure>
      <Accordion>
        <Accordion.Item value="context">
          <Accordion.Header>
            <Accordion.Trigger>Expand context</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Panel data-testid="motion-accordion">
            <GrowingContent />
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </>
  );
}

export const PanelMotionAndGrowth: Story = {
  render: () => <GrowingPanels />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    for (const [name, id] of [
      ["Reveal context", "motion-disclosure"],
      ["Expand context", "motion-accordion"],
    ] as const) {
      const trigger = canvas.getByRole("button", { name });
      await userEvent.click(trigger);
      const panel = await canvas.findByTestId(id);
      if (!reduced) {
        await waitFor(() => expect(panel.getAnimations().length).toBeGreaterThan(0));
      }
      // Reverse before expansion completes; latest intent must win.
      await userEvent.click(trigger);
      await waitFor(() => expect(canvas.queryByTestId(id)).toBeNull());
      await userEvent.click(trigger);
      const reopened = await canvas.findByTestId(id);
      await waitFor(() => {
        expect(reopened.getAnimations().length).toBe(0);
        expect(reopened.clientHeight).toBeGreaterThanOrEqual(reopened.scrollHeight - 1);
      });
      const height = reopened.getBoundingClientRect().height;
      await userEvent.click(within(reopened).getByRole("button", { name: "Load more context" }));
      await waitFor(() => {
        expect(reopened.getBoundingClientRect().height).toBeGreaterThan(height);
        expect(reopened.clientHeight).toBeGreaterThanOrEqual(reopened.scrollHeight - 1);
      });
      if (reduced) await expect(reopened.getAnimations()).toEqual([]);
      await userEvent.click(trigger);
      await waitFor(() => expect(canvas.queryByTestId(id)).toBeNull());
    }
  },
};

export const DialogFocusBoundaries: Story = {
  render: () => (
    <Dialog>
      <Dialog.Trigger render={<Button />}>Open focus test</Dialog.Trigger>
      <Dialog.Content title="Dialog focus test">
        <Button>First action</Button>
        <Dialog.Close render={<Button />}>Last action</Dialog.Close>
      </Dialog.Content>
    </Dialog>
  ),
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    const trigger = page.getByRole("button", { name: "Open focus test" });
    await userEvent.click(trigger);
    const popup = await page.findByRole("dialog", { name: "Dialog focus test" });
    const first = page.getByRole("button", { name: "First action" });
    const last = page.getByRole("button", { name: "Last action" });
    await waitFor(() => expect(first).toHaveFocus());
    await browserUserEvent.tab({ shift: true });
    await waitFor(() => expect(last).toHaveFocus());
    await browserUserEvent.tab();
    await waitFor(() => expect(first).toHaveFocus());
    const guards = canvasElement.ownerDocument.querySelectorAll<HTMLElement>(
      '[data-base-ui-focus-guard][data-type="inside"]',
    );
    await expect(guards.length).toBeGreaterThanOrEqual(2);
    // Native guards must redirect focus inside modal.
    for (const guard of guards) {
      guard.focus();
      await waitFor(() =>
        expect(popup.contains(canvasElement.ownerDocument.activeElement)).toBe(true),
      );
    }
    await browserUserEvent.keyboard("{Escape}");
    await waitFor(() => expect(page.queryByRole("dialog")).toBeNull());
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

export const NonModalPopoverBoundaries: Story = {
  render: () => (
    <>
      <Popover>
        <Popover.Trigger render={<Button />}>Open supporting controls</Popover.Trigger>
        <Popover.Content title="Supporting controls">
          <Input label="Supporting query" />
          <Popover.Close render={<Button />}>Last supporting action</Popover.Close>
        </Popover.Content>
      </Popover>
      <Button>Next page action</Button>
    </>
  ),
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    const trigger = page.getByRole("button", { name: "Open supporting controls" });
    const first = () => page.getByRole("textbox", { name: "Supporting query" });
    await userEvent.click(trigger);
    await waitFor(() => expect(first()).toHaveFocus());
    await browserUserEvent.tab();
    await expect(page.getByRole("button", { name: "Last supporting action" })).toHaveFocus();
    await browserUserEvent.tab();
    await waitFor(() =>
      expect(page.getByRole("button", { name: "Next page action" })).toHaveFocus(),
    );
    await waitFor(() => expect(page.queryByRole("dialog")).toBeNull());
    await userEvent.click(trigger);
    await waitFor(() => expect(first()).toHaveFocus());
    await browserUserEvent.tab({ shift: true });
    await waitFor(() => expect(trigger).toHaveFocus());
    await browserUserEvent.keyboard("{Escape}");
    await waitFor(() => expect(page.queryByRole("dialog")).toBeNull());
  },
};

export const ScannerKeepsRealControls: Story = {
  render: () => (
    <Popover defaultOpen>
      <Popover.Trigger render={<Button />}>Open scanner test</Popover.Trigger>
      <Popover.Content title="Scanner scope test">
        <button type="button" aria-label="Reference action" data-testid="scanner-control" />
        <Popover.Close render={<Button />}>Close scanner test</Popover.Close>
      </Popover.Content>
    </Popover>
  ),
  play: async ({ canvasElement, parameters }) => {
    const page = within(canvasElement.ownerDocument.body);
    const control = await page.findByTestId("scanner-control");
    const context = parameters.a11y?.context ?? canvasElement.ownerDocument.body;
    control.removeAttribute("aria-label");
    try {
      const result = await axe.run(context, { runOnly: ["button-name", "aria-command-name"] });
      const nodes = result.violations.flatMap((violation) => violation.nodes);
      await expect(nodes.some((node) => node.html.includes('data-testid="scanner-control"'))).toBe(
        true,
      );
      await expect(nodes.some((node) => node.html.includes("data-base-ui-focus-guard"))).toBe(
        false,
      );
    } finally {
      control.setAttribute("aria-label", "Reference action");
    }
    const repaired = await axe.run(context, { runOnly: ["button-name", "aria-command-name"] });
    await expect(repaired.violations).toEqual([]);
  },
};

export const DisclosureAccordionKeys: Story = {
  render: () => (
    <>
      <Disclosure>
        <Disclosure.Trigger>Supporting details</Disclosure.Trigger>
        <Disclosure.Panel>Optional context</Disclosure.Panel>
      </Disclosure>
      <Accordion>
        <Accordion.Item value="first">
          <Accordion.Header>
            <Accordion.Trigger>First section</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Panel>First answer</Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item value="second">
          <Accordion.Header>
            <Accordion.Trigger>Second section</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Panel>Second answer</Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item value="disabled" disabled>
          <Accordion.Header>
            <Accordion.Trigger>Unavailable section</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Panel>Unavailable answer</Accordion.Panel>
        </Accordion.Item>
      </Accordion>
      <Button>After group</Button>
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const disclosure = canvas.getByRole("button", { name: "Supporting details" });
    await browserUserEvent.click(disclosure);
    disclosure.focus();
    await browserUserEvent.keyboard(" ");
    await waitFor(() => expect(disclosure).toHaveAttribute("aria-expanded", "false"));
    await browserUserEvent.keyboard("{Enter}");
    await waitFor(() => expect(disclosure).toHaveAttribute("aria-expanded", "true"));
    await browserUserEvent.tab();
    const first = canvas.getByRole("button", { name: "First section" });
    const second = canvas.getByRole("button", { name: "Second section" });
    await expect(first).toHaveFocus();
    await browserUserEvent.keyboard("{Enter}");
    await waitFor(() => expect(first).toHaveAttribute("aria-expanded", "true"));
    await browserUserEvent.tab();
    await expect(second).toHaveFocus();
    await browserUserEvent.keyboard("{Enter}");
    await waitFor(() => expect(second).toHaveAttribute("aria-expanded", "true"));
    await expect(first).toHaveAttribute("aria-expanded", "false");
    await browserUserEvent.keyboard(" ");
    await waitFor(() => expect(second).toHaveAttribute("aria-expanded", "false"));
    await browserUserEvent.tab();
    await expect(canvas.getByRole("button", { name: "After group" })).toHaveFocus();
  },
};
