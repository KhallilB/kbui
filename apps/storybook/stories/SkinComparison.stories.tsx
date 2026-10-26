import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { SkinComparison } from "../site/SkinComparison";

const meta = {
  title: "Site/Workspace",
  component: SkinComparison,
  parameters: { layout: "fullscreen" },
  afterEach: async ({ canvasElement }) => {
    expect(canvasElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
  },
} satisfies Meta<typeof SkinComparison>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Settings: Story = {
  play: async ({ canvasElement }) => {
    const page = within(canvasElement);
    const name = page.getByRole("textbox", { name: "Workspace name" });
    await userEvent.clear(name);
    await userEvent.click(page.getByRole("button", { name: "Save changes" }));
    expect(page.getByText("Enter a workspace name.")).toBeVisible();
    expect(name).toHaveFocus();
    await userEvent.type(name, "Northstar Studio ");
    await userEvent.click(page.getByRole("button", { name: "Dark mode" }));
    expect(page.getByRole("textbox", { name: "Workspace name" })).toBe(name);
    expect(name).toHaveValue("Northstar Studio ");
    await userEvent.click(page.getByRole("button", { name: "Save changes" }));
    expect(page.getByRole("button", { name: "Saving…" })).toBeDisabled();
    await waitFor(() => expect(page.getByText("Changes saved for this session.")).toBeVisible());
    expect(page.getByRole("textbox", { name: "Workspace name" })).toHaveValue("Northstar Studio");
    await userEvent.type(page.getByRole("textbox", { name: "Workspace name" }), " draft");
    await userEvent.click(page.getByRole("button", { name: "Discard changes" }));
    expect(page.getByRole("textbox", { name: "Workspace name" })).toHaveValue("Northstar Studio");
    expect(page.getByRole("region", { name: "Workspace preview" })).toHaveAttribute(
      "data-theme",
      "dark",
    );
    await userEvent.click(page.getByRole("button", { name: "Dark mode" }));
    expect(page.getByRole("region", { name: "Workspace preview" })).toHaveAttribute(
      "data-theme",
      "light",
    );
    expect(name).toHaveValue("Northstar Studio");
    expect(page.queryByRole("radio", { name: "Sleek candidate" })).toBeNull();
  },
};

export const Recovery: Story = {
  play: async ({ canvasElement }) => {
    const page = within(canvasElement);
    await userEvent.click(page.getByText("Explore edge cases"));
    await userEvent.click(page.getByRole("checkbox", { name: "Fail next save" }));
    await userEvent.type(page.getByRole("textbox", { name: "Workspace name" }), " draft");
    await userEvent.click(page.getByRole("button", { name: "Save changes" }));
    await waitFor(() =>
      expect(page.getByText("Could not save changes. Your draft is still here.")).toBeVisible(),
    );
    expect(page.getByRole("textbox", { name: "Workspace name" })).toHaveValue("Northstar draft");
    await userEvent.click(page.getByRole("button", { name: "Save changes" }));
    await waitFor(() => expect(page.getByText("Changes saved for this session.")).toBeVisible());
    const email = page.getByRole("textbox", { name: "Contact email" });
    await userEvent.clear(email);
    await userEvent.type(email, "invalid");
    await userEvent.click(page.getByRole("button", { name: "Save changes" }));
    expect(page.getByText("Enter a valid email address.")).toBeVisible();
    expect(email).toHaveFocus();
  },
};

export const Operations: Story = {
  play: async ({ canvasElement }) => {
    const page = within(canvasElement);
    await userEvent.click(page.getByRole("radio", { name: "Operations" }));
    await userEvent.click(page.getByRole("button", { name: "Needs attention" }));
    expect(page.getByRole("status", { name: "Queue results" })).toHaveTextContent("1 job");
    await userEvent.click(page.getByRole("button", { name: "Inspect Database migration" }));
    const popup = await page.findByRole("dialog", { name: "Database migration" });
    const dialog = within(popup);
    await waitFor(() => {
      const bounds = popup.getBoundingClientRect();
      expect(bounds.top).toBeGreaterThanOrEqual(0);
      expect(bounds.left).toBeGreaterThanOrEqual(0);
      expect(bounds.right).toBeLessThanOrEqual(window.innerWidth);
      expect(bounds.bottom).toBeLessThanOrEqual(window.innerHeight);
    });
    await waitFor(() =>
      expect(dialog.getByText("Connection timed out while checking the replica.")).toBeVisible(),
    );
    await userEvent.click(dialog.getByRole("button", { name: "Retry check" }));
    await waitFor(() => expect(dialog.getByText("Complete", { exact: true })).toBeVisible());
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(page.queryByRole("dialog")).toBeNull());
    expect(page.getByText("No jobs need attention.")).toBeVisible();
    await waitFor(() => expect(page.getByRole("button", { name: "All jobs" })).toHaveFocus());
    await userEvent.click(page.getByRole("button", { name: "All jobs" }));
    await userEvent.type(page.getByRole("textbox", { name: "Search jobs" }), "no-match");
    expect(page.getByText("No jobs match your search.")).toBeVisible();
    await userEvent.click(page.getByRole("button", { name: "Clear filters" }));
    expect(page.getByRole("status", { name: "Queue results" })).toHaveTextContent("6 jobs");
    await userEvent.click(page.getByText("Explore edge cases"));
    await userEvent.click(page.getByRole("button", { name: "Show queue error" }));
    expect(page.getByText("Queue unavailable")).toBeVisible();
    await userEvent.click(page.getByRole("button", { name: "Try again" }));
    expect(page.getByText("Refreshing queue…")).toBeVisible();
    await waitFor(() =>
      expect(page.getByRole("status", { name: "Queue results" })).toHaveTextContent("6 jobs"),
    );
  },
};

