import { definePlacement } from "../../protocol/placement";

// Splits at 48rem of its own content box, so medium pages may hold either; only the ends are promised.
export const placement = definePlacement({
  root: ".kb-supportingpane",
  rules: [
    { part: ":scope", place: "measure", max: 80 },
    { part: ":scope", place: "stack", at: ["compact"] },
    { part: ":scope", place: "line", at: ["wide"] },
    { part: ".kb-supportingpane-aside", place: "last" },
    { part: ".kb-supportingpane-aside", place: "end" },
  ],
});
