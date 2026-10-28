import releases from "virtual:kbui-changelog";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Changelog, ReleaseChanges } from "../site/Changelog";
import { releaseCopy, releaseHeadline } from "../site/changelog-model";

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

export const FutureRelease: Story = {
  render: () => (
    <ReleaseChanges
      siteRoot="../"
      latest
      release={{
        version: "9.0.0",
        date: "2030-01-01",
        components: ["Card"],
        improvements: ["Support nested layouts"],
        fixes: ["Preserve keyboard focus"],
        breaking: ["Replace the old layout prop with columns."],
        compareUrl: "https://github.com/KhallilB/kbui/compare/v8.0.0...v9.0.0",
      }}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByRole("list", { name: "Highlights in 9.0.0" })).toBeVisible();
    expect(canvas.getByText("Support nested layouts")).toBeVisible();
    expect(canvas.getByText("Preserve keyboard focus")).toBeVisible();
    expect(canvas.getByRole("heading", { name: "Before you upgrade" })).toBeVisible();
    expect(canvas.getByText("Replace the old layout prop with columns.")).toBeVisible();
    expect(canvas.getByRole("link", { name: "Card" })).toHaveAttribute(
      "href",
      "../components/?component=card",
    );
  },
};

export const Browse: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByRole("heading", { level: 1 })).toHaveTextContent("What's new in kbui.");
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
    expect(canvas.queryByRole("heading", { name: "Improvements" })).toBeNull();
    expect(canvas.queryByRole("heading", { name: "Fixes" })).toBeNull();
    const navigation = within(canvas.getByRole("navigation", { name: "Browse releases" }));
    for (const item of releases)
      expect(
        navigation.getByRole("link", { name: `Version ${item.version}: ${releaseHeadline(item)}` }),
      ).toHaveAttribute("href", `#v${item.version}`);
    expect(release.getByRole("heading", { name: releaseHeadline(latest) })).toBeVisible();
    for (const text of releaseCopy(latest).highlights)
      expect(release.getByText(text)).toBeVisible();
    for (const text of releaseCopy(latest).upgrade) expect(release.getByText(text)).toBeVisible();
    expect(canvas.queryByText(/Install Bun/)).toBeNull();
    if (latest.compareUrl)
      expect(release.getByRole("link", { name: /Full history on GitHub/ })).toHaveAttribute(
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
