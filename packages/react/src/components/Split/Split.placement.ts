import { definePlacement } from "../../protocol/placement";

// Default collapse is 48rem, so tracks stack exactly when the split is compact.
export const placement = definePlacement({
  root: ".kb-split",
  rules: [
    { part: ":scope", place: "fill" },
    { part: ":scope", place: "stack", at: ["compact"] },
    { part: ":scope", place: "line", at: ["medium", "wide"] },
  ],
});
