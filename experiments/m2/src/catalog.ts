import { buildUserPrompt, defineCatalog } from "@json-render/core";
import { schema } from "@json-render/react/schema";
import { shadcnComponentDefinitions } from "@json-render/shadcn/catalog";

// Full shadcn catalog, untouched: the baseline is json-render as shipped.
export const catalog = defineCatalog(schema, {
  components: shadcnComponentDefinitions,
  actions: {},
});

export const systemPrompt = catalog.prompt();

export function userPrompt(text: string): string {
  return buildUserPrompt({ prompt: text });
}
