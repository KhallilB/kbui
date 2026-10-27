import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { PlanDemo } from "../site/PlanDemo";
import { SiteFrame } from "../site/SiteFrame";
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
    expect(coffee).toHaveClass("kb-checkbox-control");
    expect(coffee).toHaveAccessibleDescription("No rush.");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const label = canvasElement.querySelector(".day-choice .kb-checkbox-label");
    const detail = canvasElement.querySelector(".day-choice .kb-checkbox-description");
    if (!label || !detail) throw new Error("Missing checklist copy");
    expect(getComputedStyle(detail).animationName).toBe(reduced ? "none" : "kbui-fragment-arrive");
    if (!reduced)
      expect(Number.parseFloat(getComputedStyle(detail).animationDelay)).toBeGreaterThan(
        Number.parseFloat(getComputedStyle(label).animationDelay),
      );
    const row = coffee.closest(".day-choice");
    const entrance = row?.getAnimations()[0];
    const height = row?.getBoundingClientRect().height;
    expect(canvas.getByRole("progressbar", { name: "Activities picked" })).toHaveAttribute(
      "aria-valuenow",
      "0",
    );
    await userEvent.click(coffee);
    expect(row?.getAnimations()[0]).toBe(entrance);
    expect(row?.getBoundingClientRect().height).toBe(height);
    const summary = canvasElement.querySelector(".plan-summary-words");
    if (!summary) throw new Error("Missing summary update");
    expect(getComputedStyle(summary).animationName).toBe(reduced ? "none" : "kbui-ink-update");
    expect(canvas.getByRole("progressbar", { name: "Activities picked" })).toHaveAttribute(
      "aria-valuenow",
      "1",
    );
    await userEvent.click(coffee);
    expect(canvas.getByRole("progressbar", { name: "Activities picked" })).toHaveAttribute(
      "aria-valuenow",
      "0",
    );
    for (const checkbox of canvas.getAllByRole("checkbox")) await userEvent.click(checkbox);
    expect(canvas.getByRole("status", { name: "Plan summary" })).toHaveTextContent(
      "Looks like a good day.",
    );
    await userEvent.click(canvas.getByRole("button", { name: "Start over" }));
    expect(canvas.getByRole("progressbar", { name: "Activities picked" })).toHaveAttribute(
      "aria-valuenow",
      "0",
    );
    for (const checkbox of canvas.getAllByRole("checkbox")) expect(checkbox).not.toBeChecked();
  },
};

export const Rename: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Name your day" }));
    const dialog = within(
      await within(document.body).findByRole("dialog", { name: "Give your day a name" }),
    );
    await waitFor(() => expect(dialog.getByLabelText("Plan name")).toBeVisible());
    await userEvent.clear(dialog.getByLabelText("Plan name"));
    await userEvent.click(dialog.getByRole("button", { name: "Save name" }));
    await waitFor(() => expect(dialog.getByText("Enter a name.")).toBeVisible());
    await userEvent.type(dialog.getByLabelText("Plan name"), "Saturday with friends");
    await userEvent.click(dialog.getByRole("button", { name: "Save name" }));
    expect(canvas.getByRole("heading", { name: "Saturday with friends" })).toBeVisible();
    await waitFor(() =>
      expect(canvas.getByRole("button", { name: "Name your day" })).toHaveFocus(),
    );
    await userEvent.click(canvas.getByRole("button", { name: "Name your day" }));
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(within(document.body).queryByRole("dialog")).toBeNull());
    await waitFor(() =>
      expect(canvas.getByRole("button", { name: "Name your day" })).toHaveFocus(),
    );
  },
};

