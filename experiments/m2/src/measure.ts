// Compiles captures to specs, renders each at three widths and records the page. No model call.
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { extname, join } from "node:path";
import { parseArgs } from "node:util";
import axe from "axe-core";
import { chromium } from "playwright";
import { compile } from "./compile";
import type { Measured } from "./load";
import { probe } from "./probe";
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
