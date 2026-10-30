import type { Meta } from "@storybook/react-vite";
import { placementStory } from "../../protocol/placement-story";
import { Card } from "../Card/Card";
import { Heading } from "../Heading/Heading";
import { Grid } from "./Grid";
import { placement } from "./Grid.placement";

const meta = { title: "Placement/Grid", tags: ["!dev", "!autodocs"] } satisfies Meta;
export default meta;

const grid = (
  <Grid columns={3} gap="md">
    {["Website refresh", "Mobile checkout", "Help center"].map((name) => (
      <Card key={name}>
        <Heading level={2}>{name}</Heading>
      </Card>
    ))}
  </Grid>
);

// A 24rem pane beside the full-width grid must stack at every viewport.
const render = () => (
  <>
    {grid}
    <div style={{ inlineSize: "24rem", maxInlineSize: "100%" }}>{grid}</div>
  </>
);

export const PlacementCompact = placementStory(placement, "compact", render);
export const PlacementMedium = placementStory(placement, "medium", render);
export const PlacementWide = placementStory(placement, "wide", render);
