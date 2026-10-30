import type { Meta } from "@storybook/react-vite";
import type { ReactElement } from "react";
import { placementBreaksStory } from "../../protocol/placement-breaks";
import { placementStory } from "../../protocol/placement-story";
import { placement } from "./Dashboard.placement";
import { SalesOverview } from "./Dashboard.stories";

const meta = { title: "Placement/Dashboard", tags: ["!dev", "!autodocs"] } satisfies Meta;
export default meta;

// Rebuilds M2 prompt d01; its render takes no args.
const render = () => (SalesOverview.render as () => ReactElement)();

export const PlacementCompact = placementStory(placement, "compact", render);
export const PlacementMedium = placementStory(placement, "medium", render);
export const PlacementWide = placementStory(placement, "wide", render);

export const CatchesBrokenRules = placementBreaksStory(placement, render, {
  narrow: {
    css: '[data-break="narrow"] .kb-dashboard { max-inline-size: 40rem; }',
    expected: ".kb-dashboard :scope measure",
  },
  stacked: {
    css: '[data-break="stacked"] .kb-dashboard-primary { flex-basis: 100%; }',
    expected: ".kb-dashboard .kb-dashboard-panels line",
  },
  inset: {
    css: '[data-break="inset"] .kb-dashboard-metrics { margin-inline-end: 10rem; }',
    expected: ".kb-dashboard .kb-dashboard-metrics fill",
  },
  overflow: {
    css: '[data-break="overflow"] .kb-dashboard-header { min-inline-size: 120rem; }',
    expected: "overflows sideways",
  },
});
