import { defineCard } from "../../protocol/card";
import { placement } from "./StatsRow.placement";

export default defineCard({
  role: "data",
  use: "A row of headline metrics, each a label, a value and an optional change, that wraps when narrow.",
  instead: {
    Stat: "there is one metric",
    Table: "readers compare many values across rows and columns",
  },
  slots: {
    // Placement holds one line from medium for up to four.
    items: { roles: ["data"], max: 4 },
  },
  requires: ["aria-label", "children"],
  prompts: {
    pick: [
      "Revenue, orders, conversion and average order value for the month",
      "Uptime, latency and error rate above a service's charts",
    ],
    nearMiss: {
      Stat: ["Show the account balance on a wallet card"],
      Table: ["Monthly revenue for each region over the last year"],
    },
  },
  placement,
});
