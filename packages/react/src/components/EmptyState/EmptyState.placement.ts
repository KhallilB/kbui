import { definePlacement } from "../../protocol/placement";

// Deliberately centred: one message and its next step, not a region of records.
export const placement = definePlacement({
  root: ".kb-emptystate",
  rules: [
    { part: ":scope", place: "fill" },
    { part: ":scope", place: "stack" },
    { part: ".kb-emptystate-header", place: "measure", max: 32 },
    { part: ".kb-emptystate-header", place: "center" },
    { part: ".kb-emptystate-actions", place: "center" },
    { part: ".kb-emptystate-actions", place: "line" },
  ],
});
