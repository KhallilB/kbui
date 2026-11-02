// Agreement between the human labels and each model labeller on the same blind sample.
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { parseArgs } from "node:util";
import { type Answers, adjudicate, type Labels } from "./labels";
import { RULES, type RuleId } from "./rules";
import { studyDir } from "./study";

export type Tally = { yy: number; yn: number; ny: number; nn: number; unpaired: number };

/** First letter is labeller a's answer, second is b's; unsure or missing on either side is unpaired. */
export function tally(a: Answers, b: Answers, rule: RuleId, tokens: string[]): Tally {
  const t: Tally = { yy: 0, yn: 0, ny: 0, nn: 0, unpaired: 0 };
  for (const token of tokens) {
    const x = a[token]?.[rule];
    const y = b[token]?.[rule];
    if ((x !== "yes" && x !== "no") || (y !== "yes" && y !== "no")) t.unpaired++;
    else t[`${x[0]}${y[0]}` as "yy" | "yn" | "ny" | "nn"]++;
  }
  return t;
}

/** Cohen's kappa; null when chance agreement is total, so kappa says nothing. */
export function kappa({ yy, yn, ny, nn }: Tally): number | null {
  const n = yy + yn + ny + nn;
  if (!n) return null;
  const aYes = (yy + yn) / n;
  const bYes = (yy + ny) / n;
  const chance = aYes * bYes + (1 - aYes) * (1 - bYes);
  return chance === 1 ? null : ((yy + nn) / n - chance) / (1 - chance);
}

if (import.meta.main) {
  const { values } = parseArgs({ options: { study: { type: "string" } } });
  if (!values.study) throw new Error("usage: agreement --study <id>");
  const dir = studyDir(values.study);
  const read = (f: string): Labels => JSON.parse(readFileSync(join(dir, f), "utf8"));
  const human = read("labels.json");
  const rechecked = existsSync(join(dir, "adjudicated.json"))
    ? adjudicate(human.labels, read("adjudicated.json").labels)
    : human.labels;
  const sample: string[] = JSON.parse(readFileSync(join(dir, "sample.json"), "utf8"));
  const tokens = sample.map((_, i) => String(i + 1).padStart(2, "0"));
  const generator = (token: string) => sample[Number(token) - 1]?.split(".")[1] ?? "?";
  const fmt = (k: number | null) => (k === null ? "n/a" : k.toFixed(2));
  const pct = (t: Tally) => {
    const n = t.yy + t.yn + t.ny + t.nn;
    return n ? `${t.yy + t.nn}/${n} (${(((t.yy + t.nn) / n) * 100).toFixed(0)}%)` : "n/a";
  };
  const yesCount = (labels: Answers, ts: string[]) =>
    ts.reduce(
      (sum, t) => sum + Object.values(labels[t] ?? {}).filter((a) => a === "yes").length,
      0,
    );

  const models = readdirSync(dir).filter((f) => /^labels\.codex-.+\.json$/.test(f));
  const lines = [
    `# Labeller agreement, ${values.study}`,
    "",
    `Human: blind \`labels.json\` (${human.labeller}), and the same with \`adjudicated.json\` laid over it after the non-blind recheck. Each model labeller saw the same ${tokens.length} blind screens, screenshots, outline, questions and hints, and no rule output. A pair with an unsure or missing answer on either side is unpaired. Kappa is n/a when both labellers gave one answer throughout.`,
  ];
  for (const file of models) {
    const model = read(file);
    lines.push(
      "",
      `## ${model.labeller}`,
      "",
      "| rule | both yes | human only | model only | both no | unpaired | agreement | κ blind | κ after recheck |",
      "|---|---|---|---|---|---|---|---|---|",
    );
    for (const r of RULES) {
      const t = tally(human.labels, model.labels, r.id, tokens);
      const after = tally(rechecked, model.labels, r.id, tokens);
      lines.push(
        `| ${r.id} | ${t.yy} | ${t.yn} | ${t.ny} | ${t.nn} | ${t.unpaired} | ${pct(t)} | ${fmt(kappa(t))} | ${fmt(kappa(after))} |`,
      );
    }
    lines.push(
      "",
      "Yes answers by the model that generated the screen; a labeller from the same family as a generator may mark that generator's screens more kindly.",
      "",
      "| generator | screens | human yes (blind) | model yes |",
      "|---|---|---|---|",
    );
    for (const g of [...new Set(tokens.map(generator))].sort()) {
      const ts = tokens.filter((t) => generator(t) === g);
      lines.push(
        `| ${g} | ${ts.length} | ${yesCount(human.labels, ts)} | ${yesCount(model.labels, ts)} |`,
      );
    }
  }
  writeFileSync(join(dir, "agreement.md"), `${lines.join("\n")}\n`);
  console.log(
    `wrote ${join("results", values.study, "agreement.md")} for ${models.length} model labellers`,
  );
}
