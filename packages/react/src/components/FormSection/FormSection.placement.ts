import { definePlacement } from "../../protocol/placement";

const actions = [
  { part: ".kb-formsection-actions", place: "last" },
  { part: ".kb-formsection-actions", place: "end" },
] as const;

export const placement = [
  definePlacement({
    root: '.kb-formsection[data-layout="stack"]',
    rules: [{ part: ":scope", place: "stack" }, ...actions],
  }),
  // Medium matches --kb-formsection-collapse, where the heading moves beside the fields.
  definePlacement({
    root: '.kb-formsection[data-layout="split"]',
    from: { medium: 40 },
    rules: [
      { part: ":scope", place: "stack", at: ["compact"] },
      { part: ":scope", place: "line", at: ["medium", "wide"] },
      ...actions,
    ],
  }),
] as const;
