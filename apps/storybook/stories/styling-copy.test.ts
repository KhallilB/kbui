import { expect, test } from "bun:test";
import * as kbui from "@kb.ui/react";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { loadCatalogSources } from "../catalog/source";
import { completeStylingUsage, createStylingPatches } from "../catalog/styling-copy";
import { compileComponentExample } from "../site/component-code";
import { applyStylingPatches } from "../site/styling-copy";

const catalog = loadCatalogSources();

for (const name of ["Combobox", "MultiSelect", "Textarea", "Fieldset", "ErrorSummary"]) {
  test(`${name} styling copy retains its complete example and required inputs`, () => {
    const entry = catalog.find((entry) => entry.name === name);
    const original = entry?.stories.find((story) => story.id === entry.defaultStoryId)?.code;
    if (!original) throw new Error(`Missing canonical example: ${name}`);
    for (const classes of ["brand", "rounded-none border-blue-700"]) {
      const code = completeStylingUsage(name, original, classes);
      expect(code).toContain('from "@kb.ui/react"');
      expect(code).toContain("export default function Example");
      expect(code).toContain(classes);
      for (const required of name === "Combobox" || name === "MultiSelect"
        ? ["options", "onValueChange", "useState", "value"]
        : name === "Fieldset"
          ? ["legend", "Workspace profile", "Switch"]
          : name === "ErrorSummary"
            ? ["items", "#workspace-name"]
            : ["label", "Release notes"])
        expect(code, `${name}: ${required}`).toContain(required);
    }
  });
}

test("styling copy preserves compound providers and caller classes", () => {
  const source = `import { Dialog } from "@kb.ui/react";
export default function Example() {
  return <Dialog><Dialog.Trigger>Open</Dialog.Trigger>
    <Dialog.Content title="Review" className="caller">Keep content</Dialog.Content>
  </Dialog>;
}`;
  const code = completeStylingUsage("Dialog", source, "brand");
  expect(code).toContain("Dialog.Trigger");
  expect(code).toContain('title="Review"');
  expect(code).toContain("caller");
  expect(code).toContain("brand");
  expect(code).toContain("Keep content");
});

test("styling copy retains classes forwarded through props", () => {
  const source = `import { Button } from "@kb.ui/react";
const props = { className: "caller", type: "button" as const };
export default function Example() { return <Button {...props}>Save</Button>; }`;
  const code = completeStylingUsage("Button", source, "brand");
  const Example = compileComponentExample(code, { react: React, "@kb.ui/react": kbui });
  const html = renderToStaticMarkup(React.createElement(Example));
  expect(html).toMatch(/class="[^"]*\bcaller\b[^"]*"/);
  expect(html).toMatch(/class="[^"]*\bbrand\b[^"]*"/);
});

test("styling copy keeps the chosen theme and unrelated caller slots", () => {
  const source = `import { Input } from "@kb.ui/react";
const props = { label: "Email", classNames: { control: "caller-control", label: "caller-label" } };
export default function Example() {
  return <Input {...props} />;
}`;
  const Example = compileComponentExample(completeStylingUsage("Input", source, "brand"), {
    react: React,
    "@kb.ui/react": kbui,
  });
  const html = renderToStaticMarkup(React.createElement(Example));
  expect(html).toMatch(/class="[^"]*\bcaller-control brand\b[^"]*"/);
  expect(html).toMatch(/class="[^"]*\bcaller-label\b[^"]*"/);
  const button = catalog.find((entry) => entry.name === "Button")?.stories[0];
  if (!button) throw new Error("Missing Button example");
  const copied = applyStylingPatches(
    button.code,
    createStylingPatches("Button", button.code),
    "brand",
    "dark",
  );
  expect(copied).toContain('setAttribute("data-theme", "dark")');
});

test("styling copy names missing metadata and missing targets", () => {
  expect(() => completeStylingUsage("Unknown", "", "brand")).toThrow("Unknown");
  expect(() => completeStylingUsage("Combobox", "export default () => <div />;", "brand")).toThrow(
    "Combobox",
  );
});

test("compositions without the family never offer a fabricated styling copy", () => {
  const source = `export default function Example() {
    document.documentElement.setAttribute("data-theme", "light");
    return <div>Asset index</div>;
  }`;
  expect(createStylingPatches("Image", source, false)).toEqual([]);
});

test("every catalog family has complete CSS and Tailwind copied modules", () => {
  expect(catalog).toHaveLength(63);
  for (const entry of catalog) {
    const story = entry.stories.find((story) => story.id === entry.defaultStoryId);
    if (!story) throw new Error(`Missing canonical example: ${entry.name}`);
    expect(story.styling.length, entry.name).toBeGreaterThan(0);
    for (const classes of ["brand", "rounded-none border-blue-700"])
      expect(applyStylingPatches(story.code, story.styling, classes), entry.name).toContain(
        classes,
      );
  }
});
