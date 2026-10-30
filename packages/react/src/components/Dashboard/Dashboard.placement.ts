import { definePlacement } from "../../protocol/placement";

// Panels split where wide begins: 60rem collapse plus 2rem gutters each side.
export const placement = definePlacement({
  root: ".kb-dashboard",
  rules: [
    { part: ":scope", place: "measure", max: 80 },
    { part: ".kb-dashboard-header", place: "fill" },
    { part: ".kb-dashboard-metrics", place: "fill" },
    { part: ".kb-dashboard-panels", place: "fill" },
    { part: ".kb-dashboard-panels", place: "stack", at: ["compact", "medium"] },
    { part: ".kb-dashboard-panels", place: "line", at: ["wide"] },
  ],
});
