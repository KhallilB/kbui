import type { Meta, StoryObj } from "@storybook/react-vite";
import { Code } from "../Code/Code";
import { Grid } from "../Grid/Grid";
import { Link } from "../Link/Link";
import { Text } from "./Text";

const meta = {
  title: "Components/Text",
  component: Text,
  tags: ["autodocs"],
  args: {
    children: "Review the changes, add your feedback, and share the draft when it is ready.",
  },
  argTypes: {
    as: { control: "select", options: ["p", "span", "div"] },
    size: { control: "select", options: ["sm", "md", "lg"] },
    tone: { control: "select", options: ["default", "muted"] },
  },
} satisfies Meta<typeof Text>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const SizesAndTones: Story = {
  render: () => (
    <Grid layout="stack">
      <Text size="lg">Lead with the context readers need.</Text>
      <Text>
        Body copy supports careful reading with a comfortable line height and a bounded measure.
      </Text>
      <Text size="sm">Small text for supporting details.</Text>
      <Text tone="muted">Secondary content stays readable.</Text>
      <Text size="sm" tone="muted">
        Updated today · All changes saved
      </Text>
    </Grid>
  ),
};
export const Inline: Story = {
  render: () => (
    <Text>
      Use <Code>Heading</Code> for sections. Read the{" "}
      <Link href="https://www.w3.org/WAI/tutorials/page-structure/headings/">heading guide</Link>,
      then add{" "}
      <Text as="span" tone="muted">
        supporting context
      </Text>{" "}
      where useful.
    </Text>
  ),
};
