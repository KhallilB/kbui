import type { Meta } from "@storybook/react-vite";
import { placementStory } from "../../protocol/placement-story";
import { Toolbar } from "./Toolbar";
import { placement } from "./Toolbar.placement";

const meta = { title: "Placement/Toolbar", tags: ["!dev", "!autodocs"] } satisfies Meta;
export default meta;

const render = () => (
  <Toolbar aria-label="Worker actions">
    <Toolbar.Group>
      <Toolbar.Button>Copy</Toolbar.Button>
      <Toolbar.Button>Open log</Toolbar.Button>
    </Toolbar.Group>
    <Toolbar.Separator />
    <Toolbar.Button variant="danger">Stop</Toolbar.Button>
  </Toolbar>
);

export const PlacementCompact = placementStory(placement, "compact", render);
export const PlacementMedium = placementStory(placement, "medium", render);
export const PlacementWide = placementStory(placement, "wide", render);
