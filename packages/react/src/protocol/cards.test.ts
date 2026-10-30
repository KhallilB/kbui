/// <reference types="vite/client" />
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import tokens from "../../../tokens/tokens.json";
import { placement as dashboard } from "../components/Dashboard/Dashboard.placement";
import { placement as form } from "../components/Form/Form.placement";
import { placement as formSection } from "../components/FormSection/FormSection.placement";
import { placement as gallery } from "../components/Gallery/Gallery.placement";
import { placement as pageHeader } from "../components/PageHeader/PageHeader.placement";
import { placement as settings } from "../components/Settings/Settings.placement";
import { placement as supportingPane } from "../components/SupportingPane/SupportingPane.placement";
import { type Card, validateCard } from "./card";
import { contractsOf, rootClass, sizeBreakpoints } from "./placement";

const cards = import.meta.glob<Card>("../components/*/*.card.ts", {
  eager: true,
  import: "default",
});
const cardOf = (name: string) => cards[`../components/${name}/${name}.card.ts`];

const stylesheets = join(import.meta.dirname, "../../../css/src/components");
const css = (name: string) => readFileSync(join(stylesheets, `${name}.css`), "utf8");

// M3's five intents and four patterns.
const intents = ["Form", "Settings", "Dashboard", "SupportingPane", "Gallery"];
const m3 = [...intents, "FormSection", "PageHeader", "ConfirmAction", "StatsRow"];

describe("identity cards", () => {
  test.each(m3)("%s has a complete card beside it", (name) => {
    const card = cardOf(name);
    if (!card) throw new Error(`${name}.card.ts missing`);
    expect(validateCard(card)).toEqual([]);
    expect(card.role === null, "only intents have no slot role").toBe(intents.includes(name));
    expect(card.requires?.length).toBeGreaterThan(0);
    expect(card.prompts?.pick.length).toBeGreaterThan(0);
    expect(Object.keys(card.prompts?.nearMiss ?? {}).sort()).toEqual(
      Object.keys(card.instead).sort(),
    );
    if (!card.placement) throw new Error(`${name} card has no placement`);
    for (const { contract } of contractsOf(card.placement))
      expect(rootClass(contract.root)).toBe(`.kb-${name.toLowerCase()}`);
  });
});

// Queries cannot read tokens, so their literal thresholds must match the contracts.
describe("stylesheets apply their placement contracts", () => {
  const rem = (value: number | undefined) => `${value}rem`;

  test("PageHeader moves actions onto the title row at medium", () => {
    expect(css("pageheader")).toContain(
      `@container kb-pageheader (width < ${rem(pageHeader.from.medium)})`,
    );
  });

  test("Settings puts row status and actions on one line at medium", () => {
    expect(css("settings")).toContain(
      `@container kb-settings (width >= ${rem(settings.from.medium)})`,
    );
  });

  test("FormSection splits at its collapse token", () => {
    expect(rem(formSection[1].from.medium)).toBe(tokens.formsection.collapse.$value);
  });

  test("Form measures are the width tokens", () => {
    const measures = form.flatMap(({ rules }) =>
      rules.flatMap((rule) => (rule.place === "measure" ? [rem(rule.max)] : [])),
    );
    expect(measures).toEqual([tokens.form.width.sm.$value, tokens.form.width.md.$value]);
  });

  test.each([
    ["dashboard", dashboard],
    ["supportingpane", supportingPane],
    ["gallery", gallery],
  ] as const)("%s measures its max-width token", (name, contract) => {
    const measure = contract.rules.find((rule) => rule.place === "measure");
    expect(tokens[name]["max-width"].$value).toBe("{container.size.lg}");
    expect(rem(measure?.max)).toBe(tokens.container.size.lg.$value);
  });

  // Panels split at 60rem of panel width, which wide gutters reach at a 64rem page.
  test("Dashboard splits its panels where wide begins", () => {
    const gutter = Number.parseFloat(tokens.space["8"].$value);
    expect(tokens.dashboard.gutter.lg.$value).toBe("{space.8}");
    expect(tokens.dashboard.gutter["lg-from"].$value).toBe(rem(sizeBreakpoints.wide));
    expect(Number.parseFloat(tokens.dashboard.collapse.$value) + 2 * gutter).toBe(
      sizeBreakpoints.wide,
    );
  });
});
