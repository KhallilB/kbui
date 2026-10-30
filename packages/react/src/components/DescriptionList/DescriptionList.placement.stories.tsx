import type { Meta } from "@storybook/react-vite";
import { placementStory } from "../../protocol/placement-story";
import { DescriptionList } from "./DescriptionList";
import { placement } from "./DescriptionList.placement";

const meta = { title: "Placement/DescriptionList", tags: ["!dev", "!autodocs"] } satisfies Meta;
export default meta;

const facts = { Owner: "Ada Chen", Status: "Awaiting review", "Open tasks": "12" };

const render = () => (
  <DescriptionList aria-label="Project details" layout="responsive">
    {Object.entries(facts).map(([term, detail]) => (
      <DescriptionList.Item key={term}>
        <DescriptionList.Term>{term}</DescriptionList.Term>
        <DescriptionList.Detail>{detail}</DescriptionList.Detail>
      </DescriptionList.Item>
    ))}
  </DescriptionList>
);

export const PlacementCompact = placementStory(placement, "compact", render);
export const PlacementMedium = placementStory(placement, "medium", render);
export const PlacementWide = placementStory(placement, "wide", render);
