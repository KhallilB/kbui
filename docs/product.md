# Product

kbui is a design system with one contract. Tokens hold every value, plain CSS holds every style, and a thin React layer on Base UI holds behavior. The build checks the rules that tie them together. The next stage applies the same contract to screens that agents generate: kbui becomes **the design judgment layer for generated UI**, checking and fixing a screen the same way whether a person, a coding agent or a model inside a product wrote it.

This document is the single home for what kbui is for, what it offers, what sets it apart and what it will not do. The [roadmap](roadmap.md) holds the milestones and their pass marks. The [evidence report](superpowers/specs/2026-10-22-generative-ui-evidence.md) holds the research behind every claim about other projects; `[Sn]` references point to its sources.

Status on 2026-10-22: release 0.4.0, 13 components, one product screen built on kbui and awaiting merge in its own repository. No generative UI code exists yet.

## Goal

One design system every project shares, with the rules checked by the build. Then the same rules for every screen, whoever or whatever wrote it.

Two outcomes follow from that goal:

1. **Projects share one look and one behavior.** A product installs kbui from a release and gets accessible components, a theme it can tune, and checks that fail the build when the pieces drift apart.
2. **Generated screens stay on-brand, accessible, safe and editable.** People can compose kbui screens in plain language and nest UI inside UI without the result drifting off-brand, failing accessibility, misleading the user or becoming impossible to edit.

## Who it serves

| Group | What they do | What kbui gives them |
|---|---|---|
| Developer | Builds a product on kbui, with or without generation | Components, tokens, themes, layout intents and rules that hold for hand-written and generated screens alike |
| Maintainer | Adds and changes kbui components | One contract that generates types, manifest, schema and grammar, with drift tests and a generator |
| Coding agent | Writes TSX that uses kbui | A catalog, diagnostics written as instructions, and fixes, through one MCP server |
| End user | Asks a product for a screen and refines it | Screens that are safe, well arranged and editable one part at a time |
| Runtime model | Produces trees inside a product | A focused catalog, layout intents, and a check and fix pass on every tree |
| Operator | Runs a product that generates screens | Lower token cost, measured timings and quality numbers for each stage |

The first two groups are served today. The other four depend on the generative milestones, M4 onward.

## Principles

These hold for every feature below. A feature that breaks one needs a decision record.

