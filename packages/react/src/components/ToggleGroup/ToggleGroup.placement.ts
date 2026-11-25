import { definePlacement } from "../../protocol/placement";

export const placement = [
  definePlacement({
    root: '.kb-togglegroup[data-orientation="horizontal"]',
    rules: [{ part: ":scope", place: "line", at: ["medium", "wide"] }],
  }),
  definePlacement({
    root: '.kb-togglegroup[data-orientation="vertical"]',
    rules: [{ part: ":scope", place: "stack" }],
  }),
] as const;
