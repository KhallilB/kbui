import { describe, expect, test } from "vitest";
import { kb } from "./kb";

describe("kb", () => {
  test("prefixes the class and maps attrs to data-*", () => {
    expect(kb("button", { variant: "primary", size: "md" })).toEqual({
      className: "kb-button",
      "data-variant": "primary",
      "data-size": "md",
    });
  });

  test("drops undefined and false, renders true as empty attribute", () => {
    expect(kb("x", { a: undefined, b: false, c: true })).toEqual({
      className: "kb-x",
      "data-c": "",
    });
  });

  test("appends consumer className", () => {
    expect(kb("x", {}, "mine").className).toBe("kb-x mine");
  });
});
