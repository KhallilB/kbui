import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { RequestIntake } from "./RequestIntake";

const meta = {
  title: "Recipes/RequestIntake",
  component: RequestIntake,
  tags: ["!autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta<typeof RequestIntake>;
export default meta;
type Story = StoryObj<typeof meta>;

export const SubmitRequest: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole("textbox", { name: "Request title" }), "Team equipment");
    await userEvent.type(
      canvas.getByRole("textbox", { name: "Description" }),
      "Keep delivery together.",
    );
    await userEvent.click(canvas.getByRole("combobox", { name: "Owner" }));
    await userEvent.type(canvas.getByRole("combobox", { name: "Owner" }), "Ada");
    await userEvent.keyboard("{ArrowDown}{Enter}");
    await userEvent.click(canvas.getByRole("combobox", { name: "Reviewers" }));
    await userEvent.type(canvas.getByRole("combobox", { name: "Reviewers" }), "Luis");
    await userEvent.keyboard("{ArrowDown}{Enter}{Escape}");
    await userEvent.click(canvas.getByRole("button", { name: "Prepare request" }));
    await expect(canvas.getByRole("heading", { name: "Request prepared" })).toHaveFocus();
    await expect(canvas.getByText("Team equipment")).toBeVisible();
    await expect(canvas.getByText("Ada Chen")).toBeVisible();
    await expect(canvas.getByText("Luis Rivera")).toBeVisible();
    const ownerTerm = canvas.getByText("Owner");
    await expect(ownerTerm.tagName).toBe("DT");
    await expect(ownerTerm.nextElementSibling).toHaveTextContent("Ada Chen");
    await expect(canvas.getByText("Nothing was sent or saved to a server.")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Edit draft" }));
    await expect(canvas.getByRole("textbox", { name: "Request title" })).toHaveFocus();
    await expect(canvas.getByRole("textbox", { name: "Request title" })).toHaveValue(
      "Team equipment",
    );
    await expect(canvas.getByRole("combobox", { name: "Owner" })).toHaveValue("Ada Chen");
    await expect(canvas.getByRole("button", { name: "Remove Luis Rivera" })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Prepare request" }));
    await userEvent.click(canvas.getByRole("button", { name: "Start another request" }));
    await expect(canvas.getByRole("textbox", { name: "Request title" })).toHaveFocus();
    await expect(canvas.getByRole("textbox", { name: "Request title" })).toHaveValue("");
    await expect(canvas.getByRole("combobox", { name: "Owner" })).toHaveValue("");
    await expect(canvas.queryByRole("button", { name: "Remove Luis Rivera" })).toBeNull();
  },
};

export const ValidationRecovery: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole("textbox", { name: "Description" }), "Keep this draft.");
    await userEvent.click(canvas.getByRole("button", { name: "Prepare request" }));
    await expect(canvas.getByRole("alert")).toHaveFocus();
    await userEvent.click(canvas.getByRole("link", { name: "Enter a request title." }));
    const title = canvas.getByRole("textbox", { name: "Request title" });
    await expect(title).toHaveFocus();
    await userEvent.type(title, "Restock");
    await expect(title).toHaveFocus();
    await userEvent.click(canvas.getByRole("link", { name: "Choose a request owner." }));
    const owner = canvas.getByRole("combobox", { name: "Owner" });
    await expect(owner).toHaveFocus();
    await userEvent.type(owner, "Ada");
    await userEvent.keyboard("{ArrowDown}{Enter}");
    await expect(canvas.getByRole("textbox", { name: "Description" })).toHaveValue(
      "Keep this draft.",
    );
    await userEvent.click(canvas.getByRole("button", { name: "Prepare request" }));
    await expect(canvas.getByRole("heading", { name: "Request prepared" })).toHaveFocus();
    await expect(canvas.queryByRole("alert")).toBeNull();
    await expect(canvas.getByText("Keep this draft.")).toBeVisible();
  },
};

