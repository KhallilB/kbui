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
    const dark = css.slice(css.indexOf('[data-theme="dark"] {'), css.indexOf("@media"));
    expect(dark).toContain("--kb-color-bg: var(--kb-gray-950);");
    expect(dark).toContain("--kb-color-accent: var(--kb-blue-500);");
    expect(css).toContain(':root:not([data-theme="light"])');
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
    expect(css).not.toContain('[data-theme="dark"]');
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
      expect(css).toMatch(new RegExp(`--kb-color-${name}: #[0-9a-f]+;`));
      expect(css).toContain(`--kb-color-${name}-fg: var(`);
      expect(dark).toMatch(new RegExp(`--kb-color-${name}: #[0-9a-f]+;`));
      expect(dark).toContain(`--kb-color-${name}-fg: var(`);
    }
  });

  test("gives accent and danger foregrounds a dark value for contrast on the lighter dark fills", () => {
    expect(dark).toContain("--kb-color-accent-fg: #291a12;");
    expect(dark).toContain("--kb-color-danger-fg: #331c20;");
  });

  test("defines motion durations and easings", () => {
    for (const name of ["fast", "base", "slow"]) {
      expect(css).toMatch(new RegExp(`--kb-motion-duration-${name}: \\d+ms;`));
    }
    for (const name of ["standard", "enter", "exit"]) {
      expect(css).toMatch(new RegExp(`--kb-motion-easing-${name}: cubic-bezier\\(`));
    }
  });

  test("drops cut-corner geometry from panels", () => {
    for (const name of ["cut", "cut-start", "cut-end", "corner", "cut-edge", "seam-active"]) {
      expect(css).not.toContain(`--kb-panel-${name}:`);
    }
  });

  test("rounds panels and wells from the radius scale", () => {
    expect(css).toContain("--kb-panel-radius: var(--kb-radius-lg);");
    expect(css).toContain("--kb-panel-well-radius: var(--kb-radius-md);");
    expect(css).toMatch(/--kb-panel-seam: \d+px;/);
  });

  test("defines a lit rim that runs from rim-top through the border to rim-bottom", () => {
    for (const name of ["rim-top", "rim-bottom"]) {
      expect(css).toContain(`--kb-panel-${name}: `);
    }
    expect(css).toContain("--kb-panel-border-critical: var(--kb-color-danger);");
  });

  test("keeps glass, sheen and emitted light off until a skin turns them up", () => {
    expect(css).toContain("--kb-panel-backdrop: none;");
    for (const name of ["sheen", "glow", "glow-active", "glow-critical"]) {
      expect(css).toContain(`--kb-panel-${name}: transparent;`);
    }
    expect(css).toMatch(/--kb-panel-glow-blur: \d+px;/);
  });

  test("lifts panels with box-shadows tuned per theme", () => {
    expect(css).toContain("--kb-panel-shadow: var(--kb-material-panel-shadow);");
    expect(css).toContain("--kb-panel-shadow-active: var(--kb-material-raised-shadow);");
    expect(dark).toContain("--kb-material-panel-shadow: inset ");
    expect(dark).toContain("--kb-material-raised-shadow: inset ");
    expect(css).not.toContain("drop-shadow(");
  });

  test("defines a sunken plane, a highlight, a divider and a recessed well", () => {
    expect(css).toContain("--kb-panel-background-sunken: var(--kb-material-field-bg);");
    for (const name of ["highlight", "divider", "well"]) {
      expect(css).toContain(`--kb-panel-${name}: `);
    }
    expect(css).toContain("--kb-panel-well-shadow: var(--kb-material-field-shadow);");
  });

  test("lifts active and critical panel planes in dark", () => {
    expect(css).toContain("--kb-panel-background-active: var(--kb-material-surface-bg);");
    expect(css).toContain("--kb-panel-border-active: var(--kb-color-accent);");
    expect(css).toContain("--kb-panel-border-critical: var(--kb-color-danger);");
  });

  test("defines panel component tokens", () => {
    for (const name of [
      "background",
      "background-active",
      "border",
      "border-active",
      "padding",
      "rail",
      "rail-active",
    ]) {
      expect(css).toContain(`--kb-panel-${name}: `);
    }
  });

  test("lets the status chip round into a pill and its icon glow", () => {
    expect(css).toContain("--kb-status-radius: var(--kb-radius-full);");
    expect(css).toContain("--kb-status-glow: 0px;");
  });

  test("defines a status color per tone", () => {
    for (const tone of ["neutral", "info", "running", "success", "warning", "blocked"]) {
      expect(css).toContain(`--kb-status-${tone}: var(--kb-color-`);
    }
  });

  test("adds an extra-small and a display text size", () => {
    expect(css).toMatch(/--kb-size-xs: [\d.]+rem;/);
    expect(css).toMatch(/--kb-size-display: [\d.]+rem;/);
  });

  test("defines shared popup tokens for menus and tooltips", () => {
    for (const name of ["background", "border", "radius", "shadow"]) {
      expect(css).toContain(`--kb-popup-${name}: `);
    }
    expect(css).toContain("--kb-popup-shadow: var(--kb-material-float-shadow);");
    expect(dark).toContain("--kb-material-float-shadow: ");
  });

  test("lets a theme tune progress color, height and glow", () => {
    expect(css).toContain("--kb-progress-track: var(--kb-material-recessed-face);");
    expect(css).toContain("--kb-progress-fill: var(--kb-color-accent);");
    expect(css).toContain("--kb-progress-fill-complete: var(--kb-color-success);");
    expect(css).toContain("--kb-progress-height: 6px;");
    expect(css).toContain("--kb-progress-glow: 0px;");
  });

  test("lets a theme tune the display stat without touching the size scale", () => {
    expect(css).toContain("--kb-stat-display-size: var(--kb-size-display);");
    expect(css).toMatch(/--kb-stat-display-weight: \d00;/);
  });

  test("snapshot of the shipped css", () => {
    expect(css).toMatchSnapshot();
  });
});

test("explicit light containers restore the full light token set inside dark roots", () => {
  expect(buildTokens(tree).css).toContain(':root, [data-theme="light"] {');
});

test("dark scopes rebind aliases against their own semantic values", () => {
  const css = buildTokens(real as TokenTree).css;
  const darkBlock = css.slice(css.indexOf('[data-theme="dark"] {'), css.indexOf("@media"));
  expect(darkBlock).toContain("--kb-card-background: var(--kb-material-surface-bg);");
  expect(darkBlock).toContain("--kb-material-raised-face: linear-gradient(");
});
