import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { Code } from "../Code/Code";
import { Text } from "../Text/Text";
import { Link } from "./Link";

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
