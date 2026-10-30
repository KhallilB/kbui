import { defineCard } from "../../protocol/card";
import { placement } from "./SupportingPane.placement";

export default defineCard({
  // An intent is the screen root, not a slot.
  role: null,
  use: "A main column with a narrower aside, such as an order summary, beside it, or below it when narrow.",
  instead: {
    Dashboard: "the page is an overview of metrics and panels, not one task",
    Split: "both columns carry equal weight, or the pair sits inside a region",
  },
  slots: {
    main: { roles: ["region", "input", "data"] },
    aside: { roles: ["region", "data", "action"], max: 1 },
  },
  requires: ["children", "aside"],
  prompts: {
    pick: ["Shoe cart with an order summary", "Order detail with a customer and payment aside"],
    nearMiss: {
      Dashboard: ["Sales dashboard with revenue and top products"],
      Split: ["Compare two plans side by side"],
    },
  },
  placement,
});
