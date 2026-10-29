import entries from "virtual:kbui-catalog";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fireEvent, userEvent, waitFor, within } from "storybook/test";
import { Catalog } from "../site/Catalog";

const meta = {
  title: "Site/Catalog",
  component: Catalog,
  args: {
    siteRoot: "../",
    storybookRoot: "./",
    initialAppearance: { theme: "light" },
  },
  parameters: { layout: "fullscreen" },
  afterEach: async ({ canvasElement }) => {
    expect(canvasElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
  },
} satisfies Meta<typeof Catalog>;
export default meta;
type Story = StoryObj<typeof meta>;

export const BrowseComponents: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const heading = canvasElement.querySelector(".page-heading");
    const panel = canvasElement.querySelector(".catalog-browser");
    if (!heading || !panel) throw new Error("Missing catalog entrance surfaces");
    expect(getComputedStyle(heading).animationName).toBe(reduced ? "none" : "kbui-poster-rise");
    expect(getComputedStyle(panel).animationName).toBe(reduced ? "none" : "kbui-poster-arrive");
    expect(canvas.getByRole("status", { name: "Catalog results" })).toHaveTextContent(
      `${entries.length} of ${entries.length}`,
    );
    const filters = within(canvas.getByRole("radiogroup", { name: "Filter by use" }));
    filters.getByRole("radio", { name: "All" }).focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(filters.getByRole("radio", { name: "Actions" })).toBeChecked();
    expect(canvas.getByRole("status", { name: "Catalog results" })).toHaveTextContent(
      `${entries.filter((entry) => entry.group === "Actions").length} of ${entries.length}`,
    );
    await userEvent.keyboard("{ArrowLeft}");
    expect(filters.getByRole("radio", { name: "All" })).toBeChecked();
    await userEvent.click(canvas.getByRole("radio", { name: "Typography" }));
    expect(canvas.getByRole("status", { name: "Catalog results" })).toHaveTextContent(
      `${entries.filter((entry) => entry.group === "Typography").length} of ${entries.length}`,
    );
    expect(canvas.getByRole("link", { name: "Heading" })).toHaveAttribute(
      "href",
      "./?component=heading",
    );
    await userEvent.click(canvas.getByRole("radio", { name: "Forms" }));
    expect(canvas.getByRole("status", { name: "Catalog results" })).toHaveTextContent(
      `${entries.filter((entry) => entry.group === "Forms").length} of ${entries.length}`,
    );
    expect(canvas.getByRole("link", { name: "Input" })).toHaveAttribute(
      "href",
      "./?component=input",
    );
    await userEvent.type(
      canvas.getByRole("searchbox", { name: "Search components" }),
      "no-such-component",
    );
    expect(
      canvas.getByText("No matches this time. Try another name or clear your filters."),
    ).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Clear filters" }));
    expect(canvas.getByRole("searchbox", { name: "Search components" })).toHaveFocus();
    expect(canvas.getByRole("status", { name: "Catalog results" })).toHaveTextContent(
      `${entries.length} of ${entries.length}`,
    );
  },
};

