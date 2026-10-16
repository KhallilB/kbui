# kbui Skeleton Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bootstrap the `kbui` design system monorepo: agnostic token and CSS packages, a React adapter with Button/Input/Dialog, Storybook, a Dockerised Verdaccio registry plus docs container, Changesets publishing, generator, and CI.

**Architecture:** Bun workspaces with three publishable packages (`@kbui/tokens` -> `@kbui/css` -> `@kbui/react`) and one private Storybook app. Styling lives entirely in CSS keyed by `kb-` classes and `data-*` attributes (the "anatomy contract"); the React package only maps props to those attributes on top of Base UI primitives. Verdaccio in Docker Compose hosts the packages on the owner's PC.

**Tech Stack:** bun 1.3.11, node 22 (for `changeset publish`), TypeScript 7, React 19, `@base-ui/react` 1.9.0 (exact), Vite 8, Vitest 5, Storybook 10.6, lightningcss, Changesets 3, biome 2.5, lefthook 2, Verdaccio 6, Docker Compose.

**Spec:** `docs/superpowers/specs/2026-10-16-kbui-design-system-design.md`

**Conventions for every task:**
- Work from the worktree root `/Users/khallil/proj/kbui/.claude/worktrees/chore-kbui-skeleton` (referred to as `<root>` below).
- Commits are SSH-signed: always `git commit -S`. Commit message body ends with `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.
- Code comments follow the owner's "caveman" rule: at most one line, state one intent/invariant/constraint, never narrate code.
- Pure-logic packages (`tokens`, `css`, `scripts/`) use `bun test` (zero config). DOM packages (`react`, `storybook`) use Vitest.
- Before writing a component, read the Base UI docs page for that primitive at `https://base-ui.com/react/components/<name>` if any API below does not type-check; Base UI 1.9.0 is the pinned version.

---

## File structure

```
<root>/
  package.json                         workspaces + root scripts
  bunfig.toml                          scoped registry for installs
  .npmrc                               @kbui:registry for npm publish
  mise.toml                            bun 1.3.11, node 22
  tsconfig.base.json                   strict shared compiler options
  biome.json                           lint + format
  lefthook.yml                         pre-commit biome + typecheck
  .gitignore / .dockerignore
  .changeset/config.json               fixed group @kbui/*
  .github/workflows/ci.yml
  README.md
  packages/tokens/
    package.json  tsconfig.json
    tokens.json                        DTCG source of truth
    src/build.ts                       buildTokens(tree) -> { css, ts }
    src/build.test.ts
    scripts/build.ts                   reads tokens.json, writes dist/
  packages/css/
    package.json  tsconfig.json
    src/reset.css
    src/components/button.css input.css dialog.css
    src/styles.css                     tokens + reset + components
    src/build.ts                       buildCss(srcDir, distDir)
    src/build.test.ts                  root classes present, no palette refs
    scripts/build.ts
  packages/react/
    package.json  tsconfig.json  tsconfig.build.json
    vite.config.ts  vitest.config.ts  vitest.setup.ts
    src/utils/kb.ts  src/utils/kb.test.ts
    src/components/Button/Button.tsx .test.tsx .stories.tsx
    src/components/Input/Input.tsx .test.tsx .stories.tsx
    src/components/Dialog/Dialog.tsx .test.tsx .stories.tsx
    src/index.ts
    src/story-coverage.test.ts
  apps/storybook/
    package.json  tsconfig.json  vitest.config.ts
    .storybook/main.ts  preview.tsx  vitest.setup.ts
  docker/
    compose.yml
    verdaccio/config.yaml
    docs/Dockerfile  docs/nginx.conf
  scripts/
    new-component.ts  new-component.test.ts
    registry-backup.sh
  templates/component/
    Name.tsx  Name.test.tsx  Name.stories.tsx  name.css
```

---

### Task 1: Repo scaffold and toolchain

**Files:**
- Create: `package.json`, `bunfig.toml`, `.npmrc`, `mise.toml`, `tsconfig.base.json`, `biome.json`, `lefthook.yml`, `.gitignore`, `.dockerignore`
- Create: `packages/tokens/package.json`, `packages/css/package.json`, `packages/react/package.json`, `apps/storybook/package.json` (minimal, filled in later tasks)

- [ ] **Step 1: Write root manifests**

`package.json`:
```json
{
  "name": "kbui",
  "private": true,
  "packageManager": "bun@1.3.11",
  "workspaces": ["packages/*", "apps/*"],
  "engines": { "bun": ">=1.3.0", "node": ">=22" },
  "scripts": {
    "prepare": "lefthook install",
    "build": "bun run --filter @kbui/tokens build && bun run --filter @kbui/css build && bun run --filter @kbui/react build",
    "test": "bun run --filter './packages/*' test",
    "test:stories": "bun run --filter @kbui/storybook test",
    "typecheck": "bun run --filter '@kbui/*' typecheck",
    "lint": "biome check .",
    "lint:fix": "biome check --write .",
    "check": "bun run build && bun run lint && bun run typecheck && bun run test",
    "storybook": "bun run build && bun run --filter @kbui/storybook dev",
    "changeset": "changeset",
    "version": "changeset version",
    "release": "bun run build && changeset publish",
    "registry:up": "docker compose -f docker/compose.yml up -d registry",
    "registry:down": "docker compose -f docker/compose.yml stop registry",
    "registry:logs": "docker compose -f docker/compose.yml logs -f registry",
    "registry:login": "npm adduser --registry http://localhost:4873 --auth-type=legacy",
    "registry:backup": "sh scripts/registry-backup.sh",
    "registry:nuke": "docker compose -f docker/compose.yml down -v",
    "docs:up": "docker compose -f docker/compose.yml up -d --build docs",
    "docs:down": "docker compose -f docker/compose.yml stop docs",
    "stack:up": "docker compose -f docker/compose.yml up -d --build",
    "stack:down": "docker compose -f docker/compose.yml down",
    "new": "bun scripts/new-component.ts"
  },
  "devDependencies": {}
}
```

`bunfig.toml`:
```toml
[install.scopes]
"@kbui" = { url = "http://localhost:4873" }
```

`.npmrc`:
```
@kbui:registry=http://localhost:4873
```

`mise.toml`:
```toml
[tools]
bun = "1.3.11"
node = "22"
```

`tsconfig.base.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "types": ["bun-types"]
  }
}
```

`biome.json`:
```json
{
  "$schema": "https://biomejs.dev/schemas/2.5.15/schema.json",
  "vcs": { "enabled": true, "clientKind": "git", "useIgnoreFile": true },
  "files": { "includes": ["**", "!**/dist", "!**/storybook-static", "!**/*.snap"] },
  "formatter": { "enabled": true, "indentStyle": "space", "lineWidth": 100 },
  "linter": { "enabled": true, "rules": { "recommended": true } },
  "css": { "formatter": { "enabled": true }, "linter": { "enabled": true } },
  "javascript": { "formatter": { "quoteStyle": "double" } }
}
```

`lefthook.yml` (typecheck job is added in Task 13, once every package has sources; before that `tsc` fails with "No inputs were found"):
```yaml
pre-commit:
  parallel: true
  commands:
    biome:
      glob: "*.{ts,tsx,js,json,css}"
      run: bunx biome check --write {staged_files} && git add {staged_files}
```

`.gitignore`:
```
node_modules/
dist/
storybook-static/
backups/
coverage/
.claude/worktrees/
*.log
.DS_Store
```

`.dockerignore`:
```
node_modules
**/node_modules
**/dist
**/storybook-static
.git
.claude
backups
docs
```

- [ ] **Step 2: Write minimal package manifests**

`packages/tokens/package.json`:
```json
{
  "name": "@kbui/tokens",
  "version": "0.0.0",
  "type": "module",
  "license": "MIT",
  "files": ["dist", "tokens.json"],
  "exports": {
    ".": { "types": "./dist/tokens.d.ts", "default": "./dist/tokens.js" },
    "./tokens.css": "./dist/tokens.css",
    "./tokens.json": "./tokens.json"
  },
  "publishConfig": { "registry": "http://localhost:4873", "access": "public" },
  "scripts": {
    "build": "bun scripts/build.ts",
    "test": "bun test",
    "typecheck": "tsc --noEmit -p tsconfig.json"
  }
}
```

`packages/css/package.json`:
```json
{
  "name": "@kbui/css",
  "version": "0.0.0",
  "type": "module",
  "license": "MIT",
  "files": ["dist"],
  "sideEffects": ["*.css"],
  "exports": {
    "./styles.css": "./dist/styles.css",
    "./reset.css": "./dist/reset.css",
    "./components/*.css": "./dist/components/*.css"
  },
  "publishConfig": { "registry": "http://localhost:4873", "access": "public" },
  "scripts": {
    "build": "bun scripts/build.ts",
    "test": "bun test",
    "typecheck": "tsc --noEmit -p tsconfig.json"
  },
  "dependencies": { "@kbui/tokens": "0.0.0" }
}
```

Internal deps between publishable packages use a concrete version, not `workspace:*`: `changeset publish` calls `npm publish`, which does not rewrite the protocol, and a published `workspace:*` cannot be installed by consumers. Bun still links the local workspace package when versions match, and Changesets' `updateInternalDependencies` keeps the number current on every bump. The private Storybook app may use `workspace:*`.