| Principle | What it means in practice | Record |
|---|---|---|
| One contract | Each stylesheet opens with an `Anatomy:` line naming its root class, parts and allowed attribute values. Renderers, tests and, later, the manifest all read from it. | [0001](decisions/0001-framework-free-css-contract.md) |
| Rules are tests | A rule that matters fails the build. Review covers judgment; the build covers rules. | [Architecture](architecture.md#enforcement) |
| Styling does not depend on a framework | The same markup looks the same from React, a web component, a server or another agent's renderer. | [0001](decisions/0001-framework-free-css-contract.md) |
| Behavior comes from Base UI | Focus, keyboard support and ARIA come from Base UI; kbui does not reimplement them. | [0002](decisions/0002-base-ui-for-behavior.md) |
| Tokens in the W3C format | One `tokens.json`, dark values in an extension, no raw values in component CSS. | [0004](decisions/0004-dtcg-tokens-with-dark-extension.md) |
| Domain-neutral | kbui names no product. Product vocabulary lives in the product or in a product-specific catalog extension. A guard test enforces this. | `scripts/neutrality.test.ts` |
| Caller-provided icons | kbui ships no icon set; components accept icon nodes. | [0009](decisions/0009-icons-are-caller-provided.md) |
| Lockstep releases | Every package shares one version and ships as a tarball on a GitHub Release. | [0007](decisions/0007-lockstep-github-tarball-releases.md) |
| Catalog and quality layer, not a runtime | kbui supplies components, rules and adapters. It does not build an agent loop, a streaming protocol or a wire format. | [0005](decisions/0005-catalog-and-quality-layer-not-runtime.md) |
| One tree, formats at the edge | Every generative layer works on kbui's own tree. Outside formats appear only in adapters. | [0006](decisions/0006-canonical-tree-adapters-at-edge.md) |
| Claims need evidence | A milestone is done when its pass mark is measured and recorded in `progress.json`. A comparison with another project is dated and sourced. | [Roadmap](roadmap.md#recording-progress) |

## Where kbui stands

Checked on 2026-10-22 at commit `d812777`.

### Packages

| Package | Holds | State |
|---|---|---|
| `@kbui/tokens` | Every value in `tokens.json`: gray, blue, red, amber, green and teal palettes; semantic colors including info, success and warning; spacing, radii, type sizes from `xs` to `display`; motion; popup, panel and status component tokens; light and dark | Shipped |
| `@kbui/css` | Reset and one stylesheet per component, bundled into `styles.css` | Shipped |
| `@kbui/react` | React 19 components on Base UI, and the `kb()` helper | Shipped |
| `apps/storybook` | Live docs, a neutral skin fixture and a showcase, with an accessibility scan of every story in light, dark and reduced motion | Shipped |

### Components

| Component | Use |
|---|---|
| `Button` | An action, in primary, secondary, ghost and danger variants |
| `Input` | A single-line text field with label, description and error |
| `Dialog` | A modal with title, description and actions |
| `Panel` | A rounded, lit surface with header, toolbar, body and footer, tones, a rail, nesting, groups and collapsing; skins control its glass and light ([0011](decisions/0011-panel-lit-plane.md)) |
| `Status` | A state with tone (neutral, info, running, success, warning, blocked), as plain text or a chip |
| `Badge` | A short label; the mono variant keeps the case of branches and paths |
| `Stat` | A labeled value |
| `Progress` | Progress toward a known total |
| `Callout` | A highlighted message with tone, icon, title and actions |
| `Tooltip` | A short hint on hover or focus |
| `Menu` | A list of actions opened from a trigger |
| `ScrollArea` | A scroll region with styled scrollbars |
| `Toolbar` | A row of related controls with arrow-key navigation |

### Checks on every change

`bun run check` builds every package, then runs Biome, the typecheck, the unit tests and the pack checks. `bun run test:stories` renders every story in headless Chromium with an accessibility scan. Both run in CI. On 2026-10-22: 31 token, 16 CSS, 72 React, 18 script and 9 pack tests, and 150 story tests, all passing. [Architecture](architecture.md#enforcement) lists what each check catches.

### Releases and consumers

Releases 0.1.0 to 0.4.0 shipped between 2026-10-22 and 2026-10-23. Each release installs from its tarballs and passes a smoke run on Ubuntu, macOS and Windows. The first product to consume kbui is a desktop app whose task screen is built entirely on kbui 0.4.0 components; that screen is in review in its own repository. The adoption milestone, [M1](roadmap.md#m1-first-product-screen), closes when it merges.

## Features

Each feature has a status and the milestone that delivers it. "Shipped" means it is on `main` and checked. Everything else is planned and has no code yet.

### Foundation

| Feature | Status | Milestone |
|---|---|---|
| W3C tokens with dark values, built to CSS variables and typed names | Shipped | M0 |
| Framework-free CSS keyed on `kb-` classes and `data-*` attributes | Shipped | M0 |
| Anatomy line on every stylesheet, checked by the CSS build test | Shipped | M0 |
| Palette ban: component CSS uses semantic, scale and component tokens only | Shipped | M0 |
| React components on Base UI with `ref` forwarding and the `kb()` helper | Shipped | M0 |
| Story and test required for every component | Shipped | M0 |
| Accessibility scan of every story in light, dark and reduced motion | Shipped | M0 |
| Themes and skins that tune components through `--kb-*` variables only, with a guard on the skin fixture | Shipped | M0 |
| Component generator, `bun run new <Name>` | Shipped | M0 |
| Lockstep tarball releases with an install check on three operating systems | Shipped | M0 |
| Neutrality guard that keeps product names out of kbui | Shipped | M0 |
| Visual regression with browser screenshots ([0008](decisions/0008-visual-regression-with-vitest-browser-screenshots.md)) | Accepted, not written | M3 |
| A LICENSE file inside each package tarball | Planned | M3 |

### Catalog breadth and layout

A catalog of 13 cannot show that generation works. These come first among the generative prerequisites.

| Feature | Status | Milestone |
|---|---|---|
| About 20 more components: `Heading`, `Text`, `Card`, `Table`, `Tabs`, `Select`, `EmptyState` and others the product screens need | Planned | M3 |
| Layout primitives: `Stack`, `Grid`, `Split` | Planned | M3 |
| Layout intents, each with collapse rules per size class: `ListDetail`, `SupportingPane`, `Feed`, `Dashboard`, `Form`, `Settings` | Planned | M3 |
| Patterns that carry layout decisions: `StatsRow`, `FormSection`, `EmptyState` | Planned | M3 |
| Product-specific components that extend the catalog and meet the same bar as kbui's own | Planned | M4 |

A model that picks an intent and fills its regions inherits the arrangement instead of inventing it. Layout intents and patterns also keep trees shallow, which matters because quality drops beyond five or six levels of nesting.

### Contract and catalog

| Feature | Status | Milestone |
|---|---|---|
| Anatomy parser that reads parts and attribute values, not only the root class | Planned | M4 |
| One consistent anatomy grammar across components, including `Dialog` | Planned | M4 |
| One source for variant values, replacing the copy in each TypeScript union | Planned | M4 |
| Canonical tree types (below), with tree and manifest versions separate from package versions | Planned | M4 |
| Manifest generated from prop types, JSDoc, token names and anatomy lines | Planned | M4 |
| Drift test that fails when a component and its manifest entry disagree | Planned | M4 |
| Structure rules exported as JSON Schema for runtimes that constrain output | Planned | M4 |
| A focused catalog for each surface, about 30 to 60 entries, placed first in the prompt so it is cached | Planned | M4 |
| Storybook's MCP addon as an interim catalog for coding agents | Planned; can land at any time | M4 |

Each manifest entry holds the component's name, a one-line description of when to use it, its props with allowed values, its slots and what each accepts, and one or two examples from its stories. A precise when-to-use description improves a model's choices more than another component does, and selection tests (below) measure it.

The canonical tree holds only what every format shares:

```ts
type Node = {
  id: string;                      // stable, so edits can target one node
  type: string;                    // a catalog name
  props: Record<string, unknown>;  // token values only, never raw CSS
  slots?: Record<string, Node[]>;
  bind?: Record<string, Binding>;  // typed references to data, never code
  on?: Record<string, ActionRef>;  // named actions
};
```

Before the adapters can translate real trees, the tree also needs `repeat`, conditional visibility and two-way binding, which A2UI and json-render already carry. Bindings carry a type so the data rules can run.

### Rules

Every rule is hard, which rejects or fixes a tree, or soft, which scores it. Soft rules wait until enough human preference data exists to tune them. Lint results are written as instructions a model can act on. This table is the rule catalog; [M5](roadmap.md#m5-rule-engine) builds it.

#### Integrity and safety

| Rule | Kind | Fix |
|---|---|---|
| No password, MFA or card fields in a runtime tree unless the host allows the field | Hard | Remove; stop the stream if found early |
| Destructive actions go through a confirmation | Hard | Wrap the action in a confirmation |
| External links show their destination | Hard | Add the destination |
| Generated regions carry a visible marker | Hard | Add the marker |
| Content in an untrusted slot cannot hold a primary or destructive action | Hard | Demote or remove |
| Urgency, scarcity and price claims are bound to data | Hard | Remove the unbound claim |
| Rules from a deceptive-pattern taxonomy, such as false countdowns and confirm-shaming [S31] | Hard | Case by case |

These rules reach kbui's own nodes only. What an embedded MCP App does inside its iframe is decided by the host's bridge.

#### Structure

| Rule | Kind | Fix |
|---|---|---|
| Each slot accepts only listed types | Hard | Repair |
| Nesting depth per slot is limited | Hard | Wrap in a pattern, or repair |
| Slot capacity is limited | Hard | Move overflow into `Tabs` or a paginated `Table` |
| Actions allowed per slot are limited, such as read-only in a summary slot | Hard | Remove the action |
| References resolve and ids are unique | Hard | Lossless fix where possible |
| Unknown types become a placeholder node | Hard | Placeholder |

#### Design

| Rule | Kind | Fix |
|---|---|---|
| One primary action per region | Hard | Demote the others |
| Headings go down one level at a time | Hard | Renumber |
| Token contrast meets WCAG AA | Hard | Switch to the paired token |
| Props use tokens only, never raw values | Hard | Map to the nearest token |
| Visual balance and complexity | Soft | Ranks candidates |

#### Arrangement

| Rule | Kind | Fix |
|---|---|---|
| A screen's root is a layout intent | Hard | Wrap in the closest intent |
| Spacing comes from the token scale, and siblings share one gap | Hard | Normalize the gap |
| Related inputs are grouped | Hard | Wrap in `FormSection` |
| The primary action sits at the end of its region | Hard | Move it |
| Column count suits the size class | Hard | Change `Split` to `Stack` at compact size |
| The rendered page has no overlap, overflow, cut-off text or small targets, at three widths | Hard | Change intent or primitive, else repair |

#### Data fit

| Rule | Kind | Fix |
|---|---|---|
| The component fits the shape of its data, such as a single number in a `Stat` | Hard | Swap the component |
| A long list uses pagination | Hard | Swap to a paginated `Table` |
| Every region bound to data has empty, loading and error states | Hard | Insert `EmptyState` and the loading state |

Running the data rules in reverse gives a generator that suggests components from a data type, such as a Zod or OpenAPI schema. It is a later feature, not a rule.

### Fixing and repair

| Feature | Status | Milestone |
|---|---|---|
| Deterministic fix patches for each rule, lossless fixes first | Planned | M5 |
| One model repair round with the remaining diagnostics, then a visible notice or a fallback pattern | Planned | M6 |
| Several candidate screens ranked by soft rules | Later, once preference data exists | After M7 |

A fix resolves a violation in milliseconds. A model repair round costs a whole generation, and research found repair loops adding 52% compute with no better outcome [S34], so deterministic fixes carry most of the load.

### Generation outputs

| Output | Used by | The model produces | Milestone |
|---|---|---|---|
| Runtime trees | End users inside a product | A canonical tree, rendered by `render-react` | M6 |
| Build-time code | Developers with a coding agent | TSX that imports kbui components | M8 |

A runtime tree can be exported to TSX, so work can move from the first row to the second. To bring agent-written TSX under the same rules, a parser reads static kbui JSX back into the tree; how much real code it covers is unknown until M8 measures it.

### Reaching every runtime

| Feature | Status | Milestone |
|---|---|---|
| `render-react`: tree to kbui React, streaming, with placeholders for unknown nodes | Planned | M6 |
| `mcp`: an MCP server and agent skill with catalog search, lint, code generation, and one call that returns lint, accessibility, geometry and fix patches for a screen | Planned | M8 |
| Adapters for A2UI 0.9, json-render and MCP Apps | Planned | M8 |
| OpenUI Lang adapter | Only if token cost matters | Unscheduled |
| `styles.css` loaded inside MCP App frames, so screens look the same across web hosts | Planned | M8 |

Adapter policy:

- Each adapter is a pure two-way translation of about 300 lines. One that grows beyond that shows the canonical tree is missing something, and adding it needs a decision record.
- Adapters read outside formats as well as write them, so kbui can render other agents' UI in its own look and a saved tree can move between formats.
- The format version is in the name, for example `adapter-a2ui-0.9`. kbui supports the current and the previous version.
- Every adapter has golden fixtures: translate, validate against the upstream schema, render, compare.
- A weekly CI canary fetches upstream schemas and release tags and runs the fixtures, so a breaking upstream change is red within a week.
- Every adapter declares what it carries (slots, patches, streaming, actions). Anything else becomes a placeholder node instead of an error.
- The core packages never depend on Tambo, CopilotKit or Vercel runtimes.

The consistent look holds on the web only. Native A2UI renderers such as Flutter, SwiftUI and Compose use no CSS, and Base UI behavior is React only.

### Editing and nesting

| Feature | Status | Milestone |
|---|---|---|
| Stable node ids and JSON Patch edits to one node, so the rest of the screen stays as the user left it | Planned | M9 |
| A visual editor and a diff view driven by the same patches | Later | After M9 |
| Slots that hold other agents' surfaces, such as an MCP App panel, with nesting limits | Planned | M9 |

### Speed

| Who | What they wait for | kbui lever | Milestone |
|---|---|---|---|
| End user | First useful paint | Render each node when it is complete; regions bound to data show their loading state at once | M6 |
| End user | A broken screen discovered late | Check each node as it streams and stop generation on a fatal violation | M6 |
| End user | A repair round | Deterministic fixes first; one model round at most | M5, M6 |
| End user | An edit | Patch one node instead of regenerating the screen | M9 |
| End user and operator | Output tokens | Layout intents and patterns produce fewer nodes per screen | M3 |
| Operator | Input tokens | Focused catalogs, placed first in the prompt so they are cached | M4 |
| Coding agent | Correction rounds | Diagnostics written as instructions, with fix patches, in one MCP call | M8 |
| Maintainer | Adding a component | The anatomy line generates types, manifest, schema and grammar; `bun run new` scaffolds the rest | M4 |

No published generative UI latency figure is a measurement [S4], [S36]. kbui publishes measured timings for every adapter: time to first node, time to complete, repair time and edit time.

### Validation and evals

| Feature | Status | Milestone |
|---|---|---|
| `test:gen`: real prompts through tree, render, accessibility scan and lint, recording validity, lint pass rate, token adherence, edit success, token cost and time | Planned | M6 |
| Selection tests: each component ships prompts that must select it | Planned | M6 |
| Per-stage catch rates and costs for the whole pipeline | Planned | M6 |
| Validating the validator: precision and recall on labeled screens, seeded violations, fix fidelity | Planned | M2, M5 |
| An LLM judge for semantics that rules miss, run offline, from another model family, in both orders, never as a gate | Planned | M6 |
| Blind pairwise human preference for decisions | Planned | M2, M7 |

The pipeline runs cheapest first, and each stage handles only what earlier stages could not:

| Stage | Runs on | Checks | On failure |
|---|---|---|---|
| 0. Stream | Each node as it arrives | Schema, catalog membership, fatal integrity rules | Stop and repair |
| 1. Structure | Whole tree | Slots, nesting, references, actions | Lossless fix, else repair |
| 2. Rules | Whole tree | Design, arrangement, data fit, integrity | Fix patch, else repair |
| 3. Render | DOM at three widths | Accessibility, geometry, overflow, target size | Tree fix, else repair |
| 4. Repair | Remaining violations | One model round with the diagnostics | Visible notice, or fall back to a pattern |
| 5. Judge | Offline evals only | Semantics rules cannot see, such as labels that say nothing | Report, never block |
| 6. People | Direction decisions | Blind pairwise preference | Decides the direction |

The judge never gates because LLM judges match human preference on about 60% of UI pairs and are close to chance on ease of use [S51]. Results are stored in the repository so they can be reproduced.

### Promotion from use

An end user composes a screen and saves it. It becomes a named pattern with typed inputs, such as `TeamSummary(team, period)`, and joins the manifest so the model can reuse it. A developer can promote it: code generation writes a real component, story and test, which go through normal review. This needs a product whose end users compose at runtime, saved trees and tree migrations, so it comes last ([M10](roadmap.md#m10-promotion-from-use)).

## Differentiators

A differentiator is something no surveyed project offers that follows from kbui's position as the catalog and quality layer. They are ranked by strength of evidence. Every gap below was verified against primary sources on 2026-10-22. No differentiator's value is proven yet; [M2](roadmap.md#m2-field-test) and [M7](roadmap.md#m7-preference-comparison) decide that.

| # | Differentiator | Gap | Value | Main evidence |
|---|---|---|---|---|
| D1 | Integrity and safety rules on generated screens | Likely | Unknown | Deceptive patterns in 55.8% of 1,296 generated components and in 20 of 20 generated shop sites [S30], [S31]. Runtimes rely on allow-lists, sandboxes and review [S2], [S8], [S9]. |
| D2 | Design, arrangement and data-fit rules on component trees, with layout intents | Likely | Unknown | Validators check structure only [S1], [S2]; `@shadcn/lint` checks tokens in source [S10]; no runtime offers intents or arrangement checks [S38] |
| D3 | Design-level fixes as patches, lossless first, model repair only for the rest | Likely | Unknown | Structural fixers exist [S1], [S2], [S3]; no design-level fixer found |
| D4 | One rule engine for stories in CI, agent TSX through MCP, runtime trees, and A2UI or json-render trees through adapters | Likely | Unknown | Every tool found covers one input [S10], [S14], [S16] |
| D5 | Selection tests: each component ships prompts that must select it | Likely | Unknown | No framework or benchmark tests selection [S35]; tool descriptions are usually defective [S27] |
| D6 | Users' compositions promoted to named patterns, then to real components | Likely | Unknown | No project found that does it. Deferred until a product composes at runtime. |

### D1. Integrity and safety rules

A schema proves a tree will render. It does not prove the screen is honest. Other projects defend with a list of approved components (A2UI), an iframe sandbox (MCP Apps) or store review (the OpenAI Apps SDK). None checks what a screen built from approved parts asks the user to do, such as a login form assembled from a text field and a button. Both deceptive-pattern studies used free-form HTML, so the gap may be smaller inside a catalog-constrained runtime. M2 measures exactly that.

### D2. Rules for good trees

Design guidance in the field exists as prose, such as "one primary call to action" in OpenAI's guidelines, and nothing enforces it on a tree. kbui's rules know what each component means because they come from the same contract as the component. Encoding design knowledge as rules has prior art in [Draco](https://idl.uw.edu/draco) for charts; kbui applies it to whole screens.

### D3. Fixes that keep the user's intent

json-render's `autoFixSpec`, A2UI's payload fixer and v0's autofixers repair structure, syntax and code. None repairs design, such as demoting a second primary action or wrapping a destructive action in a confirmation. kbui credits json-render's lossless-first policy and applies it at the design level.

### D4. One bar everywhere

Runtimes check a tree against their own schema. None checks another runtime's output against a design system. Because kbui's rules travel with the catalog, a product that changes runtime keeps the same bar, and developers benefit even if they never generate a screen. On agent TSX the rules reach only what the parser can read back into the tree.

### D5. Selection tests

A catalog is only as good as the model's choice from it. Each component ships prompts that must select it, and the eval measures regressions as well as gains, because richer descriptions have been shown to regress 16.7% of cases [S27].

### D6. A catalog that grows from use

Other runtimes work in one direction: a developer writes the catalog and the model reads it. kbui also lets the catalog grow from what people build.

### Smaller openings

These are open in the field but small or easy to copy. They strengthen the six rather than stand alone.

| Opening | Gap |
|---|---|
| Checking each node while the tree streams, and stopping on a fatal violation | Likely, one research pass |
| Publishing per-stage catch rates and costs | Likely |
| Publishing measured timings per format instead of modeled ones | Likely |
| Rendered-geometry checks on generated trees at three widths | Likely |

### Why it lasts

Rules are easy to copy. The coupling is not: rules that know each component's meaning because they come from the same contract, plus a growing body of rules, fixes and selection tests checked by evals. A runtime cannot hold this, because runtimes are deliberately neutral about components. A token linter can grow into it, which is why `@shadcn/lint` is the competitor to watch.

### Demoted to features

| Item | Why it is not a differentiator |
|---|---|
| Rendering other projects' formats | CopilotKit, assistant-ui and OpenUI already do it |
| Generated catalog | Storybook's MCP addon generates manifests from stories |
| Node-level edits | A2UI and json-render already address nodes |
| A consistent look across hosts | Holds for the web only; a consequence of [0001](decisions/0001-framework-free-css-contract.md) |
| Evals | A2UI ships an eval framework; selection tests and per-stage numbers remain open |

## How kbui compares

From public documentation on 2026-10-22. Recheck before citing.

| | json-render | A2UI | Tambo | OpenUI | `@shadcn/lint` and shadcn MCP | Storybook MCP | kbui (planned) |
|---|---|---|---|---|---|---|---|
| Integrity and safety rules (D1) | No | Allow-list only | No | No | No | No | Yes |
| Design and arrangement rules on trees (D2) | No | Parent and child rules only | No | No | Token rules on source code | No | Yes |
| Design-level fixes (D3) | Structural fixes only | Structural fixes only | No | No | No | No | Yes |
| One engine across stories, agent code and runtime trees (D4) | No | No | No | No | Source code only | Stories only | Yes |
| Selection tests (D5) | No | No | No | No | No | No | Yes |
| Promotion from use (D6) | No | No | No | No | No | No | Yes |
| Catalog generated from source | No | No | No | No | Partly | Yes | Yes, with a drift test |
| Output checked against a schema | Yes | Yes | Yes | No | Not applicable | Not applicable | Yes |
| Node-level edits | Streams patches | By id | Partly | No | No | Not applicable | Yes |
| Renders other formats | No | No | No | A2UI client | No | No | Yes, through adapters |

The field in one line per layer: wire formats (A2UI, MCP Apps, the OpenAI Apps SDK, OpenUI Lang) say how UI reaches a client; runtimes (Tambo, CopilotKit with AG-UI, json-render, OpenUI) stream and register components; design-system tools (shadcn, Storybook) serve coding agents at build time; code generators (v0, Figma Make) turn language into code inside their own platforms. None treats the catalog's design quality as its responsibility.

## Non-goals

- An agent runtime, streaming protocol or wire format of kbui's own.
- Letting models write CSS or arbitrary code into a running app.
- Supporting a format that no project needs.
- Linting or fixing what a foreign surface does inside its iframe.
- Product vocabulary inside kbui. A product extends the catalog from its own repository.
- An icon set.
- A package registry.

## Risks and open questions

| Topic | Risk or question | Decided by |
|---|---|---|
| Real use | One product screen is built on kbui and not yet merged. Components should grow from real screens, not ahead of them. | M1 |
| Constrained runtimes | Catalogs may already prevent most deceptive and design problems; the studies used free-form HTML. | M2 |
| Strong models | Recent models produce valid, preferred screens without any catalog [S36]. kbui's case rests on consistency, integrity and editing, not on validity. | M2, M7 |
| Competitor | `@shadcn/lint` could add composition or safety rules and narrow D2 and D4. | Watched; recheck the comparison before each milestone |
| What kbui offers | If the rules improve shadcn screens, the rules may be worth more than the components. Running them on any catalog widens reach but loses kbui-specific rules such as token contrast and intents. | After M7 |
| Repair cost | Model repair loops add cost without better results [S34]. | M6 measures it |
| Judges | LLM judges are near chance on close pairs [S51]. Design claims need human pairs. | Policy above |
| Aesthetics | Computed metrics explain at most half of human ratings [S44]. Aesthetic rules stay soft. | Policy above |
| TSX reach | Parsing agent TSX into the tree may cover too little real code. | M8 |
| First runtime composer | No product composes screens at runtime yet. Promotion waits for one. | M10 |
| Descriptions | Richer descriptions can regress selection [S27]. | M6 |
| Native renderers | Flutter, SwiftUI and Compose get no CSS and no Base UI behavior. | Out of scope until a project needs one |
| Token cost | JSON is verbose. Add an OpenUI Lang adapter rather than a new format, if cost matters. | M6 measures it |
| Publishing | Answered by [0007](decisions/0007-lockstep-github-tarball-releases.md): public repository, tarballs on GitHub Releases, no registry. Packages still ship no LICENSE file. | M3 |

## Related documents

| Document | Covers |
|---|---|
| [Roadmap](roadmap.md) | Milestones, pass marks and gates |
| [Architecture](architecture.md) | How the packages fit together and what the build checks |
| [Tokens](tokens.md) | Token kinds, naming, aliases and dark mode |
| [Decision records](decisions/README.md) | Why the larger choices were made |
| [Evidence report](superpowers/specs/2026-10-22-generative-ui-evidence.md) | The research behind the differentiators, with sources |
| [Generative UI direction](superpowers/specs/2026-10-22-generative-ui-direction.md) | The first direction, kept as the 2026-10-22 record; this document replaces it as the home of the plan |
