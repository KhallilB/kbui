import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { Compiled } from "./compile";
import type { Dom } from "./rules";
import { type Capture, type ModelId, type Prompt, prompts, studyDir, WIDTHS } from "./study";

export type Measured = Dom & { boxes: Record<string, number[]>; height: number; errors: string[] };

export type Screen = {
  id: string;
  prompt: Prompt;
  model: ModelId;
  capture: Capture;
  compiled: Compiled;
  doms: Measured[];
};

const read = <T>(path: string): T => JSON.parse(readFileSync(path, "utf8"));

/** Every captured screen, in prompt order then model order. Throws when a step was skipped. */
export function loadScreens(study: string): Screen[] {
  const dir = studyDir(study);
  const ids = readdirSync(join(dir, "captures"))
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(/\.json$/, ""));
  const order = (id: string) => prompts.findIndex((p) => id.startsWith(`${p.id}.`));
  return ids
    .sort((a, b) => order(a) - order(b) || a.localeCompare(b))
    .map((id) => {
      const [promptId, model] = id.split(".") as [string, ModelId];
      const prompt = prompts.find((p) => p.id === promptId);
      if (!prompt) throw new Error(`capture ${id} has no prompt`);
      const specPath = join(dir, "specs", `${id}.json`);
      if (!existsSync(specPath)) throw new Error(`${id} is not measured; run measure first`);
      return {
        id,
        prompt,
        model,
        capture: read<Capture>(join(dir, "captures", `${id}.json`)),
        compiled: read<Compiled>(specPath),
        doms: WIDTHS.map((w) => read<Measured>(join(dir, "dom", `${id}.${w}.json`))),
      };
    });
}
