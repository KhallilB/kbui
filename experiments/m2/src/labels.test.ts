import { describe, expect, test } from "bun:test";
import { adjudicate, rechecks } from "./labels";
import type { Finding } from "./rules";

const found = (rule: Finding["rule"], detail = "x"): Finding => ({
  rule,
  elementKey: null,
  detail,
});

describe("rechecks", () => {
  test("picks disagreements on literal rules in both directions", () => {
    const items = rechecks(
      [
        { token: "01", findings: [found("DES-2", "h1 to h3"), found("DES-2", "h1 to h3")] },
        { token: "02", findings: [] },
      ],
      { "01": { "DES-2": "no" }, "02": { "INT-3": "yes" } },
    );
    expect(items).toEqual([
      { token: "01", rule: "DES-2", blind: "no", evidence: ["h1 to h3"] },
      { token: "02", rule: "INT-3", blind: "yes", evidence: [] },
    ]);
  });

  test("skips agreement, unsure, unanswered and judgement rules", () => {
    const items = rechecks(
      [{ token: "01", findings: [found("INT-1"), found("ARR-2"), found("ARR-1")] }],
      { "01": { "INT-1": "yes", "ARR-2": "no", "ARR-1": "unsure", "INT-4": "no" } },
    );
    expect(items).toEqual([]);
  });
});

describe("adjudicate", () => {
  test("replaces only the rechecked answers", () => {
    const blind = { "01": { "INT-1": "no", "DES-2": "no" }, "02": { "INT-3": "yes" } } as const;
    expect(adjudicate(blind, { "01": { "INT-1": "yes" } })).toEqual({
      "01": { "INT-1": "yes", "DES-2": "no" },
      "02": { "INT-3": "yes" },
    });
    expect(blind["01"]["INT-1"]).toBe("no");
  });
});
