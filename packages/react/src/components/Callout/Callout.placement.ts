import { definePlacement } from "../../protocol/placement";

// Region actions end the callout, primary last.
export const placement = definePlacement({
  root: ".kb-callout",
  rules: [
    { part: ":scope", place: "fill" },
    { part: ".kb-callout-actions", place: "end", of: ".kb-callout" },
    { part: ".kb-callout-actions", place: "last" },
    { part: ".kb-callout-actions", place: "primary-last", primary: '[data-variant="primary"]' },
  ],
});
