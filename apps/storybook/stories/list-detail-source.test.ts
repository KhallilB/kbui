import { expect, test } from "bun:test";
import { loadRecipeSources } from "../catalog/recipes";
import {
  type CommitResult,
  errorFocusTarget,
  isFocusDisconnected,
  nextNotice,
  takeFocusTarget,
  without,
} from "../recipes/flow-router";

test("ListDetail exposes a runnable public-component composition with every local dependency", () => {
  const recipe = loadRecipeSources().find((entry) => entry.id === "listdetail");
  expect(recipe?.defaultStoryId).toBe("recipes-listdetail--request-queue");
  expect(recipe?.files.map((file) => file.name)).toEqual([
    "ListDetail.tsx",
    "flow-router.ts",
    "list-detail-controller.ts",
    "list-detail.css",
  ]);
  expect(recipe?.stories.map((story) => story.exportName)).toContain("EditAndValidate");
  const source = recipe?.files.find((file) => file.name === "ListDetail.tsx")?.sample.code ?? "";
  expect(source).not.toContain("export type CommitResult<");
  expect(source).not.toContain("function without<");
  expect(source).toContain("useListDetailFlow");
  const controller =
    recipe?.files.find((file) => file.name === "list-detail-controller.ts")?.sample.code ?? "";
  expect(controller).toContain("useAnnounce");
  expect(controller).toContain("errorFocusTarget");
  expect(controller).toContain("takeFocusTarget");
  expect(controller).toContain("observeHiddenFocus");
});

test("flow-router helpers advance announcements and resolve focus targets deterministically", () => {
  const ok: CommitResult<"title" | "owner"> = undefined;
  const refused: CommitResult<"title" | "owner"> = { errors: { form: "Denied" } };
  expect(ok).toBeUndefined();
  expect(refused.errors.form).toBe("Denied");

  const first = nextNotice({ id: 0, text: "" }, "REQ-1042 saved.");
  const repeated = nextNotice(first, "REQ-1042 saved.");
  expect(first).toEqual({ id: 1, text: "REQ-1042 saved." });
  expect(repeated).toEqual({ id: 2, text: "REQ-1042 saved." });

  const fields = ["title", "owner", "status"] as const;
  expect(errorFocusTarget({ owner: "Required", status: "Invalid" }, fields)).toBe("owner");
  expect(errorFocusTarget({ form: "Permission denied" }, fields)).toBe("submit");

  const targetRef: { current: "heading" | "list" | null } = { current: "heading" };
  expect(takeFocusTarget(targetRef, true)).toBeNull();
  expect(targetRef.current).toBe("heading");
  expect(takeFocusTarget(targetRef, false)).toBe("heading");
  expect(targetRef.current).toBeNull();

  expect(isFocusDisconnected(null, { isConnected: true } as Element)).toBe(false);
  expect(isFocusDisconnected({ isConnected: false } as Element)).toBe(true);
  expect(without({ a: 1, b: 2 }, "a")).toEqual({ b: 2 });
});
