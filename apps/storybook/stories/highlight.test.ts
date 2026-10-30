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
