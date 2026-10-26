import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Catalog } from "../site/Catalog";

const meta = {
  title: "Site/Catalog",
  component: Catalog,
  args: { siteRoot: "../", storybookRoot: "./" },
  parameters: { layout: "fullscreen" },
  afterEach: async ({ canvasElement }) => {
    expect(canvasElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
  },
} satisfies Meta<typeof Catalog>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Directory: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const heading = canvasElement.querySelector(".page-heading");
    const panel = canvasElement.querySelector(".catalog-grid");
    if (!heading || !panel) throw new Error("Missing catalog entrance surfaces");
    expect(getComputedStyle(heading).animationName).toBe(reduced ? "none" : "kbui-poster-rise");
    expect(getComputedStyle(panel).animationName).toBe(reduced ? "none" : "kbui-poster-arrive");
    expect(canvas.getByRole("status", { name: "Catalog results" })).toHaveTextContent("16 of 16");
    await userEvent.click(canvas.getByRole("button", { name: "Forms" }));
    expect(canvas.getByRole("status", { name: "Catalog results" })).toHaveTextContent("2 of 16");
    expect(canvas.getByRole("link", { name: /Input.*Labelled fields/ })).toHaveAttribute(
      "href",
      "./?component=input",
    );
    await userEvent.type(
      canvas.getByRole("searchbox", { name: "Search components" }),
      "no-such-component",
    );
    expect(
      canvas.getByText("No components found. Try another name or clear the filters."),
    ).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Clear filters" }));
    expect(canvas.getByRole("searchbox", { name: "Search components" })).toHaveFocus();
    expect(canvas.getByRole("status", { name: "Catalog results" })).toHaveTextContent("16 of 16");
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
    await userEvent.click(canvas.getByRole("button", { name: "Disabled" }));
    expect(canvas.getByRole("button", { name: "Disabled" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(canvas.queryByRole("combobox")).not.toBeInTheDocument();
    await userEvent.click(canvas.getByText("Change component", { exact: true }));
    expect(canvas.getByRole("link", { name: "Input" })).toHaveAttribute(
      "href",
      "./?component=input",
    );
    expect(canvas.getByTitle("Button — Disabled live example")).toHaveAttribute(
      "data-preview-src",
      "./iframe.html?id=components-button--disabled&viewMode=story&globals=previewTheme:light",
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
    expect(frame.getBoundingClientRect().height).toBeLessThanOrEqual(220);
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
      expect(frame.getBoundingClientRect().height).toBeCloseTo(Math.min(480, innerHeight * 0.6), 0),
    );
    await userEvent.click(canvas.getByRole("button", { name: "Compact preview" }));
    await waitFor(() => expect(frame.getBoundingClientRect().height).toBeLessThanOrEqual(220));
    await userEvent.click(canvas.getByRole("button", { name: "Expand preview" }));
    await userEvent.click(canvas.getByRole("button", { name: "With Error" }));
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
      ).toBeLessThanOrEqual(220),
    );
  },
};

export const AdaptivePreview: Story = {
  args: { componentId: "badge" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const frame = canvas.getByTitle("Badge — Default live example") as HTMLIFrameElement;
    expect(frame.getBoundingClientRect().height).toBeLessThanOrEqual(160);
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
    await waitFor(() => expect(frame.getBoundingClientRect().height).toBe(442));
    root.style.height = "40px";
    await waitFor(() => expect(frame.getBoundingClientRect().height).toBeLessThanOrEqual(160));
    await userEvent.click(canvas.getByRole("button", { name: "Expand preview" }));
    await waitFor(() =>
      expect(frame.getBoundingClientRect().height).toBeCloseTo(Math.min(480, innerHeight * 0.6), 0),
    );
    root.style.height = "610px";
    await waitFor(() => expect(frame.getBoundingClientRect().height).toBe(642));
    await userEvent.click(canvas.getByRole("button", { name: "Compact preview" }));
    expect(frame.getBoundingClientRect().height).toBe(642);
  },
};

