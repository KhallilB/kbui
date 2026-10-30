import { definePlacement } from "../../protocol/placement";

// Record row: status and actions share one line from medium; stacked below content, still end-aligned.
export const placement = definePlacement({
  root: ".kb-collectionrow",
  rules: [
    { part: ":scope", place: "fill" },
    {
      part: ".kb-collectionrow-layout > :first-child",
      place: "start",
      of: ".kb-collectionrow-layout",
    },
    { part: ".kb-collectionrow-layout", place: "line", at: ["medium", "wide"] },
    { part: ".kb-collectionrow-aside", place: "end", of: ".kb-collectionrow-layout" },
    { part: ".kb-collectionrow-aside", place: "last" },
    { part: ".kb-collectionrow-aside", place: "line", at: ["medium", "wide"] },
    { part: ".kb-collectionrow-actions", place: "end", of: ".kb-collectionrow-layout" },
    { part: ".kb-collectionrow-actions", place: "last" },
    {
      part: ".kb-collectionrow-actions",
      place: "primary-last",
      primary: '.kb-button[data-variant="primary"]',
    },
  ],
});
