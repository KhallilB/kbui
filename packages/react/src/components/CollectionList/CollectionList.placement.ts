import { definePlacement } from "../../protocol/placement";

export const placement = definePlacement({
  root: ".kb-collectionlist",
  rules: [
    { part: ":scope", place: "fill" },
    { part: ":scope", place: "stack" },
    { part: ":scope > .kb-collectionrow", place: "fill" },
  ],
});
