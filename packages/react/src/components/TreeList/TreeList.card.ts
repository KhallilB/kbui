import { defineCard } from "../../protocol/card";
import { placement } from "./TreeList.placement";

export default defineCard({
  role: "region",
  use: "A nested hierarchy of branches that readers expand to find related entries.",
  instead: {
    CollectionList: "entries are peers in one flat list",
    Accordion: "related titled sections reveal supporting content rather than descendant entries",
  },
  slots: { items: { roles: ["data", "navigation", "text"] } },
  requires: ["items"],
  prompts: {
    pick: ["Browse nested folders", "Explore a hierarchy of project topics"],
    nearMiss: {
      CollectionList: ["Show a flat list of projects and their owners"],
      Accordion: ["Open answers in a list of frequently asked questions"],
    },
  },
  placement,
});
