export type RequestPerson = { id: string; name: string };
export type RequestDraft = {
  title: string;
  description: string;
  ownerId: string | null;
  reviewerIds: string[];
};
export type RequestErrors = Partial<Record<keyof RequestDraft, string>>;
export type RequestValidation = (draft: Readonly<RequestDraft>) => RequestErrors;
export type PreparedRequest = {
  title: string;
  description: string;
  owner: RequestPerson;
  reviewers: RequestPerson[];
};
export function prepareRequest(
  draft: RequestDraft,
  people: readonly RequestPerson[],
  validate: RequestValidation = () => ({}),
): { ok: false; errors: RequestErrors } | { ok: true; request: PreparedRequest } {
  const errors: RequestErrors = { ...validate(draft) };
  const owner = people.find((person) => person.id === draft.ownerId);
  const reviewers = draft.reviewerIds.map((id) => people.find((person) => person.id === id));
  if (!draft.title.trim()) errors.title = "Enter a request title.";
  if (!draft.ownerId) errors.ownerId = "Choose a request owner.";
  else if (!owner) errors.ownerId = "Choose an owner from the current directory.";
  if (reviewers.some((person) => !person))
    errors.reviewerIds = "Choose reviewers from the current directory or clear the selection.";
  if (Object.keys(errors).length || !owner) return { ok: false, errors };
  return {
    ok: true,
    request: {
      title: draft.title.trim(),
      description: draft.description.trim(),
      owner: { ...owner },
      reviewers: reviewers
        .filter((person): person is RequestPerson => Boolean(person))
        .map((person) => ({ ...person })),
    },
  };
}
