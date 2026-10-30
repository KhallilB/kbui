import { defineCard } from "../../protocol/card";
import { placement } from "./PageHeader.placement";

export default defineCard({
  role: "region",
  use: "Open a screen with its top heading, a short intro, status and the region's one primary action.",
  instead: {
    Heading: "the title has no intro, status or actions",
    Toolbar: "the row holds controls for content below, not the page's actions",
  },
  slots: {
    navigation: { roles: ["navigation"], max: 1 },
    meta: { roles: ["feedback", "text"], max: 3 },
    actions: { roles: ["action"], max: 3 },
    body: { roles: ["navigation", "input"], max: 1 },
  },
  requires: ["title"],
  prompts: {
    pick: [
      "Orders page with export and create actions",
      "Order detail with its status and a back link",
    ],
    nearMiss: {
      Heading: ["Title a card"],
      Toolbar: ["Bold, italic and link buttons above an editor"],
    },
  },
  placement,
});
