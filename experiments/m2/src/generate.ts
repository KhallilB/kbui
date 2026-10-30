// Generates one capture per prompt and model. The only step that calls a model.
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { parseArgs } from "node:util";
import { systemPrompt, userPrompt } from "./catalog";
import { type Capture, MODELS, type ModelId, prompts, studyDir } from "./study";

const { values } = parseArgs({
  options: {
    study: { type: "string" },
    models: { type: "string", default: Object.keys(MODELS).join(",") },
    only: { type: "string" },
    concurrency: { type: "string", default: "3" },
    scratch: { type: "string" },
    "codex-home": { type: "string" },
  },
});
if (!values.study || !values.scratch) {
  throw new Error("usage: generate --study <id> --scratch <empty dir> [--codex-home <dir>]");
}
const systemPromptHash = createHash("sha256").update(systemPrompt).digest("hex").slice(0, 16);
const study = values.study;
const scratch = values.scratch;
const dir = join(studyDir(study), "captures");
mkdirSync(dir, { recursive: true });
mkdirSync(scratch, { recursive: true });

const models = (values.models ?? "").split(",") as ModelId[];
const only = values.only?.split(",");
const jobs = prompts
  .filter((p) => !only || only.includes(p.id))
  .flatMap((p) => models.map((m) => ({ prompt: p, model: m })))
  .filter(({ prompt, model }) => !existsSync(join(dir, `${prompt.id}.${model}.json`)));

type Line = { t: number; text: string };

async function run(
  cmd: string[],
  stdin: string,
  env: Record<string, string>,
  onLine: (line: string, t: number) => void,
): Promise<{ exit: number; stderr: string }> {
  const start = performance.now();
  const proc = Bun.spawn(cmd, {
    cwd: scratch,
    stdin: new Blob([stdin]),
    stdout: "pipe",
    stderr: "pipe",
    env: { ...process.env, ...env },
  });
  const decoder = new TextDecoder();
  let buffer = "";
  for await (const chunk of proc.stdout) {
    buffer += decoder.decode(chunk, { stream: true });
    let nl = buffer.indexOf("\n");
    while (nl >= 0) {
      onLine(buffer.slice(0, nl), performance.now() - start);
      buffer = buffer.slice(nl + 1);
      nl = buffer.indexOf("\n");
    }
  }
  if (buffer) onLine(buffer, performance.now() - start);
  const exit = await proc.exited;
  return { exit, stderr: await new Response(proc.stderr).text() };
}

async function generate(promptId: string, text: string, model: ModelId): Promise<Capture> {
  const spec = MODELS[model];
  const user = userPrompt(text);
  const textLines: Line[] = [];
  let partial = "";
  let usage: unknown = null;
  let resolvedModel: string | null = null;
  const started = new Date().toISOString();
  const t0 = performance.now();

  if (spec.cli === "claude") {
    // Text deltas give per-line arrival times, so time to first node is real.
    const { exit, stderr } = await run(
      [
        "claude",
        "-p",
        "--safe-mode",
        "--model",
        spec.model,
        "--system-prompt",
        systemPrompt,
        "--tools",
        "",
        "--no-session-persistence",
        "--output-format",
        "stream-json",
        "--include-partial-messages",
        "--verbose",
      ],
      user,
      {},
      (line, t) => {
        let event: Record<string, unknown>;
        try {
          event = JSON.parse(line);
        } catch {
          return;
        }
        if (event.type === "system" && typeof event.model === "string") resolvedModel = event.model;
        if (event.type === "result") usage = event.usage ?? null;
        const delta = (event as { event?: { delta?: { type?: string; text?: string } } }).event
          ?.delta;
        if (event.type === "stream_event" && delta?.type === "text_delta" && delta.text) {
          partial += delta.text;
          let nl = partial.indexOf("\n");
          while (nl >= 0) {
            textLines.push({ t, text: partial.slice(0, nl) });
            partial = partial.slice(nl + 1);
            nl = partial.indexOf("\n");
          }
        }
      },
    );
    if (partial) textLines.push({ t: performance.now() - t0, text: partial });
    if (exit !== 0) throw new Error(`claude exited ${exit}: ${stderr.slice(0, 500)}`);
  } else {
    // Codex exposes no token deltas and no system prompt override; catalog goes in the user turn.
    const codexHome = values["codex-home"];
    if (!codexHome) throw new Error("--codex-home is required for Codex models");
    let finalText = "";
    let finalT = 0;
    const { exit, stderr } = await run(
      [
        "/Applications/ChatGPT.app/Contents/Resources/codex-cli/bin/codex",
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
        spec.model,
        "-c",
        `model_reasoning_effort="${spec.effort}"`,
        "-",
      ],
      `${systemPrompt}\n\n---\n\n${user}\n\nReply with the JSONL patch lines only. Do not run commands.`,
      { CODEX_HOME: codexHome },
      (line, t) => {
        let event: Record<string, unknown>;
        try {
          event = JSON.parse(line);
        } catch {
          return;
        }
        const item = event.item as { type?: string; text?: string } | undefined;
        if (event.type === "item.completed" && item?.type === "agent_message" && item.text) {
          finalText = item.text;
          finalT = t;
        }
        if (event.type === "turn.completed") usage = event.usage ?? null;
      },
    );
    if (exit !== 0) throw new Error(`codex exited ${exit}: ${stderr.slice(0, 500)}`);
    resolvedModel = spec.model;
    for (const text of finalText.split("\n")) textLines.push({ t: finalT, text });
  }

  return {
    promptId,
    model,
    resolvedModel,
    cli: spec.cli,
    systemPromptHash,
    started,
    totalMs: Math.round(performance.now() - t0),
    lines: textLines.map((l) => ({ t: Math.round(l.t), text: l.text })),
    usage,
    streamedLines: spec.cli === "claude",
  };
}

let next = 0;
let failures = 0;
async function worker() {
  while (next < jobs.length) {
    const job = jobs[next++];
    if (!job) return;
    const label = `${job.prompt.id}.${job.model}`;
    try {
      const capture = await generate(job.prompt.id, job.prompt.text, job.model);
      writeFileSync(join(dir, `${label}.json`), `${JSON.stringify(capture, null, 2)}\n`);
      console.log(`ok   ${label} ${capture.totalMs}ms ${capture.lines.length} lines`);
    } catch (error) {
      failures++;
      console.error(`fail ${label}: ${(error as Error).message}`);
    }
  }
}

console.log(`${jobs.length} captures to generate into ${dir}`);
await Promise.all(Array.from({ length: Number(values.concurrency) }, worker));
if (failures > 0) process.exit(1);
