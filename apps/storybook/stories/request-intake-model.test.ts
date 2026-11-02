import { expect, test } from "bun:test";
import { addAttachments, prepareRequest, type RequestDraft } from "../recipes/request-intake-model";

const people = [
  { id: "ada", name: "Ada Chen" },
  { id: "luis", name: "Luis Rivera" },
] as const;
const draft: RequestDraft = {
  title: "  Equipment for 東京  ",
  description: "  Keep line one.\nKeep line two.  ",
  ownerId: "ada",
  reviewerIds: ["luis"],
  quantity: 1,
  attachments: [],
};

test("missing required values produce field errors without changing draft", () => {
  const invalid = { ...draft, title: " \n ", ownerId: null };
  expect(prepareRequest(invalid, people)).toEqual({
    ok: false,
    errors: { title: "Enter a request title.", ownerId: "Choose a request owner." },
  });
  expect(invalid.title).toBe(" \n ");
  expect(invalid.reviewerIds).toEqual(["luis"]);
});

test("stale owner and reviewer IDs need correction rather than silent omission", () => {
  expect(
    prepareRequest({ ...draft, ownerId: "gone", reviewerIds: ["luis", "gone"] }, people),
  ).toEqual({
    ok: false,
    errors: {
      ownerId: "Choose an owner from the current directory.",
      reviewerIds: "Choose reviewers from the current directory or clear the selection.",
    },
  });
});

test("prepared snapshot trims edges and resolves names without mutating draft", () => {
  expect(prepareRequest(draft, people)).toEqual({
    ok: true,
    request: {
      title: "Equipment for 東京",
      description: "Keep line one.\nKeep line two.",
      owner: people[0],
      reviewers: [people[1]],
      quantity: 1,
      attachments: [],
    },
  });
  expect(draft.title).toBe("  Equipment for 東京  ");
  expect(draft.description).toBe("  Keep line one.\nKeep line two.  ");
});

test("quantity accepts only whole numbers from 1 through 100", () => {
  for (const quantity of [null, 0, -1, 101, 1.5, Number.NaN, Number.POSITIVE_INFINITY])
    expect(prepareRequest({ ...draft, quantity }, people)).toEqual({
      ok: false,
      errors: { quantity: "Enter a whole quantity from 1 to 100." },
    });
  for (const quantity of [1, 100])
    expect(prepareRequest({ ...draft, quantity }, people)).toMatchObject({
      ok: true,
      request: { quantity },
    });
});

const file = (name: string, type = "application/pdf", bytes = 1) =>
  new File([new Uint8Array(bytes)], name, { type });

test("mixed selection rejects unsupported MIME and oversize files, retaining originals", () => {
  let sequence = 0;
  const accepted = file("proposal.pdf");
  const png = file("diagram.png", "image/png", 5 * 1024 * 1024);
  const result = addAttachments(
    [],
    [
      accepted,
      file("pretend.pdf", "text/plain"),
      file("large.jpg", "image/jpeg", 5 * 1024 * 1024 + 1),
      png,
    ],
    () => `item-${++sequence}`,
  );
  expect(result.rejections).toEqual([
    "pretend.pdf: choose PDF, PNG or JPEG.",
    "large.jpg: choose a file no larger than 5 MiB.",
  ]);
  expect(result.attachments.map((item) => item.id)).toEqual(["item-1", "item-2"]);
  expect(result.attachments[0]?.file).toBe(accepted);
  expect(result.attachments[1]?.file).toBe(png);
});

test("count applies across selections; duplicate names keep independent IDs and removals", () => {
  let sequence = 0;
  const first = addAttachments(
    [],
    [file("same.pdf"), file("same.pdf")],
    () => `item-${++sequence}`,
  );
  const third = file("photo.jpg", "image/jpeg");
  const second = addAttachments(
    first.attachments,
    [third, file("extra.pdf")],
    () => `item-${++sequence}`,
  );
  expect(second.rejections).toEqual(["extra.pdf: keep at most 3 attachments; remove one first."]);
  expect(second.attachments[0]).toBe(first.attachments[0]);
  expect(second.attachments[1]).toBe(first.attachments[1]);
  expect(second.attachments[2]?.file).toBe(third);
  const retained = second.attachments.filter((item) => item.id !== "item-1");
  expect(retained.map((item) => item.id)).toEqual(["item-2", "item-3"]);
  const replacement = file("same.pdf");
  const final = addAttachments(retained, [replacement], () => `item-${++sequence}`);
  expect(final.rejections).toEqual([]);
  expect(final.attachments[0]?.file).toBe(first.attachments[1]?.file);
  expect(final.attachments[2]).toEqual({ id: "item-4", file: replacement });
  const prepared = prepareRequest({ ...draft, attachments: final.attachments }, people);
  expect(prepared.ok).toBe(true);
  if (!prepared.ok) throw new Error("Expected valid request");
  expect(prepared.request.attachments[2]?.file).toBe(replacement);
});

test("rejected-only and empty selections keep accepted identities and consume no IDs", () => {
  const original = { id: "original", file: file("kept.pdf") };
  let calls = 0;
  const result = addAttachments([original], [file("unknown.pdf", "")], () => `${++calls}`);
  expect(result.rejections).toEqual(["unknown.pdf: choose PDF, PNG or JPEG."]);
  expect(result.attachments).toEqual([original]);
  expect(result.attachments[0]).toBe(original);
  expect(addAttachments(result.attachments, [], () => `${++calls}`).attachments[0]).toBe(original);
  expect(calls).toBe(0);
});

test("preparation rechecks attachment policy if a copied app supplies invalid draft files", () => {
  expect(
    prepareRequest(
      { ...draft, attachments: [{ id: "bad", file: file("bad.txt", "text/plain") }] },
      people,
    ),
  ).toEqual({ ok: false, errors: { attachments: "bad.txt: choose PDF, PNG or JPEG." } });
  expect(
    prepareRequest(
      {
        ...draft,
        attachments: [1, 2, 3, 4].map((id) => ({ id: `${id}`, file: file(`${id}.pdf`) })),
      },
      people,
    ),
  ).toEqual({
    ok: false,
    errors: { attachments: "Keep at most 3 attachments; remove one first." },
  });
});

test("reviewers remain optional and may include the owner", () => {
  expect(prepareRequest({ ...draft, reviewerIds: [] }, people)).toMatchObject({
    ok: true,
    request: { reviewers: [] },
  });
  expect(prepareRequest({ ...draft, reviewerIds: ["ada"] }, people)).toMatchObject({
    ok: true,
    request: { reviewers: [people[0]] },
  });
});

test("app validation can reject a draft and succeeds after correction", () => {
  const validate = (value: Readonly<RequestDraft>) =>
    value.description.trim() ? {} : { description: "Explain why this request is needed." };
  expect(prepareRequest({ ...draft, description: "" }, people, validate)).toEqual({
    ok: false,
    errors: { description: "Explain why this request is needed." },
  });
  expect(prepareRequest(draft, people, validate).ok).toBe(true);
});
