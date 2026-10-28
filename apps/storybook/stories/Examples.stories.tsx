import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Examples } from "../site/Examples";

const meta = {
  title: "Site/Examples",
  component: Examples,
  args: { siteRoot: "../", storybookRoot: "./" },
  parameters: { layout: "fullscreen" },
  afterEach: async ({ canvasElement }) => {
    expect(canvasElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
  },
} satisfies Meta<typeof Examples>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Browse: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const heading = canvasElement.querySelector(".page-heading");
    const panel = canvasElement.querySelector(".example-section");
    if (!heading || !panel) throw new Error("Missing example entrance surfaces");
    expect(getComputedStyle(heading).animationName).toBe(reduced ? "none" : "kbui-poster-rise");
    expect(getComputedStyle(panel).animationName).toBe(reduced ? "none" : "kbui-poster-arrive");
    const shape = canvasElement.querySelector(".geometry-a");
    if (!shape) throw new Error("Missing palette shape");
    expect(getComputedStyle(shape).transitionDuration).toBe(reduced ? "0s" : "0.2s");

    const nav = within(canvas.getByRole("navigation", { name: "Main navigation" }));
    expect(nav.getByRole("link", { name: "Examples" })).toHaveAttribute("aria-current", "page");
    expect(nav.getByRole("link", { name: "Playground" })).toHaveAttribute("href", "../playground/");
    expect(canvas.getByRole("link", { name: /Heading docs/ })).toHaveAttribute(
      "href",
      "./?path=/docs/components-heading--docs",
    );
    expect(canvas.getByRole("progressbar", { name: "Review progress" })).toHaveAttribute(
      "aria-valuenow",
      "0",
    );
    const reset = canvas.getByRole("button", { name: "Reset checklist" });
    expect(reset).toBeDisabled();
    expect(canvas.getByRole("progressbar", { name: "Review progress" })).toHaveAttribute(
      "aria-valuetext",
      "0 of 3 complete",
    );
    expect(canvas.queryByText("Checks remaining")).toBeNull();
    expect(canvas.queryByText("Checks complete", { exact: true })).toBeNull();
    await userEvent.click(canvas.getByRole("checkbox", { name: "Run checkout tests" }));
    expect(canvas.getByRole("progressbar", { name: "Review progress" })).toHaveAttribute(
      "aria-valuenow",
      "33",
    );
    await userEvent.click(canvas.getByRole("checkbox", { name: "Review keyboard navigation" }));
    await userEvent.click(canvas.getByRole("checkbox", { name: "Confirm rollback plan" }));
    expect(canvas.getByRole("progressbar", { name: "Review progress" })).toHaveAttribute(
      "aria-valuenow",
      "100",
    );
    expect(canvas.getByRole("status", { name: "Release checks" })).toHaveTextContent(
      "Ready to publish",
    );
    await userEvent.click(reset);
    expect(canvas.getByRole("progressbar", { name: "Review progress" })).toHaveAttribute(
      "aria-valuenow",
      "0",
    );
    await userEvent.click(canvas.getByRole("button", { name: "Change palette" }));
    expect(canvas.getByRole("status", { name: "Palette" })).toHaveTextContent(
      "Persimmon / Marigold / Lilac · vivid",
    );
  },
};

export const Code: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const creative = within(canvas.getByRole("region", { name: "Campaign preview" }));
    expect(canvas.getAllByRole("button", { name: "Copy code" })).toHaveLength(3);
    await userEvent.click(creative.getByRole("button", { name: "View code" }));
    const code = creative.getByRole("region", { name: "Creative example code" });
    expect(code.querySelector('[data-syntax="keyword"]')).not.toBeNull();
    expect(code).not.toHaveTextContent("useEffect");
    expect(code).toHaveTextContent("useState(false)");
    await userEvent.click(creative.getByRole("button", { name: "Change palette" }));
    expect(code).toHaveTextContent("useState(true)");
    expect(creative.queryByRole("button", { name: "Include setup" })).toBeNull();
    expect(code).toHaveTextContent('from "@kb.ui/react"');
    expect(code).not.toHaveTextContent("<svg");
    expect(code).not.toHaveTextContent(".composition");
    const operations = within(canvas.getByRole("region", { name: "Release checklist" }));
    await userEvent.click(operations.getByRole("button", { name: "View code" }));
    const checklistCode = operations.getByRole("region", { name: "Operations example code" });
    expect(checklistCode).toHaveTextContent("useState([false, false, false])");
    await userEvent.click(operations.getByRole("checkbox", { name: "Run checkout tests" }));
    expect(checklistCode).toHaveTextContent("useState([true, false, false])");
  },
};

