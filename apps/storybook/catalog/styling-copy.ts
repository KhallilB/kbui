import { packages } from "@babel/standalone";
import {
  applyStylingPatches,
  type StylingPatch,
  stylingClassMarker,
  stylingThemeMarker,
} from "../site/styling-copy.ts";

// Copy targets name public composition points; preview anatomy stays independently owned.
const targets: Record<string, { member?: string; slot?: string }> = {
  Accordion: {},
  Avatar: {},
  Badge: {},
  Button: {},
  Callout: {},
  Card: {},
  Checkbox: { slot: "mark" },
  Code: {},
  CodeBlock: {},
  Collection: {},
  CollectionList: {},
  CollectionRow: {},
  Combobox: { slot: "shell" },
  ConfirmAction: { slot: "popup" },
  Container: {},
  CopyableText: {},
  Dashboard: {},
  DescriptionList: {},
  Dialog: { member: "Content" },
  Disclosure: {},
  EmptyState: {},
  ErrorSummary: {},
  Fieldset: {},
  FileInput: { slot: "trigger" },
  Form: {},
  FormActions: {},
  FormSection: {},
  Gallery: {},
  Grid: {},
  Heading: {},
  Image: {},
  Inline: {},
  Input: { slot: "control" },
  Link: {},
  Menu: { member: "Content" },
  MultiSelect: { slot: "shell" },
  NumberField: { slot: "group" },
  PageHeader: {},
  Panel: {},
  Popover: { member: "Content" },
  Progress: { slot: "indicator" },
  RadioGroup: { member: "Item", slot: "control" },
  ScrollArea: { slot: "thumb" },
  Select: { slot: "control" },
  Separator: {},
  Settings: {},
  Skeleton: {},
  Spinner: {},
  Split: {},
  Stack: {},
  Stat: { slot: "value" },
  StatsRow: {},
  Status: {},
  SupportingPane: {},
  Switch: { slot: "track" },
  Table: {},
  Tabs: {},
  Text: {},
  Textarea: { slot: "control" },
  Thumbnail: {},
  Toast: {},
  Toolbar: {},
  Tooltip: {},
};

