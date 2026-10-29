import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { CollectionRow } from "../CollectionRow/CollectionRow";
import { Input } from "../Input/Input";
import { Link } from "../Link/Link";
import { Status } from "../Status/Status";
import { CollectionList } from "./CollectionList";

const projects = [
  { id: "portal", name: "Customer portal", owner: "Ada Chen", status: "Ready" },
  { id: "search", name: "Search improvements", owner: "Lin Patel", status: "In review" },
  { id: "docs", name: "Documentation", owner: "Sam Rivera", status: "Draft" },
];
const meta = {
  title: "Components/CollectionList",
  component: CollectionList,
  tags: ["autodocs"],
  args: { density: "comfortable", dividers: true },
  render: (args) => (
    <CollectionList {...args} aria-label="Projects">
      {projects.map((project) => (
        <CollectionRow
          key={project.id}
          title={<Link href={`#${project.id}`}>{project.name}</Link>}
          description={`Owned by ${project.owner}`}
          metadata={<Status>{project.status}</Status>}
        />
      ))}
    </CollectionList>
  ),
} satisfies Meta<typeof CollectionList>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Ordered: Story = {
  args: { density: "dense", as: "ol", start: 3, type: "A" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const list = canvas.getByRole("list");
    expect(list.tagName).toBe("OL");
    expect(list).toHaveAttribute("start", "3");
    expect(getComputedStyle(list).listStyleType).toBe("upper-alpha");
    list.removeAttribute("type");
    expect(getComputedStyle(list).listStyleType).toBe("decimal");
    list.setAttribute("type", "A");
    expect(getComputedStyle(canvas.getAllByRole("listitem")[0] as HTMLElement).display).toBe(
      "list-item",
    );
  },
};
export const Filterable: Story = {
  render: function FilteredProjects(args) {
    const [query, setQuery] = useState("");
    const visible = projects.filter((project) =>
      project.name.toLowerCase().includes(query.toLowerCase()),
    );
    return (
      <div style={{ width: "100%", display: "grid", gap: "1rem" }}>
        <Input
          type="search"
          label="Find projects"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <p role="status">
          {visible.length} {visible.length === 1 ? "project" : "projects"} found
        </p>
        {visible.length ? (
          <CollectionList {...args} aria-label="Matching projects">
            {visible.map((project) => (
              <CollectionRow
                key={project.id}
                title={<Link href={`#${project.id}`}>{project.name}</Link>}
                description={project.owner}
                metadata={project.status}
              />
            ))}
          </CollectionList>
        ) : (
          <p>No projects match. Try a different name.</p>
        )}
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const search = canvas.getByRole("searchbox", { name: "Find projects" });
    await userEvent.type(search, "portal");
    expect(canvas.getAllByRole("listitem")).toHaveLength(1);
    expect(canvas.getByRole("status")).toHaveTextContent("1 project found");
    await userEvent.clear(search);
    await userEvent.type(search, "missing");
    expect(canvas.queryByRole("list")).toBeNull();
    expect(canvas.getByText("No projects match. Try a different name.")).toBeVisible();
    await userEvent.clear(search);
    expect(canvas.getAllByRole("listitem")).toHaveLength(3);
    expect(search).toHaveFocus();
  },
};
export const NestedRtlIsolation: Story = {
  tags: ["!dev", "!autodocs"],
  render: () => (
    <div style={{ width: 288, maxWidth: "100%" }}>
      <CollectionList dir="rtl" density="dense" aria-label="RTL projects">
        <CollectionRow
          title="Parent project"
          leading={<span aria-hidden="true">A</span>}
          metadata="Ready"
          description={
            <CollectionList density="comfortable" aria-label="Nested details">
              <CollectionRow
                title="Nested record"
                description="Independent row spacing and columns"
              />
            </CollectionList>
          }
        />
      </CollectionList>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const list = canvas.getByRole("list", { name: "RTL projects" });
    const row = list.firstElementChild as HTMLElement;
    const nested = within(canvas.getByRole("list", { name: "Nested details" })).getByRole(
      "listitem",
    );
    expect(Number.parseFloat(getComputedStyle(nested).paddingBlockStart)).toBeGreaterThan(
      Number.parseFloat(getComputedStyle(row).paddingBlockStart),
    );
    const leading = row.querySelector(".kb-collectionrow-leading");
    const content = row.querySelector(".kb-collectionrow-content");
    const nestedContent = nested.querySelector(".kb-collectionrow-content");
    if (!leading || !content || !nestedContent) throw new Error("Missing row slots");
    expect(leading.getBoundingClientRect().left).toBeGreaterThan(
      content.getBoundingClientRect().left,
    );
    const padding =
      Number.parseFloat(getComputedStyle(nested).paddingInlineStart) +
      Number.parseFloat(getComputedStyle(nested).paddingInlineEnd);
    expect(nestedContent.getBoundingClientRect().width).toBeGreaterThanOrEqual(
      nested.clientWidth - padding - 1,
    );
    expect(list.scrollWidth).toBeLessThanOrEqual(list.clientWidth + 1);
  },
};
