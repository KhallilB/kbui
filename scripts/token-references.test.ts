import { describe, expect, test } from "bun:test";
import {
  checkRepositoryCssTokenReferences,
  extractKbTokenReferences,
  findUndefinedKbTokenReferences,
  RUNTIME_KB_VARS,
} from "./token-references";

describe("token-references", () => {
  test("extracts primary, nested var() fallback, and direct fallback --kb-* references while ignoring comments and declarations", () => {
    const css = [
      "/* var(--kb-commented-out) */",
      ".demo {",
      "  --kb-local-slot: 4px;",
      "  color: var(--kb-color-text);",
      "  background: var(--site-bg, var(--kb-color-surface, var(--kb-color-canvas)));",
      "  border-color: var(--kb-border-custom, --kb-color-border);",
      "}",
    ].join("\n");

    expect(extractKbTokenReferences(css)).toEqual([
      "--kb-color-text",
      "--kb-color-surface",
      "--kb-color-canvas",
      "--kb-border-custom",
      "--kb-color-border",
    ]);
  });

  test("flags misspelled or missing tokens while allowing defined tokens, local declarations, and documented runtime variables", () => {
    const defined = new Set(["--kb-color-text", "--kb-color-surface"]);
    const css = [
      ".panel {",
      "  --kb-local-gap: 8px;",
      "  gap: var(--kb-local-gap);",
      "  inline-size: var(--kb-panel-size, 20rem);",
      "  background: var(--kb-switch-on-color, var(--kb-color-surface));",
      "  color: var(--kb-color-txet, var(--kb-color-missing-fallback));",
      "}",
    ].join("\n");

    expect(findUndefinedKbTokenReferences(css, defined, RUNTIME_KB_VARS)).toEqual([
      "--kb-color-txet",
      "--kb-color-missing-fallback",
    ]);
  });

  test("verifies all owned component, reset, site, recipe, and Storybook CSS files reference only defined or runtime tokens", async () => {
    const report = await checkRepositoryCssTokenReferences();
    expect(report.filesChecked).toContain("packages/css/src/reset.css");
    expect(report.filesChecked).toContain("packages/css/src/components/button.css");
    expect(report.filesChecked).toContain("apps/storybook/site/catalog.css");
    expect(report.filesChecked).toContain("apps/storybook/site/site.css");
    expect(report.filesChecked).toContain("apps/storybook/recipes/inbox.css");
    expect(report.filesChecked).toContain("apps/storybook/.storybook/docs.css");
    expect(report.violations).toEqual([]);
  });
});