export const SlidingFilter: Story = {
  play: async ({ canvasElement }) => {
    if (matchMedia("(forced-colors: active)").matches) return;
    const canvas = within(canvasElement);
    const group = canvas.getByRole("radiogroup", { name: "Filter by use" });
    const indicator = group.querySelector(".kb-radiogroup-selection");
    if (!indicator) throw new Error("Missing filter selection");
    const typography = within(group).getByRole("radio", { name: "Typography" });
    const label = typography.closest("label");
    if (!label) throw new Error("Missing filter label");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    for (const dark of [false, true]) {
      if (dark) await userEvent.click(canvas.getByRole("switch", { name: "Dark mode" }));
      const start = indicator.getBoundingClientRect();
      await userEvent.click(typography);
      expect(typography).toBeChecked();
      expect(group.querySelector(".kb-radiogroup-selection")).toBe(indicator);
      const target = label.getBoundingClientRect();
      expect(target.width).toBeGreaterThan(start.width);
      if (reduced) {
        expect(indicator.getAnimations()).toHaveLength(0);
      } else {
        for (const property of ["transform", "width"]) {
          const movement = await waitFor(() => {
            const animation = indicator
              .getAnimations()
              .find(
                (item) => item instanceof CSSTransition && item.transitionProperty === property,
              );
            expect(animation).toBeDefined();
            return animation as Animation;
          });
          movement.pause();
          movement.currentTime = Number(movement.effect?.getTiming().duration) / 2;
        }
        const halfway = indicator.getBoundingClientRect();
        expect(Math.hypot(target.x - start.x, target.y - start.y)).toBeGreaterThan(1);
        for (const edge of ["x", "y"] as const) {
          if (Math.abs(target[edge] - start[edge]) > 1) {
            expect(halfway[edge]).toBeGreaterThan(Math.min(start[edge], target[edge]));
            expect(halfway[edge]).toBeLessThan(Math.max(start[edge], target[edge]));
          } else {
            expect(Math.abs(halfway[edge] - target[edge])).toBeLessThan(1);
          }
        }
        expect(halfway.width).toBeGreaterThan(start.width);
        expect(halfway.width).toBeLessThan(target.width);
        expect(getComputedStyle(indicator).opacity).toBe("1");
        for (const animation of indicator.getAnimations()) animation.finish();
      }
      await waitFor(() => {
        const final = indicator.getBoundingClientRect();
        const selected = label.getBoundingClientRect();
        for (const edge of ["x", "y", "width", "height"] as const)
          expect(Math.abs(final[edge] - selected[edge])).toBeLessThan(1);
      });
      await userEvent.click(within(group).getByRole("radio", { name: "All" }));
      await waitFor(() => {
        expect(indicator.getAnimations()).toHaveLength(0);
      });
    }
  },
};

export const FocusedBrowser: Story = {
  args: { initialAppearance: { theme: "light" } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvasElement.querySelectorAll("iframe")).toHaveLength(0);
    const components = canvas.getByRole("navigation", { name: "Browse components" });
    await userEvent.click(within(components).getByRole("link", { name: "Input" }));
    expect(canvas.getByRole("heading", { name: "Input in use." })).toBeVisible();
    expect(canvasElement.querySelector('iframe[data-current="true"]')).toHaveAttribute(
      "title",
      "Input — Default live example",
    );
    await userEvent.click(canvas.getByRole("radio", { name: "With Error" }));
    await userEvent.click(canvas.getByRole("link", { name: "All components" }));
    expect(canvasElement.querySelectorAll("iframe").length).toBeGreaterThan(0);
    expect(canvasElement.querySelectorAll('iframe[data-current="true"]')).toHaveLength(0);
    await userEvent.click(within(components).getByRole("link", { name: "Button" }));
    await userEvent.click(canvas.getByRole("link", { name: "All components" }));
    await userEvent.click(within(components).getByRole("link", { name: "Input" }));
    expect(canvas.getByRole("radio", { name: "With Error" })).toBeChecked();
    await userEvent.click(canvas.getByRole("link", { name: "All components" }));
    await userEvent.type(canvas.getByRole("searchbox", { name: "Search components" }), "no-match");
    expect(
      canvas.getByText("No matches this time. Try another name or clear your filters."),
    ).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Clear filters" }));
    expect(canvas.getByRole("searchbox", { name: "Search components" })).toHaveFocus();
    expect(canvas.queryByRole("heading", { name: "Input in use." })).toBeNull();
    await userEvent.click(within(components).getByRole("link", { name: "Input" }));
    expect(canvas.getByRole("radio", { name: "With Error" })).toBeChecked();
  },
};

