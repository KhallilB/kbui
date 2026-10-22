# 0006. Keep one tree format of our own, and translate outside formats at the edge

## Status

Accepted on 2026-10-22, when the owner adopted the generative UI direction.

## Context

Generative UI wire formats are new and still changing. As of 2026-10-22, A2UI is at v0.9, json-render and OpenUI Lang define their own specs, and MCP Apps renders inside iframes. If kbui adopted any of them as its internal model, every upstream change would ripple through the manifest, the lint rules and users' saved compositions.

The model underneath all of these formats, a tree of typed components with props, children, data bindings and named actions, has changed little since HTML.

The bet that could fail is that a small shared tree covers what the formats we need actually carry. If one of them requires something central that does not fit, its adapter either loses information or grows too large.

## Decision

kbui owns one canonical tree format, in a planned `packages/manifest`:

- Each node has an `id`, a `type`, `props` holding token values, `slots`, data bindings and named actions.
- The manifest, grammar, lint, promotion and evals all operate on this tree and only on this tree.
- Each outside format gets an adapter that translates in both directions, carries the format version in its package name, and is backed by golden fixtures checked against the upstream schema.

We support the current version of each format and the version before it. A weekly CI canary fetches upstream schemas and runs the fixtures. An adapter that meets something it cannot translate falls back to a placeholder node instead of failing. Adding a concept to the canonical tree requires its own decision record. An adapter that grows past about 300 lines is the signal that one may be needed.

## Options considered

- Our own tree, with adapters at the edge: accepted. Formats can come and go without touching the parts of kbui that matter.
- A2UI as the internal model: rejected. It is at v0.9 and controlled by Google. Each breaking release would require migrating kbui's core and users' saved trees.
- The json-render spec as the internal model: rejected for the same reason, and because it is shaped around one vendor's catalogs.
- One supported format and no internal model: rejected. It is the cheapest option until a project needs a second format, at which point it becomes a rewrite.

## Consequences

Every format costs an adapter, fixtures and a canary job, which is ongoing maintenance.

Translation can lose information. A feature that exists in only one format, such as an A2UI-specific streaming detail, may not survive a round trip.

The canonical tree and the manifest have their own versions, so we take on migrations for saved trees.

## Soundness boundary

Fixtures and the canary prove that the documented cases still translate. They do not prove that every valid upstream document translates, or that two hosts render the same tree identically.

## Threat model

This guards against upstream format churn reaching kbui's core and against lock-in to one vendor. It does not guard against an upstream project dropping a format without warning, or against bugs in a host's own renderer.

## Non-goals

- Owning or proposing a wire format.
- An adapter for a format that no project needs.

## Revisit if

- An adapter repeatedly needs information the canonical tree cannot hold.
- One format becomes the clear standard and is stable at 1.0 or later. Adopting it as the internal model may then cost less than maintaining our own.
- Supporting versions N and N-1 of a format costs more than the projects on the older version are worth.

## Adoption

None yet. `packages/manifest` and the adapters are planned in the [direction spec](../superpowers/specs/2026-10-22-generative-ui-direction.md#planned-packages).

## Validation

- Still to do: round-trip fixtures for `adapter-a2ui-0.9` and `adapter-json-render` (spec, phase 1).
- Still to do: a CI canary job against the upstream schemas.
- Nothing has run yet.

## Links

- [Generative UI direction spec: Staying current as formats change](../superpowers/specs/2026-10-22-generative-ui-direction.md#staying-current-as-formats-change)
- Builds on: [0005](0005-catalog-and-quality-layer-not-runtime.md)
- Related: [0001](0001-framework-free-css-contract.md), whose "Revisit if" covers the iframe case that MCP Apps raises