export const DarkPage: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("switch", { name: "Dark mode" }));
    expect(canvas.getByRole("main").closest(".kbui-site")).toHaveAttribute("data-theme", "dark");
    for (const card of canvasElement.querySelectorAll(".composition")) {
      expect(card.closest("[data-theme]")).toBe(canvas.getByRole("main").closest(".kbui-site"));
      expect(card).toHaveAttribute("data-appearance", "outlined");
    }
    expect(canvas.getByRole("heading", { name: "Writing a useful bug report." })).toBeVisible();
    expect(canvas.getByRole("button", { name: "Change palette" })).toBeEnabled();
  },
};

export const SimpleExamples: Story = {
  play: async ({ canvasElement }) => {
    const page = within(canvasElement);
    expect(page.queryByRole("button", { name: /Inspect components/ })).toBeNull();
    expect(canvasElement.querySelector("[data-inspected]")).toBeNull();
    expect(canvasElement.querySelector(".component-inspector")).toBeNull();
    expect(page.queryByRole("navigation", { name: "Example navigation" })).toBeNull();
    expect(page.queryByText("On this page")).toBeNull();
    const workspace = within(page.getByRole("region", { name: "Interactive demo" }));
    expect(workspace.getByRole("link", { name: "Explore the workspace" })).toHaveAttribute(
      "href",
      "../compare/",
    );
    expect(canvasElement.querySelectorAll(".composition")).toHaveLength(3);
    expect(page.getByRole("button", { name: "Change palette" })).toBeEnabled();
  },
};

export const ThemeContracts: Story = {
  play: async ({ canvasElement }) => {
    const page = within(canvasElement);
    const root = canvasElement.querySelector(".kbui-site");
    if (!root) throw new Error("Missing site theme root");
    const verify = async () => {
      expect(
        root.querySelectorAll('button:not(.kb-button):not([role="switch"]):not([role="combobox"])'),
        "Site actions must use shared Button; shared field controls keep their own semantics",
      ).toHaveLength(0);
      const controls = [...root.querySelectorAll<HTMLElement>(".kb-button")];
      const host = document.createElement("div");
      host.style.cssText = "position:fixed;left:-10000px;pointer-events:none";
      host.setAttribute("aria-hidden", "true");
      const references = controls.map((control) => {
        const reference = document.createElement(control.tagName.toLowerCase());
        if (control.hasAttribute("href"))
          reference.setAttribute("href", control.getAttribute("href") ?? "");
        reference.className = "kb-button";
        reference.style.transition = "none";
        reference.dataset.variant = control.dataset.variant;
        reference.toggleAttribute("data-disabled", control.hasAttribute("data-disabled"));
        host.append(reference);
        return reference;
      });
      const material = (node: Element) => {
        const style = getComputedStyle(node);
        return [
          style.color,
          style.backgroundColor,
          style.backgroundImage,
          style.borderTopColor,
          style.boxShadow,
        ];
      };
      root.append(host);
      try {
        await waitFor(() => {
          controls.forEach((control, index) => {
            expect(
              material(control),
              `${control.textContent?.trim()} in ${root.getAttribute("data-theme")}`,
            ).toEqual(material(references[index] as Element));
          });
        });
      } finally {
        host.remove();
      }
    };
    await verify();
    await userEvent.click(page.getByRole("switch", { name: "Dark mode" }));
    await verify();
    await userEvent.click(page.getAllByRole("button", { name: "View code" })[0] as HTMLElement);
    await verify();
    await userEvent.click(page.getByRole("switch", { name: "Dark mode" }));
    await verify();
  },
};