export const ThemeExamples: Story = {
  args: { componentId: "panel", stateId: "components-panel--depth-dark" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.queryByRole("radio", { name: "Dark" })).toBeNull();
    expect(canvas.queryByRole("radio", { name: "Depth Dark" })).toBeNull();
    expect(canvas.queryByRole("radio", { name: "Token Overrides Light" })).toBeNull();
    expect(canvas.getByRole("radio", { name: "Depth" })).toBeChecked();
    expect(canvas.queryByText(/State not found/)).toBeNull();
  },
};
export const LegacyInputRecipe: Story = {
  args: { componentId: "input", stateId: "components-input--with-adornments" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByRole("radio", { name: "Icons and actions" })).toBeChecked();
    expect(canvas.getByTitle("Input — Icons and actions live example")).toHaveAttribute(
      "data-preview-src",
      "./iframe.html?id=components-input--with-icons-and-actions&viewMode=story&globals=previewTheme:light&embed=true",
    );
    expect(canvas.queryByText(/no longer exists/)).toBeNull();
  },
};
export const ButtonStates: Story = {
  args: { componentId: "button" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const panel = canvasElement.querySelector(".catalog-live");
    if (!panel) throw new Error("Missing catalog preview entrance");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    expect(getComputedStyle(panel).animationName).toBe(reduced ? "none" : "kbui-poster-arrive");
    expect(getComputedStyle(panel).transform).toBe("none");
    expect(canvas.getByRole("link", { name: "Full Button API" })).toHaveAttribute(
      "href",
      "./?path=/docs/components-button--docs",
    );
    expect(canvas.getByRole("table", { name: "Button API" })).toHaveTextContent(
      '"primary" | "secondary" | "ghost" | "danger"',
    );
    const examples = within(canvas.getByRole("radiogroup", { name: "Example state" }));
    examples.getByRole("radio", { name: "Primary" }).focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(examples.getByRole("radio", { name: "Secondary" })).toBeChecked();
    expect(examples.getByRole("radio", { name: "Secondary" })).toHaveFocus();
    await userEvent.click(canvas.getByRole("radio", { name: "Disabled" }));
    expect(canvas.getByRole("radio", { name: "Disabled" })).toBeChecked();
    expect(canvas.queryByRole("combobox", { name: "Example state" })).toBeNull();
    expect(canvas.queryByRole("navigation", { name: "Browse components" })).toBeNull();
    expect(canvas.getByRole("link", { name: "All components" })).toHaveAttribute("href", "./");
    expect(canvas.getByTitle("Button — Disabled live example")).toHaveAttribute(
      "data-preview-src",
      "./iframe.html?id=components-button--disabled&viewMode=story&globals=previewTheme:light&embed=true",
    );
    expect(canvas.getByRole("link", { name: "Open example in Storybook" })).toHaveAttribute(
      "href",
      "./?path=/story/components-button--disabled&globals=theme:light",
    );
  },
};
export const UnknownComponent: Story = {
  args: { componentId: "missing" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByRole("heading", { name: "Component not found." })).toBeVisible();
    expect(canvas.getByRole("link", { name: "All components" })).toHaveAttribute("href", "./");
  },
};

