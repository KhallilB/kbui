import type { Meta } from "@storybook/react-vite";
import { placementStory } from "../../protocol/placement-story";
import { Button } from "../Button/Button";
import { Dialog } from "./Dialog";
import { placement } from "./Dialog.placement";

const meta = { title: "Placement/Dialog", tags: ["!dev", "!autodocs"] } satisfies Meta;
export default meta;

const render = () => (
  <Dialog defaultOpen>
    <Dialog.Content title="Archive project" description="Members lose access until it is restored.">
      <Dialog.Actions>
        <Dialog.Close render={<Button variant="ghost" />}>Cancel</Dialog.Close>
        <Button variant="primary">Archive</Button>
      </Dialog.Actions>
    </Dialog.Content>
  </Dialog>
);

export const PlacementCompact = placementStory(placement, "compact", render);
export const PlacementMedium = placementStory(placement, "medium", render);
export const PlacementWide = placementStory(placement, "wide", render);
