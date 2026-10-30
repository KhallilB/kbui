import type { Meta } from "@storybook/react-vite";
import { placementBreaksStory } from "../../protocol/placement-breaks";
import { placementStory } from "../../protocol/placement-story";
import { Button } from "../Button/Button";
import { PageHeader } from "./PageHeader";
import { placement } from "./PageHeader.placement";

const meta = { title: "Placement/PageHeader", tags: ["!dev", "!autodocs"] } satisfies Meta;
export default meta;

const render = () => (
  <PageHeader
    title="Orders"
    description="Review, fulfil and refund orders from every sales channel."
    actions={
      <>
        <Button variant="secondary">Export</Button>
        <Button>Create order</Button>
      </>
    }
  />
);

export const PlacementCompact = placementStory(placement, "compact", render);
export const PlacementMedium = placementStory(placement, "medium", render);
export const PlacementWide = placementStory(placement, "wide", render);

export const CatchesBrokenRules = placementBreaksStory(placement, render, {
  below: {
    css: '[data-break="below"] .kb-pageheader-actions { flex-basis: 100%; margin-inline-start: 0; justify-content: flex-start; }',
    expected: ".kb-pageheader .kb-pageheader-main line",
  },
  start: {
    css: '[data-break="start"] .kb-pageheader-actions { margin-inline-start: 0; justify-content: flex-start; flex-grow: 1; }',
    expected: ".kb-pageheader .kb-pageheader-actions end",
  },
});
