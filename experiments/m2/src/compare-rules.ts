// Scores v1 and v2 rules against every labeller on the frozen M2 sample. No model call, no browser.
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { parseArgs } from "node:util";
import { type Answers, adjudicate, type Labels } from "./labels";
import { loadScreens } from "./load";
import { domFindings, type Finding, RULES, type RuleId, treeFindings } from "./rules";
import { REWRITTEN, treeFindingsV2 } from "./rules-v2";
import { studyDir } from "./study";

const WHY: Partial<Record<RuleId, string>> = {
  "INT-1":
    "labels disagree with themselves: a card form is a problem at checkout and not in billing settings",
  "INT-2":
    "only irreversible actions: delete, erase, close an account, cancel a subscription or order",
  "INT-3": "adds common deadline and scarcity phrases",
  "INT-4": "the rule matches the spec; the one false alarm is a newsletter switch that starts on",
  "INT-5": "no instances in the sample",
  "DES-1": "counts filled danger and default buttons, ignores buttons in closed dialogs",
  "DES-2":
    "labels disagree with themselves: the same h1 to h3 skip is marked both ways after recheck",
  "ARR-1": "already at or above 0.7",
  "ARR-2": "the frozen probes did not record what the labeller saw; needs new measurements",
  "ARR-3": "the frozen probes did not record what the labeller saw; needs new measurements",
  "ARR-4": "rewritten in the previous change",
  "DATA-1": "already at or above 0.7",
  "DATA-2": "only lists the UI adds to or removes from, which can become empty",
};

const { values } = parseArgs({ options: { study: { type: "string" } } });
if (!values.study) throw new Error("usage: compare-rules --study <id>");
const dir = studyDir(values.study);
const read = (f: string): Labels => JSON.parse(readFileSync(join(dir, f), "utf8"));
const sample: string[] = JSON.parse(readFileSync(join(dir, "sample.json"), "utf8"));
const byScreen = (answers: Answers): Answers =>
  Object.fromEntries(Object.entries(answers).map(([t, a]) => [sample[Number(t) - 1], a]));

const human = read("labels.json");
const labellers: [string, Answers][] = [
  ["human blind", byScreen(human.labels)],
  ...(existsSync(join(dir, "adjudicated.json"))
    ? ([
        [
          "human after recheck",
          byScreen(adjudicate(human.labels, read("adjudicated.json").labels)),
        ],
      ] as [string, Answers][])
    : []),
  ...readdirSync(dir)
    .filter((f) => /^labels\.codex-.+\.json$/.test(f))
    .map((f): [string, Answers] => [read(f).labeller, byScreen(read(f).labels)]),
];

const screens = loadScreens(values.study).map((s) => ({
  id: s.id,
  v1: [...treeFindings(s.compiled.spec), ...domFindings(s.doms, s.compiled.spec)],
  v2: [...treeFindingsV2(s.compiled.spec), ...domFindings(s.doms, s.compiled.spec)],
}));

const fires = (fs: Finding[], rule: RuleId) => fs.some((f) => f.rule === rule);
function score(answers: Answers, version: "v1" | "v2", rule: RuleId) {
  let tp = 0;
  let fp = 0;
  let fn = 0;
  for (const s of screens) {
    const a = answers[s.id]?.[rule];
    if (a !== "yes" && a !== "no") continue;
    if (fires(s[version], rule)) a === "yes" ? tp++ : fp++;
    else if (a === "yes") fn++;
  }
  const ratio = (n: number, d: number) => (d ? `${n}/${d} = ${(n / d).toFixed(2)}` : "n/a");
  return { precision: ratio(tp, tp + fp), recall: ratio(tp, tp + fn) };
}

const lines = [
  `# Rules v1 and v2, ${values.study}`,
  "",
  `v1 is the rule set M2 recorded, and \`report.md\` still uses it. v2 rewrites ${REWRITTEN.join(", ")}, fitted to the human labels after recheck. Scores against human labels are therefore in-sample. The Codex labels were not used to write v2. Unsure or missing answers are left out.`,
  "",
  "## Firings on all 60 screens",
  "",
  "| rule | v1 | v2 | change |",
  "|---|---|---|---|",
  ...RULES.map((r) => {
    const n = (v: "v1" | "v2") => screens.filter((s) => fires(s[v], r.id)).length;
    return `| ${r.id} | ${n("v1")} | ${n("v2")} | ${REWRITTEN.includes(r.id) ? "rewritten" : "unchanged"}: ${WHY[r.id] ?? ""} |`;
  }),
];
for (const [name, answers] of labellers) {
  lines.push(
    "",
    `## Against ${name}`,
    "",
    "| rule | v1 precision | v2 precision | v1 recall | v2 recall |",
    "|---|---|---|---|---|",
  );
  for (const r of RULES) {
    const a = score(answers, "v1", r.id);
    const b = score(answers, "v2", r.id);
    lines.push(`| ${r.id} | ${a.precision} | ${b.precision} | ${a.recall} | ${b.recall} |`);
  }
}
writeFileSync(join(dir, "rules-v2.md"), `${lines.join("\n")}\n`);
console.log(
  `wrote ${join("results", values.study, "rules-v2.md")} for ${labellers.length} labellers`,
);
