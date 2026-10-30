import { definePlacement } from "../../protocol/placement";

// Close ends the title row; the action is the toast's last region action, so it ends too.
export const placement = definePlacement({
  root: ".kb-toast-viewport",
  rules: [
    { part: ":scope", place: "stack" },
    { part: ".kb-toast", place: "fill" },
    { part: ".kb-toast-close", place: "end", of: ".kb-toast" },
    { part: ".kb-toast-action", place: "end", of: ".kb-toast-content" },
    { part: ".kb-toast-action", place: "last" },
  ],
});
