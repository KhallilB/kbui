import type { Meta } from "@storybook/react-vite";
import { placementStory } from "../../protocol/placement-story";
import { Tabs } from "./Tabs";
import { placement } from "./Tabs.placement";

const meta = { title: "Placement/Tabs", tags: ["!dev", "!autodocs"] } satisfies Meta;
export default meta;

const tabs = (orientation: "horizontal" | "vertical") => () => (
  <Tabs defaultValue="overview" orientation={orientation}>
    <Tabs.List aria-label="Release sections">
      <Tabs.Tab value="overview">Overview</Tabs.Tab>
      <Tabs.Tab value="checks">Checks</Tabs.Tab>
      <Tabs.Tab value="artifacts">Artifacts</Tabs.Tab>
    </Tabs.List>
    <Tabs.Panel value="overview">
      All 18 workspace packages passed token, stylesheet and accessibility verification.
    </Tabs.Panel>
    <Tabs.Panel value="checks">4 automated gates completed in 42s.</Tabs.Panel>
    <Tabs.Panel value="artifacts">Signed tarballs are ready for publishing.</Tabs.Panel>
  </Tabs>
);

export const PlacementCompact = placementStory(placement[0], "compact", tabs("horizontal"));
export const PlacementMedium = placementStory(placement[0], "medium", tabs("horizontal"));
export const PlacementWide = placementStory(placement[0], "wide", tabs("horizontal"));
export const VerticalCompact = placementStory(placement[1], "compact", tabs("vertical"));
export const VerticalMedium = placementStory(placement[1], "medium", tabs("vertical"));
export const VerticalWide = placementStory(placement[1], "wide", tabs("vertical"));
