import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, within } from "storybook/test";
import { Button } from "../Button/Button";
import { Card } from "../Card/Card";
import { Checkbox } from "../Checkbox/Checkbox";
import { FormActions } from "../FormActions/FormActions";
import { Heading } from "../Heading/Heading";
import { Inline } from "../Inline/Inline";
import { Input } from "../Input/Input";
import { Text } from "../Text/Text";
import { Stack } from "./Stack";

const meta = { title: "Layout/Stack", component: Stack, tags: ["autodocs"] } satisfies Meta<
  typeof Stack
>;
export default meta;
type Story = StoryObj<typeof meta>;

const gapPixels = { none: 0, sm: 8, md: 16, lg: 24 } as const;

export const Default: Story = {
  render: () => (
    <Stack as="section" aria-labelledby="billing-title" data-testid="billing">
      <Heading level={2} size="md" id="billing-title">
        Billing
      </Heading>
      <Text>Your plan renews on 1 December. Invoices go to the billing contact.</Text>
      <Inline gap="sm">
        <Button>Change plan</Button>
        <Button variant="secondary">Download invoices</Button>
      </Inline>
    </Stack>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const section = canvas.getByRole("region", { name: "Billing" });
    const children = [...section.children].map((node) => node.getBoundingClientRect());
    const [heading, text, actions] = children;
    if (!heading || !text || !actions) throw new Error("Expected three stacked children");
    expect(text.top - heading.bottom).toBeCloseTo(gapPixels.md, 0);
    expect(actions.top - text.bottom).toBeCloseTo(gapPixels.md, 0);
    expect(text.left).toBeCloseTo(heading.left, 0);
    expect(actions.left).toBeCloseTo(heading.left, 0);
    const buttons = canvas.getAllByRole("button");
    buttons[0]?.focus();
    await userEvent.tab();
    expect(buttons[1]).toHaveFocus();
  },
};

export const Alignment: Story = {
  render: () => (
    <Inline align="start" gap="lg">
      {(["stretch", "start", "center", "end"] as const).map((align) => (
        <Card key={align} style={{ inlineSize: "12rem" }}>
          <Stack align={align} gap="sm" data-testid={`align-${align}`}>
            <Text size="sm">{align}</Text>
            <Button size="sm">Save</Button>
            <Button size="sm" variant="secondary">
              Save and close
            </Button>
          </Stack>
        </Card>
      ))}
    </Inline>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const box = (align: string) => {
      const stack = canvas.getByTestId(`align-${align}`);
      const button = stack.querySelector("button");
      if (!button) throw new Error(`Expected a button in ${align}`);
      return { stack: stack.getBoundingClientRect(), button: button.getBoundingClientRect() };
    };
    const stretch = box("stretch");
    expect(stretch.button.width).toBeCloseTo(stretch.stack.width, 0);
    const start = box("start");
    expect(start.button.width).toBeLessThan(start.stack.width);
    expect(start.button.left).toBeCloseTo(start.stack.left, 0);
    const end = box("end");
    expect(end.button.right).toBeCloseTo(end.stack.right, 0);
    const center = box("center");
    expect(center.button.left - center.stack.left).toBeCloseTo(
      center.stack.right - center.button.right,
      0,
    );
  },
};

export const Gaps: Story = {
  render: () => (
    <Inline align="start" gap="lg">
      {(["none", "sm", "md", "lg"] as const).map((gap) => (
        <Stack key={gap} gap={gap} data-testid={`gap-${gap}`}>
          <Text size="sm" tone="muted">
            {gap}
          </Text>
          <Text>First</Text>
          <Text>Second</Text>
        </Stack>
      ))}
    </Inline>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const gap of ["none", "sm", "md", "lg"] as const) {
      const [, first, second] = [...canvas.getByTestId(`gap-${gap}`).children].map((node) =>
        node.getBoundingClientRect(),
      );
      if (!first || !second) throw new Error(`Expected items in ${gap}`);
      expect(second.top - first.bottom, gap).toBeCloseTo(gapPixels[gap], 0);
    }
  },
};

