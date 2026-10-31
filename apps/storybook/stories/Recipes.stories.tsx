import type { Meta, StoryObj } from "@storybook/react-vite";
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
    for (const name of ["PageHeader", "FormSection", "RequestIntake"])
      expect(canvas.getByRole("link", { name })).toHaveAttribute(
        "href",
        `../recipes/?recipe=${name.toLowerCase()}`,
      );
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

export const FormSection: Story = {
  args: { search: "?recipe=formsection" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByRole("heading", { level: 1, name: "FormSection" })).toBeVisible();
    expect(canvas.getByRole("link", { name: "Open in Storybook" })).toHaveAttribute(
      "href",
      "./?path=/docs/recipes-formsection--docs",
    );
    expect(canvas.getByRole("link", { name: "Input" })).toHaveAttribute(
      "href",
      "../components/?component=input",
    );
    expect(canvas.getByRole("link", { name: "In Panel" })).toHaveAttribute(
      "href",
      "../recipes/?recipe=formsection&state=recipes-formsection--in-panel",
    );
    const sources = within(canvas.getByRole("region", { name: "Recipe source files" }));
    expect(sources.getByRole("heading", { name: "FormSection.tsx" })).toBeVisible();
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

export const PageHeader: Story = {
  args: {
    search: "?recipe=pageheader",
    hash: "#usage",
    replaceLocation: () => {
      throw new Error("Live recipes must not redirect");
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByRole("heading", { level: 1, name: "PageHeader" })).toBeVisible();
    expect(canvas.getByRole("link", { name: "Open in Storybook" })).toHaveAttribute(
      "href",
      "./?path=/docs/recipes-pageheader--docs",
    );
    expect(canvas.getByRole("heading", { name: "PageHeader.tsx" })).toBeVisible();
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
