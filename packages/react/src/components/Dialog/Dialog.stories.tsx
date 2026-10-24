import type { Meta, StoryObj } from "@storybook/react-vite";
import { type CSSProperties, useState } from "react";
import { expect, waitFor } from "storybook/test";
import { Button } from "../Button/Button";
import { Dialog } from "./Dialog";

const meta = {
  title: "Components/Dialog",
  component: Dialog,
  tags: ["autodocs"],
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Confirm: Story = {
  render: () => (
    <Dialog>
      <Dialog.Trigger render={<Button variant="danger" />}>Delete project</Dialog.Trigger>
      <Dialog.Content title="Delete project" description="This cannot be undone.">
        <Dialog.Actions>
          <Dialog.Close render={<Button variant="ghost" />}>Cancel</Dialog.Close>
          <Dialog.Close render={<Button variant="danger" />}>Delete</Dialog.Close>
        </Dialog.Actions>
      </Dialog.Content>
    </Dialog>
  ),
};

export const Open: Story = {
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
