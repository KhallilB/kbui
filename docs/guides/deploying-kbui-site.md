# Deploy kbui to kbui.kcb.pro

Destination: **https://kbui.kcb.pro/**. A separate Cloudflare Workers Static Assets deployment owns this hostname; the portfolio keeps its current deployment. Landing, setup, catalog, playground, examples and Storybook ship together.

Production and preview Workers were provisioned on 2026-10-26. GitHub environment `kbui-production` has a `main`-only deployment policy and both required secrets. The [CI workflow](../../.github/workflows/ci.yml) owns validation and deployment. Production uses a dedicated custom domain; preview lives at https://kbui-site-preview.khallilbailey.workers.dev/.

## What happens on a push

Every push to `main` runs full validation and deploys after success, including Markdown and executable MDX changes. Main runs are serialized without cancelling an active run. If a newer prose-only push replaces a pending site change, that newer commit still validates and publishes the included site changes. PRs keep changed-file scope so ordinary prose edits do not launch browser tests.

Pull requests run **Check: code**. Runtime and generated API-source changes also run the independent **Test: site**, **Test: stories**, **Test: themes** and **Test: layouts** jobs, followed by **Gate: validation**. See the [current CI guide](../../CONTRIBUTING.md#before-you-push) for their responsibilities. Docs-only PRs compile documentation without browser tests. Linux browser jobs use the pinned Playwright image without reinstalling browsers. On `main`, **Test: site** uploads its tested production package; **Deploy: production** requires successful code, browser and built-site checks, then downloads that exact artifact by its immutable ID from the same run. It does not rebuild or repeat validation. Only the final publish step receives credentials; it uses `cf deploy --prebuilt --mode production`, then checks the public setup page.

Validation includes repository checks, Storybook normal/reduced-motion tests, responsive site tests, complete source fixtures, and Chromium/WebKit release journeys against the root-mounted artifact. Each runner builds its packages sequentially because package rebuilds replace declaration files used by site verification. The browser suites run on independent runners.

Use Actions → CI → Run workflow → `main` for a manual production run. Manual dispatch always runs full validation; dispatching another branch validates it without production publishing. Production artifact names include the commit SHA and run attempt, with 14-day retention. Rerunning a failed deployment reuses the successful producer's artifact ID. A missing or expired artifact fails closed; rerun validation to produce a new checked artifact.

## PR Storybook previews

Same-repository PRs publish Storybook at `https://pr-<number>-kbui-site-preview.khallilbailey.workers.dev`. After a successful upload, CI updates one Actions comment with direct links to stories and MDX docs from changed PR files, plus **Browse all stories** and the deployed commit. Links use the uploaded Storybook index's actual IDs and component paths, so component implementation changes also surface their indexed stories. Generated autodocs duplicates are omitted; large changes show the first 40 matching entries. Shared dependency changes without a direct story/component match keep the browse link. Each stacked PR uses its own base-to-head diff. The **Storybook preview** deployment also provides its **View deployment** link. New commits update that PR's alias; other PR aliases and production traffic stay on their existing versions. Fork PRs run validation without publishing.

Both CI build paths produce `apps/storybook/dist/storybook/`. The browser job uploads its tested files; documentation-only changes upload their existing documentation build. Only the successful path uploads `storybook-<commit SHA>`, retained for three days. The publishing job downloads those files into `deployment/site/public/` and packages them with the pinned Cloudflare CLI. It does not build Storybook again.

Create a GitHub environment named **`kbui-preview`** with these secrets before enabling publishing:

- `CLOUDFLARE_API_TOKEN`: Workers Editor scoped to the existing `kbui-site-preview` Worker. Production's token remains in `kbui-production`.
- `CLOUDFLARE_ACCOUNT_ID`: the account containing that Worker.

Allow PR branch deployments in this environment. The existing preview Worker must remain provisioned and its `workers.dev` subdomain must remain `khallilbailey`; update the workflow URL if the account subdomain changes. No per-PR Worker creation, deletion or zone permissions are needed.

`configure:preview` enables version URLs from the preview configuration, without selecting a new version for live traffic. `upload:preview -- --preview-alias pr-<number>` uploads a version and assigns its PR alias. These commands use the preview Worker with no custom domains or zone routes. Missing credentials fail with setup instructions rather than publishing through production's environment. Closing a PR does not delete the shared Worker or its retained versions.

## One-time setup

1. **Publish the reviewed site changes to GitHub main.** A local merge alone does not start Actions. Use the normal signed commit/PR process; the scratch `worktree/*` branch is not a PR branch.
2. **Check Cloudflare ownership.** In the account hosting `kcb.pro`, confirm `kbui.kcb.pro` has no conflicting DNS record or Worker custom domain. Keep the portfolio’s `kcb.pro` hostname and routes unchanged.
3. **Provision the Workers once.** Use an account with permission to create Workers to provision `kbui-site` and `kbui-site-preview` (or deploy the preview locally as that account). Confirm these names are not already used for another project. Preview has no custom domain or zone routes. Production attaches only `kbui.kcb.pro` through its deployment configuration.
4. **Create the CI token.** Grant Workers Editor in the hosting account, plus Workers Routes Write and Zone Read scoped to `kcb.pro`. Custom Domains currently do not support per-Worker roles, so this token can update existing Workers across that account. It cannot create or delete Workers. Provision Workers separately through local OAuth; grant no KV, R2 or database permissions. The production token expires on 2027-10-26; rotate its GitHub environment secret before then.
5. **Configure GitHub.** Repository Settings → Environments → create `kbui-production`. Restrict deployments to `main`. Add environment secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`. For automatic deployment on every qualifying push, leave required-reviewer approval disabled. Store secrets through GitHub's UI or approved secret tooling, never in tracked files.
6. **Check preview, then run production once.** Follow the local preview steps below. After review, use Actions → CI → Run workflow → `main`. Verify the public pages and portfolio root. Future main pushes validate and deploy automatically. Use this workflow as the publisher; do not also enable an independent Cloudflare Git auto-deploy for the same Worker.

Cloudflare's current [Workers roles](https://developers.cloudflare.com/workers/authorization/workers/) distinguish creating a Worker from updating an existing Worker. Custom Domain support for per-Worker roles would allow tightening the account-level editor scope later.

## Local preview and dry run

Use Node **22.23.0+ within Node 22**, or another version accepted by the pinned deployment package. Run `cf` under Node, not Bun. The isolated `deployment/site/package.json` and npm lock pin the CLI and its static build adapter. That adapter's `wrangler.config.ts` was generated by `cf init`; `cloudflare.config.ts` remains the Worker/routing source of truth. Do not rerun automatic initialization over the site app.

From the repository root (the site worktree before merge):

```sh
bun install --frozen-lockfile
bun run build
bun run --cwd apps/storybook build:site
bun scripts/site-stage.ts
npm ci --prefix deployment/site
npm test --prefix deployment/site
cd deployment/site
npm run build:preview
npx cf deploy --prebuilt --mode preview --dry-run
```

The dry run validates without uploading or making API requests. When ready to publish a preview, authenticate locally with `npx cf auth login` or supply a suitably scoped token through your environment, then run:

```sh
npm run deploy:preview
```

This publishes `kbui-site-preview`, without custom domains or portfolio routes. Open the returned `workers.dev` hostname at **`/`**. For production validation, `npm run build` followed by `npm run check` builds and dry-runs the production target. Production deployment itself is normally handled by GitHub Actions.

## Asset layout and routing

[`scripts/site-stage.ts`](../../scripts/site-stage.ts) validates every page and Storybook entry before replacing staging output. It creates only:

```text
deployment/site/public/
  index.html
  assets/
  setup/index.html
  setup/themes/index.html
  playground/index.html
  examples/index.html
  components/index.html
  components/qa/index.html
  compare/index.html
  changelog/index.html
  storybook/
```

The custom domain serves this artifact at its root. Directory-index handling adds trailing slashes to page URLs. Missing files return 404 rather than a global SPA fallback. Cloudflare manages the custom domain DNS and certificate; no portfolio path rewrite is needed.

The build creates a self-contained `.cloudflare/output/`. CI transfers that entire directory, including hidden files, into the deploy job. Production credentials exist only during the final publish step; they are not part of the artifact. Deployment-tool overrides pin compatible Zod/Undici fixes; review them with CLI upgrades.

References: [Cloudflare CI](https://developers.cloudflare.com/cf/ci/), [custom domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/).

## Verify and recover

At `kbui.kcb.pro`, check `/`, both setup pages, catalog, playground, examples, direct Storybook links, iframe previews, copy feedback, refresh and Back/Forward. Check `https://kcb.pro/` and existing portfolio project URLs separately; local artifact checks cannot prove production route ownership.

The workflow retains built artifacts for 14 days and labels the Cloudflare version with the commit SHA. On a regression, use the `kbui-site` deployment history in Cloudflare to roll back to the previous verified version. Then revert/fix the change before the next automatic push. Do not roll back or reroute the portfolio Worker.

Public Storybook builds exclude Site, Showcase and Validation fixtures. The shared validation script builds those into a separate temporary QA artifact for control-edge browser checks; only public output reaches deployment staging. Local runs can set `SITE_VALIDATION_PORT=4182` if the default 4175/4176 pair is occupied. Both temporary servers and the QA artifact are cleaned up on exit.
