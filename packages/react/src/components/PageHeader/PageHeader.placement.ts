import { definePlacement } from "../../protocol/placement";

// Medium matches the stylesheet query that moves actions onto the title row.
export const placement = definePlacement({
  root: ".kb-pageheader",
  from: { medium: 40 },
  rules: [
    { part: ":scope", place: "fill" },
    { part: ".kb-pageheader-actions", place: "end" },
    { part: ".kb-pageheader-main", place: "stack", at: ["compact"] },
    { part: ".kb-pageheader-main", place: "line", at: ["medium", "wide"] },
  ],
});
