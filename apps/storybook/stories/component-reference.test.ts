import { expect, test } from "bun:test";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { loadCsf } from "storybook/internal/csf-tools";
import {
  loadCatalogSources as loadCatalogSourcesFromModule,
  loadComponentReferences,
} from "../catalog/component-sources";
import { loadCatalogSources } from "../catalog/source";

test("each component owns a full prop or composition reference", () => {
  expect(loadCatalogSourcesFromModule).toBe(loadCatalogSources);
  const references = loadComponentReferences();
  const entries = loadCatalogSources();
  expect(Object.keys(references).sort()).toEqual(entries.map((entry) => entry.name).sort());
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
  for (const prop of ["`columns`", "`minItemWidth`", "`gap`", "`align`"])
    expect(props("Grid")).toContain(prop);
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

test("package index reaches every standalone reference and keeps local links valid", () => {
  const root = new URL("../../../packages/react/", import.meta.url);
  const index = readFileSync(new URL("README.md", root), "utf8");
  const entries = loadCatalogSources();
  const names = entries.map((entry) => entry.name).sort();
  const pages = readdirSync(new URL("docs/components/", root)).sort();
  expect(pages).toEqual(names.map((name) => `${name}.md`));
  expect(index).not.toContain("| Prop |");
  for (const entry of entries) {
    const { name } = entry;
    expect(index, name).toContain(`[\`${name}\`](docs/components/${name}.md)`);
    const page = new URL(`docs/components/${name}.md`, root);
    const markdown = readFileSync(page, "utf8");
    expect(markdown.startsWith(`# ${name}\n`), name).toBe(true);
    expect(markdown, name).toContain("[All components](../../README.md#components)");
    expect(markdown, name).toContain(`https://kbui.kcb.pro/storybook/?path=/docs/${entry.docsId}`);
    let focusedExamples = 0;
    for (const match of markdown.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
      const href = match[1] ?? "";
      if (/^https?:/.test(href)) {
        const url = new URL(href);
        if (url.origin === "https://kbui.kcb.pro" && url.pathname === "/storybook/") {
          const route = url.searchParams.get("path");
          if (route?.startsWith("/story/")) {
            expect(
              entry.stories.map((story) => `/story/${story.id}`),
              href,
            ).toContain(route);
            focusedExamples++;
          } else {
            expect(route, href).toBe(`/docs/${entry.docsId}`);
          }
        }
        continue;
      }
      const target = new URL(href, page);
      const anchor = target.hash.slice(1);
      target.hash = "";
      expect(existsSync(target), `${name}: ${href}`).toBe(true);
      if (anchor) {
        const headings = [...readFileSync(target, "utf8").matchAll(/^#{1,6} (.+)$/gm)].map(
          (heading) => heading[1]?.toLowerCase().replaceAll(" ", "-"),
        );
        expect(headings, `${name}: ${href}`).toContain(anchor);
      }
    }
    expect(focusedExamples, name).toBeGreaterThan(0);
  }
});
