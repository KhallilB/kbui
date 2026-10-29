import type { Meta, StoryObj } from "@storybook/react-vite";
import { useId, useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Button } from "../Button/Button";
import { Heading } from "../Heading/Heading";
import { Menu } from "../Menu/Menu";
import { Table, type TableProps, type TableSortDirection } from "./Table";

const projects = Array.from({ length: 20 }, (_, index) => ({
  id: `project-${index + 1}`,
  name: `Project ${index + 1}`,
  owner: index % 3,
  tasks: index + 3,
}));

const people = [
  { id: "ada", name: "Ada Chen", team: "Design", tasks: 12 },
  { id: "lin", name: "Lin Patel", team: "Engineering", tasks: 8 },
  { id: "sam", name: "Sam Rivera", team: "Support", tasks: 21 },
];

const meta = {
  title: "Components/Table",
  component: Table,
  tags: ["autodocs"],
  args: { dir: "ltr" },
  argTypes: { dir: { control: "inline-radio", options: ["ltr", "rtl"] } },
  render: (args) => (
    <Table.ScrollContainer label="Team workload scroll area">
      <Table {...args}>
        <Table.Caption>Team workload</Table.Caption>
        <Table.Head>
          <Table.Row>
            <Table.ColumnHeader>Name</Table.ColumnHeader>
            <Table.ColumnHeader>Team</Table.ColumnHeader>
            <Table.ColumnHeader align="end">Open tasks</Table.ColumnHeader>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {people.map((person) => (
            <Table.Row key={person.id}>
              <Table.RowHeader>{person.name}</Table.RowHeader>
              <Table.Cell>{person.team}</Table.Cell>
              <Table.Cell align="end">{person.tasks}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </Table.ScrollContainer>
  ),
} satisfies Meta<typeof Table>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};

function SelectableTable(args: TableProps) {
  const [sort, setSort] = useState<{
    column: "name" | "tasks";
    direction: Exclude<TableSortDirection, "none">;
  }>({ column: "name", direction: "ascending" });
  const [selected, setSelected] = useState<string[]>([]);
  const [message, setMessage] = useState("Choose a person’s action.");
  const sorted = [...people].sort(
    (a, b) =>
      (sort.column === "name" ? a.name.localeCompare(b.name) : a.tasks - b.tasks) *
      (sort.direction === "ascending" ? 1 : -1),
  );
  const selectable = people.filter((person) => person.id !== "sam");
  const selectedCount = selectable.filter((person) => selected.includes(person.id)).length;
  return (
    <>
      <p role="status">
        {selectedCount} people selected. {message}
      </p>
      <Table.ScrollContainer label="Selectable team scroll area">
        <Table {...args}>
          <Table.Caption>Team workload — sort by name or open tasks</Table.Caption>
          <Table.Head>
            <Table.Row>
              <Table.ColumnHeader>
                <Table.SelectionCheckbox
                  visuallyHidden
                  label="Select all available people"
                  checked={selectedCount === selectable.length}
                  indeterminate={selectedCount > 0 && selectedCount < selectable.length}
                  onCheckedChange={(checked) =>
                    setSelected(checked ? selectable.map((person) => person.id) : [])
                  }
                />
              </Table.ColumnHeader>
              <Table.ColumnHeader
                sortDirection={sort.column === "name" ? sort.direction : "none"}
                onSortChange={(direction) => setSort({ column: "name", direction })}
              >
                Name
              </Table.ColumnHeader>
              <Table.ColumnHeader
                align="end"
                sortDirection={sort.column === "tasks" ? sort.direction : "none"}
                onSortChange={(direction) => setSort({ column: "tasks", direction })}
              >
                Open tasks
              </Table.ColumnHeader>
              <Table.ColumnHeader align="end">Actions</Table.ColumnHeader>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {sorted.map((person) => (
              <Table.Row key={person.id} selected={selected.includes(person.id)}>
                <Table.Cell>
                  <Table.SelectionCheckbox
                    visuallyHidden
                    label={`Select ${person.name}`}
                    disabled={person.id === "sam"}
                    checked={selected.includes(person.id)}
                    onCheckedChange={(checked) =>
                      setSelected(
                        checked
                          ? [...selected, person.id]
                          : selected.filter((id) => id !== person.id),
                      )
                    }
                  />
                </Table.Cell>
                <Table.RowHeader>{person.name}</Table.RowHeader>
                <Table.Cell align="end">{person.tasks}</Table.Cell>
                <Table.Cell>
                  <Table.RowActions>
                    <Button variant="ghost" onClick={() => setMessage(`Editing ${person.name}`)}>
                      Edit {person.name}
                    </Button>
                    <Menu>
                      <Menu.Trigger render={<Button variant="secondary" />}>
                        More for {person.name}
                      </Menu.Trigger>
                      <Menu.Content>
                        <Menu.Item onClick={() => setMessage(`Viewing ${person.name}`)}>
                          View profile
                        </Menu.Item>
                        <Menu.Item disabled>Archive unavailable</Menu.Item>
                      </Menu.Content>
                    </Menu>
                  </Table.RowActions>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </Table.ScrollContainer>
    </>
  );
}
export const SortingAndSelection: Story = {
  render: (args) => <SelectableTable {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const name = canvas.getByRole("button", { name: "Name" });
    name.focus();
    await userEvent.keyboard("{Enter}");
    await expect(canvas.getByRole("columnheader", { name: "Name" })).toHaveAttribute(
      "aria-sort",
      "descending",
    );
    await expect(name).toHaveFocus();
    await userEvent.click(canvas.getByRole("checkbox", { name: "Select Ada Chen" }));
    await expect(
      canvas.getByRole("checkbox", { name: "Select all available people" }),
    ).toBePartiallyChecked();
    await userEvent.click(canvas.getByRole("button", { name: "Open tasks" }));
    await expect(canvas.getByRole("columnheader", { name: "Name" })).not.toHaveAttribute(
      "aria-sort",
    );
    await expect(canvas.getByRole("checkbox", { name: "Select Ada Chen" })).toBeChecked();
    await userEvent.click(canvas.getByRole("checkbox", { name: "Select all available people" }));
    await expect(canvas.getByRole("status")).toHaveTextContent("2 people selected");
    await expect(canvas.getByRole("checkbox", { name: "Select Sam Rivera" })).not.toBeChecked();
    const page = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole("button", { name: "More for Ada Chen" });
    trigger.focus();
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(page.getByRole("menuitem", { name: "View profile" })).toBeVisible());
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(trigger).toHaveFocus());
    await userEvent.click(canvas.getByRole("button", { name: "Edit Ada Chen" }));
    await expect(canvas.getByRole("status")).toHaveTextContent("Editing Ada Chen");
    await expect(canvas.getByRole("checkbox", { name: "Select Ada Chen" })).toBeChecked();
  },
};
export const DenseSticky: Story = {
  args: { density: "dense", stickyHeader: true },
  render: function StickyTable(args) {
    const titleId = useId();
    return (
      <div style={{ width: "100%", display: "grid", gap: "0.75rem" }}>
        <Heading id={titleId} level={3} size="sm">
          Project workload — scroll in both directions
        </Heading>
        <Table.ScrollContainer label="Scrollable project workload" maxHeight="18rem">
          <Table {...args} aria-labelledby={titleId} style={{ minWidth: "48rem" }}>
            <Table.Head>
              <Table.Row>
                <Table.ColumnHeader sticky="start">Project</Table.ColumnHeader>
                <Table.ColumnHeader>Owner</Table.ColumnHeader>
                <Table.ColumnHeader>Next milestone</Table.ColumnHeader>
                <Table.ColumnHeader align="end">Open tasks</Table.ColumnHeader>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {projects.map((project) => (
                <Table.Row key={project.id}>
                  <Table.RowHeader sticky="start">{project.name}</Table.RowHeader>
                  <Table.Cell>{people[project.owner]?.name}</Table.Cell>
                  <Table.Cell>Review design and implementation</Table.Cell>
                  <Table.Cell align="end">{project.tasks}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </Table.ScrollContainer>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const region = within(canvasElement).getByRole("region");
    region.focus();
    await expect(region).toHaveFocus();
    const canvas = within(canvasElement);
    const title = canvas.getByText("Project workload — scroll in both directions");
    const titleBefore = title.getBoundingClientRect();
    const head = region.querySelector("thead");
    const ownerHeader = region.querySelector("thead th:nth-child(2)");
    const ownerCell = region.querySelector("tbody tr:first-child td");
    const firstRow = region.querySelector("tbody tr");
    if (!head || !ownerHeader || !ownerCell || !firstRow)
      throw new Error("Missing table layout parts");
    const headerBefore = head.getBoundingClientRect();
    const rowBefore = firstRow.getBoundingClientRect();
    region.scrollTop = 160;
    region.scrollLeft = 80;
    await waitFor(() => {
      const titleAfter = title.getBoundingClientRect();
      expect(Math.abs(titleAfter.top - titleBefore.top)).toBeLessThan(1);
      expect(Math.abs(titleAfter.left - titleBefore.left)).toBeLessThan(1);
      expect(Math.abs(head.getBoundingClientRect().top - headerBefore.top)).toBeLessThan(1);
      expect(firstRow.getBoundingClientRect().top).toBeLessThan(rowBefore.top);
      expect(
        Math.abs(ownerHeader.getBoundingClientRect().left - ownerCell.getBoundingClientRect().left),
      ).toBeLessThan(1);
    });
  },
};
export const EmptyAndLoading: Story = {
  render: (args) => (
    <div style={{ display: "grid", gap: "1rem", width: "100%" }}>
      <p role="status">Loading team workload…</p>
      {[false, true].map((loading) => (
        <Table.ScrollContainer
          key={String(loading)}
          label={`${loading ? "Loading" : "Empty"} results scroll area`}
        >
          <Table {...args}>
            <Table.Caption>{loading ? "Team workload" : "Search results"}</Table.Caption>
            <Table.Head>
              <Table.Row>
                <Table.ColumnHeader
                  sortDisabled={loading}
                  sortDirection={loading ? "ascending" : undefined}
                  onSortChange={loading ? () => {} : undefined}
                >
                  Name
                </Table.ColumnHeader>
                <Table.ColumnHeader>Team</Table.ColumnHeader>
              </Table.Row>
            </Table.Head>
            <Table.Body aria-busy={loading || undefined}>
              <Table.Row>
                <Table.Cell colSpan={2}>
                  {loading
                    ? "Fetching records…"
                    : "No people match this search. Try a different name."}
                </Table.Cell>
              </Table.Row>
            </Table.Body>
          </Table>
        </Table.ScrollContainer>
      ))}
    </div>
  ),
};

export const NestedTableIsolation: Story = {
  tags: ["!dev", "!autodocs"],
  render: () => (
    <div style={{ width: "100%" }}>
      <Table density="comfortable">
        <Table.Caption>Comfortable reference</Table.Caption>
        <Table.Body>
          <Table.Row>
            <Table.Cell>Reference content</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
      <Table density="dense">
        <Table.Caption>Dense parent</Table.Caption>
        <Table.Foot>
          <Table.Row>
            <Table.Cell>
              <Table density="comfortable">
                <Table.Caption>Nested comfortable table</Table.Caption>
                <Table.Head>
                  <Table.Row>
                    <Table.ColumnHeader>Nested heading</Table.ColumnHeader>
                  </Table.Row>
                </Table.Head>
                <Table.Body>
                  <Table.Row>
                    <Table.Cell>Nested content</Table.Cell>
                  </Table.Row>
                </Table.Body>
              </Table>
            </Table.Cell>
          </Table.Row>
        </Table.Foot>
      </Table>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const reference = canvas.getByRole("cell", { name: "Reference content" });
    const nested = canvas.getByRole("cell", { name: "Nested content" });
    const parent = nested.closest("table")?.closest("td");
    if (!parent) throw new Error("Missing parent cell");
    expect(getComputedStyle(nested).paddingBlockStart).toBe(
      getComputedStyle(reference).paddingBlockStart,
    );
    expect(getComputedStyle(nested).backgroundColor).toBe(
      getComputedStyle(reference).backgroundColor,
    );
    expect(Number.parseFloat(getComputedStyle(parent).paddingBlockStart)).toBeLessThan(
      Number.parseFloat(getComputedStyle(reference).paddingBlockStart),
    );
  },
};

function SingleCellTable({ label, children }: { label: string; children: TableProps["children"] }) {
  return (
    <Table aria-label={label}>
      <Table.Body>
        <Table.Row>
          <Table.Cell>{children}</Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table>
  );
}

export const StickyFocusVisibility: Story = {
  tags: ["!dev", "!autodocs"],
  render: () => (
    <div style={{ width: "100%", display: "grid", gap: "1rem" }}>
      {(["ltr", "rtl"] as const).flatMap((dir) =>
        (["start", "end"] as const).map((edge) => (
          <div key={`${dir}-${edge}`} style={{ width: 320, maxWidth: "100%" }}>
            <Table.ScrollContainer
              label={`${dir} ${edge} pinned actions`}
              dir={dir}
              maxHeight="140px"
            >
              <Table
                layout="fixed"
                dir={dir}
                style={{ minWidth: "60rem" }}
                aria-label={`${dir} ${edge} project actions`}
              >
                <colgroup>
                  <col style={{ width: edge === "start" ? 220 : 440 }} />
                  <col style={{ width: 300 }} />
                  <col style={{ width: edge === "end" ? 220 : 440 }} />
                  <col style={{ width: 0 }} />
                </colgroup>
                <Table.Head>
                  <Table.Row>
                    <Table.ColumnHeader sticky={edge === "start" ? "start" : undefined}>
                      Project label
                    </Table.ColumnHeader>
                    <Table.ColumnHeader>Action</Table.ColumnHeader>
                    <Table.ColumnHeader sticky={edge === "end" ? "end" : undefined}>
                      Other
                    </Table.ColumnHeader>
                    <Table.ColumnHeader hidden sticky={edge === "start" ? "end" : "start"}>
                      Hidden column
                    </Table.ColumnHeader>
                  </Table.Row>
                </Table.Head>
                <Table.Body>
                  <Table.Row>
                    <Table.RowHeader sticky={edge === "start" ? "start" : undefined}>
                      Pinned name
                      {edge === "start" && (
                        <SingleCellTable label={`Nested ${dir} ${edge}`}>
                          <button type="button">
                            Nested {dir} {edge}
                          </button>
                        </SingleCellTable>
                      )}
                    </Table.RowHeader>
                    <Table.Cell>
                      <Table.ScrollContainer label={`Nested scroll ${dir} ${edge}`}>
                        <SingleCellTable label={`Nested actions ${dir} ${edge}`}>
                          <button type="button" aria-label={`Edit ${dir} ${edge}`}>
                            Edit
                          </button>
                        </SingleCellTable>
                      </Table.ScrollContainer>
                    </Table.Cell>
                    <Table.Cell sticky={edge === "end" ? "end" : undefined}>
                      <button type="button" aria-label={`Last ${dir} ${edge}`}>
                        Last
                      </button>
                      {edge === "end" && (
                        <SingleCellTable label={`Nested ${dir} ${edge}`}>
                          <button type="button">
                            Nested {dir} {edge}
                          </button>
                        </SingleCellTable>
                      )}
                    </Table.Cell>
                    <Table.Cell hidden sticky={edge === "start" ? "end" : "start"}>
                      Hidden value
                    </Table.Cell>
                  </Table.Row>
                </Table.Body>
              </Table>
            </Table.ScrollContainer>
          </div>
        )),
      )}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const dir of ["ltr", "rtl"]) {
      for (const edge of ["start", "end"]) {
        const region = canvas.getByRole("region", { name: `${dir} ${edge} pinned actions` });
        const edit = canvas.getByRole("button", { name: `Edit ${dir} ${edge}` });
        canvas.getByRole("button", { name: `Last ${dir} ${edge}` }).focus();
        await userEvent.tab({ shift: true });
        await expect(edit).toHaveFocus();
        await waitFor(() => {
          const bounds = edit.getBoundingClientRect();
          const pinned = region
            .querySelector(`tbody [data-sticky="${edge}"]`)
            ?.getBoundingClientRect();
          if (!pinned) throw new Error("Missing pinned cell");
          if ((dir === "ltr") === (edge === "start"))
            expect(bounds.left).toBeGreaterThanOrEqual(pinned.right);
          else expect(bounds.right).toBeLessThanOrEqual(pinned.left);
          expect(bounds.left).toBeGreaterThanOrEqual(region.getBoundingClientRect().left);
          expect(bounds.right).toBeLessThanOrEqual(region.getBoundingClientRect().right);
        });
        region.scrollLeft = dir === "rtl" ? -200 : 200;
        const scrollBefore = region.scrollLeft;
        canvas.getByRole("button", { name: `Nested ${dir} ${edge}` }).focus();
        expect(region.scrollLeft).toBe(scrollBefore);
      }
    }
  },
};

export const StickyHeaderFocus: Story = {
  tags: ["!dev", "!autodocs"],
  render: () => (
    <Table.ScrollContainer label="Vertical action list" maxHeight="140px">
      <Table stickyHeader aria-label="Project actions">
        <Table.Head>
          <Table.Row>
            <Table.ColumnHeader>Actions</Table.ColumnHeader>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {projects.map((project) => (
            <Table.Row key={project.id}>
              <Table.Cell>
                <button type="button">Open {project.name}</button>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </Table.ScrollContainer>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const buttons = canvas.getAllByRole("button");
    const header = canvasElement.querySelector("thead");
    if (!header || !buttons.length) throw new Error("Missing action list");
    buttons.at(-1)?.focus();
    for (let index = buttons.length - 2; index >= 0; index--) {
      await userEvent.tab({ shift: true });
      const button = buttons[index];
      if (!button) throw new Error("Missing action");
      expect(button).toHaveFocus();
      expect(button.getBoundingClientRect().top).toBeGreaterThanOrEqual(
        header.getBoundingClientRect().bottom,
      );
    }
    await userEvent.tab();
    expect(buttons[1]).toHaveFocus();
  },
};
