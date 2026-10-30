/// <reference types="vite/client" />
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import tokens from "../../../tokens/tokens.json";
import { type Card, validateCard } from "./card";
import { sizeBreakpoints } from "./placement";

const cards = import.meta.glob<Card>("../components/*/*.card.ts", {
  eager: true,
  import: "default",
});
const cardOf = (name: string) => cards[`../components/${name}/${name}.card.ts`];

const stylesheets = join(import.meta.dirname, "../../../css/src/components");
const css = (name: string) => readFileSync(join(stylesheets, `${name}.css`), "utf8");

// M3 intents and patterns on main; the rest join as they land.
const m3 = ["Form", "Settings", "FormSection", "PageHeader", "ConfirmAction"];

describe("identity cards", () => {
  test.each(m3)("%s has a complete card beside it", (name) => {
    const card = cardOf(name);
    if (!card) throw new Error(`${name}.card.ts missing`);
    expect(validateCard(card)).toEqual([]);
    expect(card.requires?.length).toBeGreaterThan(0);
    expect(card.prompts?.pick.length).toBeGreaterThan(0);
    expect(Object.keys(card.prompts?.nearMiss ?? {}).sort()).toEqual(
      Object.keys(card.instead).sort(),
    );
    expect(card.placement?.root).toBe(`.kb-${name.toLowerCase()}`);
  });
});

// Queries cannot read tokens, so one literal compact threshold must match the collapse token
// and sit at or below medium, where the stories check the medium arrangement.
describe("stylesheets switch arrangement at the compact threshold", () => {
  const threshold = tokens.formsection.collapse.$value;

  test("threshold is below the medium size class", () => {
    expect(Number.parseFloat(threshold)).toBeLessThanOrEqual(sizeBreakpoints.medium);
  });

  test("PageHeader moves actions onto the title row at the threshold", () => {
    expect(css("pageheader")).toContain(`@container kb-pageheader (width < ${threshold})`);
  });

  test("Settings puts row status and actions on one line at the threshold", () => {
    expect(css("settings")).toContain(`@container kb-settings (width >= ${threshold})`);
  });

  test("Form measure is its default md width", () => {
    const measure = cardOf("Form")?.placement?.rules.find((rule) => rule.place === "measure");
    expect(measure && "max" in measure && `${measure.max}rem`).toBe(tokens.form.width.md.$value);
  });
});
