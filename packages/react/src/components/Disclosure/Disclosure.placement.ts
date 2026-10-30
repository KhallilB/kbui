import { definePlacement } from "../../protocol/placement";

// CollapsiblePanel has no styles of its own; Disclosure is where its panel is placed.
export const placement = definePlacement({
  root: ".kb-disclosure",
  rules: [
    { part: ":scope", place: "fill" },
    { part: ".kb-disclosure-trigger", place: "fill" },
    { part: ".kb-disclosure-panel", place: "fill" },
  ],
});
