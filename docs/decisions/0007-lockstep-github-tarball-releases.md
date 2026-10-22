# 0007. Release all packages together as tarballs on GitHub Releases

## Status

Accepted on 2026-10-22. Partly supersedes [0003](0003-local-path-installs.md): projects that build in CI or deploy install a release, and path installs remain for local work. No release exists yet; the first, `0.1.0`, follows the merge of the change that adds this record.

## Context

[0003](0003-local-path-installs.md) says to revisit path installs when a project needs to build in CI or deploy. kcb.pro is that project: it builds and deploys from GitHub Actions with `bun install --frozen-lockfile` on a clean checkout, where `../kbui` does not exist.

The packages have no dependencies on each other (0003 explains the Bun constraint), so nothing keeps `@kbui/css` and `@kbui/react` in step except their versions. The CSS anatomy and the React markup are one contract: a stylesheet from one commit and components from another can disagree.

Commit subjects already follow Conventional Commits, and the repository is public at `KhallilB/kbui` since 2026-10-22.

## Decision

- **One version for every published package.** `@kbui/tokens`, `@kbui/css` and `@kbui/react` always carry the root version. Private workspaces, such as `apps/storybook`, are not versioned.
- **release-please decides the version.** On every push to `main`, release-please opens or updates a release PR from the conventional commits since the last release. Merging that PR bumps every version, updates `CHANGELOG.md` and creates the tag `v<version>` with a GitHub Release.
- **Tarballs on the Release are the distribution.** When a release is created, the workflow checks out the tag, runs `bun run check` and `bun run test:stories`, packs each published package with `bun pm pack` and uploads the `.tgz` files to the Release. There is no registry.
- **Pre-1.0, a breaking change bumps the minor version** (`bump-minor-pre-major`).
- **The first version is `0.1.0`,** set by a `Release-As: 0.1.0` footer on the commit that adds release-please, so no configuration has to be removed afterwards.

Two tests in `scripts/release.test.ts` enforce the decision: every published package has the root version, and every published package has an `extra-files` entry that release-please bumps. A third check, `bun run test:pack`, confirms each tarball has the asset name consumers install and contains only `package.json`, `README.md` and the package's `files`.

## Options considered

- Lockstep tarballs on GitHub Releases, versioned by release-please: accepted. Consumers get an exact pin with an integrity hash in their lockfile, and there is no account, token or server to maintain.
- Independent versions per package: rejected. Without dependencies between the packages, nothing would stop a project from installing a stylesheet and components that disagree.
- npm or GitHub Packages: rejected for now. Both add an account, a publish token and a registry to keep in sync with the tags. GitHub Packages also needs a token in every consumer's CI, even for public packages.
- Changesets: rejected. It needs a changeset file per change, which duplicates the commit subject in a repository that already writes conventional commits.
- Git dependencies (`github:KhallilB/kbui#v0.1.0`): rejected. `dist/` is not committed, so a git install has no built files.

## Consequences

Projects that use a release receive changes only when they change the URLs, and `CHANGELOG.md` shows breaking changes before they do.

A consumer installs `@kbui/css` and `@kbui/react` from two URLs that must name the same version. Mixed versions are unsupported and nothing detects them in the consumer.

Every commit subject on `main` now affects the next version. A pull request must merge in a way that keeps conventional subjects and footers on `main`: rebase, or squash with a conventional title.

Release PRs are opened with `GITHUB_TOKEN`, so `ci.yml` does not run on them. The release job runs `bun run check` and `bun run test:stories` on the tag before uploading instead.

The GitHub Release exists a few minutes before its tarballs. If the release job fails, the Release has no assets; the fix is a new patch release, not an edit to the old tag.

## Soundness boundary

Verified on 2026-10-22, before the first release: the release tests, the pack check, `actionlint` on the workflow, a frozen install after bumping every version to `0.1.0`, and a temporary project that installed locally packed tarballs, passed `tsc --noEmit` on a file using `Button`, `Dialog` and `Input`, and imported them at runtime. Not verified until the first release runs: release-please opening the PR, the tag, the uploaded assets and an install from the release URLs.

## Threat model

This prevents a project from receiving an unannounced breaking change and lets CI install kbui without access to this machine. It does not detect mixed versions in a consumer, and it does not sign tarballs beyond the integrity hash the consumer's lockfile records.

## Non-goals

- A package registry.
- Independent versions for any published package.
- Automated upgrades in consuming projects.

## Revisit if

- A planned package, such as an adapter tied to a wire-format version, must version independently. It needs a new record before it leaves the lockstep group.
- A consumer needs semver ranges or deduplication across packages, which tarball URLs cannot provide.
- Failed or skipped CI on release PRs causes a broken release; a token that triggers `ci.yml` would then be worth its upkeep.

## Adoption

None yet. kcb.pro is the first planned consumer.

## Validation

- Done: `scripts/release.test.ts` failed before the configuration existed and passes with it.
- Done: `bun run test:pack` failed when a stray `LICENSE` file entered a tarball and when `dist/` was missing.
- Still to do: the first release produces tag `v0.1.0` with three tarballs attached.
- Still to do: a temporary project installs the two `v0.1.0` URLs, then `bun install --frozen-lockfile` and `tsc --noEmit` pass.

## Links

- [Versioning design spec](../superpowers/specs/2026-10-22-kbui-versioning-design.md)
- Partly supersedes: [0003](0003-local-path-installs.md)
- [Using kbui in a project](../guides/using-kbui.md)
- Workflow: [`.github/workflows/release.yml`](../../.github/workflows/release.yml)
