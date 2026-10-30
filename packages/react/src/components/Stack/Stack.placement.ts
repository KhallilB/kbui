import { definePlacement } from "../../protocol/placement";

// One column at every size. Children span it from the start edge; Text keeps its reading measure.
export const placement = definePlacement({
  root: ".kb-stack",
  rules: [
    { part: ":scope", place: "fill" },
    { part: ":scope", place: "stack" },
    { part: ":scope > *", place: "start" },
    { part: ":scope > :not(.kb-text)", place: "fill" },
  ],
});
