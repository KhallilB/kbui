import type { Meta } from "@storybook/react-vite";
import { placementStory } from "../../protocol/placement-story";
import { Accordion } from "./Accordion";
import { placement } from "./Accordion.placement";

const meta = { title: "Placement/Accordion", tags: ["!dev", "!autodocs"] } satisfies Meta;
export default meta;

const render = () => (
  <Accordion defaultValue={["delivery"]}>
    {[
      ["delivery", "When will my order arrive?", "Orders dispatch within two working days."],
      ["returns", "Can I return an item?", "Returns are free within 30 days."],
    ].map(([value, question, answer]) => (
      <Accordion.Item key={value} value={value}>
        <Accordion.Header>
          <Accordion.Trigger>{question}</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Panel>{answer}</Accordion.Panel>
      </Accordion.Item>
    ))}
  </Accordion>
);

export const PlacementCompact = placementStory(placement, "compact", render);
export const PlacementMedium = placementStory(placement, "medium", render);
export const PlacementWide = placementStory(placement, "wide", render);
