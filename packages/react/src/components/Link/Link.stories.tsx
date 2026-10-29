import type { Meta, StoryObj } from "@storybook/react-vite";
import { createContext, useContext, useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { Code } from "../Code/Code";
import { Text } from "../Text/Text";
import { Link, type LinkProps } from "./Link";

const Navigate = createContext<(href: string) => void>(() => {});

function ClientLink({ href, onClick, ...props }: LinkProps) {
  const navigate = useContext(Navigate);
  return (
    <a
      {...props}
      href={href}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        event.preventDefault();
        navigate(href);
      }}
    />
  );
}

const meta = {
  title: "Components/Link",
  component: Link,
  tags: ["autodocs"],
  args: { href: "https://www.w3.org/WAI/tutorials/", children: "Read accessibility tutorials" },
} satisfies Meta<typeof Link>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole("link");
    link.focus();
    await userEvent.keyboard("{Tab}{Shift>}{Tab}{/Shift}");
    expect(link).toHaveFocus();
    expect(link.matches(":focus-visible")).toBe(true);
    const style = getComputedStyle(link);
    expect(style.textDecorationLine).toContain("underline");
    expect(style.outlineStyle).toBe("solid");
    expect(Number.parseFloat(style.outlineWidth)).toBeGreaterThanOrEqual(2);
  },
};
export const InText: Story = {
  render: () => (
    <Text size="lg">
      Explore <Link href="https://www.w3.org/WAI/tutorials/">accessibility tutorials</Link> or
      inspect the{" "}
      <Link href="/reference">
        <Code>HeadingProps</Code> reference
      </Link>
      . Links inherit surrounding text size and keep their underline.
    </Text>
  ),
};
export const WithRouter: Story = {
  render: function WithRouter() {
    const [path, setPath] = useState("/");
    return (
      <Navigate.Provider value={setPath}>
        <Link.Provider component={ClientLink}>
          <Text>
            Open <Link href="/projects">projects</Link> or <Link href="/settings">settings</Link>.
            Current path: <Code>{path}</Code>
          </Text>
        </Link.Provider>
      </Navigate.Provider>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole("link", { name: "settings" });
    expect(link).toHaveClass("kb-link");
    await userEvent.click(link);
    expect(canvas.getByText("/settings")).toBeInTheDocument();
  },
};