export const ThemePreservesState: Story = {
  play: async ({ canvasElement }) => {
    const page = within(canvasElement);
    const name = page.getByRole("textbox", { name: "Workspace name" });
    await userEvent.type(name, " together");
    await userEvent.click(page.getByRole("button", { name: "Dark mode" }));
    expect(name).toHaveValue("Northstar together");
    await userEvent.click(page.getByRole("radio", { name: "Operations" }));
    await userEvent.type(page.getByRole("textbox", { name: "Search jobs" }), "Database");
    await userEvent.click(page.getByRole("button", { name: "Dark mode" }));
    expect(page.getByRole("textbox", { name: "Search jobs" })).toHaveValue("Database");
    expect(page.getByRole("status", { name: "Queue results" })).toHaveTextContent("1 job");
  },
};

export const DarkOperations: Story = {
  play: async ({ canvasElement }) => {
    const page = within(canvasElement);
    await userEvent.click(page.getByRole("radio", { name: "Operations" }));
    await userEvent.click(page.getByRole("button", { name: "Dark mode" }));
    expect(page.getAllByRole("table", { name: "Workspace jobs" })).toHaveLength(1);
    expect(page.getByRole("region", { name: "Workspace preview" })).toHaveAttribute(
      "data-theme",
      "dark",
    );
  },
};

export const ControlStates: Story = {
  play: async ({ canvasElement }) => {
    const page = within(canvasElement);
    const news = page.getByRole("checkbox", { name: /^Product news/ });
    expect(news).not.toBeChecked();
    await userEvent.click(news);
    expect(news).toBeChecked();
    await userEvent.keyboard("{Tab}{Shift>}{Tab}{/Shift}");
    expect(news).toHaveFocus();
    expect(getComputedStyle(news).outlineWidth).toBe("2px");
    await userEvent.keyboard(" ");
    expect(news).not.toBeChecked();
    await userEvent.click(page.getByRole("button", { name: "Dark mode" }));
    expect(page.getByRole("checkbox", { name: /^Product news/ })).not.toBeChecked();
    await userEvent.click(page.getByRole("button", { name: "Dark mode" }));
    expect(page.getByRole("button", { name: "Save changes" })).toBeEnabled();
  },
};

export const SettingsDropdowns: Story = {
  play: async ({ canvasElement }) => {
    const page = within(canvasElement);
    await userEvent.click(page.getByRole("button", { name: "Dark mode" }));
    await userEvent.click(page.getByRole("combobox", { name: "Timezone" }));
    const zones = await within(document.body).findByRole("listbox", { name: "Timezone" });
    expect(zones.closest("[data-theme]")).toHaveAttribute("data-theme", "dark");
    await userEvent.click(within(zones).getByRole("option", { name: "London (GMT / BST)" }));
    await waitFor(() => expect(within(document.body).queryByRole("listbox")).toBeNull());
    expect(page.getByRole("combobox", { name: "Timezone" })).toHaveTextContent("London");
    await userEvent.click(page.getByRole("combobox", { name: "Activity digest" }));
    await userEvent.click(await within(document.body).findByRole("option", { name: "Daily" }));
    await waitFor(() => expect(within(document.body).queryByRole("listbox")).toBeNull());
    await userEvent.click(page.getByRole("button", { name: "Save changes" }));
    expect(page.getByRole("combobox", { name: "Timezone" })).toBeDisabled();
    await waitFor(() => expect(page.getByText("Changes saved for this session.")).toBeVisible());
    await userEvent.click(page.getByRole("button", { name: "Dark mode" }));
    expect(page.getByRole("combobox", { name: "Activity digest" })).toHaveTextContent("Daily");
  },
};
