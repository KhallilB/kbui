import { defineCard } from "../../protocol/card";
import { placement } from "./Gallery.placement";

export default defineCard({
  // An intent is the screen root, not a slot.
  role: null,
  use: "A browsable grid of like items with images, such as a product catalog, with filters and an empty state.",
  instead: {
    Table: "readers compare items by their values rather than by looking",
    CollectionList: "items are records to manage, with row actions and no images",
  },
  slots: {
    header: { roles: ["region", "text"], max: 1 },
    filters: { roles: ["input", "feedback"] },
    items: { roles: ["media", "data", "action"] },
    empty: { roles: ["feedback"], max: 1 },
  },
  requires: ["header", "itemsLabel", "empty"],
  prompts: {
    pick: ["Product catalog for a shoe shop", "Browse photo templates by style"],
    nearMiss: {
      Table: ["Compare prices and stock for every product"],
      CollectionList: ["Team members with invite and removal"],
    },
  },
  placement,
});
