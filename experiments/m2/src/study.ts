import { readFileSync } from "node:fs";
import { join } from "node:path";

export const root = join(import.meta.dir, "..");

export type Prompt = { id: string; category: "commerce" | "settings" | "dashboard"; text: string };
export const prompts: Prompt[] = JSON.parse(readFileSync(join(root, "prompts.json"), "utf8"));

export const MODELS = {
  "claude-sonnet-5-5": { cli: "claude", model: "claude-sonnet-5-5", effort: null },
  "gpt-6-1-sol": { cli: "codex", model: "gpt-6.1-sol", effort: "medium" },
} as const;
export type ModelId = keyof typeof MODELS;

export const WIDTHS = [390, 768, 1440] as const;

export type Capture = {
  promptId: string;
  model: ModelId;
  resolvedModel: string | null;
  cli: "claude" | "codex";
  systemPromptHash: string;
  started: string;
  totalMs: number;
  /** Output lines with ms since spawn; Codex lines share the completion time. */
  lines: { t: number; text: string }[];
  usage: unknown;
  streamedLines: boolean;
};

export function studyDir(study: string): string {
  return join(root, "results", study);
}
