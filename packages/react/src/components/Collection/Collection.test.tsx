import { act, fireEvent, render, renderHook, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, Suspense, startTransition, useState } from "react";
import { describe, expect, test, vi } from "vitest";
import { Collection, CollectionBulkActions, CollectionPagination } from "./Collection";
import { useCollection } from "./useCollection";

const records = [
  { id: "c", name: "Cedar", status: "active" },
  { id: "a", name: "Ash", status: "active" },
  { id: "b", name: "Birch", status: "paused" },
  { id: "d", name: "Dogwood", status: "paused" },
] satisfies { id: string; name: string; status: string }[];
const options = {
  items: records,
  getItemLabel: (item: (typeof records)[number]) => item.name,
  getKey: (item: (typeof records)[number]) => item.id,
  matches: (
    item: (typeof records)[number],
    query: string,
    filters: Readonly<Record<string, string>>,
  ) =>
    item.name.toLowerCase().includes(query.toLowerCase()) &&
    (!filters.status || filters.status === item.status),
  compare: (a: (typeof records)[number], b: (typeof records)[number]) =>
    a.name.localeCompare(b.name),
  isItemDisabled: (item: (typeof records)[number]) => item.id === "b",
  defaultState: { pageSize: 2 },
};

const columns = [
  {
    key: "name",
    header: "Name",
    cell: (item: (typeof records)[number]) => item.name,
    compare: options.compare,
  },
];

