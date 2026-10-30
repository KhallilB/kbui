import releases from "virtual:kbui-changelog";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { releaseHeadline } from "../site/changelog-model";
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
    expect(canvas.getByRole("progressbar", { name: "Activities picked" })).toHaveAttribute(
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
    const headerElement = canvas.getByRole("banner");
    const header = within(headerElement);
    const navigation = within(header.getByRole("navigation", { name: "Main navigation" }));
    const links = navigation.getAllByRole("link");
    const theme = header.getByRole("switch", { name: "Dark mode" });
    const controls = [header.getByRole("link", { name: "kbui home" }), ...links, theme];
    const bounds = controls.map((control) => control.getBoundingClientRect());
    for (let index = 0; index < controls.length; index++) {
      const control = controls[index];
      const rect = bounds[index];
      if (!control || !rect) throw new Error("Missing header control");
      expect(rect.left).toBeGreaterThanOrEqual(0);
      expect(rect.right).toBeLessThanOrEqual(innerWidth);
      const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
      expect(hit === control || control.contains(hit)).toBe(true);
      for (const other of bounds.slice(index + 1)) {
        const overlapX = Math.min(rect.right, other.right) - Math.max(rect.left, other.left);
        const overlapY = Math.min(rect.bottom, other.bottom) - Math.max(rect.top, other.top);
        expect(overlapX > 0.5 && overlapY > 0.5).toBe(false);
      }
    }
    for (const link of links) {
      const range = document.createRange();
      range.selectNodeContents(link);
      const text = range.getBoundingClientRect();
      const rect = link.getBoundingClientRect();
      expect(text.left).toBeGreaterThanOrEqual(rect.left - 0.5);
      expect(text.right).toBeLessThanOrEqual(rect.right + 0.5);
    }
    expect(canvas.getByRole("link", { name: /Start building/ })).toHaveClass("kb-button");
    const installer = within(canvas.getByRole("region", { name: "Install kbui" }));
    expect(installer.getByRole("button", { name: "Copy code" })).toHaveClass("kb-button");
    expect(installer.getByRole("button", { name: "View code" })).toHaveClass("kb-button");
    const [latest] = releases;
    if (!latest) throw new Error("Missing latest release");
    const pill = canvas.getByRole("link", { name: /What's new in/ });
    expect(pill).toHaveAccessibleName(
      `What's new in v${latest.version} ${releaseHeadline(latest)}`,
    );
    expect(pill).toHaveAttribute("href", `../changelog/#v${latest.version}`);
    expect(canvas.getByRole("link", { name: /Start building/ })).toHaveAttribute(
      "href",
      "../setup/",
    );
    expect(canvas.getByRole("region", { name: "Install kbui" })).toBeVisible();
    const arrowLinks = canvas
      .getAllByRole("link")
      .filter((item) => item.querySelector(".link-arrow"));
    expect(arrowLinks.length).toBeGreaterThan(0);
    for (const link of arrowLinks) {
      const arrow = link.querySelector(".link-arrow");
      expect(arrow).not.toBeNull();
      expect(arrow).toHaveAttribute("aria-hidden", "true");
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
    expect(canvas.getByRole("link", { name: /A working app/ })).toHaveAttribute(
      "href",
      "../compare/",
    );
    expect(canvas.getByRole("link", { name: /A queue with details/ })).toHaveAttribute(
      "href",
      "../recipes/?recipe=listdetail",
    );
    expect(canvasElement.querySelector('a[href*="examples/"]')).toBeNull();
    if (window.innerWidth <= 600) {
      const footer = within(canvas.getByRole("contentinfo"));
      for (const control of [
        ...controls,
        canvas.getByRole("link", { name: "See the components" }),
        canvas.getByRole("link", { name: /Open the playground/ }),
        canvas.getByRole("button", { name: "Name your day" }),
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

export const StickyNavigation: Story = {
  play: async ({ canvasElement }) => {
    const header = within(canvasElement).getByRole("banner");
    const about = within(canvasElement).getByRole("heading", {
      name: /The parts behind.*your day off/,
    });
    about.scrollIntoView({ block: "start", behavior: "instant" });
    await waitFor(() => expect(header.getBoundingClientRect().top).toBeCloseTo(0, 0));
    const bounds = about.getBoundingClientRect();
    expect(bounds.top).toBeGreaterThanOrEqual(header.getBoundingClientRect().bottom);
    const firstLink = within(header).getByRole("link", { name: "Playground" });
    await userEvent.click(within(header).getByLabelText("Dark mode"));
    expect(firstLink).toBeVisible();
    expect(within(canvasElement).getByRole("link", { name: "See the components" })).toHaveAttribute(
      "href",
      "../components/?theme=dark",
    );
    window.scrollTo({ top: 0, behavior: "instant" });
  },
};
