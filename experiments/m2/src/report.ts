// Rebuilds the M2 report and gallery from frozen results. No model call, no browser.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { parseArgs } from "node:util";
import { type Answers, adjudicate, type Labels, LITERAL } from "./labels";
import { loadScreens, type Screen } from "./load";
import { domFindings, type Family, type Finding, RULES, type RuleId, treeFindings } from "./rules";
import { MODELS, type ModelId, studyDir, WIDTHS } from "./study";

const { values } = parseArgs({ options: { study: { type: "string" } } });
if (!values.study) throw new Error("usage: report --study <id>");
const study = values.study;
const dir = studyDir(study);

const familyOf = Object.fromEntries(RULES.map((r) => [r.id, r.family])) as Record<RuleId, Family>;
const screens = loadScreens(study).map((s) => ({
  ...s,
  findings: [...treeFindings(s.compiled.spec), ...domFindings(s.doms)],
}));
type Scored = Screen & { findings: Finding[] };

const readLabels = (file: string): Labels | null =>
  existsSync(join(dir, file)) ? JSON.parse(readFileSync(join(dir, file), "utf8")) : null;
const blindLabels = readLabels("labels.json");
const rechecked = blindLabels && readLabels("adjudicated.json");
const sample: string[] = blindLabels
  ? JSON.parse(readFileSync(join(dir, "sample.json"), "utf8"))
  : [];
// Labels are keyed by blind token: the 1-based position in sample.json.
const byScreen = (answers: Answers): Answers =>
  Object.fromEntries(
    Object.entries(answers).map(([token, own]) => {
      const id = sample[Number(token) - 1];
      if (!id) throw new Error(`label token ${token} is not in sample.json`);
      return [id, own];
    }),
  );
const blind = blindLabels && byScreen(blindLabels.labels);
const adjudicated = rechecked && byScreen(adjudicate(blindLabels.labels, rechecked.labels));
const labeller = blindLabels?.labeller || "an unnamed labeller";
// The gallery shows the final answers.
const labels = adjudicated ?? blind;

const out: string[] = [];
const say = (line = "") => out.push(line);

// ---- shares ----

type Share = { n: number; d: number };
const share = (xs: Scored[], hit: (s: Scored) => boolean): Share => ({
  n: xs.filter(hit).length,
  d: xs.length,
});
const pct = ({ n, d }: Share) => (d ? (100 * n) / d : 0);
const fmt = (s: Share) => `${s.n}/${s.d} (${pct(s).toFixed(1)}%)`;
const has = (families: Family[]) => (s: Scored) =>
  s.findings.some((f) => families.includes(familyOf[f.rule]));

const models = Object.keys(MODELS) as ModelId[];
const groups: [string, Scored[]][] = [
  ["all", screens],
  ...models.map((m) => [m, screens.filter((s) => s.model === m)] as [string, Scored[]]),
  ...(["commerce", "settings", "dashboard"] as const).map(
    (c) => [c, screens.filter((s) => s.prompt.category === c)] as [string, Scored[]],
  ),
];
const columns: [string, (s: Scored) => boolean][] = [
  ["integrity", has(["integrity"])],
  ["design", has(["design"])],
  ["integrity or design", has(["integrity", "design"])],
  ["arrangement", has(["arrangement"])],
  ["data", has(["data"])],
  ["any rule", (s) => s.findings.length > 0],
];

say(`# M2 field test: ${study}`);
say();
say(
  `${screens.length} screens: ${new Set(screens.map((s) => s.prompt.id)).size} prompts × ${models.length} models, each rendered at ${WIDTHS.join(", ")} px. Rule output only; see precision below before reading these as violations.`,
);
say();
say("## Screens with at least one finding, by rule family");
say();
say(`| group | ${columns.map(([c]) => c).join(" | ")} |`);
say(`|---|${columns.map(() => "---").join("|")}|`);
for (const [name, xs] of groups)
  say(`| ${name} | ${columns.map(([, hit]) => fmt(share(xs, hit))).join(" | ")} |`);
say();

say("## Screens per rule");
say();
say(`| rule | family | title | ${models.join(" | ")} | all |`);
say(`|---|---|---|${models.map(() => "---").join("|")}|---|`);
for (const r of RULES) {
  const hit = (s: Scored) => s.findings.some((f) => f.rule === r.id);
  const per = models.map((m) =>
    fmt(
      share(
        screens.filter((s) => s.model === m),
        hit,
      ),
    ),
  );
  say(`| ${r.id} | ${r.family} | ${r.title} | ${per.join(" | ")} | ${fmt(share(screens, hit))} |`);
}
say();

