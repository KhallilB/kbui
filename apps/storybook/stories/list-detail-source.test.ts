import { expect, test } from "bun:test";
import { loadRecipeSources } from "../catalog/recipes";

test("ListDetail exposes a runnable public-component composition with every local dependency", () => {
  const recipe = loadRecipeSources().find((entry) => entry.id === "listdetail");
  expect(recipe?.defaultStoryId).toBe("recipes-listdetail--request-queue");
  expect(recipe?.files.map((file) => file.name)).toEqual(["ListDetail.tsx", "list-detail.css"]);
  expect(recipe?.stories.map((story) => story.exportName)).toContain("EditAndValidate");
});
