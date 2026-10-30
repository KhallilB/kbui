import { definePlacement } from "../../protocol/placement";

// Dialog owns the popup width.
export const placement = definePlacement({
  root: ".kb-confirmaction",
  rules: [
    { part: ".kb-dialog-actions", place: "last" },
    { part: ".kb-dialog-actions", place: "end" },
    { part: ".kb-dialog-actions", place: "primary-last", primary: '[data-variant="danger"]' },
  ],
});
