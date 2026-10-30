import type { Meta } from "@storybook/react-vite";
import * as React from "react";
import { placementStory } from "../../protocol/placement-story";
import { Toast, useToastManager } from "./Toast";
import { placement } from "./Toast.placement";

const meta = { title: "Placement/Toast", tags: ["!dev", "!autodocs"] } satisfies Meta;
export default meta;

function Messages() {
  const { add } = useToastManager();
  React.useEffect(() => {
    add({ id: "saved", title: "Changes saved", type: "success", timeout: 0 });
    add({
      id: "archived",
      title: "Project archived",
      description: "You can restore it from the archive.",
      timeout: 0,
      actionProps: { children: "Undo" },
    });
  }, [add]);
  return <Toast.Viewport placement="inline" />;
}

const render = () => (
  <Toast.Provider>
    <Messages />
  </Toast.Provider>
);

export const PlacementCompact = placementStory(placement, "compact", render);
export const PlacementMedium = placementStory(placement, "medium", render);
export const PlacementWide = placementStory(placement, "wide", render);
