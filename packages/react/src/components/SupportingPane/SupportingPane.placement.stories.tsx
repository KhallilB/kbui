import type { Meta } from "@storybook/react-vite";
import type { ReactElement } from "react";
import { placementBreaksStory } from "../../protocol/placement-breaks";
import { placementStory } from "../../protocol/placement-story";
import { placement } from "./SupportingPane.placement";
import { ShoeCart } from "./SupportingPane.stories";

const meta = { title: "Placement/SupportingPane", tags: ["!dev", "!autodocs"] } satisfies Meta;
export default meta;

// Rebuilds M2 prompt c04; its render takes no args.
const render = () => (ShoeCart.render as () => ReactElement)();

export const PlacementCompact = placementStory(placement, "compact", render);
export const PlacementMedium = placementStory(placement, "medium", render);
export const PlacementWide = placementStory(placement, "wide", render);

export const CatchesBrokenRules = placementBreaksStory(placement, render, {
  narrow: {
    css: '[data-break="narrow"] .kb-supportingpane { max-inline-size: 40rem; }',
    expected: ".kb-supportingpane :scope measure",
  },
  stacked: {
    css: '[data-break="stacked"] .kb-supportingpane-aside { flex-basis: 100%; }',
    expected: ".kb-supportingpane :scope line",
  },
  first: {
    css: '[data-break="first"] .kb-supportingpane-aside { order: -1; }',
    expected: ".kb-supportingpane .kb-supportingpane-aside last",
  },
  overflow: {
    css: '[data-break="overflow"] .kb-supportingpane-main { min-inline-size: 120rem; }',
    expected: "overflows sideways",
  },
});
