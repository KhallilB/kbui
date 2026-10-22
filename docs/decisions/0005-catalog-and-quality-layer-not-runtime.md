# 0005. Be the catalog and quality layer for generative UI, not a runtime

## Status

Accepted on 2026-10-22, when the owner adopted the generative UI direction.

## Context

We want kbui screens to be composable in plain language, both by developers asking an agent for code and by end users asking an app built on kbui to show them something. Plenty of other projects are already building parts of this. As of 2026-10-22: wire formats (A2UI v0.9, MCP Apps, OpenUI Lang), runtimes (Tambo 1.0, CopilotKit with AG-UI, json-render) and agent tooling for design systems (shadcn MCP). The [direction spec](../superpowers/specs/2026-10-22-generative-ui-direction.md#the-field-as-of-2026-10-22) lists them with sources.

Every one of those runtimes leaves the components to the user, and none of them checks whether a generated tree is well designed. kbui already has the raw material for that: an anatomy contract a machine can read, and checks that fail the build.

What could fail: the bet that a design-specific layer adds real value on top of a generic runtime fed a decent catalog, such as json-render with its shadcn catalog. If it doesn't, everything beyond a catalog export is wasted work.

## Decision

kbui supplies three things to generative runtimes:

- a catalog generated from its own source
- grammar and design rules that every tree has to pass
- thin adapters to the runtimes and formats that projects actually use

kbui doesn't build its own agent runtime, streaming protocol or wire format. The core packages never depend on a third-party runtime, and integrations with them stay optional.

The same rules apply to trees a model generates and to stories people write, so both groups use the same quality bar.

## Options considered

- **Catalog and quality layer, with adapters: chosen.** It's where the gap is, it builds on the contract kbui already enforces, and it works with whichever runtime wins.
- **Build our own runtime and format: rejected.** It competes with well-funded projects in a space that's still changing, and it ties every project to kbui-specific infrastructure.
- **Adopt one runtime, such as Tambo, and only register components with it: rejected.** It's the cheapest start, but it ties the catalog to one vendor's schema and leaves out the grammar, lint and promotion that give kbui its edge.
- **Do nothing and stay a component library: rejected.** Agents would still use kbui, but through catalogs written by hand that drift, with no quality bar.

## Consequences

We maintain a manifest generator, a lint engine and one adapter per supported format. That's ongoing work that grows with each format.

Nothing can be demonstrated until the catalog grows from 3 components to about 20, so phase 0 of the spec has to come first.

We give up control over streaming and agent behavior. Whatever a runtime does badly there, we inherit.

## Soundness boundary

This record decides where kbui's effort goes. It doesn't prove the quality layer improves output. Only the planned `test:gen` comparison can show that, and it hasn't run.

## Threat model

This guards against two things: spending effort in a crowded runtime space, and catalogs drifting away from the components they describe. It doesn't guard against a runtime misusing a valid tree, or a model ignoring the catalog descriptions.

## Non-goals

- An agent runtime, streaming protocol or wire format of our own.
- Letting models write CSS or arbitrary code into a running app.

## Revisit if

- After phase 3, kbui with lint doesn't clearly beat json-render with the shadcn catalog on lint pass rate and accessibility for the same prompts. In that case, stop after phase 1.
- One runtime or format becomes the clear standard and ships its own design rules.
- kbui stays private and only one project ever composes at runtime.

## Adoption

None yet. No catalog, lint or adapter exists at commit `c322d67`.

## Validation

- Still to do: build the manifest generator and its drift test (spec, phase 1).
- Still to do: run `test:gen` against the json-render comparison (spec, phase 3).
- Nothing has run yet.

## Links

- [Generative UI direction spec](../superpowers/specs/2026-10-22-generative-ui-direction.md)
- Builds on: [0001](0001-framework-free-css-contract.md), whose anatomy line becomes the catalog's source
- Related: [0006](0006-canonical-tree-adapters-at-edge.md), for how formats are kept at the edge
- Related: [0003](0003-local-path-installs.md), since whether kbui gets published affects how much the adapters are worth
