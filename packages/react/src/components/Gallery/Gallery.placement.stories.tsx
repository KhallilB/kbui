import type { Meta } from "@storybook/react-vite";
import type { ReactElement } from "react";
import { placementBreaksStory } from "../../protocol/placement-breaks";
import { placementStory } from "../../protocol/placement-story";
import { placement } from "./Gallery.placement";
import { ProductCatalog } from "./Gallery.stories";

const meta = { title: "Placement/Gallery", tags: ["!dev", "!autodocs"] } satisfies Meta;
export default meta;

// Rebuilds M2 prompt c01; its render takes no args.
const render = () => (ProductCatalog.render as () => ReactElement)();

export const PlacementCompact = placementStory(placement, "compact", render);
export const PlacementMedium = placementStory(placement, "medium", render);
export const PlacementWide = placementStory(placement, "wide", render);

export const CatchesBrokenRules = placementBreaksStory(placement, render, {
  narrow: {
    css: '[data-break="narrow"] .kb-gallery { max-inline-size: 40rem; }',
    expected: ".kb-gallery :scope measure",
  },
  inset: {
    css: '[data-break="inset"] .kb-gallery > .kb-gallery-items { margin-inline-end: 10rem; }',
    expected: ".kb-gallery .kb-gallery-items fill",
  },
  filters: {
    css: '[data-break="filters"] .kb-gallery-filters { justify-self: start; }',
    expected: ".kb-gallery .kb-gallery-filters fill",
  },
  overflow: {
    css: '[data-break="overflow"] .kb-gallery > .kb-gallery-items { grid-template-columns: repeat(4, 30rem); }',
    expected: "overflows sideways",
  },
});