`packages/react/package.json`:
```json
{
  "name": "@kbui/react",
  "version": "0.0.0",
  "type": "module",
  "license": "MIT",
  "files": ["dist"],
  "sideEffects": false,
  "exports": {
    ".": { "types": "./dist/index.d.ts", "default": "./dist/index.js" }
  },
  "publishConfig": { "registry": "http://localhost:4873", "access": "public" },
  "scripts": {
    "build": "vite build && tsc -p tsconfig.build.json",
    "test": "vitest run",
    "test:watch": "vitest",
    "typecheck": "tsc --noEmit -p tsconfig.json"
  },
  "peerDependencies": { "react": ">=19", "react-dom": ">=19" },
  "dependencies": { "@kbui/css": "0.0.0", "clsx": "^2.1.1" }
}
```

`apps/storybook/package.json`:
```json
{
  "name": "@kbui/storybook",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "storybook dev -p 6006 --no-open --disable-telemetry",
    "build-storybook": "storybook build --quiet --disable-telemetry",
    "test": "vitest run",
    "typecheck": "tsc --noEmit -p tsconfig.json"
  },
  "dependencies": { "@kbui/css": "workspace:*", "@kbui/react": "workspace:*" }
}
```

Each package also gets a `tsconfig.json`:
```json
{
  "extends": "../../tsconfig.base.json",
  "include": ["src", "scripts", "*.ts", "*.tsx", ".storybook"]
}
```
(For `apps/storybook` use `"include": [".storybook", "*.ts"]`.)

- [ ] **Step 3: Install toolchain and root dev deps**

Run from `<root>`:
```bash
mise install
bun add -d typescript@7.0.2 @biomejs/biome@2.5.15 lefthook@2.2.2 @changesets/cli@3.0.3 bun-types
bun install
```
Expected: `bun.lock` created, `lefthook install` ran via `prepare`, no errors.

- [ ] **Step 4: Verify tooling runs**

```bash
bun run lint
bunx tsc --version
```
Expected: biome reports no files or passes; tsc prints `Version 7.0.2`.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -S -m "chore: scaffold bun workspace and toolchain

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 2: `@kbui/tokens` build

**Files:**
- Create: `packages/tokens/tokens.json`, `packages/tokens/src/build.ts`, `packages/tokens/src/build.test.ts`, `packages/tokens/scripts/build.ts`

- [ ] **Step 1: Write the failing test**

`packages/tokens/src/build.test.ts`:
```ts
import { describe, expect, test } from "bun:test";
import { buildTokens, type TokenTree } from "./build";

const tree: TokenTree = {
  blue: { "500": { $type: "color", $value: "#2563eb" } },
  gray: { "950": { $type: "color", $value: "#0a0a0a" } },
  white: { $type: "color", $value: "#ffffff" },
  space: { "4": { $type: "dimension", $value: "1rem" } },
  color: {
    bg: { $type: "color", $value: "{white}", $extensions: { "kb.dark": "{gray.950}" } },
    accent: { $type: "color", $value: "{blue.500}" },
  },
  button: { radius: { $type: "dimension", $value: "0.5rem" } },
};

describe("buildTokens", () => {
  test("emits every token as a --kb var in :root", () => {
    const { css } = buildTokens(tree);
    expect(css).toContain("--kb-blue-500: #2563eb;");
    expect(css).toContain("--kb-white: #ffffff;");
    expect(css).toContain("--kb-space-4: 1rem;");
    expect(css).toContain("--kb-button-radius: 0.5rem;");
  });

  test("resolves aliases to var() references", () => {
    const { css } = buildTokens(tree);
    expect(css).toContain("--kb-color-bg: var(--kb-white);");
    expect(css).toContain("--kb-color-accent: var(--kb-blue-500);");
  });

  test("emits kb.dark values in both dark blocks only", () => {
    const { css } = buildTokens(tree);
    const dark = '[data-theme="dark"] {\n  --kb-color-bg: var(--kb-gray-950);\n}';
    const media =
      '@media (prefers-color-scheme: dark) {\n  :root:not([data-theme="light"]) {\n    --kb-color-bg: var(--kb-gray-950);\n  }\n}';
    expect(css).toContain(dark);
    expect(css).toContain(media);
    expect(css).not.toContain("--kb-color-accent: var(--kb-gray-950)");
  });

  test("emits a typed nested object of var names", () => {
    const { ts } = buildTokens(tree);
    expect(ts).toContain('export const tokens = {');
    expect(ts).toContain('"bg": "--kb-color-bg"');
    expect(ts).toContain("} as const;");
  });

  test("throws on unknown alias", () => {
    expect(() => buildTokens({ a: { $type: "color", $value: "{nope}" } })).toThrow(/nope/);
  });

  test("snapshot of css output", () => {
    expect(buildTokens(tree).css).toMatchSnapshot();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/tokens && bun test`
Expected: FAIL, `Cannot find module "./build"`.

- [ ] **Step 3: Implement `buildTokens`**

`packages/tokens/src/build.ts`:
```ts
export type Token = {
  $type: string;
  $value: string;
  $extensions?: { "kb.dark"?: string };
};
export type TokenTree = { [key: string]: Token | TokenTree };

type Flat = { path: string[]; token: Token };

const isToken = (node: Token | TokenTree): node is Token => typeof node.$value === "string";

function flatten(tree: TokenTree, prefix: string[] = []): Flat[] {
  return Object.entries(tree).flatMap(([key, node]) =>
    isToken(node) ? [{ path: [...prefix, key], token: node }] : flatten(node, [...prefix, key]),
  );
}

const varName = (path: string[]) => `--kb-${path.join("-")}`;

// Alias "{a.b}" becomes var(--kb-a-b); unknown alias is a build error, not a silent raw string.
function resolve(value: string, known: Set<string>): string {
  return value.replace(/\{([^}]+)\}/g, (_, ref: string) => {
    const name = varName(ref.split("."));
    if (!known.has(name)) throw new Error(`Unknown token alias {${ref}}`);
    return `var(${name})`;
  });
}

function block(selector: string, lines: string[], indent = ""): string {
  const body = lines.map((l) => `${indent}  ${l}`).join("\n");
  return `${indent}${selector} {\n${body}\n${indent}}`;
}

function tsTree(flat: Flat[]): string {
  const out: Record<string, unknown> = {};
  for (const { path } of flat) {
    let node = out;
    for (const key of path.slice(0, -1)) {
      node[key] ??= {};
      node = node[key] as Record<string, unknown>;
    }
    node[path.at(-1) as string] = varName(path);
  }
  return `export const tokens = ${JSON.stringify(out, null, 2)} as const;\n`;
}

export function buildTokens(tree: TokenTree): { css: string; ts: string } {
  const flat = flatten(tree);
  const known = new Set(flat.map((f) => varName(f.path)));
  const light = flat.map((f) => `${varName(f.path)}: ${resolve(f.token.$value, known)};`);
  const dark = flat.flatMap((f) => {
    const value = f.token.$extensions?.["kb.dark"];
    return value ? [`${varName(f.path)}: ${resolve(value, known)};`] : [];
  });
  const css = [
    block(":root", light),
    block('[data-theme="dark"]', dark),
    `@media (prefers-color-scheme: dark) {\n${block(':root:not([data-theme="light"])', dark, "  ")}\n}`,
  ].join("\n\n");
  return { css: `${css}\n`, ts: tsTree(flat) };
}
```

- [ ] **Step 4: Run tests, verify pass**

Run: `cd packages/tokens && bun test`
Expected: 6 pass, snapshot written to `src/__snapshots__/build.test.ts.snap`.

- [ ] **Step 5: Write `tokens.json` and the build script**

