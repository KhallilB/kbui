# kbui generative UI direction

Date: 2026-10-22
Status: direction adopted by the owner on 2026-10-22. No phase has started.

## Goal

People should be able to compose kbui screens in plain language, and put UI inside UI, without the result drifting off-brand, failing accessibility or turning into a dead end nobody can edit. Two groups will do this, often in the same product:

- **Developers at build time**, asking an agent to scaffold screens that use kbui.
- **End users at runtime**, asking an app built on kbui to show them something, then refining it.

Both groups draw on one source of truth inside kbui.

## Where kbui starts

At commit `c322d67`, kbui has three components (`Button`, `Input`, `Dialog`), W3C tokens, framework-free CSS and a React layer on Base UI. That's small, but three things it already has are exactly what generated UI needs:

- **The anatomy contract can be read by a machine.** Each stylesheet's first line names the root class, the parts and every allowed attribute value, for example `data-variant=primary|secondary|ghost|danger`. That's most of a props schema, and `packages/css/src/build.test.ts` already enforces that it's there.
- **The CSS doesn't depend on React.** The same markup looks the same whether React, a web component or a server renders it ([0001](../../decisions/0001-framework-free-css-contract.md)).
- **Rules are enforced, not remembered.** Token checks, the palette ban, story coverage and an axe scan on every story already fail the build. The same habit extends to generated trees.

## The field as of 2026-10-22

| Layer | Who | What they own | What they leave to you |
|---|---|---|---|
| Wire formats | A2UI v0.9 (Google, April 2026), Open-JSON-UI, MCP Apps, OpenUI Lang (Thesys) | How an agent sends UI to a client | What the UI looks like, and whether it's any good |
| Runtimes and SDKs | Tambo 1.0 (February 2026), CopilotKit with AG-UI, json-render (Vercel Labs), OpenUI, LangChain | Streaming, component registries, agent loops | The components themselves. Every one of them asks you to bring your own. |
| Design systems for agents | shadcn MCP server, registry and skills (March 2026) | An agent finding and installing components while you code | Anything at runtime, and rules about how components combine. Copied code drifts from the source. |
| Code generators | v0, Figma Make, Thesys OUI-1 | Plain language to code | Consistency, and working outside their own platform |

The gap: every runtime treats the component catalog as someone else's problem, and none of them checks whether a generated tree is well designed. That's the space kbui takes.

