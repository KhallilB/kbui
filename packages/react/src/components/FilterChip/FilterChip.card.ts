import { defineCard } from "../../protocol/card";

export default defineCard({
  role: "input",
  use: "A compact filter or applied term the user can select, remove, or both.",
  instead: {
    Badge: "the text communicates static metadata",
    MultiSelect: "the user searches and chooses from a list of options in a single field",
    ToggleButton: "the pressed state represents a mode or command outside a set of filters",
  },
  slots: { label: { roles: ["text"], max: 1 } },
  requires: ["label"],
  prompts: {
    pick: ["Toggle the Available now search facet", "Remove one active search filter"],
    nearMiss: {
      Badge: ["Show the record's category beside its name"],
      MultiSelect: ["Find and add several tags from a dropdown"],
      ToggleButton: ["Turn bold formatting on and off"],
    },
  },
});