// ---- gate ----

/** Roadmap gate rows, checked in order. */
function gate(integrity: Share, integrityOrDesign: Share): string {
  if (pct(integrity) >= 20) return "integrity and safety rules lead; continue to M3";
  if (pct(integrityOrDesign) >= 10) return "design rules lead; continue to M3";
  return "under 10%: keep M3 and M4, stop the rule work (M5 onward)";
}
const ruleGate = gate(
  share(screens, has(["integrity"])),
  share(screens, has(["integrity", "design"])),
);
say("## Gate");
say();
say(
  "The gate reads rule output, as fixed before the run. Readings from human labels below are for comparison.",
);
say();
say(
  `From rule output: integrity ${fmt(share(screens, has(["integrity"])))}, integrity or design ${fmt(share(screens, has(["integrity", "design"])))}. Reading: **${ruleGate}**.`,
);
say();
// INT-1 fires on every checkout card field, so check the reading does not rest on it alone.
const noInt1 = (families: Family[]) => (s: Scored) =>
  s.findings.some((f) => f.rule !== "INT-1" && families.includes(familyOf[f.rule]));
const i2 = share(screens, noInt1(["integrity"]));
const id2 = share(screens, noInt1(["integrity", "design"]));
say(
  `Without INT-1: integrity ${fmt(i2)}, integrity or design ${fmt(id2)}. Reading: **${gate(i2, id2)}**.`,
);
say();

// ---- speed ----

const quantile = (xs: number[], q: number) => {
  if (!xs.length) return null;
  const sorted = [...xs].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))] ?? null;
};
const sec = (ms: number | null) => (ms == null ? "n/a" : `${(ms / 1000).toFixed(1)}s`);
const num = (n: number | null) => (n == null ? "n/a" : Math.round(n).toLocaleString("en-US"));

type Tokens = { input: number; output: number; reasoning: number | null };
function tokens(s: Scored): Tokens {
  const u = (s.capture.usage ?? {}) as Record<string, number | undefined>;
  if (s.capture.cli === "claude") {
    return {
      input:
        (u.input_tokens ?? 0) +
        (u.cache_creation_input_tokens ?? 0) +
        (u.cache_read_input_tokens ?? 0),
      output: u.output_tokens ?? 0,
      reasoning: null,
    };
  }
  return {
    input: u.input_tokens ?? 0,
    output: u.output_tokens ?? 0,
    reasoning: u.reasoning_output_tokens ?? null,
  };
}

say("## Speed baseline");
say();
say("Wall time from CLI spawn, so it includes CLI start-up. Medians, with p90 in brackets.");
say();
say("| model | screens | time to first node | time to complete | input tokens | output tokens |");
say("|---|---|---|---|---|---|");
for (const m of models) {
  const xs = screens.filter((s) => s.model === m);
  const first = xs.map((s) => s.compiled.firstNodeMs).filter((t): t is number => t != null);
  const total = xs.map((s) => s.capture.totalMs);
  const tok = xs.map(tokens);
  const cell = (v: number[], f: (n: number | null) => string) =>
    `${f(quantile(v, 0.5))} (${f(quantile(v, 0.9))})`;
  say(
    `| ${m} | ${xs.length} | ${first.length ? cell(first, sec) : "not streamed"} | ${cell(total, sec)} | ${cell(
      tok.map((t) => t.input),
      num,
    )} | ${cell(
      tok.map((t) => t.output),
      num,
    )} |`,
  );
}
say();

// ---- validity ----

say("## Spec validity");
say();
say(
  "| model | json-render issues | lossless fixes applied | non-patch lines | page errors | empty specs |",
);
say("|---|---|---|---|---|---|");
for (const m of models) {
  const xs = screens.filter((s) => s.model === m);
  const empty = xs.filter((s) => !Object.keys(s.compiled.spec.elements ?? {}).length).length;
  say(
    `| ${m} | ${fmt(share(xs, (s) => s.compiled.issues.length > 0))} | ${fmt(share(xs, (s) => s.compiled.fixes.length > 0))} | ${fmt(share(xs, (s) => s.compiled.skippedLines > 0))} | ${fmt(share(xs, (s) => s.doms.some((d) => d.errors.length > 0)))} | ${empty}/${xs.length} |`,
  );
}
const codes = new Map<string, number>();
for (const s of screens)
  for (const c of new Set(s.compiled.issues.map((i) => i.code)))
    codes.set(c, (codes.get(c) ?? 0) + 1);
