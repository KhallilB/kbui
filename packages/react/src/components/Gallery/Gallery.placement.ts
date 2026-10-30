import { definePlacement } from "../../protocol/placement";

// One column below 30rem of content; column counts above it are the stylesheet's.
export const placement = definePlacement({
  root: ".kb-gallery",
  rules: [
    { part: ":scope", place: "measure", max: 80 },
    { part: ".kb-gallery-filters", place: "fill" },
    { part: ".kb-gallery-items", place: "fill" },
    { part: ".kb-gallery-items", place: "stack", at: ["compact"] },
  ],
});
