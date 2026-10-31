import type { Meta, StoryObj } from "@storybook/react-vite";
import { type ComponentProps, useCallback, useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Recipes } from "../site/Recipes";

const meta = {
  title: "Site/Recipes",
  component: Recipes,
  args: { siteRoot: "../", storybookRoot: "./", search: "" },
  parameters: { layout: "fullscreen" },
  afterEach: async ({ canvasElement }) => {
    expect(canvasElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
  },
} satisfies Meta<typeof Recipes>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Directory: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByRole("heading", { level: 1, name: "Recipes" })).toBeVisible();
    expect(canvas.getByRole("link", { name: "ListDetail" })).toHaveAttribute(
      "href",
      "../recipes/?recipe=listdetail",
    );
    expect(canvas.getByRole("link", { name: "Inbox" })).toHaveAttribute(
      "href",
      "../recipes/?recipe=inbox",
    );
    expect(canvas.queryByRole("link", { name: "PageHeader" })).toBeNull();
    expect(canvas.queryByRole("link", { name: "FormSection" })).toBeNull();
    const navigation = within(canvas.getByRole("navigation", { name: "Main navigation" }));
    expect(navigation.getByRole("link", { name: "Recipes" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(canvas.getByRole("heading", { name: "What each part provides" })).toBeVisible();
  },
};

export const ListDetail: Story = {
  args: { search: "?recipe=listdetail" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByRole("heading", { level: 1, name: "ListDetail" })).toBeVisible();
    expect(canvas.getByRole("link", { name: "Open in Storybook" })).toHaveAttribute(
      "href",
      "./?path=/docs/recipes-listdetail--docs",
    );
    const used = within(canvas.getByRole("navigation", { name: "Components used" }));
    expect(used.getByRole("link", { name: "Input" })).toHaveAttribute(
      "href",
      "../components/?component=input",
    );
    expect(used.getByRole("link", { name: "PageHeader" })).toHaveAttribute(
      "href",
      "../components/?component=pageheader",
    );
    expect(canvas.getByRole("link", { name: "Long Content" })).toHaveAttribute(
      "href",
      "../recipes/?recipe=listdetail&state=recipes-listdetail--long-content",
    );
    const sources = within(canvas.getByRole("region", { name: "Recipe source files" }));
    expect(sources.getByRole("heading", { name: "ListDetail.tsx" })).toBeVisible();
    const copy = sources.getAllByRole("button", { name: "Copy code" })[0];
    if (!copy) throw new Error("Missing recipe source copy action");
    await userEvent.click(copy);
    await waitFor(() =>
      expect(sources.getAllByRole("status")[0]).toHaveTextContent(
        /copied to clipboard|Copy unavailable/,
      ),
    );
  },
};

const retiredIds = ["pageheader", "formsection"];
const retiredRedirects: string[] = [];

// One frame at a time; each redirect mounts the next retired id.
function RetiredRedirects(args: ComponentProps<typeof Recipes>) {
  const [index, setIndex] = useState(0);
  const record = useCallback((href: string) => {
    retiredRedirects.push(href);
    setIndex((current) => current + 1);
  }, []);
  const id = retiredIds[index];
  return id ? (
    <Recipes key={id} {...args} search={`?recipe=${id}`} hash="#usage" replaceLocation={record} />
  ) : null;
}

export const RetiredRecipeRedirects: Story = {
  render: (args) => <RetiredRedirects {...args} />,
  beforeEach: () => {
    retiredRedirects.length = 0;
  },
  play: async () => {
    await waitFor(() =>
      expect(retiredRedirects).toEqual([
        "../components/?component=pageheader#usage",
        "../components/?component=formsection#usage",
      ]),
    );
  },
};

export const MissingRecipe: Story = {
  args: { search: "?recipe=missing" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByRole("heading", { level: 1, name: "Recipe unavailable" })).toBeVisible();
    expect(canvas.getByRole("link", { name: "Browse recipes" })).toHaveAttribute(
      "href",
      "../recipes/",
    );
  },
};
