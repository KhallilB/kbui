# kbui generative UI differentiation: evidence report

Date: 2026-10-22
Status: research report. Its recommendations are folded into the [product document](../../product.md) and the [roadmap](../../roadmap.md) as of 2026-10-22; the report itself changes nothing.
Verdict: **TEST**. The gaps are real and verified. Whether filling them produces better screens is not yet shown.

## Summary

We checked every differentiator claimed for kbui against primary sources: project repositories, specifications, official documentation and peer-reviewed or preprint research. Three researchers worked in parallel on runtimes, design-system tooling and academic work. The load-bearing claims were then checked a second time directly against the source.

The field is further along than the direction spec assumed in three places:

- **Deterministic repair exists.** json-render's `autoFixSpec` applies lossless fixes automatically and recommends re-prompting before lossy ones. A2UI and v0 also fix output with code. Every one of these fixes structure, syntax or code errors. None fixes design.
- **Agent-first design lint exists for source code.** `@shadcn/lint` checks token and style use in agent-written components. Its evals show that lint feedback brings violations to zero and lowers correction cost. It has no composition, data or safety rules, and it does not read JSON trees.
- **Cross-format rendering is crowded.** CopilotKit, assistant-ui and OpenUI already render A2UI or convert between formats.

Five gaps remain open after a deliberate search. In order of evidence strength:

1. **Integrity and safety rules on generated screens.** Two independent studies found deceptive design patterns in 55.8% of 1,296 LLM-generated ecommerce components and in all 20 GPT-4 shop sites. Runtimes defend with component allow-lists, iframe sandboxes and app-store review. None checks what a screen asks the user to do, and neither study proposes an automatic gate.
2. **Design and data-fit rules on component trees.** Validators check structure. Design guidance exists only as prose, such as OpenAI's "one primary CTA". Research tools lint code or rendered pages, not typed trees.
3. **Design-level fixes expressed as patches.** Structural fixes exist. Design fixes, such as demoting a second primary action, do not.
4. **One rule engine across stories, agent-written code, runtime trees and other projects' formats.** Each tool found covers one of these inputs.
5. **Tests that a model picks the right component from its description.** One example application does this. No framework or benchmark does.

These five are one product, not five features. kbui is **the design judgment layer for generated UI**: one contract, checked the same way wherever UI comes from, with fixes that keep the user's intent. The rest of this report shows the evidence, the counter-evidence and the test that decides it.

A second research pass covered arrangement, speed and validation. It found three more open areas, each an extension of the same loop rather than a new product:

