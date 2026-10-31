import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent as fileEvents, within } from "storybook/test";
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

export const QuantityRecovery: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole("textbox", { name: "Request title" }), "Equipment");
    await userEvent.type(canvas.getByRole("combobox", { name: "Owner" }), "Ada");
    await userEvent.keyboard("{ArrowDown}{Enter}");
    const quantity = canvas.getByRole("textbox", { name: "Quantity" });
    await expect(quantity).toHaveValue("1");
    for (const value of ["0", "101", "1.5", ""]) {
      await userEvent.clear(quantity);
      if (value) await userEvent.type(quantity, value);
      await userEvent.click(canvas.getByRole("button", { name: "Prepare request" }));
      await expect(canvas.getByRole("alert")).toHaveFocus();
      await userEvent.click(
        canvas.getByRole("link", { name: "Enter a whole quantity from 1 to 100." }),
      );
      await expect(quantity).toHaveFocus();
      await expect(quantity).toHaveAttribute("aria-invalid", "true");
      await expect(canvas.getByRole("textbox", { name: "Request title" })).toHaveValue("Equipment");
      await expect(canvas.getByRole("combobox", { name: "Owner" })).toHaveValue("Ada Chen");
    }
    await userEvent.type(quantity, "99");
    await userEvent.click(canvas.getByRole("button", { name: "Increase Quantity" }));
    await expect(quantity).toHaveValue("100");
    await userEvent.click(canvas.getByRole("button", { name: "Prepare request" }));
    await expect(canvas.getByRole("heading", { name: "Request prepared" })).toHaveFocus();
    await expect(canvas.getByText("100", { exact: true })).toBeVisible();
  },
};

export const AttachmentRecovery: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const picker = canvasElement.querySelector<HTMLInputElement>('input[type="file"]');
    if (!picker) throw new Error("Missing attachment picker");
    const upload = fileEvents.setup({ applyAccept: false });
    await userEvent.type(
      canvas.getByRole("textbox", { name: "Request title" }),
      "Retained attachment draft",
    );
    await userEvent.type(canvas.getByRole("textbox", { name: "Description" }), "Keep this note.");
    await userEvent.type(canvas.getByRole("combobox", { name: "Owner" }), "Ada");
    await userEvent.keyboard("{ArrowDown}{Enter}");
    await upload.upload(picker, [
      new File(["pdf"], "kept.pdf", { type: "application/pdf" }),
      new File(["plain"], "pretend.pdf", { type: "text/plain" }),
      new File([new Uint8Array(5 * 1024 * 1024 + 1)], "large.jpg", { type: "image/jpeg" }),
      new File(["png"], "diagram.png", { type: "image/png" }),
    ]);
    await expect(canvas.getByRole("button", { name: "Remove kept.pdf" })).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Remove diagram.png" })).toBeVisible();
    await expect(canvas.getByText("pretend.pdf: choose PDF, PNG or JPEG.")).toBeVisible();
    await expect(canvas.getByText("large.jpg: choose a file no larger than 5 MiB.")).toBeVisible();
    await expect(canvas.queryByRole("button", { name: "Remove pretend.pdf" })).toBeNull();
    await expect(canvas.queryByRole("button", { name: "Remove large.jpg" })).toBeNull();
    await expect(canvas.getByRole("textbox", { name: "Description" })).toHaveValue(
      "Keep this note.",
    );
    await userEvent.click(canvas.getByRole("button", { name: "Prepare request" }));
    await expect(canvas.getByRole("heading", { name: "Request prepared" })).toHaveFocus();
    await expect(canvas.getByText("kept.pdf")).toBeVisible();
    await expect(canvas.getByText("diagram.png")).toBeVisible();
    await expect(canvas.getByText("No file contents were read or uploaded.")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Edit draft" }));
    await expect(canvas.getByRole("button", { name: "Remove kept.pdf" })).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Remove diagram.png" })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Prepare request" }));
    await userEvent.click(canvas.getByRole("button", { name: "Start another request" }));
    await expect(canvas.queryByRole("button", { name: "Remove kept.pdf" })).toBeNull();
    await expect(canvas.getByRole("textbox", { name: "Quantity" })).toHaveValue("1");
    await expect(canvas.getByRole("textbox", { name: "Request title" })).toHaveFocus();
  },
};

export const RepeatedSelectionAndRemoval: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const picker = canvasElement.querySelector<HTMLInputElement>('input[type="file"]');
    if (!picker) throw new Error("Missing attachment picker");
    const upload = fileEvents.setup({ applyAccept: false });
    const same = new File(["pdf"], "same.pdf", { type: "application/pdf" });
    await upload.upload(picker, same);
    await upload.upload(picker, same);
    await expect(canvas.getAllByRole("button", { name: "Remove same.pdf" })).toHaveLength(2);
    await upload.upload(picker, [
      new File(["jpg"], "photo.jpg", { type: "image/jpeg" }),
      new File(["pdf"], "extra.pdf", { type: "application/pdf" }),
    ]);
    await expect(
      canvas.getByText("extra.pdf: keep at most 3 attachments; remove one first."),
    ).toBeVisible();
    const duplicates = canvas.getAllByRole("button", { name: "Remove same.pdf" });
    const retained = duplicates[1];
    if (!retained) throw new Error("Missing repeated selection");
    duplicates[0]?.focus();
    await userEvent.keyboard("{Enter}");
    await expect(retained).toHaveFocus();
    await expect(canvas.getAllByRole("button", { name: "Remove same.pdf" })).toHaveLength(1);
    await upload.upload(picker, same);
    await expect(canvas.getAllByRole("button", { name: "Remove same.pdf" })).toHaveLength(2);
    await expect(canvas.queryByText("Some files were not added")).toBeNull();
    await userEvent.click(canvas.getByRole("button", { name: "Remove photo.jpg" }));
    for (let remaining = 2; remaining > 0; remaining--) {
      const remove = canvas.getAllByRole("button", { name: "Remove same.pdf" })[0];
      if (!remove) throw new Error("Missing retained file");
      remove.focus();
      await userEvent.keyboard("{Enter}");
    }
    await expect(
      canvas.getByRole("button", { name: "Supporting attachments Choose files" }),
    ).toHaveFocus();
    await expect(canvas.getByText("No files added.")).toBeVisible();
  },
};

export const AttachmentRequirement: Story = {
  args: {
    validate: (draft) =>
      draft.attachments.length ? {} : { attachments: "Add a supporting document." },
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.type(
      canvas.getByRole("textbox", { name: "Request title" }),
      "App-owned requirement",
    );
    await userEvent.type(canvas.getByRole("combobox", { name: "Owner" }), "Ada");
    await userEvent.keyboard("{ArrowDown}{Enter}");
    await userEvent.click(canvas.getByRole("button", { name: "Prepare request" }));
    await expect(canvas.getByRole("alert", { name: "Review request details" })).toHaveFocus();
    await userEvent.click(canvas.getByRole("link", { name: "Add a supporting document." }));
    await expect(
      canvas.getByRole("button", { name: "Supporting attachments Choose files" }),
    ).toHaveFocus();
    const picker = canvasElement.querySelector<HTMLInputElement>('input[type="file"]');
    if (!picker) throw new Error("Missing attachment picker");
    await fileEvents.upload(picker, new File(["pdf"], "required.pdf", { type: "application/pdf" }));
    await userEvent.click(canvas.getByRole("button", { name: "Prepare request" }));
    await expect(canvas.getByRole("heading", { name: "Request prepared" })).toHaveFocus();
  },
};