export const CompactInput: Story = {
  args: { componentId: "input" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const frame = canvas.getByTitle("Input — Default live example");
    const initialHeight = frame.getBoundingClientRect().height;
    expect(initialHeight).toBeGreaterThanOrEqual(96);
    const stage = frame.parentElement;
    if (!stage) throw new Error("Missing preview stage");
    const style = getComputedStyle(stage);
    const available =
      stage.clientWidth -
      Number.parseFloat(style.paddingLeft) -
      Number.parseFloat(style.paddingRight);
    expect(frame.getBoundingClientRect().width).toBeGreaterThanOrEqual(available - 1);
    await userEvent.click(canvas.getByRole("button", { name: "Expand preview" }));
    expect(canvas.getByRole("button", { name: "Compact preview" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    await waitFor(() =>
      expect(frame.getBoundingClientRect().height).toBeGreaterThanOrEqual(initialHeight),
    );
    await userEvent.click(canvas.getByRole("button", { name: "Compact preview" }));
    await waitFor(() => expect(frame.getBoundingClientRect().height).toBeCloseTo(initialHeight, 0));
    await userEvent.click(canvas.getByRole("button", { name: "Expand preview" }));
    await userEvent.click(canvas.getByRole("radio", { name: "With Error" }));
    const nextFrame = canvas.getByTitle("Input — With Error live example") as HTMLIFrameElement;
    await new Promise<void>((resolve) => {
      nextFrame.addEventListener("load", () => resolve(), { once: true });
      nextFrame.dataset.previewSrc = "about:blank";
      nextFrame.src = "about:blank";
    });
    const doc = nextFrame.contentDocument;
    if (!doc?.body) throw new Error("Missing loaded-state fixture");
    doc.body.style.margin = "0";
    doc.body.innerHTML = '<div id="storybook-root"><span>Loaded input fixture</span></div>';
    await waitFor(() =>
      expect(canvas.getByRole("button", { name: "Expand preview" })).toHaveAttribute(
        "aria-expanded",
        "false",
      ),
    );
    await waitFor(() =>
      expect(
        canvas.getByTitle("Input — With Error live example").getBoundingClientRect().height,
      ).toBeGreaterThanOrEqual(96),
    );
  },
};

export const AdaptivePreview: Story = {
  args: { componentId: "badge" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const frame = canvas.getByTitle("Badge — Default live example") as HTMLIFrameElement;
    const initialHeight = frame.getBoundingClientRect().height;
    expect(initialHeight).toBeGreaterThanOrEqual(96);
    await new Promise<void>((resolve) => {
      frame.addEventListener("load", () => resolve(), { once: true });
      frame.dataset.previewSrc = "about:blank";
      frame.src = "about:blank";
    });
    const doc = frame.contentDocument;
    if (!doc?.body) throw new Error("Preview document unavailable");
    doc.body.style.margin = "0";
    doc.body.style.padding = "16px";
    const root = doc.createElement("div");
    root.id = "storybook-root";
    root.style.height = "410px";
    doc.body.replaceChildren(root);
    await waitFor(() => expect(frame.getBoundingClientRect().height).toBeGreaterThanOrEqual(442));
    root.style.height = "40px";
    await waitFor(() => expect(frame.getBoundingClientRect().height).toBeCloseTo(initialHeight, 0));
    await userEvent.click(canvas.getByRole("button", { name: "Expand preview" }));
    await waitFor(() =>
      expect(frame.getBoundingClientRect().height).toBeGreaterThanOrEqual(
        Math.min(480, innerHeight * 0.6) - 0.5,
      ),
    );
    root.style.height = "610px";
    await waitFor(() => expect(frame.getBoundingClientRect().height).toBeGreaterThanOrEqual(642));
    await userEvent.click(canvas.getByRole("button", { name: "Compact preview" }));
    expect(frame.getBoundingClientRect().height).toBeGreaterThanOrEqual(642);
  },
};

export const WorkingCode: Story = {
  args: { componentId: "input" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const editor = () => canvas.getByRole("textbox", { name: "Component code" });
    const original = Object.getOwnPropertyDescriptor(navigator, "clipboard");
    let copied = "";
    try {
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: {
          writeText: async (value: string) => {
            copied = value;
          },
        },
      });
      expect(editor()).toBeVisible();
      const panel = canvasElement.querySelector(".catalog-editor-panel");
      if (!panel) throw new Error("Missing code editor");
      await waitFor(() => expect(panel.querySelector('[data-syntax="tag"]')).not.toBeNull());
      expect((editor() as HTMLTextAreaElement).value).toContain("<Input");
      expect((editor() as HTMLTextAreaElement).value).toContain('from "@kb.ui/react"');
      expect(canvas.queryByRole("button", { name: "Include setup" })).toBeNull();
      expect(canvas.queryByRole("status", { name: "Editor notification" })).toBeNull();
      await userEvent.click(canvas.getByRole("button", { name: "Copy code" }));
      expect(copied).toBe((editor() as HTMLTextAreaElement).value);
      expect(canvas.getByRole("status", { name: "Editor notification" })).toHaveTextContent(
        "Copied code",
      );
      await userEvent.click(canvas.getByRole("radio", { name: "With Error" }));
      expect((editor() as HTMLTextAreaElement).value).toContain("Email is required.");
      expect(canvas.queryByRole("status", { name: "Editor notification" })).toBeNull();
      await userEvent.click(canvas.getByRole("button", { name: "Copy code" }));
      expect(copied).toBe((editor() as HTMLTextAreaElement).value);
      await userEvent.click(canvas.getByRole("radio", { name: "With Description" }));
      expect((editor() as HTMLTextAreaElement).value).toContain("We never share it.");
      expect((editor() as HTMLTextAreaElement).value).not.toContain("Email is required.");
      expect(canvas.queryByRole("status", { name: "Editor notification" })).toBeNull();
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: {
          writeText: async () => {
            throw new Error("Permission denied");
          },
        },
      });
      const copy = canvas.getByRole("button", { name: "Copy code" });
      await userEvent.click(copy);
      expect(canvas.getByRole("status", { name: "Editor notification" })).toHaveTextContent(
        "Copy unavailable. Select the code to copy.",
      );
      expect(editor()).toBeVisible();
      expect(copy).toHaveFocus();
    } finally {
      if (original) Object.defineProperty(navigator, "clipboard", original);
      else Reflect.deleteProperty(navigator, "clipboard");
    }
  },
};

