import { definePlacement } from "../../protocol/placement";

// Data fills the region; the caller's toolbar slot, bulk actions and page controls end their rows.
export const placement = definePlacement({
  root: ".kb-collection",
  rules: [
    { part: ":scope", place: "fill" },
    { part: ".kb-collection-viewport", place: "fill" },
    {
      part: ".kb-collection-table",
      place: "fill",
      of: ".kb-collection-viewport",
      at: ["medium", "wide"],
    },
    { part: ".kb-collection-toolbar > :last-child", place: "end", of: ".kb-collection-toolbar" },
    { part: ".kb-collection-bulk > button:last-of-type", place: "end", of: ".kb-collection-bulk" },
    { part: ".kb-collection-bulk", place: "line", at: ["medium", "wide"] },
    { part: ".kb-collection-pagination > :last-child", place: "end" },
    { part: ".kb-collection-pagination > :last-child", place: "last" },
    { part: ".kb-collection-pagination > :last-child", place: "line" },
  ],
});
