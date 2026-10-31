import assert from "node:assert/strict";
import { test } from "playwright/test";
import type { landingProfiles } from "./profiles.ts";
import { siteURL as origin } from "./urls.ts";

for (const theme of ["light", "dark"] as const) {
  test(`landing interactions and layout in ${theme}`, async ({ page }, testInfo) => {
    const profile = testInfo.project.metadata.profile as (typeof landingProfiles)[number];
    await page.goto(`${origin}/?theme=${theme}`);
    const add = page.getByRole("button", { name: "Add an activity" });
    await add.waitFor();
    assert.equal(await page.locator("html").getAttribute("data-theme"), theme);
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      true,
    );
    const about = page.locator(".about-strip");
    await about.scrollIntoViewIfNeeded();
    await page.evaluate(() =>
      document
        .querySelector(".about-strip")
        ?.scrollIntoView({ block: "start", behavior: "instant" }),
    );
    if (process.env.LANDING_FAULT === "sticky")
      await page.addStyleTag({
        content: ".kbui-site .site-header { position: static !important; }",
      });
    const header = await page.getByRole("banner").boundingBox();
    const heading = await about.getByRole("heading").boundingBox();
    assert(header && heading);
    assert(Math.abs(header.y) < 1, "Navigation left viewport after scrolling");
    assert(heading.y >= header.y + header.height, "Sticky navigation obscured anchor target");
    if (profile.width > 600) {
      const paragraph = await about.locator(":scope > p").first().boundingBox();
      const badges = await about.getByRole("list").boundingBox();
      assert(paragraph && badges);
      assert(
        Math.abs(heading.x - badges.x) < 1 &&
          paragraph.x > heading.x &&
          paragraph.x + paragraph.width <= badges.x + badges.width + 1,
        "About copy and badges lost alignment",
      );
    }
    const arrowLink = page
      .getByRole("contentinfo")
      .getByRole("link", { name: "Documentation", exact: true });
    await arrowLink.hover();
    assert.equal(await arrowLink.locator("svg.link-arrow").count(), 1);
    assert.equal(await arrowLink.locator("svg").getAttribute("aria-hidden"), "true");
    assert.equal(
      await arrowLink.locator("svg").evaluate((node) => getComputedStyle(node).textDecorationLine),
      "none",
    );
    await add.click();
    const dialog = page.getByRole("dialog", { name: "Make a little room" });
    assert.equal(
      await dialog.evaluate((node) => node.closest(".hero-example") === null),
      true,
      "Modal remains trapped in animated hero stacking context",
    );
    await dialog.getByRole("textbox", { name: "Activity" }).evaluate((node) => {
      const bounds = node.getBoundingClientRect();
      assertOverlay(node, bounds);
      function assertOverlay(element: Element, rect: DOMRect) {
        const hit = document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2);
        if (hit !== element) throw new Error("Hero content paints above dialog input");
      }
    });
    await dialog.getByRole("button", { name: "Add to my day" }).click();
    await dialog.getByText("Enter an activity.").waitFor();
    await dialog.getByRole("textbox", { name: "Activity" }).fill("Visit the bookshop");
    await dialog.getByRole("button", { name: "Add to my day" }).click();
    await dialog.waitFor({ state: "hidden" });
    assert.equal(
      await page.getByRole("checkbox", { name: "Visit the bookshop" }).isChecked(),
      true,
    );
    const toggle = page.getByLabel("Dark mode", { exact: true });
    await toggle.click();
    assert.equal(
      await page.locator("html").getAttribute("data-theme"),
      theme === "light" ? "dark" : "light",
    );
    assert.equal(
      await page.getByRole("checkbox", { name: "Visit the bookshop" }).isChecked(),
      true,
    );
    assert.equal(await toggle.evaluate((node) => node.matches(":focus-visible")), false);
    await toggle.focus();
    await page.keyboard.press("Tab");
    await page.waitForFunction(() => document.activeElement?.matches(":focus-visible"));
    const keyboardFocus = await page.evaluate(() => {
      const node = document.activeElement;
      if (!node) return null;
      const bounds = node.getBoundingClientRect();
      return {
        visible: node.matches(":focus-visible"),
        outline: getComputedStyle(node).outlineStyle,
        top: bounds.top,
        tag: node.tagName,
        label: node.getAttribute("aria-label"),
      };
    });
    assert(
      keyboardFocus?.visible && keyboardFocus.outline !== "none",
      `Keyboard focus ring missing: ${JSON.stringify(keyboardFocus)}`,
    );
    assert(keyboardFocus.top >= 0, "Keyboard target scrolled behind viewport");
    await page.getByRole("button", { name: "Start over" }).click();
    assert.equal(await page.locator(".day-choices").getByRole("checkbox").count(), 3);
    await page.screenshot({
      path: `/tmp/kbui-landing-${profile.name}-${theme}.png`,
      fullPage: true,
    });
    console.log(
      `PASS ${profile.name} ${theme}: sticky, alignment, arrows, demo, theme state, focus, reflow`,
    );
  });
}
test.describe("before application scripts", () => {
  test.use({ viewport: { width: 1280, height: 720 } });
  test("stored theme and URL override", async ({ page: early }, testInfo) => {
    const profile = testInfo.project.metadata.profile as (typeof landingProfiles)[number];
    await early.addInitScript(() => localStorage.setItem("kbui.theme", "dark"));
    await early.route("**/*", async (route) =>
      route.request().resourceType() === "script" ? route.abort() : route.continue(),
    );
    await early.goto(`${origin}/`, { waitUntil: "load" });
    assert.equal(
      await early.locator("html").getAttribute("data-theme"),
      "dark",
      "Stored theme requires application JavaScript",
    );
    assert.equal(
      await early.locator("html").evaluate((node) => getComputedStyle(node).colorScheme),
      "dark",
    );
    await early.goto(`${origin}/?theme=light`, { waitUntil: "load" });
    assert.equal(
      await early.locator("html").getAttribute("data-theme"),
      "light",
      "Query theme must override storage before application loads",
    );
    console.log(`PASS ${profile.name}: theme applied with application scripts blocked`);
  });
});
