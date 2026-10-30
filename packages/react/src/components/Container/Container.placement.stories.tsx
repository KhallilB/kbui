import type { Meta } from "@storybook/react-vite";
import { placementStory } from "../../protocol/placement-story";
import { Heading } from "../Heading/Heading";
import { Text } from "../Text/Text";
import { Container } from "./Container";
import { placement } from "./Container.placement";

const meta = { title: "Placement/Container", tags: ["!dev", "!autodocs"] } satisfies Meta;
export default meta;

const render = () => (
  <Container>
    <section>
      <Heading level={2}>Workspace</Heading>
      <Text>Projects, members and billing for this workspace.</Text>
    </section>
  </Container>
);

export const PlacementCompact = placementStory(placement, "compact", render);
export const PlacementMedium = placementStory(placement, "medium", render);
export const PlacementWide = placementStory(placement, "wide", render);