describe("useCollection", () => {
  test("retained completion preserves selection introduced after a dataset refresh", () => {
    const { result, rerender } = renderHook(
      ({ items }) => useCollection({ ...options, items, defaultState: { selectedKeys: ["c"] } }),
      { initialProps: { items: records } },
    );
    const finish = result.current.removeSelection;
    rerender({ items: [...records, { id: "e", name: "Elm", status: "active" }] });
    act(() => result.current.toggle("e", true));
    act(() => finish(["c"]));
    expect(result.current.state.selectedKeys).toEqual(["e"]);
  });
  test("retained controlled completion preserves later accepted selection", () => {
    const onStateChange = vi.fn();
    const state = { query: "", filters: {}, sort: null, page: 1, pageSize: 2, selectedKeys: ["c"] };
    const { result, rerender } = renderHook(
      ({ value }) => useCollection({ ...options, state: value, onStateChange }),
      { initialProps: { value: state } },
    );
    const finish = result.current.removeSelection;
    rerender({ value: { ...state, selectedKeys: ["c", "a"] } });
    act(() => finish(["c"]));
    expect(onStateChange).toHaveBeenLastCalledWith({ ...state, selectedKeys: ["a"] });
  });
  test("retained toggle respects updated eligibility", () => {
    const onStateChange = vi.fn();
    const { result, rerender } = renderHook(
      ({ disabled }) =>
        useCollection({
          ...options,
          isItemDisabled: (item) => item.id === disabled,
          onStateChange,
        }),
      { initialProps: { disabled: "b" } },
    );
    const toggle = result.current.toggle;
    rerender({ disabled: "c" });
    act(() => toggle("c", true));
    expect(onStateChange).not.toHaveBeenCalled();
    expect(result.current.state.selectedKeys).toEqual([]);
  });
  test("retained toggle recognizes newly supplied records", () => {
    const { result, rerender } = renderHook(({ items }) => useCollection({ ...options, items }), {
      initialProps: { items: records },
    });
    const toggle = result.current.toggle;
    rerender({ items: [...records, { id: "e", name: "Elm", status: "active" }] });
    act(() => toggle("e", true));
    expect(result.current.state.selectedKeys).toEqual(["e"]);
  });
  test("batched page bounds use the newly requested page size", () => {
    const { result } = renderHook(() => useCollection(options));
    act(() => {
      result.current.setPageSize(1);
      result.current.setPage(4);
    });
    expect(result.current.state.page).toBe(4);
    expect(result.current.items.map((item) => item.id)).toEqual(["d"]);
  });
  test.each(["page", "filter", "sort"] as const)(
    "batched %s then page selection uses destination records",
    (transition) => {
      const { result } = renderHook(() => useCollection(options));
      act(() => {
        if (transition === "page") result.current.setPage(2);
        if (transition === "filter") result.current.setFilter("status", "paused");
        if (transition === "sort") result.current.setSort({ key: "name", direction: "ascending" });
        result.current.selectPage(true);
      });
      expect(result.current.state.selectedKeys).toEqual(transition === "sort" ? ["a"] : ["d"]);
    },
  );
  test("rejected controlled query does not leak into the next proposal", () => {
    const onStateChange = vi.fn();
    const state = { query: "", filters: {}, sort: null, page: 1, pageSize: 2, selectedKeys: [] };
    const { result } = renderHook(() => useCollection({ ...options, state, onStateChange }));
    act(() => result.current.setQuery("rejected"));
    act(() => result.current.toggle("c", true));
    expect(result.current.state.query).toBe("");
    expect(onStateChange).toHaveBeenLastCalledWith({ ...state, selectedKeys: ["c"] });
  });
  test("rejected controlled selection does not leak into the next proposal", () => {
    const onStateChange = vi.fn();
    const state = { query: "", filters: {}, sort: null, page: 1, pageSize: 2, selectedKeys: [] };
    const { result } = renderHook(() => useCollection({ ...options, state, onStateChange }));
    act(() => result.current.toggle("c", true));
    act(() => result.current.toggle("a", true));
    expect(onStateChange).toHaveBeenLastCalledWith({ ...state, selectedKeys: ["a"] });
  });
  test("batched transitions compose instead of losing prior selection", () => {
    const { result } = renderHook(() => useCollection(options));
    act(() => {
      result.current.toggle("c", true);
      result.current.toggle("a", true);
      result.current.setPage(2);
    });
    expect(result.current.state.selectedKeys).toEqual(["c", "a"]);
    expect(result.current.state.page).toBe(2);
  });
  test("removed records stay deselected when reintroduced and clamped pages stay put", () => {
    const { result, rerender } = renderHook(({ items }) => useCollection({ ...options, items }), {
      initialProps: { items: records },
    });
    act(() => result.current.toggle("c", true));
    act(() => result.current.setPage(2));
    rerender({ items: records.slice(1, 2) });
    rerender({ items: records });
    expect(result.current.state.selectedKeys).toEqual([]);
    expect(result.current.state.page).toBe(1);
  });
  test("sort ties preserve input order and server counts reject invalid values", () => {
    const { result } = renderHook(() => useCollection({ ...options, compare: () => 0 }));
    act(() => result.current.setSort({ key: "name", direction: "descending" }));
    expect(result.current.items.map((item) => item.id)).toEqual(["c", "a"]);
    expect(() =>
      renderHook(() => useCollection({ ...options, mode: "server", totalItems: -1 })),
    ).toThrow(RangeError);
  });
  test("filters, then sorts stably, then paginates without mutating records", () => {
    const { result } = renderHook(() => useCollection(options));
    act(() => result.current.setSort({ key: "name", direction: "ascending" }));
    expect(result.current.items.map((item) => item.id)).toEqual(["a", "b"]);
    act(() => result.current.setPage(2));
    expect(result.current.items.map((item) => item.id)).toEqual(["c", "d"]);
    act(() => result.current.setFilter("status", "active"));
    expect(result.current.state.page).toBe(1);
    expect(result.current.items.map((item) => item.id)).toEqual(["a", "c"]);
    act(() => result.current.setQuery("ced"));
    expect(result.current.totalItems).toBe(1);
    expect(result.current.items[0]?.id).toBe("c");
    expect(records.map((item) => item.id)).toEqual(["c", "a", "b", "d"]);
  });

  test("page selection skips disabled records and preserves off-page IDs", () => {
    const { result } = renderHook(() => useCollection(options));
    act(() => result.current.selectPage(true));
    expect(result.current.state.selectedKeys).toEqual(["c", "a"]);
    act(() => result.current.setPage(2));
    expect(result.current.pageSelection).toBe("none");
    act(() => result.current.toggle("b", true));
    expect(result.current.state.selectedKeys).toEqual(["c", "a"]);
    act(() => result.current.toggle("d", true));
    expect(result.current.pageSelection).toBe("all");
    act(() => result.current.selectPage(false));
    expect(result.current.state.selectedKeys).toEqual(["c", "a"]);
    act(() => result.current.setQuery("a"));
    expect(result.current.state.selectedKeys).toEqual([]);
  });

  test("normalizes removed selections, clamps shrinking pages and handles empty results", () => {
    const { result, rerender } = renderHook(({ items }) => useCollection({ ...options, items }), {
      initialProps: { items: records },
    });
    act(() => result.current.toggle("c", true));
    act(() => result.current.setPage(2));
    rerender({ items: records.slice(1, 2) });
    expect(result.current.state.page).toBe(1);
    expect(result.current.state.selectedKeys).toEqual([]);
    rerender({ items: [] });
    expect(result.current.totalItems).toBe(0);
    expect(result.current.pageCount).toBe(1);
    expect(result.current.pageSelection).toBe("none");
  });

  test("controlled server mode preserves off-page IDs and never processes supplied rows", () => {
    const onStateChange = vi.fn();
    const state = {
      query: "unmatched",
      filters: {},
      sort: null,
      page: 2,
      pageSize: 2,
      selectedKeys: ["outside"],
    };
    const { result, rerender } = renderHook(
      ({ value }) =>
        useCollection({ ...options, mode: "server", totalItems: 20, state: value, onStateChange }),
      { initialProps: { value: state } },
    );
    expect(result.current.items).toEqual(records);
    expect(result.current.state.selectedKeys).toEqual(["outside"]);
    act(() => result.current.setPage(3));
    expect(onStateChange).toHaveBeenCalledWith({ ...state, page: 3 });
    expect(result.current.state.page).toBe(2);
    rerender({ value: { ...state, page: 3 } });
    expect(result.current.state.page).toBe(3);
  });

  test("changing page size resets page; invalid dimensions and duplicate IDs fail loudly", () => {
    const { result } = renderHook(() => useCollection(options));
    act(() => result.current.setPage(2));
    act(() => result.current.setPageSize(10));
    expect(result.current.state.page).toBe(1);
    expect(() => act(() => result.current.setPageSize(0))).toThrow(RangeError);
    expect(() =>
      renderHook(() =>
        useCollection({ ...options, items: [...records.slice(0, 1), ...records.slice(0, 1)] }),
      ),
    ).toThrow(/unique/);
  });

  test("query and filter changes clear selection, sort changes preserve it", () => {
    const { result } = renderHook(() => useCollection(options));
    act(() => result.current.toggle("c", true));
    act(() => result.current.setSort({ key: "name", direction: "descending" }));
    expect(result.current.state.selectedKeys).toEqual(["c"]);
    act(() => result.current.setFilter("status", "active"));
    expect(result.current.state.selectedKeys).toEqual([]);
  });
});

