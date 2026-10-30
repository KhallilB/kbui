import { defineCard } from "../../protocol/card";
import { placement } from "./Dashboard.placement";

export default defineCard({
  // An intent is the screen root, not a slot.
  role: null,
  use: "An overview page: a header, a row of headline metrics, then primary panels beside narrower secondary ones.",
  instead: {
    SupportingPane: "one main column carries a task and the side column summarises it",
    Gallery: "the page is a grid of like items to browse",
  },
  slots: {
    header: { roles: ["region", "text"], max: 1 },
    metrics: { roles: ["data"], max: 1 },
    primary: { roles: ["region", "data"] },
    secondary: { roles: ["region", "data", "feedback"] },
  },
  requires: ["header", "primary"],
  prompts: {
    pick: [
      "Sales dashboard showing revenue, orders, conversion and top products",
      "Service health overview with uptime, incidents and recent deploys",
    ],
    nearMiss: {
      SupportingPane: ["Shoe cart with an order summary"],
      Gallery: ["Product catalog for a shoe shop"],
    },
  },
  placement,
});
