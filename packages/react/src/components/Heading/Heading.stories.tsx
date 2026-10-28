import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Code } from "../Code/Code";
import { Grid } from "../Grid/Grid";
import { Link } from "../Link/Link";
import { Panel } from "../Panel/Panel";
import { Text } from "../Text/Text";
import { Heading } from "./Heading";

const meta = {
  title: "Components/Heading",
  component: Heading,
  tags: ["autodocs"],
  args: { children: "Project overview" },
  argTypes: {
    level: { control: "select", options: [1, 2, 3, 4, 5, 6] },
    size: { control: "select", options: ["sm", "md", "lg", "xl", "display"] },
  },
} satisfies Meta<typeof Heading>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Dark: Story = {
  tags: ["!dev", "!autodocs"],
  globals: { theme: "dark" },
};
export const Hierarchy: Story = {
  render: () => (
    <Grid layout="stack">
      <Heading level={1}>Workspace</Heading>
      <Heading level={2}>Projects</Heading>
      <Heading level={3}>Design system</Heading>
      <Heading level={4}>Typography</Heading>
      <Heading level={5}>Content guidelines</Heading>
      <Heading level={6}>Related references</Heading>
    </Grid>
  ),
};
export const Sizes: Story = {
  render: () => (
    <Grid layout="stack">
      <Heading size="display">Display</Heading>
      <Heading size="xl">Extra large</Heading>
      <Heading size="lg">Large</Heading>
      <Heading size="md">Medium</Heading>
      <Heading size="sm">Small</Heading>
    </Grid>
  ),
};
export const Article: Story = {
  render: () => (
    <Grid as="div" layout="stack" style={{ maxInlineSize: "var(--kb-text-measure)" }}>
      <Heading level={1}>A shared language for every screen</Heading>
      <Text size="lg">
        Good typography makes complex work easier to follow, one clear section at a time.
      </Text>
      <Text tone="muted" size="sm">
        Design notes · 4 minute read
      </Text>
      <Panel aria-labelledby="type-installation">
        <Panel.Header>
          <Heading id="type-installation" level={2}>
            Start with the foundations
          </Heading>
        </Panel.Header>
        <Panel.Body>
          <Text>
            Import <Code>@kbui/css/styles.css</Code> once. Choose heading rank from document
            structure, then adjust visual size for context.
          </Text>
          <Text>
            Read the{" "}
            <Link href="https://www.w3.org/WAI/tutorials/page-structure/headings/">
              heading hierarchy guide
            </Link>{" "}
            before composing a new page.
          </Text>
        </Panel.Body>
      </Panel>
      <Text>
        Use <strong>emphasis</strong> for important content and <em>italics</em> for a change in
        voice. Let spacing separate ideas.
      </Text>
    </Grid>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const heading = canvas.getByRole("heading", { level: 2 });
    expect(getComputedStyle(heading).fontSize).toBe("22px");
    expect(canvas.getByRole("region", { name: "Start with the foundations" })).toBeVisible();
    expect(canvasElement.scrollWidth).toBeLessThanOrEqual(canvasElement.clientWidth);
  },
};
export const ArticleDark: Story = {
  tags: ["!dev", "!autodocs"],
  ...Article,
  globals: { theme: "dark" },
};
