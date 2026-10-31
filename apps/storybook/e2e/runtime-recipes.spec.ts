import assert from "node:assert/strict";
import { expect, test } from "playwright/test";
import { siteURL as origin } from "./urls.ts";

test.use({ viewport: { width: 567, height: 900 } });
test("legacy Input URL and settled recipe height", async ({ page, browserName }) => {
  await page.goto(`${origin}/components/?component=input&state=components-input--with-adornments`);
  await expect(page.getByRole("radio", { name: "Icons and actions", exact: true })).toBeChecked();
  await expect(page.locator('iframe[data-current="true"]')).toHaveAttribute(
    "data-preview-src",
    /id=components-input--with-icons-and-actions&/,
  );
  await expect(page.getByText(/no longer exists/)).toHaveCount(0);
  assert.equal(
    new URL(page.url()).searchParams.get("state"),
    "components-input--with-adornments",
    "Legacy recipe navigation rewrote its shareable URL",
  );
  console.log(
    `${browserName}: legacy Input recipe URL selects canonical icons/actions without recovery.`,
  );
  await page.goto(
    `${origin}/components/?component=input&state=components-input--with-icons-and-actions`,
  );
  await page.waitForFunction(() => {
    const frame = document.querySelector<HTMLIFrameElement>('iframe[data-current="true"]');
    const doc = frame?.contentDocument;
    return (
      frame &&
      doc?.fonts.status === "loaded" &&
      frame.getAttribute("aria-busy") === "false" &&
      doc.documentElement.scrollHeight <= frame.clientHeight + 1
    );
  });
  const dimensions = await page
    .locator('iframe[data-current="true"]')
    .evaluate((frame: HTMLIFrameElement) => ({
      height: frame.clientHeight,
      content: frame.contentDocument?.documentElement.scrollHeight ?? Infinity,
    }));
  assert.ok(
    dimensions.content <= dimensions.height + 1,
    `${browserName} recipe retained vertical scrollbar`,
  );
  console.log(
    `${browserName}567px: Input icons/actions recipe fits settled document height without vertical scrollbar.`,
  );
});
