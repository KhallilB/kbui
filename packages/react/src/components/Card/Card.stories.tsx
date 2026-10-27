import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Card } from "./Card";

const meta = {
  title: "Components/Card",
  component: Card,
  tags: ["autodocs"],
  args: {
    children: (
      <>
        <h2>Project</h2>
        <p>A neutral content surface.</p>
      </>
    ),
  },
} satisfies Meta<typeof Card>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Dark: Story = {
  tags: ["!dev", "!autodocs"],
  globals: { theme: "dark" },
};
export const Plain: Story = { args: { appearance: "plain" } };
export const SingleLink: Story = {
  args: {
    children: (
      <>
        <h2>
          <a href="/project">Project details</a>
        </h2>
        <p>One link, caller-owned navigation.</p>
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole("link", { name: "Project details" });
    expect(canvas.getAllByRole("link")).toHaveLength(1);
    expect(canvas.queryByRole("button")).toBeNull();
    link.focus();
    expect(link).toHaveFocus();
  },
};
