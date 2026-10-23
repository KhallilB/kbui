# kbui generative UI direction

Date: 2026-10-22
Status: direction adopted by the owner on 2026-10-22. Replaced as the home of the plan on 2026-10-22 by the [product document](../../product.md) and the [roadmap](../../roadmap.md), which fold in the [evidence report](2026-10-22-generative-ui-evidence.md). Kept as the record of the first direction; its phases map to milestones M3 to M10.

## Goal

Allow people to compose kbui screens in plain language, and to nest UI inside UI, without the result drifting off-brand, failing accessibility or becoming impossible to edit. Two groups will do this, often in the same product:

- Developers at build time, asking an agent to scaffold screens that use kbui.
- End users at runtime, asking an app built on kbui to show them something and then refining it.

Both groups draw on one source of truth inside kbui.

## Where kbui starts

At commit `c322d67`, kbui has three components (`Button`, `Input`, `Dialog`), W3C tokens, framework-free CSS and a React layer on Base UI. Three existing properties are directly useful for generated UI:

- The anatomy contract is machine-readable. Each stylesheet's first line names the root class, the parts and every allowed attribute value, for example `data-variant=primary|secondary|ghost|danger`. That is most of a props schema, and `packages/css/src/build.test.ts` already enforces its presence.
- The CSS does not depend on React. The same markup looks the same whether React, a web component or a server renders it ([0001](../../decisions/0001-framework-free-css-contract.md)).
- Rules are enforced by tests. Token checks, the palette ban, story coverage and an accessibility scan on every story already fail the build. Generated trees can be checked the same way.

## The field as of 2026-10-22

| Layer | Projects | What they provide | What they leave to the design system |
|---|---|---|---|
| Wire formats | A2UI v0.9 (Google, April 2026), Open-JSON-UI, MCP Apps, the OpenAI Apps SDK (built on MCP), OpenUI Lang (Thesys) | How an agent sends UI to a client | How the UI looks and whether it is well designed |
| Runtimes and SDKs | Tambo 1.0 (February 2026), CopilotKit with AG-UI, json-render (Vercel Labs), OpenUI, LangChain | Streaming, component registries, agent loops | The components. Each one expects you to supply your own. |
| Design systems for agents | shadcn MCP server, registry and skills (March 2026) | An agent finding and installing components during development | Runtime use, and rules for how components combine. Copied code drifts from its source. |
| Code generators | v0, Figma Make, Thesys OUI-1 | Plain language to code | Consistency, and use outside their own platform |

No runtime treats the component catalog as its responsibility, and none checks whether a generated tree is well designed. kbui will fill that role.

