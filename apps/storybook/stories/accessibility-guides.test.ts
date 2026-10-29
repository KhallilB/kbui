import { expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { AccessibilityReference } from "../catalog/AccessibilityReference";
import { accessibilityStandards } from "../catalog/accessibility-standards";
import { componentGuides } from "../catalog/component-guides";
import { definitions } from "../catalog/definitions";

test("native Node release verification can load component guidance", () => {
  const guidance = new URL("../catalog/component-guides.ts", import.meta.url);
  const result = Bun.spawnSync([
    "node",
    "--experimental-strip-types",
    "--input-type=module",
    "--eval",
    `await import(${JSON.stringify(guidance.href)})`,
  ]);
  expect(result.exitCode, result.stderr.toString()).toBe(0);
});

test("every accessibility guide separates support, author decisions, checks and standards", () => {
  for (const [name, guide] of Object.entries(componentGuides)) {
    expect(guide.accessibility, name).toEqual(
      expect.objectContaining({
        provides: expect.any(Array),
        authoring: expect.any(Array),
        verify: expect.any(Array),
        standards: expect.any(Array),
      }),
    );
    expect(guide.accessibility.provides.length, name).toBeGreaterThan(0);
    expect(guide.accessibility.authoring.length, name).toBeGreaterThan(0);
    expect(guide.accessibility.verify.length, name).toBeGreaterThan(1);
    expect(guide.accessibility.standards.length, name).toBeGreaterThan(0);
  }
});

test("MultiSelect guidance renders author tasks, manual checks and actual standard links", () => {
  const guide = componentGuides.MultiSelect;
  if (!guide) throw new Error("Missing MultiSelect guide");
  const html = renderToStaticMarkup(
    AccessibilityReference({ name: "MultiSelect", guide: guide.accessibility }),
  );
  for (const heading of [
    "Provided by kbui",
    "Your implementation",
    "Verify before shipping",
    "Standards and patterns",
    "Coverage and limits",
  ])
    expect(html).toContain(`>${heading}</h3>`);
  expect(html).toContain("Backspace");
  expect(html).toContain("removeLabel");
  expect(html).toContain('href="https://www.w3.org/TR/WCAG22/#name-role-value"');
  expect(html).toContain("MultiSelect.test.tsx");
  expect(html).toContain("screen reader");
});

test("splitter guidance distinguishes keyboard support from a non-drag pointer alternative", () => {
  const guide = componentGuides.Panel?.accessibility;
  expect(guide?.standards).toContain("2.5.7");
  expect(guide?.authoring.join(" ")).toContain("onSizeChange");
  expect(guide?.authoring.join(" ")).toContain("click");
  expect(guide?.verify.join(" ")).toContain("without dragging");
});

test("guide sources and criterion identifiers remain valid for every public component", () => {
  expect(Object.keys(componentGuides).sort()).toEqual(Object.keys(definitions).sort());
  for (const [name, guide] of Object.entries(componentGuides)) {
    for (const id of guide.accessibility.standards) {
      expect(Object.hasOwn(accessibilityStandards, id), `${name}: ${id}`).toBe(true);
      expect(["A", "AA"]).toContain(accessibilityStandards[id].level);
    }
    for (const suffix of [".tsx", ".test.tsx", ".stories.tsx"])
      expect(
        existsSync(
          new URL(
            `../../../packages/react/src/components/${name}/${name}${suffix}`,
            import.meta.url,
          ),
        ),
        name,
      ).toBe(true);
    if (guide.accessibility.pattern)
      expect(guide.accessibility.pattern.href).toStartWith(
        "https://www.w3.org/WAI/ARIA/apg/patterns/",
      );
  }
});
