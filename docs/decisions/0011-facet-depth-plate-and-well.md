# 0011. Give Facet depth with a shadowed plate and a recessed well

## Status

Accepted on 2026-10-22. Supersedes the flat-plane rendering of `Facet` from pull requests #2, #7 and #9; the component API is unchanged.

## Context

The first `Facet` was a flat plane: one surface color, a 1px seam and a corner removed with `clip-path`. The owner judged it weak and lacking depth. A review of shipping dark interfaces on 2026-10-22 (Linear, Vercel Geist, Raycast, Radix Themes, GitHub Primer, Grafana and Zed) found four techniques that create depth without hurting legibility:

- small lightness steps between page, panel and raised panel;
- a two-part edge: a hairline plus a lit top edge;
- layered shadows, one short contact shadow and one long soft shadow;
- a darker recessed area for content inside a lighter frame.

The same review found that none of those products cuts panel corners. It also showed why our cut looked weak: `clip-path` removes an element's own `box-shadow` and border, so the cut plane could never cast a shadow.

A separate defect: `facet.cut-start` and `facet.cut-end` were aliases of `facet.cut`. Aliases resolve at `:root`, so a skin that set `--kb-facet-cut` on a wrapper had no effect.

## Decision

A facet is a bezel plate with an optional screen well:

- `Facet` renders a decorative `.kb-facet-frame > .kb-facet-plate` first, with `aria-hidden`. The frame holds `filter: drop-shadow(...)` from `facet.shadow` or `facet.shadow-active`. The plate holds the shape: a polygon with a small `facet.corner` bevel on every corner and the larger cut on the corners `cut` names. Because the shadow is filtered from the frame, it follows the polygon. Content stays outside the filter, so streaming output does not repaint the shadow layer. The root is never clipped or filtered.
- The plate paints the seam and lights each bevel with `facet.cut-edge`; a fill layer inset by the seam width carries the surface color and a `facet.highlight` top edge.
- `Facet.Well` is a recessed area, `facet.well` and `facet.well-shadow`, for logs and output.
- Edge, highlight, divider and shadow have default values in both themes. A facet has depth without a skin.
- Active plates lift with `facet.shadow-active` and a 1px accent seam. Quiet, sunken and nested facets cast no shadow, so a stack has one lift.
- `facet.cut-start` and `facet.cut-end` are no longer root tokens. The stylesheet reads them as optional hooks, `var(--kb-facet-cut-start, var(--kb-facet-cut))`, at the facet itself, so `--kb-facet-cut` and the hooks work on any wrapper.

The cut corner stays as kbui's signature. It is not a proven pattern in shipping products, so it remains opt-in through `cut`, and the default `cut="none"` is a plate with small machined bevels.

## Options considered

- Shadowed plate on a frame element, with a well: accepted. It gains the proven depth techniques and keeps the cut, and its shadow follows the shape.
- Rounded rectangles with `box-shadow` and no cut: rejected for now. It is the most common pattern and would drop the facet identity entirely. It is the fallback if the cut keeps reading as decoration.
- `filter: drop-shadow` on the root: rejected. The filter would cover the content, so every streamed line would repaint the shadow layer, and terminals inside a facet would pass through a filter.
- CSS `corner-shape: bevel`: rejected. It is not available in WebKit, which the first consumer's desktop shell uses.

## Consequences

Each facet renders two extra decorative spans. The anatomy contract names them.

The default look changes for every consumer: plates now cast shadows and show lit edges. A skin that wants the old flat look sets `--kb-facet-shadow: none` and the edge tokens to `transparent`.

A skin that set `--kb-facet-cut-start` or `--kb-facet-cut-end` still works. A skin that relied on those names being documented root tokens must treat them as optional hooks.

## Soundness boundary

Story play tests check the computed result in Chromium: the root has no `clip-path` and no `filter`; the frame has a `drop-shadow` filter and ignores pointer events; the plate has a polygon clip; a wrapper-scoped `--kb-facet-cut` reaches the plate. They do not judge whether the depth looks right. That is still a person's call until decision 0008's screenshot tests exist.

## Threat model

Guards against shadows lost to clipping, focus rings clipped by the shape, skins whose cut silently does nothing, and stacked shadows on nested facets. Does not guard against a skin that sets low-contrast edge or well colors.

## Non-goals

- Motion. Nothing animates except the color transitions that already respect reduced motion.
- Blur, glass or noise textures. Reference products keep those out of content panels.

## Revisit if

- Users read the cut as decoration rather than structure.
- WebKit ships `corner-shape`, which could replace the polygon.
- Profiling shows the frame filter costs frames with many facets on screen.

## Adoption

`Facet` in `@kbui/react` and `facet.css` follow this record. The Storybook skin fixture sets `--kb-facet-cut` again.

## Validation

- Done: `packages/css/src/build.test.ts` allows `clip-path` only on the plate and `filter` only on the frame, and checks the cut fallback.
- Done: `packages/tokens/src/build.test.ts` checks that the per-side cuts are not root tokens and that depth tokens have dark values.
- Done: the `Depth`, `DepthDark`, `ScopedCut` and `FocusInsideCut` stories run as play tests in `bun run test:stories`.

## Links

- Builds on: [0010](0010-dark-product-skin-light-validated.md)
- Related: [0008](0008-visual-regression-with-vitest-browser-screenshots.md)
