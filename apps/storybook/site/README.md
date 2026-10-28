# kbui home

A maintained product home for kbui: identity, one playful working composition, links to curated examples, components, and getting started. The home, playground, curated examples, and component catalog share one visual frame. Detailed API docs remain in Storybook; the same demo sources power both the site and Storybook tests.

## Run and build

From the repository root:

```bash
bun install --frozen-lockfile
bun run build
bun run --filter @kbui/storybook build:site
bun run --filter @kbui/storybook preview:site
```

Serve the combined `apps/storybook/dist/` directory as one site. The home lives at `/`, the playground at `/playground/`, curated examples at `/examples/`, the component catalog at `/components/`, legacy catalog redirect at `/components/qa/`, the settings/operations workspace at `/compare/`, installation at `/setup/`, theme guidance at `/setup/themes/`, release notes at `/changelog/`, and Storybook at `/storybook/`. The nine site routes are separate built HTML entries, so direct loads need no application fallback. Relative asset and documentation paths support hosting under a subdirectory. Deploying only the landing bundle breaks documentation links.

For fast home edits, use `bun run --filter @kbui/storybook dev:site`. Live catalog previews and documentation links require the combined static preview; the Vite development server does not serve Storybook.

## Maintain the examples

| Source | Role | Storybook proof |
| --- | --- | --- |
| `SiteFrame.tsx` | Shared brand, navigation, current-page state, skip link and footer | `stories/Home.stories.tsx`, `stories/Workbench.stories.tsx`, `stories/Examples.stories.tsx` |
| `Home.tsx` | Product home, links, and the latest-release pill | `stories/Home.stories.tsx` |
| `Changelog.tsx`, `changelog-model.ts`, `release-notes.ts` | Release versions, dates, links, and component names come from the generated root `CHANGELOG.md`. Edited titles, highlights, and upgrade steps come from `release-notes.ts`; the public page omits commit categories and counts. Version links open the selected release | `stories/Changelog.stories.tsx`, `stories/changelog-model.test.ts`, `stories/release-notes.test.ts` |
| `PlanDemo.tsx` | Day-off composition, rendered directly by the home | `stories/PlanDemo.stories.tsx` |
| `Workbench.tsx` | Prop playground, copied JSX, and six searchable component entries | `stories/Workbench.stories.tsx` |
| `Catalog.tsx` | Searchable catalog, shareable component pages, canonical API summaries and live Storybook previews | `stories/Catalog.stories.tsx`, `stories/catalog-source.test.ts` |
| `CatalogComparison.tsx` | Optional pinned dark preview alongside the light example | `stories/CatalogDetails.stories.tsx`, `catalog/verify-runtime.ts` |
| `CatalogSkinControls.tsx`, `catalog-skin.ts` | Preview-local palette and corner controls, CSS overrides and reset | `stories/CatalogSkinControls.stories.tsx`, `stories/catalog-skin.test.ts` |
| `CodePanel.tsx` | Shared import-and-usage view, highlighting, automatic wrapping and clipboard recovery | Catalog, Workbench and Examples stories |
| `catalog/site-samples.ts` | Generated playground combinations and curated composition code | Source coverage and `verify:code` |
| `Examples.tsx` | Curated examples page and three shared compositions | `stories/Examples.stories.tsx`, `stories/Compositions.stories.tsx` |

Edit the shared source rather than saving a new study or duplicating a demo for the home. Callers supply separate `siteRoot` and `storybookRoot` values: shared navigation stays on site pages, while API links resolve to Storybook. Static inner pages use `../` and `../storybook/`; Storybook page stories use `../` and `./`. Full API tables and accessibility guidance stay with the existing component documentation.

The day-off composition owns ephemeral plan-name, activity-selection and note state. It composes the exported Card, Button, Checkbox, Dialog, Input, Progress and Status. Shared Checkbox labels, descriptions, keyboard behavior and forced-color rendering replace site-owned checkbox markup. Checkbox values derive progress and the summary. The note uses Input, survives activity changes and renaming, and clears on reset alongside selections and the plan name. Clear note empties the field and returns input focus; Done, Enter and Escape move focus to the plan summary without discarding text. Checklist rows keep padding around both controls and descriptions. Renaming uses the actual Dialog and Input, including empty-name feedback, Escape dismissal and focus restoration. No state is saved or sent anywhere. The visual bloom changes when every activity is selected, including activities added through the existing dialog. Component behavior remains owned by kbui.

