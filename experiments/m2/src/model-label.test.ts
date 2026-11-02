import { describe, expect, test } from "bun:test";
import { HINTS } from "./blind";
import { answerSchema, labelPrompt, parseAnswers } from "./model-label";
import { RULES } from "./rules";

const allNo = Object.fromEntries(RULES.map((r) => [r.id, "no"]));

describe("model labeller", () => {
  test("prompt asks every question with its hint, and shows the outline", () => {
    const p = labelPrompt("Stack 1\n  Button 2 “Delete account”");
    for (const r of RULES) {
      expect(p).toContain(r.question);
      expect(p).toContain(HINTS[r.id]);
    }
    expect(p).toContain("Button 2 “Delete account”");
  });

  test("prompt names no generating model", () => {
    expect(labelPrompt("Stack 1").toLowerCase()).not.toMatch(/claude|sonnet|gpt|codex|openai/);
  });

  test("schema requires an answer to every rule from yes, no or unsure", () => {
    const s = answerSchema();
    expect(s.required).toEqual(RULES.map((r) => r.id));
    expect(s.additionalProperties).toBe(false);
    for (const r of RULES) expect(s.properties[r.id]?.enum).toEqual(["yes", "no", "unsure"]);
  });

  test("parseAnswers keeps a complete reply and rejects a partial or invalid one", () => {
    expect(parseAnswers(JSON.stringify(allNo)) as Record<string, string>).toEqual(allNo);
    const { "INT-5": _, ...missing } = allNo;
    expect(() => parseAnswers(JSON.stringify(missing))).toThrow("INT-5");
    expect(() => parseAnswers(JSON.stringify({ ...allNo, "ARR-4": "maybe" }))).toThrow("ARR-4");
    expect(() => parseAnswers("not json")).toThrow();
  });
});
