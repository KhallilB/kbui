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

export const EditorSpaceAndHints: Story = {
  args: { componentId: "badge" },
  play: async ({ canvasElement }) => {
    const page = within(canvasElement);
    const pane = page.getByRole("region", { name: "Preview styling" });
    const editor = pane.querySelector<HTMLElement>(".catalog-editor-panel");
    if (!editor) throw new Error("Missing editor panel");
    if (innerWidth >= 520) {
      const bottom =
        pane.getBoundingClientRect().bottom -
        Number.parseFloat(getComputedStyle(pane).paddingBottom);
      expect(editor.getBoundingClientRect().bottom).toBeCloseTo(bottom, 0);
    }
    expect(page.queryByRole("status", { name: "Editor notification" })).toBeNull();
    for (const name of [
      "Expand preview",
      "Reload preview",
      "Open example in Storybook",
      "Copy code",
      "Reset example",
    ]) {
      const control = page.getByRole(name === "Open example in Storybook" ? "link" : "button", {
        name,
      });
      await userEvent.hover(control);
      const hint = await within(document.body).findByText(name, { selector: ".kb-tooltip" });
      await waitFor(() => expect(hint).toBeVisible());
      await userEvent.unhover(control);
      await userEvent.keyboard("{Escape}");
      await waitFor(() => expect(document.querySelector(".kb-tooltip")).toBeNull());
    }
    const copy = page.getByRole("button", { name: "Copy code" });
    copy.focus();
    const hint = await within(document.body).findByText("Copy code", { selector: ".kb-tooltip" });
    await waitFor(() => expect(hint).toBeVisible());
    await userEvent.keyboard("{Escape}");
    expect(copy).toHaveFocus();
  },
};

