import assert from "node:assert/strict";
import { chromium } from "playwright";
import { loadRecipeSources } from "./recipes.ts";

const origin = process.env.RECIPE_SITE_URL ?? "http://127.0.0.1:4174";
const browser = await chromium.launch();
const recipes = loadRecipeSources();
let checks = 0;
try {
  for (const width of [320, 768, 1280]) {
    for (const theme of ["light", "dark"] as const) {
      const page = await browser.newPage({
        viewport: { width, height: 900 },
        colorScheme: theme,
        reducedMotion: "reduce",
      });
      page.setDefaultTimeout(15_000);
      await page.goto(`${origin}/recipes/?theme=${theme}`);
      await page.getByRole("heading", { level: 1, name: "Recipes", exact: true }).waitFor();
      const directory = await page.locator("html").evaluate((element) => ({
        scroll: element.scrollWidth,
        width: element.clientWidth,
      }));
      assert.ok(
        directory.scroll <= directory.width + 1,
        `${width}px ${theme} directory: ${JSON.stringify(directory)}`,
      );
      for (const recipe of recipes) {
        await page.goto(`${origin}/recipes/?recipe=${recipe.id}&theme=${theme}`);
        await page.getByRole("heading", { level: 1, name: recipe.name, exact: true }).waitFor();
        const preview = page.frameLocator("iframe[data-current='true']");
        await preview.locator("#storybook-root > *").first().waitFor();
        assert.equal(await preview.locator(".sb-errordisplay").isVisible(), false);
        await preview.locator(`html[data-theme='${theme}']`).waitFor();
        assert.equal(
          await page
            .locator("html")
            .evaluate((element) => element.scrollWidth <= element.clientWidth + 1),
          true,
        );
        assert.equal(
          await preview
            .locator("body")
            .evaluate((element) => element.scrollWidth <= element.clientWidth + 1),
          true,
        );
        await page.getByRole("link", { name: "Copy source files", exact: true }).click();
        await page.getByRole("region", { name: "Recipe source files" }).waitFor();
        checks++;
        console.log(`PASS ${width}px ${theme}: ${recipe.name}`);
      }
      await page.close();
    }
  }
  const page = await browser.newPage({
    viewport: { width: 1280, height: 900 },
    reducedMotion: "reduce",
  });
  await page.goto(`${origin}/recipes/`);
  await page.getByRole("link", { name: "FormSection", exact: true }).click();
  await page.getByRole("heading", { name: "FormSection", level: 1 }).waitFor();
  await page.getByRole("link", { name: "In Panel", exact: true }).click();
  assert.equal(new URL(page.url()).searchParams.get("state"), "recipes-formsection--in-panel");
  await page.reload();
  await page
    .frameLocator("iframe[data-current='true']")
    .getByRole("heading", { name: "Organization profile" })
    .waitFor();
  await page.goBack();
  assert.equal(new URL(page.url()).searchParams.get("state"), null);
  await page.goForward();
  assert.equal(new URL(page.url()).searchParams.get("state"), "recipes-formsection--in-panel");
  await page.goto(`${origin}/recipes/?recipe=formsection&state=missing`);
  await page.getByRole("status").filter({ hasText: "That example is unavailable" }).waitFor();
  await page.goto(`${origin}/recipes/?recipe=missing`);
  await page.getByRole("heading", { name: "Recipe unavailable" }).waitFor();
  for (const recipe of recipes) {
    await page.goto(`${origin}/storybook/?path=/docs/${recipe.docsId}`);
    const docs = page.frameLocator("#storybook-preview-iframe");
    await docs.getByRole("heading", { level: 1, name: `${recipe.name} recipe` }).waitFor();
    await docs.getByRole("heading", { name: "Runnable examples", exact: true }).waitFor();
    await docs.getByRole("heading", { name: "Copy the source", exact: true }).waitFor();
    if (recipe.name === "PageHeader") {
      const headingLink = docs.getByRole("link", { name: "Heading", exact: true }).first();
      assert.equal(await headingLink.getAttribute("target"), "_top");
      await headingLink.click();
      await page.waitForURL(`${origin}/components/?component=heading`);
    }
    checks++;
  }
  await page.goto(`${origin}/recipes/?recipe=formsection&theme=light`);
  const preview = page.frameLocator("iframe[data-current='true']");
  const name = preview.getByRole("textbox", { name: "Contact name" });
  await name.fill("Retained draft");
  await page.getByRole("switch", { name: "Dark mode" }).check();
  await preview.locator("html[data-theme='dark']").waitFor();
  assert.equal(await name.inputValue(), "Retained draft");
  await page.close();
  console.log(
    `Recipes verified: ${checks} theme/viewport and Storybook contexts; refresh, history, unknown URLs and draft-preserving theme changes.`,
  );
} finally {
  await browser.close();
}
