import type { Meta } from "@storybook/react-vite";
import { placementBreaksStory } from "../../protocol/placement-breaks";
import { placementStory } from "../../protocol/placement-story";
import { Button } from "../Button/Button";
import { Input } from "../Input/Input";
import { FormSection, type FormSectionLayout } from "./FormSection";
import { placement } from "./FormSection.placement";

const meta = { title: "Placement/FormSection", tags: ["!dev", "!autodocs"] } satisfies Meta;
export default meta;

const section = (layout: FormSectionLayout) => () => (
  <FormSection
    layout={layout}
    title="Profile"
    description="Shown to everyone in the workspace."
    actions={<Button>Save profile</Button>}
  >
    <Input label="Display name" defaultValue="Ada Lovelace" />
    <Input label="Job title" defaultValue="Analyst" />
  </FormSection>
);
const stack = section("stack");
const split = section("split");

export const StackCompact = placementStory(placement[0], "compact", stack);
export const StackMedium = placementStory(placement[0], "medium", stack);
export const StackWide = placementStory(placement[0], "wide", stack);
export const SplitCompact = placementStory(placement[1], "compact", split);
export const SplitMedium = placementStory(placement[1], "medium", split);
export const SplitWide = placementStory(placement[1], "wide", split);

export const CatchesBrokenRules = placementBreaksStory(placement[1], split, {
  start: {
    css: '[data-break="start"] .kb-formsection-actions { justify-content: flex-start; }',
    expected: ".kb-formsection-actions end",
  },
  stacked: {
    css: '[data-break="stacked"] .kb-formsection > * { flex-basis: 100% !important; }',
    expected: ":scope line",
  },
});