The workbench preserves the real Button preview, reset to the page theme, variants, sizes, disabled state, semantic themes, motion reduction, code generation and clipboard failure feedback. It lives on its own site page without placing its controls on the landing page. The live preview uses the shared site palette and native component materials. It follows the page theme until the visitor selects a local override; Reset clears that override.

## Design and geometry

The chosen direction is a bold living poster, explicitly selected by the owner. Chalk and graphite surfaces, a persimmon accent and restrained illustration colors frame expressive type and one small interaction. The home introduces kbui by letting visitors use a composed interface; a linked component index explains the functional parts, while prop controls stay in the playground.

Considered alternatives were an illustrated little world and a quieter editorial home. The living poster gives the identity more expression while keeping ordinary links, checkboxes, and a dialog familiar. Motion is limited to interaction feedback and respects reduced-motion preferences.

`logo.svg` owns the mark: a 36-unit square canvas, uniform 6-unit strokes, and exact 45-degree arms. The favicon uses the same path. The bloom uses eight equal circles around a common center, with a central disk and simple face. The checkbox tick comes from the shared Checkbox SVG, independent of font glyphs. All geometry is flat SVG or actual rounded shapes; layered paper shadows add depth without scaling or tilting interactive controls. The curated color composition uses the same exact flat geometry without construction-guide overlays.

`site.css` owns the common typography, page chrome and spacing. `home.css` and `plan-demo.css` carry the tactile landing direction. `surface-polish.css` extends it to Components, Playground, Examples and Get Started with theme-aware paper surfaces, calmer copy, hover/press feedback, selection transitions and reduced-motion support.

This site continuation starts from the exact `v0.7.0` tag. Manifest versions remain 0.7.0 until the release pipeline bumps them. React props and interaction implementations retain that baseline; default package colors, Card materials and segmented-control CSS now include the palette refresh. Select, Checkbox, RadioGroup, Switch, Input adornments and overlay behavior come from the released components. Unreleased Heading, Text and Link additions remain in the original checkout and are not represented as 0.7.0 exports.

`workbench.css` and `examples.css` own page-specific layout. All compositions inherit the navigation theme and native component materials. The creative artwork shares persimmon, marigold and lilac with the planner flower, with a more saturated alternate state.

Spacing has three local foundations: `--page-gutter` for shared page edges, `--section-space` for vertical pacing, and `--card-inset` for composition padding. The headline scales with its own column. Checklist rows use a fixed control column and a flexible text column, symmetric padding, and explicit title/description leading. The final call-to-action stays inset even at intermediate desktop widths; the home stories guard against losing those margins. On phones, the header wraps when space is tight, checklist rows retain their full label hit area, and navigation, secondary links, and demo actions have at least 44-pixel tap areas. Mobile section insets stay at 24 pixels with 32/48-pixel vertical spacing.

`accessibility.css` owns shared system-color support across home, standalone examples, and workbench. The [maintained feature map](../../../docs/features.md) links capabilities to canonical docs and checks; the `kbui-docs-features` skill maintains that map.


## Catalog source contract

The catalog covers all 29 public components. `catalog/source.ts` uses Storybook's own CSF parser to derive the 169 example names and IDs from colocated component stories. It reads API tables and usage blocks from `packages/react/README.md`; `catalog/definitions.ts` holds only grouping, short descriptions and API section mapping. The source test compares the catalog against public exports and rejects malformed API rows or missing guide entries.

A build-time virtual module supplies that data to the site and Storybook without bundling the Node parser into the browser. Guide and component-story changes invalidate the module during development. `build:site` ends with `verify:catalog`, which checks every story and documentation ID against the built Storybook index. An ID mismatch fails the build.

`/components/` opens a full-page searchable component directory with category filters, descriptions and example counts. Selecting a card opens component details with a live example, canonical state choices, code and API guidance. `?component=input&state=components-input--with-error` addresses an example directly. Selection pushes a shareable URL; All components restores directory filters, scroll and focus. Unknown components offer recovery and unknown states fall back with a notice. Navigation owns the site theme; redundant Light/Dark example choices stay hidden and legacy links map to the canonical example.

Each inspector retains up to six titled Storybook preview documents in an in-memory least-recently-used cache. Returning to a cached example preserves its native node, draft and interaction state. The previous canvas stays visible while a requested document loads. Readiness checks the requested canonical source and generation, so late content cannot replace the current example. Cloudflare’s `/storybook/iframe.html` to `/storybook/iframe` redirect is accepted with the same origin and exact query values; query ordering is normalized. The release verifier reproduces the HTTP redirect against the built artifact. Reload replaces only the selected document. Hidden and loading frames stay inert and cannot pull focus or scroll the parent. Insertion order remains stable because moving iframe DOM nodes reloads browsing contexts.