`packages/tokens/tokens.json`:
```json
{
  "white": { "$type": "color", "$value": "#ffffff" },
  "black": { "$type": "color", "$value": "#000000" },
  "gray": {
    "50": { "$type": "color", "$value": "#fafafa" },
    "100": { "$type": "color", "$value": "#f4f4f5" },
    "200": { "$type": "color", "$value": "#e4e4e7" },
    "300": { "$type": "color", "$value": "#d4d4d8" },
    "400": { "$type": "color", "$value": "#a1a1aa" },
    "500": { "$type": "color", "$value": "#71717a" },
    "600": { "$type": "color", "$value": "#52525b" },
    "700": { "$type": "color", "$value": "#3f3f46" },
    "800": { "$type": "color", "$value": "#27272a" },
    "900": { "$type": "color", "$value": "#18181b" },
    "950": { "$type": "color", "$value": "#09090b" }
  },
  "blue": {
    "400": { "$type": "color", "$value": "#60a5fa" },
    "500": { "$type": "color", "$value": "#3b82f6" },
    "600": { "$type": "color", "$value": "#2563eb" },
    "700": { "$type": "color", "$value": "#1d4ed8" }
  },
  "red": {
    "400": { "$type": "color", "$value": "#f87171" },
    "500": { "$type": "color", "$value": "#ef4444" },
    "600": { "$type": "color", "$value": "#dc2626" }
  },
  "space": {
    "1": { "$type": "dimension", "$value": "0.25rem" },
    "2": { "$type": "dimension", "$value": "0.5rem" },
    "3": { "$type": "dimension", "$value": "0.75rem" },
    "4": { "$type": "dimension", "$value": "1rem" },
    "5": { "$type": "dimension", "$value": "1.25rem" },
    "6": { "$type": "dimension", "$value": "1.5rem" },
    "8": { "$type": "dimension", "$value": "2rem" }
  },
  "radius": {
    "sm": { "$type": "dimension", "$value": "0.25rem" },
    "md": { "$type": "dimension", "$value": "0.5rem" },
    "lg": { "$type": "dimension", "$value": "0.75rem" },
    "full": { "$type": "dimension", "$value": "9999px" }
  },
  "font": {
    "sans": { "$type": "fontFamily", "$value": "system-ui, -apple-system, 'Segoe UI', sans-serif" },
    "mono": { "$type": "fontFamily", "$value": "ui-monospace, SFMono-Regular, Menlo, monospace" }
  },
  "size": {
    "sm": { "$type": "dimension", "$value": "0.875rem" },
    "md": { "$type": "dimension", "$value": "1rem" },
    "lg": { "$type": "dimension", "$value": "1.125rem" }
  },
  "color": {
    "bg": { "$type": "color", "$value": "{white}", "$extensions": { "kb.dark": "{gray.950}" } },
    "fg": { "$type": "color", "$value": "{gray.900}", "$extensions": { "kb.dark": "{gray.50}" } },
    "muted": { "$type": "color", "$value": "{gray.500}", "$extensions": { "kb.dark": "{gray.400}" } },
    "surface": { "$type": "color", "$value": "{gray.50}", "$extensions": { "kb.dark": "{gray.900}" } },
    "border": { "$type": "color", "$value": "{gray.200}", "$extensions": { "kb.dark": "{gray.800}" } },
    "accent": { "$type": "color", "$value": "{blue.600}", "$extensions": { "kb.dark": "{blue.500}" } },
    "accent-hover": { "$type": "color", "$value": "{blue.700}", "$extensions": { "kb.dark": "{blue.400}" } },
    "accent-fg": { "$type": "color", "$value": "{white}" },
    "danger": { "$type": "color", "$value": "{red.600}", "$extensions": { "kb.dark": "{red.500}" } },
    "danger-hover": { "$type": "color", "$value": "{red.500}", "$extensions": { "kb.dark": "{red.400}" } },
    "danger-fg": { "$type": "color", "$value": "{white}" },
    "ring": { "$type": "color", "$value": "{blue.500}", "$extensions": { "kb.dark": "{blue.400}" } },
    "overlay": { "$type": "color", "$value": "rgb(0 0 0 / 0.5)", "$extensions": { "kb.dark": "rgb(0 0 0 / 0.7)" } }
  },
  "button": {
    "radius": { "$type": "dimension", "$value": "{radius.md}" }
  },
  "input": {
    "radius": { "$type": "dimension", "$value": "{radius.md}" },
    "height": {
      "sm": { "$type": "dimension", "$value": "2rem" },
      "md": { "$type": "dimension", "$value": "2.5rem" },
      "lg": { "$type": "dimension", "$value": "3rem" }
    }
  },
  "dialog": {
    "radius": { "$type": "dimension", "$value": "{radius.lg}" },
    "width": { "$type": "dimension", "$value": "28rem" }
  }
}
```

`packages/tokens/scripts/build.ts`:
```ts
import { mkdir, writeFile } from "node:fs/promises";
import { buildTokens, type TokenTree } from "../src/build";
import tree from "../tokens.json";

const dist = new URL("../dist/", import.meta.url);
await mkdir(dist, { recursive: true });
const { css, ts } = buildTokens(tree as TokenTree);
await writeFile(new URL("tokens.css", dist), css);
await writeFile(new URL("tokens.ts", dist), ts);
// Ship the .ts verbatim as .js + .d.ts: it is a pure const object, no transform needed.
await writeFile(new URL("tokens.js", dist), ts.replace(" as const;", ";"));
await writeFile(new URL("tokens.d.ts", dist), ts.replace("export const tokens =", "export declare const tokens:").replace(" as const;", ";"));
console.log("tokens: built dist/tokens.{css,js,d.ts}");
```

Note: `tokens.d.ts` produced by string replacement yields `export declare const tokens: { ... };` where the object literal doubles as a type literal of string literals. That is valid TypeScript for this shape.

- [ ] **Step 6: Build and verify output**

Run: `cd packages/tokens && bun run build && head -5 dist/tokens.css && bun run typecheck`
Expected: `:root {` then `--kb-white: #ffffff;` lines; typecheck clean.

- [ ] **Step 7: Commit**

