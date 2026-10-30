import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { placementStory } from "../../protocol/placement-story";
import { brokenWords } from "../../protocol/text-check";
import { Button } from "../Button/Button";
import type { CollectionColumn } from "./Collection";
import { Collection } from "./Collection";
import { placement } from "./Collection.placement";

const meta = { title: "Placement/Collection", tags: ["!dev", "!autodocs"] } satisfies Meta;
export default meta;

type Project = { id: string; name: string; owner: string; team: string; milestone: string };
const items: Project[] = Array.from({ length: 12 }, (_, index) => ({
  id: `project-${index + 1}`,
  name: `Website refresh ${index + 1}`,
  owner: ["Mara Chen", "Alex Rivera", "Sam Okafor"][index % 3] ?? "",
  team: ["Engineering", "Operations", "Marketing"][index % 3] ?? "",
  milestone: "Review design and implementation",
}));
const columns: CollectionColumn<Project>[] = [
  { key: "name", header: "Project", cell: (item) => item.name },
  { key: "owner", header: "Owner", cell: (item) => item.owner },
  { key: "team", header: "Team", cell: (item) => item.team },
  { key: "milestone", header: "Next milestone", cell: (item) => item.milestone },
  { key: "reviewer", header: "Reviewer", cell: (item) => item.owner },
  { key: "department", header: "Department", cell: (item) => item.team },
];

const render = () => (
  <Collection
    label="Projects"
    items={items}
    columns={columns.slice(0, 3)}
    getKey={(item) => item.id}
    getItemLabel={(item) => item.name}
    defaultState={{ pageSize: 5 }}
    bulkActions={[{ key: "archive", label: "Archive", onAction: () => {} }]}
    toolbar={<Button variant="primary">New project</Button>}
  />
);

export const PlacementCompact = placementStory(placement, "compact", render);
export const PlacementMedium = placementStory(placement, "medium", render);
export const PlacementWide = placementStory(placement, "wide", render);

// Many columns at 390px: the table scrolls and keeps whole words.
export const KeepsWordsCompact: StoryObj = {
  tags: ["!dev", "!autodocs"],
  globals: { viewport: { value: "mobile", isRotated: false } },
  parameters: { layout: "fullscreen" },
  render: () => (
    <Collection
      label="Projects"
      items={items}
      columns={columns}
      getKey={(item) => item.id}
      getItemLabel={(item) => item.name}
      defaultState={{ pageSize: 5 }}
    />
  ),
  play: async ({ canvasElement }) => {
    const cells = canvasElement.querySelectorAll(".kb-collection-head, .kb-collection-cell");
    expect(brokenWords(cells)).toEqual([]);
  },
};
