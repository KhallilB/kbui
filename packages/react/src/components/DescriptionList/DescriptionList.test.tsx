import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { DescriptionList } from "./DescriptionList";

describe("DescriptionList", () => {
  it("preserves native term/detail grouping, multiple values and caller relationships", () => {
    render(
      <DescriptionList aria-label="Project details">
        <DescriptionList.Item>
          <DescriptionList.Term id="owner">Owner</DescriptionList.Term>
          <DescriptionList.Detail aria-labelledby="owner">Ada</DescriptionList.Detail>
          <DescriptionList.Detail aria-labelledby="owner">Lin</DescriptionList.Detail>
        </DescriptionList.Item>
        <DescriptionList.Item>
          <DescriptionList.Term>Open tasks</DescriptionList.Term>
          <DescriptionList.Detail>{0}</DescriptionList.Detail>
        </DescriptionList.Item>
      </DescriptionList>,
    );
    expect(screen.getAllByRole("term")[0]).toHaveTextContent("Owner");
    expect(screen.getAllByRole("term")[0]).toHaveAttribute("id", "owner");
    expect(screen.getAllByRole("definition", { name: "Owner" })).toHaveLength(2);
    expect(screen.getByText("0").tagName).toBe("DD");
    expect(screen.getByLabelText("Project details").tagName).toBe("DL");
    expect(screen.getByText("Ada").parentElement?.tagName).toBe("DIV");
    expect(screen.queryByRole("table")).toBeNull();
  });
  it("forwards refs and native attributes to every composition part", () => {
    const root = createRef<HTMLDListElement>();
    const item = createRef<HTMLDivElement>();
    const term = createRef<HTMLElement>();
    const detail = createRef<HTMLElement>();
    render(
      <DescriptionList
        ref={root}
        layout="stacked"
        density="dense"
        dividers={false}
        className="custom"
      >
        <DescriptionList.Item ref={item}>
          <DescriptionList.Term ref={term}>URL</DescriptionList.Term>
          <DescriptionList.Detail ref={detail}>
            <a href="/project">Project details</a>
          </DescriptionList.Detail>
        </DescriptionList.Item>
      </DescriptionList>,
    );
    expect(root.current?.tagName).toBe("DL");
    expect(root.current).toHaveClass("kb-descriptionlist", "custom");
    expect(root.current).toHaveAttribute("data-layout", "stacked");
    expect(root.current).not.toHaveAttribute("data-dividers");
    expect(item.current?.parentElement).toBe(root.current);
    expect(term.current?.tagName).toBe("DT");
    expect(detail.current?.tagName).toBe("DD");
    expect(screen.getByRole("link", { name: "Project details" })).toHaveAttribute(
      "href",
      "/project",
    );
  });
});
