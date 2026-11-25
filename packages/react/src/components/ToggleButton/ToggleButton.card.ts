import { defineCard } from "../../protocol/card";

export default defineCard({
  role: "input",
  use: "Keep a named action active until the user presses the same button again.",
  instead: {
    Button: "the action runs once",
    Switch: "the choice is an on/off setting",
    ToggleGroup: "several independent choices share a name and keyboard navigation",
  },
  slots: { children: { roles: ["text", "media"] } },
  prompts: {
    pick: ["Turn grid lines on and off in an editor", "Pin or unpin the activity pane"],
    nearMiss: {
      Button: ["Download the current document"],
      Switch: ["Enable email notifications in account settings"],
      ToggleGroup: ["Choose which overlays are shown on a map"],
    },
  },
});
