/// <reference types="vite/client" />
import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { type FlowFamily, recipeDefinitions } from "../catalog/content";
import { GuideContent } from "../site/GuideContent";

test("shared guides render Markdown and let embedded docs navigate the top-level site", () => {
  const html = renderToStaticMarkup(
    createElement(GuideContent, {
      markdown:
        "# Guide\n\nUse [Heading](../../packages/react/docs/components/Heading.md).\n\n<script>alert(1)</script>",
      path: "docs/guides/inbox.md",
      siteRoot: "../",
      linkTarget: "_top",
    }),
  );
  expect(html).toContain('href="../components/?component=heading"');
  expect(html).toContain('target="_top"');
  expect(html).not.toContain("<script>");
  expect(html).not.toContain("<h1>");
});

test("generated-block markers are hidden; other comments are left to the renderer", () => {
  const html = renderToStaticMarkup(
    createElement(GuideContent, {
      markdown:
        "Intro.\n\n<!-- generated:files -->\n\n- [`Inbox.tsx`](../../apps/storybook/recipes/Inbox.tsx)\n\n<!-- /generated -->\n\n<!-- kept -->\n",
      path: "docs/guides/inbox.md",
      siteRoot: "../",
    }),
  );
  expect(html).not.toContain("generated");
  expect(html).toContain("Inbox.tsx");
  expect(html).toContain("kept");
});

test("each table scroll region has a distinct name", () => {
  const table = "| A | B |\n| --- | --- |\n| 1 | 2 |";
  const html = renderToStaticMarkup(
    createElement(GuideContent, {
      markdown: `${table}\n\nText.\n\n${table}`,
      path: "docs/guides/inbox.md",
      siteRoot: "../",
    }),
  );
  expect(html).toContain('aria-label="Reference table 1"');
  expect(html).toContain('aria-label="Reference table 2"');
  expect(html.match(/<table/g)?.length).toBe(2);
});

test("attributed fences retain their native code attributes and exact escaped text", () => {
  const html = renderToStaticMarkup(
    createElement(GuideContent, {
      markdown: '```tsx id="attributed-source"\nconst value = "<&>";\n\n```',
      path: "docs/guides/page-header.md",
      siteRoot: "../",
    }),
  );
  expect(html).toContain('<pre tabindex="0">');
  expect(html).toContain('id="attributed-source"');
  expect(html).toContain("const value = &quot;&lt;&amp;&gt;&quot;;\n</code>");
  expect(html).not.toContain("data-block");
});

test("single and repeated fences keep stable distinct source names across renders", () => {
  const render = (markdown: string) =>
    renderToStaticMarkup(
      createElement(GuideContent, {
        markdown,
        path: "docs/guides/page-header.md",
        siteRoot: "../",
      }),
    );
  const fence = '```tsx\nconst value = "<&>";\n```';
  const repeated = render(`${fence}\n\n${fence}`);
  expect(repeated).toContain('aria-label="Code example 1"');
  expect(repeated).toContain('aria-label="Code example 2"');
  expect(render(`${fence}\n\n${fence}`)).toBe(repeated);
  expect(render(fence)).not.toContain('aria-label="Code example 2"');
  expect(repeated).not.toContain('role="status"');
  expect(repeated).not.toContain("<button");
});

const flowRecipeTemplate = [
  "Use when",
  "Use instead",
  "Copy the files",
  "What you supply",
  "Business logic",
  "Task policy you can change",
  "Flow guarantees",
  "Customising the look",
  "Check your changes",
  "Known limits",
];

const recipeTemplates: Record<FlowFamily, string[]> = {
  "list-detail": flowRecipeTemplate,
  resolve: flowRecipeTemplate,
  intake: flowRecipeTemplate,
};

test("flow recipe guides follow the template", () => {
  // Composition recipes keep their own shorter guides.
  for (const recipe of recipeDefinitions) {
    if (!recipe.flow) {
      expect(recipe.composition, recipe.name).toBe(true);
      continue;
    }
    const markdown = readFileSync(new URL(`../../../${recipe.guide}`, import.meta.url), "utf8");
    // Fenced code can hold `##` lines that are not headings.
    const prose = markdown.replace(/```[\s\S]*?```/g, "");
    const sections = [...prose.matchAll(/^## (.+)$/gm)].map((match) => match[1]);
    expect(sections, recipe.guide).toEqual(recipeTemplates[recipe.flow]);
    expect(markdown, recipe.guide).toContain(
      `stories/${recipe.flow}-flow/${recipe.name}.stories.tsx`,
    );
    // A copied guide is read outside the repo, where relative links lead nowhere.
    for (const [, href] of prose.matchAll(/\]\(([^)]+)\)/g))
      expect(href, recipe.guide).toMatch(/^(https:\/\/|#)/);
    for (const [block, heading] of [
      ["files", "Copy the files"],
      ["policy", "Task policy you can change"],
      ["flow-guarantees", "Flow guarantees"],
    ] as const) {
      const at = prose.indexOf(`<!-- generated:${block} -->`);
      const owner = [...prose.slice(0, at).matchAll(/^## (.+)$/gm)].at(-1)?.[1];
      expect(owner, `${recipe.guide} ${block}`).toBe(heading);
    }
  }
});

test("flow recipe guides list every prop the recipe takes", () => {
  for (const recipe of recipeDefinitions.filter((entry) => entry.flow)) {
    const read = (path: string) =>
      readFileSync(new URL(`../../../${path}`, import.meta.url), "utf8");
    const source = read(recipe.files[0] ?? "");
    const inline = new RegExp(`export function ${recipe.name}\\(\\{([\\s\\S]*?)\\}: \\{`).exec(
      source,
    )?.[1];
    const named = new RegExp(`export interface ${recipe.name}Props \\{([\\s\\S]*?)\\n\\}`).exec(
      source,
    )?.[1];
    const props = [...(inline ?? named ?? "").matchAll(/^\s+(\w+)/gm)].map((match) => match[1]);
    expect(props.length, recipe.name).toBeGreaterThan(recipe.flow === "intake" ? 1 : 5);
    const supply = read(recipe.guide).split("## What you supply")[1]?.split("\n## ")[0] ?? "";
    const table = supply.split("\n\n")[2] ?? "";
    for (const prop of props) expect(table, `${recipe.guide} ${prop}`).toContain(`| \`${prop}\``);
    if (props.includes("router")) {
      const blocks = [...supply.matchAll(/```(?:ts|tsx)\n([\s\S]*?)```/g)].map(
        (match) => match[1] ?? "",
      );
      expect(
        blocks.some(
          (code) =>
            /\bfunction\b[\s\S]*?:\s*FlowRouter\b/.test(code) &&
            /\bread\s*(?:\(|:)/.test(code) &&
            /\bwrite\s*(?:\(|:)/.test(code) &&
            /\bsubscribe\s*(?:\(|:)/.test(code) &&
            !/\b(?:window|location|history)\b/.test(code),
        ),
        `${recipe.guide} must include a non-URL FlowRouter example in What you supply`,
      ).toBe(true);
    }
  }
});

// Registered recipes ship with the next release, so none may call itself unreleased.
test("no registered recipe guide carries an unreleased marker", () => {
  for (const recipe of recipeDefinitions) {
    const markdown = readFileSync(new URL(`../../../${recipe.guide}`, import.meta.url), "utf8");
    expect(markdown, recipe.guide).not.toMatch(/\bunreleased\b|not released yet/i);
  }
});
