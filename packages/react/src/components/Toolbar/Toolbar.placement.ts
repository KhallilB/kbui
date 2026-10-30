import { definePlacement } from "../../protocol/placement";

// Fits its controls rather than filling; where it sits is its container's rule.
export const placement = definePlacement({
  root: ".kb-toolbar",
  rules: [{ part: ":scope", place: "line", at: ["medium", "wide"] }],
});