These descriptions come from vendor documentation and announcements, listed under [Sources](#sources). Vendor figures, such as OpenUI's claim of 67% fewer tokens than json-render, are the vendors' own and have not been verified here. One independent comparison measured about 2.1 times fewer.

## How kbui compares

| Capability | json-render | A2UI | Tambo | OpenUI | shadcn MCP | kbui (planned) |
|---|---|---|---|---|---|---|
| Catalog generated from component source, with a drift test | No | No | No | No | Partly | Yes |
| Grammar for what each slot accepts | Props schema only | Partly | No | No | Written guidance only | Yes, enforced |
| Design lint on generated output | No | No | No | No | No | Yes |
| One source for build-time and runtime use | No | No | Partly | Partly | Build time only | Yes |
| Saved user compositions promoted to components | No | No | No | No | No | Yes |
| Typed slots with limits on nested content | No | Partly | No | No | No | Yes |
| Edits applied to single nodes | No | Partly, through data-model updates | Partly, through persistent components | No | No | Yes |
| Renders other projects' formats | Own format | Own format | Own format | Own format | Not applicable | Yes, through adapters |

"Partly" means the project has a related but narrower feature. The table reflects public documentation on 2026-10-22 and should be rechecked before it is cited.

## Position

kbui will be the design system that generative runtimes plug into. It will not be a runtime or a wire format ([0005](../../decisions/0005-catalog-and-quality-layer-not-runtime.md)). It supplies:

1. A catalog that agents read, generated from kbui's own source.
2. Rules that every tree must pass, whether a person or a model wrote it.
3. Adapters that deliver the catalog and rules to whichever runtime a product uses.

## The canonical tree

kbui keeps its own small tree format and translates every outside format to and from it at the edge ([0006](../../decisions/0006-canonical-tree-adapters-at-edge.md)). The tree holds only what all formats share:

```ts
type Node = {
  id: string;                      // stable, so edits can target one node
  type: string;                    // a catalog name
  props: Record<string, unknown>;  // token values only, never raw CSS
  slots?: Record<string, Node[]>;
  bind?: Record<string, string>;   // references to data, never code
  on?: Record<string, ActionRef>;  // named actions
};
```

The manifest, grammar, lint, promotion and evals all operate on this tree. A change in an outside format therefore touches only its adapter.

## Two ways to generate

The same catalog and rules serve both groups through two outputs:

| | Runtime trees | Build-time code |
|---|---|---|
| Used by | End users inside a product | Developers working with a coding agent |
| The model produces | A canonical tree, rendered by kbui | TSX that imports kbui components |
| Strength | Safe to run, editable and nestable | Full flexibility, reviewed like any other code |
| Risk | Limited to what the catalog offers | Can drift from the catalog and needs review |
| How kbui reaches it | `render-react` and the format adapters | An MCP server and agent skill that expose the catalog, run lint and generate code |

A runtime tree can be exported to TSX, so work can move from the first column to the second.

## The catalog entry

Each component's manifest entry holds:

- its name and a one-line description of when to use it, taken from the component's JSDoc
- its props, with allowed values taken from the anatomy line and token names
- its slots and what each accepts, taken from the grammar
- one or two examples, taken from the component's stories

Descriptions matter more than the number of components. A short, precise description of when to use a component improves the model's choices more than adding another component does.

## What makes kbui different

### 1. The catalog is generated, and cannot drift

Most runtimes require a catalog entry, usually a Zod schema, written by hand next to each component, with nothing keeping the two in step. kbui will build its manifest from three sources it already has: the `Anatomy:` line, the token names, and the TypeScript prop types with their JSDoc comments. A test fails when a component and its manifest entry disagree. This also closes the gap [0001](../../decisions/0001-framework-free-css-contract.md) acknowledges: nothing currently checks that the React output matches the anatomy line.

### 2. Rules for good trees, not just valid ones

A schema proves only that a tree will render. kbui adds two further layers:

- A grammar defining what each slot accepts. For example, `Card` takes a header, body and footer, and `Button` takes no children.
- Design lint: one primary action per region, heading levels in order, consistent spacing between siblings, a nesting limit and token contrast.

A layer of patterns sits above the primitives. Patterns such as `StatsRow`, `FormSection` and `EmptyState` carry layout decisions, so the model chooses an intent and inherits the design. Patterns are written by hand at first; the next section adds patterns that come from use.

The same checks run on hand-written stories in CI, so developers benefit even if they never generate a screen.

### 3. Users' compositions can become components

This capability serves both groups:

1. An end user composes a screen.
2. They save it, and it becomes a named pattern with typed inputs, such as `TeamSummary(team, period)`.
3. The pattern joins the manifest, so the model can reuse it.
4. A developer can promote it. Code generation writes a real component, a story and a test, which then go through normal review.

Other runtimes work in one direction: a developer writes the catalog and the model reads it. kbui also lets the catalog grow from what people build.

### 4. Typed slots with limits

A slot declares what it accepts and what its content may do. For example, a slot might accept only `Insight` or `Chart` nodes, allow only read-only actions and allow at most three levels of nesting. This makes it safe to embed a surface generated by another agent, such as an MCP App panel, inside a kbui screen.

### 5. Edits change one node, not the whole screen

Every node has a stable `id`. A request such as "make the second column denser" becomes a JSON Patch against that node, and the rest of the screen stays as the user left it. The same patches can drive a visual editor and a diff view, and a tree can be exported to TSX.

### 6. One look in every host

Because the CSS does not depend on a framework, a kbui screen looks the same in a React app, in an A2UI renderer and inside an MCP App. MCP Apps render in iframes, which is the case [0001](../../decisions/0001-framework-free-css-contract.md) names as a reason to revisit global CSS. The MCP Apps adapter must therefore load `styles.css` into the frame itself.

### 7. Evals that run like tests

A `test:gen` suite runs a fixed set of real prompts through prompt, tree, render, accessibility scan and lint, and records:

- the share of trees that are valid
- the share that pass lint
- adherence to tokens
- the share of edits that succeed
- the token cost of each screen

The results are stored in the repository so they can be reproduced, unlike vendor claims. The suite runs the same prompts through every adapter, so a new format can be judged within days of writing its adapter.

### 8. Products can add their own components

A product can extend the catalog with components from its own domain. A sports league product, for example, might add `Standings`, `Bracket`, `Fixture` and `PlayerCard`. These entries pass the same grammar and lint as kbui's own. A catalog that uses the product's vocabulary needs shorter prompts and produces better screens than a generic one.

## Staying current as formats change

Wire formats are new and still changing; A2UI is at v0.9. The model underneath them, a tree of typed components, has barely changed since HTML. kbui commits to the tree and keeps formats at the edge:

- Adapters are thin. Each one is a pure two-way translation of about 300 lines. An adapter that grows beyond that indicates the canonical tree is missing something, and adding it requires its own decision record.
- Adapters read outside formats as well as write them. kbui can therefore render UI produced by other agents in its own look, and a saved tree can move between formats.
- Adapters carry the format version in their name, for example `adapter-a2ui-0.9`. We support the current version and the previous one.
- Every adapter has golden fixtures. A tree is translated to the format, validated against the upstream schema, rendered and compared with the expected result.
- A weekly CI canary fetches upstream schemas and release tags and runs the fixtures, so a breaking upstream change produces a red build within a week.
- Every adapter declares what it can carry: slots, patches, streaming and actions. Anything it cannot carry becomes a placeholder node instead of an error.
- The core packages never depend on Tambo, CopilotKit or Vercel runtimes. Those integrations stay optional.

| Signal | Response |
|---|---|
| A new format appears and no project needs it | Monitor it. Spend a day on a spike only if it gains traction. |
| A project or host needs a format | Write the adapter and its fixtures. |
| Upstream releases a new version | The canary fails. Update the adapter and keep the previous version. |
| A format is abandoned | Delete its adapter. Nothing else changes. |
| Several formats add the same feature | Consider adding it to the canonical tree, with a decision record. |

The manifest and the tree format have their own versions, with migrations for saved trees, because users' saved compositions must survive upgrades.

## Planned packages

None of these exist yet.

```
packages/
  manifest/                 canonical tree types and the generated catalog, no dependencies
  lint/                     grammar and design rules, run on trees and on stories
  render-react/             canonical tree to kbui React; streams partial trees and shows a placeholder for unknown nodes
  mcp/                      MCP server and agent skill for coding agents: catalog search, lint and code generation
  adapter-a2ui-0.9/         canonical tree to and from A2UI
  adapter-json-render/      canonical tree to and from a json-render catalog and spec
  adapter-mcp-apps/         canonical tree to an iframe bundle that loads styles.css
  adapter-openui-lang/      only if token cost turns out to matter
```

## Priorities

Differentiators 1 to 3 come first: a catalog that cannot drift, rules for good trees, and promotion from use. Together they are the hardest to copy and serve both groups. Adapters follow early for reach. Node-level edits and typed slots follow once stable ids exist.

## Roadmap

Each phase ends with a check that confirms it is complete.

| Phase | Build | Done when |
|---|---|---|
| 0 | About 20 more components, including the layout primitives `Stack`, `Grid` and `Split`, plus `Heading`, `Text`, `Card`, `Table`, `StatTile`, `Badge`, `Tabs`, `Select` and `EmptyState`, each with a complete anatomy line | All current checks pass and the accessibility scan is clean |
| 1 | The manifest generator, its drift test, and exports to json-render, A2UI and an MCP server for coding agents | The manifest regenerates identically, and a deliberately introduced mismatch fails the drift test |
| 2 | The grammar and lint engine, also run on stories | It flags a deliberately bad layout, and every story passes |
| 3 | `render-react` and a `test:gen` suite of about 20 prompts | First results recorded in the repository |
| 4 | Promoting compositions to patterns, with TSX code generation | A saved composition produces a component, story and test that all pass |
| 5 | Stable ids and patch edits | At least 80% of the suite's edit prompts apply without regenerating the screen |
| 6 | Typed slots with limits | A nested foreign surface is blocked from an action it is not allowed |

### When to stop

After phase 3, run the same prompts through json-render with its shadcn catalog. If kbui with lint does not clearly beat it on lint pass rate and accessibility, stop after phase 1, keep the manifest exports, and use the existing runtimes as they are.

## Practical limits

These are working estimates. The `test:gen` suite will measure them.

- Model accuracy drops as the catalog grows. Each surface should offer a focused catalog of roughly 30 to 60 entries rather than every component.
- Quality drops beyond five or six levels of nesting. Layout primitives and patterns keep trees shallow.
- A schema guarantees a valid tree, not a good layout. Patterns and design lint raise the floor.
- Plain-language requests are often vague. Schema defaults fill the gaps instead of the model guessing.

## Risks and open questions

| Topic | Risk or question |
|---|---|
| Catalog size | Nothing here can be demonstrated with three components, so phase 0 comes first. |
| Publishing | Answered by [0007](../../decisions/0007-lockstep-github-tarball-releases.md) on 2026-10-22: the repository is public, and each release attaches one tarball per package to a GitHub Release. There is no registry. Planned packages join the lockstep version unless a new record says otherwise. |
| Iframes | See point 6 above and [0001](../../decisions/0001-framework-free-css-contract.md). |
| Token cost | JSON is verbose. If cost becomes a problem, add an OpenUI Lang adapter rather than inventing a new format. |
| First user | Tideline is the likely first project to compose at runtime. Not yet confirmed. |

## Non-goals

- Building our own agent runtime, streaming protocol or wire format.
- Letting models write CSS or arbitrary code into a running app.
- Supporting a format that no project needs.

## Sources

Checked 2026-10-22. These are vendor and community pages; treat their claims as each project's description of itself.

- [A2UI v0.9](https://developers.googleblog.com/a2ui-v0-9-generative-ui/), Google Developers Blog
- [Declarative generative UI with json-render](https://docs.langchain.com/oss/python/langchain/frontend/declarative-generative-ui), LangChain docs
- [Comparing AG-UI, MCP-UI and A2UI](https://copilotkit.ai/blog/the-state-of-agentic-ui-comparing-ag-ui-mcp-ui-and-a2ui-protocols), CopilotKit
- [Generative UI in 2026](https://www.copilotkit.ai/blog/the-developer-s-guide-to-generative-ui-in-2026), CopilotKit
- [Introducing Tambo 1.0](https://tambo.co/blog/posts/introducing-tambo-generative-ui)
- [OpenUI Lang token comparison](https://mer.vin/2026/05/openui-lang-mit-generative-ui-that-cuts-llm-output-tokens-versus-json/?amp=1), independent write-up
- [shadcn MCP](https://ui.shadcn.com/docs/mcp)