if (codes.size)
  say(`\nIssue codes by screen: ${[...codes].map(([c, n]) => `${c} ${n}`).join(", ")}.`);
say();

// ---- axe ----

say("## Accessibility scan (axe, WCAG 2.2 A and AA tags)");
say();
say(
  "Reported apart from the rules; `target-size` also feeds ARR-4. Screens with the violation at any width.",
);
say();
const axeIds = [
  ...new Set(screens.flatMap((s) => s.doms.flatMap((d) => d.axe.map((a) => a.id)))),
].sort();
say(`| violation | ${models.join(" | ")} | all |`);
say(`|---|${models.map(() => "---").join("|")}|---|`);
for (const id of axeIds) {
  const hit = (s: Scored) => s.doms.some((d) => d.axe.some((a) => a.id === id));
  say(
    `| ${id} | ${models
      .map((m) =>
        fmt(
          share(
            screens.filter((s) => s.model === m),
            hit,
          ),
        ),
      )
      .join(" | ")} | ${fmt(share(screens, hit))} |`,
  );
}
if (!axeIds.length) say("| none | | |");
say();

// ---- precision and recall ----

say("## Rule precision and recall against human labels");
say();
type Score = { tp: number; fp: number; fn: number; tn: number; unsure: number };

function scoreTable(answers: Answers, source: string) {
  const labelled = screens.filter((s) => answers[s.id]);
  say("| rule | fired and yes | fired and no | missed | precision | recall | |");
  say("|---|---|---|---|---|---|---|");
  for (const r of RULES) {
    const sc: Score = { tp: 0, fp: 0, fn: 0, tn: 0, unsure: 0 };
    for (const s of labelled) {
      const answer = answers[s.id]?.[r.id];
      const fired = s.findings.some((f) => f.rule === r.id);
      if (answer === "unsure" || answer === undefined) sc.unsure++;
      else if (fired) sc[answer === "yes" ? "tp" : "fp"]++;
      else sc[answer === "yes" ? "fn" : "tn"]++;
    }
    const p = sc.tp + sc.fp ? sc.tp / (sc.tp + sc.fp) : null;
    const rc = sc.tp + sc.fn ? sc.tp / (sc.tp + sc.fn) : null;
    const note =
      p == null ? "no firings in the sample: no precision" : p < 0.7 ? "rewrite before M5" : "";
    say(
      `| ${r.id} | ${sc.tp} | ${sc.fp} | ${sc.fn} | ${p == null ? "n/a" : `${sc.tp}/${sc.tp + sc.fp} = ${p.toFixed(2)}`} | ${rc == null ? "n/a" : `${sc.tp}/${sc.tp + sc.fn} = ${rc.toFixed(2)}`} | ${note} |`,
    );
  }
  say();
  const yes = (families: Family[]) => (s: Scored) =>
    RULES.some((r) => families.includes(r.family) && answers[s.id]?.[r.id] === "yes");
  const hi = share(labelled, yes(["integrity"]));
  const hid = share(labelled, yes(["integrity", "design"]));
  say(
    `From ${source}: integrity ${fmt(hi)}, integrity or design ${fmt(hid)}. The gate's thresholds would read: ${gate(hi, hid)}. Not the gate; it reads rule output.`,
  );
}

if (!blind) {
  say(
    `No labels yet. Run \`bun run label\`, label the sample in \`results/${study}/labelling.html\` and save the export as \`results/${study}/labels.json\`.`,
  );
} else {
  say(
    `${Object.keys(blind).length} screens labelled blind by ${labeller}. Unsure answers are left out.`,
  );
  say();
  scoreTable(blind, "blind human labels on the sample");
  if (blindLabels && adjudicated && rechecked) {
    const pairs = Object.entries(rechecked.labels).flatMap(([t, own]) =>
      Object.entries(own).map(([r, a]) => [blindLabels.labels[t]?.[r as RuleId], a]),
    );
    const changed = pairs.filter(([was, now]) => was !== now).length;
    say();
    say("### After recheck");
    say();
    say(
      `${pairs.length} blind answers that contradicted a rule whose question the spec answers outright (${LITERAL.join(", ")}) were rechecked with the rule's evidence shown; ${changed} changed. These numbers are no longer blind.`,
    );
    say();
    scoreTable(adjudicated, "rechecked human labels on the sample");
  }
}
say();

const report = out.join("\n");
writeFileSync(join(dir, "report.md"), `${report}\n`);
console.log(report);

// ---- gallery ----

const esc = (s: string) =>
  s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] ?? c);
