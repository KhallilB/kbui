import { definePlacement } from "../../protocol/placement";

export const placement = definePlacement({
  root: ".kb-accordion",
  rules: [
    { part: ":scope", place: "fill" },
    { part: ":scope", place: "stack" },
    { part: ".kb-accordion-trigger", place: "fill", of: ".kb-accordion-header" },
  ],
});
