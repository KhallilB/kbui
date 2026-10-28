import { expect, test } from "bun:test";
import { formatEditorCode } from "../site/editor-format";

test("formats TSX and CSS without changing content or props", async () => {
  expect(
    await formatEditorCode(
      'const label:string="Ready";<Badge tone="success">{label}</Badge>',
      "tsx",
    ),
  ).toContain('const label: string = "Ready";');
  expect(await formatEditorCode(".brand{color:red}", "css")).toBe(".brand {\n  color: red;\n}\n");
});
test("normalizes utility whitespace while retaining order and variants", async () => {
  expect(await formatEditorCode("  px-4\n hover:bg-black   dark:text-white ", "classes")).toBe(
    "px-4 hover:bg-black dark:text-white",
  );
});
test("incomplete source rejects without inventing code", async () => {
  await expect(formatEditorCode("<Badge", "tsx")).rejects.toThrow();
  await expect(formatEditorCode(".brand{", "css")).rejects.toThrow();
});
