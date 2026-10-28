import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { loadCsf } from "storybook/internal/csf-tools";
import { loadCatalogSources } from "../catalog/source";

test("each component owns a full prop or composition reference", () => {
  const entries = loadCatalogSources();
  for (const entry of entries) {
    expect(entry.apiHeading, entry.name).toBe(entry.name);
    expect(
      entry.api.some((block) => block.kind === "table"),
      entry.name,
    ).toBe(true);
  }
  const props = (name: string) =>
    entries
      .find((entry) => entry.name === name)
      ?.api.filter((block) => block.kind === "table")
      .flatMap((block) => block.rows.map((row) => row[0]));
  expect(props("Card")).toContain("`appearance`");
  expect(props("Card")).not.toContain("`layout`");
  expect(props("Grid")).toContain("`layout`");
  expect(props("Grid")).not.toContain("`appearance`");
  expect(props("Tooltip")).toContain("`delay`");
  expect(props("ScrollArea")).toContain("`maxHeight`");
});

test("open dialog fixtures cannot launch modals while reading generated docs", () => {
  const source = new URL(
    "../../../packages/react/src/components/Dialog/Dialog.stories.tsx",
    import.meta.url,
  );
  const csf = loadCsf(readFileSync(source, "utf8"), {
    fileName: source.pathname,
    makeTitle: (title) => title,
  }).parse();
  for (const suffix of ["open", "custom-layout", "sections"]) {
    const story = csf.stories.find((story) => story.id === `components-dialog--${suffix}`);
    expect(story?.tags ?? [], suffix).toContain("!autodocs");
    expect(story?.tags ?? [], suffix).not.toContain("!test");
  }
});
