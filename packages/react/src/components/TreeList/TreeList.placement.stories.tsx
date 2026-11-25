import type { Meta } from "@storybook/react-vite";
import { placementBreaksStory } from "../../protocol/placement-breaks";
import { placementStory } from "../../protocol/placement-story";
import { TreeList } from "./TreeList";
import { placement } from "./TreeList.placement";
import { DepthCap } from "./TreeList.stories";

const meta = { title: "Placement/TreeList", tags: ["!dev", "!autodocs"] } satisfies Meta;
export default meta;

const render = () => (
  <TreeList
    aria-label="Runbook"
    items={DepthCap.args?.items ?? []}
    defaultExpandedIds={DepthCap.args?.defaultExpandedIds}
    maxVisualDepth={DepthCap.args?.maxVisualDepth}
  />
);

export const PlacementCompact = placementStory(placement, "compact", render);
export const PlacementMedium = placementStory(placement, "medium", render);
export const PlacementWide = placementStory(placement, "wide", render);

export const CatchesBrokenRules = placementBreaksStory(placement, render, {
  narrow: {
    css: '[data-break="narrow"] .kb-treelist { max-inline-size: 30rem; }',
    expected: ".kb-treelist :scope fill",
  },
  shortTrigger: {
    css: '[data-break="shortTrigger"] .kb-treelist-trigger { inline-size: 70%; }',
    expected: ".kb-treelist .kb-treelist-trigger fill",
  },
});
