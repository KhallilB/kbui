# kbui versioning — lockstep releases as GitHub tarballs

Date: 2026-10-22
Status: approved 2026-10-22 and implemented by [decision 0007](../../decisions/0007-lockstep-github-tarball-releases.md). Waiting on the owner: the Actions setting below and the first release run. Re-checked against `main` at `f89bfd3` on 2026-10-22; differences from the approved draft are listed under [Implementation notes](#implementation-notes).

## Goal

Give kbui real, pinnable versions that a consumer's CI can install. First consumer:
kcb.pro, which builds and deploys from GitHub Actions with `bun install --frozen-lockfile`
on a clean checkout, where `../kbui` does not exist.

This is the revisit that [ADR 0003](../../decisions/0003-local-path-installs.md) names:
"A project needs to build in CI or deploy."

## Non-goals

- npm, GitHub Packages or any registry.
- Independent per-package versions.
- Dependencies between `@kbui/*` packages (still none; ADR 0003's Bun constraint holds).
- Renovate or automated consumer upgrades.
- Running CI on release PRs (see Known limits).

## Decisions

| Topic | Decision | Why |
|---|---|---|
| Granularity | Lockstep: tokens, css, react share one version | css anatomy and react markup are one contract; no internal deps to keep them in step otherwise |
| Tooling | release-please (googleapis/release-please-action@v4) | Commits are already conventional; bot owns bump + CHANGELOG |
| Distribution | `.tgz` per package attached to a GitHub Release | Exact pin with lockfile integrity hash, no registry account |
| Repo | Public `KhallilB/kbui` on GitHub | Tarball URLs must be fetchable by consumer CI without a token |
| Pre-1.0 | `bump-minor-pre-major: true` | Breaking change → minor while `0.x` |
| First version | `0.1.0`, via a `Release-As: 0.1.0` commit footer | One-shot; no config to remove afterwards |
| Local iteration | Path installs (ADR 0003) stay documented | loupe and day-to-day work keep the instant-rebuild loop |

## Release-please configuration

`release-please-config.json`:

```json
{
  "$schema": "https://raw.githubusercontent.com/googleapis/release-please/main/schemas/config.json",
  "release-type": "node",
  "include-component-in-tag": false,
  "bump-minor-pre-major": true,
  "bootstrap-sha": "<main HEAD before the release-please change>",
  "packages": {
    ".": {
      "changelog-path": "CHANGELOG.md",
      "extra-files": [
        { "type": "json", "path": "packages/tokens/package.json", "jsonpath": "$.version" },
        { "type": "json", "path": "packages/css/package.json", "jsonpath": "$.version" },
        { "type": "json", "path": "packages/react/package.json", "jsonpath": "$.version" }
      ]
    }
  }
}
```

`.release-please-manifest.json`: `{ ".": "0.0.0" }`.

- Root `package.json` gains `"version": "0.0.0"`; it stays `private`.
- `apps/storybook` is private and not versioned.
- Tags are `v<version>`. One `CHANGELOG.md` at the root.
- Bumping workspace versions does not stale `bun.lock` for `--frozen-lockfile`
  (checked on a clone, 2026-10-22: all three bumped to 0.1.0, install reported no changes).

## Release workflow

New `.github/workflows/release.yml`, on push to `main`, `permissions: contents: write, pull-requests: write`.

1. `release-please-action` opens or updates the release PR; on merge it creates tag + Release.
2. If `release_created`: checkout the tag, `jdx/mise-action`, `bun install --frozen-lockfile`,
   install Playwright chromium, `bun run check`, `bun run test:stories`.
3. `bun pm pack --destination "$GITHUB_WORKSPACE/release"` in every non-private package under `packages/`.
4. `gh release upload <tag> release/*.tgz`.
5. `install` job, on `ubuntu-latest`, `macos-latest` and `windows-latest`: copy `.github/consumer` out of
   the checkout, `bun add` the react and css release URLs, `bun install --frozen-lockfile`, `tsc`, and
   `bun smoke.ts` for the runtime import.

Asset names (checked with `bun pm pack` on 2026-10-22): `kbui-tokens-<v>.tgz`,
`kbui-css-<v>.tgz`, `kbui-react-<v>.tgz`. Contents: `package.json`, `README.md`, plus each
package's `files` field (`dist/` for all three; tokens also ships `tokens.json`, a public export).

Workflow details:

- Tag checkout uses `ref: ${{ steps.release.outputs.tag_name }}` and `fetch-depth: 0`, as `ci.yml`.
- `gh release upload` runs with `GH_TOKEN: ${{ github.token }}`.

Existing `ci.yml` is unchanged.

## Repo setup and first release order

1. Create public `KhallilB/kbui`, push `main`. Done 2026-10-22.
2. Enable Settings → Actions → General → "Allow GitHub Actions to create and approve pull requests";
   without it `GITHUB_TOKEN` cannot open the release PR.
3. `bootstrap-sha` = `main` HEAD *before* the change that adds release-please.
4. That landing change carries the `Release-As: 0.1.0` footer. History is linear (rebase or
   fast-forward), so the footer reaches `main` intact.

## Consumer contract

```bash
bun add https://github.com/KhallilB/kbui/releases/download/v0.1.0/kbui-react-0.1.0.tgz \
        https://github.com/KhallilB/kbui/releases/download/v0.1.0/kbui-css-0.1.0.tgz
```

- `@kbui/css` bundles tokens, so consumers install css + react only.
- Upgrade = change both URLs to the same new version. Mixed versions are unsupported.
- Breaking changes are visible in `CHANGELOG.md` before the URL is changed.

## Documentation changes

- New `docs/decisions/0007-lockstep-github-tarball-releases.md` (ADR template as 0003; 0005 and
  0006 are the generative UI records).
- 0003 status: "Partly superseded by 0007 for remote installs; path installs remain for local work."
- `docs/decisions/README.md` table row for 0007; 0003 status updated.
- README "Versioning" and "Use in a project" sections; `docs/guides/using-kbui.md`.
- Design spec 2026-10-16 Versioning/Registry rows point at 0007.
- [Generative UI direction](2026-10-22-generative-ui-direction.md) "Risks: Publishing" row: answered
  by 0007 (public repo, tarball releases, no registry). 0005's "Revisit if … kbui stays private"
  no longer holds; note it in 0005's Links, not its decision.

## Fit with the generative UI direction

- Versioned releases are a precondition the direction already assumes: the manifest and canonical
  tree "get their own versions", and planned packages (`manifest`, `lint`, adapters) join the
  lockstep group by adding one `extra-files` entry each; test 2 forces that.
- Planned packages that must version independently (an adapter pinned to a wire-format version)
  need a new record before leaving lockstep.

## Tests (red before green)

Unit tests in `scripts/` (run by root `bun run test`, no build needed):

1. **Lockstep invariant**: every non-private `packages/*/package.json` version, and the `.release-please-manifest.json` version, equals the root version.
2. **Release coverage**: every non-private package under `packages/` has a `json` `extra-files` entry
   with `jsonpath` `$.version` in `release-please-config.json`, and no entry points at a missing file.
   A new package cannot ship un-versioned.

Separate script `test:pack` (needs built `dist/`), appended to root `check` after `build`:

3. **Pack contents**: packing each package yields a tarball named `kbui-<package>-<version>.tgz` that
   contains only `package.json`, `README.md` and paths matched by that package's `files` field, and
   at least one file under `dist/`.

## Acceptance

- `KhallilB/kbui` exists, public, `main` pushed, Actions may open PRs, CI green.
- Merging a commit with `Release-As: 0.1.0` produces release PR → merged → tag `v0.1.0` with
  three tarballs attached.
- On Ubuntu, macOS and Windows, a fresh project installs the two v0.1.0 URLs, then
  `bun install --frozen-lockfile` passes, `tsc --noEmit` passes on a file using `Button`, `Input`,
  `Dialog`, and the runtime import works. The release workflow's `install` job runs this on every
  release.

## Known limits

- Release PRs opened with `GITHUB_TOKEN` do not trigger `ci.yml`. The release job re-runs `check`
  on the tag before uploading. A PAT can fix this later if it matters.
- The Release exists a few minutes before its assets. If the release job fails, assets are
  missing; fix forward with a patch release.

## Implementation notes

Re-checked against `main` at `f89bfd3` on 2026-10-22, when this spec was implemented:

- `bootstrap-sha` is `f89bfd362671759604286214ba198344ad447a7d`.
- The release workflow packs every non-private package instead of a fixed list, so a package added to
  the lockstep group ships without a workflow change. The test in point 2 still requires its
  `extra-files` entry.
- The workflow is split into a `release-please` job and an `assets` job that runs only when a release
  is created. The tag reaches shell steps through an environment variable.
- Re-verified: bumping all four versions to `0.1.0` keeps `bun install --frozen-lockfile` passing.
- Decisions 0008 to 0010 are reserved by the faceted foundation work, so this record stays 0007.
- Added at the owner's request on 2026-10-22: the `install` job (point 5 of the workflow) proves each
  release installs on Windows, macOS and Linux. The tarballs are platform-neutral, so no per-platform
  build exists.
- Added 2026-10-22 after the first runs: GitHub's GraphQL API failed intermittently while release-please
  fetched merge commits (4 of 7 attempts). The release-please job now runs the action twice, first to
  create releases only and then to update the release PR only, and `assets` runs when a release was
  created even if the PR update failed. A plain rerun then recovers either step.
