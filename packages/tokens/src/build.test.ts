import { describe, expect, test } from "bun:test";
import real from "../tokens.json";
import { buildTokens, type TokenTree } from "./build";

const tree: TokenTree = {
  blue: { "500": { $type: "color", $value: "#2563eb" } },
  gray: { "950": { $type: "color", $value: "#0a0a0a" } },
  white: { $type: "color", $value: "#ffffff" },
  space: { "4": { $type: "dimension", $value: "1rem" } },
  color: {
    bg: { $type: "color", $value: "{white}", $extensions: { "kb.dark": "{gray.950}" } },
    accent: { $type: "color", $value: "{blue.500}" },
  },
  button: { radius: { $type: "dimension", $value: "0.5rem" } },
};

describe("buildTokens", () => {
  test("emits every token as a --kb var in :root", () => {
    const { css } = buildTokens(tree);
    expect(css).toContain("--kb-blue-500: #2563eb;");
    expect(css).toContain("--kb-white: #ffffff;");
    expect(css).toContain("--kb-space-4: 1rem;");
    expect(css).toContain("--kb-button-radius: 0.5rem;");
  });

  test("resolves aliases to var() references", () => {
    const { css } = buildTokens(tree);
    expect(css).toContain("--kb-color-bg: var(--kb-white);");
    expect(css).toContain("--kb-color-accent: var(--kb-blue-500);");
  });

  test("emits kb.dark values in both dark blocks only", () => {
    const { css } = buildTokens(tree);
    const dark = '[data-theme="dark"] {\n  --kb-color-bg: var(--kb-gray-950);\n}';
    const media =
      '@media (prefers-color-scheme: dark) {\n  :root:not([data-theme="light"]) {\n    --kb-color-bg: var(--kb-gray-950);\n  }\n}';
    expect(css).toContain(dark);
    expect(css).toContain(media);
    expect(css).not.toContain("--kb-color-accent: var(--kb-gray-950)");
  });

  test("emits a typed nested object of var names", () => {
    const { ts } = buildTokens(tree);
    expect(ts).toContain("export const tokens = {");
    expect(ts).toContain('"bg": "--kb-color-bg"');
    expect(ts).toContain("} as const;");
  });

  test("throws on unknown alias", () => {
    expect(() => buildTokens({ a: { $type: "color", $value: "{nope}" } })).toThrow(/nope/);
  });

  test("throws when two paths map to the same var", () => {
    const dup: TokenTree = {
      a: {
        b: { c: { $type: "color", $value: "#111" } },
        "b-c": { $type: "color", $value: "#222" },
      },
    };
    expect(() => buildTokens(dup)).toThrow("Duplicate token var --kb-a-b-c");
  });

  test("throws on invalid key", () => {
    expect(() => buildTokens({ "bad key": { $type: "color", $value: "#111" } })).toThrow(
      'Invalid token key "bad key"',
    );
  });

  test("throws when $value is not a string", () => {
    const bad = { a: { $type: "number", $value: 4 } } as unknown as TokenTree;
    expect(() => buildTokens(bad)).toThrow(/\$value/);
  });

  test("ignores $-prefixed group metadata", () => {
    const grouped = {
      g: { $description: "notes", x: { $type: "color", $value: "#111" } },
    } as unknown as TokenTree;
    const { css } = buildTokens(grouped);
    expect(css).toContain("--kb-g-x: #111;");
    expect(css).not.toContain("description");
  });

  test("emits readonly js and dts", () => {
    const { js, dts } = buildTokens(tree);
    expect(js).toContain("export const tokens = {");
    expect(js).not.toContain("as const");
    expect(dts.startsWith("export declare const tokens:")).toBe(true);
    expect(dts).toContain('readonly "bg": "--kb-color-bg";');
  });

  test("omits dark blocks when no token has kb.dark", () => {
    const { css } = buildTokens({ a: { $type: "color", $value: "#111" } });
    expect(css).not.toContain("data-theme");
    expect(css).not.toContain("@media");
  });

  test("snapshot of css output", () => {
    expect(buildTokens(tree).css).toMatchSnapshot();
  });
});

