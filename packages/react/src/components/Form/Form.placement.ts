import { definePlacement } from "../../protocol/placement";

const actions = [
  { part: ".kb-form-actions", place: "last" },
  { part: ".kb-form-actions", place: "end" },
] as const;

// One per data-width; measures are the form width tokens.
export const placement = [
  definePlacement({
    root: '.kb-form[data-width="sm"]',
    rules: [{ part: ":scope", place: "measure", max: 32 }, ...actions],
  }),
  definePlacement({
    root: '.kb-form[data-width="md"]',
    rules: [{ part: ":scope", place: "measure", max: 40 }, ...actions],
  }),
  definePlacement({
    root: '.kb-form[data-width="full"]',
    rules: [{ part: ":scope", place: "fill" }, ...actions],
  }),
] as const;