Theme updates reach the same-origin Storybook root before paint and through an exact-parent message without document navigation. Body portals inherit that root theme. QA embeds skip automatic story playback. Loading completes when story content mounts; after ten seconds the status offers reload and a direct Storybook link, while late content may still recover.

Root observation fits iframe height to content, including wrapping and font loading, and disconnects on document changes. Small controls center in compact canvases; fields/cards use readable widths, while layout primitives keep full width. Overlay examples retain room for popups. Expand preview adds space without remounting; content and overlay reserves always win. Explicit expansion during loading overrides deferred compaction. Busy status overlays the canvas without shifting the code toolbar.

Selected state, cached drafts and open code survive theme changes and Back/Forward within the current page session. Refresh retains URL selection but starts new transient documents. API columns remain labelled keyboard-scrollable regions. Canonical component stories own live behavior and accessibility checks; catalog stories and native verifiers cover shell navigation, readiness, cache limits and recovery.

The shared Storybook decorator makes specimen alignment the default in the live catalog, detail previews and standalone component stories. Small controls and their variant groups center in both axes. Menu reserves the popup footprint below its trigger, centering the complete trigger-and-popup composition; its native keyboard behavior and focus guards remain unchanged. Input, Card, Callout and Progress use centered, readable-width examples with natural internal text alignment. Grid, Panel and ScrollArea retain full-width, top/start alignment. Page compositions keep their own layouts. `component-preview.css` owns presentation; iframe sizing observes the intrinsic `.component-preview-content` height so centered viewport space does not prevent expansion, collapse or content-driven shrinkage. Inline documentation examples use a compact minimum stage rather than a full viewport.

### Working code

Catalog, playground, landing installation and curated surfaces use one `CodePanel.tsx` and `code-panel.css`. Its disclosure and copy actions use the exported Button; the landing installation CTA also composes Button with a theme-preserving navigation link. Code opens beneath the live example without remounting it. The panel contains necessary public/React imports and concise selected-state usage. There is no Setup mode. Copy matches the visible example. Open state persists while changing examples; stale clipboard feedback resets. Success replaces the Copy label/icon with Copied and a checkmark for two seconds; repeat copies restart that interval. Fixed button width and a visually hidden atomic status announcement prevent layout changes. The timer clears on example changes and unmount. Clipboard failure shows Copy failed in the action, announces manual-copy guidance, and opens/focuses the code region.

`catalog/code.ts` derives catalog snippets and complete modules from canonical CSF. Storybook's args resolver merges defaults and inherited states; spread expansion preserves later props and explicit JSX children. Required helper declarations and hook imports remain with the example. Generated theme effects and wrapper/type scaffolding are omitted from visible usage. Dark examples retain a local theme container; the default playground has no theme wrapper. Complete modules remain internal compile fixtures, not a panel mode. Storybook test/play scaffolding is excluded.

`catalog/site-samples.ts` generates all 96 playground combinations from the shared control model. Curated samples read the actual `CompositionView` branches and geometry assets. Editorial demonstrates semantic Heading/Text/Link/Code inside Card; site-owned serif styling supplies its reading character. Operations owns one checkbox array and derives Status, Stat and Progress from it; its eight checkbox combinations come from the shared `example-model.ts` steps, so open/copied code starts in the current state. Creative changes a Card border through semantic color tokens and a Button variant alongside its decorative palette. All examples link to the components they use. Visible usage omits decorative SVG geometry and site class names while retaining public props, layout primitives, state and token overrides. Internal full fixtures include the maintained stylesheet. No independent copy of the component JSX is maintained. Source, model and stylesheet changes invalidate generated samples during development.

Highlighting uses escaped React spans and build-time Shiki/Oniguruma token ranges; the display and clipboard text remain identical, with no browser parser. Automatic soft wrapping and viewport-bounded height keep long examples contained. Changing the displayed snippet resets its scroll to the start while preserving the open disclosure. A ResizeObserver measures the preformatted content; its clamped numeric height settles over 200ms, so shorter snippets shrink without a layout jump. Only syntax ink remounts for a brief update fade; the code region, focus target, toolbar and disclosure stay mounted. The toolbar contains a Code disclosure pill with code icon and rotating chevron, plus Copy; no wrapping control. Enter and Space toggle the disclosure without moving focus. Mobile controls share one row with 44px targets; redundant captions disappear. System colors override syntax colors in forced-color mode. Multiple curated panels have distinct accessible region names.

