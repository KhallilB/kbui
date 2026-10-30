import type { Meta } from "@storybook/react-vite";
import { placementStory } from "../../protocol/placement-story";
import { ErrorSummary } from "./ErrorSummary";
import { placement } from "./ErrorSummary.placement";

const meta = { title: "Placement/ErrorSummary", tags: ["!dev", "!autodocs"] } satisfies Meta;
export default meta;

const render = () => (
  <ErrorSummary
    title="There is a problem"
    description="Fix the highlighted fields before saving."
    items={[
      { href: "#workspace-name", label: "Enter a workspace name" },
      { href: "#incident-notes", label: "Enter an incident handoff summary" },
    ]}
  />
);

export const PlacementCompact = placementStory(placement, "compact", render);
export const PlacementMedium = placementStory(placement, "medium", render);
export const PlacementWide = placementStory(placement, "wide", render);
