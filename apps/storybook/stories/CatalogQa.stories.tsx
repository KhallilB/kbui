import entries from "virtual:kbui-catalog";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { CatalogQa } from "../site/CatalogQa";

const meta = {
  title: "Site/Component QA",
  component: CatalogQa,
  args: {
    componentId: "input",
    siteRoot: "../",
    catalogRoot: "../components/",
    storybookRoot: "./",
  },
  parameters: { layout: "fullscreen" },
  afterEach: async ({ canvasElement }) => {
    expect(canvasElement.scrollWidth).toBeLessThanOrEqual(innerWidth);
  },
} satisfies Meta<typeof CatalogQa>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Inventory: Story = {
  args: { componentId: null },
  play: async ({ canvasElement }) => {
    const page = within(canvasElement);
    expect(page.getByRole("heading", { name: "Component QA bench" })).toBeVisible();
    for (const name of ["NumberField", "FileInput"])
      expect(page.getByRole("heading", { name })).toBeVisible();
    expect(canvasElement.querySelectorAll(".catalog-specimen")).toHaveLength(entries.length);
    expect(canvasElement.querySelectorAll("iframe")).toHaveLength(entries.length);
    expect(page.getByRole("checkbox", { name: "Compare light and dark" })).not.toBeChecked();
  },
};

export const PairedThemes: Story = {
  args: { initialCompare: true },
  play: async ({ canvasElement }) => {
    const page = within(canvasElement);
    const light = page.getByTitle("Input — Default — Light QA example");
    const dark = page.getByTitle("Input — Default — Dark QA example");
    expect(canvasElement.querySelectorAll("iframe")).toHaveLength(2);
    expect(light.closest("[data-qa-theme]")).toHaveAttribute("data-qa-theme", "light");
    expect(dark.closest("[data-qa-theme]")).toHaveAttribute("data-qa-theme", "dark");
    for (const frame of [light, dark])
      expect(frame.getBoundingClientRect().height).toBeLessThan(240);
    const lightSource = light.getAttribute("data-preview-src");
    const darkSource = dark.getAttribute("data-preview-src");
    await userEvent.click(page.getByRole("switch", { name: "Dark mode" }));
    expect(page.getByTitle("Input — Default — Light QA example")).toBe(light);
    expect(page.getByTitle("Input — Default — Dark QA example")).toBe(dark);
    expect(light).toHaveAttribute("data-preview-src", lightSource);
    expect(dark).toHaveAttribute("data-preview-src", darkSource);
    if (innerWidth <= 800) {
      const lightBounds = light.closest("[data-qa-theme]")?.getBoundingClientRect();
      const darkBounds = dark.closest("[data-qa-theme]")?.getBoundingClientRect();
      if (!lightBounds || !darkBounds) throw new Error("Missing comparison panes");
      expect(darkBounds.top).toBeGreaterThanOrEqual(lightBounds.bottom);
    }
    await userEvent.click(page.getByRole("combobox", { name: "Input example" }));
    await userEvent.click(await within(document.body).findByRole("option", { name: "With Error" }));
    await waitFor(() => expect(within(document.body).queryByRole("listbox")).toBeNull());
    const current = canvasElement.querySelectorAll('iframe[data-current="true"]');
    expect(current).toHaveLength(2);
    for (const frame of current)
      expect(frame.getAttribute("data-preview-src")).toContain("--with-error");
    expect(page.getByRole("link", { name: "Input API and code" })).toHaveAttribute(
      "href",
      expect.stringContaining("component=input&state=components-input--with-error"),
    );
    for (const name of ["Disabled", "Default"]) {
      await userEvent.click(page.getByRole("combobox", { name: "Input example" }));
      await userEvent.click(await within(document.body).findByRole("option", { name }));
      await waitFor(() => expect(within(document.body).queryByRole("listbox")).toBeNull());
      for (const cache of canvasElement.querySelectorAll(".catalog-preview-frame"))
        expect(Number(cache.getAttribute("data-cache-size"))).toBeLessThanOrEqual(2);
    }
  },
};

export const Filters: Story = {
  play: async ({ canvasElement }) => {
    const page = within(canvasElement);
    await userEvent.click(page.getByRole("combobox", { name: "Component category" }));
    await userEvent.click(await within(document.body).findByRole("option", { name: "Forms" }));
    await waitFor(() => expect(within(document.body).queryByRole("listbox")).toBeNull());
    const search = page.getByRole("searchbox", { name: "Search QA components" });
    await userEvent.click(page.getByRole("button", { name: "Clear component search" }));
    expect(canvasElement.querySelectorAll(".catalog-specimen")).toHaveLength(
      entries.filter((entry) => entry.group === "Forms").length,
    );
    await userEvent.type(search, "nothing-matches");
    expect(page.getByText("No components match these filters.")).toBeVisible();
    await userEvent.click(page.getByRole("button", { name: "Clear component search" }));
    expect(search).toHaveFocus();
    expect(canvasElement.querySelectorAll(".catalog-specimen")).toHaveLength(
      entries.filter((entry) => entry.group === "Forms").length,
    );
    await userEvent.type(search, "Input");
    expect(canvasElement.querySelectorAll(".catalog-specimen")).toHaveLength(2);
    for (const name of ["Input", "FileInput"])
      expect(page.getByRole("heading", { name })).toBeVisible();
  },
};

export const NormalThemeRetention: Story = {
  play: async ({ canvasElement }) => {
    const page = within(canvasElement);
    const frame = canvasElement.querySelector("iframe");
    expect(frame).not.toBeNull();
    await userEvent.click(page.getByRole("switch", { name: "Dark mode" }));
    expect(canvasElement.querySelector("iframe")).toBe(frame);
    expect(frame).toHaveAttribute("data-preview-theme", "dark");
    expect(canvasElement.querySelector(".catalog-preview-frame")).toHaveAttribute(
      "data-cache-size",
      "1",
    );
  },
};

export const LegacyState: Story = {
  args: { stateId: "components-input--with-adornments" },
  play: async ({ canvasElement }) => {
    const page = within(canvasElement);
    expect(page.getByRole("combobox", { name: "Input example" })).toHaveTextContent(
      "Icons and actions",
    );
    expect(page.getByTitle("Input — Icons and actions — Light QA example")).toHaveAttribute(
      "data-preview-src",
      expect.stringContaining("components-input--with-icons-and-actions"),
    );
  },
};

export const LegacyThemeState: Story = {
  args: { componentId: "grid", stateId: "layout-grid--dark" },
  play: async ({ canvasElement }) => {
    const page = within(canvasElement);
    expect(page.getByRole("combobox", { name: "Grid example" })).toHaveTextContent("Default");
    expect(page.getByTitle("Grid — Default — Light QA example")).toHaveAttribute(
      "data-preview-src",
      expect.stringContaining("layout-grid--default"),
    );
  },
};

export const ExactComponentLink: Story = {
  args: { componentId: "stat" },
  play: async ({ canvasElement }) => {
    const page = within(canvasElement);
    expect(canvasElement.querySelectorAll(".catalog-specimen")).toHaveLength(1);
    expect(canvasElement.querySelector(".catalog-specimen")).toHaveAttribute(
      "data-component",
      "stat",
    );
    await userEvent.type(page.getByRole("searchbox", { name: "Search QA components" }), "us");
    expect(canvasElement.querySelectorAll(".catalog-specimen")).toHaveLength(1);
    expect(canvasElement.querySelector(".catalog-specimen")).toHaveAttribute(
      "data-component",
      "status",
    );
  },
};
