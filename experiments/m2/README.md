# M2 field test

Do catalog-constrained generative UI runtimes still produce the problems kbui's rules target? This experiment generates 60 screens with [json-render](https://github.com/vercel-labs/json-render) and its shadcn catalog, checks them with 13 hand-written rules, and scores the rules against human labels.

It is not part of any published package. Nothing here depends on kbui.

## Method

1. **Prompts.** 30 prompts in [`prompts.json`](prompts.json): 10 commerce, 10 settings, 10 dashboards. The shop prompts follow the neutral, business-goal phrasing of Krauß et al., CHI 2025 ([arXiv:2411.03108](https://arxiv.org/abs/2411.03108)). They state a goal such as "we want more people to sign up" and never ask for a dark pattern. Two dashboard prompts carry 32 and 40 rows so the data rules have something to see.
2. **Generation.** json-render 0.21.3, the full shadcn catalog unchanged, and `catalog.prompt()` as the system prompt. Two models: `claude-sonnet-5-5` through `claude -p`, and `gpt-6.1-sol` at medium reasoning effort through `codex exec`. One run per prompt and model.
3. **Compile.** The stream of JSON patches is compiled with `compileSpecStream`, checked with `validateSpec`, and given json-render's lossless `autoFixSpec` fixes only.
4. **Render.** Each spec is rendered with `@json-render/shadcn` in Chromium through Playwright, at 390, 768 and 1440 px wide. Each render gets an axe scan (WCAG 2.2 A and AA tags), geometry probes (sideways scroll, clipped text, overlapping text and controls) and a full-page screenshot.
5. **Rules.** [`src/rules.ts`](src/rules.ts) holds 13 rules in four families:

   | family | rules |
   |---|---|
   | integrity | INT-1 asks for secrets · INT-2 destructive action without confirmation · INT-3 urgency or scarcity claim · INT-4 pre-selected marketing consent · INT-5 confirmshaming |
   | design | DES-1 more than one primary action per region · DES-2 heading levels out of order |
   | arrangement | ARR-1 nesting deeper than seven · ARR-2 content does not fit · ARR-3 overlap · ARR-4 target under 24 px (axe `target-size`) |
   | data | DATA-1 more than ten rows without pagination · DATA-2 data-bound list with no empty state |

   Tree rules read the spec. ARR-2 to ARR-4 read the rendered page.
6. **Labels.** 50 screens are drawn reproducibly, stratified by category and model. One person labels them on a page that hides the model and all rule output. Precision and recall per rule come from those labels.

## Run it

```bash
bun install --frozen-lockfile
bun run report    # rebuilds report.md and gallery.html from the frozen results; no model call, no browser
```

The other steps, in order:

```bash
bun run generate -- --study <id> --scratch <empty dir> --codex-home <dir>   # calls the models
bun run measure                                                              # needs `bunx playwright install chromium`
bun run label                                                                # serves the labelling page at http://127.0.0.1:4319/
bun test src
```

`bun run label` shows one screen at a time: screenshots at each width, the spec outline beside them, and the 13 questions with keyboard shortcuts (Y, N, U, arrows, 1 to 4, O). Answers save to `labels.json` as you go. The same page also opens from `labelling.html` without the server; it then saves in the browser and exports by hand.

`generate` skips captures that already exist, so a failed run can be resumed. `--codex-home` points at a directory that holds only `auth.json`, which keeps personal Codex instructions out of the prompt.

## Results

`results/<study>/` holds every step's output:

| path | contents |
|---|---|
| `captures/` | raw model output with per-line arrival times and token usage |
| `specs/` | compiled spec, json-render issues and fixes, time to first node |
| `dom/` | per-width geometry, axe violations and element boxes |
| `screens/` | per-width screenshots |
| `sample.json` | the 50 screens drawn for labelling; position N is blind token N |
| `labelling.html` | the blind labelling page; `bun run label` also links its screenshots into `blind/` under token names |
| `labels.json` | the human labels keyed by blind token, saved by `bun run label` |
| `report.md`, `gallery.html` | the rebuilt report, and every screen with findings outlined beside its labels |

## Limitations

- **One labeller, who also wrote the rules.** The page hides rule output and models, but not the rules' intent. Read precision as an upper bound.
- **INT-1 counts any secret field.** A checkout that asks for a card number fires it, because a generated screen should hand secrets to a trusted surface. The report prints the gate reading with and without INT-1.
- **Timings include CLI start-up.** They are wall time from process spawn. Codex reports only the finished message, so it has no time to first node.
- **The two models are not prompted identically.** Codex has no system prompt override, so the catalog prompt goes in the user turn on top of Codex's built-in instructions. Claude runs with its default adaptive thinking.
- **Rendering is simplified.** Remote images are replaced by a grey tile and other network requests are blocked. There is one light theme, a 900 px viewport height and a 400 ms settle.
- **Some layout problems are not covered.** No rule catches columns that stay side by side and cramped at 390 px when nothing overflows.
- **One run per prompt and model,** so the shares carry no variance estimate.
