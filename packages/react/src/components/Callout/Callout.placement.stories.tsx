import type { Meta } from "@storybook/react-vite";
import { placementStory } from "../../protocol/placement-story";
import { Button } from "../Button/Button";
import { Callout } from "./Callout";
import { placement } from "./Callout.placement";

const meta = { title: "Placement/Callout", tags: ["!dev", "!autodocs"] } satisfies Meta;
export default meta;

const render = () => (
  <Callout
    tone="warning"
    title="A file with this name already exists"
    actions={
      <>
        <Button size="sm" variant="ghost">
          Skip
        </Button>
        <Button size="sm" variant="primary">
          Overwrite
        </Button>
      </>
    }
  >
    Choose whether to replace it.
  </Callout>
);

export const PlacementCompact = placementStory(placement, "compact", render);
export const PlacementMedium = placementStory(placement, "medium", render);
export const PlacementWide = placementStory(placement, "wide", render);
