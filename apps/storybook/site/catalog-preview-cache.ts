export type PreviewRequest = {
  src: string;
  title: string;
  layout: { width: number; minimum: number };
  generation: number;
};
export type PreviewEntry = PreviewRequest & {
  id: string;
  source: string;
  ready: boolean;
  height: number;
  used: number;
};
export type PreviewCache = {
  entries: PreviewEntry[];
  requested: string;
  displayed: string;
  source: string;
  generation: number;
  clock: number;
};
export function previewSourceKey(src: string) {
  return src.replace(/(&globals=previewTheme:)(light|dark)/, "$1");
}
function entry(request: PreviewRequest, clock: number): PreviewEntry {
  const source = previewSourceKey(request.src);
  return {
    ...request,
    source,
    id: `${source}:${request.generation}`,
    ready: false,
    height: 0,
    used: clock,
  };
}
export function createPreviewCache(request: PreviewRequest): PreviewCache {
  const first = entry(request, 0);
  return {
    entries: [first],
    requested: first.id,
    displayed: first.id,
    source: first.source,
    generation: request.generation,
    clock: 0,
  };
}
export function requestPreview(
  cache: PreviewCache,
  request: PreviewRequest,
  limit = 6,
): PreviewCache {
  const source = previewSourceKey(request.src);
  if (source === cache.source && request.generation === cache.generation) return cache;
  const clock = cache.clock + 1;
  const found =
    request.generation === cache.generation
      ? cache.entries.find((candidate) => candidate.source === source)
      : undefined;
  const target = found ? { ...found, used: clock } : entry(request, clock);
  let entries = found
    ? cache.entries.map((candidate) => (candidate.id === found.id ? target : candidate))
    : [...cache.entries, target];
  while (entries.length > limit) {
    const victim = entries
      .filter((candidate) => candidate.id !== target.id && candidate.id !== cache.displayed)
      .sort((a, b) => a.used - b.used)[0];
    if (!victim) break;
    entries = entries.filter((candidate) => candidate.id !== victim.id);
  }
  // Keep insertion order: moving iframe DOM nodes reloads their browsing contexts.
  return {
    entries,
    requested: target.id,
    displayed: target.ready ? target.id : cache.displayed,
    source,
    generation: request.generation,
    clock,
  };
}
export function markPreviewReady(cache: PreviewCache, id: string): PreviewCache {
  const target = cache.entries.find((candidate) => candidate.id === id);
  if (!target || target.ready) return cache;
  const displayed = id === cache.requested ? id : cache.displayed;
  const entries = cache.entries
    .filter(
      (candidate) => displayed !== id || candidate.id === id || candidate.source !== target.source,
    )
    .map((candidate) => (candidate.id === id ? { ...candidate, ready: true } : candidate));
  return { ...cache, entries, displayed };
}
export function measurePreview(cache: PreviewCache, id: string, height: number): PreviewCache {
  const target = cache.entries.find((candidate) => candidate.id === id);
  if (!target || target.height === height) return cache;
  return {
    ...cache,
    entries: cache.entries.map((candidate) =>
      candidate.id === id ? { ...candidate, height } : candidate,
    ),
  };
}
