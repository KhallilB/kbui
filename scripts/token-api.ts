import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import type { Token, TokenTree } from "../packages/tokens/src/build";

export type TokenInventoryEntry = {
  id: string;
  varName: string;
  type: string;
  light: string;
  dark: string | null;
  forced: string | null;
};

export type TokenApiDiff = {
  added: string[];
  removed: string[];
  renamed: Array<{ from: string; to: string; type: string }>;
  typeChanged: Array<{ varName: string; fromType: string; toType: string }>;
  defaultChanged: Array<{
    varName: string;
    changedModes: Array<"light" | "dark" | "forced">;
  }>;
  hasBreakingChanges: boolean;
  intentionalBreakingAuthorized: boolean;
  compatible: boolean;
};

export function parseTokenInventory(
  tree: TokenTree,
  prefix: string[] = [],
  out = new Map<string, TokenInventoryEntry>(),
): Map<string, TokenInventoryEntry> {
  for (const [key, node] of Object.entries(tree)) {
    if (key.startsWith("$")) continue;
    const path = [...prefix, key];
    if ("$value" in node && typeof node.$value === "string") {
      const token = node as Token;
      const varName = `--kb-${path.join("-")}`;
      out.set(varName, {
        id: path.join("."),
        varName,
        type: token.$type,
        light: token.$value,
        dark: token.$extensions?.["kb.dark"] ?? null,
        forced: token.$extensions?.["kb.forced"] ?? null,
      });
    } else {
      parseTokenInventory(node as TokenTree, path, out);
    }
  }
  return out;
}

function signatureOf(entry: TokenInventoryEntry): string {
  return JSON.stringify([entry.type, entry.light, entry.dark, entry.forced]);
}

function hasBreakingCommitMarker(messages: string[]): boolean {
  return messages.some(
    (msg) => /^[a-z]+(?:\([^)]+\))?!:/m.test(msg) || /^BREAKING[ -]CHANGE:/m.test(msg),
  );
}

export function compareTokenInventories(
  baseTree: TokenTree,
  headTree: TokenTree,
  options?: { commitMessages?: string[] },
): TokenApiDiff {
  const baseMap = parseTokenInventory(baseTree);
  const headMap = parseTokenInventory(headTree);

  const rawRemoved: TokenInventoryEntry[] = [];
  const rawAdded: TokenInventoryEntry[] = [];
  const typeChanged: TokenApiDiff["typeChanged"] = [];
  const defaultChanged: TokenApiDiff["defaultChanged"] = [];

  for (const [varName, baseEntry] of baseMap) {
    const headEntry = headMap.get(varName);
    if (!headEntry) {
      rawRemoved.push(baseEntry);
      continue;
    }
    if (baseEntry.type !== headEntry.type) {
      typeChanged.push({
        varName,
        fromType: baseEntry.type,
        toType: headEntry.type,
      });
    }
    const changedModes: Array<"light" | "dark" | "forced"> = [];
    if (baseEntry.light !== headEntry.light) changedModes.push("light");
    if (baseEntry.dark !== headEntry.dark) changedModes.push("dark");
    if (baseEntry.forced !== headEntry.forced) changedModes.push("forced");
    if (changedModes.length > 0) {
      defaultChanged.push({ varName, changedModes });
    }
  }

  for (const [varName, headEntry] of headMap) {
    if (!baseMap.has(varName)) {
      rawAdded.push(headEntry);
    }
  }

  rawRemoved.sort((a, b) => a.varName.localeCompare(b.varName));
  rawAdded.sort((a, b) => a.varName.localeCompare(b.varName));

  const matchedAdded = new Set<string>();
  const renamed: TokenApiDiff["renamed"] = [];
  const removed: string[] = [];

  for (const rem of rawRemoved) {
    const sig = signatureOf(rem);
    const match = rawAdded.find(
      (add) => !matchedAdded.has(add.varName) && signatureOf(add) === sig,
    );
    if (match) {
      matchedAdded.add(match.varName);
      renamed.push({
        from: rem.varName,
        to: match.varName,
        type: rem.type,
      });
    } else {
      removed.push(rem.varName);
    }
  }

  const added = rawAdded.filter((add) => !matchedAdded.has(add.varName)).map((add) => add.varName);

  typeChanged.sort((a, b) => a.varName.localeCompare(b.varName));
  defaultChanged.sort((a, b) => a.varName.localeCompare(b.varName));

  const hasBreakingChanges = removed.length > 0 || renamed.length > 0 || typeChanged.length > 0;
  const intentionalBreakingAuthorized = hasBreakingCommitMarker(options?.commitMessages ?? []);

  return {
    added,
    removed,
    renamed,
    typeChanged,
    defaultChanged,
    hasBreakingChanges,
    intentionalBreakingAuthorized,
    compatible: !hasBreakingChanges || intentionalBreakingAuthorized,
  };
}

if (import.meta.main) {
  const root = resolve(import.meta.dir, "..");
  const baseIdx = process.argv.indexOf("--base");
  const baseRef = baseIdx >= 0 ? (process.argv[baseIdx + 1] ?? "HEAD") : "HEAD";
  const headTree = JSON.parse(
    await readFile(join(root, "packages/tokens/tokens.json"), "utf8"),
  ) as TokenTree;

  let baseTree = headTree;
  let commitMessages: string[] = [];
  try {
    const baseRaw = execFileSync("git", ["show", `${baseRef}:packages/tokens/tokens.json`], {
      cwd: root,
      encoding: "utf8",
    });
    baseTree = JSON.parse(baseRaw) as TokenTree;
    const logRaw = execFileSync("git", ["log", "--format=%B%x00", `${baseRef}..HEAD`], {
      cwd: root,
      encoding: "utf8",
    });
    commitMessages = logRaw
      .split("\0")
      .map((s) => s.trim())
      .filter(Boolean);
  } catch {
    baseTree = headTree;
  }

  const diff = compareTokenInventories(baseTree, headTree, { commitMessages });
  console.log(JSON.stringify(diff, null, 2));
  if (!diff.compatible) {
    process.exit(1);
  }
}
