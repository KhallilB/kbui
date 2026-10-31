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
    const back = page.getByRole("link", { name: /All recipes/ });
    await userEvent.hover(back);
    const arrow = back.querySelector("svg.link-arrow");
    expect(arrow).not.toBeNull();
    expect(arrow).toHaveAttribute("aria-hidden", "true");
    expect(back).toHaveAccessibleName("All recipes");
    expect(back).toHaveAttribute("href", "../recipes/");
    const name = page.getByRole("textbox", { name: "Workspace name" });
    await userEvent.clear(name);
    await userEvent.click(page.getByRole("button", { name: "Save changes" }));
    expect(name).toHaveAccessibleDescription("Enter a workspace name.");
    expect(page.getByRole("alert", { name: "Review workspace settings" })).toHaveFocus();
    await userEvent.type(name, "Northstar Studio ");
    await userEvent.click(page.getByLabelText("Dark mode"));
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
    await userEvent.click(page.getByLabelText("Dark mode"));
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
    expect(email).toHaveAccessibleDescription("Enter a valid email address.");
    expect(page.getByRole("alert", { name: "Review workspace settings" })).toHaveFocus();
    await userEvent.click(page.getByRole("button", { name: "Operations" }));
    const settings = page.getByRole("button", { name: "Settings" });
    await userEvent.click(settings);
    expect(settings).toHaveFocus();
    expect(page.getByRole("alert", { name: "Review workspace settings" })).toBeVisible();
  },
};

export const Operations: Story = {
  play: async ({ canvasElement }) => {
    const page = within(canvasElement);
    await userEvent.click(page.getByRole("button", { name: "Operations" }));
    expect(page.getByRole("heading", { name: /^Operations$/ })).toBeVisible();
    expect(page.queryByRole("progressbar", { name: "Jobs complete" })).toBeNull();
    await userEvent.click(page.getByRole("radio", { name: "Needs attention" }));
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
    await waitFor(() => expect(page.getByRole("radio", { name: "All jobs" })).toHaveFocus());
    await userEvent.click(page.getByRole("radio", { name: "All jobs" }));
    await userEvent.type(page.getByRole("searchbox", { name: "Search jobs" }), "no-match");
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
    await userEvent.click(page.getByLabelText("Dark mode"));
    expect(name).toHaveValue("Northstar together");
    await userEvent.click(page.getByRole("button", { name: "Operations" }));
    await userEvent.type(page.getByRole("searchbox", { name: "Search jobs" }), "Database");
    await userEvent.click(page.getByLabelText("Dark mode"));
    expect(page.getByRole("searchbox", { name: "Search jobs" })).toHaveValue("Database");
    expect(page.getByRole("status", { name: "Queue results" })).toHaveTextContent("1 job");
  },
};

export const DarkOperations: Story = {
  play: async ({ canvasElement }) => {
    const page = within(canvasElement);
    await userEvent.click(page.getByRole("button", { name: "Operations" }));
    await userEvent.click(page.getByLabelText("Dark mode"));
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
    const mark = news.closest(".kb-checkbox")?.querySelector(".kb-checkbox-mark");
    if (!mark) throw new Error("Missing shared Checkbox mark");
    expect(
      getComputedStyle(matchMedia("(forced-colors: active)").matches ? news : mark).outlineWidth,
    ).toBe("2px");
    await userEvent.keyboard(" ");
    expect(news).not.toBeChecked();
    await userEvent.click(page.getByLabelText("Dark mode"));
    expect(page.getByRole("checkbox", { name: /^Product news/ })).not.toBeChecked();
    await userEvent.click(page.getByLabelText("Dark mode"));
    expect(page.getByRole("button", { name: "Save changes" })).toBeEnabled();
  },
};

export const SettingsDropdowns: Story = {
  play: async ({ canvasElement }) => {
    const page = within(canvasElement);
    await userEvent.click(page.getByLabelText("Dark mode"));
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
    await userEvent.click(page.getByLabelText("Dark mode"));
    expect(page.getByRole("combobox", { name: "Activity digest" })).toHaveTextContent("Daily");
  },
};

