import { expect, test } from "bun:test";
import { loadRecipeSources } from "../catalog/recipes";

test("Inbox provides complete public-component source and reply recovery examples", () => {
  const recipe = loadRecipeSources().find((entry) => entry.id === "inbox");
  expect(recipe?.defaultStoryId).toBe("recipes-inbox--correspondence");
  expect(recipe?.files.map((file) => file.name)).toEqual([
    "Inbox.tsx",
    "inbox.css",
    "PageHeader.tsx",
    "recipes.css",
  ]);
  expect(recipe?.stories.map((story) => story.exportName)).toEqual(
    expect.arrayContaining([
      "ReplyAndDrafts",
      "DeliveryRecovery",
      "PendingDelivery",
      "FilterAndHistory",
      "EmptyInbox",
      "MissingMessage",
      "LongLetter",
    ]),
  );
});