export const AddYourOwnActivity: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const add = canvas.getByRole("button", { name: "Add an activity" });
    await userEvent.click(add);
    const dialog = within(
      await within(document.body).findByRole("dialog", { name: "Make a little room" }),
    );
    await userEvent.click(dialog.getByRole("button", { name: "Add to my day" }));
    await waitFor(() => expect(dialog.getByText("Enter an activity.")).toBeVisible());
    await userEvent.type(dialog.getByRole("textbox", { name: "Activity" }), "Visit the bookshop");
    await userEvent.click(dialog.getByRole("button", { name: "Add to my day" }));
    await waitFor(() => expect(within(document.body).queryByRole("dialog")).toBeNull());
    expect(canvas.getByRole("checkbox", { name: "Visit the bookshop" })).toBeChecked();
    expect(canvas.getByRole("progressbar", { name: "Activities picked" })).toHaveAttribute(
      "aria-valuemax",
      "4",
    );
    expect(canvas.getByRole("progressbar", { name: "Activities picked" })).toHaveAttribute(
      "aria-valuenow",
      "1",
    );
    await waitFor(() => expect(add).toHaveFocus());
    await userEvent.click(canvas.getByRole("button", { name: "Start over" }));
    expect(canvas.queryByRole("checkbox", { name: "Visit the bookshop" })).toBeNull();
    expect(canvas.getAllByRole("checkbox")).toHaveLength(3);
    expect(canvas.getByRole("progressbar", { name: "Activities picked" })).toHaveAttribute(
      "aria-valuemax",
      "3",
    );
    await userEvent.click(add);
    await userEvent.type(
      within(await within(document.body).findByRole("dialog")).getByRole("textbox", {
        name: "Activity",
      }),
      "Unsaved idea",
    );
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(within(document.body).queryByRole("dialog")).toBeNull());
    expect(canvas.getAllByRole("checkbox")).toHaveLength(3);
  },
};

export const NoteToYourself: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const note = canvas.getByRole("textbox", { name: "Note to yourself" });
    expect(note).toHaveValue("");
    await userEvent.type(note, "Bring a book. Leave the phone at home.");
    await userEvent.click(canvas.getByRole("button", { name: "Done" }));
    expect(canvas.getByRole("status", { name: "Plan summary" })).toHaveFocus();
    expect(note).toHaveValue("Bring a book. Leave the phone at home.");
    await userEvent.click(note);
    await userEvent.keyboard("{Escape}");
    expect(canvas.getByRole("status", { name: "Plan summary" })).toHaveFocus();
    await userEvent.click(canvas.getByRole("button", { name: "Clear note" }));
    expect(note).toHaveValue("");
    expect(note).toHaveFocus();
    await userEvent.type(note, "Bring a book. Leave the phone at home.");
    await userEvent.keyboard("{Enter}");
    expect(canvas.getByRole("status", { name: "Plan summary" })).toHaveFocus();
    await userEvent.click(canvas.getByRole("checkbox", { name: "Coffee and a slow start" }));
    expect(note).toHaveValue("Bring a book. Leave the phone at home.");
    await userEvent.click(canvas.getByRole("button", { name: "Name your day" }));
    const dialog = within(
      await within(document.body).findByRole("dialog", { name: "Give your day a name" }),
    );
    await userEvent.clear(dialog.getByLabelText("Plan name"));
    await userEvent.type(dialog.getByLabelText("Plan name"), "A quiet Sunday");
    await userEvent.click(dialog.getByRole("button", { name: "Save name" }));
    expect(note).toHaveValue("Bring a book. Leave the phone at home.");
    await waitFor(() => expect(canvas.queryByRole("dialog")).toBeNull());
    await userEvent.click(canvas.getByRole("button", { name: "Start over" }));
    expect(note).toHaveValue("");
    expect(canvas.getByRole("heading", { name: "A day off" })).toBeVisible();
    expect(canvas.getByRole("checkbox", { name: "Coffee and a slow start" })).not.toBeChecked();
  },
};

export const DarkNote: Story = {
  render: () => (
    <SiteFrame current="home" siteRoot="../" storybookRoot="./" theme="dark">
      <PlanDemo />
    </SiteFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(
      canvas.getByRole("textbox", { name: "Note to yourself" }),
      "Take the long way home.",
    );
  },
};
