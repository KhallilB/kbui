import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { definitions } from "../catalog/definitions";
import { parseChangelog, releaseHeadline } from "../site/changelog-model";

const components = ["Card", "Checkbox", "Grid", "Input", "NumberField", "FileInput", "Status"];
const sha = (id: string) => ` ([${id}](https://github.com/KhallilB/kbui/commit/${id}0000))`;
const fixture = `# Changelog

## [0.2.0](https://github.com/KhallilB/kbui/compare/v0.1.0...v0.2.0) (2026-10-26)


### ⚠ BREAKING CHANGES

* **react,css:** Facet is now Panel.

### Features

* **react:** add NumberField and FileInput${sha("aaaaaaa")}
* **react:** add controlled tactile Checkbox${sha("bbbbbbb")}
* **react:** add Input adornments and search recipe${sha("ccccccc")}
* **react:** add Input adornments and search recipe${sha("ddddddd")}
* ship tactile default design${sha("eeeeeee")}

### Bug Fixes

* **ci:** install Bun with image-provided npm${sha("fffffff")}
* **test:** await route cleanup${sha("1111111")}
* **react:** keep focus compact${sha("2222222")}

### Code Refactoring

* **react:** rename Facet to Panel${sha("3333333")}

## 0.1.0 (2026-10-22)


### Features

* **react,css:** add Facet and Status${sha("4444444")}
* add neutral Card and Grid with consumer version guard${sha("5555555")}

### Continuous Integration

* **release:** install each release everywhere${sha("6666666")}
`;

test("changelog releases keep version, date and compare link", () => {
  const releases = parseChangelog(fixture, components);
  expect(releases.map(({ version, date, compareUrl }) => ({ version, date, compareUrl }))).toEqual([
    {
      version: "0.2.0",
      date: "2026-10-26",
      compareUrl: "https://github.com/KhallilB/kbui/compare/v0.1.0...v0.2.0",
    },
    { version: "0.1.0", date: "2026-10-22", compareUrl: undefined },
  ]);
});

test("changes group by meaning and drop scopes, hashes, duplicates and internal work", () => {
  const [latest, first] = parseChangelog(fixture, components);
  expect(latest).toMatchObject({
    breaking: ["Facet is now Panel."],
    components: ["NumberField", "FileInput", "Checkbox"],
    improvements: ["Add Input adornments and search recipe", "Ship tactile default design"],
    fixes: ["Keep focus compact"],
  });
  expect(first).toMatchObject({
    breaking: [],
    components: ["Card", "Grid"],
    improvements: ["Add Facet and Status"],
    fixes: [],
  });
});

test("release headline keeps component names as the fallback instead of technical counts", () => {
  const release = { breaking: [], improvements: [], fixes: [] };
  expect(releaseHeadline({ ...release, components: ["Card"] })).toBe("Card");
  expect(releaseHeadline({ ...release, components: ["Card", "Grid"] })).toBe("Card and Grid");
  expect(
    releaseHeadline({ ...release, components: ["Checkbox", "Select", "Switch", "RadioGroup"] }),
  ).toBe("Checkbox, Select, Switch and 1 more");
  expect(releaseHeadline({ ...release, components: [], improvements: ["Faster menus"] })).toBe(
    "Release notes",
  );
  expect(releaseHeadline({ ...release, components: [], fixes: ["C", "D"] })).toBe("Release notes");
  expect(releaseHeadline({ ...release, components: [] })).toBe("Release notes");
});

test("repository changelog parses every release against the catalog", () => {
  const source = readFileSync(new URL("../../../CHANGELOG.md", import.meta.url), "utf8");
  const manifest = JSON.parse(
    readFileSync(new URL("../../../.release-please-manifest.json", import.meta.url), "utf8"),
  );
  const releases = parseChangelog(source, Object.keys(definitions));
  expect(releases.length).toBe(source.match(/^## /gm)?.length ?? 0);
  expect(releases[0]?.version).toBe(manifest["."]);
  for (const release of releases)
    for (const name of release.components) expect(Object.keys(definitions)).toContain(name);
});

test("an added component may carry a component or intent suffix", () => {
  const [release] = parseChangelog(
    `## 0.3.0 (2026-11-01)

### Features

* **react:** add Stack layout component${sha("7777777")}
* **react:** add Form and Settings layout intents and FormSection${sha("8888888")}
* **react:** add Grid adornments${sha("9999999")}
`,
    ["Stack", "Form", "Settings", "FormSection", "Grid"],
  );
  expect(release).toMatchObject({
    components: ["Stack", "Form", "Settings", "FormSection"],
    improvements: ["Add Grid adornments"],
  });
});
