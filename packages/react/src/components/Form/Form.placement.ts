import { definePlacement } from "../../protocol/placement";

// Measure is the default md width; fixtures keep it.
export const placement = definePlacement({
  root: ".kb-form",
  rules: [
    { part: ":scope", place: "measure", max: 40 },
    { part: ".kb-form-actions", place: "last" },
    { part: ".kb-form-actions", place: "end" },
  ],
});
