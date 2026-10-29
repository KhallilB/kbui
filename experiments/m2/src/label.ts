// Draws the labelling sample and writes a blind labelling page. No rule output, no model names.
import { existsSync, linkSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { parseArgs } from "node:util";
import { loadScreens, type Screen } from "./load";
import { literals, RULES, walk } from "./rules";
import { studyDir } from "./study";

const SAMPLE_SIZE = 50;

const { values } = parseArgs({ options: { study: { type: "string" } } });
if (!values.study) throw new Error("usage: label --study <id>");
const study = values.study;
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
const short = (v: unknown) => {
  const s = typeof v === "string" ? v : JSON.stringify(v);
  return s.length > 90 ? `${s.slice(0, 87)}...` : s;
};

function pointer(state: unknown, path: unknown): unknown {
  if (typeof path !== "string") return undefined;
  return path
    .split("/")
    .filter(Boolean)
    .reduce<unknown>(
      (n, k) => (n && typeof n === "object" ? (n as Record<string, unknown>)[k] : undefined),
      state,
    );
}

/** Raw spec facts a reviewer would find by reading the JSON or clicking around. */
function outline(s: Screen): string {
  const spec = s.compiled.spec;
  const state = (spec as { state?: unknown }).state ?? {};
  return walk(spec)
    .map(({ el, depth }) => {
      const p = (el.props ?? {}) as Record<string, unknown>;
      const text = literals([p.title, p.label, p.text, p.description, p.placeholder]).join(" · ");
      const facts: string[] = [];
      if (p.level) facts.push(String(p.level));
      if ("variant" in p) facts.push(`variant ${p.variant ?? "default"}`);
      if (p.type) facts.push(`type ${p.type}`);
      if ("checked" in p) {
        const c = p.checked as Record<string, unknown> | boolean;
        const start = c && typeof c === "object" ? pointer(state, c.$bindState ?? c.$state) : c;
        facts.push(`starts ${start === true ? "on" : "off"}`);
      }
      if (Array.isArray(p.rows)) facts.push(`${p.rows.length} rows`);
      if (el.repeat) {
        const items = pointer(state, el.repeat.statePath);
        facts.push(
          `repeats ${short(el.repeat.statePath)}${Array.isArray(items) ? ` (${items.length} items)` : ""}`,
        );
      }
      if (el.visible !== undefined) facts.push(`visible when ${short(el.visible)}`);
      for (const [event, binding] of Object.entries(el.on ?? {})) {
        for (const b of (Array.isArray(binding) ? binding : [binding]) as Record<
          string,
          unknown
        >[]) {
          const params = b.params ? ` ${short(b.params)}` : "";
          const confirm = b.confirm ? ` with confirm ${short(b.confirm)}` : "";
          facts.push(`on ${event}: ${b.action}${params}${confirm}`);
        }
      }
      if (p.openPath) facts.push(`open when ${short(p.openPath)}`);
      return `<div style="padding-left:${(depth - 1) * 14}px"><b>${esc(el.type)}</b> <span class="d">${depth}</span> ${text ? `“${esc(short(text))}”` : ""} <span class="f">${esc(facts.join("; "))}</span></div>`;
    })
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

const cards = items
  .map(
    ({
      id,
      blind,
      s,
    }) => `<section data-id="${id}"><h2>${blind} <span class="progress"></span></h2><p class="prompt">${esc(s.prompt.text)}</p>
<div class="shots">${s.doms.map((d) => `<a href="blind/${id}.${d.width}.jpg" target="_blank"><img loading="lazy" src="blind/${id}.${d.width}.jpg" style="width:${Math.round(d.width / 3)}px" alt="${blind} at ${d.width}px"><small>${d.width}px</small></a>`).join("")}</div>
<details><summary>Spec outline (type, depth, text, behaviour)</summary><div class="outline">${outline(s)}</div></details>
<fieldset>${RULES.map(
      (r) =>
        `<div class="q"><span>${esc(r.question)}</span>${["yes", "no", "unsure"].map((a) => `<label><input type="radio" name="${id}|${r.id}" value="${a}"> ${a}</label>`).join("")}</div>`,
    ).join(
      "",
    )}<button type="button" class="rest">Mark unanswered as no</button></fieldset></section>`,
  )
  .join("\n");

writeFileSync(
  join(dir, "labelling.html"),
  `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>M2 labelling ${study}</title>
<style>
body{font:14px/1.45 system-ui,sans-serif;margin:0;color:#171717;background:#fafafa}
.bar{position:sticky;top:0;background:#fff;border-bottom:1px solid #e5e5e5;padding:12px 24px;display:flex;gap:12px;align-items:center;z-index:1}
main{padding:24px;max-width:1200px}section{background:#fff;border:1px solid #e5e5e5;border-radius:8px;padding:16px;margin:0 0 24px}
h2{margin:0 0 4px;font-size:16px}.prompt{color:#404040}.shots{display:flex;gap:12px;align-items:flex-start;overflow-x:auto}
.shots a{display:flex;flex-direction:column;color:#737373;text-decoration:none}.shots img{border:1px solid #e5e5e5}
.outline{font:12px/1.5 ui-monospace,monospace;max-height:420px;overflow:auto;background:#f5f5f5;padding:8px;border-radius:6px}
.d{color:#a3a3a3}.f{color:#2563eb}fieldset{border:0;padding:0;margin:12px 0 0}
.q{display:grid;grid-template-columns:1fr repeat(3,auto);gap:4px 12px;padding:6px 0;border-top:1px solid #f0f0f0;align-items:center}
.q label{white-space:nowrap}.progress{font-weight:400;color:#737373;font-size:12px}.done{color:#15803d}
</style></head><body>
<div class="bar"><label>Labeller <input id="who" placeholder="your name"></label><span id="count"></span><button id="export">Export labels.json</button></div>
<main><p>Answer each question from the screenshots and the spec outline. The page saves as you go in this browser. When done, export and save the file as <code>results/${study}/labels.json</code>.</p>
${cards}</main>
<script>
const KEY = "m2-labels-${study}";
const TOTAL = ${items.length * RULES.length};
let saved = {};
try { saved = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch {}
saved.labels ||= {};
const who = document.getElementById("who");
who.value = saved.labeller || "";
const store = () => { try { localStorage.setItem(KEY, JSON.stringify(saved)); } catch {} };
const refresh = () => {
  let n = 0;
  for (const sec of document.querySelectorAll("section")) {
    const got = Object.keys(saved.labels[sec.dataset.id] || {}).length;
    n += got;
    const tag = sec.querySelector(".progress");
    tag.textContent = got + "/${RULES.length}";
    tag.className = "progress" + (got === ${RULES.length} ? " done" : "");
  }
  document.getElementById("count").textContent = n + "/" + TOTAL + " answered";
};
for (const input of document.querySelectorAll("input[type=radio]")) {
  const [id, rule] = input.name.split("|");
  if (saved.labels[id]?.[rule] === input.value) input.checked = true;
  input.addEventListener("change", () => { (saved.labels[id] ||= {})[rule] = input.value; store(); refresh(); });
}
for (const button of document.querySelectorAll(".rest")) {
  button.addEventListener("click", () => {
    const sec = button.closest("section");
    for (const input of sec.querySelectorAll("input[value=no]")) {
      const [id, rule] = input.name.split("|");
      if (!saved.labels[id]?.[rule]) { input.checked = true; (saved.labels[id] ||= {})[rule] = "no"; }
    }
    store(); refresh();
  });
}
who.addEventListener("input", () => { saved.labeller = who.value; store(); });
document.getElementById("export").addEventListener("click", () => {
  const body = JSON.stringify({ study: "${study}", labeller: who.value || "unnamed", labels: saved.labels }, null, 2);
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([body], { type: "application/json" }));
  a.download = "labels.json";
  a.click();
});
refresh();
</script></body></html>
`,
);
console.log(`sampled ${sample.length} screens; wrote ${join("results", study, "labelling.html")}`);
