import { cleanup, render, screen, within } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, test } from "vitest";
import { Card } from "../Card/Card";
import { Image } from "../Image/Image";
import { PageHeader } from "../PageHeader/PageHeader";
import { Gallery } from "./Gallery";

afterEach(cleanup);

describe("Gallery", () => {
  test("renders header, filters and an item list in DOM order", () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(
      <Gallery
        ref={ref}
        header={<PageHeader title="Sneakers" />}
        filters={<input aria-label="Search sneakers" />}
        itemsLabel="Sneakers"
      >
        <Gallery.Item>
          <Card>
            <Image alt="Grey knit sneaker" ratio="landscape" />
            <h3>The Schu Classic</h3>
          </Card>
        </Gallery.Item>
        <Gallery.Item>
          <Card>
            <h3>Air Max 90</h3>
          </Card>
        </Gallery.Item>
      </Gallery>,
    );
    const root = container.querySelector(".kb-gallery");
    expect(ref.current).toBe(root);
    expect([...(root?.children ?? [])].map((node) => node.className)).toEqual([
      "kb-gallery-header",
      "kb-gallery-filters",
      expect.stringContaining("kb-gallery-items"),
    ]);
    const list = screen.getByRole("list", { name: "Sneakers" });
    expect(list.tagName).toBe("UL");
    expect(list).toHaveClass("kb-grid");
    const items = within(list).getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveClass("kb-gallery-item");
    expect(screen.getByRole("heading", { level: 1, name: "Sneakers" })).toBeDefined();
    expect(
      within(items[0] as HTMLElement).getByRole("img", { name: "Grey knit sneaker" }),
    ).toBeDefined();
  });

  test("omits header and filters regions when unset", () => {
    const { container } = render(
      <Gallery>
        <Gallery.Item>x</Gallery.Item>
      </Gallery>,
    );
    expect(container.querySelector(".kb-gallery-header")).toBeNull();
    expect(container.querySelector(".kb-gallery-filters")).toBeNull();
    expect(container.querySelector(".kb-gallery-items")).not.toBeNull();
  });

  test("renders the empty region instead of an empty list", () => {
    const { container } = render(
      <Gallery itemsLabel="Sneakers" empty={<p>No sneakers match</p>}>
        {[].map(() => null)}
        {false}
      </Gallery>,
    );
    expect(screen.queryByRole("list")).toBeNull();
    expect(container.querySelector(".kb-gallery-empty")).toHaveTextContent("No sneakers match");
  });

  test("treats a fragment of no items as empty", () => {
    const { container } = render(
      <Gallery empty={<p>No sneakers match</p>}>
        <>
          {[].map(() => null)}
          <>{null}</>
        </>
      </Gallery>,
    );
    expect(screen.queryByRole("list")).toBeNull();
    expect(container.querySelector(".kb-gallery-empty")).not.toBeNull();
  });

  test("passes classNames to the empty region", () => {
    const { container } = render(
      <Gallery empty="None" classNames={{ empty: "app-empty" }}>
        {null}
      </Gallery>,
    );
    expect(container.querySelector(".kb-gallery-empty")).toHaveClass("app-empty");
  });

  test("keeps the list when items exist even with an empty fallback", () => {
    render(
      <Gallery empty={<p>No sneakers match</p>}>
        <Gallery.Item>x</Gallery.Item>
      </Gallery>,
    );
    expect(screen.getByRole("list")).toBeDefined();
    expect(screen.queryByText("No sneakers match")).toBeNull();
  });

  test("marks featured items and passes native attributes to items", () => {
    const ref = createRef<HTMLLIElement>();
    render(
      <Gallery>
        <Gallery.Item ref={ref} featured id="schu" className="app-item">
          x
        </Gallery.Item>
        <Gallery.Item>y</Gallery.Item>
      </Gallery>,
    );
    const [featured, plain] = screen.getAllByRole("listitem");
    expect(ref.current).toBe(featured);
    expect(featured).toHaveAttribute("data-featured", "");
    expect(featured).toHaveAttribute("id", "schu");
    expect(featured).toHaveClass("kb-gallery-item", "app-item");
    expect(plain).not.toHaveAttribute("data-featured");
  });

  test("passes native attributes to the root", () => {
    const { container } = render(
      <Gallery title="Catalog" id="catalog" className="app-gallery">
        <Gallery.Item>x</Gallery.Item>
      </Gallery>,
    );
    const root = container.querySelector(".kb-gallery");
    expect(root).toHaveAttribute("id", "catalog");
    expect(root).toHaveAttribute("title", "Catalog");
    expect(root).toHaveClass("app-gallery");
  });
});