export const Justify: Story = {
  render: () => (
    <Inline align="stretch" gap="lg">
      {(["start", "center", "end", "between"] as const).map((justify) => (
        <Card key={justify} style={{ blockSize: "14rem", inlineSize: "10rem" }}>
          <Stack justify={justify} gap="sm" style={{ blockSize: "100%" }}>
            <Text size="sm">{justify}</Text>
            <Button size="sm" variant="secondary">
              Action
            </Button>
          </Stack>
        </Card>
      ))}
    </Inline>
  ),
};

export const Sections: Story = {
  render: () => (
    <Stack as="article" gap="lg" aria-labelledby="settings-title">
      <Heading level={1} size="lg" id="settings-title">
        Workspace settings
      </Heading>
      {[
        ["general", "General", "Name, address and default language for this workspace."],
        ["members", "Members", "Invite teammates and choose what each person can change."],
        ["danger", "Delete workspace", "Removes projects, files and history for every member."],
      ].map(([id, title, body]) => (
        <Stack key={id} as="section" gap="sm" aria-labelledby={`${id}-title`}>
          <Heading level={2} size="sm" id={`${id}-title`}>
            {title}
          </Heading>
          <Text tone="muted">{body}</Text>
        </Stack>
      ))}
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getAllByRole("region")).toHaveLength(3);
    const [general, members] = canvas
      .getAllByRole("region")
      .map((node) => node.getBoundingClientRect());
    if (!general || !members) throw new Error("Expected sections");
    expect(members.top - general.bottom).toBeCloseTo(gapPixels.lg, 0);
  },
};

export const List: Story = {
  render: () => (
    <Stack as="ol" gap="sm" aria-label="Setup steps">
      <li>
        <Text>Connect your repository.</Text>
      </li>
      <li>
        <Text>Invite reviewers.</Text>
      </li>
      <li>
        <Text>Publish the first release.</Text>
      </li>
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const list = canvas.getByRole("list", { name: "Setup steps" });
    const style = getComputedStyle(list);
    expect(style.listStyleType).toBe("none");
    expect(style.paddingLeft).toBe("0px");
    expect(style.marginTop).toBe("0px");
    expect(canvas.getAllByRole("listitem")).toHaveLength(3);
  },
};

function ProfileForm() {
  const [updates, setUpdates] = useState(false);
  return (
    <div style={{ inlineSize: "24rem", maxInlineSize: "100%" }}>
      <Stack as="form" aria-label="Profile" onSubmit={(event) => event.preventDefault()}>
        <Input label="Display name" name="name" autoComplete="name" />
        <Input label="Email" type="email" name="email" autoComplete="email" />
        <Checkbox
          label="Email me about product updates"
          checked={updates}
          onCheckedChange={setUpdates}
        />
        <FormActions>
          <Button type="submit">Save profile</Button>
        </FormActions>
      </Stack>
    </div>
  );
}

export const Form: Story = {
  render: () => <ProfileForm />,
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const name = canvas.getByRole("textbox", { name: "Display name" });
    name.focus();
    await userEvent.tab();
    expect(canvas.getByRole("textbox", { name: "Email" })).toHaveFocus();
    await userEvent.tab();
    expect(canvas.getByRole("checkbox", { name: "Email me about product updates" })).toHaveFocus();
    await userEvent.tab();
    expect(canvas.getByRole("button", { name: "Save profile" })).toHaveFocus();
  },
};

export const Narrow: Story = {
  tags: ["!dev", "!autodocs"],
  render: () => (
    <div style={{ inlineSize: 240, maxInlineSize: "100%" }}>
      <Stack data-testid="narrow" gap="sm">
        <Text>workspace-identifier-without-natural-breaks-0f3a9c</Text>
        <Button>Copy identifier</Button>
      </Stack>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const stack = within(canvasElement).getByTestId("narrow");
    expect(stack.scrollWidth).toBeLessThanOrEqual(stack.clientWidth);
  },
};
