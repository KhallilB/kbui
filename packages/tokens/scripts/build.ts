import { mkdir, writeFile } from "node:fs/promises";
import { buildTokens, type TokenTree } from "../src/build";
import tree from "../tokens.json";

const dist = new URL("../dist/", import.meta.url);
await mkdir(dist, { recursive: true });
const { css, ts } = buildTokens(tree as TokenTree);
await writeFile(new URL("tokens.css", dist), css);
await writeFile(new URL("tokens.ts", dist), ts);
// Ship the .ts verbatim as .js + .d.ts: it is a pure const object, no transform needed.
await writeFile(new URL("tokens.js", dist), ts.replace(" as const;", ";"));
await writeFile(
  new URL("tokens.d.ts", dist),
  ts.replace("export const tokens =", "export declare const tokens:").replace(" as const;", ";"),
);
console.log("tokens: built dist/tokens.{css,js,d.ts}");