describe("Collection", () => {
  test("pending mutation remains locked when selection controls remount", async () => {
    const user = userEvent.setup();
    let finish: (() => void) | undefined;
    const onAction = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        }),
    );
    const props = {
      ...options,
      columns,
      label: "Trees",
      defaultState: { selectedKeys: ["c"] },
      bulkActions: [{ key: "archive", label: "Archive", onAction }],
    };
    const { rerender } = render(<Collection {...props} />);
    await user.click(screen.getByRole("button", { name: "Archive" }));
    rerender(<Collection {...props} selectable={false} />);
    rerender(<Collection {...props} selectable />);
    expect(screen.getByRole("button", { name: "Archive" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Archive" }));
    expect(onAction).toHaveBeenCalledTimes(1);
    await act(async () => finish?.());
    expect(screen.getByRole("searchbox")).toBeEnabled();
  });
  test("sort headers expose aria-sort, checkbox selection is mixed, pagination works", async () => {
    const user = userEvent.setup();
    const ref = createRef<HTMLDivElement>();
    render(
      <Collection
        {...options}
        columns={columns}
        label="Trees"
        ref={ref}
        isItemDisabled={() => false}
      />,
    );
    expect(ref.current).toHaveClass("kb-collection");
    await user.click(screen.getByRole("button", { name: "Sort by Name" }));
    expect(screen.getByRole("columnheader", { name: /Name/ })).toHaveAttribute(
      "aria-sort",
      "ascending",
    );
    await user.click(screen.getByRole("checkbox", { name: "Select Ash" }));
    expect(screen.getByRole("checkbox", { name: "Select this page" })).toHaveAttribute(
      "aria-checked",
      "mixed",
    );
    await user.click(screen.getByRole("button", { name: "Next page" }));
    expect(screen.getByRole("checkbox", { name: "Select Cedar" })).toBeInTheDocument();
    expect(screen.getByText("1 selected")).toBeInTheDocument();
  });

  test("search and facets reset page and expose empty results", async () => {
    const user = userEvent.setup();
    render(
      <Collection
        {...options}
        columns={columns}
        label="Trees"
        filters={[
          { key: "status", label: "Status", options: [{ value: "active", label: "Active" }] },
        ]}
      />,
    );
    const status = screen.getByRole("combobox", { name: "Status" });
    expect(status.tagName).toBe("BUTTON");
    await user.click(status);
    await user.click(await screen.findByRole("option", { name: "Active" }));
    expect(status).toHaveTextContent("Active");
    expect(screen.queryByText("Birch")).not.toBeInTheDocument();
    await user.click(status);
    await user.click(await screen.findByRole("option", { name: "All" }));
    expect(status).toHaveTextContent("All");
    expect(screen.getByText("4 records")).toBeInTheDocument();
    await user.type(screen.getByRole("searchbox"), "missing");
    expect(screen.getByText("No matching records")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();
  });

  test("bulk action locks reentry, snapshots IDs, preserves failure and clears success", async () => {
    const user = userEvent.setup();
    let finish: (() => void) | undefined;
    const run = vi
      .fn()
      .mockRejectedValueOnce(new Error("offline"))
      .mockImplementationOnce(
        () =>
          new Promise<void>((resolve) => {
            finish = resolve;
          }),
      );
    render(
      <Collection
        {...options}
        columns={columns}
        label="Trees"
        bulkActions={[{ key: "archive", label: "Archive", onAction: run }]}
      />,
    );
    await user.click(screen.getByRole("checkbox", { name: "Select Cedar" }));
    await user.click(screen.getByRole("button", { name: "Archive" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Action failed. Selection kept; try again.",
    );
    expect(screen.getByText("1 selected")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Archive" }));
    expect(screen.getByRole("button", { name: "Archive" })).toBeDisabled();
    expect(screen.getByRole("checkbox", { name: "Select Cedar" })).toBeDisabled();
    expect(run).toHaveBeenLastCalledWith(["c"]);
    await act(async () => finish?.());
    expect(screen.getByText("0 selected")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  test("loading and fetch failure suppress stale interaction and give recovery feedback", () => {
    const { rerender } = render(
      <Collection {...options} columns={columns} label="Trees" loading />,
    );
    expect(screen.getByRole("region", { name: "Trees" })).toHaveAttribute("aria-busy", "true");
    expect(screen.queryByRole("checkbox", { name: "Select Cedar" })).not.toBeInTheDocument();
    rerender(
      <Collection {...options} columns={columns} label="Trees" error="Could not load trees" />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Could not load trees");
  });
});

describe("standalone collection controls", () => {
  test("bulk success uses committed callbacks when a newer render suspends", async () => {
    const calls: number[] = [];
    let finish: (() => void) | undefined;
    let change: ((version: number) => void) | undefined;
    let renderedSecond = false;
    const unresolved = new Promise<void>(() => {});
    const action = {
      key: "archive",
      label: "Archive",
      onAction: () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        }),
    };
    function Blocker({ version }: { version: number }) {
      if (version === 2) {
        renderedSecond = true;
        throw unresolved;
      }
      return <p>Committed one</p>;
    }
    function App() {
      const [version, setVersion] = useState(1);
      change = setVersion;
      return (
        <Suspense fallback={<p>Not committed</p>}>
          <Collection.BulkActions
            selectedKeys={["c"]}
            actions={[action]}
            onClear={() => {}}
            onSuccess={() => {
              calls.push(version);
            }}
          />
          <Blocker version={version} />
        </Suspense>
      );
    }
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Archive" }));
    await act(async () => {
      startTransition(() => change?.(2));
    });
    expect(renderedSecond).toBe(true);
    expect(screen.getByText("Committed one")).toBeInTheDocument();
    expect(screen.queryByText("Not committed")).not.toBeInTheDocument();
    await act(async () => finish?.());
    expect(calls).toEqual([1]);
  });
  test("standalone selection count matches the distinct submitted IDs", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    render(
      <Collection.BulkActions
        selectedKeys={["c", "c"]}
        actions={[{ key: "archive", label: "Archive", onAction }]}
        onClear={() => {}}
      />,
    );
    expect(screen.getByText("1 selected")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Archive" }));
    expect(onAction).toHaveBeenCalledWith(["c"]);
  });
  test("page size uses themed Select with keyboard selection and focus recovery", async () => {
    const user = userEvent.setup();
    const onPageSizeChange = vi.fn();
    render(
      <Collection.Pagination
        page={1}
        pageSize={10}
        totalItems={100}
        onPageChange={vi.fn()}
        onPageSizeChange={onPageSizeChange}
      />,
    );
    const size = screen.getByRole("combobox", { name: "Rows per page" });
    expect(size.tagName).toBe("BUTTON");
    size.focus();
    await user.keyboard("{ArrowDown}");
    const list = await screen.findByRole("listbox", { name: "Rows per page" });
    await waitFor(() => expect(list.contains(document.activeElement)).toBe(true));
    await user.keyboard("{End}{Enter}");
    expect(onPageSizeChange).toHaveBeenCalledWith(50);
    expect(size).toHaveFocus();
  });
  test("disabled page-size dropdown cannot open", async () => {
    const user = userEvent.setup();
    render(
      <Collection.Pagination
        page={1}
        pageSize={10}
        totalItems={100}
        onPageChange={vi.fn()}
        onPageSizeChange={vi.fn()}
        disabled
      />,
    );
    const size = screen.getByRole("combobox", { name: "Rows per page" });
    expect(size).toBeDisabled();
    await user.click(size);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });
  test("successful actions clear only their snapshot after parent selection changes", async () => {
    const user = userEvent.setup();
    let finish: (() => void) | undefined;
    const onSuccess = vi.fn();
    const action = {
      key: "archive",
      label: "Archive",
      onAction: () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        }),
    };
    const { rerender } = render(
      <Collection.BulkActions
        selectedKeys={["c"]}
        actions={[action]}
        onClear={vi.fn()}
        onSuccess={vi.fn()}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Archive" }));
    rerender(
      <Collection.BulkActions
        selectedKeys={["c", "a"]}
        actions={[action]}
        onClear={vi.fn()}
        onSuccess={onSuccess}
      />,
    );
    await act(async () => finish?.());
    expect(onSuccess).toHaveBeenCalledWith(["c"]);
  });
  test("failed action feedback disappears when selection is cleared externally", async () => {
    const user = userEvent.setup();
    const action = {
      key: "archive",
      label: "Archive",
      onAction: () => Promise.reject(new Error("offline")),
    };
    const { rerender } = render(
      <Collection.BulkActions selectedKeys={["c"]} actions={[action]} onClear={vi.fn()} />,
    );
    await user.click(screen.getByRole("button", { name: "Archive" }));
    expect(await screen.findByRole("alert")).toBeInTheDocument();
    rerender(<Collection.BulkActions selectedKeys={[]} actions={[action]} onClear={vi.fn()} />);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  test("pagination bounds requests and announces zero-result range", () => {
    const ref = createRef<HTMLElement>();
    render(
      <CollectionPagination
        page={1}
        pageSize={10}
        totalItems={0}
        onPageChange={vi.fn()}
        ref={ref}
      />,
    );
    expect(ref.current?.tagName).toBe("NAV");
    expect(screen.getByText("0–0 of 0")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Previous page" })).toBeDisabled();
  });

  test("bulk action control never submits empty selection", () => {
    const ref = createRef<HTMLFieldSetElement>();
    render(
      <CollectionBulkActions
        ref={ref}
        selectedKeys={[]}
        actions={[{ key: "delete", label: "Delete", onAction: vi.fn() }]}
        onClear={vi.fn()}
      />,
    );
    expect(ref.current?.tagName).toBe("FIELDSET");
    expect(screen.getByRole("button", { name: "Delete" })).toBeDisabled();
  });
});
