export type RequestPerson = { id: string; name: string };
export type RequestAttachment = { id: string; file: File };
export type RequestDraft = {
  title: string;
  description: string;
  ownerId: string | null;
  reviewerIds: string[];
  quantity: number | null;
  attachments: RequestAttachment[];
};
export type RequestErrors = Partial<Record<keyof RequestDraft, string>>;
export type RequestValidation = (draft: Readonly<RequestDraft>) => RequestErrors;
export type PreparedRequest = {
  title: string;
  description: string;
  owner: RequestPerson;
  reviewers: RequestPerson[];
  quantity: number;
  attachments: RequestAttachment[];
};

export const requestIntakePolicy = {
  minQuantity: 1,
  maxQuantity: 100,
  maxAttachments: 3,
  maxAttachmentBytes: 5 * 1024 * 1024,
  attachmentTypes: ["application/pdf", "image/png", "image/jpeg"],
} as const;

const attachmentError = (file: File): string | null => {
  if (!requestIntakePolicy.attachmentTypes.some((type) => type === file.type))
    return `${file.name}: choose PDF, PNG or JPEG.`;
  if (file.size > requestIntakePolicy.maxAttachmentBytes)
    return `${file.name}: choose a file no larger than 5 MiB.`;
  return null;
};

export function addAttachments(
  current: readonly RequestAttachment[],
  incoming: readonly File[],
  makeId: () => string,
): { attachments: RequestAttachment[]; rejections: string[] } {
  const attachments = [...current];
  const rejections: string[] = [];
  for (const file of incoming) {
    const error = attachmentError(file);
    if (error) rejections.push(error);
    else if (attachments.length >= requestIntakePolicy.maxAttachments)
      rejections.push(`${file.name}: keep at most 3 attachments; remove one first.`);
    else attachments.push({ id: makeId(), file });
  }
  return { attachments, rejections };
}
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
  if (
    draft.quantity === null ||
    !Number.isInteger(draft.quantity) ||
    draft.quantity < requestIntakePolicy.minQuantity ||
    draft.quantity > requestIntakePolicy.maxQuantity
  )
    errors.quantity = "Enter a whole quantity from 1 to 100.";
  const attachmentErrors = draft.attachments
    .map(({ file }) => attachmentError(file))
    .filter(Boolean);
  if (attachmentErrors.length) errors.attachments = attachmentErrors.join(" ");
  if (draft.attachments.length > requestIntakePolicy.maxAttachments)
    errors.attachments = "Keep at most 3 attachments; remove one first.";
  if (Object.keys(errors).length || !owner || draft.quantity === null) return { ok: false, errors };
  return {
    ok: true,
    request: {
      title: draft.title.trim(),
      description: draft.description.trim(),
      owner: { ...owner },
      reviewers: reviewers
        .filter((person): person is RequestPerson => Boolean(person))
        .map((person) => ({ ...person })),
      quantity: draft.quantity,
      attachments: draft.attachments.map((attachment) => ({ ...attachment })),
    },
  };
}
