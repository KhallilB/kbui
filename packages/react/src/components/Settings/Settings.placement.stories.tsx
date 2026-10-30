import type { Meta } from "@storybook/react-vite";
import type { ReactElement } from "react";
import { placementBreaksStory } from "../../protocol/placement-breaks";
import { placementStory } from "../../protocol/placement-story";
import { placement } from "./Settings.placement";
import { TeamMembers } from "./Settings.stories";

const meta = { title: "Placement/Settings", tags: ["!dev", "!autodocs"] } satisfies Meta;
export default meta;

// Rebuilds M2 prompt s04, whose member rows carry status and actions; its render takes no args.
const render = () => (TeamMembers.render as () => ReactElement)();

export const PlacementCompact = placementStory(placement, "compact", render);
export const PlacementMedium = placementStory(placement, "medium", render);
export const PlacementWide = placementStory(placement, "wide", render);

export const CatchesBrokenRules = placementBreaksStory(placement, render, {
  wrap: {
    css: '[data-break="wrap"] .kb-settings .kb-collectionrow-aside { display: grid; }',
    expected: ".kb-settings .kb-collectionrow-aside line",
  },
  narrow: {
    css: '[data-break="narrow"] .kb-settings { max-inline-size: 30rem; margin-inline: auto; }',
    expected: ".kb-settings :scope fill",
  },
  overflow: {
    css: '[data-break="overflow"] .kb-settings-header { min-inline-size: 120rem; }',
    expected: "overflows sideways",
  },
});
