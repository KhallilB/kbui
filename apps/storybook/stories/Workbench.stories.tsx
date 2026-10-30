import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Workbench } from "../site/Workbench";

const meta = {
  title: "Site/Workbench",
  component: Workbench,
  args: { storybookRoot: "./" },
  afterEach: async ({ canvasElement }) => {
    expect(canvasElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
  },
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof Workbench>;
export default meta;
type Story = StoryObj<typeof meta>;

export const ThemedDiscovery: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole("link", {
      name: /Dialog.*Make a change without leaving the page/i,
    });
    await userEvent.click(canvas.getByRole("switch", { name: "Dark mode" }));
    expect(link).toHaveAttribute("href", "../components/?component=dialog&theme=dark");
    expect(canvas.getAllByRole("main")).toHaveLength(1);
    expect(canvas.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  },
};

export const Playground: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const heading = canvasElement.querySelector(".page-heading");
    const panel = canvasElement.querySelector(".playground-section");
    if (!heading || !panel) throw new Error("Missing playground entrance surfaces");
    expect(getComputedStyle(heading).animationName).toBe(reduced ? "none" : "kbui-poster-rise");
    expect(getComputedStyle(panel).animationName).toBe(reduced ? "none" : "kbui-poster-arrive");
    const themes = within(canvas.getByRole("radiogroup", { name: "Preview theme" }));
    expect(themes.getByRole("radio", { name: "Light" })).toBeChecked();

    const systemBackground = window.matchMedia("(forced-colors: active)").matches
      ? getComputedStyle(canvas.getByRole("main")).backgroundColor
      : undefined;
    const preview = canvas.getByTestId("playground-preview");
    const previewHeight = preview.getBoundingClientRect().height;
    const entranceAnimation = () =>
      panel
        .getAnimations()
        .find(
          (animation) =>
            "animationName" in animation && animation.animationName === "kbui-poster-arrive",
        );
    const entrance = entranceAnimation();
    if (!reduced) expect(entrance).toBeDefined();
    expect(getComputedStyle(preview).transitionDuration).toContain(reduced ? "0s" : "0.22s");
    expect(canvas.getByTestId("playground-preview")).toHaveAttribute("data-theme", "light");
    if (window.innerWidth <= 800)
      expect(
        canvas.getByTestId("playground-preview").getBoundingClientRect().height,
      ).toBeLessThanOrEqual(240);
    expect(canvas.getByTestId("working-code").querySelector('[data-syntax="tag"]')).not.toBeNull();
    expect(canvas.getByTestId("working-code")).toHaveTextContent(
      'import { Button } from "@kb.ui/react"',
    );
    expect(canvas.queryByRole("button", { name: "Include setup" })).toBeNull();
    await userEvent.click(canvas.getByRole("combobox", { name: "Variant" }));
    await userEvent.click(await within(document.body).findByRole("option", { name: "Danger" }));
    expect(canvas.getByRole("button", { name: "Save changes" })).toHaveAttribute(
      "data-variant",
      "danger",
    );
    expect(canvas.getByTestId("working-code")).toHaveTextContent('variant="danger"');
    await userEvent.click(canvas.getByLabelText("Disabled"));
    expect(canvas.getByRole("button", { name: "Save changes" })).toBeDisabled();
    await userEvent.click(canvas.getByRole("combobox", { name: "Size" }));
    await userEvent.click(await within(document.body).findByRole("option", { name: "Large" }));
    expect(canvas.getByTestId("working-code")).toHaveTextContent('size="lg" disabled');
    expect(preview.getBoundingClientRect().height).toBeCloseTo(previewHeight, 0);
    expect(entranceAnimation()).toBe(entrance);
    await userEvent.click(themes.getByRole("radio", { name: "Dark" }));
    expect(themes.getByRole("radio", { name: "Dark" })).toBeChecked();
    expect(canvas.getByTestId("playground-preview")).toHaveAttribute("data-theme", "dark");
    expect(canvas.getByTestId("working-code")).toHaveTextContent('data-theme="dark"');
    await waitFor(() =>
      expect(canvas.getByTestId("playground-preview")).toHaveStyle({
        backgroundColor: systemBackground ?? "rgb(23, 25, 29)",
      }),
    );
    await userEvent.keyboard("{ArrowRight}");
    const light = themes.getByRole("radio", { name: "Light" });
    expect(light).toBeChecked();
    expect(light).toHaveFocus();
    const selected = light.closest("label");
    if (!selected) throw new Error("Missing selected theme label");
    expect(getComputedStyle(selected).outlineOffset).toBe("-2px");
    if (reduced) expect(getComputedStyle(selected).transitionDuration).toBe("0s");
    expect(canvas.getByTestId("playground-preview")).toHaveAttribute("data-theme", "light");
    expect(canvas.getByTestId("working-code")).not.toHaveTextContent("data-theme");
    await waitFor(() =>
      expect(canvas.getByTestId("playground-preview")).toHaveStyle({
        backgroundColor: systemBackground ?? "rgb(245, 246, 248)",
      }),
    );
    await userEvent.click(canvas.getByLabelText("Reduce motion"));
    expect(canvas.getByTestId("playground-preview")).toHaveAttribute("data-motion", "reduce");
    expect(canvas.getByTestId("working-code")).toHaveTextContent('transition: "none"');
    expect(getComputedStyle(preview).transitionDuration).toBe("0s");
    expect(
      getComputedStyle(canvas.getByTestId("working-code").querySelector("code") as HTMLElement)
        .animationName,
    ).toBe("none");
    await userEvent.click(canvas.getByRole("button", { name: "Reset controls" }));
    expect(canvas.getByRole("combobox", { name: "Variant" })).toHaveTextContent("Primary");
    expect(canvas.getByRole("combobox", { name: "Size" })).toHaveTextContent("Medium");
    expect(canvas.getByLabelText("Disabled")).not.toBeChecked();
    expect(canvas.getByLabelText("Reduce motion")).not.toBeChecked();
    expect(themes.getByRole("radio", { name: "Light" })).toBeChecked();
    expect(canvas.getByTestId("playground-preview")).toHaveAttribute("data-theme", "light");
  },
};
export const PageTheme: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const preview = canvas.getByTestId("playground-preview");
    const button = canvas.getByRole("button", { name: "Save changes" });
    const toggle = canvas.getByRole("switch", { name: "Dark mode" });
    const themes = within(canvas.getByRole("radiogroup", { name: "Preview theme" }));
    await userEvent.click(button);
    await userEvent.click(toggle);
    expect(preview).toHaveAttribute("data-theme", "dark");
    expect(canvas.getByRole("button", { name: "Save changes" })).toBe(button);
    expect(within(preview).getByRole("status")).toHaveTextContent("That worked.");
    await userEvent.click(themes.getByRole("radio", { name: "Light" }));
    await userEvent.click(toggle);
    await userEvent.click(toggle);
    expect(preview).toHaveAttribute("data-theme", "light");
    await userEvent.click(canvas.getByRole("button", { name: "Reset controls" }));
    expect(preview).toHaveAttribute("data-theme", "dark");
    await userEvent.click(toggle);
    expect(preview).toHaveAttribute("data-theme", "light");
  },
};
export const Discovery: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const nav = within(canvas.getByRole("navigation", { name: "Main navigation" }));
    expect(nav.getByRole("link", { name: "Playground" })).toHaveAttribute("aria-current", "page");
    expect(nav.getByRole("link", { name: "Recipes" })).toHaveAttribute("href", "../recipes/");
    expect(nav.queryByRole("link", { name: "Examples" })).toBeNull();
    await userEvent.type(canvas.getByLabelText("Find a component"), "dialog");
    expect(
      canvas.getByRole("link", { name: /Dialog.*Make a change without leaving the page/i }),
    ).toHaveAttribute("href", "../components/?component=dialog");
    expect(canvas.queryByRole("link", { name: /Button.*Actions/i })).toBeNull();
    expect(canvas.getByRole("status", { name: "Component results" })).toHaveTextContent("1 of 6");
    await userEvent.click(canvas.getByRole("button", { name: "Clear search" }));
    expect(canvas.getByLabelText("Find a component")).toHaveFocus();
    expect(canvas.getByRole("status", { name: "Component results" })).toHaveTextContent("6 of 6");
    await userEvent.clear(canvas.getByLabelText("Find a component"));
    await userEvent.type(canvas.getByLabelText("Find a component"), "no-such-component");
    expect(
      canvas.getByText("Nothing here yet. Try another name, or clear your search."),
    ).toBeVisible();
  },
};
export const Clipboard: Story = {
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
      const copy = canvas.getByRole("button", { name: "Copy code" });
      const panel = copy.closest(".example-code");
      if (!(panel instanceof HTMLElement)) throw new Error("Missing code panel");
      const height = panel.getBoundingClientRect().height;
      const width = copy.getBoundingClientRect().width;
      await userEvent.click(copy);
      expect(copied).toContain('<Button variant="primary" size="md">');
      expect(copy).toHaveTextContent("Copied");
      expect(copy.querySelector("svg [data-copy-check]")).not.toBeNull();
      expect(panel.getBoundingClientRect().height).toBe(height);
      expect(copy.getBoundingClientRect().width).toBe(width);
      expect(within(panel).getByRole("status")).toHaveTextContent(
        "Button code copied to clipboard.",
      );
      await waitFor(() => expect(copy).toHaveTextContent("Copy code"), { timeout: 3000 });
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: {
          writeText: async () => {
            throw new Error("Permission denied");
          },
        },
      });
      await userEvent.click(canvas.getByRole("button", { name: "Copy code" }));
      expect(within(panel).getByRole("status")).toHaveTextContent(
        "Copy unavailable. Select the code below to copy.",
      );
      expect(copy).toHaveTextContent("Copy failed");
      await waitFor(() => expect(canvas.getByTestId("working-code")).toHaveFocus());
      expect(panel.getBoundingClientRect().height).toBe(height);
    } finally {
      if (original) Object.defineProperty(navigator, "clipboard", original);
      else Reflect.deleteProperty(navigator, "clipboard");
    }
  },
};

