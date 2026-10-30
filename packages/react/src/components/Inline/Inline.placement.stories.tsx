import type { Meta } from "@storybook/react-vite";
import { placementStory } from "../../protocol/placement-story";
import { Button } from "../Button/Button";
import { Inline } from "./Inline";
import { placement } from "./Inline.placement";

const meta = { title: "Placement/Inline", tags: ["!dev", "!autodocs"] } satisfies Meta;
export default meta;

const render = () => (
  <Inline>
    <Button>Share</Button>
    <Button>Export</Button>
    <Button>Archive</Button>
  </Inline>
);

export const PlacementCompact = placementStory(placement, "compact", render);
export const PlacementMedium = placementStory(placement, "medium", render);
export const PlacementWide = placementStory(placement, "wide", render);
