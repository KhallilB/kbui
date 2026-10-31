import { readFile } from "node:fs/promises";
import { test } from "playwright/test";

// Consumer CSS loads after kbui; each must win in every theme context.
const styles = await readFile(
  new URL("../../../packages/css/dist/styles.css", import.meta.url),
  "utf8",
);

type Case = {
  name: string;
  scheme: "light" | "dark";
  html?: string;
  // Loads before kbui, where an app declares its layer order.
  prelude?: string;
  consumer: string;
  probe: string;
  read: string;
  expected: string;
};

const nest = (theme: string, attrs = "") =>
  `<div data-theme="${theme}" ${attrs}><i id="probe"></i></div>`;

const button = (attrs = "") =>
  `<button id="probe" class="kb-button ${attrs}" data-variant="primary" data-size="md">Save</button>`;
// Tailwind v4 layer order with kbui placed after its preflight.
const tailwindOrder = "@layer theme, base, kbui, components, utilities;";

const cases: Case[] = [
  {
    name: "plain class beats a variant rule",
    scheme: "light",
    consumer: ".brand { background-color: rgb(1 2 3); }",
    probe: button("brand"),
    read: "background-color",
    expected: "rgb(1, 2, 3)",
  },
  {
    name: "plain class beats a size rule",
    scheme: "dark",
    consumer: ".brand { border-radius: 0px; padding-inline-start: 2px; }",
    probe: button("brand"),
    read: "padding-left",
    expected: "2px",
  },
  {
    name: "Tailwind utility beats kbui when kbui sits below utilities",
    scheme: "light",
    prelude: tailwindOrder,
    consumer: "@layer utilities { .bg-x { background-color: rgb(4 5 6); } }",
    probe: button("bg-x"),
    read: "background-color",
    expected: "rgb(4, 5, 6)",
  },
  {
    name: "Tailwind preflight does not unstyle kbui",
    scheme: "light",
    prelude: tailwindOrder,
    consumer: "@layer base { button { padding: 0; border-radius: 0; } }",
    probe: button(),
    read: "padding-left",
    expected: "15px",
  },
  {
    name: "token override in an app layer after kbui beats kbui tokens",
    scheme: "dark",
    prelude: "@layer kbui, app;",
    consumer: "@layer app { :root { --kb-space-4: 2rem; } }",
    probe: '<i id="probe"></i>',
    read: "--kb-space-4",
    expected: "2rem",
  },
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
    consumer: ".brand { --kb-material-surface-bg: rgb(10 20 30); }",
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
    expected: "rgb(23, 25, 29)",
  },
  {
    name: "forced light beats system dark",
    scheme: "dark",
    html: 'data-theme="light"',
    consumer: "",
    probe: '<i id="probe"></i>',
    read: "color: var(--kb-color-bg)",
    expected: "rgb(245, 246, 248)",
  },
  {
    name: "nested light container inside system dark",
    scheme: "dark",
    consumer: "",
    probe: nest("light"),
    read: "color: var(--kb-color-bg)",
    expected: "rgb(245, 246, 248)",
  },
];

for (const c of cases) {
  test.describe(c.name, () => {
    test.use({ colorScheme: c.scheme });
    test("consumer cascade", async ({ page }) => {
      const [prop, value] = c.read.includes(":") ? c.read.split(/:\s*/) : [c.read, ""];
      const probeRule = value ? `#probe { display: block; ${prop}: ${value}; }` : "";
      await page.setContent(
        `<!doctype html><html ${c.html ?? ""}><head><style>${c.prelude ?? ""}</style><style>${styles}</style><style>${c.consumer}</style><style>${probeRule}</style></head><body>${c.probe}</body></html>`,
      );
      const actual = await page.evaluate(
        (p) =>
          getComputedStyle(document.getElementById("probe") as Element)
            .getPropertyValue(p)
            .trim(),
        prop as string,
      );
      if (actual !== c.expected)
        throw new Error(`${c.name}: expected ${c.expected}, got ${actual}`);
    });
  });
}
