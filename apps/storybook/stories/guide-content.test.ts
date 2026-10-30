/// <reference types="vite/client" />
import { expect, test } from "bun:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { GuideContent } from "../site/GuideContent";

test("shared guides render Markdown and let embedded docs navigate the top-level site", () => {
  const html = renderToStaticMarkup(
    createElement(GuideContent, {
      markdown:
        "# Guide\n\nUse [Heading](../../packages/react/docs/components/Heading.md).\n\n<script>alert(1)</script>",
      path: "docs/guides/page-header.md",
      siteRoot: "../",
      linkTarget: "_top",
    }),
  );
  expect(html).toContain('href="../components/?component=heading"');
  expect(html).toContain('target="_top"');
  expect(html).not.toContain("<script>");
  expect(html).not.toContain("<h1>");
});
