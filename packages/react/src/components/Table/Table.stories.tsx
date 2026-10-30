import type { Meta, StoryObj } from "@storybook/react-vite";
import { useId, useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Button } from "../Button/Button";
import { Heading } from "../Heading/Heading";
import { Menu } from "../Menu/Menu";
import { Text } from "../Text/Text";
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
  render: (args) => <SelectableTable {...args} />,
} satisfies Meta<typeof Table>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};

function SelectableTable(args: TableProps) {
  const titleId = useId();
  const hintId = useId();
  const [sort, setSort] = useState<{
    column: "name" | "tasks";
    direction: Exclude<TableSortDirection, "none">;
  }>({ column: "name", direction: "ascending" });
  const [selected, setSelected] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const sorted = [...people].sort((a, b) => {
    const difference = sort.column === "name" ? a.name.localeCompare(b.name) : a.tasks - b.tasks;
    return sort.direction === "ascending" ? difference : -difference;
  });
  const selectable = people.filter((person) => person.id !== "sam");
  const selectedCount = selectable.filter((person) => selected.includes(person.id)).length;
  return (
    <div style={{ display: "grid", gap: "var(--kb-space-3)", width: "100%" }}>
      <Heading id={titleId} level={3} size="sm">
        Team workload
      </Heading>
      <Text id={hintId} size="sm" tone="muted">
        Sort by member or open tasks.
      </Text>
      <Text role="status" size="sm">
        {selectedCount} of {selectable.length} selected{message && `. ${message}`}
      </Text>
      <Table.ScrollContainer label="Selectable team scroll area">
        <Table
          {...args}
          aria-labelledby={titleId}
          aria-describedby={hintId}
          style={
            {
              minWidth: "24rem",
              "--kb-table-cell-padding-inline": "var(--kb-space-3)",
            } as TableProps["style"]
          }
        >
          <colgroup>
            <col style={{ width: "3.5rem" }} />
            <col />
            <col style={{ width: "8.5rem" }} />
            <col style={{ width: "7rem" }} />
          </colgroup>
          <Table.Head>
            <Table.Row>
              <Table.ColumnHeader align="center">
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
              {(["name", "tasks"] as const).map((column) => (
                <Table.ColumnHeader
                  key={column}
                  align={column === "tasks" ? "end" : undefined}
                  sortDirection={sort.column === column ? sort.direction : "none"}
                  onSortChange={(direction) => setSort({ column, direction })}
                >
                  {column === "name" ? "Member" : "Open tasks"}
                </Table.ColumnHeader>
              ))}
              <Table.ColumnHeader align="end">Actions</Table.ColumnHeader>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {sorted.map((person) => (
              <Table.Row key={person.id} selected={selected.includes(person.id)}>
                <Table.Cell align="center">
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
                <Table.RowHeader>
                  {person.name}
                  {person.id === "sam" && (
                    <Text
                      as="div"
                      size="sm"
                      tone="muted"
                      style={{ fontWeight: "var(--kb-font-weight-regular)" }}
                    >
                      Selection unavailable
                    </Text>
                  )}
                </Table.RowHeader>
                <Table.Cell align="end">{person.tasks}</Table.Cell>
                <Table.Cell>
                  <Table.RowActions>
                    <Button
                      size="sm"
                      variant="ghost"
                      style={{ paddingInline: "var(--kb-space-1)" }}
                      aria-label={`Edit ${person.name}`}
                      onClick={() => setMessage(`Editing ${person.name}`)}
                    >
                      Edit
                    </Button>
                    <Menu>
                      <Menu.Trigger
                        render={
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label={`More for ${person.name}`}
                          />
                        }
                      >
                        <span aria-hidden="true">•••</span>
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
    </div>
  );
}
export const SortingAndSelection: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const name = canvas.getByRole("button", { name: "Member" });
    const region = canvas.getByRole("region", { name: "Selectable team scroll area" });
    const initialMaxWidth = region.style.maxWidth;
    try {
      region.style.maxWidth = "320px";
      const label = name.firstChild;
      if (!label) throw new Error("Missing sort label");
      const text = canvasElement.ownerDocument.createRange();
      text.selectNode(label);
      expect(text.getClientRects()).toHaveLength(1);
      name.focus();
      const header = name.closest("th");
      if (!header) throw new Error("Missing sort header");
      const corner = header.getBoundingClientRect();
      expect(
        canvasElement.ownerDocument
          .elementFromPoint(corner.left + 2, corner.top + 2)
          ?.closest("button"),
      ).toBe(name);
      const row = header.parentElement;
      if (!row) throw new Error("Missing heading row");
      const initialHeight = row.style.height;
      try {
        row.style.height = "96px";
        const tall = header.getBoundingClientRect();
        expect(name.getBoundingClientRect().height).toBeGreaterThanOrEqual(tall.height - 1);
      } finally {
        row.style.height = initialHeight;
      }
      const tasks = canvas.getByRole("button", { name: "Open tasks" });
      const value = region.querySelector('tbody tr td[data-align="end"]');
      if (!tasks.firstChild || !value) throw new Error("Missing numeric column");
      const table = canvas.getByRole("table", { name: "Team workload" });
      const initialDir = table.dir;
      try {
        for (const dir of ["ltr", "rtl"]) {
          table.dir = dir;
          const end = dir === "rtl" ? "left" : "right";
          text.selectNode(tasks.firstChild);
          expect(text.getClientRects()).toHaveLength(1);
          const headingEnd = text.getBoundingClientRect()[end];
          text.selectNodeContents(value);
          expect(Math.abs(headingEnd - text.getBoundingClientRect()[end])).toBeLessThan(1);
        }
      } finally {
        table.dir = initialDir;
      }
    } finally {
      region.style.maxWidth = initialMaxWidth;
      region.scrollLeft = 0;
    }
    await userEvent.keyboard("{Enter}");
    await expect(name).toHaveFocus();
    await userEvent.click(canvas.getByRole("checkbox", { name: "Select Ada Chen" }));
    await expect(
      canvas.getByRole("checkbox", { name: "Select all available people" }),
    ).toBePartiallyChecked();
    await userEvent.click(canvas.getByRole("button", { name: "Open tasks" }));
    await expect(canvas.getByRole("checkbox", { name: "Select Ada Chen" })).toBeChecked();
    await userEvent.click(canvas.getByRole("checkbox", { name: "Select all available people" }));
    await expect(canvas.getByRole("status")).toHaveTextContent("2 of 2 selected");
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
function StickyTable(args: TableProps) {
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
                <Table.RowHeader sticky="start">
                  <a href={`#${project.id}`}>{project.name}</a>
                </Table.RowHeader>
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
}
export const DenseSticky: Story = {
  args: { density: "dense", stickyHeader: true },
  render: (args) => <StickyTable {...args} />,
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
export const NestedTableIsolation: Story = {
  tags: ["!dev", "!autodocs"],
  render: () => (
    <div style={{ width: "100%" }}>
      <SingleCellTable label="Comfortable reference">Reference content</SingleCellTable>
      <Table density="dense">
        <Table.Caption>Dense parent</Table.Caption>
        <Table.Foot>
          <Table.Row>
            <Table.Cell>
              <Table density="comfortable" layout="fixed" style={{ width: 288 }}>
                <Table.Caption>Nested comfortable table</Table.Caption>
                <Table.Head>
                  <Table.Row>
                    <Table.ColumnHeader onSortChange={() => {}}>
                      Customer success follow-up responsibility
                    </Table.ColumnHeader>
                    <Table.ColumnHeader>ResponsibilityIdentifierWithoutBreaks</Table.ColumnHeader>
                  </Table.Row>
                </Table.Head>
                <Table.Body>
                  <Table.Row>
                    <Table.Cell>Nested content</Table.Cell>
                    <Table.Cell>12</Table.Cell>
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
    const fixed = canvas.getByRole("table", { name: "Nested comfortable table" });
    const sort = within(fixed).getByRole("button", {
      name: "Customer success follow-up responsibility",
    });
    expect(sort.scrollWidth).toBeLessThanOrEqual(sort.clientWidth + 1);
    expect(sort.scrollHeight).toBeLessThanOrEqual(sort.clientHeight + 1);
    const staticHeading = within(fixed).getByText("ResponsibilityIdentifierWithoutBreaks");
    expect(staticHeading.scrollWidth).toBeLessThanOrEqual(staticHeading.clientWidth + 1);
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
  args: { density: "dense", stickyHeader: true },
  render: (args) => <StickyTable {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const buttons = canvas.getAllByRole("link");
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
