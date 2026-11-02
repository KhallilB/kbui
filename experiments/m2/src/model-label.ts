// Blind model labeller: same screenshots, outline, questions and hints as the human page.
import { appendFileSync, existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { parseArgs } from "node:util";
import { hintsFor, outlineRows, outlineText } from "./blind";
import { loadScreens } from "./load";
import { type QuestionVersion, RULES, type RuleId, rulesFor } from "./rules";
import { questionVersion, studyDir } from "./study";

export type Answer = "yes" | "no" | "unsure";
const ANSWERS: Answer[] = ["yes", "no", "unsure"];
const CODEX = "/Applications/ChatGPT.app/Contents/Resources/codex-cli/bin/codex";

export function labelPrompt(outline: string, version: QuestionVersion = "v1"): string {
  const hints = hintsFor(version);
  const questions = rulesFor(version).map(
    (r) => `${r.id}: ${r.question} (Where to look: ${hints[r.id]})`,
  );
  return [
    "You are labelling one generated web screen for a study. Judge only what the screenshots and outline show.",
    "The three images are the same screen rendered 390, 768 and 1440 px wide, in that order.",
    "The outline lists each element, indented by nesting, with its depth after its type and the facts its spec states.",
    "Answer every question yes, no or unsure. Answer yes only when you can point at the problem on this screen. Do not run commands.",
    "",
    "Questions:",
    ...questions,
    "",
    "Outline:",
    outline,
  ].join("\n");
}

export function answerSchema() {
  return {
    type: "object",
    additionalProperties: false,
    required: RULES.map((r) => r.id),
    properties: Object.fromEntries(
      RULES.map((r) => [r.id, { type: "string", enum: ANSWERS }]),
    ) as Record<string, { type: string; enum: Answer[] }>,
  };
}

export function parseAnswers(text: string): Record<RuleId, Answer> {
  const reply = JSON.parse(text) as Record<string, unknown>;
  for (const r of RULES)
    if (!ANSWERS.includes(reply[r.id] as Answer)) throw new Error(`no valid answer for ${r.id}`);
  return Object.fromEntries(RULES.map((r) => [r.id, reply[r.id]])) as Record<RuleId, Answer>;
}

if (import.meta.main) {
  const { values } = parseArgs({
    options: {
      study: { type: "string" },
      questions: { type: "string" },
      model: { type: "string", default: "gpt-6.1-sol" },
      effort: { type: "string", default: "medium" },
      "codex-home": { type: "string" },
      scratch: { type: "string" },
    },
  });
  const { study, model, effort, scratch } = values;
  const codexHome = values["codex-home"];
  if (!study || !codexHome || !scratch)
    throw new Error(
      "usage: model-label --study <id> --codex-home <dir with auth.json only> --scratch <empty dir> [--questions v1|v2] [--model m] [--effort e]",
    );
  const version = questionVersion(study, values.questions);
  // Codex runs read-only in an empty directory, so it cannot read labels or rule output.
  if (readdirSync(scratch).length) throw new Error(`${scratch} is not empty`);
  const dir = studyDir(study);
  const blindDir = join(dir, "blind");
  if (!existsSync(blindDir)) throw new Error("no blind screenshots; run label.ts first");

  const slug = `codex-${(model as string).replace(/\./g, "-")}`;
  const labelsPath = join(dir, `labels.${slug}.json`);
  const callsPath = join(dir, `labels.${slug}.calls.jsonl`);
  const schemaPath = join(scratch, "..", `${slug}.schema.json`);
  writeFileSync(schemaPath, JSON.stringify(answerSchema()));

  const sample: string[] = JSON.parse(readFileSync(join(dir, "sample.json"), "utf8"));
  const byId = new Map(loadScreens(study).map((s) => [s.id, s]));
  const out: { study: string; labeller: string; labels: Record<string, Record<RuleId, Answer>> } =
    existsSync(labelsPath)
      ? JSON.parse(readFileSync(labelsPath, "utf8"))
      : { study, labeller: `codex ${model} ${effort}`, labels: {} };

  for (const [i, id] of sample.entries()) {
    const token = String(i + 1).padStart(2, "0");
    if (out.labels[token]) continue;
    const s = byId.get(id);
    if (!s) throw new Error(`sample screen ${id} not found`);
    const images = s.doms.flatMap((d) => ["-i", join(blindDir, `${token}.${d.width}.jpg`)]);
    const t0 = performance.now();
    const proc = Bun.spawn(
      [
        CODEX,
        "exec",
        "--json",
        "--ignore-rules",
        "--ephemeral",
        "--skip-git-repo-check",
        "-s",
        "read-only",
        "-C",
        scratch,
        "-m",
        model as string,
        "-c",
        `model_reasoning_effort="${effort}"`,
        "--output-schema",
        schemaPath,
        ...images,
        "-",
      ],
      {
        stdin: new Blob([labelPrompt(outlineText(outlineRows(s.compiled.spec)), version)]),
        stdout: "pipe",
        stderr: "pipe",
        env: { ...process.env, CODEX_HOME: codexHome },
      },
    );
    const [stdout, stderr, exit] = await Promise.all([
      new Response(proc.stdout).text(),
      new Response(proc.stderr).text(),
      proc.exited,
    ]);
    // With --json, Codex reports failures as stdout events, not on stderr.
    const failure = stdout
      .split("\n")
      .filter((l) => /"type":"(error|turn\.failed)"/.test(l))
      .join(" ");
    if (exit !== 0)
      throw new Error(`codex exited ${exit} on ${token}: ${(failure || stderr).slice(0, 500)}`);
    let reply = "";
    let usage: unknown = null;
    for (const line of stdout.split("\n")) {
      if (!line.trim()) continue;
      const event = JSON.parse(line) as { type?: string; item?: { type?: string; text?: string } };
      if (event.type === "item.completed" && event.item?.type === "agent_message")
        reply = event.item.text ?? "";
      if (event.type === "turn.completed") usage = (event as { usage?: unknown }).usage ?? null;
    }
    out.labels[token] = parseAnswers(reply);
    writeFileSync(labelsPath, `${JSON.stringify(out, null, 2)}\n`);
    appendFileSync(
      callsPath,
      `${JSON.stringify({ token, model, effort, ms: Math.round(performance.now() - t0), usage })}\n`,
    );
    console.log(`${token} labelled`);
  }
}
