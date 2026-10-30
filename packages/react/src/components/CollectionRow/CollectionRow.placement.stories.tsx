import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { checkPlacement, sizeClassOfRoot } from "../../protocol/placement-check";
import { placementStory } from "../../protocol/placement-story";
import { Button } from "../Button/Button";
import { CollectionList } from "../CollectionList/CollectionList";
import { Status } from "../Status/Status";
import { CollectionRow } from "./CollectionRow";
import { placement } from "./CollectionRow.placement";

const meta = { title: "Placement/CollectionRow", tags: ["!dev", "!autodocs"] } satisfies Meta;
export default meta;

const row = (title: string) => (
  <CollectionRow
    title={title}
    description="Review the latest draft and share feedback."
    metadata={<Status tone="warning">Awaiting review</Status>}
    actions={
      <>
        <Button variant="secondary" size="sm">
          Open
        </Button>
        <Button variant="primary" size="sm">
          Approve
        </Button>
      </>
    }
  />
);

const render = () => (
  <CollectionList aria-label="Projects" dividers>
    {row("Customer portal")}
    {row("Billing migration")}
  </CollectionList>
);

export const PlacementCompact = placementStory(placement, "compact", render);
export const PlacementMedium = placementStory(placement, "medium", render);
export const PlacementWide = placementStory(placement, "wide", render);

// A row outside CollectionList follows its own width, so a narrow pane on a wide page still stacks it.
export const BareRowStacks: StoryObj = {
  tags: ["!dev", "!autodocs"],
  globals: { viewport: { value: "desktop", isRotated: false } },
  parameters: { layout: "fullscreen" },
  render: () => (
    <ul
      aria-label="Pinned"
      style={{ inlineSize: "24rem", margin: 0, padding: 0, listStyle: "none" }}
    >
      {row("Help center")}
    </ul>
  ),
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector<HTMLElement>(".kb-collectionrow");
    const content = root?.querySelector(".kb-collectionrow-content");
    const aside = root?.querySelector(".kb-collectionrow-aside");
    if (!root || !content || !aside) throw new Error("missing row parts");
    expect(sizeClassOfRoot(root)).toBe("compact");
    expect(checkPlacement(root, placement)).toEqual([]);
    expect(aside.getBoundingClientRect().top).toBeGreaterThanOrEqual(
      content.getBoundingClientRect().bottom,
    );
  },
};

// Leading media wider than the 3rem default keeps its size instead of being squeezed.
const thumbnail =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect width='64' height='64' fill='%23888'/%3E%3C/svg%3E";
export const LeadingMedia: StoryObj = {
  tags: ["!dev", "!autodocs"],
  globals: { viewport: { value: "mobile", isRotated: false } },
  parameters: { layout: "fullscreen" },
  render: () => (
    <CollectionList aria-label="Cart">
      <CollectionRow
        title="Ceramic mug"
        description="Qty 2"
        leading={<img src={thumbnail} alt="" width={64} height={64} />}
        metadata="$24.00"
      />
    </CollectionList>
  ),
  play: async ({ canvasElement }) => {
    const image = canvasElement.querySelector("img");
    const title = within(canvasElement).getByText("Ceramic mug");
    if (!image) throw new Error("missing thumbnail");
    const media = image.getBoundingClientRect();
    expect(media.width).toBe(64);
    expect(title.getBoundingClientRect().left).toBeGreaterThanOrEqual(media.right);
  },
};
