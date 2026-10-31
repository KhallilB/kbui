import { expect, test } from "bun:test";
import { prepareRequest, type RequestDraft } from "../recipes/request-intake-model";

const people = [
  { id: "ada", name: "Ada Chen" },
  { id: "luis", name: "Luis Rivera" },
] as const;
const draft: RequestDraft = {
  title: "  Equipment for 東京  ",
  description: "  Keep line one.\nKeep line two.  ",
  ownerId: "ada",
  reviewerIds: ["luis"],
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
    },
  });
  expect(draft.title).toBe("  Equipment for 東京  ");
  expect(draft.description).toBe("  Keep line one.\nKeep line two.  ");
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
