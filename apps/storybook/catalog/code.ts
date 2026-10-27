import {
  babelParseFile,
  type CsfFile,
  createStoryArgsResolver,
  extractSource,
  pathForNode,
} from "storybook/internal/csf-tools";
import { stylesheetImport } from "../site/setup-model.ts";

type Node = Parameters<typeof extractSource>[0];

export function exampleCode(
  csf: CsfFile,
  localName: string,
  component: string,
): { code: string; snippet: string } {
  const resolver = createStoryArgsResolver(csf);
  const resolved = resolver.resolve(localName);
  if (resolved.storyMembers.unresolved.length || resolved.metaMembers.unresolved.length)
    throw new Error(`Unresolved Storybook configuration: ${component}/${localName}`);
  const program = resolver.ctx.program;
  const imports = new Set<string>();
  const helpers = new Map<number, string>();
  const visited = new Set<string>();
  const read = (node: Node) => {
    const path = pathForNode(program, node);
    if (!path) throw new Error(`Missing source context: ${component}/${localName}`);
    if (node.type === "Identifier") include(node.name);
    path.traverse({
      ReferencedIdentifier(reference) {
        include(reference.node.name);
      },
      TSTypeReference(reference) {
        if (reference.node.typeName.type === "Identifier") include(reference.node.typeName.name);
      },
    });
  };
  const include = (name: string) => {
    if (visited.has(name)) return;
    visited.add(name);
    const binding = program.scope.bindings[name];
    if (!binding) return;
    const declaration = binding.path;
    const parent = declaration.parentPath;
    if (parent?.isImportDeclaration()) {
      const source = parent.node.source.value;
      if (source.startsWith(".")) {
        if (!declaration.isImportSpecifier())
          throw new Error(`Unsupported component import: ${name}`);
        imports.add(extractSource(declaration.node));
      } else {
        if (source.includes("storybook")) throw new Error(`Example depends on Storybook: ${name}`);
        helpers.set(parent.node.start ?? 0, extractSource(parent.node));
      }
      return;
    }
    const statement = declaration.getStatementParent();
    if (!statement || statement.isExportNamedDeclaration())
      throw new Error(`Example depends on another story: ${name}`);
    helpers.set(statement.node.start ?? 0, extractSource(statement.node));
    read(statement.node);
  };
  include(component);
  const render = resolved.storyMembers.properties.render ?? resolved.metaMembers.properties.render;
  if (render) read(render);
  for (const value of Object.values(resolved.args)) read(value);
  const globals =
    resolved.storyMembers.properties.globals ?? resolved.metaMembers.properties.globals;
  const theme =
    globals && /\btheme:\s*["']dark["']/.test(extractSource(globals)) ? "dark" : "light";
  const args = Object.entries(resolved.args)
    .map(([key, value]) => `  ${JSON.stringify(key)}: ${extractSource(value)},`)
    .join("\n");
  const setup = [...helpers.entries()]
    .sort(([a], [b]) => a - b)
    .map(([, code]) => code)
    .join("\n\n");
  const escapeJsx = (text: string) =>
    text
      .replaceAll("&", "&amp;")
      .replaceAll('"', "&quot;")
      .replaceAll("<", "&lt;")
      .replaceAll("{", "&#123;")
      .replaceAll("}", "&#125;");
  const attribute = (key: string, value: Node) =>
    value.type === "StringLiteral"
      ? `${key}="${escapeJsx(value.value)}"`
      : value.type === "BooleanLiteral" && value.value
        ? key
        : `${key}={${extractSource(value)}}`;
  const attributes = Object.entries(resolved.args).map(([key, value]) => attribute(key, value));
  let usage: string;
  let rendersFunction = false;
  if (
    render &&
    (render.type === "ArrowFunctionExpression" || render.type === "FunctionExpression")
  ) {
    const file = babelParseFile({ code: `const usage = (${extractSource(render)});` });
    const first = render.params[0];
    const parameter = first?.type === "Identifier" ? first.name : undefined;
    const attributesFile = babelParseFile({ code: `<${component} ${attributes.join(" ")} />` });
    const expression = attributesFile.ast.program.body[0];
    if (expression?.type !== "ExpressionStatement" || expression.expression.type !== "JSXElement")
      throw new Error(`Invalid snippet attributes: ${component}/${localName}`);
    const props = expression.expression.openingElement.attributes;
    file.path.traverse({
      JSXSpreadAttribute(path) {
        if (path.node.argument.type !== "Identifier" || path.node.argument.name !== parameter)
          return;
        const opening = path.parentPath.node;
        const element = path.parentPath.parentPath?.node;
        if (opening.type !== "JSXOpeningElement") return;
        const index = opening.attributes.indexOf(path.node);
        const later = new Set(
          opening.attributes
            .slice(index + 1)
            .flatMap((attribute) =>
              attribute.type === "JSXAttribute" && attribute.name.type === "JSXIdentifier"
                ? [attribute.name.name]
                : [],
            ),
        );
        const hasChildren =
          element?.type === "JSXElement" &&
          element.children.some((child) =>
            child.type === "JSXText"
              ? child.value.trim().length > 0
              : child.type !== "JSXExpressionContainer" ||
                child.expression.type !== "JSXEmptyExpression",
          );
        const effective = props.filter(
          (attribute) =>
            attribute.type !== "JSXAttribute" ||
            attribute.name.type !== "JSXIdentifier" ||
            (!later.has(attribute.name.name) &&
              !(attribute.name.name === "children" && hasChildren)),
        );
        const supplied = new Set(
          effective.flatMap((attribute) =>
            attribute.type === "JSXAttribute" && attribute.name.type === "JSXIdentifier"
              ? [attribute.name.name]
              : [],
          ),
        );
        opening.attributes = [
          ...opening.attributes
            .slice(0, index)
            .filter(
              (attribute) =>
                attribute.type !== "JSXAttribute" ||
                attribute.name.type !== "JSXIdentifier" ||
                !supplied.has(attribute.name.name),
            ),
          ...effective,
          ...opening.attributes.slice(index + 1),
        ];
      },
    });
    const declaration = file.ast.program.body[0];
    const fn =
      declaration?.type === "VariableDeclaration" ? declaration.declarations[0]?.init : undefined;
    if (!fn || (fn.type !== "ArrowFunctionExpression" && fn.type !== "FunctionExpression"))
      throw new Error(`Unsupported snippet render: ${component}/${localName}`);
    rendersFunction = fn.body.type === "BlockStatement";
    usage =
      fn.body.type === "BlockStatement"
        ? `function Example() ${extractSource(fn.body)}`
        : extractSource(fn.body);
  } else {
    const children = resolved.args.children;
    const props = Object.entries(resolved.args)
      .filter(([key]) => key !== "children")
      .map(([key, value]) => attribute(key, value))
      .join(" ");
    const tag = `${component}${props ? ` ${props}` : ""}`;
    const child =
      children?.type === "StringLiteral"
        ? escapeJsx(children.value)
        : children
          ? `{${extractSource(children)}}`
          : "";
    usage = children ? `<${tag}>${child}</${component}>` : `<${tag} />`;
  }
  const publicImport = `import { ${[...imports].sort().join(", ")} } from "@kbui/react";`;
  const themedUsage =
    theme === "dark"
      ? rendersFunction
        ? `${usage}\n\n<div data-theme="dark"><Example /></div>`
        : `<div data-theme="dark">\n${usage}\n</div>`
      : usage;
  const snippet = `${publicImport}\n${setup ? `${setup}\n` : ""}\n${themedUsage}`;
  const code = `import "${stylesheetImport()}";
import { ${[...imports].sort().join(", ")} } from "@kbui/react";
import { useEffect, type ComponentProps${render ? ", type ReactNode" : ""} } from "react";

${setup ? `${setup}\n\n` : ""}const args = {
${args}
} satisfies ${render ? "Partial<" : ""}ComponentProps<typeof ${component}>${render ? ">" : ""};
${render ? `\nconst renderExample: (props: typeof args) => ReactNode = ${extractSource(render)};\n` : ""}
export default function Example() {
  useEffect(() => {
    const root = document.documentElement;
    const previous = root.getAttribute("data-theme");
    root.setAttribute("data-theme", "${theme}");
    return () => {
      if (previous === null) root.removeAttribute("data-theme");
      else root.setAttribute("data-theme", previous);
    };
  }, []);

  return (
    <div style={{ padding: 16, background: "var(--kb-color-bg)", color: "var(--kb-color-fg)" }}>
      ${render ? "{renderExample(args)}" : `<${component} {...args} />`}
    </div>
  );
}
`;
  return { code, snippet };
}
