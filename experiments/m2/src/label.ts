// Draws the labelling sample and writes a blind labelling page. No rule output, no model names.
import { existsSync, linkSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { parseArgs } from "node:util";
import { hintsFor, outlineRows, short } from "./blind";
import { type Labels, type Recheck, rechecks } from "./labels";
import { loadScreens, type Screen } from "./load";
import { domFindings, RULES, rulesFor, treeFindings } from "./rules";
import { questionVersion, studyDir } from "./study";

const SAMPLE_SIZE = 50;

const { values } = parseArgs({
  options: {
    study: { type: "string" },
    questions: { type: "string" },
    serve: { type: "boolean", default: false },
    recheck: { type: "boolean", default: false },
    port: { type: "string", default: process.env.PORT ?? "4319" },
  },
});
if (!values.study)
  throw new Error("usage: label --study <id> [--questions v1|v2] [--serve [--recheck]]");
if (values.recheck && !values.serve) throw new Error("--recheck needs --serve");
const study = values.study;
const version = questionVersion(study, values.questions);
const activeRules = rulesFor(version);
const activeHints = hintsFor(version);
const dir = studyDir(study);
const screens = loadScreens(study);

// Seeded so the sample is reproducible from the study id alone.
function random(seed: string) {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 2 ** 32;
  };
}
function shuffle<T>(xs: T[], rand: () => number): T[] {
  const out = [...xs];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j] as T, out[i] as T];
  }
  return out;
}

// Stratified: deal shuffled category-by-model cells round-robin until the sample is full.
const samplePath = join(dir, "sample.json");
let sample: string[];
if (existsSync(samplePath)) {
  sample = JSON.parse(readFileSync(samplePath, "utf8"));
} else {
  const rand = random(study);
  const cells = new Map<string, Screen[]>();
  for (const s of screens) {
    const k = `${s.prompt.category}/${s.model}`;
    cells.set(k, [...(cells.get(k) ?? []), s]);
  }
  const queues = [...cells.values()].map((c) => shuffle(c, rand));
  sample = [];
  while (sample.length < Math.min(SAMPLE_SIZE, screens.length)) {
    for (const q of queues) {
      const next = q.shift();
      if (next && sample.length < SAMPLE_SIZE) sample.push(next.id);
    }
  }
  sample = shuffle(sample, rand);
  writeFileSync(samplePath, `${JSON.stringify(sample, null, 2)}\n`);
}

const esc = (s: string) =>
  s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] ?? c);
function outline(s: Screen): string {
  return outlineRows(s.compiled.spec)
    .map(
      ({ type, depth, text, facts }) =>
        `<div style="padding-left:${(depth - 1) * 14}px"><b>${esc(type)}</b> <span class="d">${depth}</span> ${text ? `“${esc(short(text))}”` : ""} <span class="f">${esc(facts.join("; "))}</span></div>`,
    )
    .join("");
}

const byId = new Map(screens.map((s) => [s.id, s]));
// Page, files and export use tokens only; sample.json maps tokens back to screens.
const blindDir = join(dir, "blind");
rmSync(blindDir, { recursive: true, force: true });
mkdirSync(blindDir);
const items = sample.map((id, i) => {
  const token = String(i + 1).padStart(2, "0");
  const s = byId.get(id) as Screen;
  for (const d of s.doms)
    linkSync(
      join(dir, "screens", `${id}.${d.width}.jpg`),
      join(blindDir, `${token}.${d.width}.jpg`),
    );
  return { id: token, blind: `screen ${token}`, s };
});

// Recheck mode asks only the questions where the blind answer contradicts a literal rule.
const file = values.recheck ? "adjudicated.json" : "labels.json";
let disputed: Recheck[] = [];
if (values.recheck) {
  const labelsPath = join(dir, "labels.json");
  if (!existsSync(labelsPath)) throw new Error("no labels.json yet; label the sample first");
  const blind: Labels = JSON.parse(readFileSync(labelsPath, "utf8"));
  disputed = rechecks(
    items.map(({ id, s }) => ({
      token: id,
      findings: [...treeFindings(s.compiled.spec), ...domFindings(s.doms, s.compiled.spec)],
    })),
    blind.labels,
  );
}
const note = (r: Recheck) =>
  `${r.evidence.length ? `Rule found: ${esc(r.evidence.map(short).join("; "))}` : "Rule found nothing"} · Your first answer: ${r.blind}`;

