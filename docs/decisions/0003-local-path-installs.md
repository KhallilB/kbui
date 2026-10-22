# 0003. Install kbui by local path instead of from a registry

## Status

Accepted on 2026-10-18. This replaces the original plan in the design spec (2026-10-16), which was to publish to a self-hosted Verdaccio registry and version releases with Changesets.

## Context

Every project that uses kbui lives on the same machine, under `~/proj`. A registry would add a server, logins, version bumps and a publishing step, all for one developer.

This only works while every build happens on this machine. CI and deploys run somewhere else, and they can't see `../kbui`.

## Decision

Projects run `bun add ../kbui/packages/react ../kbui/packages/css` after `bun run build` in kbui. There's no registry, no version numbers and no changelog; `git log` is the history.

Bun looks up a path package's own dependencies on npm, development ones included. Because of that, the three packages don't list each other as dependencies. `@kbui/css` pulls in the tokens at build time through a relative import, and `@kbui/react` doesn't import any CSS.

## Options considered

- We accepted path dependencies. There's nothing to run or maintain, and because Bun links each built file into the project, a rebuild reaches every project immediately.
- Verdaccio in Docker with Changesets was rejected. We built it and then removed it, because it was a server and a release routine for a team of one.
- `bun add link:../kbui/...` was ruled out. In Bun, `link:` refers to a package registered with `bun link`, not a folder, so it fails to resolve.
- `file:` dependencies with `workspace:*` between the packages were rejected. Bun tries to find `workspace:*` on npm and fails.
- Moving every project into one monorepo was rejected. They're separate repositories with their own histories.

## Consequences

A project's CI or hosted build can't install kbui. That blocks the first deployed product until we revisit this.

Projects get every change as soon as kbui is rebuilt, breaking ones included. Nothing pins them to a known-good version.

When a build adds new files to `dist/`, such as a new component's types, each project has to run `bun install` once to see them.

## Soundness boundary

We checked this with a throwaway project and with loupe (one of the projects that uses kbui), both on this machine: install, typecheck, importing at runtime, picking up a rebuild, and ending up with a single copy of React. We haven't checked it on Windows, in CI, or in projects that don't use Bun.

## Threat model

This avoids release overhead and any gap between a published version and the source. It doesn't protect a project from an unannounced breaking change.

## Non-goals

- Versioned releases.
- Installing from anywhere other than this machine.

## Revisit if

- A project needs to build in CI or deploy. We expect the first one when work on Tideline, the first product planned on kbui, starts on 2026-11-02.
- One project needs to stay on an older kbui while the others move ahead.

## Adoption

loupe installed `@kbui/react` and `@kbui/css` by path on 2026-10-16.

## Validation

- Done: a throwaway project, tested against the change that became commit 2a5fd82. `bun add` by path worked, `tsc --noEmit` passed on a file using all three components, `Button`, `Dialog`, `Input` and `kb` imported at runtime, and an edit to `dist/index.js` showed up in the project without reinstalling.
- Done: `bun add` by path in loupe installed both packages under `node_modules/@kbui`.

## Links

- [Using kbui in a project](../guides/using-kbui.md)
- [Design spec: Local consumption](../superpowers/specs/2026-10-16-kbui-design-system-design.md#local-consumption)
