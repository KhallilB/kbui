import releases from "virtual:kbui-changelog";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Changelog } from "../site/Changelog";

const [latest, previous] = releases;
if (!latest || !previous) throw new Error("Changelog stories need two releases");

const meta = {
  title: "Site/Changelog",
  component: Changelog,
  args: { siteRoot: "../", storybookRoot: "./" },
  parameters: { layout: "fullscreen" },
  afterEach: async ({ canvasElement }) => {
    expect(canvasElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
  },
} satisfies Meta<typeof Changelog>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Browse: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByRole("heading", { level: 1 })).toHaveTextContent("What changed lately.");
    expect(canvas.getByRole("link", { name: /What's new/ })).toHaveAttribute(
      "href",
      "../changelog/",
    );

    const release = within(canvas.getByRole("article", { name: `Version ${latest.version}` }));
    expect(release.getByText("Latest")).toBeVisible();
    for (const name of latest.components)
      expect(release.getByRole("link", { name })).toHaveAttribute(
        "href",
        `../components/?component=${name.toLowerCase()}`,
      );
    for (const text of [...latest.breaking, ...latest.improvements, ...latest.fixes])
      expect(release.getByText(text)).toBeVisible();
    expect(canvas.queryByText(/Install Bun/)).toBeNull();
    if (latest.compareUrl)
      expect(release.getByRole("link", { name: /Compare on GitHub/ })).toHaveAttribute(
        "href",
        latest.compareUrl,
      );

    const older = canvas.getByRole("article", { name: `Version ${previous.version}` });
    const details = older.querySelector("details");
    const summary = details?.querySelector("summary");
    if (!details || !summary) throw new Error("Older releases collapse");
    expect(details.open).toBe(false);
    await userEvent.click(summary);
    expect(details.open).toBe(true);
  },
};

export const OpenFromLink: Story = {
  play: async ({ canvasElement }) => {
    const older = canvasElement.ownerDocument
      .getElementById(`v${previous.version}`)
      ?.querySelector("details");
    if (!(older instanceof HTMLDetailsElement)) throw new Error("Missing older release");
    expect(older.open).toBe(false);
    window.location.hash = `v${previous.version}`;
    await waitFor(() => expect(older.open).toBe(true));
    history.replaceState(null, "", window.location.pathname + window.location.search);
  },
};
