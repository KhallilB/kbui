import { expect, test } from "bun:test";
import { guideLink } from "../site/guide-links";

test("canonical guide links keep host prefixes and component or recipe anchors", () => {
  const guide = "docs/guides/inbox.md";
  expect(
    guideLink("../../packages/react/docs/components/Input.md#search-composition", guide, "/kbui/"),
  ).toBe("/kbui/components/?component=input#search-composition");
  expect(guideLink("list-detail.md#contract", guide, "/kbui/")).toBe(
    "/kbui/recipes/?recipe=listdetail#contract",
  );
  expect(guideLink("#verification", guide, "../")).toBe("#verification");
  expect(guideLink("https://www.w3.org/WAI/", guide, "../")).toBe("https://www.w3.org/WAI/");
  expect(guideLink("javascript:alert(1)", guide, "../")).toBe("#");
});

test("maintained composition guides resolve to their copyable recipe pages", () => {
  for (const [file, id] of [
    ["page-header", "pageheader"],
    ["form-section", "formsection"],
  ])
    expect(guideLink(`${file}.md#usage`, "docs/guides/inbox.md", "/kbui/")).toBe(
      `/kbui/recipes/?recipe=${id}#usage`,
    );
});
