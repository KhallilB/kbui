import { expect, test } from "bun:test";
import {
  createPreviewCache,
  markPreviewReady,
  requestPreview,
} from "../site/catalog-preview-cache";

const request = (id: string, generation = 0, theme = "light") => ({
  src: `/iframe.html?id=${id}&globals=previewTheme:${theme}&embed=true`,
  title: id,
  layout: { width: 520, minimum: 96 },
  generation,
});
test("returning to a cached state preserves its document identity", () => {
  let cache = createPreviewCache(request("a"));
  cache = markPreviewReady(cache, cache.requested);
  const original = cache.requested;
  cache = requestPreview(cache, request("b"));
  cache = markPreviewReady(cache, cache.requested);
  cache = requestPreview(cache, request("a"));
  expect(cache.requested).toBe(original);
  expect(cache.displayed).toBe(original);
  expect(cache.entries).toHaveLength(2);
});
test("theme changes do not create or navigate preview documents", () => {
  const cache = createPreviewCache(request("a"));
  expect(requestPreview(cache, request("a", 0, "dark"))).toBe(cache);
});
test("late completion cannot replace the current requested state", () => {
  let cache = createPreviewCache(request("a"));
  const a = cache.requested;
  cache = requestPreview(cache, request("b"));
  const b = cache.requested;
  cache = markPreviewReady(cache, b);
  cache = markPreviewReady(cache, a);
  expect(cache.displayed).toBe(b);
});
test("reload replaces only the selected state after readiness", () => {
  let cache = createPreviewCache(request("a"));
  cache = markPreviewReady(cache, cache.requested);
  const old = cache.displayed;
  cache = requestPreview(cache, request("a", 1));
  expect(cache.requested).not.toBe(old);
  expect(cache.displayed).toBe(old);
  cache = markPreviewReady(cache, cache.requested);
  expect(cache.entries).toHaveLength(1);
});
test("least-recently-used eviction caps documents at six without evicting displayed preview", () => {
  let cache = createPreviewCache(request("a"));
  cache = markPreviewReady(cache, cache.requested);
  const displayed = cache.displayed;
  for (const id of ["b", "c", "d", "e", "f", "g", "h"]) cache = requestPreview(cache, request(id));
  expect(cache.entries).toHaveLength(6);
  expect(cache.entries.some((entry) => entry.id === displayed)).toBe(true);
  expect(cache.entries.some((entry) => entry.title === "b")).toBe(false);
});
