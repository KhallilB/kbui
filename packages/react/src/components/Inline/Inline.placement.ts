import { definePlacement } from "../../protocol/placement";

// Short runs share one row from the start edge; longer runs wrap by design.
export const placement = definePlacement({
  root: ".kb-inline",
  rules: [
    { part: ":scope", place: "fill" },
    { part: ":scope", place: "line" },
    { part: ":scope", place: "start" },
  ],
});
