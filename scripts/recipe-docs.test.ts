import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { recipeDefinitions } from "../apps/storybook/catalog/content";
import {
  applyBlocks,
  type GeneratedBlock,
  renderBlock,
} from "../apps/storybook/catalog/recipe-docs";
import { flowFactsFor } from "../apps/storybook/stories/list-detail-flow/facts";
import { type RuleMeta, ruleMeta } from "../apps/storybook/stories/list-detail-flow/rules";

const root = resolve(import.meta.dir, "..");
const flows = recipeDefinitions.filter((recipe) => recipe.flow);
const blocks: GeneratedBlock[] = ["files", "policy", "flow-guarantees"];
const guide = (path: string) => readFileSync(resolve(root, path), "utf8");
const byName = (name: string) => {
  const recipe = flows.find((entry) => entry.name === name);
  if (!recipe) throw new Error(`No flow recipe ${name}`);
  return recipe;
};

test("guides match generated blocks", () => {
  expect(flows.length).toBeGreaterThan(0);
  for (const recipe of flows) {
    const markdown = guide(recipe.guide);
    for (const block of blocks)
      expect(markdown, `${recipe.guide} ${block}`).toContain(`<!-- generated:${block} -->`);
    // Stale means `bun run docs:recipes` was not run after a catalog or rule change.
    expect(applyBlocks(markdown, recipe), recipe.guide).toBe(markdown);
  }
});

test("stale block fails", () => {
  const recipe = byName("Inbox");
  const markdown = guide(recipe.guide);
  const meta = ruleMeta["open-focus"] as { summary: string };
  const original = meta.summary;
  meta.summary = "Opening a record focuses something else";
  try {
    expect(applyBlocks(markdown, recipe)).not.toBe(markdown);
  } finally {
    meta.summary = original;
  }
});

test("async rules only for async recipes", () => {
  const asyncRules = (Object.values(ruleMeta) as RuleMeta[]).filter(
    (meta) => meta.requires === "async",
  );
  for (const recipe of flows) {
    const facts = flowFactsFor(recipe.name);
    const rendered = renderBlock(recipe, "flow-guarantees");
    for (const meta of asyncRules)
      expect(rendered.includes(meta.summary), `${recipe.name}: ${meta.summary}`).toBe(facts.async);
  }
});

test("gaps are listed as not met, never as guarantees", () => {
  for (const recipe of flows) {
    const rendered = renderBlock(recipe, "flow-guarantees");
    const [met = "", notMet = ""] = rendered.split("### Not met yet");
    for (const [id, reason] of Object.entries(flowFactsFor(recipe.name).gaps)) {
      const { summary } = ruleMeta[id as keyof typeof ruleMeta];
      expect(met, `${recipe.name} ${id}`).not.toContain(summary);
      expect(notMet, `${recipe.name} ${id}`).toContain(`- **${summary}.** ${reason}.`);
    }
  }
});

test("policy is a two-column table and files link relative to the guide", () => {
  const recipe = byName("ListDetail");
  const policy = renderBlock(recipe, "policy");
  expect(policy).toContain("| Policy | Value |");
  expect(policy).toContain("`48rem`");
  for (const row of policy.split("\n")) expect(row.split("|").length).toBe(4);
  expect(renderBlock(recipe, "files")).toContain(
    "- [`ListDetail.tsx`](../../apps/storybook/recipes/ListDetail.tsx)",
  );
});

test("malformed or unknown markers are rejected", () => {
  const recipe = byName("Inbox");
  expect(() => applyBlocks("<!-- generated:files -->\n", recipe)).toThrow("no end marker");
  expect(() => applyBlocks("<!-- generated:other -->\n<!-- /generated -->\n", recipe)).toThrow(
    'Unknown generated block "other"',
  );
});

test("fixtures take async and gaps from flow facts", () => {
  for (const recipe of flows) {
    const source = guide(`apps/storybook/stories/list-detail-flow/${recipe.name}.stories.tsx`);
    expect(source, recipe.name).toContain(`gaps: flowFacts.${recipe.name}.gaps,`);
    expect(source.includes(`flowFacts.${recipe.name}.async ?`), recipe.name).toBe(
      flowFactsFor(recipe.name).async,
    );
  }
});
