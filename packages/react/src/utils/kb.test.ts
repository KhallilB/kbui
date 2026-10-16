import { describe, expect, test } from "vitest";
import { kb } from "./kb";

describe("kb", () => {
  test("prefixes the class and maps attrs to data-*", () => {
    expect(kb("button", { variant: "primary", size: "md" })).toStrictEqual({
      className: "kb-button",
      "data-variant": "primary",
      "data-size": "md",
    });
  });

  test("drops undefined and false, renders true as empty attribute", () => {
    const out = kb("x", { a: undefined, b: false, c: true });
    expect(out).toStrictEqual({
      className: "kb-x",
      "data-c": "",
    });
    expect(Object.keys(out)).toStrictEqual(["className", "data-c"]);
  });

  test("appends consumer className", () => {
    expect(kb("x", {}, "mine").className).toBe("kb-x mine");
  });
});