function page(server: boolean): string {
  const shown = values.recheck
    ? items.filter(({ id }) => disputed.some((r) => r.token === id))
    : items;
  const data = {
    study,
    server,
    file,
    recheck: values.recheck,
    rules: activeRules.map(({ id, family, question }) => ({
      id,
      family,
      question,
      hint: activeHints[id],
    })),
    screens: shown.map(({ id, s }) => {
      const own = disputed.filter((r) => r.token === id);
      return {
        token: id,
        prompt: s.prompt.text,
        widths: s.doms.map((d) => d.width),
        outline: outline(s),
        ...(values.recheck && {
          rules: own.map((r) => r.rule),
          notes: Object.fromEntries(own.map((r) => [r.rule, note(r)])),
        }),
      };
    }),
  };
  // Escape "<" so spec text cannot close the script element.
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return readFileSync(join(import.meta.dir, "labelling.html"), "utf8")
    .replace("<title>M2 labelling</title>", `<title>M2 labelling ${study}</title>`)
    .replace("/*DATA*/ null", json);
}

if (values.recheck) {
  console.log(
    `${disputed.length} answers to recheck on ${new Set(disputed.map((r) => r.token)).size} screens`,
  );
} else {
  writeFileSync(join(dir, "labelling.html"), page(false));
  console.log(
    `sampled ${sample.length} screens; wrote ${join("results", study, "labelling.html")}`,
  );
}

if (values.serve) {
  const tokens = new Set(items.map((i) => i.id));
  const ruleIds = new Set<string>(RULES.map((r) => r.id));
  const allowed = (t: string, r: string) =>
    values.recheck ? disputed.some((d) => d.token === t && d.rule === r) : ruleIds.has(r);
  const labelsPath = join(dir, file);
  const valid = (
    body: unknown,
  ): body is {
    study: string;
    labeller: string;
    labels: Record<string, Record<string, string>>;
  } => {
    if (!body || typeof body !== "object") return false;
    const b = body as Record<string, unknown>;
    if (b.study !== study || typeof b.labeller !== "string" || b.labeller.length > 100)
      return false;
    if (!b.labels || typeof b.labels !== "object") return false;
    return Object.entries(b.labels).every(
      ([t, own]) =>
        tokens.has(t) &&
        own &&
        typeof own === "object" &&
        Object.entries(own).every(
          ([r, a]) => allowed(t, r) && ["yes", "no", "unsure"].includes(a as string),
        ),
    );
  };
  const server = Bun.serve({
    hostname: "127.0.0.1",
    port: Number(values.port),
    async fetch(req) {
      const path = new URL(req.url).pathname;
      if (req.method === "PUT" && path === `/${file}`) {
        const body = await req.json().catch(() => null);
        if (!valid(body)) return new Response("labels do not match this sample", { status: 400 });
        writeFileSync(labelsPath, `${JSON.stringify(body, null, 2)}\n`);
        return new Response("saved");
      }
      if (req.method !== "GET") return new Response("method not allowed", { status: 405 });
      if (path === "/" || path === "/labelling.html") {
        // Rebuilt per request so template edits show on refresh.
        return new Response(page(true), {
          headers: { "content-type": "text/html; charset=utf-8" },
        });
      }
      if (path === `/${file}`) {
        return existsSync(labelsPath)
          ? new Response(Bun.file(labelsPath))
          : new Response("none", { status: 404 });
      }
      const shot = path.match(/^\/blind\/(\d{2})\.(\d+)\.jpg$/);
      if (shot && tokens.has(shot[1] as string)) {
        const file = join(blindDir, `${shot[1]}.${shot[2]}.jpg`);
        if (existsSync(file)) return new Response(Bun.file(file));
      }
      return new Response("not found", { status: 404 });
    },
  });
  console.log(
    `${values.recheck ? "recheck" : "labelling"} at http://127.0.0.1:${server.port}/ — answers save to ${join("results", study, file)}`,
  );
}
