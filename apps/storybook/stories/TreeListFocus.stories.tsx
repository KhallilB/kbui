import { Link, TreeList } from "@kb.ui/react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor, within } from "storybook/test";
import { page, userEvent } from "vitest/browser";

const meta = { title: "Validation/TreeList focus", tags: ["!dev", "!autodocs"] } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const PointerCollapseFocus: Story = {
  render: () => (
    <TreeList
      aria-label="Setup topics"
      defaultExpandedIds={["workspace"]}
      items={[
        {
          id: "workspace",
          label: "Workspace setup",
          children: [
            {
              id: "profiles",
              label: (
                <Link href="#profiles" onClick={(event) => event.preventDefault()}>
                  Profiles
                </Link>
              ),
            },
          ],
        },
      ]}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const workspace = canvas.getByRole("button", { name: "Workspace setup" });
    const profiles = canvas.getByRole("link", { name: "Profiles" });
    // A real click activates the browser test frame before setting focus.
    await page.getByRole("link", { name: "Profiles" }).click();
    profiles.focus();
    await expect(profiles).toHaveFocus();

    await page.getByRole("button", { name: "Workspace setup" }).click();

    await expect(workspace).toHaveAttribute("aria-expanded", "false");
    await expect(workspace).toHaveFocus();
  },
};

export const BranchMotion: Story = {
  render: () => (
    <>
      <TreeList
        aria-label="Setup topics"
        items={[
          {
            id: "workspace",
            label: "Workspace setup",
            children: [
              { id: "profiles", label: <Link href="#profiles">Profiles</Link> },
              { id: "notes", label: <input aria-label="Branch notes" /> },
              { id: "roles", label: "Team roles" },
            ],
          },
        ]}
      />
      <input aria-label="Outside the tree" />
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Workspace setup" });
    const branch = canvasElement.ownerDocument.getElementById(
      trigger.getAttribute("aria-controls") ?? "",
    );
    if (!branch) throw new Error("Missing TreeList branch");

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    await page.getByRole("button", { name: "Workspace setup" }).click();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    if (reduced) {
      expect(branch.getAnimations()).toHaveLength(0);
      expect(branch.clientHeight).toBe(branch.scrollHeight);
    } else {
      await verifyHeightTransition(branch);
    }

    await page.getByRole("button", { name: "Workspace setup" }).click();
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(canvas.queryByRole("link", { name: "Profiles" })).toBeNull();
    const skipClosedBranch = async () => {
      trigger.focus();
      await userEvent.tab();
      await expect(canvas.getByRole("textbox", { name: "Outside the tree" })).toHaveFocus();
    };
    if (reduced) {
      expect(branch.getAnimations()).toHaveLength(0);
      expect(branch.hidden).toBe(true);
      await skipClosedBranch();
    } else {
      expect(branch.inert).toBe(true);
      await verifyHeightTransition(branch, skipClosedBranch);
      await waitFor(() => expect(branch.hidden).toBe(true));
    }
  },
};

async function verifyHeightTransition(branch: HTMLElement, whileMoving?: () => Promise<void>) {
  const animation = await waitFor(() => {
    const transition = branch
      .getAnimations()
      .find((item) => "transitionProperty" in item && item.transitionProperty === "height");
    if (!transition) throw new Error("Expected a TreeList height transition");
    return transition;
  });
  animation.pause();
  await animation.ready;
  const endTime = animation.effect?.getComputedTiming().endTime;
  if (typeof endTime !== "number") throw new Error("Expected a timed TreeList transition");
  animation.currentTime = endTime / 2;
  const height = branch.getBoundingClientRect().height;
  expect(height).toBeGreaterThan(0);
  expect(height).toBeLessThan(branch.scrollHeight);
  await whileMoving?.();
  animation.finish();
  await animation.finished;
}
