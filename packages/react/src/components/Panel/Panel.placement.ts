import { definePlacement } from "../../protocol/placement";

// Header actions end the title row and stay end-aligned when they wrap; footer actions end the panel.
export const placement = [
  definePlacement({
    root: ".kb-panel",
    rules: [
      { part: ":scope", place: "fill" },
      { part: ".kb-panel-header > :first-child", place: "start" },
      { part: ".kb-panel-toolbar", place: "end", of: ".kb-panel-header" },
      { part: ".kb-panel-toolbar", place: "last" },
      { part: ".kb-panel-footer", place: "end" },
      { part: ".kb-panel-footer", place: "line", at: ["medium", "wide"] },
      { part: ".kb-panel-footer", place: "primary-last", primary: '[data-variant="primary"]' },
    ],
  }),
  definePlacement({
    root: ".kb-panel[data-collapsible]",
    rules: [
      { part: ":scope", place: "fill" },
      { part: ".kb-panel-header > :first-child", place: "start" },
      { part: ".kb-panel-toggle", place: "end", of: ".kb-panel-header" },
      { part: ".kb-panel-toggle", place: "last" },
    ],
  }),
] as const;
