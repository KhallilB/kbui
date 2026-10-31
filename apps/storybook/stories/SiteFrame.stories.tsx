import { Button, Heading, Text } from "@kb.ui/react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useRef } from "react";
import { expect, userEvent, within } from "storybook/test";
import { SiteFrame, SiteLink } from "../site/SiteFrame";

function Frame({ dark = false }: { dark?: boolean }) {
  const link = useRef<HTMLAnchorElement>(null);
  return (
    <SiteFrame
      current="recipes"
      siteRoot="../"
      storybookRoot="../storybook/"
      {...(dark ? { theme: "dark" } : {})}
    >
      <main id="main" style={{ minHeight: 240, padding: 24 }}>
        <Heading level={1}>Shared site frame</Heading>
        <Text>Navigation and typography retain native semantics.</Text>
        <SiteLink
          ref={link}
          className="caller-link"
          href="../components/?component=input&compare=true#source"
          data-caller="retained"
        >
          Compare input
        </SiteLink>
        <Button nativeButton={false} role="link" render={<SiteLink href="../setup/" />}>
          Install library
        </Button>
      </main>
    </SiteFrame>
  );
}

const meta = {
  title: "Site/Shared frame",
  component: Frame,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof Frame>;
export default meta;
type Story = StoryObj<typeof meta>;

async function geometry(canvasElement: HTMLElement) {
  const canvas = within(canvasElement);
  expect(canvas.getAllByRole("main")).toHaveLength(1);
  expect(canvas.getByRole("heading", { level: 1, name: "Shared site frame" })).toBeVisible();
  expect(canvas.getByRole("link", { name: "Skip to content" })).toHaveAttribute("href", "#main");
  const skip = canvas.getByRole("link", { name: "Skip to content" });
  skip.focus();
  expect(getComputedStyle(skip).color).not.toBe(getComputedStyle(skip).backgroundColor);
  expect(canvasElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
  for (const region of [canvas.getByRole("banner"), canvas.getByRole("contentinfo")]) {
    const controls = within(region)
      .getAllByRole("link")
      .concat(within(region).queryAllByRole("button"), within(region).queryAllByRole("switch"));
    const rectangles = controls.map((control) => control.getBoundingClientRect());
    for (const [index, rect] of rectangles.entries()) {
      expect(rect.left).toBeGreaterThanOrEqual(0);
      expect(rect.right).toBeLessThanOrEqual(window.innerWidth + 0.5);
      for (const other of rectangles.slice(index + 1)) {
        const overlapX = Math.min(rect.right, other.right) - Math.max(rect.left, other.left);
        const overlapY = Math.min(rect.bottom, other.bottom) - Math.max(rect.top, other.top);
        expect(overlapX > 0.5 && overlapY > 0.5).toBe(false);
      }
    }
  }
  expect(
    getComputedStyle(canvas.getByRole("link", { name: "Install library" })).textDecorationLine,
  ).toBe("none");
}

export const StructureAndThemeLinks: Story = {
  play: async ({ canvasElement }) => {
    await geometry(canvasElement);
    const canvas = within(canvasElement);
    const link = canvas.getByRole("link", { name: "Compare input" });
    expect(link).toHaveClass("caller-link");
    expect(link).toHaveAttribute("data-caller", "retained");
    expect(link).toHaveAttribute("href", "../components/?component=input&compare=true#source");
    expect(canvas.getByRole("link", { name: "Recipes" })).toHaveAttribute("aria-current", "page");
    await userEvent.click(canvas.getByRole("switch", { name: "Dark mode" }));
    expect(link).toHaveAttribute(
      "href",
      "../components/?component=input&compare=true&theme=dark#source",
    );
    expect(canvas.getByRole("link", { name: "GitHub" })).toHaveAttribute(
      "href",
      "https://github.com/KhallilB/kbui",
    );
    expect(canvas.getByRole("link", { name: "Documentation" })).toHaveAttribute(
      "href",
      "../storybook/",
    );
    await userEvent.click(canvas.getByRole("button", { name: "Use system theme" }));
    expect(link).toHaveAttribute("href", "../components/?component=input&compare=true#source");
    link.focus();
    expect(link).toHaveFocus();
  },
};

export const DarkGeometry: Story = {
  args: { dark: true },
  play: async ({ canvasElement }) => geometry(canvasElement),
};
