import { Heading } from "@kb.ui/react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { SettingsScreen, useSettings } from "../site/SettingsScreen";
import { SiteFrame } from "../site/SiteFrame";
import "../site/skin-comparison.css";
import "../site/workspace-skin.css";

function SettingsFixture({ failSave = false }: { failSave?: boolean | undefined }) {
  const [failNext, setFailNext] = useState(failSave);
  const model = useSettings(failNext, () => setFailNext(false));
  return (
    <SiteFrame current="recipes" siteRoot="../" storybookRoot="./" className="skin-comparison">
      <main id="main" className="inner-page">
        <Heading level={1}>Settings form contracts</Heading>
        <section className="comparison-pane" aria-label="Settings preview">
          <div className="skin-surface">
            <div className="workspace-content">
              <SettingsScreen model={model} previewName="test" />
            </div>
          </div>
        </section>
      </main>
    </SiteFrame>
  );
}

const meta = {
  title: "Site/SettingsScreen",
  component: SettingsFixture,
  parameters: { layout: "fullscreen" },
  afterEach: ({ canvasElement }) => {
    expect(canvasElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
  },
} satisfies Meta<typeof SettingsFixture>;
export default meta;
type Story = StoryObj<typeof meta>;

export const ValidationRecovery: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const name = canvas.getByRole("textbox", { name: "Workspace name" });
    const email = canvas.getByRole("textbox", { name: "Contact email" });
    const save = canvas.getByRole("button", { name: "Save changes" });
    await userEvent.clear(name);
    await userEvent.type(name, "   ");
    await userEvent.clear(email);
    await userEvent.type(email, "broken");
    await userEvent.click(save);
    const summary = await canvas.findByRole("alert", { name: "Review workspace settings" });
    expect(summary).toHaveFocus();
    expect(name).toHaveValue("   ");
    expect(email).toHaveValue("broken");
    expect(name).toHaveAccessibleDescription("Enter a workspace name.");
    expect(email).toHaveAccessibleDescription("Enter a valid email address.");
    expect(within(summary).getAllByRole("link")).toHaveLength(2);
    const emailLink = within(summary).getByRole("link", { name: "Enter a valid email address." });
    expect(emailLink).toHaveAttribute("href", `#${email.id}`);
    await userEvent.click(emailLink);
    expect(email).toHaveFocus();
    await userEvent.click(save);
    expect(summary).toHaveFocus();
    const nameLink = within(summary).getByRole("link", { name: "Enter a workspace name." });
    expect(nameLink).toHaveAttribute("href", `#${name.id}`);
    await userEvent.tab();
    expect(nameLink).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    expect(name).toHaveFocus();
    await userEvent.clear(name);
    await userEvent.type(name, "  Retained workspace  ");
    expect(canvas.queryByRole("alert", { name: "Review workspace settings" })).toBeNull();
    expect(email).toHaveValue("broken");
    await userEvent.click(save);
    const remaining = canvas.getByRole("alert", { name: "Review workspace settings" });
    expect(remaining).toHaveFocus();
    expect(within(remaining).getAllByRole("link")).toHaveLength(1);
    await userEvent.click(within(remaining).getByRole("link"));
    expect(email).toHaveFocus();
    await userEvent.clear(email);
    await userEvent.type(email, "retained@example.com");
    await userEvent.click(save);
    expect(canvas.getByRole("button", { name: "Saving…" })).toBeDisabled();
    const fields = canvas.getByRole("group", { name: "Workspace preferences" });
    expect(fields).toHaveClass("kb-fieldset");
    expect(fields).toBeDisabled();
    expect(name).toBeDisabled();
    expect(email).toBeDisabled();
    await waitFor(() => expect(canvas.getByText("Changes saved for this session.")).toBeVisible());
    expect(name).toHaveValue("Retained workspace");
    expect(email).toHaveValue("retained@example.com");
    expect(name).not.toHaveAttribute("aria-invalid", "true");
    expect(email).not.toHaveAttribute("aria-invalid", "true");
    expect(canvas.queryByRole("alert", { name: "Review workspace settings" })).toBeNull();
  },
};

export const IndependentActions: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const name = canvas.getByRole("textbox", { name: "Workspace name" });
    const discard = canvas.getByRole("button", { name: "Discard changes" });
    const save = canvas.getByRole("button", { name: "Save changes" });
    expect(discard).toBeDisabled();
    await userEvent.type(name, " draft");
    expect(discard).toHaveAttribute("type", "button");
    expect(save).toHaveAttribute("type", "submit");
    discard.focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(discard).toHaveFocus();
    await userEvent.tab();
    expect(save).toHaveFocus();
    await userEvent.tab({ shift: true });
    expect(discard).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    expect(name).toHaveValue("Northstar");
    expect(discard).toBeDisabled();
    expect(canvas.queryByText("Changes saved for this session.")).toBeNull();
    expect(save.closest(".kb-formactions[data-align='between']")).not.toBeNull();
  },
};

export const ServerRetry: Story = {
  args: { failSave: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const name = canvas.getByRole("textbox", { name: "Workspace name" });
    const news = canvas.getByRole("checkbox", { name: /^Product news/ });
    await userEvent.type(name, " draft");
    await userEvent.click(news);
    await userEvent.click(canvas.getByRole("button", { name: "Save changes" }));
    await waitFor(() =>
      expect(canvas.getByText("Could not save changes. Your draft is still here.")).toBeVisible(),
    );
    expect(name).toHaveValue("Northstar draft");
    expect(news).toBeChecked();
    expect(canvas.queryByRole("alert", { name: "Review workspace settings" })).toBeNull();
    await userEvent.click(canvas.getByRole("button", { name: "Save changes" }));
    await waitFor(() => expect(canvas.getByText("Changes saved for this session.")).toBeVisible());
    expect(name).toHaveValue("Northstar draft");
    expect(news).toBeChecked();
  },
};
