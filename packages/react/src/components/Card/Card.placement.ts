import { definePlacement } from "../../protocol/placement";

export const placement = definePlacement({
  root: '.kb-card[data-appearance="outlined"]',
  rules: [
    { part: ":scope", place: "fill" },
    { part: ":scope", place: "stack" },
  ],
});
