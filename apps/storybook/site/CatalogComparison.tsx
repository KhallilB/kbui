import { useState } from "react";
import type { CatalogEntry } from "../catalog/types";
import { StoryPreview } from "./CatalogPreview";
import { type CatalogAppearance, previewGlobals, previewLayout } from "./catalog-model";
import type { CodeRequest } from "./component-code";

export function CatalogComparisonPreview({
  active,
  entry,
  story,
  appearance,
  generation,
  storybookRoot,
  code,
  expanded = false,
}: {
  code?: CodeRequest;
  active: boolean;
  entry: CatalogEntry;
  story: CatalogEntry["stories"][number];
  appearance: CatalogAppearance;
  generation: number;
  storybookRoot: string;
  expanded?: boolean;
}) {
  const key = `${story.id}:${generation}`;
  const [load, setLoad] = useState({ key, phase: "loading" });
  const phase = load.key === key ? load.phase : "loading";
  return (
    <StoryPreview
      code={code}
      active={active}
      appearance={appearance}
      generation={generation}
      cacheLimit={2}
      expanded={expanded}
      fullWidth
      pending={phase === "loading" || phase === "slow"}
      status={
        phase === "failed"
          ? "Comparison unavailable. Reload the preview to retry."
          : phase === "slow"
            ? "Taking longer than expected. Reload the preview to retry."
            : phase === "loading"
              ? "Loading comparison…"
              : ""
      }
      layout={previewLayout(entry.id, story.id)}
      title={`${entry.name} — ${story.name} Dark comparison`}
      src={`${storybookRoot}iframe.html?id=${encodeURIComponent(story.id)}&viewMode=story${previewGlobals(appearance)}&embed=true`}
      onLoad={() => setLoad({ key, phase: "ready" })}
      onSlow={() => setLoad({ key, phase: "slow" })}
      onError={() => setLoad({ key, phase: "failed" })}
    />
  );
}
