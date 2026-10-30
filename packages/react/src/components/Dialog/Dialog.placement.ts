import { definePlacement } from "../../protocol/placement";

export const placement = definePlacement({
  root: ".kb-dialog-popup",
  rules: [
    { part: ".kb-dialog-actions", place: "end" },
    { part: ".kb-dialog-actions", place: "last" },
    { part: ".kb-dialog-actions", place: "line", at: ["medium", "wide"] },
    { part: ".kb-dialog-actions", place: "primary-last", primary: '[data-variant="primary"]' },
  ],
});
