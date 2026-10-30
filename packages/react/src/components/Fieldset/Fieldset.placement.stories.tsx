import type { Meta } from "@storybook/react-vite";
import { placementStory } from "../../protocol/placement-story";
import { Input } from "../Input/Input";
import { Textarea } from "../Textarea/Textarea";
import { Fieldset } from "./Fieldset";
import { placement } from "./Fieldset.placement";

const meta = { title: "Placement/Fieldset", tags: ["!dev", "!autodocs"] } satisfies Meta;
export default meta;

const render = () => (
  <Fieldset legend="Workspace profile" description="Shown to members across shared projects.">
    <Input label="Workspace name" defaultValue="Northwind Ops" />
    <Textarea label="Summary" rows={3} defaultValue="Shared incident runbooks." />
  </Fieldset>
);

export const PlacementCompact = placementStory(placement, "compact", render);
export const PlacementMedium = placementStory(placement, "medium", render);
export const PlacementWide = placementStory(placement, "wide", render);
