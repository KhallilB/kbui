import { expect, test } from "bun:test";
import {
  getHighlightCacheSize,
  hasHighlightCacheEntry,
  highlightCode,
  MAX_HIGHLIGHT_CACHE_ENTRIES,
} from "../catalog/highlight";

test("CSS highlights selectors, properties and values using CSS grammar", () => {
  const code = ".save { color: var(--kb-color-accent); padding: 12px; }";
  const parts = highlightCode(code, "css").map(([start, end, kind]) => [
    code.slice(start, end),
    kind,
  ]);
  expect(parts).toContainEqual([".save", "tag"]);
  expect(parts).toContainEqual(["color", "attribute"]);
  expect(parts).toContainEqual(["var", "function"]);
  expect(parts).toContainEqual(["12", "number"]);
});

test("HTML keeps prose plain and recognizes HTML comments and attributes", () => {
  const code = '<!-- note -->\n<html lang="en"><p>const save = 3;</p></html>';
  const parts = highlightCode(code, "html").map(([start, end, kind]) => [
    code.slice(start, end),
    kind,
  ]);
  expect(parts).toContainEqual(["<!-- note -->", "comment"]);
  expect(parts).toContainEqual(["lang", "attribute"]);
  expect(parts).not.toContainEqual(["const", "keyword"]);
});

test("shell highlights command flags and comments", () => {
  const code = 'npm install --save "@kb.ui/react" # install';
  const parts = highlightCode(code, "shellscript").map(([start, end, kind]) => [
    code.slice(start, end),
    kind,
  ]);
  expect(parts).toContainEqual(["--save", "attribute"]);
  expect(parts).toContainEqual(["# install", "comment"]);
  expect(parts).toContainEqual(['"@kb.ui/react"', "string"]);
});

test("highlight cache caps retained entries with LRU eviction and returns isolated token copies", () => {
  const firstDraft = "const retainedDraft = 0;";
  const evictedDraft = "const evictedDraft = 1;";
  const initialTokens = highlightCode(firstDraft, "tsx");
  initialTokens[0]?.push("mutated" as never);
  expect(highlightCode(firstDraft, "tsx")[0]?.length).toBe(3);

  highlightCode(evictedDraft, "tsx");
  for (let index = 0; index < MAX_HIGHLIGHT_CACHE_ENTRIES - 2; index++) {
    highlightCode(`const draft_${index} = ${index};`, "tsx");
  }
  // Touch firstDraft so evictedDraft becomes the least-recently-used entry.
  highlightCode(firstDraft, "tsx");
  highlightCode("const overflowDraft = 9999;", "tsx");

  expect(getHighlightCacheSize()).toBeLessThanOrEqual(MAX_HIGHLIGHT_CACHE_ENTRIES);
  expect(hasHighlightCacheEntry(firstDraft, "tsx")).toBe(true);
  expect(hasHighlightCacheEntry(evictedDraft, "tsx")).toBe(false);
});

test("TSX highlights JSX, strings, comments and template expressions", () => {
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

test("TSX highlights function calls without coloring JSX prose as code", () => {
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
