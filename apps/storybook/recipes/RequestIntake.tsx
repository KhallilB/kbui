// x-release-please-start-version
// kbui recipe RequestIntake · from kbui 0.11.0 · https://kbui.kcb.pro/recipes/?recipe=requestintake
// x-release-please-end
import {
  Button,
  Callout,
  Combobox,
  DescriptionList,
  ErrorSummary,
  Fieldset,
  Form,
  FormActions,
  Heading,
  Input,
  MultiSelect,
  PageHeader,
  Textarea,
} from "@kb.ui/react";
import { useEffect, useId, useRef, useState } from "react";
import {
  type PreparedRequest,
  prepareRequest,
  type RequestDraft,
  type RequestErrors,
  type RequestPerson,
  type RequestValidation,
} from "./request-intake-model";
import "./request-intake.css";

const samplePeople: readonly RequestPerson[] = [
  { id: "ada", name: "Ada Chen" },
  { id: "luis", name: "Luis Rivera" },
  { id: "sam", name: "Sam Okafor" },
];
const emptyDraft = (): RequestDraft => ({
  title: "",
  description: "",
  ownerId: null,
  reviewerIds: [],
});

export interface RequestIntakeProps {
  people?: readonly RequestPerson[];
  validate?: RequestValidation;
}

export function RequestIntake({ people = samplePeople, validate }: RequestIntakeProps) {
  const id = useId();
  const [draft, setDraft] = useState(emptyDraft);
  const [errors, setErrors] = useState<RequestErrors>({});
  const [prepared, setPrepared] = useState<PreparedRequest | null>(null);
  const summary = useRef<HTMLDivElement>(null);
  const result = useRef<HTMLHeadingElement>(null);
  const title = useRef<HTMLInputElement>(null);
  const focus = useRef<"errors" | "result" | "title" | null>(null);
  useEffect(() => {
    // Only task transitions move focus; editing keeps current control.
    if (focus.current === "errors") summary.current?.focus();
    if (focus.current === "result") result.current?.focus();
    if (focus.current === "title") title.current?.focus();
    focus.current = null;
  });
  const update = <K extends keyof RequestDraft>(field: K, value: RequestDraft[K]) => {
    setDraft((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      const next = { ...current };
      delete next[field];
      return next;
    });
  };
  const options = people.map(({ id, name }) => ({ value: id, label: name }));
  const emptyMessage = people.length
    ? "No matching people. Try another name."
    : "No people available. Ask your app to supply a directory.";
  return (
    <main className="request-intake">
      {prepared ? (
        <div className="request-intake-result">
          <Heading level={1} ref={result} tabIndex={-1}>
            Request prepared
          </Heading>
          <Callout title="Ready for your review" tone="success">
            Nothing was sent or saved to a server.
          </Callout>
          <DescriptionList aria-label="Prepared request">
            <DescriptionList.Item>
              <DescriptionList.Term>Title</DescriptionList.Term>
              <DescriptionList.Detail>{prepared.title}</DescriptionList.Detail>
            </DescriptionList.Item>
            <DescriptionList.Item>
              <DescriptionList.Term>Description</DescriptionList.Term>
              <DescriptionList.Detail className="request-intake-description">
                {prepared.description || "No description supplied."}
              </DescriptionList.Detail>
            </DescriptionList.Item>
            <DescriptionList.Item>
              <DescriptionList.Term>Owner</DescriptionList.Term>
              <DescriptionList.Detail>{prepared.owner.name}</DescriptionList.Detail>
            </DescriptionList.Item>
            <DescriptionList.Item>
              <DescriptionList.Term>Reviewers</DescriptionList.Term>
              <DescriptionList.Detail>
                {prepared.reviewers.map((person) => person.name).join(", ") ||
                  "No reviewers selected."}
              </DescriptionList.Detail>
            </DescriptionList.Item>
          </DescriptionList>
          <FormActions>
            <Button
              type="button"
              onClick={() => {
                focus.current = "title";
                setPrepared(null);
              }}
            >
              Edit draft
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                focus.current = "title";
                setDraft(emptyDraft());
                setErrors({});
                setPrepared(null);
              }}
            >
              Start another request
            </Button>
          </FormActions>
        </div>
      ) : (
        <Form
          aria-label="Prepare a request"
          noValidate
          header={
            <PageHeader
              title="Prepare a request"
              description="Describe the work and choose who owns it. Review a local summary before connecting your own service."
            />
          }
          actions={<Button type="submit">Prepare request</Button>}
          onSubmit={(event) => {
            event.preventDefault();
            const next = prepareRequest(draft, people, validate);
            if (!next.ok) {
              focus.current = "errors";
              setErrors(next.errors);
              return;
            }
            focus.current = "result";
            setErrors({});
            setPrepared(next.request);
          }}
        >
          <ErrorSummary
            ref={summary}
            title="Review request details"
            headingLevel={2}
            items={Object.entries(errors).map(([field, label]) => ({
              href: `#${id}-${field}`,
              label,
            }))}
          />
          <Fieldset legend="Request details">
            <Input
              id={`${id}-title`}
              ref={title}
              label="Request title"
              name="title"
              required
              value={draft.title}
              onChange={(event) => update("title", event.target.value)}
              {...(errors.title ? { error: errors.title } : {})}
            />
            <Textarea
              id={`${id}-description`}
              label="Description"
              name="description"
              value={draft.description}
              error={errors.description}
              onChange={(event) => update("description", event.target.value)}
            />
          </Fieldset>
          <Fieldset legend="Assignment">
            <Combobox
              id={`${id}-ownerId`}
              label="Owner"
              name="owner"
              required
              options={options}
              value={draft.ownerId}
              onValueChange={(value) => update("ownerId", value)}
              emptyMessage={emptyMessage}
              error={errors.ownerId}
              description="Search the current directory for one owner."
            />
            <MultiSelect
              id={`${id}-reviewerIds`}
              label="Reviewers"
              name="reviewers"
              options={options}
              value={draft.reviewerIds}
              onValueChange={(value) => update("reviewerIds", value)}
              emptyMessage={emptyMessage}
              error={errors.reviewerIds}
              description="Optional. Choose people to review this request."
            />
          </Fieldset>
        </Form>
      )}
    </main>
  );
}
