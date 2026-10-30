import type { Meta } from "@storybook/react-vite";
import { placementStory } from "../../protocol/placement-story";
import { Disclosure } from "./Disclosure";
import { placement } from "./Disclosure.placement";

const meta = { title: "Placement/Disclosure", tags: ["!dev", "!autodocs"] } satisfies Meta;
export default meta;

const render = () => (
  <Disclosure defaultOpen>
    <Disclosure.Trigger>Delivery details</Disclosure.Trigger>
    <Disclosure.Panel>Orders placed before noon ship the same day.</Disclosure.Panel>
  </Disclosure>
);

export const PlacementCompact = placementStory(placement, "compact", render);
export const PlacementMedium = placementStory(placement, "medium", render);
export const PlacementWide = placementStory(placement, "wide", render);
