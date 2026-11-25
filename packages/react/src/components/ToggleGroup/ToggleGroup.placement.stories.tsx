import type { Meta } from "@storybook/react-vite";
import { placementStory } from "../../protocol/placement-story";
import { ToggleButton } from "../ToggleButton/ToggleButton";
import { ToggleGroup } from "./ToggleGroup";
import { placement } from "./ToggleGroup.placement";

const meta = { title: "Placement/ToggleGroup", tags: ["!dev", "!autodocs"] } satisfies Meta;
export default meta;

const layers = (orientation: "horizontal" | "vertical") => () => (
  <ToggleGroup aria-label="Map layers" orientation={orientation} defaultValue={["roads"]}>
    <ToggleButton value="roads">Roads</ToggleButton>
    <ToggleButton value="water">Water</ToggleButton>
    <ToggleButton value="labels">Place labels</ToggleButton>
  </ToggleGroup>
);

export const PlacementCompact = placementStory(placement[0], "compact", layers("horizontal"));
export const PlacementMedium = placementStory(placement[0], "medium", layers("horizontal"));
export const PlacementWide = placementStory(placement[0], "wide", layers("horizontal"));
export const VerticalCompact = placementStory(placement[1], "compact", layers("vertical"));
export const VerticalMedium = placementStory(placement[1], "medium", layers("vertical"));
export const VerticalWide = placementStory(placement[1], "wide", layers("vertical"));
