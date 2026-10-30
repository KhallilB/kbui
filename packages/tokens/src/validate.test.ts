import { describe, expect, test } from "bun:test";
import rawTokens from "../tokens.json";
import { buildTokens, type TokenTree } from "./build";
import { validateTokenCycles } from "./validate";

describe("validateTokenCycles", () => {
  test("rejects direct self-alias cycle in light mode with complete path", () => {
    const tree: TokenTree = {
      color: {
        self: { $type: "color", $value: "{color.self}" },
      },
    };
    expect(() => validateTokenCycles(tree)).toThrow(
      "Token alias cycle in light mode: color.self -> color.self",
    );
    expect(() => buildTokens(tree)).toThrow(
      "Token alias cycle in light mode: color.self -> color.self",
    );
  });

  test("rejects multi-hop light-mode alias cycle with complete path", () => {
    const tree: TokenTree = {
      color: {
        entry: { $type: "color", $value: "{color.a}" },
        a: { $type: "color", $value: "{color.b}" },
        b: { $type: "color", $value: "{color.c}" },
        c: { $type: "color", $value: "{color.a}" },
      },
    };
    expect(() => buildTokens(tree)).toThrow(
      "Token alias cycle in light mode: color.a -> color.b -> color.c -> color.a",
    );
  });

  test("rejects dark-only alias cycle with complete path", () => {
    const tree: TokenTree = {
      color: {
        surface: {
          $type: "color",
          $value: "#ffffff",
          $extensions: { "kb.dark": "{color.panel}" },
        },
        panel: {
          $type: "color",
          $value: "{color.surface}",
          $extensions: { "kb.dark": "{color.elevated}" },
        },
        elevated: {
          $type: "color",
          $value: "#f5f5f5",
          $extensions: { "kb.dark": "{color.surface}" },
        },
      },
    };
    expect(() => buildTokens(tree)).toThrow(
      "Token alias cycle in dark mode: color.surface -> color.panel -> color.elevated -> color.surface",
    );
  });

  test("rejects forced-color alias cycle including inherited base and dark aliases", () => {
    const tree: TokenTree = {
      color: {
        fg: {
          $type: "color",
          $value: "{color.ink}",
        },
        ink: {
          $type: "color",
          $value: "#111111",
          $extensions: { "kb.forced": "{color.fg}" },
        },
      },
    };
    expect(() => buildTokens(tree)).toThrow(
      "Token alias cycle in forced mode: color.fg -> color.ink -> color.fg",
    );

    const darkForcedTree: TokenTree = {
      color: {
        fg: {
          $type: "color",
          $value: "#ffffff",
          $extensions: { "kb.dark": "{color.ink}" },
        },
        ink: {
          $type: "color",
          $value: "#111111",
          $extensions: { "kb.forced": "{color.fg}" },
        },
      },
    };
    expect(() => buildTokens(darkForcedTree)).toThrow(
      "Token alias cycle in forced mode: color.fg -> color.ink -> color.fg",
    );
  });

  test("allows cross-mode noncycles when each mode graph is acyclic", () => {
    const tree: TokenTree = {
      color: {
        primary: {
          $type: "color",
          $value: "{color.secondary}",
          $extensions: {
            "kb.dark": "#101820",
            "kb.forced": "CanvasText",
          },
        },
        secondary: {
          $type: "color",
          $value: "#f8fafc",
          $extensions: {
            "kb.dark": "{color.primary}",
            "kb.forced": "{color.primary}",
          },
        },
      },
    };
    expect(() => validateTokenCycles(tree)).not.toThrow();
    const out = buildTokens(tree);
    expect(out.css).toContain("--kb-color-primary: var(--kb-color-secondary);");
    expect(out.css).toContain("--kb-color-secondary: var(--kb-color-primary);");
  });

  test("accepts shipped tokens.json across light, dark, and forced graphs", () => {
    expect(() => validateTokenCycles(rawTokens as TokenTree)).not.toThrow();
  });
});

