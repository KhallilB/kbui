import { expect, test } from "bun:test";
import { highlightCode } from "../catalog/highlight";

test("CSS highlights selectors, properties and values using CSS grammar", () => {
  const code = ".save { color: var(--kb-color-accent); padding: 12px; }";
  const parts = highlightCode(code, "css").map(([start, end, kind]) => [
    code.slice(start, end),
    kind,
  ]);
  expect(parts).toContainEqual([".save", "tag"]);
  expect(parts).toContainEqual(["color", "attribute"]);
  expect(parts).toContainEqual(["var", "function"]);
  expect(parts).toContainEqual(["12", "number"]);
});

test("HTML keeps prose plain and recognizes HTML comments and attributes", () => {
  const code = '<!-- note -->\n<html lang="en"><p>const save = 3;</p></html>';
  const parts = highlightCode(code, "html").map(([start, end, kind]) => [
    code.slice(start, end),
    kind,
  ]);
  expect(parts).toContainEqual(["<!-- note -->", "comment"]);
  expect(parts).toContainEqual(["lang", "attribute"]);
  expect(parts).not.toContainEqual(["const", "keyword"]);
});

test("shell highlights command flags and comments", () => {
  const code = 'npm install --save "@kbui/react" # install';
  const parts = highlightCode(code, "shellscript").map(([start, end, kind]) => [
    code.slice(start, end),
    kind,
  ]);
  expect(parts).toContainEqual(["--save", "attribute"]);
  expect(parts).toContainEqual(["# install", "comment"]);
  expect(parts).toContainEqual(['"@kbui/react"', "string"]);
});
