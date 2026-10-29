# Developing components and screen patterns

Start with a user task and an observable result. Identify what the current public API already supplies, choose the smallest reusable responsibility, and verify it in a complete task. Use this guide for a new shared component, an interaction extension, a reusable screen recipe, or an advanced widget. Bounded copy and appearance corrections need only their relevant checks; they do not require a new proposal or screen study.

This is a contribution method. It does not introduce screen APIs, approve a theme preset, or establish that a proposed pattern is implemented. [CONTRIBUTING](../../CONTRIBUTING.md) owns repository gates; [Adding a component](adding-a-component.md) owns package delivery; [accessibility guidance](accessibility.md) owns standards interpretation and manual procedures.

## Establish current capability and ownership

Read the active checkout's public exports, maintained references, relevant implementation and nearest tests. Record the source revision and local changes that affect the task. Separate released, main-only, local/in-progress and proposed capabilities. A package version, branch name, story file or passing build alone does not establish publication or complete task support.

When concurrent work can overlap, inspect its branches, worktrees and PRs. If Codex chat tools are available, check relevant active chats as well: requested work may not have reached source yet. Record owner and uncertainty; an idle or absent chat does not prove abandonment. Do not message, redirect or modify another task without authorization. Reconcile overlapping responsibilities before creating a second implementation.

Use existing public imports to reproduce the need. Capture the concrete failed interaction, repeated behavior, brittle override or missing composition contract. A catalog checklist identifies coverage to investigate; it does not justify every abstraction in it.

| Delivery | Choose when | Keep outside it |
| --- | --- | --- |
| Existing composition | Current controls and layout already complete the task | Additional wrappers without useful responsibility |
| Component extension | An existing component owns the interaction but lacks a required public seam | Parallel state or behavior in a second control |
| Shared component | A repeated, independently useful behavior or presentation contract needs one owner | Product vocabulary, fetching and business decisions |
| Screen recipe | Consistency depends on arrangement, transitions and use of several components | An all-purpose component with flags for every product |
| Specialist integration | An editor, date model, chart, map or media engine supplies complex behavior | A casually rebuilt engine or an app-library dependency in core |
| Product code | The behavior expresses domain rules or a one-off workflow | A shared export solely to increase catalog size |

Useful and distinct responsibility matters more than count. GOV.UK's [contribution criteria](https://design-system.service.gov.uk/community/contribution-criteria/) provide a reference for assessing usefulness, reuse and readiness; their governance is not an additional kbui gate.

## Write a task and interaction contract

Keep the brief proportional. A component extension may fit in a few sentences; a composite widget or complete screen needs the applicable rows below. Record untested assumptions rather than presenting them as findings.

| Contract | Specify |
| --- | --- |
| User and task | Who acts, starting conditions, visible actions and success outcome |
| Content | Consistent names, quantities, dates, units, prices and statuses; long and localized content |
| Reproduced need | What fails with current public APIs, or which cross-screen rule is missing |
| Ownership | Which package or recipe owns behavior; application-owned data, services and policy |
| State | Initial value, transitions, controlled/uncontrolled behavior, pending and recovery |
| Input model | Native element or documented composite interaction; keyboard, pointer and touch alternatives |
| Focus and feedback | Entry, dismissal, removed targets, errors and completion announcements |
| Customization | Public parts, slots or native props, token roles and bounded layout choices |
| Acceptance | User action, expected result and the check that proves it |

