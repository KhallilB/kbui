import { definePlacement } from "../../protocol/placement";

export const placement = definePlacement({
  root: ".kb-errorsummary",
  rules: [
    { part: ":scope", place: "fill" },
    { part: ":scope", place: "stack" },
    { part: ".kb-errorsummary-list", place: "stack" },
  ],
});
