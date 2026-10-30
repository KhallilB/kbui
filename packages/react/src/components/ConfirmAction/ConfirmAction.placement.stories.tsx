import type { Meta } from "@storybook/react-vite";
import { useState } from "react";
import { placementStory } from "../../protocol/placement-story";
import { ConfirmAction } from "./ConfirmAction";
import { placement } from "./ConfirmAction.placement";

const meta = { title: "Placement/ConfirmAction", tags: ["!dev", "!autodocs"] } satisfies Meta;
export default meta;

// Portals into the canvas, where the placement story looks for roots.
function DeleteProject() {
  const [container, setContainer] = useState<HTMLElement | null>(null);
  return (
    <div ref={setContainer}>
      {container ? (
        <ConfirmAction
          defaultOpen
          container={container}
          title="Delete project?"
          description="This permanently removes the project and its data."
          details={<p>Three environments and 1,204 runs are removed with it.</p>}
          onConfirm={() => undefined}
        >
          Delete project
        </ConfirmAction>
      ) : null}
    </div>
  );
}

const render = () => <DeleteProject />;

export const PlacementCompact = placementStory(placement, "compact", render);
export const PlacementMedium = placementStory(placement, "medium", render);
export const PlacementWide = placementStory(placement, "wide", render);
