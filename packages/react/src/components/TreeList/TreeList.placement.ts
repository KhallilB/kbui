import { definePlacement } from "../../protocol/placement";

export const placement = definePlacement({
  root: ".kb-treelist",
  rules: [
    { part: ":scope", place: "fill" },
    { part: ":scope", place: "stack" },
    { part: ".kb-treelist-branch", place: "stack" },
    { part: ".kb-treelist-trigger", of: ".kb-treelist-item", place: "fill" },
  ],
});
