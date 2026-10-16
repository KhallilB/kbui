import { mkdir, rm, writeFile } from "node:fs/promises";
import { buildTokens, type TokenTree } from "../src/build";
import tree from "../tokens.json";

const dist = new URL("../dist/", import.meta.url);
await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
const { css, js, dts } = buildTokens(tree as TokenTree);
await writeFile(new URL("tokens.css", dist), css);
await writeFile(new URL("tokens.js", dist), js);
await writeFile(new URL("tokens.d.ts", dist), dts);
console.log("tokens: built dist/tokens.{css,js,d.ts}");