describe("validateTokenValuesAndTypes", () => {
  test("rejects unknown token $type kinds", () => {
    const tree: TokenTree = {
      mystery: { $type: " unknownKind ", $value: "12px" },
    };
    expect(() => buildTokens(tree)).toThrow(/Unsupported token \$type/);
  });

  test("rejects malformed color values across light, dark, and forced modes", () => {
    expect(() =>
      buildTokens({
        color: { badHex: { $type: "color", $value: "#12345" } },
      }),
    ).toThrow(/Invalid color value/);

    expect(() =>
      buildTokens({
        color: {
          badDark: {
            $type: "color",
            $value: "#ffffff",
            $extensions: { "kb.dark": "not-a-color" },
          },
        },
      }),
    ).toThrow(/Invalid color value/);

    expect(() =>
      buildTokens({
        color: {
          badForced: {
            $type: "color",
            $value: "#ffffff",
            $extensions: { "kb.forced": "rgb(300 0 0)" },
          },
        },
      }),
    ).toThrow(/Invalid color value/);
  });

  test("rejects malformed dimension, duration, fontWeight, cubicBezier, number, gradient, and shadow values", () => {
    expect(() =>
      buildTokens({
        space: { bad: { $type: "dimension", $value: "16invalid" } },
      }),
    ).toThrow(/Invalid dimension value/);

    expect(() =>
      buildTokens({
        motion: { badDuration: { $type: "duration", $value: "-20ms" } },
      }),
    ).toThrow(/Invalid duration value/);

    expect(() =>
      buildTokens({
        font: { badWeight: { $type: "fontWeight", $value: "450" } },
      }),
    ).toThrow(/Invalid fontWeight value/);

    expect(() =>
      buildTokens({
        motion: { badCurve: { $type: "cubicBezier", $value: "cubic-bezier(1.5, 0, 0.2, 1)" } },
      }),
    ).toThrow(/Invalid cubicBezier value/);

    expect(() =>
      buildTokens({
        scale: { badNumber: { $type: "number", $value: "NaN" } },
      }),
    ).toThrow(/Invalid number value/);

    expect(() =>
      buildTokens({
        face: { badGradient: { $type: "gradient", $value: "url(foo.png)" } },
      }),
    ).toThrow(/Invalid gradient value/);

    expect(() =>
      buildTokens({
        elevation: { badShadow: { $type: "shadow", $value: "invalid-shadow" } },
      }),
    ).toThrow(/Invalid shadow value/);
  });

  test("rejects incompatible alias types while allowing valid composite color/shadow/gradient aliases", () => {
    expect(() =>
      buildTokens({
        space: { md: { $type: "dimension", $value: "1rem" } },
        color: { wrong: { $type: "color", $value: "{space.md}" } },
      }),
    ).toThrow(/Incompatible token alias \{space\.md\} \(dimension\) for color\.wrong \(color\)/);

    expect(() =>
      buildTokens({
        blue: { "500": { $type: "color", $value: "#2563eb" } },
        space: { wrong: { $type: "dimension", $value: "{blue.500}" } },
      }),
    ).toThrow(/Incompatible token alias \{blue\.500\} \(color\) for space\.wrong \(dimension\)/);

    const validComposite: TokenTree = {
      color: {
        top: { $type: "color", $value: "#ffffff" },
        bottom: { $type: "color", $value: "#f4f4f5" },
      },
      material: {
        baseShadow: { $type: "shadow", $value: "0 1px 2px rgb(0 0 0 / 0.1)" },
        face: {
          $type: "gradient",
          $value: "linear-gradient(180deg, {color.top}, {color.bottom})",
        },
        layeredShadow: {
          $type: "shadow",
          $value:
            "{material.baseShadow}, 0 4px 8px color-mix(in srgb, {color.top} 50%, {color.bottom})",
        },
      },
    };
    expect(() => buildTokens(validComposite)).not.toThrow();
  });
});