export const WorkingCode: Story = {
  args: { componentId: "input" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
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
      await userEvent.click(canvas.getByRole("button", { name: "View code" }));
      const code = canvas.getByRole("region", { name: "Example code" });
      expect(code).toBeVisible();
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      expect(getComputedStyle(code).animationName).toBe(reduced ? "none" : "kbui-code-reveal");
      expect(getComputedStyle(code).transitionDuration).toBe(reduced ? "0s" : "0.2s");
      const ink = code.querySelector("code");
      if (!ink) throw new Error("Missing code ink");
      expect(getComputedStyle(ink).animationName).toBe(reduced ? "none" : "kbui-ink-update");
      expect(
        getComputedStyle(canvas.getByRole("button", { name: "Copy code" })).transitionDuration,
      ).toBe(reduced ? "0s" : "0.14s");
      expect(code.querySelector('[data-syntax="tag"]')).not.toBeNull();
      expect(code.querySelector('[data-syntax="string"]')).not.toBeNull();
      expect(code).toHaveTextContent("<Input");
      expect(code).not.toHaveTextContent("useEffect");
      expect(canvas.queryByRole("button", { name: "Include setup" })).toBeNull();
      expect(code).toHaveTextContent('import { Input } from "@kbui/react"');
      expect(code).not.toHaveTextContent("document.documentElement");
      await userEvent.click(canvas.getByRole("button", { name: "Copy code" }));
      expect(copied).toBe(code.textContent);
      await userEvent.click(canvas.getByRole("button", { name: "With Error" }));
      expect(code).toBeVisible();
      expect(code).toHaveTextContent("Email is required.");
      await userEvent.click(canvas.getByRole("button", { name: "Copy code" }));
      expect(copied).toBe(code.textContent);
      expect(canvas.getByRole("button", { name: "Copied" })).toBeVisible();
      await userEvent.click(canvas.getByRole("button", { name: "With Description" }));
      expect(canvas.queryByRole("button", { name: "Copied" })).not.toBeInTheDocument();
      expect(code).toHaveTextContent("We never share it.");
      expect(code).not.toHaveTextContent("Email is required.");
      await userEvent.click(canvas.getByRole("button", { name: "With Error" }));
      expect(canvas.queryByRole("button", { name: "Copied" })).not.toBeInTheDocument();
      await userEvent.click(canvas.getByRole("button", { name: "With Description" }));
      await userEvent.click(canvas.getByRole("button", { name: "View code" }));
      expect(code).not.toBeVisible();
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: {
          writeText: async () => {
            throw new Error("Permission denied");
          },
        },
      });
      await userEvent.click(canvas.getByRole("button", { name: "Copy code" }));
      expect(canvas.getByText("Copy unavailable. Select the code below to copy.")).toHaveAttribute(
        "role",
        "status",
      );
      expect(canvas.getByRole("button", { name: "Copy failed" })).toBeVisible();
      expect(code).toBeVisible();
      expect(code).toHaveFocus();
    } finally {
      if (original) Object.defineProperty(navigator, "clipboard", original);
      else Reflect.deleteProperty(navigator, "clipboard");
    }
  },
};

export const LongCode: Story = {
  args: { componentId: "panel", stateId: "components-panel--token-overrides" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "View code" }));
    const code = canvas.getByRole("region", { name: "Example code" });
    const source = code.textContent;
    expect(code.scrollHeight).toBeGreaterThan(code.clientHeight);
    expect(code.scrollWidth).toBeLessThanOrEqual(code.clientWidth + 1);
    expect(canvas.queryByRole("button", { name: "Wrap lines" })).toBeNull();
    const toggle = canvas.getByRole("button", { name: "View code" });
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(toggle).toHaveAttribute("aria-controls", code.id);
    toggle.focus();
    await userEvent.keyboard("{Enter}");
    expect(code).not.toBeVisible();
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(toggle).toHaveFocus();
    await userEvent.keyboard(" ");
    expect(code).toBeVisible();
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(code.textContent).toBe(source);
    expect(code.scrollWidth).toBeLessThanOrEqual(code.clientWidth + 1);
    code.focus();
    expect(code).toHaveFocus();
    code.scrollTop = code.scrollHeight;
    expect(code.scrollTop).toBeGreaterThan(0);
    await userEvent.click(canvas.getByRole("button", { name: "Token Overrides Light" }));
    expect(code).toBeVisible();
    await waitFor(() => expect(code.scrollTop).toBe(0));
    expect(code.scrollWidth).toBeLessThanOrEqual(code.clientWidth + 1);
    await userEvent.click(canvas.getByRole("button", { name: /^Compact$/ }));
    expect(code).toBeVisible();
    expect(code.scrollTop).toBe(0);
    await waitFor(() =>
      expect(code.clientHeight).toBeLessThanOrEqual(code.querySelector("pre")?.clientHeight ?? 0),
    );
    expect(code.scrollWidth).toBeLessThanOrEqual(code.clientWidth + 1);
  },
};

export const FocusedDetails: Story = {
  args: { componentId: "badge", stateId: "components-badge--tones" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.queryByRole("heading", { name: "Accessibility" })).toBeNull();
    expect(canvas.getByRole("heading", { name: "API at a glance." })).toBeVisible();
    expect(canvas.getByRole("link", { name: "Full Badge API" })).toHaveAttribute(
      "href",
      "./?path=/docs/components-badge--docs",
    );
  },
};