`bun run --filter @kbui/storybook verify:code` compiles complete modules **and** their concise snippets against installed component types and Vite CSS declarations. It covers canonical catalog states, all generated playground combinations, curated compositions, and complete React modules from installation, API and specialized usage guides. `build:site` runs this gate before building. Source tests cover inheritance, JSX override precedence, syntax ranges and state mapping. Unsupported source configuration fails generation or compilation rather than producing partial code.

## Verify

```bash
bun run --filter @kbui/storybook test:site
bun run check
bun run test:stories
```

The focused suite covers the home, day-off interaction and validation, workbench search/reset/copy/theme behavior, the curated examples, catalog search/API/state wiring, and cross-page links. It runs at 320, 390, 768, 1024, 1280 and 1440-pixel widths and in forced colors. Each project selects a Storybook viewport global; the home story asserts the measured width because the addon otherwise resets Vitest viewports to its default. The full Storybook suite adds normal and reduced-motion preferences with automated accessibility scans. Human screen-reader and owner visual acceptance remain separate checks.

Browser verifiers use Node 22.18+ with native TypeScript stripping. For the built preview geometry check, keep the combined static preview running, then run `bun run --filter @kbui/storybook verify:previews`. It checks every canonical story at 320px and 1280px for page/frame overflow, content clipping, specimen alignment through expand/compact, readable surface widths, filled Panel rows and excess canvas height, plus overlay bounds, live panel collapse, import-and-usage code, real clipboard round trips, and unchanged preview geometry when code is open. It also checks playground controls/reset and every curated panel/palette at both widths, including single-row toolbars and exact visible-code clipboard output. `CATALOG_PREVIEW_URL` can select another preview server. Every canonical state also checks expand/compact sizing. Actual state-switch journeys at 320×568 and 320×844 verify expansion reset, long-to-short code sizing and scroll reset with code left open. Shell stories separately verify resize growth/shrinkage, expanded-height behavior and long-code wrapping. The built check also exercises native keyboard scrolling for long examples; synthetic test events cannot prove browser default scrolling.

### Syntax and interaction feedback

Shiki 4.5 tokenizes TSX in the build adapter; the browser receives original strings and compact semantic ranges, including function names. CSS owns the light/dark code palette. Oniguruma initializes once before synchronous generators run; the JavaScript regex engine failed a Bun TSX fixture.

Shared panels use a 160ms opacity reveal and 140ms toolbar color/press feedback. Text remains visible throughout. Explicit state changes compose 140ms selection colors, 180ms Button shape/color changes, 200ms measured preview/code sizing, 220ms theme surfaces and a 160ms code-ink fade after 30ms. The playground reserves only the largest 48px Button height within its preview, keeping the surrounding canvas stable across size changes. Inputs and copied source update immediately; CSS transitions retarget naturally on rapid changes. Reduced-motion preferences disable both animation and transitions. Native CSS covers current interactions; consider Motion only when shared-layout, gesture or coordinated exit behavior creates a concrete need. Do not build a partial animation framework.

The shared `motion.css` adds action-driven feedback across the home, playground and curated examples: 140ms control transitions and 200ms palette fill changes. Checklist state styling comes from the shared Checkbox. Rules opt in only under `prefers-reduced-motion: no-preference`. The home adds a one-time 420–500ms poster entrance with short text stagger and an 8px card settle. Only the card translates; the dialog portal’s parent stays stationary so fixed overlays remain viewport-centered. Playground, catalog directory/detail and curated pages reuse the 420ms heading settle and 500ms content fade with an 80ms lead-in. Content panels use opacity only, so dropdowns, fixed overlays and iframe geometry keep their positioning. Existing panels do not replay their entrance on prop, palette, filter or component-state changes. The bloom changes fill over 200ms as selection completes. Shared fragments use 380ms over 6px (the landing choreography below overrides travel and timing): headings lead paragraphs, checklist labels lead details, and rows use short offsets. Curated supporting content follows within 180ms; landing progress and summary finish its longer sequence. Checklist summary and palette updates replace only inner text, using 160ms ink feedback without replaying parent entrances or replacing controls/live regions. Palette fills use 25ms offsets while geometry stays fixed. Live catalog and workspace preview containers reuse the same opacity entrance without moving overlay ancestors. Link arrow glyphs use atomic inline boxes so link underlines decorate the label alone. All entrance/state motion is disabled under reduced motion. The landing page now observes each section and its demo separately: entrances pause offscreen and run once on first intersection. Keyboard focus releases its section immediately; switching to reduced motion releases all pending groups. Observer and preference/focus listeners clean up on unmount. Content stays visible while waiting. Curated pages retain mount entrances. The playground's Reduce motion control also disables preview, Button, code-height and ink-update motion. Page entrances remain independent of these update effects. Focus indicators remain immediate; disabled actions receive no press movement. Normal/reduced browser scenarios exercise each page, independent paragraph/checklist timing, immediate selection feedback and stable parent entrances.

