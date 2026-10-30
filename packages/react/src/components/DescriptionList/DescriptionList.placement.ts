import { definePlacement } from "../../protocol/placement";

// Term beside detail from medium; compact stacks them. Its own container sets the switch at 32rem.
export const placement = definePlacement({
  root: '.kb-descriptionlist[data-layout="responsive"]',
  from: { medium: 32 },
  rules: [
    { part: ":scope", place: "fill" },
    { part: ".kb-descriptionlist-item", place: "fill" },
    { part: ".kb-descriptionlist-item", place: "stack", at: ["compact"] },
    { part: ".kb-descriptionlist-item", place: "line", at: ["medium", "wide"] },
    { part: ".kb-descriptionlist-term", place: "start" },
  ],
});
