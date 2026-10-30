import { describe, expect, test } from "bun:test";
import type { TokenTree } from "../packages/tokens/src/build";
import rawTokens from "../packages/tokens/tokens.json";
import { compareTokenInventories, parseTokenInventory } from "./token-api";

const baseTree: TokenTree = {
  color: {
    bg: {
      $type: "color",
      $value: "#ffffff",
      $extensions: { "kb.dark": "#09090b" },
    },
    accent: {
      $type: "color",
      $value: "#ed5a24",
      $extensions: { "kb.dark": "#ff8457", "kb.forced": "Highlight" },
    },
    legacy: {
      $type: "color",
      $value: "#1d4ed8",
    },
  },
  space: {
    md: { $type: "dimension", $value: "1rem" },
  },
};

describe("token-api", () => {
  test("parses shipped tokens.json into a complete variable inventory", () => {
    const inventory = parseTokenInventory(rawTokens as TokenTree);
    expect(inventory.size).toBeGreaterThan(600);
    expect(inventory.get("--kb-color-bg")).toMatchObject({
      id: "color.bg",
      varName: "--kb-color-bg",
      type: "color",
    });
  });

  test("reports additions and default-value changes as non-breaking", () => {
    const candidate: TokenTree = {
      ...baseTree,
      color: {
        ...baseTree.color,
        bg: {
          $type: "color",
          $value: "#fafafa",
          $extensions: { "kb.dark": "#09090b" },
        },
        info: {
          $type: "color",
          $value: "#2563eb",
        },
      },
    };

    const diff = compareTokenInventories(baseTree, candidate);
    expect(diff.added).toEqual(["--kb-color-info"]);
    expect(diff.removed).toEqual([]);
    expect(diff.renamed).toEqual([]);
    expect(diff.typeChanged).toEqual([]);
    expect(diff.defaultChanged).toEqual([
      {
        varName: "--kb-color-bg",
        changedModes: ["light"],
      },
    ]);
    expect(diff.hasBreakingChanges).toBe(false);
    expect(diff.compatible).toBe(true);
  });

  test("detects removals, renames, and type changes as breaking unless authorized by breaking commit", () => {
    const candidate: TokenTree = {
      color: {
        bg: {
          $type: "color",
          $value: "#ffffff",
          $extensions: { "kb.dark": "#09090b" },
        },
        brandRenamed: {
          $type: "color",
          $value: "#1d4ed8",
        },
      },
      space: {
        md: { $type: "string", $value: "1rem" },
      },
    };

    const unauthorized = compareTokenInventories(baseTree, candidate, {
      commitMessages: ["feat(tokens): adjust token names"],
    });
    expect(unauthorized.removed).toEqual(["--kb-color-accent"]);
    expect(unauthorized.renamed).toEqual([
      {
        from: "--kb-color-legacy",
        to: "--kb-color-brandRenamed",
        type: "color",
      },
    ]);
    expect(unauthorized.typeChanged).toEqual([
      {
        varName: "--kb-space-md",
        fromType: "dimension",
        toType: "string",
      },
    ]);
    expect(unauthorized.hasBreakingChanges).toBe(true);
    expect(unauthorized.intentionalBreakingAuthorized).toBe(false);
    expect(unauthorized.compatible).toBe(false);

    const authorizedByBang = compareTokenInventories(baseTree, candidate, {
      commitMessages: ["feat(tokens)!: rename legacy color and remove accent"],
    });
    expect(authorizedByBang.hasBreakingChanges).toBe(true);
    expect(authorizedByBang.intentionalBreakingAuthorized).toBe(true);
    expect(authorizedByBang.compatible).toBe(true);

    const authorizedByFooter = compareTokenInventories(baseTree, candidate, {
      commitMessages: [
        "feat(tokens): update token inventory\n\nBREAKING CHANGE: removed `--kb-color-accent`.",
      ],
    });
    expect(authorizedByFooter.intentionalBreakingAuthorized).toBe(true);
    expect(authorizedByFooter.compatible).toBe(true);
  });
});
