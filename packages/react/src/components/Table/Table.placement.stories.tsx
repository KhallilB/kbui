import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { placementStory } from "../../protocol/placement-story";
import { brokenWords } from "../../protocol/text-check";
import { Button } from "../Button/Button";
import { Table } from "./Table";
import { placement } from "./Table.placement";

const meta = { title: "Placement/Table", tags: ["!dev", "!autodocs"] } satisfies Meta;
export default meta;

const people = [
  { name: "Ada Chen", team: "Engineering", milestone: "Review design and implementation" },
  { name: "Sam Rivera", team: "Support", milestone: "Customer onboarding" },
];

const render = () => (
  <Table.ScrollContainer label="Team workload scroll area">
    <Table aria-label="Team workload">
      <Table.Head>
        <Table.Row>
          <Table.ColumnHeader>Member</Table.ColumnHeader>
          <Table.ColumnHeader>Team</Table.ColumnHeader>
          <Table.ColumnHeader>Next milestone</Table.ColumnHeader>
          <Table.ColumnHeader>Actions</Table.ColumnHeader>
        </Table.Row>
      </Table.Head>
      <Table.Body>
        {people.map((person) => (
          <Table.Row key={person.name}>
            <Table.RowHeader>{person.name}</Table.RowHeader>
            <Table.Cell>{person.team}</Table.Cell>
            <Table.Cell>{person.milestone}</Table.Cell>
            <Table.Cell>
              <Table.RowActions>
                <Button variant="secondary" size="sm">
                  Edit
                </Button>
                <Button variant="ghost" size="sm">
                  Remove
                </Button>
              </Table.RowActions>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  </Table.ScrollContainer>
);

export const PlacementCompact = placementStory(placement, "compact", render);
export const PlacementMedium = placementStory(placement, "medium", render);
export const PlacementWide = placementStory(placement, "wide", render);

// A narrow table scrolls; its headers and cells keep whole words instead of shattering.
export const KeepsWordsCompact: StoryObj = {
  tags: ["!dev", "!autodocs"],
  globals: { viewport: { value: "mobile", isRotated: false } },
  parameters: { layout: "fullscreen" },
  render,
  play: async ({ canvasElement }) => {
    const cells = canvasElement.querySelectorAll(
      ".kb-table-columnheader, .kb-table-rowheader, .kb-table-cell",
    );
    expect(brokenWords(cells)).toEqual([]);
  },
};
