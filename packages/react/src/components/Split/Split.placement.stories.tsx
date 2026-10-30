import type { Meta } from "@storybook/react-vite";
import { placementStory } from "../../protocol/placement-story";
import { Card } from "../Card/Card";
import { Heading } from "../Heading/Heading";
import { Text } from "../Text/Text";
import { Split } from "./Split";
import { placement } from "./Split.placement";

const meta = { title: "Placement/Split", tags: ["!dev", "!autodocs"] } satisfies Meta;
export default meta;

const render = () => (
  <Split>
    <Card>
      <Heading level={2}>Project overview</Heading>
      <Text>Review the latest draft with your team.</Text>
    </Card>
    <Card>
      <Heading level={2}>Upcoming milestones</Heading>
      <Text>See what needs attention next.</Text>
    </Card>
  </Split>
);

export const PlacementCompact = placementStory(placement, "compact", render);
export const PlacementMedium = placementStory(placement, "medium", render);
export const PlacementWide = placementStory(placement, "wide", render);
