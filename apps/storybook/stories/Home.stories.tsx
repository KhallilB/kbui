import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Home } from "../site/Home";

const meta = {
  title: "Site/Home",
  component: Home,
  args: { storybookRoot: "./", siteRoot: "../" },
  parameters: { layout: "fullscreen" },
  afterEach: async ({ canvasElement }) => {
    expect(canvasElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
    const cta = canvasElement.querySelector(".take-it");
    if (!(cta instanceof HTMLElement)) throw new Error("Missing getting-started section");
    const bounds = cta.getBoundingClientRect();
    expect(bounds.left).toBeGreaterThan(0);
    expect(bounds.right).toBeLessThan(window.innerWidth);
  },
} satisfies Meta<typeof Home>;
export default meta;
type Story = StoryObj<typeof meta>;

export const TryTheDemo: Story = {
  play: async ({ canvasElement, globals, parameters }) => {
    const viewport = parameters.viewport.options[globals.viewport?.value];
    if (viewport) expect(window.innerWidth).toBe(Number.parseInt(viewport.styles.width, 10));
    const canvas = within(canvasElement);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const entrance = canvasElement.querySelector(".hero-example");
    if (!entrance) throw new Error("Missing hero composition");
    expect(getComputedStyle(entrance).animationName).toBe(reduced ? "none" : "kbui-poster-arrive");
    const aboutHeading = canvasElement.querySelector(".about-strip > h2");
    const aboutParagraph = canvasElement.querySelector(".about-strip > p");
    if (!aboutHeading || !aboutParagraph) throw new Error("Missing landing copy");
    expect(getComputedStyle(aboutParagraph).animationName).toBe(
      reduced ? "none" : "kbui-fragment-arrive",
    );
    if (!reduced)
      expect(Number.parseFloat(getComputedStyle(aboutParagraph).animationDelay)).toBeGreaterThan(
        Number.parseFloat(getComputedStyle(aboutHeading).animationDelay),
      );
    const assembled = entrance.getAnimations()[0];
    const action = canvas.getByRole("link", { name: /Start building/ });
    expect(getComputedStyle(action).transitionDuration).toBe(reduced ? "0s" : "0.14s");

    await userEvent.click(canvas.getByRole("checkbox", { name: "Coffee and a slow start" }));
    expect(canvas.getByRole("progressbar", { name: "Plans picked" })).toHaveAttribute(
      "aria-valuenow",
      "1",
    );
    expect(entrance.getAnimations()[0]).toBe(assembled);
    expect(canvas.queryByLabelText("Variant")).toBeNull();
    expect(canvas.queryByTestId("working-code")).toBeNull();
    expect(canvas.queryByLabelText("Find a component")).toBeNull();
  },
};
export const Navigation: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByRole("link", { name: /Start building/ })).toHaveAttribute(
      "href",
      "../setup/",
    );
    expect(canvas.getByRole("region", { name: "Install kbui" })).toBeVisible();
    for (const link of canvas
      .getAllByRole("link")
      .filter((item) => item.textContent?.includes("↗"))) {
      const arrow = link.querySelector(".link-arrow");
      expect(arrow).not.toBeNull();
      if (!arrow) throw new Error("Missing isolated link arrow");
      expect(getComputedStyle(arrow).display).not.toBe("inline");
      expect(getComputedStyle(arrow).textDecorationLine).toBe("none");
    }
    expect(canvas.getByRole("link", { name: "Components" })).toHaveAttribute(
      "href",
      "../components/",
    );
    expect(canvas.getByRole("link", { name: /Open the playground/ })).toHaveAttribute(
      "href",
      "../playground/",
    );
    expect(canvas.getByRole("link", { name: /Something to read/ })).toHaveAttribute(
      "href",
      "../examples/#editorial",
    );
    if (window.innerWidth <= 600) {
      const header = within(canvas.getByRole("banner"));
      const footer = within(canvas.getByRole("contentinfo"));
      for (const control of [
        header.getByRole("link", { name: "kbui home" }),
        header.getByRole("link", { name: "Components" }),
        header.getByRole("link", { name: "Playground" }),
        header.getByRole("link", { name: "Examples" }),
        canvas.getByRole("link", { name: "See the components" }),
        canvas.getByRole("link", { name: /Open the playground/ }),
        canvas.getByRole("button", { name: "Rename plan" }),
        canvas.getByRole("button", { name: "Start over" }),
        ...footer.getAllByRole("link"),
      ]) {
        const bounds = control.getBoundingClientRect();
        expect(bounds.height).toBeGreaterThanOrEqual(44);
        expect(bounds.width).toBeGreaterThanOrEqual(44);
      }
    }
  },
};

export const Choreography: Story = {
  play: async ({ canvasElement }) => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const section = canvasElement.querySelector(".take-it");
    const lines = canvasElement.querySelectorAll(".hero-line");
    if (!(section instanceof HTMLElement)) throw new Error("Missing final section");
    expect(lines.length).toBe(2);
    const secondLine = lines[1];
    const title = section.querySelector("h2");
    if (!secondLine || !title) throw new Error("Missing choreographed copy");
    if (!reduced) {
      const firstLine = lines[0];
      if (!firstLine) throw new Error("Missing first headline line");
      const gap =
        Number.parseFloat(getComputedStyle(secondLine).animationDelay) -
        Number.parseFloat(getComputedStyle(firstLine).animationDelay);
      expect(gap).toBeGreaterThan(0);
      expect(gap).toBeLessThanOrEqual(0.06);
      expect(section.dataset.motionPhase).toBe("waiting");
      expect(getComputedStyle(title).animationPlayState).toBe("paused");
    }
    section.scrollIntoView({ block: "center", behavior: "instant" });
    await waitFor(() => expect(section.dataset.motionPhase).toBe("ready"));
    expect(getComputedStyle(title).animationPlayState).toBe("running");
    const entrance = title.getAnimations()[0];
    canvasElement.querySelector(".poster-hero")?.scrollIntoView({ behavior: "instant" });
    section.scrollIntoView({ block: "center", behavior: "instant" });
    expect(title.getAnimations()[0]).toBe(entrance);
    if (reduced) expect(getComputedStyle(title).animationName).toBe("none");
  },
};
