import { afterEach, expect, test } from "bun:test";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { stageSite } from "./site-stage";

const temps: string[] = [];
afterEach(() => {
  for (const path of temps.splice(0)) rmSync(path, { recursive: true, force: true });
});
function fixture() {
  const root = mkdtempSync(join(tmpdir(), "kbui-stage-test-"));
  temps.push(root);
  const source = join(root, "dist");
  for (const file of [
    "index.html",
    "setup/index.html",
    "setup/themes/index.html",
    "compare/index.html",
    "components/index.html",
    "components/qa/index.html",
    "examples/index.html",
    "recipes/index.html",
    "changelog/index.html",
    "playground/index.html",
    "storybook/index.html",
    "storybook/iframe.html",
    "storybook/index.json",
    "assets/main.js",
  ]) {
    mkdirSync(dirname(join(source, file)), { recursive: true });
    writeFileSync(join(source, file), file);
  }
  return { source, destination: join(root, "public") };
}

test("deploy artifact serves the subdomain root and drops stale assets", () => {
  const { source, destination } = fixture();
  mkdirSync(destination);
  writeFileSync(join(destination, "stale.js"), "old");
  stageSite(source, destination);
  expect(readdirSync(destination)).toContain("index.html");
  expect(existsSync(join(destination, "kbui"))).toBe(false);
  expect(existsSync(join(destination, "stale.js"))).toBe(false);
  expect(readFileSync(join(destination, "assets/main.js"), "utf8")).toBe("assets/main.js");
  expect(readFileSync(join(destination, "components/qa/index.html"), "utf8")).toBe(
    "components/qa/index.html",
  );
  expect(readFileSync(join(destination, "setup/themes/index.html"), "utf8")).toBe(
    "setup/themes/index.html",
  );
});
test("incomplete build fails before replacing previous artifact", () => {
  const { source, destination } = fixture();
  mkdirSync(destination);
  writeFileSync(join(destination, "previous"), "keep");
  rmSync(join(source, "storybook/iframe.html"));
  expect(() => stageSite(source, destination)).toThrow("Missing site entry: storybook/iframe.html");
  expect(readFileSync(join(destination, "previous"), "utf8")).toBe("keep");
});
test("staging cannot overwrite its own source", () => {
  const { source } = fixture();
  expect(() => stageSite(source, source)).toThrow("Staging destination overlaps source");
  expect(() => stageSite(source, join(source, "public"))).toThrow(
    "Staging destination overlaps source",
  );
});

test("missing workspace fails before replacing previous artifact", () => {
  const { source, destination } = fixture();
  mkdirSync(destination);
  writeFileSync(join(destination, "previous"), "keep");
  rmSync(join(source, "compare/index.html"));
  expect(() => stageSite(source, destination)).toThrow("Missing site entry: compare/index.html");
  expect(readFileSync(join(destination, "previous"), "utf8")).toBe("keep");
});

test("missing changelog fails before replacing previous artifact", () => {
  const { source, destination } = fixture();
  mkdirSync(destination);
  writeFileSync(join(destination, "previous"), "keep");
  rmSync(join(source, "changelog/index.html"));
  expect(() => stageSite(source, destination)).toThrow("Missing site entry: changelog/index.html");
  expect(readFileSync(join(destination, "previous"), "utf8")).toBe("keep");
});

test("missing QA entry fails before replacing previous artifact", () => {
  const { source, destination } = fixture();
  mkdirSync(destination);
  writeFileSync(join(destination, "previous"), "keep");
  rmSync(join(source, "components/qa/index.html"));
  expect(() => stageSite(source, destination)).toThrow(
    "Missing site entry: components/qa/index.html",
  );
  expect(readFileSync(join(destination, "previous"), "utf8")).toBe("keep");
});

test("missing recipe route preserves the previous deployment artifact", () => {
  const { source, destination } = fixture();
  mkdirSync(destination);
  writeFileSync(join(destination, "previous"), "keep");
  rmSync(join(source, "recipes/index.html"));
  expect(() => stageSite(source, destination)).toThrow("Missing site entry: recipes/index.html");
  expect(readFileSync(join(destination, "previous"), "utf8")).toBe("keep");
});
