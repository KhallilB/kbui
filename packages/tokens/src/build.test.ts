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