export const StateContinuity: Story = {
  args: { componentId: "badge" },
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
    await waitFor(() => expect(frame.getBoundingClientRect().height).toBe(442));
    const codeTop = canvasElement.querySelector(".example-code-bar")?.getBoundingClientRect().top;
    await userEvent.click(canvas.getByRole("button", { name: "Tones" }));
    expect(canvasElement.querySelector(".example-code-bar")?.getBoundingClientRect().top).toBe(
      codeTop,
    );
    const next = canvas.getByTitle("Badge — Tones live example") as HTMLIFrameElement;
    expect(next.parentElement).toBe(stage);
    expect(next.getBoundingClientRect().height).toBeGreaterThan(400);
    expect(canvasElement.querySelector(".catalog-live")?.getAnimations()[0]).toBe(entrance);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    expect(getComputedStyle(next).transitionDuration).toContain(reduced ? "0s" : "0.2s");
    await userEvent.click(canvas.getByRole("button", { name: "Expand preview" }));
    await new Promise<void>((resolve) => {
      frame.addEventListener("load", () => resolve(), { once: true });
      frame.dataset.previewSrc = "about:blank";
      frame.src = "about:blank";
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
      expect(next.getBoundingClientRect().height).toBeCloseTo(Math.min(480, innerHeight * 0.6), 0),
    );
  },
};

export const DefaultDesign: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Dark mode" }));
    await userEvent.click(canvas.getByRole("button", { name: "Live catalog" }));
    expect(
      canvas.getByRole("link", { name: "Open Button example in Storybook ↗" }),
    ).toHaveAttribute("href", "./?path=/story/components-button--primary&globals=theme:dark");
    const frames = canvasElement.querySelectorAll("iframe");
    expect(frames).toHaveLength(16);
    for (const frame of frames) {
      expect(frame.src).toContain("globals=previewTheme:dark");
      expect(frame.src).toContain("&embed=true");
    }
    expect(canvas.getByRole("link", { name: "Button API and code" })).toHaveAttribute(
      "href",
      "./?component=button&theme=dark&view=live",
    );
    await userEvent.click(canvas.getByRole("combobox", { name: "Button example" }));
    const choices = await within(document.body).findByRole("listbox", { name: "Button example" });
    expect(choices.closest("[data-theme]")).toHaveAttribute("data-theme", "dark");
    const popup = choices.closest(".control-select-popup");
    if (!popup) throw new Error("Missing styled example popup");
    expect(getComputedStyle(popup).backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
    if (matchMedia("(forced-colors: active)").matches)
      expect(getComputedStyle(popup).borderTopWidth).toBe("1px");
    else expect(getComputedStyle(popup).boxShadow).not.toBe("none");
    await userEvent.click(within(choices).getByRole("option", { name: "Disabled" }));
    await waitFor(() => expect(within(document.body).queryByRole("listbox")).toBeNull());
    expect(canvas.getByTitle("Button — Disabled live example")).toHaveAttribute(
      "data-preview-src",
      "./iframe.html?id=components-button--disabled&viewMode=story&globals=previewTheme:dark&embed=true",
    );
    await userEvent.click(canvas.getByRole("button", { name: "Forms" }));
    expect(canvasElement.querySelectorAll("iframe")).toHaveLength(2);
    expect(canvas.getByTitle("Input — Default live example")).toBeInTheDocument();
    const inputFrame = canvas.getByTitle("Input — Default live example");
    await userEvent.click(canvas.getByRole("button", { name: "Dark mode" }));
    expect(canvas.getByTitle("Input — Default live example")).toBe(inputFrame);
    expect(canvas.queryByRole("button", { name: "Site skin" })).toBeNull();
    expect(canvas.queryByRole("button", { name: "Current default" })).toBeNull();
  },
};

export const DarkReview: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const documentTheme = document.documentElement.dataset.theme;
    const shell = canvasElement.querySelector(".kbui-catalog");
    await userEvent.click(canvas.getByRole("button", { name: "Dark mode" }));
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
    await userEvent.click(canvas.getByRole("button", { name: "Dark mode" }));
    expect(shell).toHaveAttribute("data-theme", "light");
    expect(document.documentElement.dataset.theme).toBe(documentTheme);
    await userEvent.click(canvas.getByRole("button", { name: "Dark mode" }));
  },
};

export const DarkDetail: Story = {
  args: {
    componentId: "input",
    stateId: "components-input--with-error",
    initialAppearance: { theme: "dark", live: false },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvasElement.querySelector(".kbui-catalog")).toHaveAttribute("data-theme", "dark");
    await userEvent.click(canvas.getByRole("button", { name: "View code" }));
    expect(canvas.getByRole("region", { name: "Example code" })).toBeVisible();
    expect(canvas.getByRole("table", { name: "Input API" })).toBeVisible();
    expect(canvas.getByRole("button", { name: "Copy code" })).toBeEnabled();
  },
};

export const LiveCatalogEntrance: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Live catalog" }));
    const stage = canvasElement.querySelector(".catalog-specimens");
    if (!stage) throw new Error("Missing live catalog");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    expect(getComputedStyle(stage).animationName).toBe(reduced ? "none" : "kbui-poster-arrive");
    expect(getComputedStyle(stage).transform).toBe("none");
  },
};
