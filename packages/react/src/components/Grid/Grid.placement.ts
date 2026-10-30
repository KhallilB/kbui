import { definePlacement } from "../../protocol/placement";

// Explicit columns drop to one track below 30rem of the grid's own width.
export const placement = definePlacement({
  root: '.kb-grid[data-columns="3"]',
  from: { medium: 30 },
  rules: [
    { part: ":scope", place: "fill" },
    { part: ":scope", place: "stack", at: ["compact"] },
    { part: ":scope", place: "line", at: ["medium", "wide"] },
  ],
});
