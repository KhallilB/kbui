import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Checkbox } from "../Checkbox/Checkbox";
import { CollectionList } from "../CollectionList/CollectionList";
import { DescriptionList } from "../DescriptionList/DescriptionList";
import { CollectionRow } from "./CollectionRow";

function Selectable({ edit }: { edit: () => void }) {
  const [selected, setSelected] = useState(false);
  return (
    <CollectionList aria-label="People">
      <CollectionRow
        title={<a href="/people/ada">Ada Chen</a>}
        description="Design lead"
        selected={selected}
        leading={
          <Checkbox
            label="Select Ada Chen"
            visuallyHidden
            checked={selected}
            onCheckedChange={setSelected}
          />
        }
        metadata={<span>12 tasks</span>}
        actions={
          <button type="button" onClick={edit}>
            Edit Ada Chen
          </button>
        }
      />
    </CollectionList>
  );
}
describe("CollectionRow", () => {
  it("preserves native term/value groups inside rich record details", () => {
    render(
      <CollectionList aria-label="Projects">
        <CollectionRow
          title="Portal"
          description={
            <DescriptionList>
              <DescriptionList.Item>
                <DescriptionList.Term id="tasks-label">Open tasks</DescriptionList.Term>
                <DescriptionList.Detail aria-labelledby="tasks-label">{0}</DescriptionList.Detail>
              </DescriptionList.Item>
            </DescriptionList>
          }
        />
      </CollectionList>,
    );
    const detail = screen.getByRole("definition", { name: "Open tasks" });
    expect(detail).toHaveTextContent("0");
    expect(screen.getByRole("listitem")).toContainElement(detail);
    expect(detail.closest("p")).toBeNull();
    expect(screen.getByRole("term")).toHaveAttribute("id", "tasks-label");
    expect(screen.getByRole("list", { name: "Projects" }).children).toHaveLength(1);
  });
  it("keeps selection, navigation and actions separate with normal keyboard order", async () => {
    const edit = vi.fn();
    render(<Selectable edit={edit} />);
    const checkbox = screen.getByRole("checkbox", { name: "Select Ada Chen" });
    await userEvent.tab();
    expect(checkbox).toHaveFocus();
    await userEvent.keyboard(" ");
    expect(checkbox).toBeChecked();
    expect(screen.getByRole("listitem")).toHaveAttribute("data-selected");
    await userEvent.tab();
    expect(screen.getByRole("link", { name: "Ada Chen" })).toHaveFocus();
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    expect(edit).toHaveBeenCalledTimes(1);
    expect(checkbox).toBeChecked();
    expect(screen.getByRole("listitem")).not.toHaveAttribute("aria-selected");
    expect(screen.queryByRole("option")).toBeNull();
  });
  it("forwards li refs/attributes and keeps zero-valued content", () => {
    const ref = createRef<HTMLLIElement>();
    render(
      <CollectionList>
        <CollectionRow
          ref={ref}
          id="record"
          title="Workload"
          description={0}
          metadata={0}
          className="custom"
        />
      </CollectionList>,
    );
    expect(ref.current).toBe(screen.getByRole("listitem"));
    expect(ref.current).toHaveClass("kb-collectionrow", "custom");
    expect(ref.current).toHaveAttribute("id", "record");
    expect(screen.getAllByText("0")).toHaveLength(2);
  });
});

it("omits conditional empty slots without losing visible zero values", () => {
  const { container, rerender } = render(
    <CollectionList>
      <CollectionRow
        title="Record"
        leading={false}
        description={false}
        metadata={false}
        actions={false}
      />
    </CollectionList>,
  );
  const row = screen.getByRole("listitem");
  expect(row).not.toHaveAttribute("data-leading");
  expect(row).not.toHaveAttribute("data-aside");
  expect(container.querySelector(".kb-collectionrow-description")).toBeNull();
  rerender(
    <CollectionList>
      <CollectionRow title="Record" leading={0} description={0} metadata={0} actions={null} />
    </CollectionList>,
  );
  expect(screen.getAllByText("0")).toHaveLength(3);
});
