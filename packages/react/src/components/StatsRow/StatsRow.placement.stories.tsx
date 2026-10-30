import type { Meta } from "@storybook/react-vite";
import { placementBreaksStory } from "../../protocol/placement-breaks";
import { placementStory } from "../../protocol/placement-story";
import { StatsRow } from "./StatsRow";
import { placement } from "./StatsRow.placement";

const meta = { title: "Placement/StatsRow", tags: ["!dev", "!autodocs"] } satisfies Meta;
export default meta;

// Metrics row from M2 prompt d01.
const render = () => (
  <StatsRow aria-label="Store performance, September 2026" appearance="outlined">
    <StatsRow.Item label="Total revenue" value="$48,250" change="+12.8%" trend="up" />
    <StatsRow.Item label="Orders" value="625" change="+8.7%" trend="up" />
    <StatsRow.Item label="Conversion rate" value="3.42%" change="+0.36 pp" trend="up" />
    <StatsRow.Item label="Average order value" value="$77.20" change="-1.2%" trend="down" />
  </StatsRow>
);

export const PlacementCompact = placementStory(placement, "compact", render);
export const PlacementMedium = placementStory(placement, "medium", render);
export const PlacementWide = placementStory(placement, "wide", render);

export const CatchesBrokenRules = placementBreaksStory(placement, render, {
  wrap: {
    css: '[data-break="wrap"] .kb-statsrow { grid-template-columns: repeat(2, minmax(0, 1fr)); }',
    expected: ".kb-statsrow :scope line",
  },
  narrow: {
    css: '[data-break="narrow"] .kb-statsrow { inline-size: 50%; }',
    expected: ".kb-statsrow :scope fill",
  },
  overflow: {
    css: '[data-break="overflow"] .kb-statsrow { grid-template-columns: repeat(4, 30rem); }',
    expected: "overflows sideways",
  },
});
