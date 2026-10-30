import type { Meta } from "@storybook/react-vite";
import { placementStory } from "../../protocol/placement-story";
import { Button } from "../Button/Button";
import { EmptyState } from "./EmptyState";
import { placement } from "./EmptyState.placement";

const meta = { title: "Placement/EmptyState", tags: ["!dev", "!autodocs"] } satisfies Meta;
export default meta;

const render = () => (
  <EmptyState
    title="No pipelines yet"
    description="Create a pipeline to run checks on every pull request and keep releases repeatable across your team."
    actions={
      <>
        <Button size="sm">Create pipeline</Button>
        <Button size="sm" variant="secondary">
          Import template
        </Button>
      </>
    }
  />
);

export const PlacementCompact = placementStory(placement, "compact", render);
export const PlacementMedium = placementStory(placement, "medium", render);
export const PlacementWide = placementStory(placement, "wide", render);
