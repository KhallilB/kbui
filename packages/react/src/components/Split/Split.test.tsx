import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, test } from "vitest";
import { Split } from "./Split";

describe("Split", () => {
  test("keeps source order and adds no interactive grid semantics", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Split ref={ref}>
        <p>Primary</p>
        <p>Secondary</p>
      </Split>,
    );
    expect(ref.current).toHaveClass("kb-split");
    expect(ref.current).toHaveAttribute("data-ratio", "equal");
    expect(ref.current).toHaveAttribute("data-collapse", "md");
    expect(ref.current).toHaveAttribute("data-gap", "md");
    expect(ref.current).toHaveAttribute("data-align", "stretch");
    expect([...(ref.current?.children ?? [])].map((node) => node.textContent)).toEqual([
      "Primary",
      "Secondary",
    ]);
    expect(screen.queryByRole("grid")).toBeNull();
  });
  test("preserves native section semantics, ref and composition props", () => {
    const ref = createRef<HTMLElement>();
    render(
      <Split
        as="section"
        ref={ref}
        aria-label="Workspace"
        ratio="wide-start"
        collapse="lg"
        gap="lg"
        align="start"
        className="workspace"
        data-ratio="equal"
      >
        <div>Main</div>
        <aside>Context</aside>
      </Split>,
    );
    expect(screen.getByRole("region", { name: "Workspace" })).toBe(ref.current);
    expect(ref.current).toHaveClass("kb-split", "workspace");
    expect(ref.current).toHaveAttribute("data-ratio", "wide-start");
    expect(ref.current).toHaveAttribute("data-collapse", "lg");
    expect(ref.current).toHaveAttribute("data-gap", "lg");
    expect(ref.current).toHaveAttribute("data-align", "start");
  });
  test("owns column tracks while preserving child semantics and styling hooks", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Split ref={ref} classNames={{ track: "project-column" }}>
        <section aria-label="Projects">Primary</section>
        <aside aria-label="Context">Secondary</aside>
      </Split>,
    );
    const tracks = [...(ref.current?.children ?? [])];
    expect(tracks).toHaveLength(2);
    for (const track of tracks) expect(track).toHaveClass("kb-split-track", "project-column");
    expect(screen.getByRole("region", { name: "Projects" })).toBe(tracks[0]?.firstElementChild);
    expect(screen.getByRole("complementary", { name: "Context" })).toBe(
      tracks[1]?.firstElementChild,
    );
  });

  test("skips empty children and retains zero-valued content", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Split ref={ref}>
        {false}
        {0}
        <p>Context</p>
        {null}
      </Split>,
    );
    expect([...(ref.current?.children ?? [])].map((node) => node.textContent)).toEqual([
      "0",
      "Context",
    ]);
  });
});
