# 0012. Highlight site examples at build time with Shiki

## Status

Proposed 2026-10-25; implemented locally in the maintained-home worktree. No publication or owner acceptance recorded.

## Context

The owner requested richer highlighting and a pragmatic library-versus-custom choice. Site code comes from canonical Storybook examples. The previous Babel adapter classified tokens with manual keyword and JSX rules; it omitted function calls.

Observed 2026-10-25: `highlightSample` has two direct production consumers, `catalog/source.ts` and `catalog/site-samples.ts`. Their virtual modules feed Catalog and Workbench/Examples respectively. These new files have no committed history, so churn and ownership statistics are unavailable. No published package API, external consumer, database or persistent format changes.

The assumed need for a browser highlighter was challenged: all examples already pass through a build-time generator. Drivers are grammar correctness, exact source copying and keeping parsing out of shipped runtime code. Reversal trigger: copying changes, grammar reaches browser bundles, or generated data cost outweighs improved reading.

## Decision

Use pinned Shiki as a Storybook development dependency, tokenize TSX once at build initialization with Oniguruma, and adapt results to the existing source-offset contract; kbui CSS owns the palette.

Keep original source strings, React escaping, concise/setup modes and clipboard behavior. Merge adjacent equal-kind ranges and omit default-colored text. No vendor types cross into site components.

## Options considered

- Existing Babel rules: rejected; zero migration, ongoing grammar maintenance and known missing function highlighting.
- Palette-only CSS polish: rejected as the complete solution; cheapest reversible option, but cannot improve classification. Adopted for presentation alongside the chosen engine.
- Build-time Shiki: chosen; richer TextMate grammar, retaining synchronous generator calls after one module-level initialization. Costs build dependencies and larger serialized ranges.
- Build-time Prism: rejected; viable lighter alternative, but Shiki's theme/grammar model fits TSX and avoids maintaining custom grammar extensions. No local comparative correctness benchmark establishes universal superiority.

The first option leaves the current graph untouched. CSS-only affects the shared panel stylesheet and its three page consumers. Either tokenizer replacement changes one build adapter, with two direct generator consumers and three page consumers at the next depth; the shared range type remains private. These are structural import observations, not semantic graph completeness. One application workspace ships the change; repository history establishes no separate team ownership.

## Consequences

The local spike found Shiki's JavaScript regex engine mis-tokenizing TSX under Bun 1.3.11 while Node parsed the same fixture correctly. Oniguruma passed both; its WASM initializes once in the build process. This keeps generator functions synchronous but adds asynchronous module initialization.

Measured production assets before/after: catalog gzip 39,974 to 47,183 bytes; shared site sample chunk gzip 79,525 to 84,092 bytes. Shared frame JavaScript remained 69,485 gzip bytes. These are complete chunk comparisons, including this revision's token data, not a per-visitor transfer benchmark.

Independent refuter found no blocker, but required exact-source preservation, Unicode/CRLF tests and payload measurement. Confidence is high for exercised fixtures; future grammars and runtime versions remain dependency risks.

## Soundness boundary

Highlighting is presentation, not source validation. Generated modules still require their separate type-check gate. TSX grammar does not highlight CSS embedded inside string literals as a separate language. Import inspection and built-asset marker checks do not establish isolation for every future bundler change.

## Threat model

Guards against homemade grammar drift and accidental HTML interpretation. Code renders as escaped React text. This does not authorize executing arbitrary user code or protect a compromised build dependency.

## Non-goals

- Editable code editor or browser language service.
- Replacing canonical Storybook examples.

## Revisit if

Exact rendered/copied source differs; a grammar module enters the browser graph; build initialization stops working under supported runtimes; or token payload becomes unacceptable for the maintained examples. Restore the previous adapter without migrating data if those costs cannot be fixed locally.

## Adoption

Local site build adapter only. No changes to `@kbui/react`, `@kbui/css` or their runtime dependencies. Owner visual review and publication remain separate.

## Validation

Executed locally 2026-10-25: focused tests first failed on missing function ranges, then all 11 source cases passed, including CRLF and UTF-16 offsets. `bun run check` passed. `build:site` compiled 173 complete modules and 173 snippets and verified 88 Storybook targets. Browser interaction and responsive checks are recorded in the feature register when complete.

Fitness checks: maintain ordered non-overlapping ranges, exact clipboard round trips, both code modes, build-time type checks and built asset size comparison on future highlighting changes.

## Links

- [Site source contract](../../apps/storybook/site/README.md)
- [Feature register](../features.md)
- [Shiki synchronous initialization](https://shiki.style/guide/sync-usage)
- [Shiki custom themes](https://shiki.style/guide/load-theme)