export function createStylingPatches(
  name: string,
  source: string,
  required = true,
): StylingPatch[] {
  const classes = stylingClassMarker;
  if (source.includes(stylingClassMarker) || source.includes(stylingThemeMarker))
    throw new Error(`Reserved styling-copy marker: ${name}`);
  const target = Object.hasOwn(targets, name) ? targets[name] : undefined;
  if (!target) throw new Error(`Missing styling-copy metadata: ${name}`);
  const ast = packages.parser.parse(source, {
    sourceType: "module",
    plugins: ["typescript", "jsx"],
  });
  const t = packages.types;
  const aliases = new Set<string>();
  for (const statement of ast.program.body) {
    if (statement.type !== "ImportDeclaration" || statement.source.value !== "@kb.ui/react")
      continue;
    for (const specifier of statement.specifiers)
      if (
        specifier.type === "ImportSpecifier" &&
        specifier.imported.type === "Identifier" &&
        specifier.imported.name === name
      )
        aliases.add(specifier.local.name);
  }
  let matches = 0;
  const openings: ReturnType<typeof t.jsxOpeningElement>[] = [];
  const toastViewports: Parameters<typeof t.jsxOpeningElement>[0][] = [];
  const addClasses = (opening: ReturnType<typeof t.jsxOpeningElement>) => {
    openings.push(opening);
    const property = target.slot ? "classNames" : "className";
    const merge = (existing: string) =>
      target.slot
        ? `((current: Record<string, string | undefined> | undefined) => ({ ...current, ${target.slot}: [current?.${target.slot}, ${JSON.stringify(classes)}].filter(Boolean).join(" ") }))(${existing})`
        : `[${existing}, ${JSON.stringify(classes)}].filter(Boolean).join(" ")`;
    const parse = (expression: string) =>
      packages.parser.parseExpression(expression, {
        plugins: ["typescript", "jsx"],
      });
    let explicit = false;
    opening.attributes = opening.attributes.map((attribute) => {
      if (attribute.type === "JSXSpreadAttribute") {
        const original = packages.generator.default(attribute.argument).code;
        const type = target.slot ? "Record<string, string | undefined>" : "string";
        const existing = `(current as { ${property}?: ${type} }).${property}`;
        // Capture spreads once; preserve property order and caller getter behavior.
        return t.jsxSpreadAttribute(
          parse(`(<StyleProps,>(props: StyleProps) => {
          const current = { ...props };
          return { ...current, ...(Object.hasOwn(current as object, ${JSON.stringify(property)})
            ? { ${property}: ${merge(existing)} } : {}) };
        })(${original})`),
        );
      }
      if (attribute.name.name !== property) return attribute;
      explicit = true;
      const value = attribute.value;
      const expression = value?.type === "JSXExpressionContainer" ? value.expression : value;
      if (expression?.type === "JSXEmptyExpression")
        throw new Error(`Empty styling-copy class: ${name}`);
      const existing = expression ? packages.generator.default(expression).code : "undefined";
      return t.jsxAttribute(
        t.jsxIdentifier(property),
        t.jsxExpressionContainer(parse(merge(existing))),
      );
    });
    if (!explicit) {
      const initial = target.slot
        ? `{ ${target.slot}: ${JSON.stringify(classes)} }`
        : JSON.stringify(classes);
      opening.attributes.unshift(
        t.jsxAttribute(t.jsxIdentifier(property), t.jsxExpressionContainer(parse(initial))),
      );
    }
    matches++;
  };
  packages.traverse.default(ast, {
    JSXOpeningElement(path) {
      const tag = path.node.name;
      const root = tag.type === "JSXMemberExpression" ? tag.object : tag;
      if (root.type !== "JSXIdentifier" || !aliases.has(root.name)) return;
      const binding = path.scope.getBinding(root.name);
      if (!binding?.path.isImportSpecifier()) return;
      if (
        name === "Toast" &&
        tag.type === "JSXMemberExpression" &&
        tag.property.name === "Viewport"
      ) {
        toastViewports.push(tag);
        return;
      }
      if (
        target.member
          ? tag.type === "JSXMemberExpression" && tag.property.name === target.member
          : tag.type === "JSXIdentifier"
      )
        addClasses(path.node);
    },
  });
  if (!matches && name === "Toast") {
    packages.traverse.default(ast, {
      JSXOpeningElement(path) {
        if (!toastViewports.includes(path.node.name)) return;
        if (
          path.node.attributes.some(
            (attribute) =>
              attribute.type === "JSXAttribute" && attribute.name.name === "renderToast",
          )
        )
          throw new Error("Toast styling copy requires a visible Toast in its custom renderer");
        const tag = path.node.name;
        if (tag.type !== "JSXMemberExpression" || tag.object.type !== "JSXIdentifier") return;
        const parsed = packages.parser.parseExpression(
          `(toast) => <${tag.object.name} toast={toast} className={${JSON.stringify(classes)}} />`,
          { plugins: ["jsx"] },
        );
        path.node.attributes.push(
          t.jsxAttribute(t.jsxIdentifier("renderToast"), t.jsxExpressionContainer(parsed)),
        );
        openings.push(path.node);
        matches++;
      },
    });
  }
  if (!matches && required) throw new Error(`Missing styling-copy target: ${name}`);
  if (!matches) return [];
  const patches: StylingPatch[] = openings
    .filter(
      (opening) =>
        !openings.some(
          (parent) =>
            parent !== opening &&
            (parent.start ?? 0) <= (opening.start ?? 0) &&
            (parent.end ?? 0) >= (opening.end ?? 0),
        ),
    )
    .map((opening) => {
      if (opening.start == null || opening.end == null)
        throw new Error(`Missing styling-copy location: ${name}`);
      return {
        start: opening.start,
        end: opening.end,
        text: packages.generator.default(opening).code,
      };
    });
  packages.traverse.default(ast, {
    CallExpression(path) {
      const { callee, arguments: args } = path.node;
      const value = args[1];
      if (
        callee.type !== "MemberExpression" ||
        callee.property.type !== "Identifier" ||
        callee.property.name !== "setAttribute" ||
        args[0]?.type !== "StringLiteral" ||
        args[0].value !== "data-theme" ||
        value?.type !== "StringLiteral" ||
        (value.value !== "light" && value.value !== "dark") ||
        value.start == null ||
        value.end == null
      )
        return;
      patches.push({
        start: value.start,
        end: value.end,
        text: JSON.stringify(stylingThemeMarker),
        theme: value.value,
      });
    },
  });
  return patches;
}

export function completeStylingUsage(name: string, source: string, classes: string): string {
  return applyStylingPatches(source, createStylingPatches(name, source), classes);
}
