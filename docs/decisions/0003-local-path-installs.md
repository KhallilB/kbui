# 0003. Install kbui by local path instead of from a registry

## Status

Accepted on 2026-10-18. This replaces the original plan in the design spec (2026-10-16), which was to publish to a self-hosted Verdaccio registry and version releases with Changesets.

Partly superseded by [0007](0007-lockstep-github-tarball-releases.md) on 2026-10-22 for remote installs: a project that builds in CI or deploys installs a release tarball. Path installs remain for local work.

## Context

Every project that uses kbui lives on the same machine, under `~/proj`. A registry would add a server, logins, version bumps and a publishing step, all for one developer.

This works only while every build runs on this machine. CI and deploys run elsewhere and cannot see `../kbui`.

## Decision

Projects run `bun add ../kbui/packages/react ../kbui/packages/css` after `bun run build` in kbui. There is no registry, no version number and no changelog; `git log` is the history.

Bun resolves a path package's own dependencies, including development dependencies, from npm. For that reason the three packages do not list each other as dependencies. `@kbui/css` pulls in the tokens at build time through a relative import, and `@kbui/react` imports no CSS.

## Options considered

- Path dependencies: accepted. There is nothing to run or maintain, and because Bun links each built file into the project, a rebuild reaches every project immediately.
- Verdaccio in Docker with Changesets: rejected. It was built and then removed, because it added a server and a release routine for a team of one.
- `bun add link:../kbui/...`: rejected. In Bun, `link:` refers to a package registered with `bun link`, not a folder, so it fails to resolve.
- `file:` dependencies with `workspace:*` between the packages: rejected. Bun looks up `workspace:*` on npm and fails.
- Moving every project into one monorepo: rejected. The projects are separate repositories with their own histories.

## Consequences

A project's CI or hosted build cannot install kbui. This blocks the first deployed product until the decision is revisited.

Projects receive every change as soon as kbui is rebuilt, including breaking changes. Nothing pins a project to a known-good version.

When a build adds new files to `dist/`, such as a new component's types, each project must run `bun install` once to see them.

## Soundness boundary

Verified with a throwaway project and with loupe, a project that uses kbui, both on this machine: install, typecheck, runtime import, picking up a rebuild, and a single copy of React. Not verified on Windows, in CI, or in projects that do not use Bun.

## Threat model

This avoids release overhead and any gap between a published version and the source. It does not protect a project from an unannounced breaking change.

## Non-goals

- Versioned releases.
- Installing from anywhere other than this machine.

## Revisit if

- A project needs to build in CI or deploy. The first is expected when work on Tideline, the first product planned on kbui, starts on 2026-11-02.
- One project needs to stay on an older kbui while others move ahead.

## Adoption

loupe installed `@kbui/react` and `@kbui/css` by path on 2026-10-16.

## Validation

- Done: a throwaway project, tested against the change that became commit 2a5fd82. `bun add` by path worked, `tsc --noEmit` passed on a file using all three components, `Button`, `Dialog`, `Input` and `kb` imported at runtime, and an edit to `dist/index.js` reached the project without reinstalling.
- Done: `bun add` by path in loupe installed both packages under `node_modules/@kbui`.

## Links

- Partly superseded by: [0007](0007-lockstep-github-tarball-releases.md)
- [Using kbui in a project](../guides/using-kbui.md)
- [Design spec: Local consumption](../superpowers/specs/2026-10-16-kbui-design-system-design.md#local-consumption)
