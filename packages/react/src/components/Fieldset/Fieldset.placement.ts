import { definePlacement } from "../../protocol/placement";

export const placement = definePlacement({
  root: ".kb-fieldset",
  rules: [
    { part: ":scope", place: "fill" },
    { part: ":scope", place: "stack" },
    { part: ".kb-fieldset-fields", place: "stack" },
  ],
});
