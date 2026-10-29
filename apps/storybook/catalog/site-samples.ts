import { readFileSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { babelParseFile, extractSource, loadCsf } from "storybook/internal/csf-tools";
import { releaseSampleKey, releaseSteps } from "../site/example-model.ts";
import { playgroundKey, sizes, variants } from "../site/playground-model.ts";
import { exampleCode } from "./code.ts";
import { highlightSample } from "./highlight.ts";
import type { CodeSample } from "./types";

const site = (name: string) => fileURLToPath(new URL(`../site/${name}`, import.meta.url));
export const siteSampleFiles = [
  "Examples.tsx",
  "example-model.ts",
  "Brand.tsx",
  "LinkArrow.tsx",
  "examples.css",
  "palette.css",
  "logo.svg",
  "playground-model.ts",
].map(site);

function fromRender(
  render: string,
  helpers = "",
  component = "Card",
  theme: "light" | "dark" = "light",
): CodeSample {
  const source = `import { Badge, Button, Card, Checkbox, Code, Grid, Heading, Link, Progress, Stat, Status, Text } from "./components.tsx";
import { useState } from "react";
${helpers}
const meta = { title: "Example", component: ${component}, globals: { theme: "${theme}" } };
export default meta;
export const Selected = { render: ${render} };`;
  return highlightSample(
    exampleCode(loadCsf(source, { makeTitle: (title) => title }).parse(), "Selected", component),
  );
}

let cachedSiteSamples:
  | {
      signature: string;
      value: {
        playground: Record<string, CodeSample>;
        surfaces: Record<string, CodeSample>;
      };
    }
  | undefined;

export function loadSiteSamples(): {
  playground: Record<string, CodeSample>;
  surfaces: Record<string, CodeSample>;
} {
  const signature = siteSampleFiles.map((path) => `${path}:${statSync(path).mtimeMs}`).join("|");
  if (cachedSiteSamples && cachedSiteSamples.signature === signature) {
    return cachedSiteSamples.value;
  }
  const playground: Record<string, CodeSample> = {};
  for (const variant of variants)
    for (const size of sizes)
      for (const theme of ["light", "dark"] as const)
        for (const disabled of [false, true])
          for (const reduced of [false, true]) {
            const state = { variant, size, theme, disabled, reduced };
            const style = reduced ? ' style={{ transition: "none", animation: "none" }}' : "";
            const render = `() => (<Button variant="${variant}" size="${size}"${disabled ? " disabled" : ""}${style}>Save changes</Button>)`;
            playground[playgroundKey(state)] = fromRender(render, "", "Button", theme);
          }

  const ast = babelParseFile({ code: readFileSync(site("Examples.tsx"), "utf8") });
  const view = ast.path.scope.bindings.CompositionView?.path.node;
  if (view?.type !== "FunctionDeclaration" || !view.body)
    throw new Error("Missing composition source");
  const returns = view.body.body.flatMap((statement) => {
    const result = statement.type === "IfStatement" ? statement.consequent : statement;
    return result.type === "ReturnStatement" && result.argument ? [result.argument] : [];
  });
  if (returns.length !== 3) throw new Error("Expected three canonical composition branches");
  const completed = view.body.body.find(
    (statement) =>
      statement.type === "VariableDeclaration" &&
      statement.declarations.some(
        (declaration) =>
          declaration.id.type === "Identifier" && declaration.id.name === "completed",
      ),
  );
  if (!completed) throw new Error("Missing checklist derivation");
  const arrow = babelParseFile({ code: readFileSync(site("LinkArrow.tsx"), "utf8") });
  const arrowDeclaration = arrow.path.scope.bindings.LinkArrow?.path.node;
  const arrowReturn =
    arrowDeclaration?.type === "FunctionDeclaration"
      ? arrowDeclaration.body.body.find((statement) => statement.type === "ReturnStatement")
      : undefined;
  if (arrowReturn?.type !== "ReturnStatement" || !arrowReturn.argument)
    throw new Error("Missing link arrow SVG");
  const arrowSvg = arrowReturn.argument;
  const brand = babelParseFile({ code: readFileSync(site("Brand.tsx"), "utf8") });
  const geometry = brand.path.scope.bindings.Geometry?.path.node;
  if (!geometry) throw new Error("Missing geometry source");
  const geometryFile = babelParseFile({ code: extractSource(geometry) });
  const logoFile = babelParseFile({
    code: readFileSync(site("logo.svg"), "utf8")
      .replace(/stroke-width=/g, "strokeWidth=")
      .replace(/stroke-linecap=/g, "strokeLinecap=")
      .replace(/stroke-linejoin=/g, "strokeLinejoin="),
  });
  const logoExpression = logoFile.ast.program.body[0];
  if (
    logoExpression?.type !== "ExpressionStatement" ||
    logoExpression.expression.type !== "JSXElement"
  )
    throw new Error("Invalid brand SVG");
  const logo = logoExpression.expression;
  geometryFile.path.traverse({
    ReferencedIdentifier(path) {
      if (path.node.name === "alternate") path.node.name = "palette";
    },
    JSXElement(path) {
      if (
        path.node.openingElement.name.type !== "JSXIdentifier" ||
        path.node.openingElement.name.name !== "image"
      )
        return;
      logo.openingElement.attributes.push(
        ...path.node.openingElement.attributes.filter(
          (attribute) =>
            attribute.type !== "JSXAttribute" ||
            attribute.name.type !== "JSXIdentifier" ||
            attribute.name.name !== "href",
        ),
      );
      path.replaceWith(logo);
    },
  });
  const geometryDeclaration = geometryFile.ast.program.body[0];
  const geometryReturn =
    geometryDeclaration?.type === "FunctionDeclaration"
      ? geometryDeclaration.body.body.find((statement) => statement.type === "ReturnStatement")
      : undefined;
  if (geometryReturn?.type !== "ReturnStatement" || !geometryReturn.argument)
    throw new Error("Missing geometry JSX");
  const geometrySvg = geometryReturn.argument;
  const css = `${readFileSync(site("palette.css"), "utf8")}\n${readFileSync(site("examples.css"), "utf8")}`;
  const surfaces: Record<string, CodeSample> = {};
  for (const [index, surface] of ["editorial", "operations", "creative"].entries()) {
    const node = returns[index];
    if (!node) throw new Error(`Missing ${surface} composition`);
    const bodySource = extractSource(node)
      .replaceAll("level={headingLevel}", "level={3}")
      .replace(/docs\("(\w+)", storybookRoot\)/g, (_, component: string) =>
        JSON.stringify(
          `https://kbui.kcb.pro/storybook/?path=/docs/components-${component.toLowerCase()}--docs`,
        ),
      );
    const bodyFile = babelParseFile({ code: bodySource });
    bodyFile.path.traverse({
      JSXElement(path) {
        if (
          path.node.openingElement.name.type === "JSXIdentifier" &&
          path.node.openingElement.name.name === "Geometry"
        )
          path.replaceWith(geometrySvg);
        else if (
          path.node.openingElement.name.type === "JSXIdentifier" &&
          path.node.openingElement.name.name === "LinkArrow"
        )
          path.replaceWith(arrowSvg);
      },
    });
    const bodyExpression = bodyFile.ast.program.body[0];
    if (bodyExpression?.type !== "ExpressionStatement") throw new Error("Missing composition JSX");
    const body = extractSource(bodyExpression.expression);
    const usageFile = babelParseFile({ code: bodySource });
    usageFile.path.traverse({
      JSXElement(path) {
        if (
          path.node.openingElement.name.type === "JSXIdentifier" &&
          ["Geometry", "LinkArrow"].includes(path.node.openingElement.name.name)
        )
          path.remove();
      },
      JSXAttribute(path) {
        if (path.node.name.type === "JSXIdentifier" && path.node.name.name === "className")
          path.remove();
      },
    });
    const usageExpression = usageFile.ast.program.body[0];
    if (usageExpression?.type !== "ExpressionStatement") throw new Error("Missing component usage");
    const componentUsage = extractSource(usageExpression.expression);
    const states =
      surface === "operations" ? 2 ** releaseSteps.length : surface === "creative" ? 2 : 1;
    for (let state = 0; state < states; state++) {
      const checks = releaseSteps.map((_, index) => Boolean(state & (1 << index)));
      const setup =
        surface === "creative"
          ? `const [palette, setPalette] = useState(${state === 1});`
          : surface === "operations"
            ? `const [checks, setChecks] = useState(${JSON.stringify(checks)}); ${extractSource(completed)}`
            : "";
      const helpers =
        surface === "operations" ? `const releaseSteps = ${JSON.stringify(releaseSteps)};` : "";
      const render = (jsx: string) => `() => { ${setup} return (${jsx}); }`;
      const sample = fromRender(render(body), helpers);
      sample.snippet = fromRender(render(componentUsage), helpers).snippet;
      // Layout stays site-owned; complete setup includes its actual stylesheet.
      sample.code = sample.code
        .replace(
          "  return (\n    <div style=",
          `  return (\n    <>\n    <style>{${JSON.stringify(css)}}</style>\n    <div className="kbui-site" style=`,
        )
        .replace("    </div>\n  );", "    </div>\n    </>\n  );");
      const key =
        surface === "creative"
          ? `${surface}-${state === 1}`
          : surface === "operations"
            ? releaseSampleKey(checks)
            : surface;
      surfaces[key] = highlightSample(sample);
    }
  }
  const value = { playground, surfaces };
  cachedSiteSamples = { signature, value };
  return value;
}
