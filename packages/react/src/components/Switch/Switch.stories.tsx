import type { Meta, StoryObj } from "@storybook/react-vite";
import { useId, useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Button } from "../Button/Button";
import { Switch, type SwitchProps } from "./Switch";

function SwitchExample(props: SwitchProps) {
  const [checked, setChecked] = useState(props.checked);
  return <Switch {...props} checked={checked} onCheckedChange={setChecked} />;
}

function FormExample() {
  const formId = useId();
  const [checked, setChecked] = useState(false);
  const [submitted, setSubmitted] = useState("");
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <form
        id={formId}
        onReset={() => setChecked(false)}
        onSubmit={(event) => {
          event.preventDefault();
          setSubmitted(String(new FormData(event.currentTarget).get("digest")));
        }}
      />
      <Switch
        label="Required updates"
        checked={checked}
        onCheckedChange={setChecked}
        name="digest"
        value="weekly"
        form={formId}
        required
      />
      <div style={{ display: "flex", gap: 8 }}>
        <Button type="submit" form={formId}>
          Save preference
        </Button>
        <Button type="reset" form={formId} variant="secondary">
          Reset preference
        </Button>
      </div>
      <p role="status" aria-label="Submitted preference">
        {submitted || "Not saved"}
      </p>
    </div>
  );
}

const meta = {
  title: "Components/Switch",
  component: Switch,
  tags: ["autodocs"],
  args: { label: "Email updates", checked: false, onCheckedChange: (_checked: boolean) => {} },
  render: (args) => <SwitchExample {...args} />,
} satisfies Meta<typeof Switch>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const control = canvas.getByRole("switch", { name: "Email updates" });
    expect(canvas.getByLabelText("Email updates")).toBe(control);
    const target = control.closest(".kb-switch-target");
    const track = target?.querySelector(".kb-switch-track");
    const thumb = target?.querySelector(".kb-switch-thumb");
    if (!target || !track || !thumb) throw new Error("Missing switch material anatomy");
    expect(target.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
    expect(target.getBoundingClientRect().width).toBeGreaterThanOrEqual(44);
    const forced = matchMedia("(forced-colors: active)").matches;
    for (const plane of [track, thumb]) {
      if (forced) expect(getComputedStyle(plane).boxShadow).toBe("none");
      else {
        expect(getComputedStyle(plane).backgroundImage).toContain("linear-gradient");
        expect(getComputedStyle(plane).boxShadow).not.toBe("none");
      }
    }
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    expect(getComputedStyle(thumb).transitionDuration).toBe(reduced ? "0s" : "0.22s");
    const off = getComputedStyle(thumb).transform;
    await userEvent.click(control);
    expect(control).toBeChecked();
    await waitFor(() => expect(getComputedStyle(thumb).transform).not.toBe(off));
    await userEvent.keyboard(" ");
    expect(control).not.toBeChecked();
    expect(getComputedStyle(track).outlineStyle).not.toBe("none");
    expect(getComputedStyle(track).outlineOffset).toBe("-2px");
  },
} satisfies Story;
export const Checked: Story = { args: { checked: true } };
export const WithDescription: Story = {
  args: {
    description: "Receive a weekly workspace summary.",
    style: { "--kb-switch-width": "90px" },
  },
  play: async ({ canvasElement }) => {
    const track = canvasElement.querySelector(".kb-switch-track");
    if (!track) throw new Error("Missing switch track");
    expect(track.getBoundingClientRect().width).toBe(90);
  },
};
export const WithError: Story = { args: { error: "Choose your notification preference." } };
export const Disabled: Story = {
  args: {
    checked: true,
    disabled: true,
    description: "Managed by your workspace.",
    error: "Contact an administrator.",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByRole("switch")).toBeDisabled();
    for (const text of ["Managed by your workspace.", "Contact an administrator."]) {
      let opacity = 1;
      let node: Element | null = canvas.getByText(text);
      while (node && node !== canvasElement) {
        opacity *= Number(getComputedStyle(node).opacity);
        node = node.parentElement;
      }
      expect(opacity).toBe(1);
    }
  },
};
export const ReadOnly: Story = {
  args: { checked: true, readOnly: true, description: "Managed by your workspace." },
};
export const WithIcons: Story = {
  args: {
    label: "Dark mode",
    visuallyHidden: true,
    offIcon: (
      <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor">
        <circle cx="10" cy="10" r="4" />
        <path d="M10 1v2m0 14v2M1 10h2m14 0h2M4 4l2 2m8 8 2 2M4 16l2-2m8-8 2-2" />
      </svg>
    ),
    onIcon: (
      <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor">
        <path d="M16 12.5A7 7 0 0 1 7.5 4 7 7 0 1 0 16 12.5Z" />
      </svg>
    ),
  },
};
export const NativeForm: Story = {
  render: () => <FormExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const control = canvas.getByRole("switch", { name: "Required updates" });
    expect(control).toBeInvalid();
    await userEvent.click(control);
    expect(control).toBeValid();
    await userEvent.click(canvas.getByRole("button", { name: "Save preference" }));
    expect(canvas.getByRole("status", { name: "Submitted preference" })).toHaveTextContent(
      "weekly",
    );
    await userEvent.click(canvas.getByRole("button", { name: "Reset preference" }));
    expect(control).not.toBeChecked();
  },
};
