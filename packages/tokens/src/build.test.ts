import { describe, expect, test } from "bun:test";
import real from "../tokens.json";
import { buildTokens, type Token, type TokenTree } from "./build";

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
    const dark = css.slice(css.indexOf('[data-theme="dark"]) {'), css.indexOf("@media"));
    expect(dark).toContain("--kb-color-bg: var(--kb-gray-950);");
    expect(css).toContain(':root:not([data-theme="light"])');
    expect(css).not.toContain("--kb-color-accent: var(--kb-gray-950)");
  });

  test("theme selectors have zero specificity so later consumer rules win", () => {
    const { css } = buildTokens(tree);
    const selectors = css
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.endsWith("{") && !l.startsWith("@"))
      .map((l) => l.slice(0, -1).trim());
    expect(selectors).toHaveLength(4);
    for (const s of selectors) expect(s).toMatch(/^:where\(.*\)$/);
  });

  test("theme containers redeclare only theme-dependent tokens", () => {
    const themed: TokenTree = {
      ...tree,
      panel: {
        background: { $type: "color", $value: "{color.bg}" },
        radius: { $type: "dimension", $value: "{button.radius}" },
      },
    };
    const { css } = buildTokens(themed);
    const root = css.slice(0, css.indexOf("}"));
    expect(root).toContain("--kb-space-4: 1rem;");
    expect(root).toContain("--kb-panel-radius: var(--kb-button-radius);");
    for (const sel of ['[data-theme="light"])', '[data-theme="dark"])']) {
      const start = css.indexOf(`${sel} {`);
      const body = css.slice(start, css.indexOf("}", start));
      expect(body).toContain("--kb-color-bg:");
      expect(body).toContain("--kb-panel-background: var(--kb-color-bg);");
      expect(body).not.toContain("--kb-space-4");
      expect(body).not.toContain("--kb-panel-radius");
      expect(body).not.toContain("--kb-color-accent");
    }
  });

  test("each theme block declares its color-scheme for light-dark()", () => {
    const { css } = buildTokens(tree);
    const blocks = css.split(/\n(?=\S)/).filter((b) => b.includes("{"));
    expect(blocks.map((b) => b.match(/color-scheme: (\w+);/)?.[1])).toEqual([
      "light",
      "light",
      "dark",
      "dark",
    ]);
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

  test("throws on unsupported $type or incompatible alias target", () => {
    expect(() => buildTokens({ a: { $type: "bogus", $value: "1px" } })).toThrow(
      /Unsupported token \$type/,
    );
    expect(() =>
      buildTokens({
        size: { $type: "dimension", $value: "1rem" },
        tint: { $type: "color", $value: "{size}" },
      }),
    ).toThrow(/Incompatible token alias/);
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

  test("emits kb.forced values last, for root and theme containers, under forced colors", () => {
    const forced: TokenTree = {
      ...tree,
      mark: {
        $type: "color",
        $value: "{blue.500}",
        $extensions: { "kb.dark": "{white}", "kb.forced": "Highlight" },
      },
    };
    const { css } = buildTokens(forced);
    const start = css.indexOf("@media (forced-colors: active) {");
    expect(start).toBeGreaterThan(css.indexOf("@media (prefers-color-scheme: dark)"));
    const block = css.slice(start);
    expect(block).toContain(":where(:root, [data-theme]) {");
    expect(block).toContain("--kb-mark: Highlight;");
    expect(block).not.toContain("--kb-color-bg");
  });

  test("omits the forced-colors block when no token has kb.forced", () => {
    expect(buildTokens(tree).css).not.toContain("forced-colors");
  });

  test("snapshot of css output", () => {
    expect(buildTokens(tree).css).toMatchSnapshot();
  });
});

describe("tokens.json", () => {
  const { css } = buildTokens(real as TokenTree);
  const dark = css.slice(css.indexOf('[data-theme="dark"]'));
  type Node = { [key: string]: Node } & Token;
  const node = (path: string) =>
    path.split(".").reduce((n, k) => n[k] as Node, real as unknown as Node);
  // Resolve aliases within chosen theme.
  const hex = (path: string, theme: "light" | "dark"): string => {
    const t = node(path);
    const value = theme === "dark" ? (t.$extensions?.["kb.dark"] ?? t.$value) : t.$value;
    const alias = value.match(/^\{(.+)\}$/);
    return alias ? hex(alias[1] as string, theme) : value;
  };
  const luminance = (h: string) => {
    const [r, g, b] = [1, 3, 5].map((i) => {
      const c = Number.parseInt(h.slice(i, i + 2), 16) / 255;
      return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    }) as [number, number, number];
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const contrast = (a: string, b: string) => {
    const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
    return (hi + 0.05) / (lo + 0.05);
  };

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

  describe("visualization roles", () => {
    const roles = ["current", "visited", "changed", "error", "discarded", "frontier", "path"];

    test("defines a mark, tint and tint text per role", () => {
      for (const role of roles) {
        for (const part of ["", "-bg", "-fg"]) expect(css).toContain(`--kb-viz-${role}${part}: `);
      }
    });

    test("marks read as text on the page and surface in both themes", () => {
      for (const theme of ["light", "dark"] as const) {
        for (const role of roles) {
          for (const ground of ["color.bg", "color.surface"]) {
            expect(contrast(hex(`viz.${role}`, theme), hex(ground, theme))).toBeGreaterThanOrEqual(
              4.5,
            );
          }
        }
      }
    });

    test("tint text reads on its tint and marks stand out from it in both themes", () => {
      for (const theme of ["light", "dark"] as const) {
        for (const role of roles) {
          const tint = hex(`viz.${role}-bg`, theme);
          expect(contrast(hex(`viz.${role}-fg`, theme), tint)).toBeGreaterThanOrEqual(4.5);
          expect(contrast(hex(`viz.${role}`, theme), tint)).toBeGreaterThanOrEqual(3);
        }
      }
    });

    test("keeps current apart from the accent so a cursor never reads as an error", () => {
      expect(hex("viz.current", "light")).not.toBe(hex("color.accent", "light"));
      expect(hex("viz.current", "dark")).not.toBe(hex("color.accent", "dark"));
    });

    test("maps every role to system colors under forced colors", () => {
      const forced = css.slice(css.indexOf("@media (forced-colors: active)"));
      for (const role of roles) {
        for (const part of ["", "-bg", "-fg"]) {
          expect(forced).toMatch(new RegExp(`--kb-viz-${role}${part}: [A-Za-z]+;`));
        }
      }
      expect(forced).toContain("--kb-viz-current: Highlight;");
      expect(forced).toContain("--kb-viz-changed-bg: Mark;");
      expect(forced).toContain("--kb-viz-discarded: GrayText;");
    });
  });

  test.each(["link.color", "link.hover"])("%s reads as inline text in both themes", (path) => {
    for (const theme of ["light", "dark"] as const) {
      for (const ground of ["color.bg", "color.surface"]) {
        expect(contrast(hex(path, theme), hex(ground, theme))).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  test("gives accent and danger foregrounds a dark value for contrast on the lighter dark fills", () => {
    expect(dark).toContain("--kb-color-accent-fg: #28150e;");
    expect(dark).toContain("--kb-color-danger-fg: #331c20;");
  });

  test("filled actions share readable resting and hover pairs across themes", () => {
    expect(node("color.action")).toBeDefined();
    for (const theme of ["light", "dark"] as const) {
      const foreground = hex("color.action-fg", theme);
      const overlay = hex("material.action-sheen", theme)
        .match(/[\d.]+/g)
        ?.map(Number);
      if (overlay?.length !== 4) throw new Error("Expected rgba action sheen");
      const [red, green, blue, alpha] = overlay as [number, number, number, number];
      for (const path of ["color.action", "color.action-hover"]) {
        const background = hex(path, theme);
        expect(contrast(foreground, background)).toBeGreaterThanOrEqual(4.5);
        const sheen = `#${[red, green, blue]
          .map((channel, index) =>
            Math.round(
              Number.parseInt(background.slice(index * 2 + 1, index * 2 + 3), 16) * (1 - alpha) +
                channel * alpha,
            )
              .toString(16)
              .padStart(2, "0"),
          )
          .join("")}`;
        expect(contrast(foreground, sheen)).toBeGreaterThanOrEqual(4.5);
      }
      expect(hex("radiogroup.primary-background", theme)).toBe(hex("color.action", theme));
      expect(hex("radiogroup.primary-color", theme)).toBe(foreground);
    }
    expect(hex("color.action-fg", "dark")).toBe("#ffffff");
  });

  test("primary segmented selection uses readable theme-specific fill and text", () => {
    for (const theme of ["light", "dark"] as const) {
      expect(
        contrast(
          hex("radiogroup.primary-color", theme),
          hex("radiogroup.primary-background", theme),
        ),
      ).toBeGreaterThanOrEqual(4.5);
    }
    expect(hex("radiogroup.primary-background", "light")).toBe(hex("color.accent", "light"));
    expect(hex("radiogroup.primary-color", "light")).toBe(hex("color.accent-fg", "light"));
    expect(hex("radiogroup.primary-color", "dark")).toBe("#ffffff");
    expect(hex("radiogroup.primary-background", "dark")).not.toBe(hex("color.accent", "dark"));
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

  test("backs opaque panels with the solid surface material", () => {
    expect(css).toContain("--kb-panel-background-opaque: var(--kb-material-surface-bg);");
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

  describe("code block and syntax highlighting tokens", () => {
    const syntaxRoles = [
      "keyword",
      "string",
      "comment",
      "number",
      "tag",
      "attribute",
      "type",
      "function",
      "operator",
      "property",
    ] as const;

    test("defines block surface, header, gutter, line highlight and syntax tokens", () => {
      for (const token of [
        "block-radius",
        "block-background",
        "block-face",
        "block-border",
        "block-shadow",
        "block-padding-block",
        "block-padding-inline",
        "block-font-size",
        "block-leading",
        "block-max-height",
        "collapsed-max-height",
        "header-background",
        "header-padding-block",
        "header-padding-inline",
        "header-gap",
        "title-size",
        "badge-padding-block",
        "badge-padding-inline",
        "badge-radius",
        "action-height",
        "action-padding-inline",
        "action-gap",
        "action-radius",
        "toggle-min-width",
        "copy-min-width",
        "motion-duration",
        "motion-easing",
        "gutter-width",
        "gutter-gap",
        "gutter-color",
        "gutter-border",
        "line-padding-inline",
        "line-highlight-background",
        "line-highlight-border",
      ]) {
        expect(css).toContain(`--kb-code-${token}: `);
      }
      for (const role of syntaxRoles) {
        expect(css).toContain(`--kb-code-syntax-${role}: `);
      }
    });

    test("syntax tokens maintain WCAG AA 4.5:1 contrast across page, surface, and field backgrounds in both themes", () => {
      for (const theme of ["light", "dark"] as const) {
        for (const role of syntaxRoles) {
          for (const ground of ["color.bg", "color.surface", "material.field-bg"]) {
            expect(
              contrast(hex(`code.syntax.${role}`, theme), hex(ground, theme)),
              `${role} on ${ground} (${theme})`,
            ).toBeGreaterThanOrEqual(4.5);
          }
        }
      }
    });

    test("maps syntax tokens to system colors under forced colors", () => {
      const forced = css.slice(css.indexOf("@media (forced-colors: active)"));
      for (const role of syntaxRoles) {
        expect(forced).toMatch(new RegExp(`--kb-code-syntax-${role}: (?:CanvasText|GrayText);`));
      }
    });
  });
});

test("explicit light containers restore light theme values inside dark roots", () => {
  const css = buildTokens(tree).css;
  const start = css.indexOf(':where([data-theme="light"]) {');
  expect(css.slice(start, css.indexOf("}", start))).toContain("--kb-color-bg: var(--kb-white);");
});

test("dark scopes rebind aliases against their own semantic values", () => {
  const css = buildTokens(real as TokenTree).css;
  const darkBlock = css.slice(css.indexOf(':where([data-theme="dark"]) {'), css.indexOf("@media"));
  expect(darkBlock).toContain("--kb-card-background: var(--kb-material-surface-bg);");
  expect(darkBlock).toContain("--kb-material-raised-face: linear-gradient(");
});

test("switch material tokens retain recessed track, raised thumb and compact size scale", () => {
  const css = buildTokens(real as TokenTree).css;
  const dark = css.slice(css.indexOf(':where([data-theme="dark"]) {'), css.indexOf("@media"));
  expect(css).toContain("--kb-switch-width: 44px;");
  expect(css).toContain("--kb-switch-height: 24px;");
  expect(css).toContain("--kb-switch-inset: 2px;");
  expect(css).toContain("--kb-switch-icon-size: 12px;");
  expect(css).toContain("--kb-switch-sm-width: 36px;");
  expect(css).toContain("--kb-switch-sm-height: 20px;");
  expect(css).toContain("--kb-switch-md-width: var(--kb-switch-width);");
  expect(css).toContain("--kb-switch-lg-width: 56px;");
  expect(css).toContain("--kb-switch-lg-height: 32px;");
  for (const scope of [css, dark]) {
    expect(scope).toContain("--kb-switch-track-background: var(--kb-material-recessed-face);");
    expect(scope).toContain("--kb-switch-track-shadow: var(--kb-material-field-shadow);");
    expect(scope).toContain("--kb-switch-thumb-background: var(--kb-material-raised-face);");
    expect(scope).toContain("--kb-switch-thumb-shadow: var(--kb-material-raised-shadow);");
  }
});

describe("typography role integration", () => {
  test("aliases heading and body primitives to existing design roles", () => {
    const { css } = buildTokens(real as TokenTree);
    expect(css).toContain("--kb-heading-size-sm: var(--kb-text-h4-size);");
    expect(css).toContain("--kb-heading-size-md: var(--kb-text-h3-size);");
    expect(css).toContain("--kb-heading-size-lg: var(--kb-text-h2-size);");
    expect(css).toContain("--kb-heading-size-xl: var(--kb-text-h1-size);");
    expect(css).toContain("--kb-heading-weight: var(--kb-font-weight-strong);");
    expect(css).toContain("--kb-link-color: var(--kb-color-accent-ink);");
    expect(css).toContain("--kb-text-muted: var(--kb-color-muted);");
  });
});

describe("search and selection tokens", () => {
  test("defines combobox and multiselect popup, chip, and action sizing tokens", () => {
    const { css } = buildTokens(real as TokenTree);
    expect(css).toContain("--kb-combobox-popup-min-width: 12rem;");
    expect(css).toContain("--kb-combobox-max-height: 20rem;");
    expect(css).toContain("--kb-combobox-layer: 50;");
    expect(css).toContain("--kb-combobox-action-size: 1.75rem;");
    expect(css).toContain("--kb-multiselect-popup-min-width: 12rem;");
    expect(css).toContain("--kb-multiselect-max-height: 20rem;");
    expect(css).toContain("--kb-multiselect-layer: 50;");
    expect(css).toContain("--kb-multiselect-chip-gap: var(--kb-space-1);");
    expect(css).toContain("--kb-multiselect-chip-radius: var(--kb-radius-sm);");
    expect(css).toContain("--kb-multiselect-action-size: 1.75rem;");
  });
});

describe("form component tokens", () => {
  test("defines sizing and spacing tokens for textarea, fieldset, formactions and errorsummary", () => {
    const { css } = buildTokens(real as TokenTree);
    expect(css).toContain("--kb-textarea-min-height: 6rem;");
    expect(css).toContain("--kb-textarea-padding-block: var(--kb-space-2);");
    expect(css).toContain("--kb-textarea-padding-inline: var(--kb-space-3);");
    expect(css).toContain("--kb-fieldset-gap: var(--kb-space-3);");
    expect(css).toContain("--kb-fieldset-fields-gap: var(--kb-space-4);");
    expect(css).toContain("--kb-fieldset-legend-size: var(--kb-text-h4-size);");
    expect(css).toContain("--kb-formactions-gap: var(--kb-space-2);");
    expect(css).toContain("--kb-formactions-padding-top: var(--kb-space-4);");
    expect(css).toContain("--kb-errorsummary-padding: var(--kb-space-4);");
    expect(css).toContain("--kb-errorsummary-radius: var(--kb-radius-md);");
    expect(css).toContain("--kb-errorsummary-gap: var(--kb-space-2);");
  });

  test("defines region and collapse tokens for Form, FormSection and Settings", () => {
    const { css } = buildTokens(real as TokenTree);
    expect(css).toContain("--kb-form-gap: var(--kb-space-6);");
    expect(css).toContain("--kb-form-width-sm: 32rem;");
    expect(css).toContain("--kb-form-width-md: 40rem;");
    expect(css).toContain("--kb-formsection-gap: var(--kb-space-4);");
    expect(css).toContain("--kb-formsection-header-gap: var(--kb-space-1);");
    expect(css).toContain("--kb-formsection-fields-gap: var(--kb-space-4);");
    expect(css).toContain("--kb-formsection-collapse: 40rem;");
    expect(css).toContain("--kb-settings-gap: var(--kb-space-8);");
    expect(css).toContain("--kb-settings-divider: var(--kb-color-border);");
  });
});

describe("grid component tokens", () => {
  test("defines gap and min-item-width preset tokens", () => {
    const { css } = buildTokens(real as TokenTree);
    expect(css).toContain("--kb-grid-gap: var(--kb-space-6);");
    expect(css).toContain("--kb-grid-min-item-width: 18.75rem;");
    expect(css).toContain("--kb-grid-min-item-width-sm: 14rem;");
    expect(css).toContain("--kb-grid-min-item-width-md: var(--kb-grid-min-item-width);");
    expect(css).toContain("--kb-grid-min-item-width-lg: 24rem;");
  });

  test("defines page frame, region and filter tokens for Gallery", () => {
    const { css } = buildTokens(real as TokenTree);
    expect(css).toContain("--kb-gallery-max-width: var(--kb-container-size-lg);");
    expect(css).toContain("--kb-gallery-gutter-sm: var(--kb-space-4);");
    expect(css).toContain("--kb-gallery-gutter-md: var(--kb-space-6);");
    expect(css).toContain("--kb-gallery-gutter-lg: var(--kb-space-8);");
    expect(css).toContain("--kb-gallery-gap: var(--kb-space-6);");
    expect(css).toContain("--kb-gallery-filters-gap: var(--kb-space-3);");
    expect(css).toContain("--kb-gallery-filter-min-width: 12rem;");
  });
});

describe("loading and feedback component tokens", () => {
  test("defines spinner, skeleton, emptystate, and toast tokens", () => {
    const { css } = buildTokens(real as TokenTree);
    expect(css).toContain("--kb-spinner-size-sm: 0.875rem;");
    expect(css).toContain("--kb-spinner-size-md: 1.125rem;");
    expect(css).toContain("--kb-spinner-size-lg: 1.5rem;");
    expect(css).toContain("--kb-spinner-duration: 760ms;");
    expect(css).toContain("--kb-spinner-easing: linear;");
    expect(css).toContain("--kb-spinner-orbit-duration: 1140ms;");
    expect(css).toContain("--kb-spinner-pulse-duration: 960ms;");
    expect(css).toContain("--kb-spinner-pulse-easing: var(--kb-motion-easing-smooth);");
    expect(css).toContain("--kb-spinner-stagger: 140ms;");
    expect(css).toContain("--kb-spinner-glow: 6px;");
    expect(css).toContain("--kb-spinner-pill-padding-block: var(--kb-space-1);");
    expect(css).toContain("--kb-spinner-pill-padding-inline: var(--kb-space-3);");
    expect(css).toContain("--kb-spinner-pill-radius: var(--kb-radius-full);");

    expect(css).toContain("--kb-skeleton-height-sm: 0.75rem;");
    expect(css).toContain("--kb-skeleton-height-md: 1rem;");
    expect(css).toContain("--kb-skeleton-height-lg: 1.5rem;");
    expect(css).toContain("--kb-skeleton-base: var(--kb-color-surface);");
    expect(css).toContain("--kb-skeleton-highlight: var(--kb-material-raised-top);");
    expect(css).toContain("--kb-skeleton-sheen: var(--kb-material-soft-sheen);");
    expect(css).toContain("--kb-skeleton-duration: 1600ms;");
    expect(css).toContain("--kb-skeleton-pulse-duration: 1800ms;");
    expect(css).toContain("--kb-skeleton-stagger: 120ms;");

    expect(css).toContain("--kb-emptystate-radius: var(--kb-radius-lg);");
    expect(css).toContain("--kb-emptystate-padding-md: var(--kb-space-6);");
    expect(css).toContain("--kb-emptystate-max-width: 32rem;");
    expect(css).toContain("--kb-emptystate-icon-size-md: 2.75rem;");

    expect(css).toContain("--kb-toast-width: 24rem;");
    expect(css).toContain("--kb-toast-radius: var(--kb-radius-lg);");
    expect(css).toContain("--kb-toast-shadow: var(--kb-material-float-shadow);");
    expect(css).toContain("--kb-toast-z-index: 1000;");
    expect(css).toContain("--kb-toast-motion-duration: 240ms;");
  });
});

describe("media and identity tokens", () => {
  test("reserves identity sizes and responsive media framing", () => {
    const { css } = buildTokens(real);
    for (const declaration of [
      "--kb-avatar-size: 2.75rem;",
      "--kb-avatar-size-xs: var(--kb-space-6);",
      "--kb-avatar-size-sm: var(--kb-space-8);",
      "--kb-avatar-size-lg: 3.5rem;",
      "--kb-avatar-size-xl: 5rem;",
      "--kb-image-ratio: 4 / 3;",
      "--kb-thumbnail-gap: var(--kb-space-3);",
    ])
      expect(css).toContain(declaration);
  });
  test("pairs media fallback colors with semantic surfaces", () => {
    const { css } = buildTokens(real);
    for (const declaration of [
      "--kb-avatar-background: var(--kb-color-surface);",
      "--kb-avatar-color: var(--kb-color-fg);",
      "--kb-image-background: var(--kb-color-surface);",
      "--kb-image-color: var(--kb-color-muted);",
      "--kb-thumbnail-muted: var(--kb-color-muted);",
    ])
      expect(css).toContain(declaration);
  });
});

describe("copyable content tokens", () => {
  test("exposes field and target customizations", () => {
    const { css } = buildTokens(real);
    for (const token of [
      "gap",
      "padding",
      "radius",
      "border",
      "background",
      "target-size",
      "copy-min-width",
      "value-color",
      "highlight-background",
    ]) {
      expect(css).toContain(`--kb-copyabletext-${token}: `);
    }
  });
});

describe("page header tokens", () => {
  test("aliases title sizes to the heading scale and the divider to the border role", () => {
    const { css } = buildTokens(real as TokenTree);
    expect(css).toContain("--kb-pageheader-title-size-sm: var(--kb-heading-size-lg);");
    expect(css).toContain("--kb-pageheader-title-size-md: var(--kb-heading-size-xl);");
    expect(css).toContain("--kb-pageheader-title-size-lg: var(--kb-heading-size-display);");
    expect(css).toContain("--kb-pageheader-heading-min-width: 18rem;");
    expect(css).toContain("--kb-pageheader-description-max-width: var(--kb-text-measure);");
    expect(css).toContain("--kb-pageheader-divider: var(--kb-color-border);");
  });
});

describe("supporting pane tokens", () => {
  test("defines the page frame, gutters, gap and aside width", () => {
    const { css } = buildTokens(real as TokenTree);
    expect(css).toContain("--kb-supportingpane-max-width: var(--kb-container-size-lg);");
    expect(css).toContain("--kb-supportingpane-gutter-sm: var(--kb-space-4);");
    expect(css).toContain("--kb-supportingpane-gutter-md: var(--kb-space-6);");
    expect(css).toContain("--kb-supportingpane-gutter-lg: var(--kb-space-8);");
    expect(css).toContain("--kb-supportingpane-gap: var(--kb-layout-gap-lg);");
    expect(css).toContain("--kb-supportingpane-aside-width: 22rem;");
  });
});

describe("stats row tokens", () => {
  test("aliases outlined items to the card surface and tones to status roles", () => {
    const { css } = buildTokens(real as TokenTree);
    expect(css).toContain("--kb-statsrow-item-min-width: 10rem;");
    expect(css).toContain("--kb-statsrow-item-background: var(--kb-card-background);");
    expect(css).toContain("--kb-statsrow-item-border: var(--kb-card-border);");
    expect(css).toContain("--kb-statsrow-item-radius: var(--kb-card-radius);");
    expect(css).toContain("--kb-statsrow-positive: var(--kb-color-success);");
    expect(css).toContain("--kb-statsrow-negative: var(--kb-color-danger);");
    expect(css).toContain("--kb-statsrow-neutral: var(--kb-color-muted);");
  });
});

describe("dashboard tokens", () => {
  test("aliases page width to the large container and gutters to the space scale", () => {
    const { css } = buildTokens(real as TokenTree);
    expect(css).toContain("--kb-dashboard-max-width: var(--kb-container-size-lg);");
    expect(css).toContain("--kb-dashboard-gutter-sm: var(--kb-space-4);");
    expect(css).toContain("--kb-dashboard-gutter-md: var(--kb-space-6);");
    expect(css).toContain("--kb-dashboard-gutter-lg: var(--kb-space-8);");
    expect(css).toContain("--kb-dashboard-gutter-md-from: 48rem;");
    expect(css).toContain("--kb-dashboard-gutter-lg-from: 64rem;");
    expect(css).toContain("--kb-dashboard-collapse: 60rem;");
  });
});