export const WindowControls: Story = {
  args: { componentId: "badge" },
  play: async ({ canvasElement }) => {
    const page = within(canvasElement);
    expect(page.queryByText("Starting style")).toBeNull();
    expect(page.queryByText("Fine-tune colors & corners")).toBeNull();
    expect(page.queryByText("Live preview")).toBeNull();
    expect(page.queryByText("example.tsx")).toBeNull();
    const header = canvasElement.querySelector<HTMLElement>(".catalog-preview-caption");
    if (!header) throw new Error("Missing preview header");
    const controls = within(header);
    const expand = controls.getByRole("button", { name: "Expand preview" });
    expect(expand).toHaveTextContent("");
    expect(controls.getByRole("button", { name: "Reload preview" })).toHaveTextContent("");
    await userEvent.click(expand);
    expect(controls.getByRole("button", { name: "Compact preview" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    const copy = page.getByRole("button", { name: "Copy code" });
    expect(copy).toHaveTextContent("");
    expect(copy.closest(".catalog-editor-actions")).not.toBeNull();
    expect(page.getByRole("button", { name: "Reset example" })).toHaveTextContent("");
    const storybook = controls.getByRole("link", { name: "Open example in Storybook" });
    expect(storybook).toHaveClass("kb-button");
    expect(storybook).toHaveTextContent("");
    expect(storybook).toHaveAttribute("href", expect.stringContaining("components-badge--default"));
    expect(
      page.queryByText(
        "Edit text, props or JSX. Imports from React and @kbui/react are ready to use.",
      ),
    ).toBeNull();
    expect(page.getByRole("table", { name: "Badge API" })).toBeVisible();
    expect(page.getByRole("contentinfo")).toBeVisible();
  },
};

export const CohesiveEditors: Story = {
  args: { componentId: "badge" },
  play: async ({ canvasElement }) => {
    const page = within(canvasElement);
    const pane = page.getByRole("region", { name: "Preview styling" });
    const editor = pane.querySelector(".catalog-editor-panel");
    for (const mode of ["Component", "CSS", "Tailwind"]) {
      await userEvent.click(page.getByRole("radio", { name: mode }));
      expect(pane.querySelector(".catalog-editor-panel")).toBe(editor);
      expect(within(pane).getAllByRole("textbox")).toHaveLength(1);
      expect(within(pane).getByRole("textbox")).not.toHaveAttribute("readonly");
      expect(pane.querySelector(".code-editor-caption")).toBeNull();
      expect(page.queryByText("Use on Badge", { exact: true })).toBeNull();
      expect(page.queryByText("Default KBUI tokens. No CSS overrides needed.")).toBeNull();
    }
  },
};

export const EditableDrafts: Story = {
  args: { componentId: "badge" },
  play: async ({ canvasElement }) => {
    const page = within(canvasElement);
    const source = () =>
      page.getByRole("textbox", { name: "Component code" }) as HTMLTextAreaElement;
    const original = source().value;
    await userEvent.type(source(), "\n// Local draft");
    expect(source().value).toContain("Local draft");
    await userEvent.click(page.getByRole("radio", { name: "CSS" }));
    const css = page.getByRole("textbox", { name: "Style this component" }) as HTMLTextAreaElement;
    await userEvent.type(css, "\n/* Style draft */");
    await userEvent.click(page.getByRole("radio", { name: "Component" }));
    expect(source().value).toContain("Local draft");
    await userEvent.click(page.getByRole("radio", { name: /^Identifiers$/ }));
    expect(source().value).not.toContain("Local draft");
    await userEvent.click(page.getByRole("radio", { name: "Default" }));
    expect(source().value).toContain("Local draft");
    await userEvent.click(page.getByRole("button", { name: "Reset example" }));
    expect(source()).toHaveValue(original);
    await userEvent.click(page.getByRole("radio", { name: "CSS" }));
    expect(css.value).toContain("Style draft");
  },
};

export const DarkEditorContrast: Story = {
  args: { componentId: "badge", initialAppearance: { theme: "dark" } },
  play: async ({ canvasElement }) => {
    const page = within(canvasElement);
    const selected = page.getByRole("radio", { name: "Component" }).closest(".kb-radiogroup-item");
    if (!selected) throw new Error("Missing editor mode control");
    const style = getComputedStyle(selected);
    const luminance = (color: string) => {
      const channels = color
        .match(/[\d.]+/g)
        ?.slice(0, 3)
        .map((part) => {
          const value = Number(part) / 255;
          return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
        });
      if (channels?.length !== 3) throw new Error(`Unexpected color: ${color}`);
      return (
        (channels[0] ?? 0) * 0.2126 + (channels[1] ?? 0) * 0.7152 + (channels[2] ?? 0) * 0.0722
      );
    };
    const foreground = luminance(style.color);
    const background = luminance(style.backgroundColor);
    expect(
      (Math.max(foreground, background) + 0.05) / (Math.min(foreground, background) + 0.05),
    ).toBeGreaterThanOrEqual(4.5);
    if (!matchMedia("(forced-colors: active)").matches) expect(background).toBeLessThan(0.1);
  },
};

export const ResizablePanes: Story = {
  args: { componentId: "badge" },
  play: async ({ canvasElement }) => {
    const page = within(canvasElement);
    if (innerWidth < 520) {
      expect(page.queryByRole("separator", { name: "Resize preview and editor" })).toBeNull();
      return;
    }
    const divider = page.getByRole("separator", { name: "Resize preview and editor" });
    const preview = canvasElement.querySelector<HTMLElement>(".catalog-styling-preview");
    const frame = page.getByTitle("Badge — Default live example");
    if (!preview) throw new Error("Missing preview pane");
    const initial = Number(divider.getAttribute("aria-valuenow"));
    const initialWidth = preview.getBoundingClientRect().width;
    divider.focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(Number(divider.getAttribute("aria-valuenow"))).toBeGreaterThan(initial);
    expect(preview.getBoundingClientRect().width).toBeGreaterThan(initialWidth);
    expect(page.getByTitle("Badge — Default live example")).toBe(frame);
    await userEvent.keyboard("{Home}");
    expect(divider.getAttribute("aria-valuenow")).toBe(divider.getAttribute("aria-valuemin"));
    await userEvent.keyboard("{ArrowLeft}");
    expect(divider.getAttribute("aria-valuenow")).toBe(divider.getAttribute("aria-valuemin"));
    await userEvent.keyboard("{End}");
    expect(divider.getAttribute("aria-valuenow")).toBe(divider.getAttribute("aria-valuemax"));
    await userEvent.keyboard("{ArrowRight}");
    expect(divider.getAttribute("aria-valuenow")).toBe(divider.getAttribute("aria-valuemax"));
    await userEvent.keyboard("{Enter}");
    expect(Number(divider.getAttribute("aria-valuenow"))).toBe(initial);
    expect(divider).toHaveFocus();
    const canvas = preview.querySelector<HTMLElement>(".catalog-preview-panes");
    if (!canvas) throw new Error("Missing preview canvas");
    expect(frame.getBoundingClientRect().width).toBeCloseTo(
      canvas.getBoundingClientRect().width,
      0,
    );
    expect(frame.getBoundingClientRect().height).toBeCloseTo(
      canvas.getBoundingClientRect().height,
      0,
    );
    expect(canvas.getBoundingClientRect().height).toBeGreaterThan(150);
  },
};

export const ComponentStylingScope: Story = {
  args: { componentId: "badge" },
  play: async ({ canvasElement }) => {
    const page = within(canvasElement);
    await userEvent.click(page.getByRole("radio", { name: "CSS" }));
    await userEvent.type(
      page.getByRole("textbox", { name: "Style this component" }),
      "\n/* Badge only */",
    );
    await userEvent.click(page.getByRole("link", { name: "All components" }));
    await userEvent.click(
      within(page.getByRole("navigation", { name: "Browse components" })).getByRole("link", {
        name: /^Input$/,
      }),
    );
    await userEvent.click(page.getByRole("radio", { name: "CSS" }));
    expect(
      (page.getByRole("textbox", { name: "Style this component" }) as HTMLTextAreaElement).value,
    ).not.toContain("Badge only");
  },
};

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

export const RadioGroupToneControl: Story = {
  args: { componentId: "radiogroup" },
  play: async ({ canvasElement }) => {
    const page = within(canvasElement);
    const tone = page.getByRole("combobox", { name: "Selected pill color" });
    await userEvent.click(tone);
    await userEvent.click(await within(document.body).findByRole("option", { name: "Primary" }));
    expect(page.getByRole("radio", { name: "Segmented" })).toBeChecked();
    expect(page.getByTitle("RadioGroup — Segmented live example")).toHaveAttribute(
      "data-preview-src",
      expect.stringContaining("components-radiogroup--segmented"),
    );
    await userEvent.click(tone);
    await userEvent.click(await within(document.body).findByRole("option", { name: "Neutral" }));
    expect(page.getByRole("radio", { name: "Segmented" })).toBeChecked();
    expect(page.getByTitle("RadioGroup — Neutral Selection live example")).toHaveAttribute(
      "data-preview-src",
      expect.stringContaining("components-radiogroup--neutral-selection"),
    );
    expect(
      (page.getByRole("textbox", { name: "Component code" }) as HTMLTextAreaElement).value,
    ).toContain("selectionTone");
    await userEvent.click(page.getByRole("switch", { name: "Dark mode" }));
    expect(tone).toHaveTextContent("Neutral");
    await userEvent.click(tone);
    await userEvent.click(await within(document.body).findByRole("option", { name: "Primary" }));
    expect(page.getByRole("radio", { name: "Segmented" })).toBeChecked();
    await waitFor(() =>
      expect(canvasElement.querySelector(".kb-select-positioner")).not.toBeVisible(),
    );
  },
};

export const CuratedExamples: Story = {
  args: { componentId: "radiogroup", stateId: "components-radiogroup--segmented" },
  play: async ({ canvasElement }) => {
    const page = within(canvasElement);
    const choices = within(page.getByRole("radiogroup", { name: "Example state" }));
    expect(choices.getAllByRole("radio")).toHaveLength(4);
    for (const name of ["Default", "Segmented", "Disabled", "Invalid"])
      expect(choices.getByRole("radio", { name })).toBeInTheDocument();
    expect(choices.queryByRole("radio", { name: "Segmented Updates" })).toBeNull();
    expect(choices.queryByRole("radio", { name: "Neutral Selection" })).toBeNull();
    await userEvent.click(page.getByRole("combobox", { name: "Selected pill color" }));
    await userEvent.click(await within(document.body).findByRole("option", { name: "Neutral" }));
    expect(choices.getByRole("radio", { name: "Segmented" })).toBeChecked();
    expect(page.getByTitle("RadioGroup — Neutral Selection live example")).toHaveAttribute(
      "data-preview-src",
      expect.stringContaining("--neutral-selection"),
    );
    await waitFor(() =>
      expect(canvasElement.querySelector(".kb-select-positioner")).not.toBeVisible(),
    );
  },
};

export const SingleExample: Story = {
  args: { componentId: "toolbar" },
  play: async ({ canvasElement }) => {
    const page = within(canvasElement);
    expect(page.queryByRole("radiogroup", { name: "Example state" })).toBeNull();
    expect(page.getByTitle("Toolbar — Default live example")).toBeInTheDocument();
  },
};

export const AdditionalExampleLink: Story = {
  args: { componentId: "panel", stateId: "components-panel--token-overrides" },
  play: async ({ canvasElement }) => {
    const page = within(canvasElement);
    expect(page.queryByRole("radio", { name: "Token Overrides" })).toBeNull();
    expect(page.getByText("Additional example: Token Overrides.")).toBeVisible();
    expect(page.getByTitle("Panel — Token Overrides live example")).toBeInTheDocument();
    await userEvent.click(page.getByRole("radio", { name: "Depth" }));
    expect(page.queryByText("Additional example: Token Overrides.")).toBeNull();
    expect(page.getByRole("radio", { name: "Depth" })).toBeChecked();
  },
};

export const PreviewStyling: Story = {
  play: async ({ canvasElement }) => {
    const page = within(canvasElement);
    await userEvent.click(page.getByRole("radio", { name: "CSS" }));
    const frame = canvasElement.querySelector("iframe");
    const css = page.getByRole("textbox", { name: "Style this component" }) as HTMLTextAreaElement;
    const original = css.value;
    await userEvent.type(css, "\n/* Custom styling */");
    expect(canvasElement.querySelector("iframe")).toBe(frame);
    expect(canvasElement.querySelector(".kbui-catalog")).toHaveAttribute("data-theme", "light");
    await userEvent.click(page.getByRole("button", { name: "Reset styling" }));
    expect(css).toHaveValue(original);
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
    expect(within(canvasElement).queryByText(/State not found/)).toBeNull();
  },
};

export const ComponentReference: Story = {
  play: async ({ canvasElement }) => {
    const page = within(canvasElement);
    expect(page.queryByText("A few things to know", { exact: true })).not.toBeInTheDocument();
    expect(page.getByRole("table", { name: "Input API" })).toBeVisible();
    expect(page.getByRole("link", { name: "React guide" })).toBeVisible();
    const editor = within(page.getByRole("region", { name: "Preview styling" }));
    expect(editor.getByRole("radio", { name: "Component" })).toBeChecked();
    expect(
      (editor.getByRole("textbox", { name: "Component code" }) as HTMLTextAreaElement).value,
    ).toContain('import { Input } from "@kbui/react";');
    expect(editor.getByRole("button", { name: "Copy code" })).toBeVisible();
    await userEvent.click(editor.getByRole("radio", { name: "CSS" }));
    expect(editor.getByRole("textbox", { name: "Style this component" })).toBeVisible();
    expect(editor.queryByRole("textbox", { name: "Component code" })).not.toBeInTheDocument();
    await userEvent.click(editor.getByRole("radio", { name: "Component" }));
    expect(editor.getByRole("textbox", { name: "Component code" })).toBeVisible();
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
