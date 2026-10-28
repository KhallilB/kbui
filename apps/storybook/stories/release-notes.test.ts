import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { definitions } from "../catalog/definitions";
import { parseChangelog, releaseCopy, releaseHeadline } from "../site/changelog-model";
import { releaseNotes } from "../site/release-notes";

const releases = parseChangelog(
  readFileSync(new URL("../../../CHANGELOG.md", import.meta.url), "utf8"),
  Object.keys(definitions),
);

test("every published version has a short public summary, including upgrade instructions", () => {
  for (const release of releases) {
    const copy = releaseCopy(release);
    expect(copy, release.version).toBeDefined();
    expect(copy?.highlights.length, release.version).toBeGreaterThan(0);
    if (release.breaking.length) expect(copy?.upgrade?.length, release.version).toBeGreaterThan(0);
  }
});

test("a future release gets public highlights and migrations without a handwritten entry", () => {
  const [release] = parseChangelog(
    `## [9.0.0](https://github.com/KhallilB/kbui/compare/v8.0.0...v9.0.0) (2030-01-01)
### Features
* **react:** add Card and Grid
* **react:** support [nested layouts](https://example.com/layouts) with \`Grid\`
### Bug Fixes
* **react:** preserve keyboard focus
* **ci:** internal runner maintenance
### ⚠ BREAKING CHANGES
* Replace the old layout prop with columns.
`,
    ["Card", "Grid"],
  );
  if (!release) throw new Error("Missing future release fixture");
  expect(releaseNotes["9.0.0"]).toBeUndefined();
  expect(releaseCopy(release)).toEqual({
    title: "Card and Grid",
    highlights: [
      "New components: Card, Grid.",
      "Support nested layouts with Grid",
      "Preserve keyboard focus",
    ],
    upgrade: ["Replace the old layout prop with columns."],
  });
});

test("edited summaries remain preferred without hiding generated breaking instructions", () => {
  const copy = releaseCopy({
    version: "0.8.0",
    components: [],
    improvements: ["Unedited subject"],
    fixes: [],
    breaking: ["Replace the legacy theme prop."],
  });
  expect(copy.title).toBe("A new look, in both themes");
  expect(copy.highlights).toEqual([
    "Monochrome surfaces, a persimmon accent, and deeper cards are now the defaults.",
    "Charts and status indicators have dedicated colors for current, visited, changed, and error states.",
  ]);
  expect(copy.upgrade).toEqual(["Replace the legacy theme prop."]);
});

test("maintenance-only and breaking-only releases still explain the release", () => {
  const release = { version: "9.0.1", components: [], improvements: [], fixes: [], breaking: [] };
  expect(releaseCopy(release)).toEqual({
    title: "Release notes",
    highlights: ["Maintenance release. See the full history on GitHub."],
    upgrade: [],
  });
  expect(releaseCopy({ ...release, breaking: ["Use the new entry point."] }).upgrade).toEqual([
    "Use the new entry point.",
  ]);
});

test("release-scoped breaking changes retain required consumer migration steps", () => {
  const [release] = parseChangelog(
    `## 9.0.0 (2030-01-01)
### ⚠ BREAKING CHANGES
* **release:** Replace the old package scope.
### Bug Fixes
* **release:** update publishing credentials
`,
    [],
  );
  if (!release) throw new Error("Missing migration fixture");
  expect(releaseCopy(release).upgrade).toEqual(["Replace the old package scope."]);
  expect(releaseCopy(release).highlights).not.toContain("Update publishing credentials");
});

test("0.10.0 documents the package rename and synchronized upgrade", () => {
  const copy = releaseNotes["0.10.0"];
  expect(copy?.highlights.length).toBeGreaterThan(0);
  expect(copy?.upgrade?.join(" ")).toContain("@kbui/");
  expect(copy?.upgrade?.join(" ")).toContain("@kb.ui/");
  expect(copy?.upgrade?.join(" ")).toContain("same version");
});

test("release navigation uses editorial titles instead of commit subjects or change counts", () => {
  const palette = releases.find((release) => release.version === "0.8.0");
  if (!palette) throw new Error("Missing palette release fixture");
  expect(releaseHeadline(palette)).toBe("A new look, in both themes");
  expect(
    releaseHeadline({ components: [], breaking: [], improvements: ["A", "B"], fixes: ["C"] }),
  ).toBe("Release notes");
  expect(releaseNotes["0.2.0"]?.upgrade?.join(" ")).toMatch(/Facet.*Panel/);
  expect(releaseNotes["0.2.0"]?.upgrade?.join(" ")).toContain("cut");
});
