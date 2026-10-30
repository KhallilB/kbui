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
