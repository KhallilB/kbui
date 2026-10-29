import type { Meta, StoryObj } from "@storybook/react-vite";
import { type CSSProperties, useRef, useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Button } from "../Button/Button";
import { Dialog } from "./Dialog";

const meta = {
  title: "Components/Dialog",
  component: Dialog,
  tags: ["autodocs"],
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

function ConfirmationExample({ onConfirm }: { onConfirm: () => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [deleted, setDeleted] = useState(false);
  const cancel = useRef<HTMLButtonElement>(null);
  const submitting = useRef(false);
  async function confirm() {
    if (submitting.current) return;
    submitting.current = true;
    setPending(true);
    setError("");
    try {
      await onConfirm();
      setDeleted(true);
      setOpen(false);
    } catch {
      setError("Could not delete the project. Try again.");
    } finally {
      submitting.current = false;
      setPending(false);
    }
  }
  return (
    <>
      <p role="status">{deleted ? "Project deleted." : "Project remains active."}</p>
      <Dialog
        open={open}
        disablePointerDismissal
        onOpenChange={(next, details) => {
          if (submitting.current) {
            details.cancel();
            return;
          }
          setError("");
          setOpen(next);
        }}
      >
        <Dialog.Trigger render={<Button variant="danger" />}>Delete project</Dialog.Trigger>
        <Dialog.Content
          title="Delete project"
          description="This permanently removes the project and its data."
          initialFocus={cancel}
          aria-busy={pending}
        >
          {error ? <p role="alert">{error}</p> : null}
          <Dialog.Actions>
            <Dialog.Close ref={cancel} render={<Button variant="ghost" />} disabled={pending}>
              Cancel
            </Dialog.Close>
            <Button variant="danger" aria-disabled={pending} onClick={() => void confirm()}>
              {pending ? "Deleting…" : "Delete project"}
            </Button>
          </Dialog.Actions>
        </Dialog.Content>
      </Dialog>
    </>
  );
}

export const Confirm: Story = {
  render: () => (
    <ConfirmationExample
      onConfirm={async () => {
        await new Promise((resolve) => setTimeout(resolve, 200));
      }}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole("button", { name: "Delete project" });
    await userEvent.click(trigger);
    const popup = await page.findByRole("dialog", { name: "Delete project" });
    await waitFor(() => expect(page.getByRole("button", { name: "Cancel" })).toHaveFocus());
    await userEvent.click(within(popup).getByRole("button", { name: "Delete project" }));
    await expect(popup).toHaveAttribute("aria-busy", "true");
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(page.queryByRole("dialog")).toBeNull());
    await expect(canvas.getByRole("status")).toHaveTextContent("Project deleted.");
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

function RetryConfirmationExample() {
  const attempts = useRef(0);
  return (
    <ConfirmationExample
      onConfirm={async () => {
        attempts.current += 1;
        if (attempts.current === 1) throw new Error("Demo failure");
      }}
    />
  );
}

export const ConfirmationRecovery: Story = {
  render: () => <RetryConfirmationExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole("button", { name: "Delete project" }));
    const popup = await page.findByRole("dialog", { name: "Delete project" });
    await userEvent.click(within(popup).getByRole("button", { name: "Delete project" }));
    await expect(await page.findByRole("alert")).toHaveTextContent("Could not delete");
    await waitFor(() => expect(popup).toBeVisible());
    await expect(canvas.getByRole("status", { hidden: true })).toHaveTextContent(
      "Project remains active.",
    );
    await userEvent.click(within(popup).getByRole("button", { name: "Delete project" }));
    await waitFor(() => expect(page.queryByRole("dialog")).toBeNull());
    await expect(canvas.getByRole("status")).toHaveTextContent("Project deleted.");
  },
};

function ProjectDrawer() {
  const title = useRef<HTMLHeadingElement>(null);
  return (
    <Dialog>
      <Dialog.Trigger render={<Button />}>Project details</Dialog.Trigger>
      <Dialog.Content layout="drawer" initialFocus={title}>
        <Dialog.Header>
          <Dialog.Title ref={title} tabIndex={-1}>
            Project details
          </Dialog.Title>
          <Dialog.Description>Supporting details in a side sheet.</Dialog.Description>
        </Dialog.Header>
        <Dialog.Body role="region" aria-label="Project review" tabIndex={0}>
          <p>
            Keep this review beside the workspace context. The sheet remains modal and scrolls on
            short screens.
          </p>
          {Array.from({ length: 12 }, (_, index) => index + 1).map((number) => (
            <section key={number} style={{ marginBlockStart: "var(--kb-space-6)" }}>
              <h3>Review section {number}</h3>
              <p>
                Check ownership, recent changes and supporting notes before returning to the
                workspace.
              </p>
            </section>
          ))}
        </Dialog.Body>
        <Dialog.Footer>
          <Dialog.Actions>
            <Dialog.Close render={<Button />}>Close details</Dialog.Close>
          </Dialog.Actions>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
}
export const Drawer: Story = {
  render: () => <ProjectDrawer />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole("button", { name: "Project details" });
    await userEvent.click(trigger);
    const popup = await page.findByRole("dialog", { name: "Project details" });
    const body = within(popup).getByRole("region", { name: "Project review" });
    const title = within(popup).getByRole("heading", { name: "Project details" });
    await waitFor(() => expect(title).toHaveFocus());
    await waitFor(() => {
      const bounds = popup.getBoundingClientRect();
      expect(bounds.top).toBe(0);
      expect(bounds.right).toBeLessThanOrEqual(window.innerWidth + 1);
      expect(bounds.left).toBeGreaterThanOrEqual(-1);
      expect(bounds.bottom).toBeLessThanOrEqual(window.innerHeight + 1);
      expect(popup.getAnimations().length).toBe(0);
    });
    await expect(body.scrollHeight).toBeGreaterThan(body.clientHeight);
    const titleTop = title.getBoundingClientRect().top;
    body.scrollTop = body.scrollHeight;
    await waitFor(() => expect(body.scrollTop).toBeGreaterThan(0));
    await expect(title.getBoundingClientRect().top).toBe(titleTop);
    const close = within(popup).getByRole("button", { name: "Close details" });
    await expect(close.getBoundingClientRect().bottom).toBeLessThanOrEqual(window.innerHeight);
    await expect(popup.scrollTop).toBe(0);
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(page.queryByRole("dialog")).toBeNull());
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

export const Open: Story = {
  tags: ["!autodocs"],
  play: async ({ canvasElement }) => {
    const popup = await waitFor(() => {
      const node = canvasElement.ownerDocument.querySelector<HTMLElement>(".kb-dialog-popup");
      if (!node) throw new Error("dialog not open");
      return node;
    });
    expect(getComputedStyle(popup).padding).toBe("24px");
    expect(getComputedStyle(popup).borderTopWidth).toBe("1px");
    const title = popup.querySelector<HTMLElement>(".kb-dialog-title");
    expect(title && getComputedStyle(title).fontSize).toBe("23px");
    if (window.matchMedia("(prefers-reduced-motion: no-preference)").matches) {
      expect(getComputedStyle(popup).transitionDuration).toBe("0.15s, 0.15s");
    }
  },
  render: () => (
    <Dialog defaultOpen>
      <Dialog.Content title="Already open" description="Rendered open for docs.">
        <Dialog.Actions>
          <Dialog.Close render={<Button />}>Close</Dialog.Close>
        </Dialog.Actions>
      </Dialog.Content>
    </Dialog>
  ),
};

export const CustomLayout: Story = {
  tags: ["!autodocs"],
  render: () => (
    <Dialog defaultOpen>
      <Dialog.Content>
        <Dialog.Title>Custom title</Dialog.Title>
        <Dialog.Description>Composed parts instead of props.</Dialog.Description>
        <Dialog.Actions>
          <Dialog.Close render={<Button />}>Done</Dialog.Close>
        </Dialog.Actions>
      </Dialog.Content>
    </Dialog>
  ),
};

const overrides = {
  "--kb-dialog-padding": "12px",
  "--kb-dialog-border-width": "3px",
  "--kb-dialog-background": "rgb(1, 2, 3)",
  "--kb-dialog-color": "rgb(250, 250, 250)",
  "--kb-dialog-shadow": "none",
  "--kb-dialog-title-size": "30px",
  "--kb-dialog-title-weight": "800",
  "--kb-dialog-description-color": "rgb(200, 100, 50)",
  "--kb-dialog-motion-duration": "300ms",
} as CSSProperties;

function TokenOverridesExample() {
  const [host, setHost] = useState<HTMLDivElement | null>(null);
  return (
    <div ref={setHost} style={overrides}>
      {host ? (
        <Dialog defaultOpen>
          <Dialog.Content container={host} title="Themed review" description="Scoped tokens.">
            <Dialog.Actions>
              <Dialog.Close render={<Button />}>Done</Dialog.Close>
            </Dialog.Actions>
          </Dialog.Content>
        </Dialog>
      ) : null}
    </div>
  );
}

export const TokenOverrides: Story = {
  tags: ["!dev", "!autodocs"],
  render: () => <TokenOverridesExample />,
  play: async ({ canvasElement }) => {
    const popup = await waitFor(() => {
      const node = canvasElement.querySelector<HTMLElement>(".kb-dialog-popup");
      if (!node) throw new Error("dialog not open");
      return node;
    });
    const style = getComputedStyle(popup);
    expect(style.padding).toBe("12px");
    expect(style.borderTopWidth).toBe("3px");
    expect(style.backgroundColor).toBe("rgb(1, 2, 3)");
    expect(style.color).toBe("rgb(250, 250, 250)");
    expect(style.boxShadow).toBe("none");
    const title = popup.querySelector<HTMLElement>(".kb-dialog-title");
    expect(title && getComputedStyle(title).fontSize).toBe("30px");
    expect(title && getComputedStyle(title).fontWeight).toBe("800");
    const description = popup.querySelector<HTMLElement>(".kb-dialog-description");
    expect(description && getComputedStyle(description).color).toBe("rgb(200, 100, 50)");
    if (window.matchMedia("(prefers-reduced-motion: no-preference)").matches) {
      expect(style.transitionDuration).toBe("0.3s, 0.3s");
    }
  },
};

export const Sections: Story = {
  tags: ["!autodocs"],
  render: () => (
    <Dialog defaultOpen>
      <Dialog.Content
        style={{ "--kb-dialog-body-padding": "8px 0" } as CSSProperties}
        aria-labelledby="sections-title"
      >
        <Dialog.Header>
          <Dialog.Title id="sections-title">Review changes</Dialog.Title>
          <Dialog.Description>Three files changed.</Dialog.Description>
        </Dialog.Header>
        <Dialog.Body>Summary of the draft.</Dialog.Body>
        <Dialog.Footer>
          <Dialog.Actions>
            <Dialog.Close render={<Button />}>Done</Dialog.Close>
          </Dialog.Actions>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  ),
  play: async ({ canvasElement }) => {
    const popup = await waitFor(() => {
      const node = canvasElement.ownerDocument.querySelector<HTMLElement>(".kb-dialog-popup");
      if (!node) throw new Error("dialog not open");
      return node;
    });
    const section = (name: string) => popup.querySelector<HTMLElement>(`.kb-dialog-${name}`);
    expect(getComputedStyle(section("body") as HTMLElement).padding).toBe("8px 0px");
    expect(getComputedStyle(section("header") as HTMLElement).padding).toBe("0px");
    expect(getComputedStyle(section("footer") as HTMLElement).padding).toBe("0px");
  },
};
