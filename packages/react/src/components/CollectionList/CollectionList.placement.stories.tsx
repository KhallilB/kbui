import type { Meta } from "@storybook/react-vite";
import { placementStory } from "../../protocol/placement-story";
import { CollectionRow } from "../CollectionRow/CollectionRow";
import { Status } from "../Status/Status";
import { CollectionList } from "./CollectionList";
import { placement } from "./CollectionList.placement";

const meta = { title: "Placement/CollectionList", tags: ["!dev", "!autodocs"] } satisfies Meta;
export default meta;

const render = () => (
  <CollectionList aria-label="Projects" dividers>
    <CollectionRow title="Customer portal" metadata={<Status tone="success">Live</Status>} />
    <CollectionRow title="Billing migration" metadata={<Status tone="warning">Review</Status>} />
    <CollectionRow title="Help center" />
  </CollectionList>
);

export const PlacementCompact = placementStory(placement, "compact", render);
export const PlacementMedium = placementStory(placement, "medium", render);
export const PlacementWide = placementStory(placement, "wide", render);