Catalog detail pages keep previews, copyable usage and API summaries focused. Separate Accessibility sections are omitted; detailed component guidance remains linked through Storybook.

### Dropdowns and focus

Playground Variant and Size use `ControlSelect`, a small typed adapter over KBUI Select. Selection behavior, focus restoration, portals and optical rules belong to the library. Popup width follows its trigger, flips at viewport edges, and keeps 44px option targets with a selected check. Labels remain human-readable while copied props retain their actual values. Narrow controls stack when two fields no longer fit. Menus are non-modal so control changes do not lock the page or block another control during exit feedback. This is a site control, not a new public kbui component.

`focus.css` provides a low-specificity 2px keyboard ring with a 2px gap, leaving component-specific contrast and inset rules in control. Pointer focus has no extra outline. Select tracks the trigger/popup interaction to retain keyboard focus feedback without pointer rings. It respects focus already moved to an outside control; Tab and keyboard activity restore the ring. Search uses one ring around its wrapper; checklist and code regions use compact offsets. Dark operations content keeps a light ring and forced colors use the system highlight. Focus outlines do not animate. Real-browser scenarios cover pointer selection, Tab return, Escape, reset, popup containment and copied values.

## Release browser pass

`bun run --filter @kbui/storybook verify:release` runs against the combined static preview. Install its official browser runtimes with `bunx playwright install chromium webkit` from `apps/storybook` when needed. Use Node 22.18+ for this browser verifier. Each journey uses a fresh browser and context: short-screen mobile Chromium, mobile WebKit portrait and WebKit landscape, with touch enabled. Coverage includes each page’s normal/reduced entrance styling and stationary panel containers, shared-state refresh/Back/Forward, unknown-state recovery, delayed content after iframe load, a stalled/503 preview and successful retry, reduced motion, deferred expanded-canvas compaction, pending-load toolbar stability, rapid latest-state selection, stable Button sizing, demo dialog positioning, dropdown selection, wrapped code, all site routes and each component’s default live example. The [deployment workflow](../../../.github/workflows/deploy-site.yml) runs this gate against the staged root-mounted artifact before publishing. Its [setup guide](../../../docs/guides/deploying-kbui-site.md) covers the dedicated Cloudflare custom domain and one-time secrets. The release checker runs Playwright under Node; Bun transport stalled across browser journeys in this environment. This is WebKit engine emulation, not a physical iPhone or Safari-device certification. The full canonical-state geometry gate remains `verify:previews`.

### Landing choreography

Landing motion treats the home as a poster assembling. Headline lines settle together over 560ms with a 40ms offset, a straight 14px lift and no rotation; description, actions and footnote overlap at 220/300/360ms. The flower unfolds through a bounded 24-degree rotation and scale without changing its geometry. Checklist labels/details use 110ms row offsets, followed by progress and summary at 660/740ms. Landing copy travels 16px; other surfaces retain their existing 6px fragments. Reduced motion disables all of these effects. No control is disabled, removed or delayed for choreography, and selection changes never replay entrances. `Site/Home/Choreography` verifies offscreen waiting, viewport release and single-run identity; mobile release checks also switch motion preference during the visit.

## On-site setup

`/setup/` covers release installation, one stylesheet import, first component and installed-version checks. `/setup/themes/` covers system/light/dark appearance and a small CSS token override. Home and footer entry points stay local. Home's installer carries package manager and optional typed-token choices into a query URL; installation changes replace that URL so refresh retains choices without filling history. Native Back/Forward between pages keeps normal navigation. Unsupported manager/tokens values fall back to npm/core packages.

`setup-model.ts` owns release commands and bounded settings, using the root package version. The v0.7.0 React/CSS/tokens tarballs were checked against GitHub’s release API on 2026-10-27, and the published React tarball was installed in a fresh consumer. Its bundled stylesheet, version guard and three documentation modules were verified. Future release PRs update marked documentation alongside package metadata. No registry install is implied. Install commands and shell/CSS examples use the shared wrapping/copy panel; React/HTML snippets are highlighted at build time. System preview subscribes to color preference changes and cleans up its listener. Both routes use the shared page heading entrance and reduced-motion policy.