These descriptions come from vendor docs and announcements, listed under [Sources](#sources). Vendor numbers, such as OpenUI's claim of 67% fewer tokens than json-render, are their own and unverified here. One independent comparison measured about 2.1 times fewer.

## Position

kbui will be the design system generative runtimes plug into, not a runtime or a wire format of its own ([0005](../../decisions/0005-catalog-and-quality-layer-not-runtime.md)). It supplies three things:

1. A catalog that agents read, generated from kbui's own source.
2. Rules that every tree has to pass, whether a person or a model wrote it.
3. Adapters that hand both of those to whichever runtime a product uses.

## The canonical tree

kbui keeps its own small tree format, and every outside format is translated to and from it at the edge ([0006](../../decisions/0006-canonical-tree-adapters-at-edge.md)). It holds only what every format shares:

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

Everything that makes kbui different (the manifest, grammar, lint, promotion and evals) works on this tree. A change in someone else's format then only ever touches one adapter.

## What makes kbui different

### 1. The catalog is generated, and can't drift

Most runtimes have you write a catalog entry, usually a Zod schema, by hand next to each component, and nothing keeps the two in step. kbui will build its manifest from three things it already has: the `Anatomy:` line, the token names and the TypeScript prop types with their JSDoc comments. A test fails when a component and its manifest entry disagree. That also closes the gap [0001](../../decisions/0001-framework-free-css-contract.md) admits to, that nothing checks the React output matches the anatomy line.

### 2. Rules for good trees, not just valid ones

A schema only proves a tree will render. kbui adds two more layers:

- **A grammar** saying what each slot accepts. For example, `Card` takes a header, body and footer, and `Button` takes no children.
- **Design lint**: one primary action per region, heading levels in order, consistent spacing between siblings, a nesting limit and token contrast.

The same checks run on hand-written stories in CI, so developers benefit even if they never generate anything.

### 3. Users' compositions can become components

This is the piece that serves both groups at once.

1. An end user composes a screen.
2. They save it, and it becomes a named pattern with typed inputs, such as `TeamSummary(team, period)`.
3. The pattern joins the manifest, so the model can reuse it.
4. A developer can promote it. Codegen writes a real component, a story and a test, which then go through normal review.

Other runtimes only work in one direction: a developer writes the catalog and the model reads it. kbui also lets the catalog grow from what people actually build.

### 4. Typed slots with limits

A slot says what it accepts and what the content inside it is allowed to do. For example, a slot might accept only `Insight` or `Chart` nodes, allow read-only actions and allow at most three levels of nesting. That makes it safe to put a surface generated by someone else's agent, such as an MCP App panel, inside a kbui screen.

### 5. Edits change one node, not the whole screen

Every node has a stable `id`. A request like "make the second column denser" becomes a JSON Patch against that node, so the rest of the screen stays as the user left it. The same patches can drive a visual editor and a diff view, and a tree can be exported to TSX.

### 6. One look in every host

Because the CSS doesn't depend on a framework, a kbui screen looks the same in a React app, in an A2UI renderer and inside an MCP App. MCP Apps render in iframes, which is the case [0001](../../decisions/0001-framework-free-css-contract.md) says would make us revisit global CSS. The MCP Apps adapter must load `styles.css` into the frame itself.

### 7. Evals that run like tests

A `test:gen` suite takes a fixed set of real prompts through prompt, tree, render, axe and lint, and records:

- how many trees are valid
- how many pass lint
- how closely they stick to tokens
- how many edits succeed
- how many tokens each screen costs

The numbers live in the repository, so they can be reproduced, unlike vendor claims.

## Staying current as formats change

Wire formats are new and still changing (A2UI is at v0.9). The idea underneath them, a tree of typed components, has barely changed since HTML. kbui bets on the tree and keeps formats at the edge:

- **Adapters are thin.** Each one is a pure translation in both directions, aimed at about 300 lines. An adapter that grows past that means the canonical tree is missing something. Adding it is a deliberate decision with its own record, not a quiet leak.
- **Adapters carry the format version in their name**, for example `adapter-a2ui-0.9`. We support the current version and the one before it.
- **Every adapter has golden fixtures.** A tree goes out to the format, gets checked against the upstream schema, is rendered and is compared with the expected result.
- **A weekly CI canary** fetches upstream schemas and release tags and runs the fixtures, so a breaking upstream change shows up as a red build that week.
- **Every adapter states what it can carry**: slots, patches, streaming and actions. Anything it can't carry falls back to a placeholder node instead of crashing.
- **The core packages never depend on Tambo, CopilotKit or Vercel runtimes.** Those integrations stay optional.

| Signal | What we do |
|---|---|
| A new format appears and no project needs it | Watch it. Spend a day on a spike only if it's gaining traction. |
| A project or host needs a format | Write the adapter and its fixtures. |
| Upstream releases a new version | The canary goes red. Update the adapter and keep the previous version. |
| A format is abandoned | Delete its adapter. Nothing else changes. |
| Several formats add the same feature | Consider adding it to the canonical tree, with a decision record. |

The manifest and the tree format get their own versions, with migrations for saved trees, because users' saved compositions have to survive upgrades.

## Planned packages

None of these exist yet.

```
packages/
  manifest/                 canonical tree types and the generated catalog, no dependencies
  lint/                     grammar and design rules, run on trees and on stories
  render-react/             canonical tree to kbui React
  adapter-a2ui-0.9/         canonical tree to and from A2UI
  adapter-json-render/      canonical tree to and from a json-render catalog and spec
  adapter-mcp-apps/         canonical tree to an iframe bundle that loads styles.css
  adapter-openui-lang/      only if token cost turns out to matter
```

## Roadmap

Each phase ends with a check that shows it's done.

| Phase | Build | Done when |
|---|---|---|
| 0 | About 20 more components, including the layout primitives `Stack`, `Grid` and `Split`, plus `Heading`, `Text`, `Card`, `Table`, `StatTile`, `Badge`, `Tabs`, `Select` and `EmptyState`, each with a complete anatomy line | All current checks pass and the axe scan is clean |
| 1 | The manifest generator, its drift test, and exports to json-render and A2UI | The manifest regenerates identically, and a deliberately introduced mismatch fails the drift test |
| 2 | The grammar and lint engine, also run on stories | It flags a deliberately bad layout, and every story passes |
| 3 | `render-react` and a `test:gen` suite of about 20 prompts | First numbers recorded in the repository |
| 4 | Stable ids and patch edits | At least 80% of the suite's edit prompts apply without regenerating the screen |
| 5 | Promoting compositions to patterns, with TSX codegen | A saved composition comes out as a component, story and test that all pass |
| 6 | Typed slots with limits | A nested foreign surface is stopped from taking an action it isn't allowed |

### When to stop

After phase 3, run the same prompts through json-render with its shadcn catalog. If kbui with lint doesn't clearly beat it on lint pass rate and accessibility, stop building after phase 1, keep the manifest exports, and use the existing runtimes as they are.

## Risks and open questions

- **The catalog is too small.** Nothing here can be demonstrated with three components, so phase 0 comes first.
- **Publishing.** kbui is installed by local path ([0003](../../decisions/0003-local-path-installs.md)), and that record already says to revisit it before Tideline starts on 2026-11-02. Whether kbui stays a shared in-house system or gets published changes how much the adapters are worth. That's still open.
- **Iframes.** See point 6 above and [0001](../../decisions/0001-framework-free-css-contract.md).
- **Token cost.** JSON is verbose. If cost becomes a problem, add an OpenUI Lang adapter rather than inventing a format of our own.
- **Who uses it first.** Tideline is the obvious first project to compose at runtime. That hasn't been confirmed.

## Non-goals

- Building our own agent runtime, streaming protocol or wire format.
- Letting models write CSS or arbitrary code into a running app.
- Supporting a format that no project needs.

## Sources

Checked 2026-10-22. These are vendor and community pages, so treat their claims as what each project says about itself.

- [A2UI v0.9](https://developers.googleblog.com/a2ui-v0-9-generative-ui/), Google Developers Blog
- [Declarative generative UI with json-render](https://docs.langchain.com/oss/python/langchain/frontend/declarative-generative-ui), LangChain docs
- [Comparing AG-UI, MCP-UI and A2UI](https://copilotkit.ai/blog/the-state-of-agentic-ui-comparing-ag-ui-mcp-ui-and-a2ui-protocols), CopilotKit
- [Generative UI in 2026](https://www.copilotkit.ai/blog/the-developer-s-guide-to-generative-ui-in-2026), CopilotKit
- [Introducing Tambo 1.0](https://tambo.co/blog/posts/introducing-tambo-generative-ui)
- [OpenUI Lang token comparison](https://mer.vin/2026/05/openui-lang-mit-generative-ui-that-cuts-llm-output-tokens-versus-json/?amp=1), independent write-up
- [shadcn MCP](https://ui.shadcn.com/docs/mcp)
