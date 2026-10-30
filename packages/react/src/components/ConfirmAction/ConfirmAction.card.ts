import { defineCard } from "../../protocol/card";
import { placement } from "./ConfirmAction.placement";

export default defineCard({
  role: "action",
  use: "A destructive action, such as delete, revoke or reset, that runs only after an explicit confirmation.",
  instead: {
    Button: "the action is safe or can be undone",
    Dialog: "the overlay collects input or shows content rather than confirming one action",
  },
  slots: {
    details: { roles: ["text"], max: 1 },
  },
  requires: ["title", "children", "onConfirm"],
  prompts: {
    pick: ["Delete a project from its danger zone", "Remove a team member"],
    nearMiss: {
      Button: ["Archive a message with undo"],
      Dialog: ["Edit a member's role in an overlay"],
    },
  },
  placement,
});