Canonical usage remains [Using kbui](../../../docs/guides/using-kbui.md); keep its steps and the setup model aligned. [Deployment guide](../../../docs/guides/deploying-kbui-site.md) describes the `kbui.kcb.pro` deployment. `Site/Setup` covers managers, optional tokens, shared state, themes and overflow; `RELEASE_CHECK=setup` adds built mobile refresh/history, actual copy and live OS-theme checks.

## Default design and theme navigation

The current package source owns the monochrome and persimmon default in `packages/tokens/tokens.json`. Both `@kbui/react/styles.css` and `@kbui/css/styles.css` include it. `palette.css` only maps site layout names to package roles and supplies illustration colors; it no longer overrides component tokens or styles. Local package builds carry these changes; published v0.7.0 tarballs remain unchanged. Component stylesheets own optical rules, and `workspace-skin.css` owns the fictional workspace’s layout.

The shared navigation contains a KBUI Switch with sun/moon icons, a sliding raised thumb and native checked semantics. Space toggles light/dark while retaining focus. A valid `theme` query wins over remembered `kbui.theme` preference; otherwise the site follows system preference. Storage failures leave the switch usable. Navigation and installer links carry dark mode across routes; query URLs remain shareable. Legacy `skin` query values are ignored and removed on the catalog. No skin choice appears in the site or Storybook toolbar.

`SiteFrame` owns the site theme. Standalone routes apply it to the document root so body portals inherit the same tokens; Storybook-hosted site scenarios keep changes inside their wrapper. All compositions inherit the page theme. The Button playground follows that theme until a visitor chooses an explicit local preview theme; Reset resumes inheritance.

Tokens rebind their aliases in both explicit theme containers, including nested light inside dark and dark inside light. Root system preference remains supported by the package. Color, border and shadow changes use brief transitions; the navigation thumb slides in 220ms. Reduced motion removes both theme animation and thumb movement. Shared dark material recipes supply brighter raised faces, upper edge light and contact shadows against deeper inset tracks. The navigation thumb uses the same raised recipe as other neutral controls; elevated content uses `material.surface-bg` so it separates from canvas. See the [material tokens](../../../packages/tokens/tokens.json).

### Complete component catalog

Open `/components/`. All 21 public components and their canonical Storybook examples use current package implementations and their shared default palette. Search and category filters live in the full-page directory; component details provide state selection, API summaries, code and optional paired light/dark previews. Theme changes send a same-origin, exact-parent message to each preview; the Storybook root updates without remounting the story. Existing input values and interaction state survive. Reload preview intentionally resets interaction state and retains the selected theme. Readiness compares canonical document URLs, preserving origin/path/query guards while accepting equivalent query order and encoding. Root theme scope covers portaled Dialog, Menu and Tooltip. Catalog previews use `embed=true`, preventing automated story playback from pulling focus or opening overlays on load.

**Typography and theme foundations** shows body copy, headings, supporting text, an identifier and four surface levels. Body text is 15px/1.6; helpers 13px; controls 14px; standard headings 22px/18px, with larger page titles. Inline identifiers remain at least 13px. Local system sans/mono stacks require no font download.

### Working settings and operations

`/compare/` retains its existing URL and now presents one workspace with the shared app theme. Settings and Operations use the same shipped components. `SkinComparison.tsx` owns the screen and session state; `SettingsScreen.tsx` owns validation/save/discard; `OperationsScreen.tsx` owns queue search/filter/retry. Theme changes preserve drafts, filters and job state. Reload resets fictional work; no backend or durable form storage exists.

Required name/email checks focus the first invalid field. Failed saves retain drafts and remain retryable. The real Dialog handles inspection and focus recovery; counts/progress derive from six sample jobs. Explore edge cases exposes save failure and queue recovery. Workspace and live-catalog dropdowns reuse the shared KBUI Select adapter `ControlSelect` from the playground/setup. Popup portals explicitly inherit the page theme, with recessed triggers, opaque raised surfaces, named listboxes and save-disabled behavior. Workspace preferences use KBUI Checkbox; sidebar/actions use Button, and queue search composes Input type=search with an accessible clear Button.

### Verification