export const LongCode: Story = {
  args: { componentId: "panel", stateId: "components-panel--compact" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const editor = canvas.getByRole("textbox", { name: "Component code" }) as HTMLTextAreaElement;
    fireEvent.change(editor, {
      target: {
        value: `${editor.value}\n${Array.from({ length: 80 }, (_, i) => `// Long draft line ${i}`).join("\n")}`,
      },
    });
    expect(editor.scrollHeight).toBeGreaterThan(editor.clientHeight);
    expect(editor.scrollWidth).toBeLessThanOrEqual(editor.clientWidth + 1);
    editor.scrollTop = editor.scrollHeight;
    editor.dispatchEvent(new Event("scroll", { bubbles: true }));
    expect(editor.scrollTop).toBeGreaterThan(0);
    expect(editor.parentElement?.querySelector("pre")?.scrollTop).toBe(editor.scrollTop);
    await userEvent.click(canvas.getByRole("radio", { name: "Depth" }));
    const next = canvas.getByRole("textbox", { name: "Component code" });
    expect(next).toBeVisible();
    expect(next.scrollTop).toBe(0);
    expect((next as HTMLTextAreaElement).value).not.toContain("Long draft line");
    expect(next.scrollWidth).toBeLessThanOrEqual(next.clientWidth + 1);
    await userEvent.click(canvas.getByRole("radio", { name: "Compact" }));
    expect(
      (canvas.getByRole("textbox", { name: "Component code" }) as HTMLTextAreaElement).value,
    ).toContain("// Long draft line 79");
  },
};

export const FocusedDetails: Story = {
  args: { componentId: "badge", stateId: "components-badge--tones" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.queryByRole("heading", { name: "Accessibility" })).toBeNull();
    expect(canvas.getByRole("heading", { name: "The details you need." })).toBeVisible();
    expect(canvas.getByRole("link", { name: "Full Badge API" })).toHaveAttribute(
      "href",
      "./?path=/docs/components-badge--docs",
    );
  },
};

