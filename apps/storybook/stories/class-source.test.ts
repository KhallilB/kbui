import { expect, test } from "bun:test";
import { activeClassNames, classSourceParts } from "../site/class-source";

test("comments stay inactive, including incomplete drafts", () => {
  expect(activeClassNames("/* bg-sky-500 px-3 */")).toEqual([]);
  expect(activeClassNames("px-4 /* note */ rounded-none /* unfinished text-white")).toEqual([
    "px-4",
    "rounded-none",
  ]);
});

test("fractions, URLs and arbitrary literal delimiters remain utilities", () => {
  const classes = ["w-1/2", "bg-[url(https://example.com/icon.svg)]", "content-['/*']"];
  expect(activeClassNames(classes.join(" "))).toEqual(classes);
});

test("comment spans preserve original source offsets for highlighting", () => {
  const source = "px-4\n/* Color\nbg-sky-500\n*/\nrounded-xl";
  const parts = classSourceParts(source);
  expect(parts.map((part) => part.text).join("")).toBe(source);
  expect(
    parts
      .filter((part) => part.comment)
      .map((part) => source.slice(part.start, part.start + part.text.length)),
  ).toEqual(["/* Color\nbg-sky-500\n*/"]);
});