`bun run --filter @kbui/storybook test:themes` exercises all 121 canonical component stories in light/dark and normal/reduced motion, including accessibility scans. `test:site` covers responsive routes and forced colors. `verify:theme` compares computed Button, Card, field and Dialog materials across Components, Playground, Examples, Home and Setup, and compares a standalone package stylesheet with the same previews and grid Cards in both themes, then checks real built iframe identity/input retention, workspace draft retention, keyboard focus, thumb motion, cross-route persistence and legacy URL cleanup. Run against the combined static output:

```bash
CATALOG_PREVIEW_URL=http://127.0.0.1:4182 bun run --filter @kbui/storybook verify:theme
CATALOG_PREVIEW_URL=http://127.0.0.1:4182 CATALOG_THEME=light bun run --filter @kbui/storybook verify:previews
CATALOG_PREVIEW_URL=http://127.0.0.1:4182 CATALOG_THEME=dark bun run --filter @kbui/storybook verify:previews
```

`verify:depth` checks resting material roles and native hover/press states across 15 families in both themes; it complements visual review rather than scoring perceived depth.

`verify:previews` checks all 127 examples at 320px/1280px, gallery theme propagation, content fitting, overlay bounds, code/copy and site panels. Automated checks do not replace human screen-reader or owner visual acceptance. These checks establish local behavior; publication and deployment are separate steps. The shared tokens and component CSS own this default.


### Shared controls and edge coverage

Playground/setup preferences, catalog actions and workspace controls reuse Input, Checkbox, Switch, Button and Select. Theme choices, catalog filters/example states and workspace choices share `RadioGroup appearance="segmented"`. Consumers validate domain values and own transitions. Search is an Input + Button composition using `startContent` / `endContent`; filtering and result announcements stay application-owned.

Site chrome reuses semantic KBUI typography, accent and focus roles. `--site-radius-surface` owns repeated app frames; copied composition CSS has a 24px fallback so it works independently. Editorial sizes/leading, illustration palettes and nested theme boundaries stay intentional.

`stories/ControlEdges.stories.tsx` and `catalog/verify-control-edges.ts` cover native required validation, successful FormData and caller-owned reset across five composed controls. Select's error/reset policy stays with the form. Long labels, options and helper/error text wrap inside bounded containers. The native matrix includes 640×450 CSS-pixel reflow, equivalent to a 1280×900 viewport at 200% zoom; it does not automate browser chrome zoom. Run against built Storybook:

```bash
CONTROL_EDGES_URL=http://127.0.0.1:4174/storybook node --experimental-strip-types apps/storybook/catalog/verify-control-edges.ts
```


### Component directory and details

`/components/` provides a searchable card grid without a nested scrolling menu or initial preview document. A component opens a focused details page with its examples, generated code, API guidance and preview styling. Returning to the directory preserves filters, scroll, keyboard focus and cached drafts. Retained hidden documents become inert and stop being current previews.

Palette and corner controls apply semantic token overrides only inside the same-origin preview documents. CSS overrides remain selectable separately from authoritative generated React examples. Reset restores the shared app palette without reloading or clearing the example. Optional comparison pins the same canonical example in light and dark; panes stack on narrow screens and retain their interaction state during navigation-theme changes. Preview documents use bounded caches.

Legacy `view=live`, `view=directory` and `view=overview` URLs normalize to the public directory/details route without adding history entries. `/components/qa/` replaces its URL with the parent catalog while preserving component/state/theme, other query parameters, hosted prefixes and hash.

## Writing site copy

Write as if helping a developer use the library: explain when a component is useful, show an example, then cover the details they need to get it right. Use “your app” instead of “the consumer” or “the caller” in public guidance. Keep API names exact, explain unfamiliar terms, and state limitations plainly. Prefer natural sentences over repeated slogans, inflated claims, or internal implementation notes. Keep the catalog summaries and React guide consistent; the catalog reads its API guidance from that guide.

## Site color and motion

Selected segmented controls use the shared persimmon accent; unselected choices use a quiet accent tint on neutral surfaces. Status colors keep their status meaning, with the deeper persimmon text shade for running states. Package tokens and component CSS apply these roles everywhere, including canonical previews, keyboard focus and forced-color styles. Page entrances use 320–360ms easing with short staggers; controls settle in 160ms. The home demo no longer waits through long stagger delays. Reduced motion removes animation and transitions.

Component details show the live example, code, and API table. The extra usage-notes disclosure is hidden for now; the React guide and Storybook links still provide the full documentation.

## Site palette

