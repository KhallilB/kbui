// Compiles captures to specs, renders each at three widths and records the page. No model call.
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { extname, join } from "node:path";
import { parseArgs } from "node:util";
import axe from "axe-core";
import { chromium } from "playwright";
import { compile } from "./compile";
import type { Measured } from "./load";
import { type Capture, root, studyDir, WIDTHS } from "./study";

const { values } = parseArgs({ options: { study: { type: "string" }, only: { type: "string" } } });
if (!values.study)
  throw new Error("usage: measure --study <id> [--only c01.claude-sonnet-5-5,...]");
const dir = studyDir(values.study);
for (const sub of ["specs", "dom", "screens"]) mkdirSync(join(dir, sub), { recursive: true });

const ids = readdirSync(join(dir, "captures"))
  .filter((f) => f.endsWith(".json"))
  .map((f) => f.replace(/\.json$/, ""))
  .filter((id) => !values.only || values.only.split(",").includes(id))
  .sort();

for (const id of ids) {
  const capture: Capture = JSON.parse(readFileSync(join(dir, "captures", `${id}.json`), "utf8"));
  writeFileSync(join(dir, "specs", `${id}.json`), `${JSON.stringify(compile(capture), null, 2)}\n`);
}

// Tailwind scans the specs for model-written classes, so build after compiling.
const build = Bun.spawnSync(["bunx", "vite", "build", "--logLevel", "error"], {
  cwd: root,
  stdout: "inherit",
  stderr: "inherit",
});
if (build.exitCode !== 0) throw new Error("render build failed");

const dist = join(root, ".render-dist");
const types: Record<string, string> = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
};
const server = Bun.serve({
  port: 0,
  fetch(req) {
    const path = new URL(req.url).pathname;
    const file = join(dist, path === "/" ? "index.html" : path);
    if (!existsSync(file)) return new Response("not found", { status: 404 });
    return new Response(Bun.file(file), {
      headers: { "content-type": types[extname(file)] ?? "application/octet-stream" },
    });
  },
});
const origin = `http://localhost:${server.port}`;

// Remote images become a fixed grey tile so geometry does not depend on the network.
const tile = Buffer.from(
  '<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8"><rect width="8" height="8" fill="#d4d4d4"/></svg>',
);

const probe = () => {
  const keyOf = (el: Element | null) =>
    el?.closest("[data-jr-key]")?.getAttribute("data-jr-key") ?? null;
  const visible = (r: DOMRect) => r.width > 0 && r.height > 0;
  const leaves = [...document.querySelectorAll("#root *")].filter((el) => {
    if (el.closest("[aria-hidden='true']")) return false;
    const interactive = el.matches(
      "button, a, input, select, textarea, [role='switch'], [role='checkbox'], [role='radio'], [role='slider'], [role='tab']",
    );
    const ownText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent?.trim());
    return (interactive || ownText) && visible(el.getBoundingClientRect());
  });
  const overlaps: { a: string | null; b: string | null; area: number }[] = [];
  for (let i = 0; i < leaves.length; i++) {
    for (let j = i + 1; j < leaves.length; j++) {
      const a = leaves[i] as Element;
      const b = leaves[j] as Element;
      if (a.contains(b) || b.contains(a)) continue;
      const ra = a.getBoundingClientRect();
      const rb = b.getBoundingClientRect();
      const w = Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left);
      const h = Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top);
      const area = Math.round(Math.max(0, w) * Math.max(0, h));
      const smaller = Math.min(ra.width * ra.height, rb.width * rb.height);
      if (area > 24 && area > smaller * 0.1) overlaps.push({ a: keyOf(a), b: keyOf(b), area });
    }
  }
  const clipped = leaves
    .filter((el) => {
      const s = getComputedStyle(el);
      const hides = s.overflowX !== "visible" || s.textOverflow === "ellipsis";
      return hides && el.scrollWidth > el.clientWidth + 1 && el.textContent?.trim();
    })
    .map((el) => ({ key: keyOf(el), text: el.textContent?.trim() ?? "" }));
  const boxes: Record<string, number[]> = {};
  for (const tag of document.querySelectorAll("[data-jr-key]")) {
    const key = tag.getAttribute("data-jr-key") as string;
    if (boxes[key]) continue;
    const rects = [...tag.children].map((c) => c.getBoundingClientRect()).filter(visible);
    if (!rects.length) continue;
    const x = Math.min(...rects.map((r) => r.left)) + scrollX;
    const y = Math.min(...rects.map((r) => r.top)) + scrollY;
    boxes[key] = [
      x,
      y,
      Math.max(...rects.map((r) => r.right)) + scrollX - x,
      Math.max(...rects.map((r) => r.bottom)) + scrollY - y,
    ].map(Math.round);
  }
  return {
    overflowX: document.documentElement.scrollWidth > innerWidth + 1,
    clipped,
    overlaps,
    boxes,
    height: document.documentElement.scrollHeight,
  };
};

const browser = await chromium.launch();
const context = await browser.newContext({ deviceScaleFactor: 1 });
await context.route(/^https?:\/\/(?!localhost)/, (route) =>
  route.request().resourceType() === "image"
    ? route.fulfill({ status: 200, contentType: "image/svg+xml", body: tile })
    : route.abort(),
);

for (const id of ids) {
  const { spec } = JSON.parse(readFileSync(join(dir, "specs", `${id}.json`), "utf8"));
  for (const width of WIDTHS) {
    const page = await context.newPage();
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(origin);
    await page.waitForFunction(() => typeof window.renderSpec === "function");
    await page.evaluate((s) => window.renderSpec(s), spec);
    await page.waitForTimeout(400);
    const geometry = await page.evaluate(probe);
    await page.addScriptTag({ content: axe.source });
    const axeResult = await page.evaluate(async () => {
      const r = await (window as unknown as { axe: typeof axe }).axe.run("#root", {
        runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] },
      });
      return r.violations.map((v) => ({
        id: v.id,
        impact: v.impact ?? null,
        keys: v.nodes.map((n) => {
          const el = document.querySelector(String(n.target[0]));
          return el?.closest("[data-jr-key]")?.getAttribute("data-jr-key") ?? null;
        }),
      }));
    });
    await page.screenshot({
      path: join(dir, "screens", `${id}.${width}.jpg`),
      fullPage: true,
      type: "jpeg",
      quality: 60,
    });
    const dom: Measured = {
      width,
      ...geometry,
      axe: axeResult,
      errors,
    };
    writeFileSync(join(dir, "dom", `${id}.${width}.json`), `${JSON.stringify(dom)}\n`);
    await page.close();
  }
  console.log(`measured ${id}`);
}

await browser.close();
server.stop();
