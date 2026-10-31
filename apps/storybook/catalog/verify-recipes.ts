import assert from "node:assert/strict";
import { chromium } from "playwright";
import { loadRecipeSources } from "./recipes.ts";

const origin = process.env.RECIPE_SITE_URL ?? "http://127.0.0.1:4174";
const browser = await chromium.launch();
const recipes = loadRecipeSources();
let currentPage: import("playwright").Page | undefined;
let checks = 0;
try {
  for (const width of [320, 768, 1280]) {
    for (const theme of ["light", "dark"] as const) {
      const page = await browser.newPage({
        viewport: { width, height: 900 },
        colorScheme: theme,
        reducedMotion: "reduce",
      });
      currentPage = page;
      page.on("pageerror", (error) => console.error(`Recipe page error: ${error.message}`));
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
  currentPage = page;
  page.on("pageerror", (error) => console.error(`Recipe page error: ${error.message}`));
  await page.goto(`${origin}/recipes/`);
  await page.getByRole("link", { name: "ListDetail", exact: true }).click();
  await page.getByRole("heading", { name: "ListDetail", level: 1 }).waitFor();
  await page.getByRole("link", { name: "Empty Queue", exact: true }).click();
  assert.equal(new URL(page.url()).searchParams.get("state"), "recipes-listdetail--empty-queue");
  await page.reload();
  await page
    .frameLocator("iframe[data-current='true']")
    .getByRole("heading", { name: "No requests yet" })
    .waitFor()
    .catch(async (error: unknown) => {
      const frames = await Promise.all(
        page.frames().map(async (frame) => ({
          url: frame.url(),
          text: await frame
            .locator("body")
            .innerText({ timeout: 1000 })
            .then((text) => text.slice(0, 600))
            .catch(() => "<unavailable>"),
        })),
      );
      console.error("Recipe refresh failed", { url: page.url(), frames });
      throw error;
    });
  await page.goBack();
  assert.equal(new URL(page.url()).searchParams.get("state"), null);
  await page.goForward();
  assert.equal(new URL(page.url()).searchParams.get("state"), "recipes-listdetail--empty-queue");
  await page.goto(`${origin}/recipes/?recipe=listdetail&state=missing`);
  await page.getByRole("status").filter({ hasText: "That example is unavailable" }).waitFor();
  await page.goto(`${origin}/recipes/?recipe=missing`);
  await page.getByRole("heading", { name: "Recipe unavailable" }).waitFor();
  for (const retired of ["pageheader", "formsection"]) {
    await page.goto(`${origin}/recipes/?recipe=${retired}#usage`);
    await page.waitForURL(`${origin}/components/?component=${retired}#usage`);
  }
  for (const recipe of recipes) {
    await page.goto(`${origin}/storybook/?path=/docs/${recipe.docsId}`);
    const docs = page.frameLocator("#storybook-preview-iframe");
    await docs.getByRole("heading", { level: 1, name: `${recipe.name} recipe` }).waitFor();
    await docs.getByRole("heading", { name: "Runnable examples", exact: true }).waitFor();
    await docs.getByRole("heading", { name: "Copy the source", exact: true }).waitFor();
    if (recipe.name === "ListDetail") {
      const componentLink = docs.getByRole("link", { name: "PageHeader", exact: true }).first();
      assert.equal(await componentLink.getAttribute("target"), "_top");
      await componentLink.click();
      await page.waitForURL(`${origin}/components/?component=pageheader`);
    }
    checks++;
  }
  await page.goto(`${origin}/recipes/?recipe=listdetail&theme=light`);
  const preview = page.frameLocator("iframe[data-current='true']");
  const name = preview.getByRole("searchbox", { name: "Search requests" });
  await name.fill("Retained draft");
  await page.getByRole("switch", { name: "Dark mode" }).check();
  await preview.locator("html[data-theme='dark']").waitFor();
  assert.equal(await name.inputValue(), "Retained draft");
  if (recipes.some((recipe) => recipe.id === "listdetail")) {
    await page.goto(
      `${origin}/storybook/iframe.html?id=recipes-listdetail--request-queue&viewMode=story&request=REQ-1043`,
    );
    await page
      .getByRole("heading", { name: "Replace loading dock scanner", exact: true })
      .waitFor();
    await page.reload();
    await page
      .getByRole("heading", { name: "Replace loading dock scanner", exact: true })
      .waitFor();
    assert.equal(new URL(page.url()).searchParams.get("request"), "REQ-1043");
    await page.getByRole("button", { name: "Back to requests" }).click();
    await page.getByRole("button", { name: /REQ-1042.*Warehouse access/ }).click();
    await page.getByRole("heading", { name: "Warehouse access", exact: true }).waitFor();
    await page.goBack();
    await page.getByRole("heading", { name: "Choose a request" }).waitFor();
    await page.goForward();
    await page.getByRole("heading", { name: "Warehouse access", exact: true }).waitFor();
    checks++;
  }
  await page.close();
  console.log(
    `Recipes verified: ${checks} theme/viewport and Storybook contexts; refresh, history, unknown and retired URLs and draft-preserving theme changes.`,
  );
} catch (error) {
  if (currentPage && !currentPage.isClosed()) {
    console.error(`Recipe failure URL: ${currentPage.url()}`);
    for (const frame of currentPage.frames()) {
      console.error(
        `Frame ${frame.url()}: ${(
          await frame
            .locator("body")
            .innerText()
            .catch(() => "unavailable")
        ).slice(0, 2000)}`,
      );
    }
  }
  throw error;
} finally {
  await browser.close();
}
