import { readFile } from "node:fs/promises";
import { chromium } from "playwright";

// Consumer overrides load after kbui; each must win in every theme context.
const tokens = await readFile(
  new URL("../../../packages/tokens/dist/tokens.css", import.meta.url),
  "utf8",
);

type Case = {
  name: string;
  scheme: "light" | "dark";
  html?: string;
  consumer: string;
  probe: string;
  read: string;
  expected: string;
};

const nest = (theme: string, attrs = "") =>
  `<div data-theme="${theme}" ${attrs}><i id="probe"></i></div>`;

const cases: Case[] = [
  {
    name: "scale override survives system dark",
    scheme: "dark",
    consumer: ":root { --kb-space-4: 2rem; }",
    probe: '<i id="probe"></i>',
    read: "--kb-space-4",
    expected: "2rem",
  },
  {
    name: "scale override reaches a nested theme container",
    scheme: "light",
    consumer: ":root { --kb-space-4: 2rem; }",
    probe: nest("dark"),
    read: "--kb-space-4",
    expected: "2rem",
  },
  {
    name: "scale override flows through component aliases in system dark",
    scheme: "dark",
    consumer: ":root { --kb-radius-lg: 3px; }",
    probe: nest("dark"),
    read: "border-radius: var(--kb-panel-radius)",
    expected: "3px",
  },
  {
    name: "component token override reaches a nested theme container",
    scheme: "dark",
    consumer: ":root { --kb-panel-radius: 0px; }",
    probe: nest("dark"),
    read: "border-radius: var(--kb-panel-radius)",
    expected: "0px",
  },
  {
    name: "light-dark() override picks the light value",
    scheme: "light",
    consumer: ":root, [data-theme] { --kb-color-accent: light-dark(rgb(1 2 3), rgb(4 5 6)); }",
    probe: '<i id="probe"></i>',
    read: "color: var(--kb-color-accent)",
    expected: "rgb(1, 2, 3)",
  },
  {
    name: "light-dark() override picks the dark value in system dark",
    scheme: "dark",
    consumer: ":root, [data-theme] { --kb-color-accent: light-dark(rgb(1 2 3), rgb(4 5 6)); }",
    probe: '<i id="probe"></i>',
    read: "color: var(--kb-color-accent)",
    expected: "rgb(4, 5, 6)",
  },
  {
    name: "light-dark() override follows a nested dark container",
    scheme: "light",
    consumer: ":root, [data-theme] { --kb-color-accent: light-dark(rgb(1 2 3), rgb(4 5 6)); }",
    probe: nest("dark"),
    read: "color: var(--kb-color-accent)",
    expected: "rgb(4, 5, 6)",
  },
  {
    name: "restyle on a theme container rebinds component aliases",
    scheme: "dark",
    consumer: ".brand { --kb-color-bg: rgb(10 20 30); }",
    probe: nest("light", 'class="brand"'),
    read: "background-color: var(--kb-panel-background)",
    expected: "rgb(10, 20, 30)",
  },
  {
    name: "default dark value applies in system dark",
    scheme: "dark",
    consumer: "",
    probe: '<i id="probe"></i>',
    read: "color: var(--kb-color-bg)",
    expected: "rgb(32, 41, 32)",
  },
  {
    name: "forced light beats system dark",
    scheme: "dark",
    html: 'data-theme="light"',
    consumer: "",
    probe: '<i id="probe"></i>',
    read: "color: var(--kb-color-bg)",
    expected: "rgb(255, 253, 245)",
  },
  {
    name: "nested light container inside system dark",
    scheme: "dark",
    consumer: "",
    probe: nest("light"),
    read: "color: var(--kb-color-bg)",
    expected: "rgb(255, 253, 245)",
  },
];

const browser = await chromium.launch({ headless: true });
const failures: string[] = [];
try {
  for (const c of cases) {
    const page = await browser.newPage({ colorScheme: c.scheme });
    const [prop, value] = c.read.includes(":") ? c.read.split(/:\s*/) : [c.read, ""];
    const probeRule = value ? `#probe { display: block; ${prop}: ${value}; }` : "";
    await page.setContent(
      `<!doctype html><html ${c.html ?? ""}><head><style>${tokens}</style><style>${c.consumer}</style><style>${probeRule}</style></head><body>${c.probe}</body></html>`,
    );
    const actual = await page.evaluate(
      (p) =>
        getComputedStyle(document.getElementById("probe") as Element)
          .getPropertyValue(p)
          .trim(),
      prop as string,
    );
    if (actual !== c.expected) failures.push(`${c.name}: expected ${c.expected}, got ${actual}`);
    await page.close();
  }
} finally {
  await browser.close();
}
if (failures.length > 0) throw new Error(`Override cascade failed:\n${failures.join("\n")}`);
console.log(`Override cascade verified: ${cases.length} cases.`);