export const DropdownAndFocus: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const variant = canvas.getByRole("combobox", { name: "Variant" });
    await userEvent.click(variant);
    const popup = await within(document.body).findByRole("listbox");
    const surface = popup.closest(".control-select-popup");
    if (!(surface instanceof HTMLElement)) throw new Error("Missing select surface");
    await waitFor(() => {
      expect(popup).toBeVisible();
      expect(
        Math.abs(surface.getBoundingClientRect().width - variant.getBoundingClientRect().width),
      ).toBeLessThanOrEqual(1);
    });
    const bounds = surface.getBoundingClientRect();
    expect(bounds.left).toBeGreaterThanOrEqual(0);
    expect(bounds.right).toBeLessThanOrEqual(window.innerWidth);
    expect(surface.scrollWidth).toBeLessThanOrEqual(surface.clientWidth + 1);
    await userEvent.click(within(popup).getByRole("option", { name: "Danger" }));
    expect(variant).toHaveTextContent("Danger");
    expect(canvas.getByTestId("working-code")).toHaveTextContent('variant="danger"');
    await waitFor(() => expect(variant).toHaveFocus());
    expect(getComputedStyle(variant).outlineStyle).toBe("none");
    await userEvent.keyboard("{Tab}{Shift>}{Tab}{/Shift}");
    expect(variant).toHaveFocus();
    expect(getComputedStyle(variant).outlineWidth).toBe("2px");
    expect(getComputedStyle(variant).outlineOffset).toBe("-2px");
    await userEvent.keyboard("{ArrowDown}");
    const menu = await within(document.body).findByRole("listbox");
    await waitFor(() => expect(menu).toBeVisible());
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(variant).toHaveFocus());
    await waitFor(() => expect(within(document.body).queryByRole("listbox")).toBeNull());
    const size = canvas.getByRole("combobox", { name: "Size" });
    await userEvent.click(size);
    const sizes = await within(document.body).findByRole("listbox");
    await userEvent.click(within(sizes).getByRole("option", { name: "Large" }));
    expect(canvas.getByTestId("working-code")).toHaveTextContent('size="lg"');
    await userEvent.click(canvas.getByRole("button", { name: "Reset controls" }));
    expect(variant).toHaveTextContent("Primary");
    expect(size).toHaveTextContent("Medium");
    await userEvent.click(variant);
    await within(document.body).findByRole("listbox");
    await userEvent.click(canvas.getByRole("button", { name: "Reset controls" }));
    await waitFor(() => expect(within(document.body).queryByRole("listbox")).toBeNull());
    await userEvent.keyboard("{Tab}{Tab}");
    expect(variant).toHaveFocus();
    expect(getComputedStyle(variant).outlineWidth).toBe("2px");
    await userEvent.keyboard("{Tab}");
    const navigation = canvas.getByRole("link", { name: "Playground" });
    navigation.focus();
    expect(getComputedStyle(navigation).outlineWidth).toBe("2px");
    expect(getComputedStyle(navigation).outlineOffset).toBe("2px");
    const search = canvas.getByRole("searchbox", { name: "Find a component" });
    search.focus();
    expect(getComputedStyle(search).outlineWidth).toBe("2px");
    expect(getComputedStyle(search).outlineOffset).toBe("-2px");
    if (!(search.parentElement instanceof HTMLElement)) throw new Error("Missing search field");
    expect(getComputedStyle(search.parentElement).outlineStyle).toBe("none");
  },
};
