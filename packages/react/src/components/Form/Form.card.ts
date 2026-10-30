import { defineCard } from "../../protocol/card";
import { placement } from "./Form.placement";

export default defineCard({
  // An intent is the screen root, not a slot.
  role: null,
  use: "One task with grouped fields and one submit action, such as checkout, booking or sign-up.",
  instead: {
    Settings: "each section saves on its own or holds a managed list",
    Dialog: "the task interrupts another screen and fits a few fields",
  },
  slots: {
    header: { roles: ["text"], max: 1 },
    body: { roles: ["input", "region", "feedback"] },
    actions: { roles: ["action"], max: 3 },
  },
  requires: ["header", "actions"],
  prompts: {
    pick: ["Book a hotel room: dates, room type and extras, then confirm", "Create an account"],
    nearMiss: {
      Settings: ["Manage notification preferences"],
      Dialog: ["Rename a file from the file list"],
    },
  },
  placement,
});
