import { posix } from "node:path";
import { flowFactsFor } from "../stories/list-detail-flow/facts";
import {
  type RuleGroup,
  type RuleId,
  type RuleMeta,
  ruleMeta,
} from "../stories/list-detail-flow/rules";
import type { RecipeDefinition, RecipePolicy } from "./content";

export type GeneratedBlock = "files" | "policy" | "flow-guarantees";

const generatedBlocks: readonly GeneratedBlock[] = ["files", "policy", "flow-guarantees"];

// Order is the guide's reading order.
const groupTitles = {
  focus: "Focus",
  navigation: "Navigation and history",
  editing: "Editing and commits",
  lists: "Lists",
  async: "Pending commits",
  data: "Live data",
} satisfies Record<RuleGroup, string>;

const policyRows = {
  collapseBelow: (value) => ["List and detail share the row from", `\`${value}\` of recipe width`],
  context: (value) => ["Context on first open", value === "open" ? "Shown" : "Hidden"],
  commit: (value) => ["A commit", value === "edit" ? "Edits the record" : "Appends to the record"],
} satisfies { [Key in keyof RecipePolicy]: (value: RecipePolicy[Key]) => [string, string] };

function files(recipe: RecipeDefinition) {
  const from = posix.dirname(recipe.guide);
  return recipe.files
    .map((file) => `- [\`${posix.basename(file)}\`](${posix.relative(from, file)})`)
    .join("\n");
}

function policy(recipe: RecipeDefinition) {
  const value = recipe.policy;
  if (!value) throw new Error(`${recipe.name} declares no policy`);
  const rows = [
    policyRows.collapseBelow(value.collapseBelow),
    policyRows.context(value.context),
    policyRows.commit(value.commit),
  ];
  return ["| Policy | Value |", "| --- | --- |", ...rows.map(([a, b]) => `| ${a} | ${b} |`)].join(
    "\n",
  );
}

function guarantees(recipe: RecipeDefinition) {
  const facts = flowFactsFor(recipe.name);
  const applicable = (Object.entries(ruleMeta) as [RuleId, RuleMeta][]).filter(
    ([, meta]) => meta.requires !== "async" || facts.async,
  );
  const sections: string[] = [];
  for (const [group, title] of Object.entries(groupTitles)) {
    const met = applicable.filter(([id, meta]) => meta.group === group && !(id in facts.gaps));
    if (met.length)
      sections.push(`### ${title}\n\n${met.map(([, meta]) => `- ${meta.summary}`).join("\n")}`);
  }
  const gaps = applicable.filter(([id]) => id in facts.gaps);
  if (gaps.length)
    sections.push(
      `### Not met yet\n\n${gaps.map(([id, meta]) => `- **${meta.summary}.** ${facts.gaps[id]}.`).join("\n")}`,
    );
  return sections.join("\n\n");
}

/** Markdown for one generated block, without its markers. */
export function renderBlock(recipe: RecipeDefinition, block: GeneratedBlock): string {
  if (block === "files") return files(recipe);
  if (block === "policy") return policy(recipe);
  return guarantees(recipe);
}

const marker = /<!-- generated:([a-z-]+) -->\n([\s\S]*?)(<!-- \/generated -->|$)/g;

/** Rewrites every `<!-- generated:<block> -->` … `<!-- /generated -->` pair in a guide. */
export function applyBlocks(markdown: string, recipe: RecipeDefinition): string {
  return markdown.replace(marker, (_match, name: string, body: string, end: string) => {
    const block = generatedBlocks.find((entry) => entry === name);
    if (!block) throw new Error(`Unknown generated block "${name}" in ${recipe.guide}`);
    if (!end || body.includes("<!-- generated:"))
      throw new Error(`${recipe.guide}: generated:${name} has no end marker`);
    return `<!-- generated:${block} -->\n\n${renderBlock(recipe, block)}\n\n<!-- /generated -->`;
  });
}
