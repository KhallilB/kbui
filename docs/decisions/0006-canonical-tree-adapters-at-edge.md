# 0006. Keep one tree format of our own, and translate outside formats at the edge

## Status

Accepted on 2026-10-22, when the owner adopted the generative UI direction.

## Context

Generative UI wire formats are new and still changing. As of 2026-10-22, A2UI is at v0.9, json-render and OpenUI Lang define their own specs, and MCP Apps renders inside iframes. If kbui took any of them as its internal model, every upstream change would ripple through the manifest, the lint rules and users' saved compositions.

The idea underneath every one of these formats, a tree of typed components with props, children, data bindings and named actions, has barely changed since HTML.

What could fail: the bet that a small shared tree covers what the formats we need actually carry. If one of them requires something central that doesn't fit, an adapter either loses information or swells.

## Decision

kbui owns one canonical tree format in a planned `packages/manifest`:

- each node has an `id`, a `type`, `props` holding token values, `slots`, data bindings and named actions
- the manifest, grammar, lint, promotion and evals all work on this tree, and only on this tree
- each outside format gets an adapter that translates in both directions, carries the format's version in its package name, and is backed by golden fixtures checked against the upstream schema

We support the current version of each format and the one before it. A weekly CI canary fetches upstream schemas and runs the fixtures. An adapter falls back to a placeholder node when it meets something it can't translate, instead of crashing. Adding a concept to the canonical tree takes its own decision record. An adapter that grows past about 300 lines is the sign one may be needed.

## Options considered

- **Our own tree, with adapters at the edge: chosen.** Formats can come and go without touching what makes kbui different.
- **Use A2UI as the internal model: rejected.** It's at v0.9 and run by Google. Each breaking release would mean migrating kbui's core and users' saved trees.
- **Use the json-render spec as the internal model: rejected,** for the same reason, and because it's tied to how one vendor shapes its catalogs.
- **Support only one format with no internal model: rejected.** It's the cheapest option until a project needs a second format, and then it's a rewrite.

## Consequences

Every format costs an adapter, fixtures and a canary job, which is ongoing maintenance.

Translation can lose information. A feature that exists in only one format, such as a streaming detail specific to A2UI, may not survive the round trip.

The canonical tree and the manifest get their own versions, so we take on migrations for saved trees.

## Soundness boundary

Fixtures and the canary prove that the cases we've written down still translate. They don't prove that every valid upstream document translates, or that two hosts render the same tree identically.

## Threat model

This guards against upstream format churn spreading into kbui's core, and against getting locked to one vendor. It doesn't guard against an upstream project dropping a format without warning, or against a host's own renderer bugs.

## Non-goals

- Owning or proposing a wire format.
- An adapter for a format no project needs.

## Revisit if

- An adapter keeps needing information the canonical tree can't hold.
- One format becomes the clear standard and is stable at 1.0 or later. Then adopting it as the internal model may cost less than keeping our own.
- Keeping N and N-1 versions of a format costs more than the projects on the old one are worth.

## Adoption

None yet. `packages/manifest` and the adapters are planned in the [direction spec](../superpowers/specs/2026-10-22-generative-ui-direction.md#planned-packages).

## Validation

- Still to do: round-trip fixtures for `adapter-a2ui-0.9` and `adapter-json-render` (spec, phase 1).
- Still to do: a CI canary job against the upstream schemas.
- Nothing has run yet.

## Links

- [Generative UI direction spec: Staying current as formats change](../superpowers/specs/2026-10-22-generative-ui-direction.md#staying-current-as-formats-change)
- Builds on: [0005](0005-catalog-and-quality-layer-not-runtime.md)
- Related: [0001](0001-framework-free-css-contract.md), whose "Revisit if" covers the iframe case that MCP Apps will raise
