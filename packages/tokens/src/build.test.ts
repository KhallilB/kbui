import { describe, expect, test } from "bun:test";
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

  test("snapshot of css output", () => {
    expect(buildTokens(tree).css).toMatchSnapshot();
  });
});
