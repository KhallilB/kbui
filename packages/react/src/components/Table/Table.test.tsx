import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Table } from "./Table";

function Records() {
  const [direction, setDirection] = useState<"ascending" | "descending">("ascending");
  const [selected, setSelected] = useState<string[]>([]);
  const records = direction === "ascending" ? ["Ada", "Lin"] : ["Lin", "Ada"];
  return (
    <Table.ScrollContainer label="People scroll area" maxHeight="16rem">
      <Table density="dense" stickyHeader>
        <Table.Caption>People</Table.Caption>
        <Table.Head>
          <Table.Row>
            <Table.ColumnHeader>
              <Table.SelectionCheckbox
                label="Select all people"
                checked={selected.length === 2}
                indeterminate={selected.length === 1}
                onCheckedChange={(checked) => setSelected(checked ? records : [])}
              />
            </Table.ColumnHeader>
            <Table.ColumnHeader sortDirection={direction} onSortChange={setDirection}>
              Name
            </Table.ColumnHeader>
            <Table.ColumnHeader>Actions</Table.ColumnHeader>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {records.map((name) => (
            <Table.Row key={name} selected={selected.includes(name)}>
              <Table.Cell>
                <Table.SelectionCheckbox
                  label={`Select ${name}`}
                  checked={selected.includes(name)}
                  onCheckedChange={(checked) =>
                    setSelected(
                      checked ? [...selected, name] : selected.filter((item) => item !== name),
                    )
                  }
                />
              </Table.Cell>
              <Table.RowHeader>{name}</Table.RowHeader>
              <Table.Cell>
                <Table.RowActions>
                  <button type="button">Edit {name}</button>
                </Table.RowActions>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </Table.ScrollContainer>
  );
}

describe("Table", () => {
  it("preserves native semantics, caption naming, column and row scopes", () => {
    render(<Records />);
    const table = screen.getByRole("table", { name: "People" });
    expect(table).toHaveAttribute("data-density", "dense");
    expect(table).toHaveAttribute("data-sticky-header", "");
    expect(screen.getByRole("columnheader", { name: /Name/ })).toHaveAttribute("scope", "col");
    expect(screen.getByRole("rowheader", { name: "Ada" })).toHaveAttribute("scope", "row");
    expect(screen.queryByRole("grid")).toBeNull();
    expect(screen.getByRole("region", { name: "People scroll area" })).toHaveAttribute(
      "tabindex",
      "0",
    );
  });
  it("sorts by keyboard and keeps sort focus while caller reorders records", async () => {
    render(<Records />);
    const button = screen.getByRole("button", { name: "Name" });
    button.focus();
    await userEvent.keyboard("{Enter}");
    expect(screen.getByRole("columnheader", { name: "Name" })).toHaveAttribute(
      "aria-sort",
      "descending",
    );
    expect(screen.getAllByRole("rowheader").map((node) => node.textContent)).toEqual([
      "Lin",
      "Ada",
    ]);
    expect(button).toHaveFocus();
    await userEvent.keyboard(" ");
    expect(screen.getAllByRole("rowheader").map((node) => node.textContent)).toEqual([
      "Ada",
      "Lin",
    ]);
  });
  it("supports mixed/select-all/clear and keeps selection attached to identity across sorting", async () => {
    render(<Records />);
    await userEvent.click(screen.getByRole("checkbox", { name: "Select Ada" }));
    const all = screen.getByRole("checkbox", { name: "Select all people" });
    expect(all).toBePartiallyChecked();
    expect(screen.getByRole("rowheader", { name: "Ada" }).closest("tr")).toHaveAttribute(
      "data-selected",
      "",
    );
    await userEvent.click(screen.getByRole("button", { name: "Name" }));
    expect(screen.getByRole("checkbox", { name: "Select Ada" })).toBeChecked();
    all.focus();
    await userEvent.keyboard(" ");
    expect(
      screen.getAllByRole("checkbox").every((node) => (node as HTMLInputElement).checked),
    ).toBe(true);
    await userEvent.keyboard(" ");
    expect(
      screen.getAllByRole("checkbox").every((node) => !(node as HTMLInputElement).checked),
    ).toBe(true);
  });
  it("keeps controlled state authoritative, ignores disabled sort and selection, and avoids form submission", async () => {
    const sort = vi.fn();
    const change = vi.fn();
    const submit = vi.fn((event) => event.preventDefault());
    const { rerender } = render(
      <form onSubmit={submit}>
        <Table>
          <Table.Head>
            <Table.Row>
              <Table.ColumnHeader sortDirection="none" onSortChange={sort}>
                Name
              </Table.ColumnHeader>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            <Table.Row>
              <Table.Cell>
                <Table.SelectionCheckbox
                  label="Locked"
                  checked={false}
                  disabled
                  onCheckedChange={change}
                />
              </Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
      </form>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Name" }));
    expect(sort).toHaveBeenCalledWith("ascending");
    expect(screen.getByRole("columnheader")).not.toHaveAttribute("aria-sort");
    expect(submit).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole("checkbox"));
    expect(change).not.toHaveBeenCalled();
    rerender(
      <Table>
        <Table.Head>
          <Table.Row>
            <Table.ColumnHeader sortDirection="ascending" onSortChange={sort} sortDisabled>
              Name
            </Table.ColumnHeader>
          </Table.Row>
        </Table.Head>
      </Table>,
    );
    sort.mockClear();
    await userEvent.click(screen.getByRole("button", { name: "Name" }));
    expect(sort).not.toHaveBeenCalled();
  });
  it("forwards native refs, spans, alignments, sticky edges, custom classes and empty/loading content", () => {
    const table = createRef<HTMLTableElement>();
    const header = createRef<HTMLTableCellElement>();
    const scroll = createRef<HTMLElement>();
    const cell = createRef<HTMLTableCellElement>();
    render(
      <Table.ScrollContainer ref={scroll} label="Results">
        <Table ref={table} className="custom">
          <Table.Caption>Results</Table.Caption>
          <Table.Head>
            <Table.Row>
              <Table.ColumnHeader ref={header} colSpan={2} sticky="start" align="end">
                Total
              </Table.ColumnHeader>
            </Table.Row>
          </Table.Head>
          <Table.Body aria-busy="true">
            <Table.Row>
              <Table.Cell ref={cell} colSpan={2}>
                Loading records
              </Table.Cell>
            </Table.Row>
          </Table.Body>
          <Table.Foot>
            <Table.Row>
              <Table.Cell colSpan={2}>No more records</Table.Cell>
            </Table.Row>
          </Table.Foot>
        </Table>
      </Table.ScrollContainer>,
    );
    expect(table.current).toBe(screen.getByRole("table"));
    expect(table.current).toHaveClass("kb-table", "custom");
    expect(header.current).toHaveAttribute("data-sticky", "start");
    expect(header.current).toHaveAttribute("data-align", "end");
    expect(header.current).toHaveAttribute("colspan", "2");
    expect(cell.current).toHaveTextContent("Loading records");
    expect(scroll.current).toBe(screen.getByRole("region"));
    expect(within(screen.getByRole("table")).getAllByRole("rowgroup")[1]).toHaveAttribute(
      "aria-busy",
      "true",
    );
  });
});

it("preserves grouped header associations and refs across native composition parts", () => {
  const caption = createRef<HTMLTableCaptionElement>();
  const head = createRef<HTMLTableSectionElement>();
  const body = createRef<HTMLTableSectionElement>();
  const foot = createRef<HTMLTableSectionElement>();
  const row = createRef<HTMLTableRowElement>();
  const rowHeader = createRef<HTMLTableCellElement>();
  const actions = createRef<HTMLDivElement>();
  const checkbox = createRef<HTMLInputElement>();
  render(
    <Table layout="fixed">
      <Table.Caption ref={caption}>Grouped workload</Table.Caption>
      <Table.Head ref={head}>
        <Table.Row>
          <Table.ColumnHeader id="person" rowSpan={2}>
            Person
          </Table.ColumnHeader>
          <Table.ColumnHeader id="work" scope="colgroup" colSpan={2}>
            Work
          </Table.ColumnHeader>
        </Table.Row>
        <Table.Row>
          <Table.ColumnHeader id="tasks">Tasks</Table.ColumnHeader>
          <Table.ColumnHeader id="selection">Selection</Table.ColumnHeader>
        </Table.Row>
      </Table.Head>
      <Table.Body ref={body}>
        <Table.Row ref={row}>
          <Table.RowHeader id="ada" ref={rowHeader} headers="person" sticky="end">
            Ada
          </Table.RowHeader>
          <Table.Cell headers="work tasks ada">12</Table.Cell>
          <Table.Cell headers="work selection ada">
            <Table.RowActions ref={actions}>
              <Table.SelectionCheckbox
                ref={checkbox}
                label="Select Ada"
                checked={false}
                readOnly
                onCheckedChange={() => {}}
              />
            </Table.RowActions>
          </Table.Cell>
        </Table.Row>
      </Table.Body>
      <Table.Foot ref={foot}>
        <Table.Row>
          <Table.Cell colSpan={3}>One person</Table.Cell>
        </Table.Row>
      </Table.Foot>
    </Table>,
  );
  expect(caption.current).toBe(screen.getByText("Grouped workload"));
  expect([head.current, body.current, foot.current]).toEqual(screen.getAllByRole("rowgroup"));
  expect(row.current).toBe(screen.getByRole("row", { name: "Ada 12 Select Ada" }));
  expect(rowHeader.current).toHaveAttribute("data-sticky", "end");
  expect(screen.getByRole("columnheader", { name: "Work" })).toHaveAttribute("scope", "colgroup");
  expect(screen.getByRole("columnheader", { name: "Person" })).toHaveAttribute("rowspan", "2");
  expect(screen.getByRole("cell", { name: "12" })).toHaveAttribute("headers", "work tasks ada");
  expect(actions.current).toContainElement(checkbox.current);
  expect(checkbox.current).toBe(screen.getByRole("checkbox", { name: "Select Ada" }));
  expect(screen.getByRole("table")).toHaveAttribute("data-layout", "fixed");
});

it("preserves native external sort announcements unless explicit sortDirection owns state", () => {
  const { rerender } = render(
    <table>
      <thead>
        <tr>
          <Table.ColumnHeader aria-sort="other">Priority</Table.ColumnHeader>
        </tr>
      </thead>
    </table>,
  );
  expect(screen.getByRole("columnheader")).toHaveAttribute("aria-sort", "other");
  rerender(
    <table>
      <thead>
        <tr>
          <Table.ColumnHeader aria-sort="ascending">Priority</Table.ColumnHeader>
        </tr>
      </thead>
    </table>,
  );
  expect(screen.getByRole("columnheader")).toHaveAttribute("aria-sort", "ascending");
  rerender(
    <table>
      <thead>
        <tr>
          <Table.ColumnHeader aria-sort="ascending" sortDirection="none">
            Priority
          </Table.ColumnHeader>
        </tr>
      </thead>
    </table>,
  );
  expect(screen.getByRole("columnheader")).not.toHaveAttribute("aria-sort");
  rerender(
    <table>
      <thead>
        <tr>
          <Table.ColumnHeader aria-sort="ascending" sortDirection="descending">
            Priority
          </Table.ColumnHeader>
        </tr>
      </thead>
    </table>,
  );
  expect(screen.getByRole("columnheader")).toHaveAttribute("aria-sort", "descending");
});
