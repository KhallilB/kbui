import { expect, test } from "bun:test";
import * as publicApi from "@kbui/react";
import { babelParse, loadCsf } from "storybook/internal/csf-tools";
import { exampleCode } from "../catalog/code";
import { highlightCode } from "../catalog/highlight";
import { loadSiteSamples } from "../catalog/site-samples";
import { loadCatalogSources, parseApiSection } from "../catalog/source";
import { playgroundKey } from "../site/playground-model";

test("typography is public and discoverable with light, dark and composed examples", () => {
  const entries = loadCatalogSources();
  for (const name of ["Heading", "Text", "Link", "Code"]) {
    expect(publicApi).toHaveProperty(name);
    const entry = entries.find((candidate) => candidate.name === name);
    expect(entry?.group).toBe("Typography");
    expect(entry?.stories.some((story) => story.id.endsWith("--default"))).toBe(true);
    expect(entry?.stories.some((story) => story.id.endsWith("--dark"))).toBe(true);
  }
  const article = entries
    .find((entry) => entry.name === "Heading")
    ?.stories.find((story) => story.id.endsWith("--article"));
  for (const component of ["Heading", "Text", "Link", "Code"])
    expect(article?.code).toContain(component);
});

test("catalog covers every public component with canonical API and CSF stories", () => {
  const entries = loadCatalogSources();
  expect(entries.map((entry) => entry.name).sort()).toEqual(
    Object.keys(publicApi)
      .filter((name) => /^[A-Z]/.test(name))
      .sort(),
  );
  for (const entry of entries) {
    expect(entry.api.length, entry.name).toBeGreaterThan(0);
    expect(
      entry.stories.some((story) => story.id === entry.defaultStoryId),
      entry.name,
    ).toBe(true);
    expect(new Set(entry.stories.map((story) => story.id)).size).toBe(entry.stories.length);
  }
  const button = entries.find((entry) => entry.name === "Button");
  expect(button?.stories).toContainEqual(
    expect.objectContaining({ id: "components-button--disabled", name: "Disabled" }),
  );
  const api = button?.api.find((block) => block.kind === "table");
  expect(api?.kind === "table" && api.rows.find((row) => row[0] === "`variant`")?.[1]).toBe(
    '`"primary" | "secondary" | "ghost" | "danger"`',
  );
});

test("API generation rejects malformed table rows", () => {
  const guide = "## Button\n\n| Prop | Type |\n|---|---|\n| `variant` | `primary` | `ghost` |\n";
  expect(() => parseApiSection(guide, "Button")).toThrow("Malformed API row: Button");
});

test("API generation rejects a missing component row even when notes remain", () => {
  const guide =
    "## Helpers\n\n| Component | Props |\n|---|---|\n| `Stat` | `value` |\n\nSome notes.\n";
  expect(() => parseApiSection(guide, "Helpers", "Badge")).toThrow(
    "Missing canonical API row: Badge",
  );
});

