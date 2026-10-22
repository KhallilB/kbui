# 0011. Render Facet as a rounded, lit plane with skin-controlled glass and light

## Status

Accepted on 2026-10-22. Replaces the cut-corner rendering of `Facet` from pull requests #2, #7 and #9. Removes the `cut` prop, which is a breaking change before 1.0.

## Context

The first `Facet` was a flat plane with a 1px seam and a corner removed with `clip-path`. The owner judged it weak and flat. A later version kept the cut and added lit bevels and drop shadows. The owner rejected that too: the cut corners looked bad, and they asked for something more modern.

A review of shipping dark interfaces on 2026-10-22 (Linear, Vercel Geist, Raycast, Radix Themes, GitHub Primer, Grafana, Zed) found that none of them cuts panel corners. They create depth with four techniques:

- small lightness steps between surfaces;
- a two-part edge: a hairline plus a lit top edge;
- a short contact shadow plus a long soft one;
- a darker recessed area for content.

The owner chose a mockup that adds three things on top of those: rounded corners, a rim lit from the top, and tone-colored light emitted from behind active and blocked panels, with optional glass.

## Decision

`Facet` renders two decorative layers before its content, both `aria-hidden` and ignoring pointer events:

- `.kb-facet-glow`: a blurred radial pool of light behind the panel. Its color comes from `facet.glow`, or `facet.glow-active` and `facet.glow-critical` for those tones. Every glow color defaults to `transparent`. It is static and never animates.
- `.kb-facet-plate`: the fill, with `facet.sheen` fading out by 55%; the `facet.highlight` top edge; the `facet.shadow` or `facet.shadow-active` lift; and `facet.backdrop` as a `backdrop-filter`, default `none`. Its `::before` is the rim: a 1px masked ring running from `facet.rim-top` through `facet.border` to `facet.rim-bottom`. Active and critical tones recolor the top of the rim.

The root carries `facet.radius` and never clips, filters or hides overflow, so focus rings stay whole. The rail sits inside the plate and is clipped by its rounded corners. `Facet.Well` is a recessed area with `facet.well`, `facet.well-shadow` and `facet.well-radius`. `Status` chips take `status.radius`, so a skin can make them pills, and `status.glow`, a blur length that defaults to `0px`, so the icon can glow in its tone color.

Defaults stay sober: no glow, no glass, no sheen. A product skin turns them up through the tokens, all of which are listed in `tokens.json`.

## Options considered

- Rounded lit plane with skin-controlled light and glass: accepted. It uses the proven depth techniques, keeps kbui neutral, and gives a product skin room for a bolder look.
- Cut corners drawn on a separate plate, with a drop-shadow that follows the cut: rejected by the owner on looks. It was also an unproven pattern.
- Glow and glass on by default: rejected. Light and blur are a product decision and cost rendering time. kbui ships them off.
- `filter` or `overflow: hidden` on the root: rejected. Either would clip focus rings, and a filter would repaint with every line of streamed output.

## Consequences

The `cut` prop, the `FacetCut` type and the `facet.cut`, `facet.cut-start`, `facet.cut-end`, `facet.corner`, `facet.cut-edge` and `facet.seam-active` tokens are removed. A consumer that used them must drop them. Each facet renders two extra decorative spans. The glow layer is a blurred element: cheap when transparent, but a skin that lights many panels should check frame time.

## Soundness boundary

Story play tests check in Chromium:

- the root has no `clip-path`, `filter` or hidden overflow;
- the plate's radius matches the root's;
- the plate has a shadow;
- the rim mask uses `exclude`;
- a skin's glow colors reach the active and critical panels;
- a wrapper-scoped radius reaches the plate.

They do not judge whether the light looks good. A person still makes that call until decision 0008's screenshot tests exist.

## Threat model

Guards against clipped focus, decorative layers that intercept clicks, and product styling leaking into kbui's defaults. Does not guard against a skin choosing glow or rim colors that lower text contrast.

## Non-goals

- Motion. The glow is static. Only the existing color transitions run, and they respect reduced motion.
- Noise or grain textures.

## Revisit if

- Profiling shows the glow or backdrop layers cost frames with many facets on screen.
- A second consumer needs a different light model, such as a directional light.

## Adoption

`Facet` in `@kbui/react`, `facet.css` and `status.css` follow this record. The Storybook skin fixture and the `LitRoom` story turn the light up.

## Validation

- Done: `packages/css/src/build.test.ts` checks that no rule clips, that only the glow filters and only the plate blurs its backdrop, and that the rim, sheen, glass, glow, shadow, well and chip all come from tokens.
- Done: `packages/tokens/src/build.test.ts` checks that the cut tokens are gone, that the light tokens default to off, and that both themes have shadows.
- Done: the `Depth`, `DepthDark`, `LitRoom` and `FocusVisible` stories run as play tests in `bun run test:stories`.

## Links

- Builds on: [0010](0010-dark-product-skin-light-validated.md)
- Related: [0008](0008-visual-regression-with-vitest-browser-screenshots.md)
