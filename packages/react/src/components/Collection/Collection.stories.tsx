import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Collection } from "./Collection";

const records = Array.from({ length: 120 }, (_, index) => ({
  id: `project-${index + 1}`,
  name: `${["Website refresh", "Mobile checkout", "Help center", "Customer onboarding"][index % 4]} ${index + 1}`,
  owner: ["Mara Chen", "Alex Rivera", "Sam Okafor"][index % 3] ?? "",
  status: index % 3 === 0 ? "Paused" : "Active",
}));
const columns: import("@kb.ui/react").CollectionColumn<(typeof records)[number]>[] = [
  {
    key: "name",
    header: "Project",
    cell: (item) => item.name,
    compare: (a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }),
  },
  {
    key: "owner",
    header: "Owner",
    cell: (item) => item.owner,
    compare: (a, b) => a.owner.localeCompare(b.owner),
  },
  { key: "status", header: "Status", cell: (item) => item.status },
];
const facets = [
  {
    key: "status",
    label: "Status",
    options: [
      { value: "Active", label: "Active" },
      { value: "Paused", label: "Paused" },
    ],
  },
];
const matches = (
  item: (typeof records)[number],
  query: string,
  filters: Readonly<Record<string, string>>,
) =>
  `${item.name} ${item.owner}`.toLowerCase().includes(query.toLowerCase()) &&
  (!filters.status || item.status === filters.status);
const getKey = (item: (typeof records)[number]) => item.id;
const getItemLabel = (item: (typeof records)[number]) => item.name;
const meta = {
  title: "Components/Collection",
  component: Collection,
  tags: ["autodocs"],
} satisfies Meta<typeof Collection>;
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: function Projects() {
    const [items, setItems] = useState(records.slice(0, 24));
    return (
      <Collection
        label="Projects"
        items={items}
        columns={columns}
        getKey={getKey}
        getItemLabel={getItemLabel}
        matches={matches}
        filters={facets}
        defaultState={{ pageSize: 5 }}
        bulkActions={[
          {
            key: "archive",
            label: "Archive",
            onAction: (keys) =>
              setItems((current) => current.filter((item) => !keys.includes(item.id))),
          },
        ]}
      />
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Sort by Project" }));
    await expect(canvas.getByRole("columnheader", { name: /Project/ })).toHaveAttribute(
      "aria-sort",
      "ascending",
    );
    canvas.getByRole("checkbox", { name: "Select Customer onboarding 4" }).focus();
    await userEvent.keyboard(" ");
    await expect(canvas.getByRole("checkbox", { name: "Select this page" })).toHaveAttribute(
      "aria-checked",
      "mixed",
    );
    await userEvent.click(canvas.getByRole("button", { name: "Next page" }));
    await expect(canvas.getByText("1 selected")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Archive" }));
    await expect(canvas.getByText("0 selected")).toBeVisible();
    await expect(canvas.getByRole("searchbox")).toBeEnabled();
    const pageSize = canvas.getByRole("combobox", { name: "Rows per page" });
    pageSize.focus();
    await userEvent.keyboard("{ArrowDown}");
    const list = await canvas.findByRole("listbox", { name: "Rows per page" });
    await waitFor(() => expect(list.contains(document.activeElement)).toBe(true));
    await userEvent.keyboard("{End}{Enter}");
    await expect(pageSize).toHaveTextContent("50");
    await waitFor(() => expect(pageSize).toHaveFocus());
  },
};
export const LargeCollection: Story = {
  render: () => (
    <Collection
      label="Project directory"
      items={records}
      columns={columns}
      getKey={getKey}
      getItemLabel={getItemLabel}
      matches={matches}
      filters={facets}
      isItemDisabled={(item) => item.status === "Paused"}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const status = canvas.getByRole("combobox", { name: "Status" });
    await userEvent.click(status);
    await userEvent.click(await canvas.findByRole("option", { name: "Paused" }));
    await waitFor(() => expect(status).toHaveFocus());
    await expect(canvas.getByText("40 records")).toBeVisible();
    await expect(canvas.getByRole("checkbox", { name: "Select this page" })).toBeDisabled();
    await userEvent.type(canvas.getByRole("searchbox"), "missing");
    await expect(canvas.getByText("No matching records")).toBeVisible();
  },
};
export const ServerPagination: Story = {
  render: function ServerOwned() {
    const [state, setState] = useState<import("@kb.ui/react").CollectionState>({
      query: "",
      filters: {},
      sort: null,
      page: 1,
      pageSize: 10,
      selectedKeys: [],
    });
    const filtered = records.filter((item) => matches(item, state.query, state.filters));
    const column = columns.find((column) => column.key === state.sort?.key);
    if (state.sort && column?.compare)
      filtered.sort(
        (a, b) => (column.compare?.(a, b) ?? 0) * (state.sort?.direction === "descending" ? -1 : 1),
      );
    const page = Math.min(state.page, Math.max(1, Math.ceil(filtered.length / state.pageSize)));
    return (
      <Collection
        label="Server-owned projects"
        mode="server"
        items={filtered.slice((page - 1) * state.pageSize, page * state.pageSize)}
        totalItems={filtered.length}
        state={state}
        onStateChange={setState}
        columns={columns}
        getKey={getKey}
        getItemLabel={getItemLabel}
        filters={facets}
      />
    );
  },
};
export const Empty: Story = {
  render: () => (
    <Collection
      label="Projects"
      items={[]}
      columns={columns}
      getKey={getKey}
      getItemLabel={getItemLabel}
      matches={matches}
      empty="No projects yet. Create a project to get started."
    />
  ),
};
export const Loading: Story = {
  render: () => (
    <Collection
      label="Projects"
      items={[]}
      columns={columns}
      getKey={getKey}
      getItemLabel={getItemLabel}
      matches={matches}
      loading
    />
  ),
};
export const FetchError: Story = {
  render: () => (
    <Collection
      label="Projects"
      items={[]}
      columns={columns}
      getKey={getKey}
      getItemLabel={getItemLabel}
      matches={matches}
      error="Projects could not load. Check your connection and retry in your application."
    />
  ),
};
export const BulkFailure: Story = {
  render: () => (
    <Collection
      label="Projects"
      items={records.slice(0, 3)}
      columns={columns}
      getKey={getKey}
      getItemLabel={getItemLabel}
      defaultState={{ selectedKeys: ["project-1"] }}
      bulkActions={[
        {
          key: "archive",
          label: "Archive",
          onAction: async () => {
            throw new Error("Example offline failure");
          },
        },
      ]}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Archive" }));
    await expect(canvas.getByRole("alert")).toHaveTextContent("Selection kept");
    await expect(canvas.getByText("1 selected")).toBeVisible();
  },
};

export const PaginationBounds: Story = {
  tags: ["!dev", "!autodocs"],
  render: () => (
    <div style={{ inlineSize: "18rem", maxInlineSize: "100%" }}>
      <Collection.Pagination
        page={1}
        pageSize={1}
        totalItems={Number.MAX_SAFE_INTEGER}
        onPageChange={() => {}}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const nav = canvas.getByRole("navigation", { name: "Collection pagination" });
    const next = canvas.getByRole("button", { name: "Next page" });
    expect(nav.scrollWidth).toBeLessThanOrEqual(nav.clientWidth + 1);
    expect(next.getBoundingClientRect().right).toBeLessThanOrEqual(
      nav.getBoundingClientRect().right + 1,
    );
  },
};
