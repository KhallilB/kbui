import { expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { loadCsf } from "storybook/internal/csf-tools";

test("theme duplicates and regression fixtures stay testable without crowding public docs", () => {
  const root = new URL("../../../packages/react/src/components/", import.meta.url);
  let hidden = 0;
  for (const name of readdirSync(root)) {
    const fileName = fileURLToPath(new URL(`${name}/${name}.stories.tsx`, root));
    const csf = loadCsf(readFileSync(fileName, "utf8"), {
      fileName,
      makeTitle: (title) => title,
    }).parse();
    for (const story of csf.stories) {
      if (
        !/--(?:.*-dark|dark|motion-tokens|token-overrides(?:-light)?|nested-theme|controlled-refusal|focus-visible|selected-material)$/.test(
          story.id,
        )
      )
        continue;
      expect(story.tags ?? [], story.id).toContain("!dev");
      expect(story.tags ?? [], story.id).toContain("!autodocs");
      expect(story.tags ?? [], story.id).not.toContain("!test");
      hidden++;
    }
  }
  expect(hidden).toBeGreaterThan(20);
});
