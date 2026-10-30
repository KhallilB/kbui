import { defineCard } from "../../protocol/card";
import { placement } from "./FormSection.placement";

export default defineCard({
  role: "region",
  use: "Related fields under a section heading, with their own error and actions.",
  instead: {
    Fieldset: "the group is one question inside a section, named by a legend",
    Card: "the content is not a group of fields",
  },
  slots: {
    fields: { roles: ["input", "data", "feedback"] },
    error: { roles: ["feedback"], max: 1 },
    actions: { roles: ["action"], max: 2 },
  },
  requires: ["title"],
  prompts: {
    pick: ["Email notification settings with a save button", "Dates and guests for a booking"],
    nearMiss: {
      Fieldset: ["Choose a delivery speed"],
      Card: ["Show an order summary"],
    },
  },
  placement,
});
