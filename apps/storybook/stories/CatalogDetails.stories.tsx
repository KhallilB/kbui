import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Catalog } from "../site/Catalog";

const meta = {
  title: "Site/Component details",
  component: Catalog,
  args: {
    componentId: "input",
    siteRoot: "../",
    storybookRoot: "./",
    initialAppearance: { theme: "light" },
  },
  parameters: { layout: "fullscreen" },
  afterEach: async ({ canvasElement }) => {
    expect(canvasElement.scrollWidth).toBeLessThanOrEqual(innerWidth);
  },
} satisfies Meta<typeof Catalog>;
export default meta;
type Story = StoryObj<typeof meta>;

export const CompareThemes: Story = {
  args: { initialCompare: true },
  play: async ({ canvasElement }) => {
    const page = within(canvasElement);
    const light = page.getByTitle("Input — Default live example");
    const dark = page.getByTitle("Input — Default Dark comparison");
    expect(light).toHaveAttribute("data-preview-theme", "light");
    expect(dark).toHaveAttribute("data-preview-theme", "dark");
    await userEvent.click(page.getByRole("switch", { name: "Dark mode" }));
    expect(page.getByTitle("Input — Default live example")).toBe(light);
    expect(page.getByTitle("Input — Default Dark comparison")).toBe(dark);
    expect(light).toHaveAttribute("data-preview-theme", "light");
    expect(dark).toHaveAttribute("data-preview-theme", "dark");
    await userEvent.click(page.getByRole("radio", { name: "With Error" }));
    for (const frame of canvasElement.querySelectorAll('iframe[data-current="true"]'))
      expect(frame.getAttribute("data-preview-src")).toContain("--with-error");
    for (const name of ["Disabled", "Default"]) {
      await userEvent.click(page.getByRole("radio", { name }));
      const caches = canvasElement.querySelectorAll(".catalog-preview-frame");
      expect(Number(caches[0]?.getAttribute("data-cache-size"))).toBeLessThanOrEqual(6);
      expect(Number(caches[1]?.getAttribute("data-cache-size"))).toBeLessThanOrEqual(2);
    }
    if (innerWidth <= 720) {
      const panes = canvasElement.querySelectorAll(".catalog-preview-pane");
      expect(panes[1]?.getBoundingClientRect().top).toBeGreaterThanOrEqual(
        panes[0]?.getBoundingClientRect().bottom ?? 0,
      );
    }
  },
};

export const PreviewStyling: Story = {
  play: async ({ canvasElement }) => {
    const page = within(canvasElement);
    const frame = canvasElement.querySelector("iframe");
    await userEvent.click(page.getByRole("combobox", { name: "Palette" }));
    await userEvent.click(await within(document.body).findByRole("option", { name: "Ocean" }));
    await waitFor(() => expect(within(document.body).queryByRole("listbox")).toBeNull());
    expect(
      (page.getByRole("textbox", { name: "Theme CSS overrides" }) as HTMLTextAreaElement).value,
    ).toContain("#21637a");
    await userEvent.click(page.getByRole("combobox", { name: "Corners" }));
    await userEvent.click(await within(document.body).findByRole("option", { name: "Soft" }));
    await waitFor(() => expect(within(document.body).queryByRole("listbox")).toBeNull());
    expect(
      (page.getByRole("textbox", { name: "Theme CSS overrides" }) as HTMLTextAreaElement).value,
    ).toContain("--kb-radius-md: 0.875rem");
    expect(canvasElement.querySelector("iframe")).toBe(frame);
    expect(canvasElement.querySelector(".kbui-catalog")).toHaveAttribute("data-theme", "light");
    await userEvent.click(page.getByRole("button", { name: "Reset styling" }));
    expect(page.queryByRole("textbox", { name: "Theme CSS overrides" })).toBeNull();
    expect(page.getByText("Default KBUI tokens. No CSS overrides needed.")).toBeVisible();
  },
};

export const ExactComponentAndBack: Story = {
  args: { componentId: "stat" },
  play: async ({ canvasElement }) => {
    const page = within(canvasElement);
    expect(page.getByRole("heading", { level: 1, name: "Stat in use." })).toBeVisible();
    expect(page.queryByRole("heading", { name: "Status in use." })).toBeNull();
    await userEvent.click(page.getByRole("link", { name: "All components" }));
    const search = page.getByRole("searchbox", { name: "Search components" });
    await userEvent.type(search, "Status");
    const navigation = within(page.getByRole("navigation", { name: "Browse components" }));
    expect(navigation.getAllByRole("link")).toHaveLength(1);
    expect(navigation.getByRole("link", { name: "Status" })).toBeVisible();
  },
};

export const LegacyThemeExample: Story = {
  args: { componentId: "grid", stateId: "layout-grid--dark" },
  play: async ({ canvasElement }) => {
    expect(within(canvasElement).getByRole("radio", { name: "Default" })).toBeChecked();
    expect(within(canvasElement).getByTitle("Grid — Default live example")).toHaveAttribute(
      "data-preview-src",
      expect.stringContaining("layout-grid--default"),
    );
  },
};

export const ComponentReference: Story = {
  play: async ({ canvasElement }) => {
    const page = within(canvasElement);
    expect(page.queryByText("A few things to know", { exact: true })).not.toBeInTheDocument();
    expect(page.getByRole("table", { name: "Input API" })).toBeVisible();
    expect(page.getByRole("link", { name: "React guide" })).toBeVisible();
    await userEvent.click(page.getByRole("button", { name: "View code" }));
    expect(page.getByRole("button", { name: "View code" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(canvasElement.querySelector(".example-code-content")).toBeVisible();
  },
};

export const NumericReference: Story = {
  args: { componentId: "numberfield" },
  play: async ({ canvasElement }) => {
    const page = within(canvasElement);
    expect(page.queryByText("A few things to know", { exact: true })).not.toBeInTheDocument();
    expect(page.getByRole("table", { name: "NumberField API" })).toBeVisible();
  },
};
