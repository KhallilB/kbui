import assert from "node:assert/strict";
import { chromium, expect } from "playwright/test";

const origin = process.env.CATALOG_PREVIEW_URL ?? "http://127.0.0.1:4202";
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  let documents = 0;
  page.on("request", (request) => {
    if (request.isNavigationRequest() && request.url().includes("/storybook/iframe.html"))
      documents++;
  });
  await page.goto(`${origin}/components/?component=input&view=directory`);
  const frame = (name: string) => page.frameLocator(`iframe[title="Input — ${name} live example"]`);
  const input = (name: string) => frame(name).getByRole("textbox", { name: "Email", exact: true });
  await input("Default").fill("retained@example.com");
  await frame("Default")
    .locator("html")
    .evaluate((root) => (root.dataset.instance = "original"));
  await page.getByRole("button", { name: "With Error", exact: true }).click();
  await page.getByText("Loading live example…", { exact: true }).waitFor({ state: "hidden" });
  await input("With Error").fill("error@example.com");
  await page.getByRole("button", { name: "Default", exact: true }).click();
  await page.getByText("Loading live example…", { exact: true }).waitFor({ state: "hidden" });
  assert.equal(
    await input("Default").inputValue(),
    "retained@example.com",
    "A-B-A erased the edited draft",
  );
  assert.equal(
    await frame("Default").locator("html").getAttribute("data-instance"),
    "original",
    "A-B-A replaced the cached document",
  );
  assert.equal(documents, 2, "Returning to a cached state navigated a document");
  await page.goBack();
  await expect(page.locator('iframe[data-current="true"]')).toHaveAttribute(
    "title",
    "Input — With Error live example",
  );
  await expect(page.locator('iframe[data-current="true"]')).toHaveAttribute("aria-busy", "false");
  assert.equal(
    await input("With Error").inputValue(),
    "error@example.com",
    "Back erased the previous state's draft",
  );
  await page.goForward();
  await expect(page.locator('iframe[data-current="true"]')).toHaveAttribute(
    "title",
    "Input — Default live example",
  );
  await expect(page.locator('iframe[data-current="true"]')).toHaveAttribute("aria-busy", "false");
  assert.equal(documents, 2, "History restoration navigated a cached document");
  await input("Default").focus();
  const state = new URL(page.url()).searchParams.get("state");
  await page
    .getByRole("button", { name: "Dark mode" })
    .evaluate((button) => (button as HTMLButtonElement).click());
  await expect(frame("Default").locator("html")).toHaveAttribute("data-theme", "dark");
  assert.equal(
    await frame("Default").locator("html").getAttribute("data-instance"),
    "original",
    "Theme replaced the document",
  );
  await expect(input("Default")).toBeFocused();
  assert.equal(
    new URL(page.url()).searchParams.get("state"),
    state,
    "Theme altered selected state",
  );
  assert.equal(documents, 2, "Theme navigated a document");
  await page.getByRole("button", { name: "Reload preview" }).click();
  await expect(page.locator('iframe[data-current="true"]')).toHaveAttribute("aria-busy", "false");
  assert.equal(await input("Default").inputValue(), "", "Explicit reload kept old draft");
  assert.equal(
    await frame("Default").locator("html").getAttribute("data-instance"),
    null,
    "Reload kept old document",
  );
  assert.equal(
    await input("With Error").inputValue(),
    "error@example.com",
    "Reload reset another cached state",
  );
  assert.equal(documents, 3, "Explicit reload did not create exactly one document");
  console.log("Runtime retention: A-B-A preserves draft and document without a third navigation.");
  console.log(
    "History, theme and reload: selection, focus and unrelated drafts preserved; reload resets selected document.",
  );
  await page.goto(`${origin}/components/?component=button&view=directory`);
  const states = page.locator(".catalog-states button");
  const count = await states.count();
  assert.ok(count > 6, "Bounded-cache probe needs more states than capacity");
  for (let index = 0; index < count; index++) {
    await states.nth(index).click();
    await expect(page.locator('iframe[data-current="true"]')).toHaveAttribute("aria-busy", "false");
    assert.ok(
      (await page.locator(".catalog-preview-frame iframe").count()) <= 6,
      "Preview cache exceeded six documents",
    );
  }
  console.log(
    "Bounded retention: visiting all Button examples never exceeds six preview documents.",
  );
  await page.goto(`${origin}/components/?component=input&view=directory`);
  await input("Default").waitFor();
  let release!: () => void;
  let arrived!: () => void;
  const held = new Promise<void>((resolve) => (release = resolve));
  const requested = new Promise<void>((resolve) => (arrived = resolve));
  await page.route("**/iframe.html?**", async (route) => {
    if (!route.request().url().includes("id=components-input--with-description"))
      return route.continue();
    arrived();
    await held;
    await route.fulfill({
      contentType: "text/html",
      body: '<html><body><div id="storybook-root"><input aria-label="Late autofocus" autofocus></div></body></html>',
    });
  });
  await page.getByRole("button", { name: "With Description", exact: true }).click();
  await requested;
  const old = page.locator('iframe[title="Input — Default live example"]');
  await expect(old).toHaveAttribute("data-visible", "true");
  await expect(old).toHaveAttribute("inert");
  await page.getByRole("button", { name: "With Error", exact: true }).click();
  const chosen = page.getByRole("button", { name: "With Error", exact: true });
  await expect(page.locator('iframe[data-current="true"]')).toHaveAttribute("aria-busy", "false");
  const scroll = await page.evaluate(() => scrollY);
  release();
  await page
    .frameLocator('iframe[title="Input — With Description live example"]')
    .getByRole("textbox")
    .waitFor({ state: "attached" });
  await page.waitForFunction(
    () =>
      document
        .querySelector('iframe[title="Input — With Description live example"]')
        ?.getAttribute("data-visible") === "false",
  );
  await expect(page.locator('iframe[data-visible="true"]')).toHaveAttribute(
    "title",
    "Input — With Error live example",
  );
  await expect(chosen).toBeFocused();
  assert.equal(await page.evaluate(() => scrollY), scroll, "Late hidden preview scrolled parent");
  console.log(
    "Rapid selection: late A cannot override B, autofocus hidden frame, or scroll parent.",
  );
  await page.close();
} finally {
  await browser.close();
}
