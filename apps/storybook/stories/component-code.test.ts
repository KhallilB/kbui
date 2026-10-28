import { expect, test } from "bun:test";
import * as components from "@kb.ui/react";
import { Badge } from "@kb.ui/react";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { loadCatalogSources } from "../catalog/source";
import { compileComponentExample } from "../site/component-code";

const modules = { react: React, "@kb.ui/react": { Badge } };
test("component code renders edited JSX content, props and expressions", () => {
  const Example = compileComponentExample(
    'import { Badge } from "@kb.ui/react"; const label: string = "Ready"; <Badge tone="success">{label}</Badge>',
    modules,
  );
  const markup = renderToStaticMarkup(React.createElement(Example));
  expect(markup).toContain("Ready");
  expect(markup).toContain('data-tone="success"');
});

test("function examples support hooks and default exports", () => {
  for (const source of [
    'import { useState } from "react"; function Example() { const [value] = useState("Draft"); return <span>{value}</span>; }',
    "export default function Demo() { return <>Default export</>; }",
  ]) {
    const Example = compileComponentExample(source, modules);
    expect(renderToStaticMarkup(React.createElement(Example))).toMatch(/Draft|Default export/);
  }
});

test("invalid syntax, missing render and unsupported imports give errors", () => {
  for (const source of [
    '<Badge tone="',
    'const label = "No render";',
    'import x from "remote"; <x />',
  ])
    expect(() => compileComponentExample(source, modules)).toThrow();
});

test("every provided catalog snippet compiles in the editable preview", () => {
  for (const entry of loadCatalogSources()) {
    for (const story of entry.stories) {
      try {
        expect(
          typeof compileComponentExample(story.snippet, {
            react: React,
            "@kb.ui/react": components,
          }),
        ).toBe("function");
      } catch (cause) {
        throw new Error(`${story.id}: ${String(cause)}`);
      }
    }
  }
});