- **Arrangement.** Runtimes offer rows and columns at most. None offers layout intents, such as list-detail or a dashboard with named regions, and none checks arrangement on the tree or on the rendered page. See [Design and arrangement](#design-and-arrangement).
- **Speed.** No runtime validates a tree while it streams, and published latency figures are estimates rather than measurements. Deterministic fixes and patch edits remove whole model rounds. See [Speed](#speed).
- **Validation.** No pipeline publishes what each stage catches or costs. LLM judges agree with people on about 60% of UI pairs and are close to chance on ease of use, so they cannot be the gate. See [Validation](#validation).

## How the research was done

| Angle | Scope | Method |
|---|---|---|
| Runtimes and protocols | json-render, A2UI v0.9, Tambo, CopilotKit and AG-UI, OpenUI and C1, Hashbrown, MCP Apps, OpenAI Apps SDK, Vercel AI SDK, v0, Google Stitch, LangGraph, assistant-ui | READMEs, source through the GitHub API, specifications, official documentation |
| Design-system tooling | ESLint and stylelint plugins from Atlassian, Primer, Polaris, Salesforce and Fluent; design-system MCP servers from shadcn, Storybook, Carbon, Chakra, Primer, Salesforce and Figma; Supernova, Knapsack, zeroheight, Builder.io, UXPin | Official documentation and repositories |
| Research | UI guideline linting and repair, feedback loops, tool selection, structured output depth, generated-UI security, abstraction level | arXiv, ACM and venue pages; abstracts and results sections |

Second-pass checks were made directly on: the `@shadcn/lint` README and evals, the json-render core README, the OpenAI Apps SDK submission guidelines, and the abstracts of the two deceptive-design studies.

Limits: absence of evidence is reported only after a search of the project's documentation and, where noted, its source. A project can ship a feature between this report and its next reading. Recheck the tables before citing them.

## What the field already does

### Runtimes and protocols

| Capability | Who has it | What it covers | Source |
|---|---|---|---|
| Schema validation against a catalog | json-render, A2UI, Tambo, OpenUI | Props and component names | [S1], [S2] |
| Parent and child constraints | A2UI | `allowedParents` and `allowedChildren` in the catalog, reported as `UNALLOWED_PARENT` and `UNALLOWED_CHILD` | [S2] |
| Structural validation beyond schema | json-render `validateSpec` | Dangling children, malformed visibility, misused `repeat` | [S1] |
| Deterministic repair | json-render `autoFixSpec`; A2UI `payload_fixer`; v0 "LLM Suspense" and AST autofixers | Moving misplaced fields, pruning dangling references, fixing JSON syntax, fixing imports and code errors | [S1], [S2], [S3] |
| Errors returned to the model | A2UI `VALIDATION_FAILED`; OpenUI error hints; AI SDK `repairToolCall` | Re-prompting with the error | [S2], [S4], [S5] |
| Rendering other formats | CopilotKit (A2UI, Open-JSON-UI, MCP Apps); assistant-ui (A2UI in, Slack and Teams out); OpenUI (A2UI client) | Rendering only, no shared rules | [S6], [S7], [S4] |
| Safety | A2UI component allow-list; MCP Apps iframe sandbox and CSP; OpenAI Apps SDK review policy against collecting passwords, MFA codes and card data | Which components may appear and where code may run | [S2], [S8], [S9] |
| Published evals | A2UI (schema checks plus an LLM judge for layout and accessibility hints); v0 (error-free rate); OpenUI (token counts) | No design-quality scores published | [S2], [S3], [S4] |

json-render's own documentation states the limit of structural checks: "structural validation does not detect omitted content" [S1].

The OpenAI Apps SDK writes good design rules down. Its UI guidelines say a card has "up to two actions maximum, with one primary CTA", no nested scrolling and WCAG AA contrast. Its submission guidelines forbid collecting passwords, MFA codes and payment card data. Both are enforced by human review and annotation checks at submission time, not on screens generated at runtime [S9].

### Design-system tooling

| Tool | What it checks | Fixes | Reads generated UI | Source |
|---|---|---|---|---|
| `@shadcn/lint` | Six rules: `no-restyle`, `no-raw-colors`, `no-arbitrary-values`, `no-inline-styles`, `no-unknown-classes`, `require-static-classes` | Suggestions that rewrite source | Agent-written source code only | [S10] |
| Atlassian `eslint-plugin-design-system` | 83 rules: tokens, use of components over raw HTML, deprecations, accessibility labels, a few composition rules | Many rules autofix | Hand-written code | [S11] |
| Primer MCP and `eslint-plugin-primer-react` | Accessibility, deprecations, slot children; MCP tools `lint_css` and `review_alt_text` | Partly | Agent code | [S12] |
| Salesforce SLDS Linter and MCP | Classes, hard-coded values, hooks; an MCP tool fixes code from linter output | Yes | Agent code | [S13] |
| Storybook MCP | Generates a component manifest from stories; runs interaction and accessibility tests | No | Agent-written stories | [S14] |
| storybook-addon-oversight | Lints the manifest for missing or weak descriptions and extractor drift | No | Manifest | [S15] |
| MIHCM design-system MCP | Validates component usage in JSX and an AI-UI descriptor schema; the page calls it "advisory unless wired into CI" | No | JSX and descriptor trees | [S16] |
| Figma design QA agent (beta) | Component use, spacing, contrast and pattern mismatch on the canvas | Fix and recheck loop | Figma canvas, not code | [S17] |
| Google `design.md` lint | Token references and contrast in a design file | No | Design file | [S18] |

`@shadcn/lint` is the closest competitor and the strongest supporting evidence at once. Its evals ran agents with and without linter diagnostics [S10]:

| Measure | Result |
|---|---|
| Findings on "temptation" tasks, before and after feedback | Sonnet 5: about 70 to 0, all 40 tasks green. Haiku 4.5: 62 and 72 to 2 and 0. Opus 5: 8 and 43 to 0. |
| Diagnostics versus rules text alone | Every model reached all tasks green in one round with diagnostics. Correction cost fell by 10% to 48%. |
| Drift over eight sequential tasks | 18 to 23 findings without enforcement, 0 with it. |
| Red team | 5 of 7 escapes caught. Both misses were outside JSX. |
| Limits stated by the authors | One model family, judged by the same family. No layout or composition quality measured. |

This shows that deterministic diagnostics help agents fix output cheaply and that drift grows without enforcement. It covers tokens and styling on source code. It does not cover structure, data, safety, runtime trees or other formats.

### Research

| Work | What it did | Result | Source |
|---|---|---|---|
| UIS-Hunter (ICSE 2021) | 93 Material Design "don't" rules as detectors on human-made Android UIs | 7,497 of 60,756 UIs violated at least one rule. Precision 0.81, recall 0.90. | [S19] |
| DesignRepair (ICSE 2025) | Material guidelines checked on code and rendered pages of v0 output, then GPT-4 repair | 196 violations in 20 v0 projects. Repair precision 89.3%, recall 86.6%. Soft constraints repaired worse, with recall at 70.4%. User ratings rose from 3.04 to 3.92 (n=26). | [S20] |
| Draco (InfoVis 2018) | Visualization design as hard and soft constraints | Precedent for data-fit rules, limited to charts | [S21] |
| Static analysis as a feedback loop (2025) | Pylint and Bandit findings fed to GPT-4o over ten rounds | Security issues fell from over 40% to 13%. Readability violations fell from over 80% to 11%. | [S22] |
| Self-correction studies (ICLR 2024) | Models correcting themselves with and without outside feedback | Self-correction without outside feedback often makes results worse. Outside, valid feedback is what helps. | [S23], [S24] |
| RAG-MCP (2025); Anthropic tool search (2025) | Tool count versus selection accuracy | Above 90% success under about 30 tools, failures dominate past about 100. Retrieval raised selection from 13.6% to 43.1%. Anthropic's tool search raised Opus 4.5 from 79.5% to 88.1%. | [S25], [S26] |
| MCP tool descriptions (2026) | Description quality versus task success | 97.1% of 856 descriptions had a defect. Better descriptions gave a median of +5.85 points, with 67% more steps and regressions in 16.7% of cases. | [S27] |
| DeepJSONEval (2025) | Nesting depth versus accuracy | Exact match fell 17% to 38% from 3–4 levels to 5–7 levels across 12 models. Extraction, not generation. | [S28] |
| Design-system-compliant generation (CHI 2026 EA) | Instructions, context or a registry of pre-built components | The registry approach reached 95.08% compliance, the highest of the three | [S29] |
| Krauß et al. (CHI 2025) | 20 people asked GPT-4 for a shop site from neutral prompts | All 20 sites contained deceptive patterns, a mean of 5 and a maximum of 9. Four participants noticed. No warnings were given. | [S30] |
| Chen et al., "Deception at Scale" (2025, revised 2026) | 1,296 LLM-generated ecommerce components | 55.8% had at least one deceptive pattern and 30.6% had two or more. The only mitigation tested was prompting. | [S31] |
| Web agent attacks (ICLR 2025, ACL 2025) | Injected page content against agents | Up to 70% success stealing personal data. Pop-ups succeeded 86% of the time. | [S32], [S33] |

## Corrections to earlier claims

| Earlier claim | Correction |
|---|---|
| "No runtime applies a fix itself; all send errors back to the model." | Wrong. json-render, A2UI and v0 apply deterministic fixes. The claim holds only for design-level fixes. |
| "No design lint for generated output exists." | Too broad. `@shadcn/lint` lints agent-written source for token and style use. The claim holds for structure, layout, data and safety rules, and for JSON trees. |
| "A2UI has no grammar." | Partly wrong. A2UI enforces allowed parents and children. Nesting depth, slot capacity and action limits per slot are still missing. |
| "Nobody writes down rules such as one primary action." | Wrong. The OpenAI Apps SDK guidelines state it. Nobody enforces it on generated trees. |
| "Rendering other projects' formats is distinctive." | Wrong. Three projects already do it. It stays a feature. |
| "Nobody tests component selection." | Mostly right. Hashbrown's example application has a selection eval. No framework or benchmark offers one, and the Very Good Ventures A2UI benchmark says it does not test selection. |

## The approach

### One sentence

kbui is the design judgment layer for generated UI: one contract that defines what good looks like, checked and fixed the same way whether a person, a coding agent or a runtime model produced the screen, and whatever format it arrived in.

### The loop

```
contract ──> catalog ──> arrange ──> generate ──> check ──> fix ──> repair once ──> render ──> check geometry
   ^          (focused,   (layout     (streamed,   (tree    (patches)                (three
   │           cached)     intent)     checked     rules)                             sizes)
   │                                   per node)                                        │
   └──────────────── selection tests, evals and per-stage catch rates measure every stage ┘
```

The model picks a layout intent and fills its regions. kbui arranges, checks, fixes and measures. Each added stage is described in [Design and arrangement](#design-and-arrangement), [Speed](#speed) and [Validation](#validation).

| Stage | What kbui does | Open or parity | Evidence |
|---|---|---|---|
| Contract | Anatomy lines, prop types, tokens and rules in one source | Parity: cva, Panda and react-docgen derive types from one definition | [S14], [S15] |
| Catalog | Generated manifest with a drift test and a focused subset for each surface | Parity: Storybook MCP generates manifests | [S14], [S25] |
| Generate | Runtime models produce trees. Coding agents produce TSX. kbui does not run the model. | Not kbui's job ([0005](../../decisions/0005-catalog-and-quality-layer-not-runtime.md)) | |
| **Check** | Four rule families on the canonical tree: structure, design, data fit, integrity and safety | **Open** for design, data and safety on trees | [S1], [S2], [S9], [S10], [S30], [S31] |
| **Fix** | Deterministic patches for design rules, lossless first | **Open** at the design level. Structural fixing is parity. | [S1], [S3] |
| Repair once | Remaining violations go to the model as instructions, one round | Parity in form. The content of the messages is kbui's. | [S10], [S22], [S23] |
| **Everywhere** | The same engine on stories in CI, on agent TSX through MCP, on runtime trees, and on A2UI or json-render trees through adapters | **Open**: each tool found covers one input | [S10], [S14], [S16] |
| **Measure** | Selection tests per component, plus the `test:gen` suite | **Open** for selection tests in a framework | [S2], [S27] |

The open stages, in bold, share one rule engine and one tree. That is why they form one product: each one makes the others more valuable. Rules without fixes add latency. Fixes without rules have nothing to fix. Running everywhere without rules is only rendering. Selection tests without a contract have nothing to test against.

### Differentiators, ranked by evidence

#### 1. Integrity and safety rules on generated screens

What it is: rules that judge what a screen asks of the user and what it lets them do. Examples:

- No password, MFA or card fields in a runtime-generated tree unless the host allows the field.
- A destructive action must be confirmed.
- An external link shows its destination.
- A generated region carries a visible marker.
- Content in an untrusted slot cannot hold a primary or destructive action.
- Urgency, scarcity or price claims must be bound to data. A countdown timer bound to no data is a violation.

Evidence that the problem exists: two independent studies, one with 1,296 components and one with 20 people, found deceptive patterns in most generated commerce UI [S30], [S31]. Injected content succeeds against agents at high rates [S32], [S33].

Evidence that nobody gates it: runtimes defend with allow-lists, sandboxes and review [S2], [S8], [S9]. The OpenAI policy forbids collecting credentials and card data but enforces it at submission, not on generated screens [S9]. Neither study proposes an automatic check; the only mitigation tested was prompting [S31].

Why others are not doing it: runtimes treat safety as a security problem, meaning where code runs. Design-system linters treat quality as a style problem, meaning which tokens are used. Integrity, meaning what the screen persuades the user to do, sits between them, and only the layer that owns the components and their meaning can check it. This explanation is our reasoning, not a sourced fact.

Label: the gap is **likely** (two independent studies plus a survey of runtimes). The value is **unknown**. Both studies used free-form HTML generation. A catalog-constrained runtime may already remove most deceptive patterns, and that is the first thing to test.

#### 2. Design and data-fit rules on component trees

What it is: rules about whether a valid tree is a good screen. Examples include one primary action per region, heading order, nesting depth and slot capacity, a component that suits its data (a single number becomes a `StatTile`), and empty, loading and error states for every data-bound region.

Evidence the gap exists: json-render and A2UI validate structure only, and json-render says so [S1], [S2]. Design rules exist as prose [S9]. `@shadcn/lint` covers tokens on source code [S10]. DesignRepair works on code and rendered pages with a model-based detector [S20]. Draco covers charts only [S21].

Evidence it could help: deterministic rule detectors work on real UIs [S19]. Guideline-based repair improved user ratings [S20]. Linter feedback reduces violations and cost [S10], [S22]. Pre-built registry components gave the highest compliance [S29], which supports patterns.

Label: the gap is **likely**. The value is **unknown**; see the counter-evidence below.

#### 3. Design-level fixes as patches

What it is: each rule that can be fixed returns a JSON Patch, for example demoting the second primary button, inserting an `EmptyState`, renumbering headings or adding a confirmation. Lossless fixes apply at once. Lossy fixes wait until a model retry fails, following json-render's own policy [S1].

Evidence: structural fixing is established practice [S1], [S2], [S3]. No design-level fixer was found. The "repair once" pass then sees only what code could not fix, which addresses the latency and cost concerns in [S23] and [S34].

Label: the gap is **likely** but narrow. Fixers are easy to copy once rules exist, so this matters as part of the loop, not on its own.

#### 4. One engine across every source of UI

What it is: the same rules run on hand-written stories in CI, on TSX from coding agents through the MCP server, on runtime trees, and on A2UI or json-render trees after an adapter translates them.

Evidence: every tool found covers one input. `@shadcn/lint` covers source code [S10], Storybook covers stories [S14], json-render and A2UI cover their own trees [S1], [S2], and MIHCM covers JSX and a descriptor schema but is advisory [S16]. The drift results show why one enforced bar matters: 18 to 23 findings without enforcement, 0 with it [S10].

Label: the gap is **likely**. Whether static TSX can be parsed into the canonical tree at useful coverage is **unknown** and is a feasibility risk.

#### 5. Tests that a model picks the right component

What it is: each component ships two or three prompts that should select it. `test:gen` fails when the model picks something else. This turns component descriptions into tested code.

Evidence: descriptions are usually defective, and improving them helps but can regress [S27]. Tool count and similar names are the main cause of selection errors [S25], [S26]. The A2UI-based benchmark from Very Good Ventures checks validity and catalog membership but says it does not test selection [S35]. Hashbrown's example application has a selection eval, but it is not a framework feature [S7].

Label: the gap is **likely**. This is cheap to build and cheap to copy. It is a strong practice, not a moat.

### Demoted to features

| Feature | Why it does not differentiate |
|---|---|
| Generated catalog with a drift test | Storybook MCP generates manifests and Oversight lints them [S14], [S15]. Still required as the foundation. |
| Rendering other formats | CopilotKit, assistant-ui and OpenUI do it [S6], [S7], [S4]. Adapters matter only as the way the rules reach other formats. |
| Node-level edits | A2UI addresses nodes by id. json-render streams patches. |
| Evals in general | A2UI ships an eval framework [S2]. Only selection tests and rule-based design scoring are new. |
| Promoting user compositions | No project does it, but it depends on a product whose users compose screens. Its value is unknown and it cannot be tested now. |
| A consistent look across web hosts | True for the web only, and a consequence of [0001](../../decisions/0001-framework-free-css-contract.md), not a new capability. |

## Design and arrangement

### What the field does

| Area | Finding | Source |
|---|---|---|
| Layout in runtimes | A2UI offers `Row`, `Column` and `List`, with weights and alignment. json-render and Tambo leave layout to the user's catalog. No runtime offers breakpoints, arrangement rules, a constraint solver or a layout intent. | [S38], [S1] |
| Layout generation research | LayoutPrompter, LayoutNUWA and LayoutGPT generate box layouts and score them on alignment, overlap and IoU. Whitespace, balance and reading order are rarely measured. LayoutCoT reports that ranking by these metrics over-optimizes them. | [S39], [S40], [S41] |
| Fixing layouts afterward | LayoutRectifier snaps generated layouts to a grid, then removes overlap and fixes containment, with no extra training. GRIDS solves grid layouts as an integer program. | [S42], [S43] |
| Measuring aesthetics | Eight computed metrics explained up to 49% of the variance in human ratings of web pages and up to 32% for apps. | [S44] |
| A vocabulary of layouts | Material 3 defines canonical layouts (list-detail, supporting pane, feed), each tied to window size classes. | [S45] |
| Checking rendered geometry | DesignRepair checks rendered pages with Playwright. ReDeCheck found responsive layout failures in 16 of 26 production pages. axe-core checks target size against WCAG 2.5.8. Google's generative UI post-processors fix code, not geometry. | [S20], [S46], [S47], [S36] |

The pattern matches the rest of the field: runtimes provide primitives and leave arrangement to the model. Research shows models are weak at exactly this. Alignment and overlap are the standard failures, and fixing layouts after generation works.

### What kbui adds

Arrangement works at three levels. Each moves a decision away from the model, toward something deterministic.

**1. Layout intents.** The model does not place components. It picks an intent and fills named regions:

```ts
{ id: "root", type: "ListDetail", slots: { list: [...], detail: [...] } }
```

Intents come from a fixed vocabulary based on Material's canonical layouts, such as `ListDetail`, `SupportingPane`, `Feed`, `Dashboard`, `Form` and `Settings`. Each intent knows how to collapse at each size class, so the model never writes a breakpoint. This also keeps trees shallow, which matters because accuracy drops 17% to 38% from three or four levels of nesting to five or more [S28]. A registry of pre-built components gave the highest design-system compliance in the one study that compared approaches [S29].

**2. Arrangement rules on the tree.** These run in milliseconds, before anything renders:

| Rule | Example fix |
|---|---|
| Spacing comes from the token scale, and siblings share one gap | Replace gaps that do not match with the region's gap |
| A region holds at most a set number of siblings | Move the overflow into `Tabs`, or turn a long list into a paginated `Table` |
| Related inputs are grouped | Wrap adjacent inputs bound to one entity in a `FormSection` |
| Reading order follows tree order and headings go down one level at a time | Renumber headings |
| One primary action per region, placed at the region's end | Demote the others to secondary |
| Column count suits the size class | Change `Split` to `Stack` at compact size |

**3. Rendered geometry at three sizes.** The tree is rendered at compact, medium and expanded widths, and kbui checks for overlap, overflow, truncated text, target size and content that falls off the screen. Most fixes return to the tree: choose a different intent or primitive rather than move pixels, because CSS grid and flex already handle alignment. ReDeCheck's results show this layer catches real failures that the tree cannot reveal [S46].

Computed aesthetic metrics, such as balance and visual complexity, are useful as a score but not as a gate. They explain at most about half of the variance in human ratings [S44]. They belong with the soft rules that rank candidate screens.

Label: the gap in arrangement for generated trees is **likely** (runtimes survey [S38], [S1]; no layout intent found). Whether layout intents improve screens more than primitives do is **unknown**. The layout research works on free boxes, not flex trees, so its metrics only partly transfer.

## Speed

Speed means something different for each group. kbui's levers, and the evidence behind each:

| Who | What they wait for | kbui lever | Evidence |
|---|---|---|---|
| End user | First useful paint | Stream the tree and render each node when it is complete. Regions bound to data show their loading state at once, which the data rules already require. | json-render and A2UI stream; neither publishes latency [S1], [S2] |
| End user | A broken screen discovered late | Check each node as it arrives and stop generation on a fatal violation, such as a credential field in an untrusted slot, instead of after the whole screen | No runtime found that validates partial trees [S38] |
| End user | A repair round | Deterministic fixes resolve most violations in milliseconds. Only the rest go to the model, once. | Structural fixers in practice [S1]; design repair loops cost 52% more compute [S34] |
| End user | An edit | Change one node by patch instead of regenerating the screen | A2UI and json-render patch by id |
| End user and operator | Output tokens | Layout intents and patterns produce fewer nodes per screen. Output size dominates generation time. | OpenUI Lang 4,800 tokens against json-render 10,180 for the same screens [S4]; compression cut tokens 41% and time 49% in one study [S48] |
| Operator | Input tokens | Focused catalogs, and the catalog placed first in the prompt so it is cached | Retrieval cut prompt tokens about 49% [S25]; cached reads cost 0.1 times base input and cut latency up to 85% on long prompts [S49], [S50] |
| Coding agent | Correction rounds | Diagnostics written as instructions, plus fix patches, through one MCP call | Diagnostics reached all tasks green in one round, with 10% to 48% lower cost [S10] |
| Maintainer | Adding a variant or component | One contract. The anatomy line generates the types, manifest, schema and grammar. `bun run new` scaffolds the component, story, manifest entry and selection prompts. | Parity with cva and Panda for types; the drift test is kbui's |

No published generative UI latency figure is a measurement. OpenUI's table assumes 60 tokens per second, and Google says only that generation "can often take a minute or two" [S4], [S36]. kbui should therefore publish measured timings as part of its evals: time to first node, time to complete, repair time and edit time, per adapter. That is a small differentiator in itself, and it is the only honest way to make speed claims.

Label: validating while streaming is a **likely** gap, from one research pass. The size of the speed gain is **unknown** until stage 1 records a baseline.

## Validation

### The pipeline

Cheap checks run first. Each stage handles only what the earlier stages could not:

| Stage | Runs on | Checks | Cost | On failure |
|---|---|---|---|---|
| 0. Stream | Each node as it arrives | Schema, catalog membership, integrity rules that are fatal | Microseconds per node | Stop generation and repair |
| 1. Structure | Whole tree | Slots, nesting, references, actions | Milliseconds | Lossless fix, else repair |
| 2. Rules | Whole tree | Design, arrangement, data fit, integrity | Milliseconds | Fix patch, else repair |
| 3. Render | DOM at three sizes | axe, geometry, overflow, target size | Seconds | Tree fix, else repair |
| 4. Repair | Remaining violations | One model round with the diagnostics | One generation | Show the screen with a visible notice, or fall back to a pattern |
| 5. Judge | Offline evals only | Semantics that rules cannot see, such as useless labels | One model call per screen | Report it, never block |
| 6. People | Decisions such as stage 2 | Blind pairwise preference | Human time | Decides the direction |

Two choices follow from the evidence:

- **The judge never gates.** LLM judges match human preference on about 60% of UI pairs, are close to chance on ease of use and comfort, and reach about 90% only when people strongly prefer one option [S51]. Judges also show position bias, worse on close pairs, and prefer their own output [S52], [S53]. The judge therefore runs offline, from a different model family than the generator, with both orders tried. Its findings are reported apart from lint, as [S20] and the earlier direction spec already require.
- **Every stage reports what it caught and what it cost.** No published pipeline does this [S20], [S54]. These numbers show where to invest. If stage 3 catches little that stage 2 missed, rendering can leave the hot path.

### Validating the validator

The rules can be wrong in two directions, and each needs a test:

| Check | Method | Precedent |
|---|---|---|
| Precision and recall | A labeled set of screens, with violations marked by a person, scored against the rules | UIS-Hunter reported 0.81 precision and 0.90 recall [S19] |
| Escapes | Seeded violations, red-team trees and mutations of passing trees | `@shadcn/lint` caught 5 of 7 red-team escapes [S10] |
| Fix fidelity | A blind check that a fixed screen still does what the prompt asked | `@shadcn/lint` judged fidelity on renders [S10] |
| Selection | Prompts that must pick each component | [Differentiator 5](#5-tests-that-a-model-picks-the-right-component) |
| Human preference | Blind pairs, scored with Bradley-Terry and confidence intervals | Google's generative UI study, WebDev Arena and Design Arena use this method [S36], [S55] |

Label: publishing per-stage catch rates is a **likely** gap. It is easy to copy, but it is also what turns kbui's claims into evidence.

## Evidence against the thesis

| Counter-evidence | What it means for kbui | Source |
|---|---|---|
| Computed aesthetic metrics explain at most about half of the variance in human ratings. Layout research works on free boxes, not flex trees. | Arrangement rules can enforce consistency but cannot certify beauty. Keep aesthetic scores soft. | [S44], [S39] |
| LLM judges are near chance on close pairs and on ease of use. | Design quality claims need human pairwise data, which is slow and costly to collect. | [S51] |
| Published latency figures are modeled, not measured. | kbui's speed claims are hypotheses until stage 1 measures a baseline. | [S4], [S36] |
| Google's free-form generative UI reached 0% output errors on recent Gemini models and was preferred over markdown in 82.8% of comparisons, with no component catalog. | Strong models may produce acceptable screens without a design system. kbui's case must rest on consistency, integrity and editing, not on validity. | [S36] |
| Repair loops for accessibility added 52% compute and 1.64 times the API calls with no better outcomes. Self-repair gains shrink once cost is counted. | A model repair loop is not free. Deterministic fixes must carry most of the load, and the model gets one round at most. | [S34], [S24] |
| Soft and aesthetic constraints repaired poorly (recall 70.4%). Rule-based accessibility checks miss semantic problems such as useless alt text. | Rules cover the clear-cut cases. Taste needs a judge or human preference data. | [S20], [S37] |
| Richer descriptions raised steps by 67% and regressed 16.7% of cases. | Selection tests must measure regressions, not assume that more words help. | [S27] |
| `@shadcn/lint` already owns "agent-first design lint" and is backed by the largest component ecosystem. | If shadcn adds composition or safety rules, differentiators 2 and 4 narrow sharply. Speed and the integrity family matter more than breadth. | [S10] |
| Both deceptive-pattern studies used free-form HTML, not catalog-constrained trees. | The integrity gap may be smaller inside a runtime that limits components. This is the first test. | [S30], [S31] |

## Durability

Rules are easy to copy. What is hard to copy is the coupling: rules that know each component's meaning because they come from the same contract as the component, plus a growing body of rules, fixes and selection tests checked by evals. A runtime cannot hold this, because runtimes are deliberately neutral about components. A token linter can grow into it, which is why `@shadcn/lint` is the competitor to watch.

## Riskiest assumption and the test that decides it

**Assumption:** kbui's rules find real problems in screens from catalog-constrained runtimes, and fixing them yields screens people prefer.

**Test, in two stages, each with its threshold set in advance.**

Stage 1, cheap, about two days:

1. Write 30 prompts across commerce, settings and dashboards, including the neutral shop prompts from [S30].
2. Generate them with json-render and its shadcn catalog, using two models.
3. Write about ten integrity, design and arrangement rules by hand against json-render's spec format. No kbui packages are needed.
4. Render each screen at three widths with Playwright and run axe and the geometry checks: overlap, overflow, target size.
5. Count the screens with at least one violation, by rule family.
6. Record time to first node, time to complete and token counts. These become the speed baseline that later targets are set against.
7. Have one person label 50 screens by hand and score the rules' precision and recall against those labels. Rules below 0.7 precision are rewritten before stage 2.

| Result | Decision |
|---|---|
| 20% of screens or more violate an integrity rule | The integrity family is confirmed as the lead differentiator. Go to stage 2. |
| Under 10% violate any integrity or design rule | Catalog constraints already solve most of the problem. Narrow kbui to the catalog and drift test, and stop the lint work. |
| Between 10% and 20% | Go to stage 2 with design rules leading. |

Stage 2, the comparison already planned under [When to stop](2026-10-22-generative-ui-direction.md#when-to-stop): 60 prompt pairs, kbui catalog with rules, fixes and one repair round against json-render with the shadcn catalog, judged blind. kbui needs at least 37 wins of 60 to pass. Record the time each screen takes, including repair.

Stage 1 isolates whether the problem exists in constrained runtimes, which is the cheapest thing that could end the plan. Stage 2 tests whether fixing it matters to people.

## Recommended changes to the direction spec

1. Restate the position as the design judgment layer, with the loop above.
2. Reorder the rule families so integrity and safety come first, and add a deceptive-pattern group taken from [S31]'s taxonomy.
3. Add design-level fixes as patches to differentiator 1, with json-render's lossless-first policy credited.
4. Add selection tests to the evals feature.
5. Correct the comparison tables: json-render autofix, A2UI parent and child rules, OpenAI design guidance, `@shadcn/lint`, cross-format renderers.
6. Add stage 1 above as the first step under When to stop, ahead of phase 0's twenty components, because it needs no kbui code.
7. Add layout intents to phase 0, ahead of the long tail of components: `ListDetail`, `SupportingPane`, `Feed`, `Dashboard`, `Form` and `Settings`, each with its collapse rules per size class.
8. Add an arrangement family to the rules, and a rendered-geometry stage at three widths.
9. Add the validation pipeline as written above, with per-stage catch rates and costs recorded in `test:gen`, and the judge kept offline.
10. Add streaming checks and measured timings to the `render-react` and `test:gen` phases.

## Sources

Validation status: **corroborated** means two or more independent sources agree or the claim was checked directly against the primary source in a second pass. **Primary** means read from one primary source. **Secondary** means a summary was used.

| Id | Source | Supports | Status |
|---|---|---|---|
| S1 | json-render core README, https://raw.githubusercontent.com/vercel-labs/json-render/main/packages/core/README.md | `validateSpec`, `autoFixSpec`, lossless-first policy, "structural validation does not detect omitted content" | Corroborated (rechecked) |
| S2 | A2UI specification v0.9.1 and repository, https://a2ui.org/specification/v0.9.1-a2ui/ and https://github.com/a2ui-project/a2ui | Parent and child constraints, `VALIDATION_FAILED`, `payload_fixer`, eval framework | Primary |
| S3 | Vercel, "v0 composite model family" and "How we made v0 an effective coding agent", https://vercel.com/blog/v0-composite-model-family | Deterministic and model autofixers for code | Primary |
| S4 | OpenUI repository and comparison page, https://github.com/thesysdev/openui | Error hints, A2UI client, token benchmark | Primary |
| S5 | Vercel AI SDK tool calling, https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling | `repairToolCall` | Primary |
| S6 | CopilotKit, generative UI spec support, https://docs.copilotkit.ai/whats-new/generative-ui-spec-support | Rendering A2UI, Open-JSON-UI and MCP Apps | Primary |
| S7 | assistant-ui and Hashbrown repositories, https://github.com/assistant-ui/assistant-ui and https://github.com/liveloveapp/hashbrown | A2UI conversion; example selection eval | Primary |
| S8 | MCP Apps specification 2026-01-26, https://github.com/modelcontextprotocol/ext-apps/blob/main/specification/2026-01-26/apps.mdx | Sandbox, CSP, consent | Primary |
| S9 | OpenAI Apps SDK submission and UI guidelines, https://developers.openai.com/apps-sdk/app-submission-guidelines and https://developers.openai.com/apps-sdk/concepts/ui-guidelines | Credential and card data ban, destructive hints, one primary CTA, enforced at review | Corroborated (rechecked) |
| S10 | `@shadcn/lint` README and evals, https://github.com/shadcn-ui/lint | Six rules, agent-first, eval results | Corroborated (rechecked) |
| S11 | Atlassian `eslint-plugin-design-system` README, https://unpkg.com/@atlaskit/eslint-plugin-design-system@16.13.6/README.md | 83 rules with autofix | Primary |
| S12 | Primer MCP, https://primer.style/product/getting-started/foundations/mcp | `lint_css`, `review_alt_text` | Primary |
| S13 | Salesforce SLDS Linter and MCP guidelines, https://developer.salesforce.com/docs/platform/slds-linter/guide | Linter with fixes, MCP fix tool | Primary; the Agentforce skill page was not readable |
| S14 | Storybook MCP and manifests, https://storybook.js.org/docs/ai/mcp/overview | Manifest generation, test-run | Primary |
| S15 | storybook-oversight, https://github.com/rachelslurs/storybook-oversight | Manifest description lint | Primary |
| S16 | MIHCM agent tooling, https://designsystem.mihcm.com/agent-tooling | JSX and descriptor validation, advisory | Primary |
| S17 | Figma AI design QA, https://www.figma.com/solutions/ai-design-qa-assistant/ | Canvas-only checks | Primary |
| S18 | Google `design.md`, https://github.com/google-labs-code/design.md | Token and contrast lint | Primary |
| S19 | Yang et al., UIS-Hunter, ICSE 2021, https://2021.icse-conferences.org/details/icse-2021-papers/87 | Rule detectors on real UIs | Primary |
| S20 | Yuan et al., DesignRepair, ICSE 2025, https://arxiv.org/abs/2411.01606 | Guideline repair of v0 output; the paper has internal number inconsistencies | Primary |
| S21 | Moritz et al., Draco, InfoVis 2018, https://idl.uw.edu/papers/draco | Design constraints for charts | Primary |
| S22 | Static Analysis as a Feedback Loop, 2025, https://arxiv.org/abs/2508.14419 | Lint feedback reduces violations | Primary |
| S23 | Huang et al., ICLR 2024, https://arxiv.org/abs/2310.01798 | Self-correction needs outside feedback | Primary |
| S24 | Olausson et al., ICLR 2024, https://arxiv.org/abs/2306.09896 | Self-repair gains modest after cost | Primary |
| S25 | RAG-MCP, 2025, https://arxiv.org/abs/2505.03275 | Tool count versus accuracy | Primary |
| S26 | Anthropic, "Advanced tool use", 2025, https://www.anthropic.com/engineering/advanced-tool-use | Tool search gains, similar-name errors | Primary |
| S27 | MCP Tool Descriptions Are Smelly, 2026, https://arxiv.org/abs/2602.14878 | Description defects and trade-offs | Primary |
| S28 | DeepJSONEval, 2025, https://arxiv.org/abs/2509.25922 | Depth versus accuracy | Primary |
| S29 | Cha et al., CHI 2026 Extended Abstracts, https://doi.org/10.1145/3772363.3798616 | Registry approach highest compliance; other figures not visible | Secondary for the comparison |
| S30 | Krauß et al., CHI 2025, https://arxiv.org/abs/2411.03108 | 20 of 20 generated sites deceptive | Corroborated (rechecked; independent of S31) |
| S31 | Chen et al., "Deception at Scale", https://arxiv.org/abs/2502.13499 | 55.8% of 1,296 components deceptive; prompting only mitigation | Corroborated (rechecked; independent of S30) |
| S32 | EIA, ICLR 2025, https://arxiv.org/abs/2409.11295 | Injection steals personal data | Primary |
| S33 | Pop-up attacks, ACL 2025, https://arxiv.org/abs/2411.02391 | 86% attack success | Primary |
| S34 | Iterative accessibility refinement, 2026, https://arxiv.org/abs/2605.27716 | Added cost without better outcomes | Primary |
| S35 | Very Good Ventures, "Benchmarking LLMs for GenUI", 2026, https://verygood.ventures/blog/benchmarking-llms-for-gen-ui/ | Benchmark does not test selection | Primary |
| S36 | Leviathan et al., "Generative UI", Google Research, 2025, https://generativeui.github.io/static/pdfs/paper.pdf | Strong models without a catalog | Primary |
| S37 | AccessGuru, 2025, https://arxiv.org/abs/2507.19549 | Rules miss semantic accessibility problems | Primary |
| S38 | A2UI component reference, https://a2ui.org/reference/components; json-render docs, https://json-render.dev/docs; Tambo docs, https://docs.tambo.co | Layout primitives only; no intents, breakpoints or arrangement rules; no streaming validation found | Primary; CopilotKit not verified |
| S39 | LayoutPrompter, NeurIPS 2023, https://arxiv.org/abs/2311.06495 | Layout metrics: alignment, overlap, IoU | Primary |
| S40 | LayoutNUWA, ICLR 2024, https://arxiv.org/abs/2309.09506; LayoutGPT, NeurIPS 2023 | Layout as code; 20% to 40% spatial gains | Primary |
| S41 | LayoutCoT, 2025, https://arxiv.org/abs/2504.10829 | Ranking by metrics over-optimizes them | Primary |
| S42 | Shen, Shamir and Igarashi, LayoutRectifier, Pacific Graphics 2025, https://arxiv.org/abs/2508.11177 | Training-free grid snapping, overlap and containment fixes; no numbers in the abstract | Corroborated (rechecked) |
| S43 | GRIDS, CHI 2020, https://arxiv.org/abs/2001.02921 | Grid layout as an integer program; small evaluation | Primary |
| S44 | Miniukovich and De Angeli, "Computation of Interface Aesthetics", CHI 2015 | Up to 49% of variance for web pages, 32% for apps | Primary (abstract) |
| S45 | Android canonical layouts, https://developer.android.com/guide/topics/ui/layout/canonical-layouts | Layout vocabulary tied to window size classes | Primary |
| S46 | Walsh, McMinn and Kapfhammer, ReDeCheck, ISSTA 2017, https://eprints.whiterose.ac.uk/116991 | 33 responsive layout failures in 16 of 26 production pages | Primary |
| S47 | axe-core `target-size`, https://dequeuniversity.com/rules/axe/4.8/target-size | WCAG 2.5.8 target size check | Primary |
| S48 | EfficientUICoder, 2025, https://arxiv.org/abs/2509.12159 | 41.4% fewer tokens, 48.8% less inference time | Primary |
| S49 | Anthropic prompt caching documentation, https://platform.claude.com/docs/en/docs/build-with-claude/prompt-caching | Cache read and write pricing | Primary |
| S50 | Anthropic, "Prompt caching" announcement, 2024, https://www.anthropic.com/news/prompt-caching | Up to 90% lower cost and 85% lower latency on long prompts | Primary (vendor) |
| S51 | Luera et al., "MLLM as a UI Judge", 2025, https://arxiv.org/html/2510.08783v1 | About 60% pairwise agreement; near chance on ease of use; about 90% only on large gaps; 9,296 human responses on 30 UIs. The paper's text and tables disagree on some figures. | Corroborated (rechecked) |
| S52 | "Judging the Judges", 2024, https://arxiv.org/abs/2406.07791 | Position bias, worse on close pairs | Primary |
| S53 | "Self-Preference Bias in LLM-as-a-Judge", 2024, https://arxiv.org/abs/2410.21819 | Judges prefer their own output | Primary |
| S54 | ArtifactsBench, 2025, https://arxiv.org/html/2507.04952v2 | Render and judge pipeline; no per-stage catch rates | Primary |
| S55 | WebDev Arena, https://news.lmarena.ai/webdev-arena; Design Arena methodology, https://notes.designarena.ai/methodology | Bradley-Terry ranking from pairwise votes | Primary |

A note on [S36]: the project PDF and the arXiv version (2604.09577) of Google's study report different Elo figures, and one compares against expert sites with ties counted. Both report that generated UI was preferred over markdown in 82.8% of comparisons.
