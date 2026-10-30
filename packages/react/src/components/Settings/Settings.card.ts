import { defineCard } from "../../protocol/card";
import { placement } from "./Settings.placement";

export default defineCard({
  // Placeholder until a card role may be null: an intent is the screen root, not a slot.
  role: "layout",
  use: "A page of headed sections, each saved on its own, and managed lists with row actions, such as members, API keys or sessions.",
  instead: {
    Form: "the page is one task with one submit",
    Tabs: "sections are unrelated enough to hide all but one",
  },
  slots: {
    header: { roles: ["text"], max: 1 },
    sections: { roles: ["region"] },
  },
  requires: ["header"],
  prompts: {
    pick: [
      "Notification settings for a project management app",
      "Team members with invite and removal",
    ],
    nearMiss: {
      Form: ["Check out a shoe cart"],
      Tabs: ["Account, billing and API pages under one header"],
    },
  },
  placement,
});