test("every canonical story supplies standalone working code", () => {
  const entries = loadCatalogSources();
  for (const entry of entries) {
    for (const story of entry.stories) {
      const code = "code" in story ? story.code : undefined;
      expect(code, story.id).toBeString();
      if (typeof code !== "string") throw new Error(`Missing code: ${story.id}`);
      expect(code).toContain('import "@kbui/react/styles.css"');
      expect(code).not.toContain('import "@kbui/css/styles.css"');
      expect(code).toContain('from "@kbui/react"');
      expect(code).toContain("export default function Example()");
      expect(code).not.toMatch(/storybook|from ["']\.\.?\//);
      expect(() => babelParse(code), story.id).not.toThrow();
    }
  }
});

test("example code retains inherited props, render helpers and global themes", () => {
  const entries = loadCatalogSources();
  const code = (name: string, id: string) =>
    entries
      .find((entry) => entry.name === name)
      ?.stories.find((story) => story.id.endsWith(`--${id}`))?.code ?? "";
  expect(code("Button", "danger")).toContain('"variant": "danger"');
  expect(code("Button", "danger")).toContain('"children": "Button"');
  const panel = code("Panel", "compact");
  expect(panel).toContain("function Sample(");
  expect(panel).toContain('"density": "compact"');
  expect(panel).toContain("type PanelProps");
  expect(panel).not.toContain("expectDepth");
  const dark = code("Status", "chip-dark");
  expect(dark).toContain("const row =");
  expect(dark).toContain("function Dot(");
  expect(dark).toContain("const labels");
  expect(dark).toContain('root.setAttribute("data-theme", "dark")');
  expect(dark).toContain('"appearance": "chip"');
});

test("syntax ranges preserve every example's exact source", () => {
  for (const entry of loadCatalogSources())
    for (const story of entry.stories) {
      const tokens = "tokens" in story ? story.tokens : undefined;
      expect(tokens, story.id).toBeArray();
      if (!Array.isArray(tokens)) throw new Error(`Missing tokens: ${story.id}`);
      let end = 0;
      for (const [start, next, kind] of tokens) {
        expect(start).toBeGreaterThanOrEqual(end);
        expect(next).toBeGreaterThan(start);
        expect(next).toBeLessThanOrEqual(story.code.length);
        expect(kind).toBeString();
        end = next;
      }
      expect(tokens.some((token) => token[2] === "keyword")).toBe(true);
      expect(tokens.some((token) => token[2] === "string")).toBe(true);
    }
});

test("highlighting distinguishes JSX, strings, comments and template expressions", () => {
  const source =
    // biome-ignore lint/suspicious/noTemplateCurlyInString: Fixture tests template syntax as source text.
    '// <Fake />\nconst label = `Step ${3}`;\nconst node = <Button size="sm">Save</Button>;';
  const parts = highlightCode(source).map(([start, end, kind]) => [source.slice(start, end), kind]);
  expect(parts).toContainEqual(["// <Fake />", "comment"]);
  expect(parts).toContainEqual(["Button", "tag"]);
  expect(parts).toContainEqual(["size", "attribute"]);
  expect(parts).toContainEqual(['"sm"', "string"]);
  expect(parts).toContainEqual(["3", "number"]);
  expect(parts).not.toContainEqual(["Fake", "tag"]);
});

test("default snippets show selected usage without generated setup", () => {
  const entries = loadCatalogSources();
  for (const entry of entries)
    for (const story of entry.stories) {
      const snippet = "snippet" in story ? story.snippet : undefined;
      expect(snippet, story.id).toBeString();
      if (typeof snippet !== "string") throw new Error("Missing concise example");
      expect(snippet).not.toContain("root.setAttribute");
      expect(snippet).not.toContain("renderExample");
      expect(snippet).not.toContain("ComponentProps");
      expect(snippet.length).toBeLessThan(story.code.length);
      expect(() => babelParse(snippet)).not.toThrow();
    }
  const button = entries
    .find((entry) => entry.id === "button")
    ?.stories.find((story) => story.id.endsWith("--danger"));
  expect(button).toHaveProperty(
    "snippet",
    'import { Button } from "@kbui/react";\n\n<Button variant="danger">Button</Button>',
  );
  const input = entries
    .find((entry) => entry.id === "input")
    ?.stories.find((story) => story.id.endsWith("--with-error"));
  expect(input).toHaveProperty(
    "snippet",
    'import { Input } from "@kbui/react";\n\n<Input label="Email" placeholder="you@example.com" error="Email is required." />',
  );
});

test("site samples cover every playground state and current composition palette", () => {
  const samples = loadSiteSamples();
  expect(Object.keys(samples.playground)).toHaveLength(96);
  expect(Object.keys(samples.surfaces)).toEqual([
    "editorial",
    "operations",
    "creative-false",
    "creative-true",
  ]);
  const selected =
    samples.playground[
      playgroundKey({ variant: "danger", size: "lg", theme: "dark", disabled: true, reduced: true })
    ];
  expect(selected?.snippet).toContain('variant="danger" size="lg" disabled');
  expect(selected?.snippet).toContain('data-theme="dark"');
  expect(selected?.snippet).toContain('transition: "none"');
  expect(selected?.code).toContain('root.setAttribute("data-theme", "dark")');
  expect(selected?.snippet).toContain('import { Button } from "@kbui/react"');
  expect(samples.surfaces["creative-true"]?.snippet).toContain("useState(true)");
  expect(samples.surfaces["creative-false"]?.snippet).toContain("useState(false)");
  expect(samples.surfaces.operations?.snippet).toContain("value={84}");
  expect(samples.surfaces.editorial?.code).toContain(".composition");
});

test("highlighting recognizes TSX function calls without coloring prose as code", () => {
  const source = "const node = <Button onClick={() => save(3)}>save(3)</Button>;";
  const parts = highlightCode(source).map(([start, end, kind]) => [source.slice(start, end), kind]);
  expect(parts).toContainEqual(["save", "function"]);
  expect(parts).toContainEqual(["onClick", "attribute"]);
  expect(parts).not.toContainEqual(["save(3)", "function"]);
});

test("highlighting preserves UTF-16 offsets across CRLF, emoji and multiline syntax", () => {
  const source =
    '/* first\r\nsecond */\r\nconst label = "🌱";\r\nconst node = <>Ready <Button onClick={() => save(label)} /></>;';
  const tokens = highlightCode(source);
  const save = tokens.find(
    ([start, end, kind]) => kind === "function" && source.slice(start, end) === "save",
  );
  expect(save?.[0]).toBe(source.indexOf("save(label)"));
  let end = 0;
  for (const [start, next] of tokens) {
    expect(start).toBeGreaterThanOrEqual(end);
    expect(next).toBeGreaterThan(start);
    expect(next).toBeLessThanOrEqual(source.length);
    end = next;
  }
  expect(
    tokens.some(
      ([start, next, kind]) => kind === "string" && source.slice(start, next).includes("🌱"),
    ),
  ).toBe(true);
});

test("visible code needs only component imports and usage", () => {
  const samples = loadSiteSamples();
  for (const sample of [
    ...loadCatalogSources().flatMap((entry) => entry.stories),
    ...Object.values(samples.playground),
    ...Object.values(samples.surfaces),
  ]) {
    expect(sample.snippet).toContain('from "@kbui/react"');
    expect(sample.snippet).not.toContain('import "@kbui/css/styles.css"');
    expect(sample.snippet).not.toContain("renderExample");
    expect(sample.snippet).not.toContain("document.documentElement");
  }
  expect(samples.surfaces["creative-false"]?.snippet).not.toContain("<svg");
  expect(samples.surfaces["creative-false"]?.snippet).not.toContain("className=");
});

test("default playground example is a direct import and Button", () => {
  const sample =
    loadSiteSamples().playground[
      playgroundKey({
        variant: "primary",
        size: "md",
        theme: "light",
        disabled: false,
        reduced: false,
      })
    ];
  expect(sample?.snippet).toBe(
    'import { Button } from "@kbui/react";\n\n<Button variant="primary" size="md">Save changes</Button>',
  );
});

test("search stays an Input icons and actions composition with complete generated dependencies", () => {
  const entries = loadCatalogSources();
  expect(entries.find((entry) => entry.name === "SearchInput")).toBeUndefined();
  const recipe = entries
    .find((entry) => entry.name === "Input")
    ?.stories.find((story) => story.id === "components-input--with-icons-and-actions");
  expect(recipe).toBeDefined();
  expect(recipe?.name).toBe("Icons and actions");
  expect(recipe?.code).toContain("function SearchExample(");
  expect(recipe?.code).toContain('type="search"');
  expect(recipe?.code).toContain('aria-label="Clear search"');
  expect(recipe?.code).toContain("control.current?.focus()");
  expect(recipe?.snippet).toContain("useRef");
  expect(recipe?.snippet).not.toContain("SearchInput");
});

test("quantity and retained-file components are public and discoverable with runnable states", () => {
  expect(publicApi).toHaveProperty("NumberField");
  expect(publicApi).toHaveProperty("FileInput");
  const entries = loadCatalogSources();
  for (const name of ["NumberField", "FileInput"]) {
    const entry = entries.find((candidate) => candidate.name === name);
    expect(entry?.group).toBe("Forms");
    expect(entry?.stories.some((story) => story.id.endsWith("--default"))).toBe(true);
    expect(entry?.stories.some((story) => story.id.endsWith("--dark"))).toBe(true);
    expect(entry?.stories.some((story) => story.id.endsWith("--read-only"))).toBe(true);
  }
});

test("dark stateful render declarations stay outside the theme wrapper", () => {
  const csf = loadCsf(
    `import { useState } from "react";
    import { Button } from "./Button";
    export default { title: "Components/Button", component: Button,
      render: function Example() {
        const [count, setCount] = useState(0);
        return <Button onClick={() => setCount(count + 1)}>{count}</Button>;
      } };
    export const Dark = { globals: { theme: "dark" } };`,
    { fileName: "Button.stories.tsx", makeTitle: (title) => title },
  ).parse();
  const sample = exampleCode(csf, "Dark", "Button");
  expect(() => babelParse(sample.snippet)).not.toThrow();
  expect(sample.snippet).toContain('<div data-theme="dark"><Example /></div>');
});

test("API documentation preserves subsection headings", () => {
  const blocks = parseApiSection(
    "## Input\n\nUse a field.\n\n### Search composition\n\nAdd a clear action.\n",
    "Input",
  );
  expect(blocks).toEqual([
    { kind: "paragraph", text: "Use a field." },
    { kind: "heading", level: 3, text: "Search composition" },
    { kind: "paragraph", text: "Add a clear action." },
  ]);
});
