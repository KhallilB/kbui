import { definePlacement } from "../../protocol/placement";

// Split arrangement; fixtures set data-layout="split", since one contract cannot cover stack too.
export const placement = definePlacement({
  root: ".kb-formsection",
  rules: [
    { part: ":scope", place: "stack", at: ["compact"] },
    { part: ":scope", place: "line", at: ["medium", "wide"] },
    { part: ".kb-formsection-actions", place: "last" },
    { part: ".kb-formsection-actions", place: "end" },
  ],
});
