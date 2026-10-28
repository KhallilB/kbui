import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
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
    expect(canvas.getByRole("link", { name: /Explore Heading/ })).toHaveAttribute(
      "href",
      "./?path=/docs/components-heading--docs",
    );
    expect(canvas.getByRole("link", { name: /^Grid$/ })).toHaveAttribute(
      "href",
      "./?path=/docs/layout-grid--docs",
    );
    expect(canvas.getByRole("progressbar", { name: "Release readiness" })).toHaveAttribute(
      "aria-valuenow",
      "0",
    );
    const reset = canvas.getByRole("button", { name: "Reset checklist" });
    expect(reset).toBeDisabled();
    await userEvent.click(canvas.getByRole("checkbox", { name: "Build packages" }));
    expect(canvas.getByRole("progressbar", { name: "Release readiness" })).toHaveAttribute(
      "aria-valuenow",
      "33",
    );
    await userEvent.click(canvas.getByRole("checkbox", { name: "Review accessibility" }));
    await userEvent.click(canvas.getByRole("checkbox", { name: "Verify examples" }));
    expect(canvas.getByRole("progressbar", { name: "Release readiness" })).toHaveAttribute(
      "aria-valuenow",
      "100",
    );
    expect(canvas.getByRole("status", { name: "Release checks" })).toHaveTextContent(
      "Checks complete",
    );
    await userEvent.click(reset);
    expect(canvas.getByRole("progressbar", { name: "Release readiness" })).toHaveAttribute(
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
    const creative = within(canvas.getByRole("region", { name: "A space to play with color" }));
    expect(canvas.getAllByRole("button", { name: "Copy code" })).toHaveLength(3);
    await userEvent.click(creative.getByRole("button", { name: "View code" }));
    const code = creative.getByRole("region", { name: "Creative example code" });
    expect(code.querySelector('[data-syntax="keyword"]')).not.toBeNull();
    expect(code).not.toHaveTextContent("useEffect");
    expect(code).toHaveTextContent("useState(false)");
    await userEvent.click(creative.getByRole("button", { name: "Change palette" }));
    expect(code).toHaveTextContent("useState(true)");
    expect(creative.queryByRole("button", { name: "Include setup" })).toBeNull();
    expect(code).toHaveTextContent('from "@kbui/react"');
    expect(code).not.toHaveTextContent("<svg");
    expect(code).not.toHaveTextContent(".composition");
    const operations = within(canvas.getByRole("region", { name: "A release overview" }));
    await userEvent.click(operations.getByRole("button", { name: "View code" }));
    const checklistCode = operations.getByRole("region", { name: "Operations example code" });
    expect(checklistCode).toHaveTextContent("useState([false, false, false])");
    await userEvent.click(operations.getByRole("checkbox", { name: "Build packages" }));
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
    expect(canvas.getByRole("heading", { name: "Notes from the workshop." })).toBeVisible();
    expect(canvas.getByRole("button", { name: "Change palette" })).toBeEnabled();
  },
};