Both site themes use a monochrome foundation with one persimmon brand accent. Light mode uses chalk, white paper and slate text; dark mode uses graphite, silver text and recessed black fields. Surface brightness, rims and shadows distinguish panels, inputs and raised controls. Persimmon identifies primary actions, selected controls, focus and key editorial emphasis. Ordinary chrome, paper layers and navigation glyphs stay grayscale. The flower and composition artwork add a supporting illustration palette: persimmon, marigold and soft lilac. Success/error colors retain their semantic meaning, and code syntax retains its readable highlighting.

The palette lives in `packages/tokens/tokens.json`; `palette.css` maps site layout aliases to those native roles. Package theme scopes rebind aliases for nested previews and body portals. Primary fills use `--kb-color-accent`, readable accent text uses `--kb-color-accent-ink`, and segmented controls share this recipe in package CSS. Card exposes `--kb-card-face` and `--kb-card-shadow`: neutral sheen and shared raised edge light sit above a lower contact ledge and ambient shadow. Catalog and Playground grids retain these native materials at rest and on hover. Plain cards remain flat; the planner keeps its decorative paper layers. Local catalog palette/corner controls still reset without remounting previews.

| Role | Light | Dark |
| --- | --- | --- |
| Canvas | `#f5f6f8` | `#17191d` |
| Paper | `#ffffff` | `#252931` |
| Foreground | `#242831` | `#f2f4f8` |
| Secondary text | `#5d6572` | `#b9bfca` |
| Primary action | Persimmon `#ed5a24` with dark text | Persimmon `#ff8457` with dark text |
| Focus and selection | Persimmon, with visible outlines and state marks | Persimmon, with visible outlines and state marks |

Small labels and links use `--site-accent-ink`: a deeper persimmon in light mode and a lighter shade in dark mode. Bright action fills use dark labels. This keeps the accent vivid without sacrificing small-text contrast.

The planner retains layered paper and a quiet ledger backdrop. Its flower cycles persimmon, marigold and lilac across the petals, with a neutral center and dark outline. The existing completion state enriches all three petal colors while retaining the same palette. Supporting hues stay inside the illustration so primary actions and focus remain consistently persimmon. Progress uses persimmon until complete, then semantic success. Note focus feedback remains visible under reduced motion. System colors remain authoritative in forced-color mode.

## Keeping installation guidance current

The install builder, stylesheet import and generated standalone examples use the root package version through `setup-model.ts`. Release Please updates version blocks in the main README, usage guide and Storybook introduction. `scripts/release.ts` checks managed blocks against that version, rejects missing or malformed annotations, and prevents multiple version literals on one line because the upstream generic updater replaces only one. Historical compatibility thresholds remain outside managed blocks. Setup-model fixtures exercise future version bumps without changing the model. The root check also compiles complete React modules extracted from those three installation entry points, API recipes and specialized usage guides against the current component package, so removed exports and invalid usage fail validation.

Examples inherit the navigation theme and use outlined native Cards without per-example cream/green restyles. Their artwork shares the flower’s persimmon, marigold and lilac roles; its alternate state increases saturation without changing color families. Generated React examples import the bundled package stylesheet; compositions additionally include their site layout aliases and illustration CSS. No extra component theme stylesheet is needed. `/setup/themes/` explains the package defaults and theme selection. Existing component props stay compatible; Card adds face/shadow tokens and semantic colors add an accent-ink role. Local package builds include the refresh; published v0.7.0 tarballs remain unchanged.

## Site theme preference

On a fresh visit, page chrome follows `prefers-color-scheme`, including changes while the page is open. The synchronous bootstrap resolves the same preference before styles and application code load. An explicit `?theme=light|dark` takes priority over the saved `kbui.theme` choice; unknown values and unavailable storage fall back to the system setting. The header Switch chooses light or dark and saves that override. The footer’s System theme action removes the override and resumes live system updates. Links carry only explicit choices, so navigating in system dark mode does not pin a dark override. Catalog appearance updates retain preview state and do not turn a system change into a saved choice.

The install builder offers CSS tokens as part of the normal React install. Optional typed token names sit behind an explanatory disclosure, with Add/Remove typed tokens actions. Existing `tokens=1` links still include the matching optional package and open the explanation. This does not change the published package exports.

## Public Storybook scope

Production Storybook contains public MDX guides and canonical component stories only. Site screens, legacy restyle showcases and validation fixtures are maintained in `apps/storybook/stories` for opt-in local development and CI. `KBUI_STORYBOOK_INTERNAL=1` enables that scope; `dev:internal` provides the command. Default public builds exclude those modules, and `verify:catalog` rejects internal index entries while requiring all component docs and examples. Validation coverage remains active in the browser test scripts.