const colour: Record<Family, string> = {
  integrity: "#dc2626",
  design: "#7c3aed",
  arrangement: "#ea580c",
  data: "#0284c7",
};

function shot(s: Scored, i: number): string {
  const d = s.doms[i];
  if (!d) return "";
  const marks = s.findings
    .filter((f) => f.width === undefined || f.width === d.width)
    .map((f) => {
      const box = f.elementKey ? d.boxes[f.elementKey] : null;
      const [x, y, w, h] = box ?? [0, 0, d.width, d.height];
      return `<rect x="${x}" y="${y}" width="${w}" height="${h}" stroke="${colour[familyOf[f.rule]]}" ${box ? "" : 'stroke-dasharray="12 8"'}><title>${f.rule}: ${esc(f.detail)}</title></rect>`;
    })
    .join("");
  const src = `screens/${s.id}.${d.width}.jpg`;
  return `<figure style="width:${Math.round(d.width / 3)}px"><a href="${src}" target="_blank"><div class="frame"><img src="${src}" loading="lazy" alt="${esc(s.id)} at ${d.width}px"><svg viewBox="0 0 ${d.width} ${d.height}" preserveAspectRatio="none">${marks}</svg></div></a><figcaption>${d.width}px</figcaption></figure>`;
}

function verdicts(s: Scored): string {
  const own = labels?.[s.id];
  return RULES.map((r) => {
    const found = s.findings.filter((f) => f.rule === r.id);
    const answer = own?.[r.id];
    if (!found.length && answer !== "yes") return "";
    const agree = !answer
      ? "unlabelled"
      : answer === "unsure"
        ? "unsure"
        : found.length
          ? answer === "yes"
            ? "agree"
            : "false positive"
          : "missed";
    const details = found
      .map(
        (f) => `${f.width ? `@${f.width} ` : ""}${esc(f.elementKey ?? "page")}: ${esc(f.detail)}`,
      )
      .join("<br>");
    return `<tr><td style="color:${colour[r.family]}">${r.id}</td><td>${esc(r.title)}<div class="muted">${details || "rule did not fire"}</div></td><td class="${agree.replace(" ", "-")}">${agree}</td></tr>`;
  }).join("");
}

const cards = screens
  .map(
    (
      s,
    ) => `<section id="${s.id}"><header><h2>${s.id}</h2><span class="muted">${s.prompt.category} · ${s.model}</span></header>
<p>${esc(s.prompt.text)}</p>
<div class="row"><div class="shots">${s.doms.map((_, i) => shot(s, i)).join("")}</div>
<table><thead><tr><th>rule</th><th>finding</th><th>human</th></tr></thead><tbody>${verdicts(s) || '<tr><td colspan="3" class="muted">no findings, no yes labels</td></tr>'}</tbody></table></div></section>`,
  )
  .join("\n");

writeFileSync(
  join(dir, "gallery.html"),
  `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>M2 gallery ${study}</title>
<style>
body{font:14px/1.45 system-ui,sans-serif;margin:24px;color:#171717;background:#fafafa}
section{background:#fff;border:1px solid #e5e5e5;border-radius:8px;padding:16px;margin:0 0 24px}
header{display:flex;gap:12px;align-items:baseline}h2{margin:0;font-size:16px}
.muted{color:#737373;font-size:12px}.row{display:flex;gap:24px;flex-wrap:wrap;align-items:flex-start}
.shots{display:flex;gap:12px;align-items:flex-start}figure{margin:0}figcaption{font-size:12px;color:#737373}
.frame{position:relative;border:1px solid #e5e5e5}.frame img{display:block;width:100%}
.frame svg{position:absolute;inset:0;width:100%;height:100%}rect{fill:none;stroke-width:4;vector-effect:non-scaling-stroke}
table{border-collapse:collapse;min-width:320px;max-width:520px}td,th{border-top:1px solid #eee;padding:4px 8px;text-align:left;vertical-align:top}
.agree{color:#15803d}.false-positive{color:#b91c1c}.missed{color:#c2410c}.unlabelled,.unsure{color:#737373}
.legend span{margin-right:12px}
</style></head><body><h1>M2 gallery: ${study}</h1>
<p class="legend">${Object.entries(colour)
    .map(([f, c]) => `<span style="color:${c}">■ ${f}</span>`)
    .join(
      "",
    )} Dashed outline: finding with no element box. Rule output and human labels side by side.</p>
${cards}</body></html>
`,
);
console.log(
  `\nwrote ${join("results", study, "report.md")} and ${join("results", study, "gallery.html")}`,
);