export const StateContinuity: Story = {
  args: { componentId: "badge", storybookRoot: "about:blank#" },
  render: (args) => <Catalog key="state-continuity" {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const frame = canvas.getByTitle("Badge — Default live example") as HTMLIFrameElement;
    const stage = frame.parentElement;
    const entrance = canvasElement.querySelector(".catalog-live")?.getAnimations()[0];
    await new Promise<void>((resolve) => {
      frame.addEventListener("load", () => resolve(), { once: true });
      frame.dataset.previewSrc = "about:blank";
      frame.src = "about:blank";
    });
    const doc = frame.contentDocument;
    if (!doc?.body) throw new Error("Missing sizing fixture");
    doc.body.style.margin = "0";
    doc.body.style.padding = "16px";
    const root = doc.createElement("div");
    root.id = "storybook-root";
    root.style.height = "410px";
    root.textContent = "Tall sizing fixture";
    doc.body.replaceChildren(root);
    await waitFor(() => expect(frame.getBoundingClientRect().height).toBeGreaterThanOrEqual(442));
    if (entrance) await entrance.finished;
    const codeBar = canvasElement.querySelector(".catalog-editor-panel");
    if (!codeBar) throw new Error("Missing code toolbar");
    const codeTop = codeBar.getBoundingClientRect().top + window.scrollY;
    await userEvent.click(canvas.getByRole("radio", { name: "Colors" }));
    // Focus may scroll page; document position still must stay fixed.
    expect(codeBar.getBoundingClientRect().top + window.scrollY).toBe(codeTop);
    const next = canvas.getByTitle("Badge — Colors live example") as HTMLIFrameElement;
    expect(next.parentElement).toBe(stage);
    expect(frame).toHaveAttribute("data-visible", "true");
    expect(frame.getBoundingClientRect().height).toBeGreaterThan(400);
    expect(next).toHaveAttribute("data-visible", "false");
    expect(next).toHaveAttribute("inert");
    expect(canvasElement.querySelector(".catalog-live")?.getAnimations()[0]).toBe(entrance);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    expect(getComputedStyle(next).transitionDuration).toContain(reduced ? "0s" : "0.2s");
    await userEvent.click(canvas.getByRole("button", { name: "Expand preview" }));
    await new Promise<void>((resolve) => {
      next.addEventListener("load", () => resolve(), { once: true });
      next.dataset.previewSrc = "about:blank";
      next.src = "about:blank";
    });
    const incoming = next.contentDocument;
    if (!incoming?.body) throw new Error("Missing next-state fixture");
    incoming.body.innerHTML = '<div id="storybook-root"><span>New state ready</span></div>';
    await waitFor(() => expect(next).toHaveAttribute("aria-busy", "false"));
    expect(canvas.getByRole("button", { name: "Compact preview" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    await waitFor(() =>
      expect(next.getBoundingClientRect().height).toBeGreaterThanOrEqual(
        Math.min(480, innerHeight * 0.6) - 0.5,
      ),
    );
  },
};

export const DefaultDesign: Story = {
  args: { componentId: "input" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const frame = canvasElement.querySelector('iframe[data-current="true"]');
    expect(frame).not.toBeNull();
    await userEvent.click(canvas.getByLabelText("Dark mode"));
    expect(canvasElement.querySelector('iframe[data-current="true"]')).toBe(frame);
    expect(frame).toHaveAttribute("data-preview-theme", "dark");
    expect(canvas.queryByRole("button", { name: "Site skin" })).toBeNull();
    expect(canvas.queryByRole("radiogroup", { name: "Catalog view" })).toBeNull();
    expect(canvas.queryByRole("link", { name: "Component QA" })).toBeNull();
    expect(canvas.getByRole("link", { name: "All components" })).toHaveAttribute(
      "href",
      "./?theme=dark",
    );
  },
};

export const DarkReview: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const documentTheme = document.documentElement.dataset.theme;
    const shell = canvasElement.querySelector(".kbui-catalog");
    await userEvent.click(canvas.getByLabelText("Dark mode"));
    expect(shell).toHaveAttribute("data-theme", "dark");
    expect(document.documentElement.dataset.theme).toBe(documentTheme);
    await userEvent.click(canvas.getByText("Typography and theme foundations", { exact: true }));
    const specimen = canvas.getByRole("region", { name: "Typography and surfaces" });
    expect(specimen).toBeVisible();
    const body = within(specimen).getByText(/Good interfaces make room/);
    const style = getComputedStyle(body);
    expect(Number.parseFloat(style.fontSize)).toBeGreaterThanOrEqual(15);
    expect(
      Number.parseFloat(style.lineHeight) / Number.parseFloat(style.fontSize),
    ).toBeGreaterThanOrEqual(1.5);
    expect(
      Number.parseFloat(
        getComputedStyle(within(specimen).getByText("Helpful context stays easy to read."))
          .fontSize,
      ),
    ).toBeGreaterThanOrEqual(13);
    expect(
      Number.parseFloat(getComputedStyle(within(specimen).getByText("RUN-1048")).fontSize),
    ).toBeGreaterThanOrEqual(13);
    expect(shell).toHaveAttribute("data-theme", "dark");
    await userEvent.click(canvas.getByLabelText("Dark mode"));
    expect(shell).toHaveAttribute("data-theme", "light");
    expect(document.documentElement.dataset.theme).toBe(documentTheme);
    await userEvent.click(canvas.getByLabelText("Dark mode"));
  },
};

export const DarkDetail: Story = {
  args: {
    componentId: "input",
    stateId: "components-input--with-error",
    initialAppearance: { theme: "dark" },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvasElement.querySelector(".kbui-catalog")).toHaveAttribute("data-theme", "dark");
    expect(canvas.getByRole("textbox", { name: "Component code" })).toBeVisible();
    expect(canvas.getByRole("table", { name: "Input API" })).toBeVisible();
    expect(canvas.getByRole("button", { name: "Copy code" })).toBeEnabled();
  },
};

