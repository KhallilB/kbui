# 0003. Consumers install kbui by local path, with no registry

## Status

Accepted, 2026-10-18. Supersedes the spec's original plan (2026-10-16) to publish to a self-hosted Verdaccio registry with Changesets versioning.

## Context

Every consumer lives on the same machine as kbui, under `~/proj`. A registry adds a server, logins, version bumps and a publish step for an audience of one. The premise that could fail: that consumers only ever build on this machine. CI and deploys run elsewhere and cannot see `../kbui`.

## Decision

Consumers run `bun add ../kbui/packages/react ../kbui/packages/css` after `bun run build` in kbui. There is no registry, no versioning and no changelog; `git log` is the history. Because Bun resolves a path package's own dependencies, including devDependencies, against npm, the publishable packages declare no dependency on each other: `@kbui/css` bundles tokens at build time by relative import, and `@kbui/react` imports no CSS.

## Options considered

| Option | Verdict |
|---|---|
| Path dependencies | Chosen: zero infrastructure; a rebuild reaches every consumer through symlinked `dist/` files |
| Verdaccio in Docker with Changesets | Rejected: built and then removed; a server and release ritual for one developer |
| `bun add link:../kbui/...` | Rejected: `link:` in Bun names a `bun link` registration, not a path; it fails to resolve |
| `file:` deps with `workspace:*` internal deps | Rejected: Bun looks up `workspace:*` on npm and fails |
| A monorepo containing every consumer | Rejected: the consumers are separate repositories with their own history |

## Consequences

- CI and hosted builds of a consumer cannot install kbui. This blocks the first deployed product until revisited.
- Consumers get every change immediately, including breaking ones; nothing pins them to a known version.
- A new file in `dist/` (a new component's types) needs `bun install` in each consumer.

## Soundness boundary

Verified with one scratch consumer and loupe on this machine: install, typecheck, runtime import, rebuild propagation and a single React copy. Not verified on Windows, in CI, or with consumers that are not Bun projects.

## Threat model

Defends against release overhead and dependency drift between a published version and the source. Does not defend against breaking a consumer with an unannounced change.

## Non-goals

- Versioned releases.
- Installs from outside this machine.

## Revisit if

- A consumer needs to build in CI or deploy. The first is expected with the Tideline phase starting 2026-11-02.
- A consumer must stay on an older kbui while others move on.

## Adoption

loupe installs `@kbui/react` and `@kbui/css` by path (2026-10-16).

## Validation

- Executed: scratch consumer against the change that became commit 2a5fd82: `bun add` by path, `tsc --noEmit` on a file using all three components, runtime import of `Button`, `Dialog`, `Input`, `kb`, and an appended byte in `dist/index.js` visible in the consumer without reinstalling.
- Executed: `bun add` by path in loupe installed both packages under `node_modules/@kbui`.

## Links

- [Using kbui in a project](../guides/using-kbui.md)
- [Design spec: Local consumption](../superpowers/specs/2026-10-16-kbui-design-system-design.md#local-consumption)
