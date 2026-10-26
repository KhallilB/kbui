import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { PlanDemo } from "../site/PlanDemo";
import "../site/site.css";
import "../site/motion.css";

const meta = {
  title: "Site/Day off",
  component: PlanDemo,
  decorators: [
    (Story) => (
      <div className="kbui-site" data-theme="light" style={{ maxWidth: 560 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PlanDemo>;
export default meta;
type Story = StoryObj<typeof meta>;

export const PickAPlan: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const coffee = canvas.getByRole("checkbox", { name: "Coffee and a slow start" });
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const label = canvasElement.querySelector(".choice-copy strong");
    const detail = canvasElement.querySelector(".choice-copy small");
    if (!label || !detail) throw new Error("Missing checklist copy");
    expect(getComputedStyle(detail).animationName).toBe(reduced ? "none" : "kbui-fragment-arrive");
    if (!reduced)
      expect(Number.parseFloat(getComputedStyle(detail).animationDelay)).toBeGreaterThan(
        Number.parseFloat(getComputedStyle(label).animationDelay),
      );
    const row = coffee.closest("label");
    const entrance = row?.getAnimations()[0];
    const height = row?.getBoundingClientRect().height;
    expect(canvas.getByRole("progressbar", { name: "Plans picked" })).toHaveAttribute(
      "aria-valuenow",
      "0",
    );
    await userEvent.click(coffee);
    expect(row?.getAnimations()[0]).toBe(entrance);
    expect(row?.getBoundingClientRect().height).toBe(height);
    const summary = canvasElement.querySelector(".plan-summary-words");
    if (!summary) throw new Error("Missing summary update");
    expect(getComputedStyle(summary).animationName).toBe(reduced ? "none" : "kbui-ink-update");
    expect(canvas.getByRole("progressbar", { name: "Plans picked" })).toHaveAttribute(
      "aria-valuenow",
      "1",
    );
    await userEvent.click(coffee);
    expect(canvas.getByRole("progressbar", { name: "Plans picked" })).toHaveAttribute(
      "aria-valuenow",
      "0",
    );
    for (const checkbox of canvas.getAllByRole("checkbox")) await userEvent.click(checkbox);
    expect(canvas.getByRole("status", { name: "Plan summary" })).toHaveTextContent("Day sorted.");
    await userEvent.click(canvas.getByRole("button", { name: "Start over" }));
    expect(canvas.getByRole("progressbar", { name: "Plans picked" })).toHaveAttribute(
      "aria-valuenow",
      "0",
    );
    for (const checkbox of canvas.getAllByRole("checkbox")) expect(checkbox).not.toBeChecked();
  },
};

export const Rename: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Rename plan" }));
    const dialog = within(
      await within(document.body).findByRole("dialog", { name: "Name your day" }),
    );
    await waitFor(() => expect(dialog.getByLabelText("Plan name")).toBeVisible());
    await userEvent.clear(dialog.getByLabelText("Plan name"));
    await userEvent.click(dialog.getByRole("button", { name: "Save name" }));
    await waitFor(() => expect(dialog.getByText("Enter a name.")).toBeVisible());
    await userEvent.type(dialog.getByLabelText("Plan name"), "Saturday with friends");
    await userEvent.click(dialog.getByRole("button", { name: "Save name" }));
    expect(canvas.getByRole("heading", { name: "Saturday with friends" })).toBeVisible();
    await waitFor(() => expect(canvas.getByRole("button", { name: "Rename plan" })).toHaveFocus());
    await userEvent.click(canvas.getByRole("button", { name: "Rename plan" }));
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(within(document.body).queryByRole("dialog")).toBeNull());
    await waitFor(() => expect(canvas.getByRole("button", { name: "Rename plan" })).toHaveFocus());
  },
};
