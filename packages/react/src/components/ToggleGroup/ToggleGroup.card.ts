import { defineCard } from "../../protocol/card";
import { placement } from "./ToggleGroup.placement";

export default defineCard({
  role: "input",
  use: "Group independent on/off buttons under one name and one keyboard entry.",
  instead: {
    RadioGroup: "exactly one choice can be active",
    ToggleButton: "only one action can be toggled",
    Toolbar: "the row mixes actions, inputs, or links",
  },
  slots: { children: { roles: ["input"] } },
  requires: ["children"],
  prompts: {
    pick: ["Choose which overlays are shown on a map", "Toggle several editor formatting styles"],
    nearMiss: {
      RadioGroup: ["Choose one export format"],
      ToggleButton: ["Pin or unpin one activity pane"],
      Toolbar: ["Group Copy, Download and Open actions"],
    },
  },
  placement,
});
