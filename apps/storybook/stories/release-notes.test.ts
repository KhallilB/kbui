import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { definitions } from "../catalog/definitions";
import { parseChangelog, releaseHeadline } from "../site/changelog-model";
import { releaseNotes } from "../site/release-notes";

const releases = parseChangelog(
  readFileSync(new URL("../../../CHANGELOG.md", import.meta.url), "utf8"),
  Object.keys(definitions),
);

test("every published version has a short public summary, including upgrade instructions", () => {
  for (const release of releases) {
    const copy = releaseNotes[release.version];
    expect(copy, release.version).toBeDefined();
    expect(copy?.highlights.length, release.version).toBeGreaterThan(0);
    if (release.breaking.length) expect(copy?.upgrade?.length, release.version).toBeGreaterThan(0);
  }
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
