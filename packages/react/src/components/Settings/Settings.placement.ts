import { definePlacement } from "../../protocol/placement";

// Record rows keep status and actions on one line beside the main text from 40rem of page.
export const placement = definePlacement({
  root: ".kb-settings",
  from: { medium: 40 },
  rules: [
    { part: ":scope", place: "fill" },
    { part: ".kb-collectionrow-aside", place: "end", of: ".kb-collectionrow" },
    { part: ".kb-collectionrow-layout", place: "line", at: ["medium", "wide"] },
    { part: ".kb-collectionrow-aside", place: "line", at: ["medium", "wide"] },
  ],
});
