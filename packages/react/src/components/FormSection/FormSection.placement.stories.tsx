import type { Meta } from "@storybook/react-vite";
import { placementBreaksStory } from "../../protocol/placement-breaks";
import { placementStory } from "../../protocol/placement-story";
import { Button } from "../Button/Button";
import { Input } from "../Input/Input";
import { FormSection } from "./FormSection";
import { placement } from "./FormSection.placement";

const meta = { title: "Placement/FormSection", tags: ["!dev", "!autodocs"] } satisfies Meta;
export default meta;

const render = () => (
  <FormSection
    layout="split"
    title="Profile"
    description="Shown to everyone in the workspace."
    actions={<Button>Save profile</Button>}
  >
    <Input label="Display name" defaultValue="Ada Lovelace" />
    <Input label="Job title" defaultValue="Analyst" />
  </FormSection>
);

export const PlacementCompact = placementStory(placement, "compact", render);
export const PlacementMedium = placementStory(placement, "medium", render);
export const PlacementWide = placementStory(placement, "wide", render);

export const CatchesBrokenRules = placementBreaksStory(placement, render, {
  start: {
    css: '[data-break="start"] .kb-formsection-actions { justify-content: flex-start; }',
    expected: ".kb-formsection .kb-formsection-actions end",
  },
  stacked: {
    css: '[data-break="stacked"] .kb-formsection > * { flex-basis: 100% !important; }',
    expected: ".kb-formsection :scope line",
  },
});