export const NotificationDraft: Story = {
  play: async ({ canvasElement }) => {
    const page = within(canvasElement);
    const news = page.getByRole("checkbox", { name: /^Product news/ });
    expect(news).toHaveAccessibleDescription("Occasional updates from the workspace.");
    await userEvent.click(news);
    expect(news).toBeChecked();
    await userEvent.click(page.getByRole("button", { name: "Discard changes" }));
    expect(news).not.toBeChecked();
    await userEvent.click(news);
    await userEvent.click(page.getByRole("button", { name: "Save changes" }));
    expect(news).toBeDisabled();
    expect(page.getByRole("textbox", { name: "Workspace name" })).toBeDisabled();
    expect(page.getByRole("combobox", { name: "Timezone" })).toBeDisabled();
    await waitFor(() => expect(page.getByText("Changes saved for this session.")).toBeVisible());
    await userEvent.click(page.getByRole("button", { name: "Operations" }));
    await userEvent.click(page.getByRole("button", { name: "Settings" }));
    const restored = page.getByRole("checkbox", { name: /^Product news/ });
    expect(restored).toBeChecked();
    await userEvent.click(restored);
    await userEvent.click(page.getByLabelText("Dark mode"));
    expect(restored).not.toBeChecked();
    await userEvent.click(page.getByRole("button", { name: "Discard changes" }));
    expect(restored).toBeChecked();
  },
};

export const QueueSearch: Story = {
  play: async ({ canvasElement }) => {
    const page = within(canvasElement);
    await userEvent.click(page.getByRole("button", { name: "Operations" }));
    await userEvent.click(page.getByRole("radio", { name: "Needs attention" }));
    const search = page.getByRole("searchbox", { name: "Search jobs" });
    await userEvent.type(search, "no match");
    expect(page.getByText("No jobs match your search.")).toBeVisible();
    await userEvent.click(page.getByRole("button", { name: "Clear job search" }));
    expect(search).toHaveValue("");
    expect(search).toHaveFocus();
    expect(page.getByRole("radio", { name: "Needs attention" })).toBeChecked();
    expect(page.getByRole("status", { name: "Queue results" })).toHaveTextContent("1 job");
    expect(page.queryByRole("button", { name: "Clear job search" })).toBeNull();
  },
};

export const WorkspaceNavigation: Story = {
  play: async ({ canvasElement }) => {
    const page = within(canvasElement);
    await userEvent.type(page.getByRole("textbox", { name: "Workspace name" }), " draft");
    expect(page.queryByRole("radiogroup", { name: "Screen" })).toBeNull();
    const settings = page.getByRole("button", { name: "Settings" });
    const operations = page.getByRole("button", { name: "Operations" });
    expect(settings).toHaveAttribute("aria-current", "page");
    operations.focus();
    await userEvent.keyboard("{Enter}");
    expect(operations).toHaveAttribute("aria-current", "page");
    expect(settings).not.toHaveAttribute("aria-current");
    const filters = within(page.getByRole("radiogroup", { name: "Filter jobs" }));
    filters.getByRole("radio", { name: "All jobs" }).focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(filters.getByRole("radio", { name: "Running" })).toBeChecked();
    expect(page.getByRole("status", { name: "Queue results" })).toHaveTextContent("2 jobs");
    await userEvent.keyboard("{ArrowRight}");
    expect(filters.getByRole("radio", { name: "Needs attention" })).toBeChecked();
    expect(page.getByRole("status", { name: "Queue results" })).toHaveTextContent("1 job");
    await userEvent.type(page.getByRole("searchbox", { name: "Search jobs" }), "Database");
    settings.focus();
    await userEvent.keyboard("{Enter}");
    expect(page.getByRole("textbox", { name: "Workspace name" })).toHaveValue("Northstar draft");
    await userEvent.click(page.getByLabelText("Dark mode"));
    operations.focus();
    await userEvent.keyboard("{Enter}");
    expect(page.getByRole("searchbox", { name: "Search jobs" })).toHaveValue("Database");
    expect(page.getByRole("radio", { name: "Needs attention" })).toBeChecked();
    expect(page.getByRole("status", { name: "Queue results" })).toHaveTextContent("1 job");
  },
};
