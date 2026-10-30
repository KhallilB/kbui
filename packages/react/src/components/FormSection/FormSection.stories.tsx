import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { Button } from "../Button/Button";
import { Grid } from "../Grid/Grid";
import { Input } from "../Input/Input";
import { Spinner } from "../Spinner/Spinner";
import { Switch } from "../Switch/Switch";
import { FormSection } from "./FormSection";

const meta = {
  title: "Components/FormSection",
  component: FormSection,
  tags: ["autodocs"],
  args: {
    title: "Profile",
    description: "Shown to everyone in your workspace.",
    children: null,
  },
  render: (args) => (
    <form onSubmit={(event) => event.preventDefault()}>
      <FormSection {...args} actions={<Button type="submit">Save profile</Button>}>
        <Input label="Display name" defaultValue="Ada Chen" />
        <Input label="Job title" defaultValue="Platform lead" />
      </FormSection>
    </form>
  ),
} satisfies Meta<typeof FormSection>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SplitLayout: Story = { args: { layout: "split" } };

export const SectionError: Story = {
  args: {
    title: "Email",
    description: "Used for sign-in and receipts.",
    error: "Confirm the new address before saving.",
  },
  render: (args) => (
    <form onSubmit={(event) => event.preventDefault()}>
      <FormSection {...args} actions={<Button type="submit">Save email</Button>}>
        <Input label="New email" type="email" defaultValue="ada@northwind.dev" />
        <Input label="Confirm new email" type="email" error="Addresses do not match." />
      </FormSection>
    </form>
  ),
};

function PendingSection() {
  const [pending, setPending] = useState(false);
  const [digest, setDigest] = useState(true);
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        setPending(true);
      }}
    >
      <FormSection
        title="Weekly digest"
        description="Fields lock while the save is in flight."
        disabled={pending}
        aria-busy={pending}
        actions={
          <>
            <Button type="submit">Save digest</Button>
            {pending ? <Spinner size="sm" label="Saving" /> : null}
          </>
        }
      >
        <Switch label="Send the weekly digest" checked={digest} onCheckedChange={setDigest} />
      </FormSection>
    </form>
  );
}

export const PendingSave: Story = {
  render: () => <PendingSection />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Save digest" }));
    await expect(canvas.getByRole("group", { name: "Weekly digest" })).toHaveAttribute(
      "aria-busy",
      "true",
    );
    await expect(canvas.getByRole("switch", { name: "Send the weekly digest" })).toBeDisabled();
  },
};

export const SplitCollapse: Story = {
  tags: ["!dev", "!autodocs"],
  render: () => (
    <Grid layout="stack">
      {[320, 639, 640, 1040].map((width) => (
        <div key={width} style={{ inlineSize: width, maxInlineSize: "100%" }}>
          <FormSection data-testid={`section-${width}`} title="Profile" layout="split">
            <Input label={`Display name ${width}`} />
          </FormSection>
        </div>
      ))}
    </Grid>
  ),
  play: async ({ canvasElement }) => {
    for (const width of [320, 639, 640, 1040]) {
      const section = within(canvasElement).getByTestId(`section-${width}`);
      const header = section.querySelector(".kb-formsection-header")?.getBoundingClientRect();
      const body = section.querySelector(".kb-formsection-body")?.getBoundingClientRect();
      if (!header || !body) throw new Error("Expected header and body");
      if (section.getBoundingClientRect().width < 640) {
        expect(body.top).toBeGreaterThanOrEqual(header.bottom);
        expect(body.width).toBeCloseTo(header.width, 0);
      } else {
        expect(body.top).toBeCloseTo(header.top, 0);
        expect(body.width / header.width).toBeCloseTo(2, 1);
      }
    }
  },
};
