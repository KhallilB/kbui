import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Button } from "../Button/Button";
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
  const [pending, setPending] = React.useState(false);
  const [digest, setDigest] = React.useState(true);
  const status = React.useRef<HTMLParagraphElement>(null);
  // Disabling the section drops focus from Save; park it on the status message.
  React.useEffect(() => {
    if (pending) status.current?.focus();
  }, [pending]);
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
            {pending ? <Spinner size="sm" decorative /> : null}
          </>
        }
      >
        <Switch label="Send the weekly digest" checked={digest} onCheckedChange={setDigest} />
      </FormSection>
      <p ref={status} role="status" tabIndex={-1}>
        {pending ? "Saving the weekly digest." : ""}
      </p>
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
    await waitFor(() => expect(canvas.getByRole("status")).toHaveFocus());
    await expect(canvas.getByRole("status")).toHaveTextContent("Saving the weekly digest.");
  },
};

export const SplitCollapse: Story = {
  tags: ["!dev", "!autodocs"],
  render: () => (
    <div style={{ display: "grid", gap: "2rem" }}>
      {[320, 639, 640, 1040].map((width) => (
        <div key={width} data-testid={`frame-${width}`} style={{ inlineSize: width }}>
          <FormSection data-testid={`section-${width}`} title="Profile" layout="split">
            <Input label={`Display name ${width}`} />
          </FormSection>
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    for (const width of [320, 639, 640, 1040]) {
      // Frames must keep their width, or the split branch never runs.
      const frame = within(canvasElement).getByTestId(`frame-${width}`);
      expect(frame.getBoundingClientRect().width).toBeCloseTo(width, 0);
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
