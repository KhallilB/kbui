import { statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { loadCsf } from "storybook/internal/csf-tools";
import { playgroundKey, sizes, variants } from "../site/playground-model.ts";
import { exampleCode } from "./code.ts";
import { highlightSample } from "./highlight.ts";
import type { CodeSample } from "./types";

const site = (name: string) => fileURLToPath(new URL(`../site/${name}`, import.meta.url));
export const siteSampleFiles = ["playground-model.ts"].map(site);

function fromRender(render: string, theme: "light" | "dark"): CodeSample {
  const source = `import { Button } from "./components.tsx";
const meta = { title: "Example", component: Button, globals: { theme: "${theme}" } };
export default meta;
export const Selected = { render: ${render} };`;
  return highlightSample(
    exampleCode(loadCsf(source, { makeTitle: (title) => title }).parse(), "Selected", "Button"),
  );
}

let cachedSiteSamples:
  | {
      signature: string;
      value: { playground: Record<string, CodeSample> };
    }
  | undefined;

export function loadSiteSamples(): { playground: Record<string, CodeSample> } {
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
            playground[playgroundKey(state)] = fromRender(render, theme);
          }

  const value = { playground };
  cachedSiteSamples = { signature, value };
  return value;
}
