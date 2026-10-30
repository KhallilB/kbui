import { definePlacement } from "../../protocol/placement";

// CSS moves actions onto the title row from 40rem of header; medium starts at 48rem, so it holds.
export const placement = definePlacement({
  root: ".kb-pageheader",
  rules: [
    { part: ":scope", place: "fill" },
    { part: ".kb-pageheader-actions", place: "end" },
    { part: ".kb-pageheader-main", place: "stack", at: ["compact"] },
    { part: ".kb-pageheader-main", place: "line", at: ["medium", "wide"] },
  ],
});
