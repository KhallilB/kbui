import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import * as publicApi from "../../../packages/react/src/index";
import { adoptionRelationships } from "../catalog/adoption";
import { loadAdoptionCoverage } from "../catalog/adoption-source";

const root = fileURLToPath(new URL("../../../", import.meta.url));
const read = (file: string) => readFileSync(`${root}${file}`, "utf8");
const families = Object.keys(publicApi).filter((name) => /^[A-Z]/.test(name));

test("adoption map covers actual exports once and derives canonical examples", () => {
  const rows = loadAdoptionCoverage();
  expect(rows).toHaveLength(63);
  expect(rows.map((row) => row.family).sort()).toEqual(families.sort());
  expect(rows.every((row) => row.kind === "component")).toBe(true);
  const section = rows.find((row) => row.family === "FormSection");
  expect(section?.reference).toBe("packages/react/docs/components/FormSection.md");
  expect(section?.defaultStoryId).toBe("components-formsection--default");
  expect(section?.examples.map((example) => example.id)).toContain(
    "components-formsection--split-layout",
  );
});

test("existing package composition and pending native-control replacements stay distinct", () => {
  const rows = loadAdoptionCoverage();
  const section = rows.find((row) => row.family === "FormSection");
  expect(section).toMatchObject({
    status: "adopted",
    source: "apps/storybook/recipes/ListDetail.tsx",
    proof: { id: "recipes-listdetail--edit-and-validate" },
  });
  expect(rows.find((row) => row.family === "Textarea")).toMatchObject({
    status: "pending",
    destination: expect.stringContaining("reply"),
  });
  expect(rows.find((row) => row.family === "Toolbar")).toMatchObject({
    status: "adopted",
    source: "apps/storybook/recipes/PageHeader.stories.tsx",
    proof: { id: "recipes-pageheader--record-detail" },
  });
  expect(rows.find((row) => row.family === "Switch")).toMatchObject({
    status: "adopted",
    proof: { id: "site-themetoggle--default" },
  });
});

test("new exports, missing coverage and obsolete families fail by name", () => {
  expect(() => loadAdoptionCoverage(adoptionRelationships, [...families, "NewWidget"])).toThrow(
    "Missing adoption relationship: NewWidget",
  );
  const { Button: _button, ...missing } = adoptionRelationships;
  expect(() => loadAdoptionCoverage(missing)).toThrow("Missing adoption relationship: Button");
  expect(() =>
    loadAdoptionCoverage({
      ...adoptionRelationships,
      OldWidget: { status: "pending", destination: "Retire" },
    }),
  ).toThrow("Unknown adoption family: OldWidget");
});

test("missing composition files and stale proof stories fail by family", () => {
  const current = adoptionRelationships.Switch;
  if (current?.status !== "adopted") throw new Error("Expected Switch adoption");
  expect(() =>
    loadAdoptionCoverage({
      ...adoptionRelationships,
      Switch: { ...current, source: "missing.tsx" },
    }),
  ).toThrow("Switch: missing composition source missing.tsx");
  expect(() =>
    loadAdoptionCoverage({
      ...adoptionRelationships,
      Switch: { ...current, proof: { ...current.proof, exportName: "RemovedStory" } },
    }),
  ).toThrow("Switch: missing proof story RemovedStory");
  expect(() =>
    loadAdoptionCoverage({
      ...adoptionRelationships,
      Switch: {
        ...current,
        proof: { file: "apps/storybook/stories/Home.stories.tsx", exportName: "Navigation" },
      },
    }),
  ).toThrow("Switch: proof must import its composition source");
});

test("imports, comments, strings and shadowed JSX cannot count as rendered adoption", () => {
  const imported = 'import { Switch } from "@kb.ui/react";';
  for (const source of [
    `${imported} export const View = () => <div>Switch</div>;`,
    `${imported} // <Switch />\nconst code = "<Switch />";`,
    `${imported} function View(Switch: any) { return <Switch />; }`,
    `import type { Switch } from "@kb.ui/react"; const View = () => <Switch />;`,
    'import { Switch } from "./recipe"; const View = () => <Switch />;',
  ]) {
    expect(() =>
      loadAdoptionCoverage(adoptionRelationships, families, (file) =>
        file === "apps/storybook/site/ThemeToggle.tsx" ? source : read(file),
      ),
    ).toThrow("Switch: composition must render its public component");
  }
});

test("aliased public JSX counts, while removed play checks and empty gaps fail", () => {
  expect(() =>
    loadAdoptionCoverage(adoptionRelationships, families, (file) =>
      file === "apps/storybook/site/ThemeToggle.tsx"
        ? 'import { Switch as ThemeSwitch } from "@kb.ui/react"; const View = () => <ThemeSwitch />;'
        : read(file),
    ),
  ).not.toThrow();
  expect(() =>
    loadAdoptionCoverage(adoptionRelationships, families, (file) =>
      file === "apps/storybook/stories/ThemeToggle.stories.tsx"
        ? 'export default { title: "Site/ThemeToggle" }; export const Default = {};'
        : read(file),
    ),
  ).toThrow("Switch: proof story needs a play check");
  expect(() =>
    loadAdoptionCoverage({
      ...adoptionRelationships,
      Textarea: { status: "pending", destination: " " },
    }),
  ).toThrow("Textarea: describe pending adoption");
});
