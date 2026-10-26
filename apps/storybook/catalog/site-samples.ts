import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { babelParseFile, extractSource, loadCsf } from "storybook/internal/csf-tools";
import { playgroundKey, sizes, variants } from "../site/playground-model.ts";
import { exampleCode } from "./code.ts";
import { highlightSample } from "./highlight.ts";
import type { CodeSample } from "./types";

const site = (name: string) => fileURLToPath(new URL(`../site/${name}`, import.meta.url));
export const siteSampleFiles = [
  "Examples.tsx",
  "Brand.tsx",
  "LinkArrow.tsx",
  "examples.css",
  "logo.svg",
  "playground-model.ts",
].map(site);

function fromRender(
  render: string,
  helpers = "",
  component = "Card",
  theme: "light" | "dark" = "light",
): CodeSample {
  const source = `import { Badge, Button, Card, Progress, Stat, Status } from "./components.tsx";
import { useState } from "react";
${helpers}
const meta = { title: "Example", component: ${component}, globals: { theme: "${theme}" } };
export default meta;
export const Selected = { render: ${render} };`;
  return highlightSample(
    exampleCode(loadCsf(source, { makeTitle: (title) => title }).parse(), "Selected", component),
  );
}

export function loadSiteSamples(): {
  playground: Record<string, CodeSample>;
  surfaces: Record<string, CodeSample>;
} {
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
  const css = readFileSync(site("examples.css"), "utf8");
  const surfaces: Record<string, CodeSample> = {};
  for (const [index, surface] of ["editorial", "operations", "creative"].entries()) {
    const node = returns[index];
    if (!node) throw new Error(`Missing ${surface} composition`);
    const bodySource = extractSource(node)
      .replace(/<(\/?)Heading\b/g, "<$1h3")
      .replace(/docs\("(\w+)", storybookRoot\)/g, (_, component: string) =>
        JSON.stringify(`./storybook/?path=/docs/components-${component.toLowerCase()}--docs`),
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
    for (const palette of surface === "creative" ? [false, true] : [false]) {
      const render =
        surface === "creative"
          ? `() => { const [palette, setPalette] = useState(${palette}); return (${body}); }`
          : `() => (${body})`;
      const sample = fromRender(render);
      const usageRender =
        surface === "creative"
          ? `() => { const [palette, setPalette] = useState(${palette}); return (${componentUsage}); }`
          : `() => (${componentUsage})`;
      sample.snippet = fromRender(usageRender).snippet;
      // Layout stays site-owned; complete setup includes its actual stylesheet.
      sample.code = sample.code
        .replace(
          "  return (\n    <div style=",
          `  return (\n    <>\n    <style>{${JSON.stringify(css)}}</style>\n    <div className="kbui-site" style=`,
        )
        .replace(
          "padding: 16, background:",
          '"--ink": "#303b31", "--rust": "#b4462b", "--muted": "#656a5b", fontFamily: "Helvetica Neue, sans-serif", lineHeight: 1.7, padding: 16, background:',
        )
        .replace(
          'color: "var(--kb-color-fg)" }}>',
          'color: "var(--kb-color-fg)" } as CSSProperties}>',
        )
        .replace(
          "import { useEffect, type ComponentProps",
          "import { useEffect, type CSSProperties, type ComponentProps",
        )
        .replace("    </div>\n  );", "    </div>\n    </>\n  );");
      surfaces[surface === "creative" ? `${surface}-${palette}` : surface] =
        highlightSample(sample);
    }
  }
  return { playground, surfaces };
}
