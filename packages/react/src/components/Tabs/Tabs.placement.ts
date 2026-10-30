import { definePlacement } from "../../protocol/placement";

export const placement = [
  // Horizontal: one scrolling row of tabs above the panel.
  definePlacement({
    root: '.kb-tabs[data-orientation="horizontal"]',
    rules: [
      { part: ":scope", place: "fill" },
      { part: ":scope", place: "stack" },
      { part: ".kb-tabs-list", place: "line" },
    ],
  }),
  // Vertical: list beside the panel from medium; compact stacks the panel below.
  definePlacement({
    root: '.kb-tabs[data-orientation="vertical"]',
    rules: [
      { part: ":scope", place: "fill" },
      { part: ":scope", place: "stack", at: ["compact"] },
      { part: ":scope", place: "line", at: ["medium", "wide"] },
    ],
  }),
] as const;