```bash
git add packages/tokens
git commit -S -m "feat(tokens): add DTCG token source and css/ts build

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 3: `@kbui/css` stylesheets and build

**Files:**
- Create: `packages/css/src/reset.css`, `src/components/button.css`, `src/components/input.css`, `src/components/dialog.css`, `src/styles.css`, `src/build.ts`, `src/build.test.ts`, `scripts/build.ts`

- [ ] **Step 1: Write the failing test**

`packages/css/src/build.test.ts`:
```ts
import { beforeAll, describe, expect, test } from "bun:test";
import { mkdtemp, readFile, readdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { anatomyRoots, buildCss, paletteRefs } from "./build";

const src = new URL("./", import.meta.url).pathname;
let dist: string;

beforeAll(async () => {
  dist = await mkdtemp(join(tmpdir(), "kbui-css-"));
  await buildCss(src, dist);
});

describe("buildCss", () => {
  test("bundles tokens, reset and every component into styles.css", async () => {
    const css = await readFile(join(dist, "styles.css"), "utf8");
    expect(css).toContain("--kb-color-bg:");
    expect(css).toContain(".kb-sr-only");
    for (const root of await anatomyRoots(src)) expect(css).toContain(root);
  });

  test("emits standalone reset and component files", async () => {
    expect(await readdir(dist)).toContain("reset.css");
    expect(await readdir(join(dist, "components"))).toEqual(
      expect.arrayContaining(["button.css", "input.css", "dialog.css"]),
    );
  });

  test("every component file declares an anatomy root", async () => {
    const roots = await anatomyRoots(src);
    expect(roots).toEqual(expect.arrayContaining([".kb-button", ".kb-input", ".kb-dialog-popup"]));
  });

  test("component css never references a palette primitive", async () => {
    expect(await paletteRefs(src)).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/css && bun test`
Expected: FAIL, `Cannot find module "./build"`.

- [ ] **Step 3: Add lightningcss and implement build**

```bash
cd packages/css && bun add -d lightningcss@1.33.0
```

`packages/css/src/build.ts`:
```ts
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { bundle, transform } from "lightningcss";

const PALETTE = /var\(--kb-(?:gray|blue|red|white|black)(?:-\d+)?\)/g;

export async function componentFiles(src: string): Promise<string[]> {
  const dir = join(src, "components");
  return (await readdir(dir)).filter((f) => f.endsWith(".css")).map((f) => join(dir, f));
}

// First comment line is the contract: "/* Anatomy: .kb-x [data-...] > .kb-x-part */".
export async function anatomyRoots(src: string): Promise<string[]> {
  const roots: string[] = [];
  for (const file of await componentFiles(src)) {
    const first = (await readFile(file, "utf8")).split("\n")[0] ?? "";
    const m = first.match(/^\/\* Anatomy: (\.kb-[a-z-]+)/);
    if (!m) throw new Error(`${file}: first line must be an Anatomy comment`);
    roots.push(m[1] as string);
  }
  return roots;
}

export async function paletteRefs(src: string): Promise<string[]> {
  const hits: string[] = [];
  for (const file of await componentFiles(src)) {
    const css = await readFile(file, "utf8");
    for (const m of css.matchAll(PALETTE)) hits.push(`${file}: ${m[0]}`);
  }
  return hits;
}

export async function buildCss(src: string, dist: string): Promise<void> {
  await mkdir(join(dist, "components"), { recursive: true });
  const bundled = bundle({ filename: join(src, "styles.css"), minify: true });
  await writeFile(join(dist, "styles.css"), bundled.code);
  const single = async (from: string, to: string) => {
    const code = await readFile(from);
    const out = transform({ filename: from, code, minify: true });
    await writeFile(to, out.code);
  };
  await single(join(src, "reset.css"), join(dist, "reset.css"));
  for (const file of await componentFiles(src)) {
    await single(file, join(dist, "components", file.split("/").pop() as string));
  }
}
```

`packages/css/scripts/build.ts`:
```ts
import { buildCss } from "../src/build";

const src = new URL("../src/", import.meta.url).pathname;
const dist = new URL("../dist/", import.meta.url).pathname;
await buildCss(src, dist);
console.log("css: built dist/styles.css");
```

- [ ] **Step 4: Write the stylesheets**

`packages/css/src/styles.css`:
```css
@import "../../tokens/dist/tokens.css";
@import "./reset.css";
@import "./components/button.css";
@import "./components/input.css";
@import "./components/dialog.css";
```

`packages/css/src/reset.css`:
```css
/* Minimal reset: box model, font inheritance, screen-reader-only helper. */
*,
*::before,
*::after {
  box-sizing: border-box;
}

html {
  font-family: var(--kb-font-sans);
  color: var(--kb-color-fg);
  background: var(--kb-color-bg);
  -webkit-text-size-adjust: 100%;
}

body {
  margin: 0;
}

button,
input,
select,
textarea {
  font: inherit;
  color: inherit;
}

.kb-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

`packages/css/src/components/button.css`:
```css
/* Anatomy: .kb-button [data-variant=primary|secondary|ghost|danger] [data-size=sm|md|lg] [data-disabled] */
.kb-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--kb-space-2);
  border: 1px solid transparent;
  border-radius: var(--kb-button-radius);
  font-weight: 500;
  line-height: 1;
  cursor: pointer;
  text-decoration: none;
  transition: background-color 120ms ease, border-color 120ms ease, color 120ms ease;
}

.kb-button:focus-visible {
  outline: 2px solid var(--kb-color-ring);
  outline-offset: 2px;
}

.kb-button[data-size="sm"] {
  height: 2rem;
  padding: 0 var(--kb-space-3);
  font-size: var(--kb-size-sm);
}

.kb-button[data-size="md"] {
  height: 2.5rem;
  padding: 0 var(--kb-space-4);
  font-size: var(--kb-size-md);
}

.kb-button[data-size="lg"] {
  height: 3rem;
  padding: 0 var(--kb-space-5);
  font-size: var(--kb-size-lg);
}

.kb-button[data-variant="primary"] {
  background: var(--kb-color-accent);
  color: var(--kb-color-accent-fg);
}

.kb-button[data-variant="primary"]:hover {
  background: var(--kb-color-accent-hover);
}

.kb-button[data-variant="secondary"] {
  background: var(--kb-color-surface);
  border-color: var(--kb-color-border);
  color: var(--kb-color-fg);
}

.kb-button[data-variant="secondary"]:hover {
  border-color: var(--kb-color-muted);
}

.kb-button[data-variant="ghost"] {
  background: transparent;
  color: var(--kb-color-fg);
}

.kb-button[data-variant="ghost"]:hover {
  background: var(--kb-color-surface);
}

.kb-button[data-variant="danger"] {
  background: var(--kb-color-danger);
  color: var(--kb-color-danger-fg);
}

.kb-button[data-variant="danger"]:hover {
  background: var(--kb-color-danger-hover);
}

.kb-button[data-disabled] {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}
```

`packages/css/src/components/input.css`:
```css
/* Anatomy: .kb-input [data-size=sm|md|lg] [data-invalid] [data-disabled] > .kb-input-label, .kb-input-control, .kb-input-description, .kb-input-error */
.kb-input {
  display: flex;
  flex-direction: column;
  gap: var(--kb-space-1);
}

.kb-input-label {
  font-size: var(--kb-size-sm);
  font-weight: 500;
  color: var(--kb-color-fg);
}

.kb-input-control {
  width: 100%;
  padding: 0 var(--kb-space-3);
  border: 1px solid var(--kb-color-border);
  border-radius: var(--kb-input-radius);
  background: var(--kb-color-bg);
  color: var(--kb-color-fg);
  font-size: var(--kb-size-md);
}

.kb-input-control::placeholder {
  color: var(--kb-color-muted);
}

.kb-input-control:focus-visible {
  outline: 2px solid var(--kb-color-ring);
  outline-offset: 0;
  border-color: var(--kb-color-ring);
}

.kb-input[data-size="sm"] .kb-input-control {
  height: var(--kb-input-height-sm);
  font-size: var(--kb-size-sm);
}

.kb-input[data-size="md"] .kb-input-control {
  height: var(--kb-input-height-md);
}

.kb-input[data-size="lg"] .kb-input-control {
  height: var(--kb-input-height-lg);
  font-size: var(--kb-size-lg);
}

.kb-input[data-invalid] .kb-input-control {
  border-color: var(--kb-color-danger);
}

.kb-input[data-disabled] {
  opacity: 0.5;
}

.kb-input[data-disabled] .kb-input-control {
  cursor: not-allowed;
}

.kb-input-description {
  font-size: var(--kb-size-sm);
  color: var(--kb-color-muted);
}

.kb-input-error {
  font-size: var(--kb-size-sm);
  color: var(--kb-color-danger);
}
```

`packages/css/src/components/dialog.css`:
```css
/* Anatomy: .kb-dialog-popup [data-open] > .kb-dialog-title, .kb-dialog-description, .kb-dialog-body; sibling .kb-dialog-backdrop [data-open] */
.kb-dialog-backdrop {
  position: fixed;
  inset: 0;
  background: var(--kb-color-overlay);
  opacity: 0;
  transition: opacity 150ms ease;
}

.kb-dialog-backdrop[data-open] {
  opacity: 1;
}

.kb-dialog-popup {
  position: fixed;
  top: 50%;
  left: 50%;
  width: min(var(--kb-dialog-width), calc(100vw - var(--kb-space-8)));
  max-height: calc(100vh - var(--kb-space-8));
  overflow: auto;
  padding: var(--kb-space-6);
  border: 1px solid var(--kb-color-border);
  border-radius: var(--kb-dialog-radius);
  background: var(--kb-color-bg);
  color: var(--kb-color-fg);
  transform: translate(-50%, -50%) scale(0.96);
  opacity: 0;
  transition: opacity 150ms ease, transform 150ms ease;
}

.kb-dialog-popup[data-open] {
  transform: translate(-50%, -50%) scale(1);
  opacity: 1;
}

.kb-dialog-popup:focus-visible {
  outline: none;
}

.kb-dialog-title {
  margin: 0 0 var(--kb-space-2);
  font-size: var(--kb-size-lg);
  font-weight: 600;
}

.kb-dialog-description {
  margin: 0 0 var(--kb-space-4);
  color: var(--kb-color-muted);
}

.kb-dialog-body {
  display: flex;
  flex-wrap: wrap;
  gap: var(--kb-space-2);
  justify-content: flex-end;
}
```

- [ ] **Step 5: Build tokens first, then run css tests**

Run: `cd packages/tokens && bun run build && cd ../css && bun test && bun run build && bun run typecheck`
Expected: 4 pass; `dist/styles.css` exists, minified, starts with `:root{--kb-white:#fff`.

- [ ] **Step 6: Commit**

```bash
git add packages/css
git commit -S -m "feat(css): add reset, button, input, dialog stylesheets and bundler

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 4: `@kbui/react` scaffold and `kb()` helper

**Files:**
- Create: `packages/react/vite.config.ts`, `vitest.config.ts`, `vitest.setup.ts`, `tsconfig.build.json`, `src/utils/kb.ts`, `src/utils/kb.test.ts`, `src/index.ts`

- [ ] **Step 1: Install dependencies**

```bash
cd packages/react
bun add @base-ui/react@1.9.0 --exact
bun add -d react react-dom @types/react @types/react-dom @types/node vite @vitejs/plugin-react vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event @storybook/react-vite@10.6.2
```

- [ ] **Step 2: Write configs**

`packages/react/vite.config.ts`:
```ts
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  build: {
    lib: { entry: "src/index.ts", formats: ["es"], fileName: () => "index.js" },
    sourcemap: true,
    rollupOptions: {
      external: [/^react($|\/)/, /^react-dom($|\/)/, /^@base-ui\/react/, "clsx"],
    },
  },
});
```

`packages/react/vitest.config.ts`:
```ts
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
```

`packages/react/vitest.setup.ts`:
```ts
import "@testing-library/jest-dom/vitest";
```

`packages/react/tsconfig.json`:
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": { "types": ["node", "vitest/globals"] },
  "include": ["src", "*.ts"]
}
```

jest-dom matcher types come from the `@testing-library/jest-dom/vitest` import in `vitest.setup.ts`, which `include` covers; listing the package under `types` drags in `jest` types that are not installed.

`packages/react/tsconfig.build.json`:
```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "declaration": true,
    "emitDeclarationOnly": true,
    "outDir": "dist",
    "rootDir": "src",
    "noEmit": false
  },
  "include": ["src"],
  "exclude": ["src/**/*.test.*", "src/**/*.stories.*"]
}
```

- [ ] **Step 3: Write the failing test for `kb()`**

`packages/react/src/utils/kb.test.ts`:
```ts
import { describe, expect, test } from "vitest";
import { kb } from "./kb";

describe("kb", () => {
  test("prefixes the class and maps attrs to data-*", () => {
    expect(kb("button", { variant: "primary", size: "md" })).toEqual({
      className: "kb-button",
      "data-variant": "primary",
      "data-size": "md",
    });
  });

  test("drops undefined and false, renders true as empty attribute", () => {
    expect(kb("x", { a: undefined, b: false, c: true })).toEqual({ className: "kb-x", "data-c": "" });
  });

  test("appends consumer className", () => {
    expect(kb("x", {}, "mine").className).toBe("kb-x mine");
  });
});
```

- [ ] **Step 4: Run test to verify it fails**

Run: `cd packages/react && bun run test`
Expected: FAIL, cannot resolve `./kb`.

- [ ] **Step 5: Implement `kb()`**

`packages/react/src/utils/kb.ts`:
```ts
import { clsx } from "clsx";

export type KbAttrs = Record<string, string | boolean | undefined>;
export type KbProps = { className: string } & Record<`data-${string}`, string>;

// false/undefined vanish so data-disabled="false" can never leak into the DOM.
export function kb(name: string, attrs: KbAttrs = {}, className?: string): KbProps {
  const out: KbProps = { className: clsx(`kb-${name}`, className) };
  for (const [key, value] of Object.entries(attrs)) {
    if (value === undefined || value === false) continue;
    out[`data-${key}`] = value === true ? "" : value;
  }
  return out;
}
```

`packages/react/src/index.ts` (placeholder until components exist):
```ts
export { kb } from "./utils/kb";
```

- [ ] **Step 6: Run test and build**

Run: `cd packages/react && bun run test && bun run build && ls dist`
Expected: 3 pass; `dist/index.js`, `dist/index.d.ts`, `dist/utils/kb.d.ts`.

`rootDir: src` places `index.d.ts` at `dist/index.d.ts`, matching the `types` path in `package.json`.

- [ ] **Step 7: Commit**

```bash
git add packages/react
git commit -S -m "feat(react): scaffold package with kb() attribute helper

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 5: Button

**Files:**
- Create: `packages/react/src/components/Button/Button.tsx`, `Button.test.tsx`, `Button.stories.tsx`
- Modify: `packages/react/src/index.ts`

- [ ] **Step 1: Write the failing test**

`packages/react/src/components/Button/Button.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import { Button } from "./Button";

describe("Button", () => {
  test("renders a button with default variant and size", () => {
    render(<Button>Save</Button>);
    const btn = screen.getByRole("button", { name: "Save" });
    expect(btn).toHaveClass("kb-button");
    expect(btn).toHaveAttribute("data-variant", "primary");
    expect(btn).toHaveAttribute("data-size", "md");
  });

  test("applies variant, size and extra className", () => {
    render(
      <Button variant="ghost" size="sm" className="extra">
        X
      </Button>,
    );
    const btn = screen.getByRole("button");
    expect(btn).toHaveAttribute("data-variant", "ghost");
    expect(btn).toHaveAttribute("data-size", "sm");
    expect(btn).toHaveClass("kb-button", "extra");
  });

  test("fires onClick and passes native attributes", async () => {
    const onClick = vi.fn();
    render(
      <Button type="submit" onClick={onClick}>
        Go
      </Button>,
    );
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledOnce();
    expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
  });

  test("disabled sets data-disabled and blocks clicks", async () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        No
      </Button>,
    );
    const btn = screen.getByRole("button");
    expect(btn).toHaveAttribute("data-disabled");
    await userEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  test("render prop swaps the element", () => {
    // biome-ignore lint/a11y/useAnchorContent: Base UI render injects children
    render(<Button render={<a href="/docs" />} nativeButton={false}>Docs</Button>);
    const link = screen.getByRole("link", { name: "Docs" });
    expect(link).toHaveAttribute("href", "/docs");
    expect(link).toHaveClass("kb-button");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/react && bun run test -- Button`
Expected: FAIL, cannot resolve `./Button`.

- [ ] **Step 3: Implement Button**

`packages/react/src/components/Button/Button.tsx`:
```tsx
import { Button as Base } from "@base-ui/react/button";
import { kb } from "../../utils/kb";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = Omit<Base.Props, "className"> & {
  /** Plain class string; Base UI's function form is not supported. */
  className?: string;
  /** Visual weight. */
  variant?: ButtonVariant;
  /** Height and padding scale. */
  size?: ButtonSize;
};

export function Button({ variant = "primary", size = "md", className, ...props }: ButtonProps) {
  return <Base {...kb("button", { variant, size }, className)} {...props} />;
}
```

`Omit<..., "className">` is required: Base UI types `className` as `string | ((state) => string)`, and `kb()` takes a string. When rendering a non-button element via `render`, pass `nativeButton={false}` (Base UI prop) so it does not assume a native `<button>`.

Update `packages/react/src/index.ts`:
```ts
export { Button, type ButtonProps, type ButtonSize, type ButtonVariant } from "./components/Button/Button";
export { kb } from "./utils/kb";
```

- [ ] **Step 4: Run tests, verify pass**

Run: `cd packages/react && bun run test`
Expected: all pass (8 total).

- [ ] **Step 5: Write the story**

`packages/react/src/components/Button/Button.stories.tsx`:
```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "./Button";

const meta = {
  title: "Components/Button",
  component: Button,
  tags: ["autodocs"],
  args: { children: "Button" },
  argTypes: {
    variant: { control: "select", options: ["primary", "secondary", "ghost", "danger"] },
    size: { control: "select", options: ["sm", "md", "lg"] },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
export const Secondary: Story = { args: { variant: "secondary" } };
export const Ghost: Story = { args: { variant: "ghost" } };
export const Danger: Story = { args: { variant: "danger" } };
export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <Button {...args} size="sm">Small</Button>
      <Button {...args} size="md">Medium</Button>
      <Button {...args} size="lg">Large</Button>
    </div>
  ),
};
export const Disabled: Story = { args: { disabled: true } };
export const AsLink: Story = {
  // biome-ignore lint/a11y/useAnchorContent: Base UI render injects children
  args: { render: <a href="#docs" />, nativeButton: false, children: "Link" },
};
```

- [ ] **Step 6: Typecheck and commit**

Run: `cd packages/react && bun run typecheck`
Expected: clean.

```bash
git add packages/react
git commit -S -m "feat(react): add Button

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 6: Input

**Files:**
- Create: `packages/react/src/components/Input/Input.tsx`, `Input.test.tsx`, `Input.stories.tsx`
- Modify: `packages/react/src/index.ts`

- [ ] **Step 1: Write the failing test**

`packages/react/src/components/Input/Input.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { Input } from "./Input";

describe("Input", () => {
  test("labels the control and applies anatomy classes", () => {
    const { container } = render(<Input label="Email" />);
    const input = screen.getByLabelText("Email");
    expect(input).toHaveClass("kb-input-control");
    const root = container.querySelector(".kb-input");
    expect(root).toHaveAttribute("data-size", "md");
    expect(container.querySelector(".kb-input-label")).toHaveTextContent("Email");
  });

  test("description is wired via aria-describedby", () => {
    render(<Input label="Name" description="Shown publicly" />);
    expect(screen.getByLabelText("Name")).toHaveAccessibleDescription("Shown publicly");
  });

  test("error sets data-invalid, aria-invalid and describes the control", () => {
    const { container } = render(<Input label="Email" error="Required" />);
    const input = screen.getByLabelText("Email");
    expect(container.querySelector(".kb-input")).toHaveAttribute("data-invalid");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("Required");
    expect(container.querySelector(".kb-input-error")).toHaveTextContent("Required");
  });

  test("visuallyHidden label stays accessible", () => {
    const { container } = render(<Input label="Search" visuallyHidden />);
    expect(screen.getByLabelText("Search")).toBeInTheDocument();
    expect(container.querySelector(".kb-input-label")).toHaveClass("kb-sr-only");
  });

  test("disabled marks the root and the control", () => {
    const { container } = render(<Input label="X" disabled />);
    expect(container.querySelector(".kb-input")).toHaveAttribute("data-disabled");
    expect(screen.getByLabelText("X")).toBeDisabled();
  });

  test("passes native props and size prop wins over native size", () => {
    render(<Input label="Age" type="number" placeholder="0" size="lg" />);
    const input = screen.getByLabelText("Age");
    expect(input).toHaveAttribute("type", "number");
    expect(input).toHaveAttribute("placeholder", "0");
    expect(input).not.toHaveAttribute("size");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/react && bun run test -- Input`
Expected: FAIL, cannot resolve `./Input`.

- [ ] **Step 3: Implement Input**

`packages/react/src/components/Input/Input.tsx`:
```tsx
import { Field } from "@base-ui/react/field";
import { Input as BaseInput } from "@base-ui/react/input";
import { clsx } from "clsx";
import { kb } from "../../utils/kb";

export type InputSize = "sm" | "md" | "lg";

export type InputProps = Omit<BaseInput.Props, "size" | "className"> & {
  /** Plain class string for the root. */
  className?: string;
  /** Visible label; required for accessibility. */
  label: string;
  /** Hide the label visually, keep it for screen readers. */
  visuallyHidden?: boolean;
  /** Helper text under the control. */
  description?: string;
  /** Error message; when set the field is invalid. */
  error?: string;
  /** Control height scale. */
  size?: InputSize;
};

export function Input({
  label,
  visuallyHidden,
  description,
  error,
  size = "md",
  disabled,
  className,
  ...props
}: InputProps) {
  const invalid = Boolean(error);
  return (
    <Field.Root {...kb("input", { size }, className)} invalid={invalid} disabled={Boolean(disabled)}>
      <Field.Label className={clsx("kb-input-label", visuallyHidden && "kb-sr-only")}>
        {label}
      </Field.Label>
      <BaseInput className="kb-input-control" {...props} />
      {description ? (
        <Field.Description className="kb-input-description">{description}</Field.Description>
      ) : null}
      {error ? (
        <Field.Error className="kb-input-error" match>
          {error}
        </Field.Error>
      ) : null}
    </Field.Root>
  );
}
```

Base UI `Field.Root` emits `data-invalid` and `data-disabled` on itself, and wires `aria-describedby` from `Field.Description` / `Field.Error` to the control. If `toHaveAccessibleDescription` fails, inspect the rendered DOM in the test with `screen.debug()`; the fix is usually that `Field.Error` needs `match` (already set) or that `BaseInput` must be inside `Field.Root` (it is).

Update `packages/react/src/index.ts` by adding:
```ts
export { Input, type InputProps, type InputSize } from "./components/Input/Input";
```

- [ ] **Step 4: Run tests, verify pass**

Run: `cd packages/react && bun run test`
Expected: all pass.

- [ ] **Step 5: Write the story**

`packages/react/src/components/Input/Input.stories.tsx`:
```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Input } from "./Input";

const meta = {
  title: "Components/Input",
  component: Input,
  tags: ["autodocs"],
  args: { label: "Email", placeholder: "you@example.com" },
  argTypes: { size: { control: "select", options: ["sm", "md", "lg"] } },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithDescription: Story = { args: { description: "We never share it." } };
export const WithError: Story = { args: { error: "Email is required." } };
export const Disabled: Story = { args: { disabled: true } };
export const HiddenLabel: Story = { args: { label: "Search", visuallyHidden: true, placeholder: "Search" } };
export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: "grid", gap: 16, maxWidth: 320 }}>
      <Input {...args} label="Small" size="sm" />
      <Input {...args} label="Medium" size="md" />
      <Input {...args} label="Large" size="lg" />
    </div>
  ),
};
```

- [ ] **Step 6: Typecheck and commit**

Run: `cd packages/react && bun run typecheck`

```bash
git add packages/react
git commit -S -m "feat(react): add Input

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 7: Dialog

**Files:**
- Create: `packages/react/src/components/Dialog/Dialog.tsx`, `Dialog.test.tsx`, `Dialog.stories.tsx`
- Modify: `packages/react/src/index.ts`

- [ ] **Step 1: Write the failing test**

`packages/react/src/components/Dialog/Dialog.test.tsx`:
```tsx
import { render, screen, waitForElementToBeRemoved } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";
import { Button } from "../Button/Button";
import { Dialog } from "./Dialog";

function Example() {
  return (
    <Dialog>
      <Dialog.Trigger render={<Button />}>Open</Dialog.Trigger>
      <Dialog.Content title="Delete project" description="Cannot be undone.">
        <Dialog.Close render={<Button variant="ghost" />}>Cancel</Dialog.Close>
        <Button variant="danger">Delete</Button>
      </Dialog.Content>
    </Dialog>
  );
}

describe("Dialog", () => {
  test("is closed until the trigger is clicked", async () => {
    render(<Example />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Open" }));
    const dialog = await screen.findByRole("dialog", { name: "Delete project" });
    expect(dialog).toHaveClass("kb-dialog-popup");
    expect(dialog).toHaveAttribute("data-open");
    expect(dialog).toHaveAccessibleDescription("Cannot be undone.");
    expect(document.querySelector(".kb-dialog-backdrop")).toBeInTheDocument();
    expect(document.querySelector(".kb-dialog-body")).toContainElement(
      screen.getByRole("button", { name: "Delete" }),
    );
  });

  test("close button closes it", async () => {
    render(<Example />);
    await userEvent.click(screen.getByRole("button", { name: "Open" }));
    await screen.findByRole("dialog");
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    await waitForElementToBeRemoved(() => screen.queryByRole("dialog"));
  });

  test("escape closes it", async () => {
    render(<Example />);
    await userEvent.click(screen.getByRole("button", { name: "Open" }));
    await screen.findByRole("dialog");
    await userEvent.keyboard("{Escape}");
    await waitForElementToBeRemoved(() => screen.queryByRole("dialog"));
  });

  test("composes Title and Description when props are omitted", async () => {
    render(
      <Dialog defaultOpen>
        <Dialog.Content>
          <Dialog.Title>Custom</Dialog.Title>
          <Dialog.Description>Body</Dialog.Description>
        </Dialog.Content>
      </Dialog>,
    );
    const dialog = await screen.findByRole("dialog", { name: "Custom" });
    expect(dialog.querySelector(".kb-dialog-title")).toHaveTextContent("Custom");
    expect(dialog.querySelector(".kb-dialog-description")).toHaveTextContent("Body");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/react && bun run test -- Dialog`
Expected: FAIL, cannot resolve `./Dialog`.

- [ ] **Step 3: Implement Dialog**

`packages/react/src/components/Dialog/Dialog.tsx`:
```tsx
import { Dialog as Base } from "@base-ui/react/dialog";
import { clsx } from "clsx";
import type { ReactNode } from "react";

export type DialogProps = Base.Root.Props;
export type DialogTriggerProps = Base.Trigger.Props;
export type DialogCloseProps = Base.Close.Props;

export type DialogContentProps = Omit<Base.Popup.Props, "className"> & {
  /** Accessible name; omit and compose Dialog.Title yourself. */
  title?: ReactNode;
  /** Accessible description; omit and compose Dialog.Description yourself. */
  description?: ReactNode;
  className?: string;
};

function Root(props: DialogProps) {
  return <Base.Root {...props} />;
}

function Trigger(props: DialogTriggerProps) {
  return <Base.Trigger {...props} />;
}

function Close(props: DialogCloseProps) {
  return <Base.Close {...props} />;
}

function Title({ className, ...props }: Base.Title.Props & { className?: string }) {
  return <Base.Title className={clsx("kb-dialog-title", className)} {...props} />;
}

function Description({ className, ...props }: Base.Description.Props & { className?: string }) {
  return <Base.Description className={clsx("kb-dialog-description", className)} {...props} />;
}

function Content({ title, description, children, className, ...props }: DialogContentProps) {
  return (
    <Base.Portal>
      <Base.Backdrop className="kb-dialog-backdrop" />
      <Base.Popup className={clsx("kb-dialog-popup", className)} {...props}>
        {title ? <Title>{title}</Title> : null}
        {description ? <Description>{description}</Description> : null}
        <div className="kb-dialog-body">{children}</div>
      </Base.Popup>
    </Base.Portal>
  );
}

export const Dialog = Object.assign(Root, { Trigger, Content, Title, Description, Close });
```

Note on the "composes" test: with `title` omitted, `Dialog.Title` placed inside `children` ends up inside `.kb-dialog-body`. That is acceptable for the skeleton; the test only checks presence. Keep the `& { className?: string }` intersections: they narrow Base UI's `string | function` className to the string `clsx` needs.

Update `packages/react/src/index.ts` by adding:
```ts
export {
  Dialog,
  type DialogCloseProps,
  type DialogContentProps,
  type DialogProps,
  type DialogTriggerProps,
} from "./components/Dialog/Dialog";
```

- [ ] **Step 4: Run tests, verify pass**

Run: `cd packages/react && bun run test`
Expected: all pass. If jsdom lacks an API Base UI needs (typically `ResizeObserver`), add to `vitest.setup.ts`:
```ts
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
```

- [ ] **Step 5: Write the story**

`packages/react/src/components/Dialog/Dialog.stories.tsx`:
```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../Button/Button";
import { Dialog } from "./Dialog";

const meta = {
  title: "Components/Dialog",
  component: Dialog,
  tags: ["autodocs"],
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Confirm: Story = {
  render: () => (
    <Dialog>
      <Dialog.Trigger render={<Button variant="danger" />}>Delete project</Dialog.Trigger>
      <Dialog.Content title="Delete project" description="This cannot be undone.">
        <Dialog.Close render={<Button variant="ghost" />}>Cancel</Dialog.Close>
        <Dialog.Close render={<Button variant="danger" />}>Delete</Dialog.Close>
      </Dialog.Content>
    </Dialog>
  ),
};

export const Open: Story = {
  render: () => (
    <Dialog defaultOpen>
      <Dialog.Content title="Already open" description="Rendered open for docs.">
        <Dialog.Close render={<Button />}>Close</Dialog.Close>
      </Dialog.Content>
    </Dialog>
  ),
};

export const CustomLayout: Story = {
  render: () => (
    <Dialog defaultOpen>
      <Dialog.Content>
        <Dialog.Title>Custom title</Dialog.Title>
        <Dialog.Description>Composed parts instead of props.</Dialog.Description>
        <Dialog.Close render={<Button />}>Done</Dialog.Close>
      </Dialog.Content>
    </Dialog>
  ),
};
```

- [ ] **Step 6: Typecheck, build and commit**

Run: `cd packages/react && bun run typecheck && bun run build`
Expected: clean; `dist/index.js` exports `Button`, `Input`, `Dialog`, `kb`.

```bash
git add packages/react
git commit -S -m "feat(react): add Dialog

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 8: Story coverage test

**Files:**
- Create: `packages/react/src/story-coverage.test.ts`

- [ ] **Step 1: Write the test**

```ts
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

const components = join(import.meta.dirname, "components");

describe("story coverage", () => {
  test("every component folder has a story and a test", () => {
    const dirs = readdirSync(components, { withFileTypes: true }).filter((d) => d.isDirectory());
    expect(dirs.length).toBeGreaterThan(0);
    for (const dir of dirs) {
      const base = join(components, dir.name, dir.name);
      expect(existsSync(`${base}.stories.tsx`), `${dir.name} needs a story`).toBe(true);
      expect(existsSync(`${base}.test.tsx`), `${dir.name} needs a test`).toBe(true);
    }
  });
});
```

- [ ] **Step 2: Run and verify it passes**

Run: `cd packages/react && bun run test`
Expected: pass. Then temporarily rename `Button.stories.tsx` and rerun to see it fail, rename back.

- [ ] **Step 3: Commit**

```bash
git add packages/react/src/story-coverage.test.ts
git commit -S -m "test(react): enforce story and test per component

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 9: Storybook app

**Files:**
- Create: `apps/storybook/.storybook/main.ts`, `.storybook/preview.tsx`, `.storybook/vitest.setup.ts`, `apps/storybook/vitest.config.ts`, `apps/storybook/tsconfig.json`

- [ ] **Step 1: Install**

```bash
cd apps/storybook
bun add -d storybook@10.6.2 @storybook/react-vite@10.6.2 @storybook/addon-a11y@10.6.2 @storybook/addon-docs@10.6.2 @storybook/addon-vitest@10.6.2 vitest @vitest/browser-playwright playwright vite @vitejs/plugin-react react react-dom @types/react @types/react-dom
bunx playwright install chromium
```

- [ ] **Step 2: Write configs**

`apps/storybook/.storybook/main.ts`:
```ts
import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  framework: "@storybook/react-vite",
  stories: ["../../../packages/react/src/**/*.stories.tsx"],
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y", "@storybook/addon-vitest"],
};

export default config;
```

`apps/storybook/.storybook/preview.tsx`:
```tsx
import type { Preview } from "@storybook/react-vite";
import "@kbui/css/styles.css";

const preview: Preview = {
  parameters: {
    a11y: { test: "error" },
    controls: { matchers: { color: /(background|color)$/i } },
  },
  globalTypes: {
    theme: {
      description: "Color theme",
      toolbar: { icon: "mirror", items: ["light", "dark"], dynamicTitle: true },
    },
  },
  initialGlobals: { theme: "light" },
  decorators: [
    (Story, { globals }) => {
      document.documentElement.dataset.theme = String(globals.theme ?? "light");
      return <Story />;
    },
  ],
};

export default preview;
```

`apps/storybook/.storybook/vitest.setup.ts`:
```ts
import * as a11yAnnotations from "@storybook/addon-a11y/preview";
import { setProjectAnnotations } from "@storybook/react-vite";
import * as previewAnnotations from "./preview";

setProjectAnnotations([a11yAnnotations, previewAnnotations]);
```

`apps/storybook/vitest.config.ts`:
```ts
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [storybookTest({ configDir: ".storybook" })],
  test: {
    name: "storybook",
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [{ browser: "chromium" }],
    },
    setupFiles: [".storybook/vitest.setup.ts"],
  },
});
```

`apps/storybook/tsconfig.json`:
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": { "types": [] },
  "include": [".storybook", "*.ts"]
}
```

- [ ] **Step 3: Run Storybook once and the story tests**

Run from `<root>`: `bun run build && bun run --filter @kbui/storybook build-storybook`
Expected: `apps/storybook/storybook-static/` produced, no errors.

Run: `bun run test:stories`
Expected: every story passes including a11y. If a story fails axe, fix the CSS or markup; do not downgrade `a11y.test`.

- [ ] **Step 4: Commit**

```bash
git add apps/storybook
git commit -S -m "feat(storybook): add docs app with a11y and story tests

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 10: Changesets

**Files:**
- Create: `.changeset/config.json`, `.changeset/README.md`, `.changeset/initial-release.md`

- [ ] **Step 1: Init and configure**

```bash
bunx changeset init
```

Overwrite `.changeset/config.json`:
```json
{
  "$schema": "https://unpkg.com/@changesets/config@3.0.3/schema.json",
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "fixed": [["@kbui/tokens", "@kbui/css", "@kbui/react"]],
  "access": "public",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": ["@kbui/storybook"]
}
```

The fixed group is listed explicitly so the ignored private app never lands in it. If the `$schema` URL 404s, delete the line; it is editor-only.

`.changeset/initial-release.md`:
```md
---
"@kbui/tokens": minor
"@kbui/css": minor
"@kbui/react": minor
---

Initial skeleton: tokens, css, react Button/Input/Dialog.
```

- [ ] **Step 2: Verify status**

Run: `bunx changeset status`
Expected: lists the three packages at minor bump.

- [ ] **Step 3: Commit**

```bash
git add .changeset
git commit -S -m "chore: configure changesets with fixed @kbui group

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 11: Docker registry and docs

**Files:**
- Create: `docker/compose.yml`, `docker/verdaccio/config.yaml`, `docker/docs/Dockerfile`, `docker/docs/nginx.conf`, `scripts/registry-backup.sh`

- [ ] **Step 1: Write compose and Verdaccio config**

`docker/compose.yml`:
```yaml
services:
  registry:
    image: verdaccio/verdaccio:6
    container_name: kbui-registry
    ports:
      - "4873:4873"
    volumes:
      - ./verdaccio/config.yaml:/verdaccio/conf/config.yaml:ro
      - kbui-registry:/verdaccio/storage
    restart: unless-stopped

  docs:
    build:
      context: ..
      dockerfile: docker/docs/Dockerfile
    container_name: kbui-docs
    ports:
      - "6007:80"
    restart: unless-stopped

volumes:
  kbui-registry:
```

`docker/verdaccio/config.yaml`:
```yaml
storage: /verdaccio/storage/data
plugins: /verdaccio/plugins

web:
  title: kbui registry

auth:
  htpasswd:
    file: /verdaccio/storage/htpasswd
    # Set to -1 after creating the first user with `bun run registry:login`.
    max_users: 1

uplinks:
  npmjs:
    url: https://registry.npmjs.org/

packages:
  "@kbui/*":
    access: $all
    publish: $authenticated
    unpublish: $authenticated
  "**":
    access: $all
    proxy: npmjs

server:
  keepAliveTimeout: 60

listen: 0.0.0.0:4873

log: { type: stdout, format: pretty, level: warn }
```

`docker/docs/Dockerfile`:
```dockerfile
FROM oven/bun:1.3 AS build
WORKDIR /app
COPY package.json bun.lock bunfig.toml ./
COPY packages ./packages
COPY apps ./apps
COPY tsconfig.base.json ./
RUN bun install --frozen-lockfile --ignore-scripts
RUN bun run build && bun run --filter @kbui/storybook build-storybook

FROM nginx:alpine
COPY docker/docs/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/storybook/storybook-static /usr/share/nginx/html
```

`docker/docs/nginx.conf`:
```nginx
server {
  listen 80;
  root /usr/share/nginx/html;
  index index.html;
  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

`scripts/registry-backup.sh`:
```sh
#!/bin/sh
# Tar the registry volume so a dead PC does not take the packages with it.
set -eu
mkdir -p backups
stamp=$(date +%Y%m%d-%H%M%S)
docker run --rm -v kbui-registry:/data -v "$PWD/backups":/out alpine \
  tar czf "/out/kbui-registry-$stamp.tgz" -C /data .
echo "backups/kbui-registry-$stamp.tgz"
```

Note: the `bunfig.toml` `[install.scopes]` entry points installs of `@kbui/*` at Verdaccio; inside the workspace Bun links `@kbui/*` to the local workspace package when the version matches, so the build container never contacts the registry. If `bun install` in Docker (or Task 1 Step 3) tries `localhost:4873` for an internal dep, the fallback is `workspace:*` in `package.json` plus a pre-publish rewrite step in `release`, not a registry tweak.

- [ ] **Step 2: Bring the registry up and create the first user**

```bash
bun run registry:up
sleep 3 && curl -s http://localhost:4873/-/ping
```
Expected: `{}` from ping.

**Owner-run step.** `bun run registry:login` is an interactive prompt (username, password, email) and must be typed by the owner in their own terminal; an agent must not invent credentials. It prints `Logged in on http://localhost:4873/` and writes an auth token to `~/.npmrc`. Afterwards set `max_users: -1` in `docker/verdaccio/config.yaml` and run `docker compose -f docker/compose.yml restart registry`. Step 3 cannot run until this is done; an agent executing this plan stops here and asks.

- [ ] **Step 3: Publish end to end**

```bash
bun run version
bun install
bun run release
for p in tokens css react; do npm view "@kbui/$p" --registry http://localhost:4873 version; done
bunx changeset add --empty
```
Expected: `0.1.0` printed three times. `CHANGELOG.md` files created in each package. The `bun install` after `version` refreshes `bun.lock` with the new workspace versions; without it every later `--frozen-lockfile` install (Docker, CI) fails. The empty changeset keeps CI's `changeset status` green for this branch's own PR, since `version` consumed `initial-release.md`.

Then prove a consumer can install:
```bash
mkdir -p /tmp/kbui-consumer && cd /tmp/kbui-consumer && printf '@kbui:registry=http://localhost:4873\n' > .npmrc && bun init -y >/dev/null && bun add @kbui/react @kbui/css react react-dom && ls node_modules/@kbui && cat node_modules/@kbui/css/dist/styles.css | head -c 200
```
Expected: `css react tokens` directories; CSS content printed. Remove `/tmp/kbui-consumer` afterwards.

- [ ] **Step 4: Build and run docs**

```bash
bun run docs:up
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:6007/
```
Expected: `200`.

- [ ] **Step 5: Commit**

```bash
git add docker scripts/registry-backup.sh packages/*/CHANGELOG.md packages/*/package.json .changeset bun.lock
git commit -S -m "feat: dockerised verdaccio registry and storybook docs; release 0.1.0

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 12: Component generator

**Files:**
- Create: `templates/component/Name.tsx`, `Name.test.tsx`, `Name.stories.tsx`, `name.css`, `scripts/new-component.ts`, `scripts/new-component.test.ts`

- [ ] **Step 1: Write the failing test**

`scripts/new-component.test.ts`:
```ts
import { beforeEach, describe, expect, test } from "bun:test";
import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { newComponent } from "./new-component";

let root: string;

beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), "kbui-gen-"));
  await mkdir(join(root, "packages/react/src/components"), { recursive: true });
  await mkdir(join(root, "packages/css/src/components"), { recursive: true });
  await writeFile(join(root, "packages/react/src/index.ts"), 'export { kb } from "./utils/kb";\n');
  await writeFile(join(root, "packages/css/src/styles.css"), '@import "./reset.css";\n');
});

describe("newComponent", () => {
  test("stamps four files and registers exports", async () => {
    await newComponent("Badge", root);
    const tsx = await readFile(join(root, "packages/react/src/components/Badge/Badge.tsx"), "utf8");
    expect(tsx).toContain("export function Badge(");
    expect(tsx).toContain('kb("badge"');
    expect(await readFile(join(root, "packages/react/src/components/Badge/Badge.test.tsx"), "utf8")).toContain('describe("Badge"');
    expect(await readFile(join(root, "packages/react/src/components/Badge/Badge.stories.tsx"), "utf8")).toContain("Components/Badge");
    const css = await readFile(join(root, "packages/css/src/components/badge.css"), "utf8");
    expect(css.split("\n")[0]).toMatch(/^\/\* Anatomy: \.kb-badge/);
    expect(await readFile(join(root, "packages/react/src/index.ts"), "utf8")).toContain(
      'export { Badge, type BadgeProps } from "./components/Badge/Badge";',
    );
    expect(await readFile(join(root, "packages/css/src/styles.css"), "utf8")).toContain(
      '@import "./components/badge.css";',
    );
  });

  test("refuses to overwrite an existing component", async () => {
    await newComponent("Badge", root);
    await expect(newComponent("Badge", root)).rejects.toThrow(/exists/);
  });

  test("rejects non-PascalCase names", async () => {
    await expect(newComponent("bad-name", root)).rejects.toThrow(/PascalCase/);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test scripts`
Expected: FAIL, cannot resolve `./new-component`.

- [ ] **Step 3: Write templates**

Templates use `__Name__` (PascalCase) and `__name__` (lowercase) placeholders. Plain words would collide with `className` and `NameProps`.

`templates/component/__Name__.tsx`:
```tsx
import type { ComponentProps } from "react";
import { kb } from "../../utils/kb";

export type __Name__Props = ComponentProps<"div"> & {
  /** Visual variant. */
  variant?: "default";
};

export function __Name__({ variant = "default", className, ...props }: __Name__Props) {
  return <div {...kb("__name__", { variant }, className)} {...props} />;
}
```

`templates/component/__Name__.test.tsx`:
```tsx
import { render } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { __Name__ } from "./__Name__";

describe("__Name__", () => {
  test("renders anatomy root with default variant", () => {
    const { container } = render(<__Name__>hi</__Name__>);
    const root = container.querySelector(".kb-__name__");
    expect(root).toHaveAttribute("data-variant", "default");
    expect(root).toHaveTextContent("hi");
  });
});
```

`templates/component/__Name__.stories.tsx`:
```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";
import { __Name__ } from "./__Name__";

const meta = {
  title: "Components/__Name__",
  component: __Name__,
  tags: ["autodocs"],
  args: { children: "__Name__" },
} satisfies Meta<typeof __Name__>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
```

`templates/component/__name__.css`:
```css
/* Anatomy: .kb-__name__ [data-variant=default] */
.kb-__name__ {
  color: var(--kb-color-fg);
}
```

Add `"!**/templates"` to `biome.json` `files.includes` so the placeholder files are not linted.

- [ ] **Step 4: Implement the generator**

`scripts/new-component.ts`:
```ts
import { access, appendFile, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const templates = new URL("../templates/component/", import.meta.url).pathname;

const exists = (p: string) => access(p).then(() => true, () => false);

export async function newComponent(name: string, root = process.cwd()): Promise<void> {
  if (!/^[A-Z][A-Za-z0-9]*$/.test(name)) throw new Error(`"${name}" must be PascalCase`);
  const lower = name.toLowerCase();
  const reactDir = join(root, "packages/react/src/components", name);
  const cssFile = join(root, "packages/css/src/components", `${lower}.css`);
  if ((await exists(reactDir)) || (await exists(cssFile))) throw new Error(`${name} already exists`);

  await mkdir(reactDir, { recursive: true });
  const fill = (s: string) => s.replaceAll("__Name__", name).replaceAll("__name__", lower);
  for (const file of await readdir(templates)) {
    const body = fill(await readFile(join(templates, file), "utf8"));
    const target = file.endsWith(".css") ? cssFile : join(reactDir, fill(file));
    await writeFile(target, body);
  }
  await appendFile(
    join(root, "packages/react/src/index.ts"),
    `export { ${name}, type ${name}Props } from "./components/${name}/${name}";\n`,
  );
  await appendFile(join(root, "packages/css/src/styles.css"), `@import "./components/${lower}.css";\n`);
}

if (import.meta.main) {
  const name = process.argv[2];
  if (!name) {
    console.error("usage: bun run new <ComponentName>");
    process.exit(1);
  }
  await newComponent(name);
  console.log(`created ${name}: packages/react/src/components/${name}, packages/css/src/components/${name.toLowerCase()}.css`);
}
```

- [ ] **Step 5: Run tests and wire the root script**

Run: `bun test scripts`
Expected: 3 pass.

Change the root `package.json` `test` script to `"bun run --filter './packages/*' test && bun test scripts"`.

- [ ] **Step 6: Smoke the real generator and revert**

```bash
bun run new Badge && cd packages/react && bun run test && bun run typecheck && cd ../.. && git checkout -- packages && rm -rf packages/react/src/components/Badge packages/css/src/components/badge.css
```
Expected: react tests and typecheck pass with the generated Badge included, then tree is clean (`git status` shows only scripts, templates, root package.json, biome.json).

- [ ] **Step 7: Commit**

```bash
git add scripts templates package.json biome.json
git commit -S -m "feat: component generator and templates

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 13: CI, README, final check

**Files:**
- Create: `.github/workflows/ci.yml`, `README.md`

- [ ] **Step 1: CI workflow**

`.github/workflows/ci.yml`:
```yaml
name: ci
on:
  push:
    branches: [main]
  pull_request:

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }
      - uses: jdx/mise-action@v2
      - run: bun install --frozen-lockfile
      - run: bunx playwright install --with-deps chromium
      - run: bun run check
      - run: bun run test:stories
      - if: github.event_name == 'pull_request'
        run: bunx changeset status --since=origin/main
```

`check` already runs `build` first, so CI needs no separate build step.

- [ ] **Step 2: Add the typecheck pre-commit job**

Append to `lefthook.yml` under `commands:`:
```yaml
    typecheck:
      run: bun run typecheck
```

- [ ] **Step 2b: README**

`README.md`:
```md
# kbui

Shared design system. Agnostic tokens and CSS, React adapter on Base UI, published to a local Verdaccio registry.

## Packages

| Package | What |
|---|---|
| `@kbui/tokens` | Design tokens: `tokens.json` source, `tokens.css` vars, typed `tokens` object |
| `@kbui/css` | All styling. `styles.css` bundles tokens, reset, components |
| `@kbui/react` | React 19 components: `Button`, `Input`, `Dialog` |

## Use in a project

```
# .npmrc
@kbui:registry=http://localhost:4873
```

```bash
bun add @kbui/react @kbui/css
```

```tsx
import "@kbui/css/styles.css";
import { Button, Input, Dialog } from "@kbui/react";
```

Set `data-theme="light"` or `"dark"` on `<html>`; without it the system preference applies.

## Develop

```bash
mise install && bun install
bun run storybook        # http://localhost:6006
bun run check            # lint + typecheck + unit tests
bun run test:stories     # story smoke + axe
bun run new Badge        # scaffold a component
```

## Release

```bash
bun run registry:up      # Verdaccio at http://localhost:4873
bun run registry:login   # first time only; then set max_users: -1 in docker/verdaccio/config.yaml
bun changeset            # describe the change
bun run version          # bump + changelog
bun run release          # build + publish
```

`bun run docs:up` serves the built Storybook at http://localhost:6007.
`bun run registry:backup` tars the registry volume into `backups/`.
`bun run registry:nuke` deletes the registry volume. Everything published is gone.

## Adding a framework adapter

Styling lives in `@kbui/css`. Each component stylesheet starts with an `Anatomy:` comment naming its classes and `data-*` attributes. A new adapter renders that markup; nothing in tokens or css changes.
```

- [ ] **Step 3: Full check**

Run from `<root>`: `bun run check && bun run test:stories`
Expected: all green.

- [ ] **Step 4: Commit**

```bash
git add .github README.md lefthook.yml
git commit -S -m "chore: add ci workflow and readme

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

- [ ] **Step 5: Hand back**

Report to the owner: CI's `changeset status --since=origin/main` needs a GitHub remote with `main`, so the first PR stays red on that step until the remote exists; the worktree branch (`git branch --show-current`; the harness named it `worktree-chore-kbui-skeleton`, the owner's convention is `worktree/<slug>`, rename only if asked), commits listed by `git log --oneline main..`, registry and docs containers running, `0.1.0` published. Merging to `main` and creating a GitHub remote are the owner's call.
