import { definePlacement } from "../../protocol/placement";

// Full width until the 80rem cap; content fills the space inside the gutter.
export const placement = definePlacement({
  root: ".kb-container",
  rules: [
    { part: ":scope", place: "measure", max: 80 },
    { part: ":scope > *", place: "fill" },
  ],
});