describe("tokens.json", () => {
  const { css } = buildTokens(real as TokenTree);
  const dark = css.slice(css.indexOf('[data-theme="dark"]'));

  test("defines amber, green and teal primitives", () => {
    for (const name of ["amber", "green", "teal"]) {
      for (const step of ["400", "500", "600"]) expect(css).toContain(`--kb-${name}-${step}: #`);
    }
  });

  test("defines info, success and warning semantic colors with dark values", () => {
    for (const name of ["info", "success", "warning"]) {
      expect(css).toContain(`--kb-color-${name}: var(`);
      expect(css).toContain(`--kb-color-${name}-fg: var(`);
      expect(dark).toContain(`--kb-color-${name}: var(`);
      expect(dark).toContain(`--kb-color-${name}-fg: var(`);
    }
  });

  test("gives accent and danger foregrounds a dark value for contrast on the lighter dark fills", () => {
    expect(dark).toContain("--kb-color-accent-fg: var(--kb-gray-950);");
    expect(dark).toContain("--kb-color-danger-fg: var(--kb-gray-950);");
  });

  test("defines motion durations and easings", () => {
    for (const name of ["fast", "base", "slow"]) {
      expect(css).toMatch(new RegExp(`--kb-motion-duration-${name}: \\d+ms;`));
    }
    for (const name of ["standard", "enter", "exit"]) {
      expect(css).toMatch(new RegExp(`--kb-motion-easing-${name}: cubic-bezier\\(`));
    }
  });

  test("keeps per-side cuts as optional hooks, not root tokens, so a scoped --kb-facet-cut works", () => {
    expect(css).not.toContain("--kb-facet-cut-start:");
    expect(css).not.toContain("--kb-facet-cut-end:");
    expect(css).toMatch(/--kb-facet-cut: [\d.]+rem;/);
  });

  test("defines seam widths, a corner bevel and a critical border for facets", () => {
    expect(css).toMatch(/--kb-facet-seam: \d+px;/);
    expect(css).toMatch(/--kb-facet-seam-active: \d+px;/);
    expect(css).toMatch(/--kb-facet-corner: \d+px;/);
    expect(css).toContain("--kb-facet-border-critical: var(--kb-color-danger);");
  });

  test("defines a sunken facet plane on the page background", () => {
    expect(css).toContain("--kb-facet-background-sunken: var(--kb-color-bg);");
  });

  test("gives facets depth by default: lit edge, top highlight, divider and a dark-tuned shadow", () => {
    for (const name of ["cut-edge", "highlight", "divider"]) {
      expect(css).not.toContain(`--kb-facet-${name}: transparent;`);
      expect(dark).toContain(`--kb-facet-${name}: `);
    }
    for (const name of ["shadow", "shadow-active"]) {
      expect(css).toMatch(new RegExp(`--kb-facet-${name}: drop-shadow\\(`));
      expect(dark).toMatch(new RegExp(`--kb-facet-${name}: drop-shadow\\(`));
    }
  });

  test("defines a recessed well for output inside a facet", () => {
    expect(css).toContain("--kb-facet-well: ");
    expect(css).toMatch(/--kb-facet-well-shadow: inset /);
    expect(dark).toContain("--kb-facet-well: ");
    expect(dark).toMatch(/--kb-facet-well-shadow: inset /);
  });

  test("lifts active and critical facet planes in dark", () => {
    expect(dark).toContain("--kb-facet-background-active: var(--kb-gray-800);");
    expect(dark).toContain("--kb-facet-border-active: var(--kb-blue-400);");
    expect(dark).toContain("--kb-facet-border-critical: var(--kb-red-400);");
  });

  test("defines facet component tokens", () => {
    for (const name of [
      "background",
      "background-active",
      "border",
      "border-active",
      "cut",
      "padding",
      "rail",
      "rail-active",
    ]) {
      expect(css).toContain(`--kb-facet-${name}: `);
    }
  });

  test("defines a status color per tone", () => {
    for (const tone of ["neutral", "info", "running", "success", "warning", "blocked"]) {
      expect(css).toContain(`--kb-status-${tone}: var(--kb-color-`);
    }
  });

  test("snapshot of the shipped css", () => {
    expect(css).toMatchSnapshot();
  });
});
