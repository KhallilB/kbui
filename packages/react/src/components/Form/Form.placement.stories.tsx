import type { Meta } from "@storybook/react-vite";
import type { ReactElement } from "react";
import { placementBreaksStory } from "../../protocol/placement-breaks";
import { placementStory } from "../../protocol/placement-story";
import { placement } from "./Form.placement";
import { HotelBooking } from "./Form.stories";

const meta = { title: "Placement/Form", tags: ["!dev", "!autodocs"] } satisfies Meta;
export default meta;

// Rebuilds M2 prompt c09 at the default width, which the measure rule names; its render takes no args.
const render = () => (HotelBooking.render as () => ReactElement)();

export const PlacementCompact = placementStory(placement, "compact", render);
export const PlacementMedium = placementStory(placement, "medium", render);
export const PlacementWide = placementStory(placement, "wide", render);

export const CatchesBrokenRules = placementBreaksStory(placement, render, {
  first: {
    css: '[data-break="first"] .kb-form-actions { order: -1; }',
    expected: ".kb-form .kb-form-actions last",
  },
  narrow: {
    css: '[data-break="narrow"] .kb-form { max-inline-size: 20rem; }',
    expected: ".kb-form :scope measure",
  },
  overlap: {
    css: '[data-break="overlap"] .kb-form-actions > * + * { margin-inline-start: -3rem; }',
    expected: "overlaps",
  },
});