export const LiveCatalogEntrance: Story = {
  play: async ({ canvasElement }) => {
    const stage = canvasElement.querySelector(".catalog-browser");
    if (!stage) throw new Error("Missing live catalog");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    expect(getComputedStyle(stage).animationName).toBe(reduced ? "none" : "kbui-poster-arrive");
    expect(getComputedStyle(stage).transform).toBe("none");
  },
};

export const FullPageCatalog: Story = {
  args: { initialAppearance: { theme: "light" }, componentId: null },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.queryByRole("radiogroup", { name: "Catalog view" })).toBeNull();
    const navigation = within(canvas.getByRole("navigation", { name: "Browse components" }));
    for (const [name, id] of [
      ["NumberField", "numberfield"],
      ["FileInput", "fileinput"],
    ] as const)
      expect(navigation.getByRole("link", { name })).toHaveAttribute(
        "href",
        expect.stringContaining(`component=${id}`),
      );
    const input = navigation.getByRole("link", { name: "Input" });
    expect(input).toHaveAccessibleDescription(
      /Collect text with a clear label, help text, and error feedback.*5 examples/,
    );
    const summary = input.closest(".catalog-component-item");
    if (!summary) throw new Error("Missing component summary");
    expect(
      within(summary as HTMLElement).getByText(
        "Collect text with a clear label, help text, and error feedback.",
      ),
    ).toBeVisible();
    expect(within(summary as HTMLElement).getByText("5 examples")).toBeVisible();
    expect(canvasElement.querySelectorAll("iframe")).toHaveLength(0);
    expect(canvas.queryByRole("link", { name: "Component QA" })).toBeNull();
    const list = canvas.getByRole("navigation", { name: "Browse components" });
    expect(list.scrollHeight).toBeLessThanOrEqual(list.clientHeight + 1);
  },
};

export const ComponentDetails: Story = {
  args: { componentId: "input" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.queryByRole("navigation", { name: "Browse components" })).toBeNull();
    expect(canvas.queryByRole("searchbox", { name: "Search components" })).toBeNull();
    expect(canvas.queryByRole("link", { name: "Component QA" })).toBeNull();
    expect(canvas.getByRole("heading", { level: 1, name: "Input in use." })).toBeVisible();
    expect(canvas.getByRole("link", { name: "All components" })).toHaveAttribute("href", "./");
    expect(canvas.getByRole("radio", { name: "With Error" })).toBeVisible();
    expect(canvas.getByRole("textbox", { name: "Component code" })).toBeEnabled();
  },
};
