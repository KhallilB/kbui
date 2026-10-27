import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import {
  componentTokenVariables,
  fontFamilyVariables,
  fontWeightVariables,
} from "../docs/token-data";

test("component token documentation renders existing nested token leaves", () => {
  expect(() => componentTokenVariables()).not.toThrow();
  const variables = componentTokenVariables();
  expect(variables).toContain("--kb-heading-leading");
  expect(variables).toContain("--kb-text-leading-body");
  expect(() =>
    renderToStaticMarkup(
      <div>
        {variables.map((variable) => (
          <code key={variable}>{variable}</code>
        ))}
      </div>,
    ),
  ).not.toThrow();
});

test("font documentation separates family leaves from nested weights", () => {
  const families = fontFamilyVariables();
  expect(families).toEqual(["--kb-font-sans", "--kb-font-mono"]);
  expect(fontWeightVariables()).toEqual([
    "--kb-font-weight-regular",
    "--kb-font-weight-medium",
    "--kb-font-weight-strong",
  ]);
  expect(() =>
    renderToStaticMarkup(
      <div>
        {families.map((variable) => (
          <code key={String(variable)}>{variable}</code>
        ))}
      </div>,
    ),
  ).not.toThrow();
});
