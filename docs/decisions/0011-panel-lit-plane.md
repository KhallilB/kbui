# 0011. Render Panel as a rounded, lit plane with skin-controlled glass and light

## Status

Accepted on 2026-10-22. Replaces the cut-corner rendering from pull requests #2, #7 and #9, and renames the component from `Facet` to `Panel`, its classes from `.kb-facet-*` to `.kb-panel-*` and its tokens from `facet.*` to `panel.*`. Both are breaking changes before 1.0; v0.1.0 shipped `Facet`.

## Context

The first version, then named `Facet` after its cut corner, was a flat plane with a 1px seam and a corner removed with `clip-path`. The owner judged it weak and flat. A later version kept the cut and added lit bevels and drop shadows. The owner rejected that too: the cut corners looked bad, and they asked for something more modern.

A review of shipping dark interfaces on 2026-10-22 (Linear, Vercel Geist, Raycast, Radix Themes, GitHub Primer, Grafana, Zed) found that none of them cuts panel corners. They create depth with four techniques:

- small lightness steps between surfaces;
- a two-part edge: a hairline plus a lit top edge;
- a short contact shadow plus a long soft one;
- a darker recessed area for content.

The owner chose a mockup that adds three things on top of those: rounded corners, a rim lit from the top, and tone-colored light emitted from behind active and blocked panels, with optional glass.

## Decision

`Panel` renders two decorative layers before its content, both `aria-hidden` and ignoring pointer events:

- `.kb-panel-glow`: a blurred radial pool of light behind the panel. Its color comes from `panel.glow`, or `panel.glow-active` and `panel.glow-critical` for those tones. Every glow color defaults to `transparent`. It is static and never animates.
- `.kb-panel-plate`: the fill, with `panel.sheen` fading out by 55%; the `panel.highlight` top edge; the `panel.shadow` or `panel.shadow-active` lift; and `panel.backdrop` as a `backdrop-filter`, default `none`. Its `::before` is the rim: a 1px masked ring running from `panel.rim-top` through `panel.border` to `panel.rim-bottom`. Active and critical tones recolor the top of the rim.

The root carries `panel.radius` and never clips, filters or hides overflow, so focus rings stay whole. The rail sits inside the plate and is clipped by its rounded corners. `Panel.Well` is a recessed area with `panel.well`, `panel.well-shadow` and `panel.well-radius`. `Status` chips take `status.radius`, so a skin can make them pills, and `status.glow`, a blur length that defaults to `0px`, so the icon can glow in its tone color.

Defaults stay sober: no glow, no glass, no sheen. A product skin turns them up through the tokens, all of which are listed in `tokens.json`.

The name `Facet` described the cut corner. With the cut gone, the component is a plain panel, so it is renamed `Panel`.

## Options considered

- Rounded lit plane with skin-controlled light and glass: accepted. It uses the proven depth techniques, keeps kbui neutral, and gives a product skin room for a bolder look.
- Cut corners drawn on a separate plate, with a drop-shadow that follows the cut: rejected by the owner on looks. It was also an unproven pattern.
- Glow and glass on by default: rejected. Light and blur are a product decision and cost rendering time. kbui ships them off.
- `filter` or `overflow: hidden` on the root: rejected. Either would clip focus rings, and a filter would repaint with every line of streamed output.

## Consequences

The `cut` prop, the `PanelCut` type and the `panel.cut`, `panel.cut-start`, `panel.cut-end`, `panel.corner`, `panel.cut-edge` and `panel.seam-active` tokens are removed. A consumer that used them must drop them. Each panel renders two extra decorative spans. The glow layer is a blurred element: cheap when transparent, but a skin that lights many panels should check frame time.

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

- Profiling shows the glow or backdrop layers cost frames with many panels on screen.
- A second consumer needs a different light model, such as a directional light.

## Adoption

`Panel` in `@kbui/react`, `panel.css` and `status.css` follow this record. The Storybook skin fixture and the `TokenOverrides` story turn the light up.

## Validation

- Done: `packages/css/src/build.test.ts` checks that no rule clips, that only the glow filters and only the plate blurs its backdrop, and that the rim, sheen, glass, glow, shadow, well and chip all come from tokens.
- Done: `packages/tokens/src/build.test.ts` checks that the cut tokens are gone, that the light tokens default to off, and that both themes have shadows.
- Done: the `Depth`, `DepthDark`, `TokenOverrides` and `FocusVisible` stories run as play tests in `bun run test:stories`.

## Links

- Builds on: [0010](0010-dark-product-skin-light-validated.md)
- Related: [0008](0008-visual-regression-with-vitest-browser-screenshots.md)
