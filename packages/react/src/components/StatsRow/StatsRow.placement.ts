import { definePlacement } from "../../protocol/placement";

// Up to four 10rem items and their gaps fit 48rem, so the row holds one line from medium.
export const placement = definePlacement({
  root: ".kb-statsrow",
  rules: [
    { part: ":scope", place: "fill" },
    { part: ":scope", place: "line", at: ["medium", "wide"] },
  ],
});
