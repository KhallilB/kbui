import { expect, test } from "bun:test";
import { resolve } from "node:path";
import { extractDocumentationExamples, loadDocumentationExamples } from "../catalog/documentation";

const example =
  'import { Button } from "@kb.ui/react";\nexport function App() { return <Button>Save</Button>; }\n';

test("extracts complete React modules from installation documentation", () => {
  const markdown = `# Usage\n\n\`\`\`tsx\n${example}\`\`\`\n`;
  expect(extractDocumentationExamples(markdown)).toEqual([example]);
});

test("leaves contextual fragments and other languages out of module checks", () => {
  expect(
    extractDocumentationExamples(
      "```tsx\n<Button onClick={save}>Save</Button>\n```\n```bash\nbun add package\n```",
    ),
  ).toEqual([]);
});

test("does not treat prose inside a comment as module declarations", () => {
  expect(
    extractDocumentationExamples(
      "```tsx\n// import and export function describe a module\n<Button>Save</Button>\n```",
    ),
  ).toEqual([]);
});

test("rejects broken syntax in a complete documented module", () => {
  expect(() =>
    extractDocumentationExamples(
      '```tsx\nimport { Button } from "@kb.ui/react";\nexport function App( {\n```',
    ),
  ).toThrow();
});

test("includes complete API and specialized-guide examples in compilation", () => {
  const examples = loadDocumentationExamples(resolve(import.meta.dir, "../../.."));
  for (const path of [
    "packages/react/README.md",
    "docs/guides/number-fields.md",
    "docs/guides/file-inputs.md",
    "docs/guides/forms-and-overlays.md",
  ])
    expect(
      examples.some((example) => example.id.includes(path.replaceAll(/[^a-z0-9]/gi, "-"))),
    ).toBe(true);
});
