import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Badge } from "../Badge/Badge";
import { Card } from "../Card/Card";
import { Inline } from "../Inline/Inline";
import { Link } from "../Link/Link";
import { Text } from "../Text/Text";
import { Avatar } from "./Avatar";

const portrait = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240"><rect width="240" height="240" fill="#dac8b9"/><path d="M18 240c8-62 45-82 102-82s94 20 102 82" fill="#354d4a"/><ellipse cx="120" cy="105" rx="52" ry="66" fill="#c18b68"/><path d="M66 112C42 12 183 8 175 109l-18-48c-15 21-57 29-91 28" fill="#312d2c"/><path d="M103 135q17 12 34 0" fill="none" stroke="#694b40" stroke-width="3" stroke-linecap="round"/><circle cx="100" cy="108" r="3" fill="#312d2c"/><circle cx="140" cy="108" r="3" fill="#312d2c"/></svg>')}`;

const meta = {
  title: "Components/Avatar",
  component: Avatar,
  tags: ["autodocs"],
  args: { name: "Maya Chen", src: portrait },
} satisfies Meta<typeof Avatar>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Sizes: Story = {
  render: (args) => (
    <Inline align="center" gap="lg">
      {(["xs", "sm", "md", "lg", "xl"] as const).map((size) => (
        <Avatar key={size} {...args} size={size} />
      ))}
    </Inline>
  ),
};
export const Fallbacks: Story = {
  render: () => (
    <Inline gap="lg">
      <Avatar name="Maya Chen" />
      <Avatar name="Ana María López" />
      <Avatar name="李" />
      <Avatar name="Robin Ellis" src="data:image/png;base64,invalid" />
      <Avatar name="North Studio" initials="N" shape="square" />
      <Avatar name="" />
    </Inline>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByRole("img", { name: "Robin Ellis" })).toBeInTheDocument();
    expect(canvas.getByText("RE")).toBeVisible();
  },
};
export const People: Story = {
  render: () => (
    <Card>
      <Inline gap="md" align="center">
        <Avatar name="Maya Chen" decorative src={portrait} size="lg" />
        <div>
          <Link href="#maya-profile">Maya Chen</Link>
          <Text size="sm" tone="muted">
            Design director · North Studio
          </Text>
        </div>
        <Badge>Owner</Badge>
      </Inline>
    </Card>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.queryByRole("img")).toBeNull();
    const link = canvas.getByRole("link", { name: "Maya Chen" });
    link.focus();
    expect(link).toHaveFocus();
  },
};
