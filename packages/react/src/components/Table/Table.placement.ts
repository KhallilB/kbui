import { definePlacement } from "../../protocol/placement";

// Rooted at the scroller, whose parent sets the size class; narrower than its words, the table scrolls.
export const placement = definePlacement({
  root: ".kb-table-scroll",
  rules: [
    { part: ":scope", place: "fill" },
    { part: ".kb-table", place: "fill", of: ".kb-table-scroll", at: ["medium", "wide"] },
    { part: ".kb-table-rowactions", place: "end", of: ".kb-table-cell" },
    { part: ".kb-table-rowactions", place: "line", at: ["medium", "wide"] },
  ],
});
