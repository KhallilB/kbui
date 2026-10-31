import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { babelParseFile, loadCsf } from "storybook/internal/csf-tools";
import * as publicApi from "../../../packages/react/src/index";
import { type AdoptionRelationship, adoptionRelationships } from "./adoption";
import { loadCatalogSources } from "./source";

const root = fileURLToPath(new URL("../../../", import.meta.url));
const read = (file: string) => readFileSync(resolve(root, file), "utf8");
const publicFamilies = Object.keys(publicApi).filter((name) => /^[A-Z]/.test(name));

function rendersPublicComponent(code: string, family: string): boolean {
  const ast = babelParseFile({ code });
  let rendered = false;
  ast.path.traverse({
    JSXOpeningElement(path) {
      let name = path.node.name;
      while (name.type === "JSXMemberExpression") name = name.object;
      if (name.type !== "JSXIdentifier") return;
      const binding = path.scope.getBinding(name.name)?.path;
      if (!binding?.isImportSpecifier()) return;
      const declaration = binding.parentPath;
      const imported = binding.node.imported;
      if (
        declaration?.isImportDeclaration() &&
        declaration.node.source.value === "@kb.ui/react" &&
        declaration.node.importKind !== "type" &&
        binding.node.importKind !== "type" &&
        (imported.type === "Identifier" ? imported.name : imported.value) === family
      )
        rendered = true;
    },
  });
  return rendered;
}

export function loadAdoptionCoverage(
  relationships: Record<string, AdoptionRelationship> = adoptionRelationships,
  families: string[] = publicFamilies,
  readSource: (file: string) => string = read,
) {
  for (const family of families)
    if (!Object.hasOwn(relationships, family))
      throw new Error(`Missing adoption relationship: ${family}`);
  for (const family of Object.keys(relationships))
    if (!families.includes(family)) throw new Error(`Unknown adoption family: ${family}`);
  const catalog = loadCatalogSources();
  return [...families].sort().map((family) => {
    const entry = catalog.find((entry) => entry.name === family);
    if (!entry) throw new Error(`Missing adoption catalog entry: ${family}`);
    const examples = entry.examples;
    if (!examples?.some((example) => example.id === entry.defaultStoryId))
      throw new Error(`${family}: missing curated default for adoption`);
    const reference = `packages/react/docs/components/${family}.md`;
    readSource(reference);
    const canonical = {
      kind: "component" as const,
      family,
      reference,
      defaultStoryId: entry.defaultStoryId,
      docsId: entry.docsId,
      examples,
    };
    const relationship = relationships[family];
    if (!relationship) throw new Error(`Missing adoption relationship: ${family}`);
    if (relationship.status === "pending") {
      if (!relationship.destination.trim()) throw new Error(`${family}: describe pending adoption`);
      return { ...canonical, ...relationship };
    }
    const source = (() => {
      try {
        return readSource(relationship.source);
      } catch {
        throw new Error(`${family}: missing composition source ${relationship.source}`);
      }
    })();
    if (!rendersPublicComponent(source, family))
      throw new Error(`${family}: composition must render its public component`);
    if (!relationship.purpose.trim()) throw new Error(`${family}: describe composed use`);
    let proofSource: string;
    try {
      proofSource = readSource(relationship.proof.file);
    } catch {
      throw new Error(`${family}: missing proof source ${relationship.proof.file}`);
    }
    const csf = loadCsf(proofSource, {
      fileName: relationship.proof.file,
      makeTitle: (title) => title,
    }).parse();
    const story = csf._stories[relationship.proof.exportName];
    if (!story) throw new Error(`${family}: missing proof story ${relationship.proof.exportName}`);
    if (!story.__stats?.play) throw new Error(`${family}: proof story needs a play check`);
    const importsComposition = babelParseFile({ code: proofSource }).ast.program.body.some(
      (node) => {
        if (node.type !== "ImportDeclaration" || node.importKind === "type") return false;
        const imported = resolve(root, dirname(relationship.proof.file), node.source.value);
        return [imported, `${imported}.tsx`, `${imported}.ts`].includes(
          resolve(root, relationship.source),
        );
      },
    );
    if (relationship.proof.file !== relationship.source && !importsComposition)
      throw new Error(`${family}: proof must import its composition source`);
    return {
      ...canonical,
      ...relationship,
      proof: { ...relationship.proof, id: story.id },
    };
  });
}
