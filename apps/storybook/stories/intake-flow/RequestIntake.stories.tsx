import type { Meta } from "@storybook/react-vite";
import { RequestIntake } from "../../recipes/RequestIntake";
import { flow } from "./contract";
import { flowFacts } from "./facts";

export default {
  title: "Validation/Intake flow/RequestIntake",
  parameters: { layout: "padded" },
} satisfies Meta;

const { story, complete } = flow(
  {
    recipe: "RequestIntake",
    render: ({ emptyDirectory, applicationValidation }) => (
      <RequestIntake
        {...(emptyDirectory ? { people: [] } : {})}
        {...(applicationValidation
          ? {
              validate: (draft) =>
                draft.description.trim()
                  ? {}
                  : { description: "Explain why this request is needed." },
            }
          : {})}
      />
    ),
    fields: {
      title: "Request title",
      description: "Description",
      owner: "Owner",
      reviewers: "Reviewers",
    },
    actions: { prepare: "Prepare request", edit: "Edit draft", reset: "Start another request" },
    result: "Request prepared",
    draft: { title: "Team equipment", description: "Keep delivery together." },
    owner: { query: "Ada", label: "Ada Chen" },
    reviewer: { query: "Luis", label: "Luis Rivera" },
    errors: {
      title: "Enter a request title.",
      owner: "Choose a request owner.",
      description: "Explain why this request is needed.",
      empty: "No people available. Ask your app to supply a directory.",
      noMatch: "No matching people. Try another name.",
    },
  },
  { gaps: flowFacts.RequestIntake.gaps },
);

export const Prepare = story("prepare");
export const Validation = story("validation");
export const Assignment = story("assignment");
export const Edit = story("edit");
export const Reset = story("reset");
export const EmptyDirectory = story("empty-directory");
export const ApplicationValidation = story("application-validation");
complete();