export const AssignmentKeyboard: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole("textbox", { name: "Request title" }), "Retained title");
    const owner = canvas.getByRole("combobox", { name: "Owner" });
    await userEvent.click(owner);
    await userEvent.type(owner, "nobody");
    await expect(canvas.getByText("No matching people. Try another name.")).toBeVisible();
    await userEvent.clear(owner);
    await userEvent.type(owner, "Ada");
    await userEvent.keyboard("{ArrowDown}{Enter}");
    await expect(owner).toHaveValue("Ada Chen");
    await userEvent.click(canvas.getByRole("button", { name: "Clear Owner" }));
    await expect(owner).toHaveValue("");
    await userEvent.keyboard("{Escape}");
    const reviewers = canvas.getByRole("combobox", { name: "Reviewers" });
    await userEvent.click(reviewers);
    await userEvent.type(reviewers, "Luis");
    await userEvent.keyboard("{ArrowDown}{Enter}{Escape}");
    const chip = canvas.getByRole("button", { name: "Remove Luis Rivera" });
    await userEvent.click(chip);
    await expect(canvas.queryByRole("button", { name: "Remove Luis Rivera" })).toBeNull();
    await userEvent.click(reviewers);
    await userEvent.clear(reviewers);
    await userEvent.type(reviewers, "Ada");
    await userEvent.keyboard("{ArrowDown}{Enter}{Escape}");
    await userEvent.click(reviewers);
    await userEvent.clear(reviewers);
    await userEvent.type(reviewers, "Sam");
    await userEvent.keyboard("{ArrowDown}{Enter}{Escape}");
    await userEvent.clear(reviewers);
    await userEvent.keyboard("{ArrowLeft}{Delete}");
    await expect(canvas.queryByRole("button", { name: "Remove Sam Okafor" })).toBeNull();
    await expect(canvas.getByRole("button", { name: "Remove Ada Chen" })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Clear Reviewers" }));
    await expect(canvas.queryByRole("button", { name: "Remove Ada Chen" })).toBeNull();
    await expect(canvas.getByRole("textbox", { name: "Request title" })).toHaveValue(
      "Retained title",
    );
  },
};

export const EmptyDirectory: Story = {
  args: { people: [] },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.type(
      canvas.getByRole("textbox", { name: "Request title" }),
      "Waiting for directory",
    );
    await userEvent.click(canvas.getByRole("button", { name: "Toggle Owner options" }));
    await expect(
      await canvas.findByText("No people available. Ask your app to supply a directory."),
    ).toBeVisible();
    await userEvent.keyboard("{Escape}");
    await userEvent.click(canvas.getByRole("button", { name: "Prepare request" }));
    await expect(canvas.getByRole("alert")).toHaveFocus();
    await expect(canvas.getByRole("textbox", { name: "Request title" })).toHaveValue(
      "Waiting for directory",
    );
    await userEvent.click(canvas.getByRole("link", { name: "Choose a request owner." }));
    await expect(canvas.getByRole("combobox", { name: "Owner" })).toHaveFocus();
  },
};

export const AppValidation: Story = {
  args: {
    validate: (draft) =>
      draft.description.trim() ? {} : { description: "Explain why this request is needed." },
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole("textbox", { name: "Request title" }), "Restock");
    await userEvent.type(canvas.getByRole("combobox", { name: "Owner" }), "Ada");
    await userEvent.keyboard("{ArrowDown}{Enter}");
    await userEvent.click(canvas.getByRole("button", { name: "Prepare request" }));
    await expect(canvas.getByRole("alert")).toHaveFocus();
    await userEvent.click(
      canvas.getByRole("link", { name: "Explain why this request is needed." }),
    );
    await expect(canvas.getByRole("textbox", { name: "Description" })).toHaveFocus();
    await userEvent.type(
      canvas.getByRole("textbox", { name: "Description" }),
      "Replace broken equipment.",
    );
    await userEvent.click(canvas.getByRole("button", { name: "Prepare request" }));
    await expect(canvas.getByRole("heading", { name: "Request prepared" })).toHaveFocus();
  },
};