Select interaction conventions by task. Ordinary navigation uses links; in-page view switching may use tabs; data comparison uses a native table; cell-by-cell editing may justify a grid. A sortable table with row actions does not automatically require spreadsheet navigation. See [W3C table guidance](https://www.w3.org/WAI/ARIA/apg/patterns/table/).

Start with native semantics and a fitting Base UI primitive. An ARIA role does not implement its expected keyboard behavior. APG examples are informative and require testing in the supported environment; see [APG's implementation guidance](https://www.w3.org/WAI/ARIA/apg/practices/read-me-first/). Check the installed primitive version rather than assuming the latest online example matches it.

## Blueprint the complete screen

For a screen recipe, define regions and their behavior before building individual regions. Choose content width, shared gutters, alignment, spacing rhythm, navigation, primary action, density, scroll ownership and responsive collapse together. Include all relevant states in the same scenario.

Use existing Container, Grid, Inline, Split and Panel capabilities first; consult [layout composition](layout.md). Reuse the same page boundaries across adjacent regions and assign padding once. Name which region scrolls and when a header or action remains visible. Define a useful narrow-screen route through the task, including back navigation and focus, rather than shrinking every region until it fits.

Integrate one vertical task before building every region or variant. Test real controls inside the real shell early. Sticky content, portal hosts, nested scroll areas and catalog frames create constraints that isolated components do not reveal. Record repeated shared gaps separately from legitimate application CSS.

## Customize coherently

Use the existing [restyling contract](restyling.md). CSS, CSS Modules and Tailwind can use the same supported hooks; a screen recipe does not require a new styling runtime or umbrella provider.

| Layer | Shared responsibility | Customization boundary |
| --- | --- | --- |
| Product visual profile | Type hierarchy, semantic colors, materials, shape, elevation and motion | Product or subtree token overrides |
| Density | Coordinated control sizes, row heights, gaps and padding | Comfortable/compact recipes where the task supports them |
| Shell and layout | Widths, gutters, navigation, regions, collapse and scrolling | Documented compositions and bounded choices |
| Task content | Data, field sets, actions and supporting material | Native composition or explicitly supported named regions |

Apply a profile across the screen and its overlays. Keep density independent of material. Use component tokens for a local visual responsibility and shared semantic roles for coordinated changes. Record which element owns the theme boundary, how aliases resolve there, and how supported portal containers retain the intended theme. Inspect computed colors rather than relying on pane labels or URL globals.

Preserve names, focus, selection cues, disabled/invalid states and meaningful DOM order under customization. Brand expression can change typography, proportions, shape and imagery while keeping task controls recognizable. A prototype's appearance does not establish a supported preset or accessible custom theme.

For a new shared component or reusable screen pattern, demonstrate transfer through the same public contract in two contrasting contexts. Vary meaningful content, arrangement or density. A color swap alone proves little about reuse. A routine fix to an existing component does not need a second new screen unless the affected boundary requires it.

## Implement to the contract

For behavior changes, reproduce the failure in a meaningful test before changing production code; then implement the smallest fix and refactor. Record any justified test-first exception. Documentation and appearance-only changes do not claim Red/Green.

Follow [package conventions](adding-a-component.md) for exports, CSS anatomy, token ownership, parts, refs, native props and examples. Use documented app-library seams; retain the library's native element/features. Base UI composition requires forwarded props and refs; see its [composition handbook](https://base-ui.com/react/handbook/composition).

Keep one source of truth for selection, pagination, draft values and pending actions. Define stable record identity, removed/disabled-item behavior, controlled parent updates, page resets, asynchronous completion and unmount/cancellation handling where applicable. Do not mutate caller data or derive business policy from rendered React nodes. React's [state-structure guidance](https://react.dev/learn/choosing-the-state-structure) explains the risks of duplicated and contradictory state.

Applications own authorization, fetching, uploads, booking availability and business arithmetic. A UI component may expose controlled state and callbacks without owning those services. Document client/server collection semantics, including what selecting the current page means and whether unseen records are included.

## Validate design and verify behavior

Validation asks whether the task, terminology, arrangement and customization are useful. Verification asks whether the implementation satisfies the named contract. Record which kind of evidence exists. Automated assertions and visual review cannot substitute for representative user research or a human assistive-technology task.

Choose applicable checks from this matrix; avoid a mechanical Cartesian product. Preserve mandatory repository gates and any explicit task acceptance criteria.

| Risk or claim | Appropriate evidence | What it does not establish |
| --- | --- | --- |
| State transitions and invariants | Unit/contract tests; controlled updates, empty/boundary values, removed records, repeated activation and failed completion | Rendered geometry or native keyboard behavior |
| Interaction and focus | Browser tasks using keyboard/pointer actions and asserting resulting focus, state and feedback | Screen-reader speech or untested devices |
| Responsive composition | Complete task at 390, 768 and 1440 CSS pixels; narrow embedded container and short viewport where relevant | Browser zoom or every possible content length |
| Crops, wrapping and sticky regions | Inspect real content, geometry and scroll behavior; stable visual regressions where useful | Correct semantics or usable recovery |
| Theme and density | Rendered light/dark and relevant custom/nested scopes; selected/highlighted/invalid/disabled combinations; portal content | Contrast inferred from token names or labels |
| Motion and contrast modes | Relevant reduced-motion and forced-colors checks | Every accessibility criterion |
| Browser-dependent behavior | Targeted checks in the affected supported engines; use existing suites | A universal browser matrix from a Chromium pass |
| Accessibility | Shared automated checks plus applicable manual tasks from [accessibility guidance](accessibility.md) | Complete-page conformance from an axe pass |
| Useful customization | Same public imports and documented hooks in two contrasting contexts | Independent adoption when the original author built both |
| Documentation adoption | A fresh region built from maintained docs and public imports; record clarifications and fixes | Independence unless another builder actually performed it |
| Installed package support | Existing tarball consumer checks at the required boundary | Publication to npm or real application adoption |
| Usability and preference | Representative task observation and explicit product-context feedback | General preference from one visual specimen |

### Test the actual host

Inspect both standalone examples and the actual catalog/documentation frame when that host is affected. A popup may fit the viewport while an ancestor clips it; a focusable control may exist but remain inaccessible below a sticky region. A passing visibility assertion can still allow a tiny or obscured control. Assert the geometry relevant to the task and inspect the rendered result.

For overlays, exercise opening, editing, scrolling, cancellation, dismissal and focus return. Keep essential actions discoverable; small panels should not hide their normal primary action behind filler or artificial height limits. Test long-content fallback separately. For collections, verify selection survives or clears under the documented filter/page/data transitions and that bulk failure supports retry. For media and copy actions, verify loading/failure or denied-permission recovery without losing access to the original content.

Use the existing browser runner and retrying assertions for asynchronous outcomes, not arbitrary sleep durations; see [Playwright assertion guidance](https://playwright.dev/docs/test-assertions). For a regression, prove the assertion detects the original failure. When changing scanner exclusions or harness filtering, verify a real missing label or equivalent negative control still fails; do not weaken rules to obtain green output.

### Choose checks by change

| Change | During editing | Delivery boundary |
| --- | --- | --- |
| Documentation/copy only | Local links/anchors, valid commands and relevant existing documentation/example checks | Repository documentation gates; no manufactured behavior tests |
| Appearance/layout only | Rendered affected states, widths, crops, themes and focused CSS checks | Required UI checks and visual handoff; no claim of test-first behavior |
| Interaction/state/public API | Relevant failing regression, minimal fix, type/ref/slot contracts and browser tasks | Package/catalog/docs synchronization and required repository gates |
| New screen recipe | Complete task, collapse, state/recovery and public-import transfer | Runnable recipe, applicable browser/manual evidence and documented limits |
| Advanced widget | Explicit keyboard/state/ownership contract and high-risk boundary probes | Supported-environment evidence, transfer and all applicable repository gates |

Use [CONTRIBUTING commands](../../CONTRIBUTING.md#commands) and the current package scripts for exact commands. Focused component examples run from the repository root:

```bash
bun run --cwd packages/react test -- NumberField
bun run --cwd apps/storybook test ../../packages/react/src/components/NumberField/NumberField.stories.tsx
```

Replace NumberField and the path with the affected component; keep broader commands at the boundary required by CONTRIBUTING. Existing validation stages are `stories`, `themes`, `responsive` and `built`; do not invent a `test:patterns` command or imply it exists. Repeat passing checks when changed inputs or unresolved risks invalidate the prior evidence.

## Document for reuse

Keep each fact in its maintained home. Public documents describe supported behavior and contributor procedures; keep product plans, studies, workstream status and future capability inventories private. Proposed API examples must be visibly labeled and must not enter an implemented-capability table.

| Source | Owns |
| --- | --- |
| `packages/react/docs/components/<Name>.md` | Canonical component usage/API; complete compilable public-import example |
| Colocated component stories | Distinct interactive examples and component regression fixtures under existing story conventions |
| `apps/storybook/catalog/component-guides.ts` | Live use/tips and links to canonical examples |
| `apps/storybook/catalog/accessibility-guides.ts` | Component support, caller responsibilities, concrete verification and evidence limits |
| `docs/guides/` | Shared composition, styling and integration instructions |
| `apps/storybook/stories` | Internal app screens, cross-component integration and validation fixtures |

Start a public screen recipe with a guide linking its runnable example. Follow the current public/internal Storybook convention: app screen fixtures remain internal; promoting reusable public pattern stories requires an explicit convention change and the corresponding navigation, build and verification updates. A local preview URL is not a published documentation link.

Every maintained pattern reference should answer:

1. Which user task does it support, and when should another pattern be used?
2. Which regions exist, which are optional, and how do they compose current public components?
3. Which classes, parts, tokens or bounded layout choices can change?
4. What collapses, wraps, stays visible or scrolls at each relevant size?
5. What do keyboard entry, dismissal, back navigation and post-action focus do?
6. How do loading, empty, validation, partial failure, retry and success behave?
7. Which data, services, routing and policies must the caller supply?
8. Which source revision, examples, checks and manual environments support the claims, and what remains unverified?

Use one realistic scenario across the brief, examples and checks. A review-before-submit flow should let users inspect and correct values without losing their earlier answers; GOV.UK's [check answers pattern](https://design-system.service.gov.uk/patterns/check-answers/) illustrates the interaction rationale, not a visual template for kbui.

Link existing examples instead of copying implementations across guides and stories. Complete fenced examples need a known compilation/verification path. If the current documentation loader does not include a new guide, register it when adding executable examples or record that verification gap explicitly. Do not claim all Markdown code is checked merely because `verify:code` passes.

## Record acceptance and handoff

Keep a compact claim-to-evidence record. A suitable row is: user action; expected outcome; source/test/example; check actually run; result; remaining limitation. Distinguish planned checks, author-reported checks, checks run on this revision and manual observations. Name the revision and changes that would invalidate the result.

For visual changes, provide the built combined-site preview and affected route following the project skill. Report integration and adoption limits, including original-author transfer versus independent use. Preserve required local review, findings closure and signing rules from CONTRIBUTING. This guide does not authorize a remote review, commit, push, merge or release.
