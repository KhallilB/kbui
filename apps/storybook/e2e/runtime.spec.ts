import assert from "node:assert/strict";
import { expect, test } from "playwright/test";
import { chooseRadio, radioChoice } from "../catalog/native-controls.ts";
import { siteURL as origin } from "./urls.ts";

test.use({ viewport: { width: 1280, height: 900 } });
test("cached documents, drafts, focus and comparison history", async ({ page }) => {
  test.setTimeout(180_000);
  let documents = 0;
  page.on("request", (request) => {
    if (request.isNavigationRequest() && request.url().includes("/storybook/iframe.html"))
      documents++;
  });
  await page.goto(`${origin}/components/?component=input&view=directory`);
  const detail = page.locator(".catalog-detail:visible");
  const frame = (name: string) =>
    detail.frameLocator(`iframe[title="Input — ${name} live example"]`);
  const input = (name: string) => frame(name).getByRole("textbox", { name: "Email", exact: true });
  assert.equal(
    new URL(page.url()).searchParams.has("view"),
    false,
    "Legacy directory URL was not normalized",
  );
  await expect(page.getByRole("radiogroup", { name: "Catalog view", exact: true })).toHaveCount(0);
  await input("Default").fill("retained@example.com");
  await frame("Default")
    .locator("html")
    .evaluate((root) => (root.dataset.instance = "original"));
  await chooseRadio(page, "Example state", "With Error");
  await page.getByText("Loading live example…", { exact: true }).waitFor({ state: "hidden" });
  await input("With Error").fill("error@example.com");
  await chooseRadio(page, "Example state", "Default");
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
  await expect(detail.locator('iframe[data-current="true"]')).toHaveAttribute(
    "title",
    "Input — With Error live example",
  );
  await expect(detail.locator('iframe[data-current="true"]')).toHaveAttribute("aria-busy", "false");
  assert.equal(
    await input("With Error").inputValue(),
    "error@example.com",
    "Back erased the previous state's draft",
  );
  await page.goForward();
  await expect(detail.locator('iframe[data-current="true"]')).toHaveAttribute(
    "title",
    "Input — Default live example",
  );
  await expect(detail.locator('iframe[data-current="true"]')).toHaveAttribute("aria-busy", "false");
  assert.equal(documents, 2, "History restoration navigated a cached document");
  await input("Default").focus();
  const state = new URL(page.url()).searchParams.get("state");
  await page
    .getByLabel("Dark mode", { exact: true })
    .evaluate((button) => (button as HTMLElement).click());
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
  await expect(detail.locator('iframe[data-current="true"]')).toHaveAttribute("aria-busy", "false");
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
  await page.goto(`${origin}/components/?component=button`);
  const states = page
    .getByRole("radiogroup", { name: "Example state", exact: true })
    .getByRole("radio");
  const count = await states.count();
  assert.ok(count > 6, "Bounded-cache probe needs more states than capacity");
  for (let index = 0; index < count; index++) {
    await states.nth(index).locator("xpath=ancestor::label[1]").click();
    await expect(detail.locator('iframe[data-current="true"]')).toHaveAttribute(
      "aria-busy",
      "false",
    );
    assert.ok(
      (await detail.locator(".catalog-preview-frame iframe").count()) <= 6,
      "Preview cache exceeded six documents",
    );
  }
  console.log(
    "Bounded retention: visiting all Button examples never exceeds six preview documents.",
  );
  await page.goto(`${origin}/components/?component=input`);
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
  await chooseRadio(page, "Example state", "With Description");
  await requested;
  const old = detail.locator('iframe[title="Input — Default live example"]');
  await expect(old).toHaveAttribute("data-visible", "true");
  await expect(old).toHaveAttribute("inert");
  await chooseRadio(page, "Example state", "With Error");
  const chosen = radioChoice(page, "Example state", "With Error");
  await expect(detail.locator('iframe[data-current="true"]')).toHaveAttribute("aria-busy", "false");
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
  await expect(detail.locator('iframe[data-visible="true"]')).toHaveAttribute(
    "title",
    "Input — With Error live example",
  );
  await expect(chosen).toBeFocused();
  assert.equal(await page.evaluate(() => scrollY), scroll, "Late hidden preview scrolled parent");
  console.log(
    "Rapid selection: late A cannot override B, autofocus hidden frame, or scroll parent.",
  );
  await page.unrouteAll({ behavior: "wait" });
  for (const width of [320, 1280]) {
    for (const theme of ["light", "dark"]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`${origin}/components/?theme=${theme}&tag=retained`);
      await expect(page.locator(".catalog-browser:visible")).toBeVisible();
      assert.equal(await page.locator("iframe").count(), 0, "Fresh browse page mounted a preview");
      assert.equal(
        await page.locator(".catalog-component-list").count(),
        0,
        "Scrollable sidebar remains",
      );
      assert.equal(await page.evaluate(() => scrollY), 0, "Initial catalog stole scroll");
      const card = (id: string) => page.locator(`.catalog-card a[href*='component=${id}']`);
      const browse = async () => {
        await page.getByRole("link", { name: "All components", exact: true }).click();
        await expect(page.locator(".catalog-browser:visible")).toBeVisible();
        await expect(detail).toHaveCount(0);
        assert.equal(new URL(page.url()).searchParams.has("component"), false);
        assert.equal(new URL(page.url()).searchParams.has("state"), false);
        assert.equal(new URL(page.url()).searchParams.get("tag"), "retained");
      };
      await card("input").click();
      await expect(detail.locator('iframe[data-current="true"]')).toHaveAttribute(
        "aria-busy",
        "false",
      );
      await expect(
        page.getByRole("navigation", { name: "Browse components", exact: true }),
      ).toHaveCount(0);
      await input("Default").fill("browser@example.com");
      await frame("Default")
        .locator("html")
        .evaluate((root) => root.setAttribute("data-instance", "browse-retained"));
      await chooseRadio(page, "Example state", "With Error");
      await expect(detail.locator('iframe[data-current="true"]')).toHaveAttribute(
        "aria-busy",
        "false",
      );
      await input("With Error").fill("remembered-error@example.com");
      await browse();
      assert.equal(
        await page
          .locator('iframe[title="Input — With Error live example"]')
          .evaluate((node) => node.closest("[inert]") !== null),
        true,
        "Retained hidden detail remains interactive",
      );
      await card("button").click();
      await expect(detail.locator('iframe[data-current="true"]')).toHaveAttribute(
        "aria-busy",
        "false",
      );
      await expect(
        page.getByRole("navigation", { name: "Browse components", exact: true }),
      ).toHaveCount(0);
      await browse();
      await card("input").click();
      await expect(detail.locator('iframe[data-current="true"]')).toHaveAttribute(
        "title",
        "Input — With Error live example",
      );
      assert.equal(
        await input("With Error").inputValue(),
        "remembered-error@example.com",
        "Browsing erased selected state's draft",
      );
      assert.equal(
        new URL(page.url()).searchParams.get("state"),
        "components-input--with-error",
        "Browsing forgot selected state URL",
      );
      await page.goBack();
      await expect(page.locator(".catalog-browser:visible")).toBeVisible();
      await expect(detail).toHaveCount(0);
      await page.goForward();
      await expect(detail.locator('iframe[data-current="true"]')).toHaveAttribute(
        "title",
        "Input — With Error live example",
      );
      assert.equal(
        await input("With Error").inputValue(),
        "remembered-error@example.com",
        "Browse history erased draft",
      );
      await browse();
      const search = page.getByRole("searchbox", { name: "Search components" });
      await search.fill("unmatched component");
      await page.getByRole("button", { name: "Clear search" }).click();
      await expect(search).toBeFocused();
      await expect(search).toHaveValue("");
      await card("input").click();
      assert.equal(
        await input("Default").inputValue(),
        "browser@example.com",
        "Browse search remounted retained detail",
      );
      assert.equal(
        await frame("Default").locator("html").getAttribute("data-instance"),
        "browse-retained",
        "Browse/history replaced preview document",
      );
      assert.equal(await frame("Default").locator("html").getAttribute("data-theme"), theme);
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
        false,
        "Browse/detail page overflowed",
      );
    }
  }
  console.log(
    "Public browse/detail: zero initial previews; hidden inert cache, cross-component drafts, history, clear focus and both viewport themes preserved.",
  );
  await page.goto(
    `${origin}/components/?component=input&state=components-input--with-error&theme=dark`,
  );
  await input("With Error").waitFor();
  const beforeOverview = page.url();
  await page.goto(
    `${origin}/components/?view=overview&component=input&state=components-input--with-error&theme=dark&compare=true&from=legacy#main`,
  );
  await expect(detail).toBeVisible();
  const publicLocation = new URL(page.url());
  assert.equal(publicLocation.pathname, new URL(`${origin}/components/`).pathname);
  assert.equal(publicLocation.searchParams.has("view"), false);
  assert.equal(publicLocation.searchParams.get("component"), "input");
  assert.equal(publicLocation.searchParams.get("state"), "components-input--with-error");
  assert.equal(publicLocation.searchParams.get("theme"), "dark");
  assert.equal(publicLocation.searchParams.get("from"), "legacy");
  assert.equal(publicLocation.hash, "#main");
  await page.goBack();
  await expect(page).toHaveURL(beforeOverview);
  await page.goForward();
  await expect(detail).toBeVisible();
  await expect(page.locator(".catalog-qa-gallery")).toHaveCount(0);
  await expect(
    page.getByRole("navigation", { name: "Browse components", exact: true }),
  ).toHaveCount(0);
  const lightPreview = detail.frameLocator('[data-qa-theme="light"] iframe[data-current="true"]');
  const darkPreview = detail.frameLocator('[data-qa-theme="dark"] iframe[data-current="true"]');
  await expect(detail.getByRole("region", { name: "Dark comparison", exact: true })).toBeVisible();
  await expect(lightPreview.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(darkPreview.locator("html")).toHaveAttribute("data-theme", "dark");
  await lightPreview
    .getByRole("textbox", { name: "Email", exact: true })
    .fill("light-compare@example.com");
  await darkPreview
    .getByRole("textbox", { name: "Email", exact: true })
    .fill("dark-compare@example.com");
  await lightPreview.locator("html").evaluate((root) => (root.dataset.instance = "paired-light"));
  await darkPreview.locator("html").evaluate((root) => (root.dataset.instance = "paired-dark"));
  for (const theme of ["light", "dark"])
    await expect
      .poll(() =>
        detail
          .locator(`[data-qa-theme="${theme}"] iframe[data-current="true"]`)
          .evaluate((frame) => frame.getBoundingClientRect().height),
      )
      .toBeLessThan(240);
  await page.getByLabel("Dark mode", { exact: true }).click();
  await expect(lightPreview.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(darkPreview.locator("html")).toHaveAttribute("data-theme", "dark");
  assert.equal(
    await lightPreview.getByRole("textbox", { name: "Email", exact: true }).inputValue(),
    "light-compare@example.com",
  );
  assert.equal(
    await darkPreview.getByRole("textbox", { name: "Email", exact: true }).inputValue(),
    "dark-compare@example.com",
  );
  assert.equal(await lightPreview.locator("html").getAttribute("data-instance"), "paired-light");
  assert.equal(await darkPreview.locator("html").getAttribute("data-instance"), "paired-dark");
  await page.getByRole("checkbox", { name: "Compare light and dark" }).uncheck();
  assert.equal(new URL(page.url()).searchParams.has("compare"), false);
  await page.getByRole("checkbox", { name: "Compare light and dark" }).check();
  assert.equal(new URL(page.url()).searchParams.get("compare"), "true");
  const beforeCompare = page.url();
  await page.goBack();
  await expect(page).toHaveURL(beforeOverview);
  await page.goForward();
  await expect(page).toHaveURL(beforeCompare);
  const beforeAlias = page.url();
  await page.goto(
    `${origin}/components/qa/?component=input&state=components-input--with-error&theme=dark&compare=true&view=overview&skin=current&from=alias#main`,
  );
  await expect(detail).toBeVisible();
  assert.equal(new URL(page.url()).pathname, new URL(`${origin}/components/`).pathname);
  assert.equal(new URL(page.url()).searchParams.get("state"), "components-input--with-error");
  assert.equal(new URL(page.url()).searchParams.get("compare"), "true");
  assert.equal(new URL(page.url()).searchParams.get("from"), "alias");
  assert.equal(new URL(page.url()).hash, "#main");
  assert.equal(new URL(page.url()).searchParams.has("view"), false);
  assert.equal(new URL(page.url()).searchParams.has("skin"), false);
  await page.goBack();
  await expect(page).toHaveURL(beforeAlias);
  await page.goForward();
  await expect(detail).toBeVisible();
  await page.goto(`${origin}/components/qa/?theme=light&compare=true&from=alias#main`);
  await expect(page.locator(".catalog-browser:visible")).toBeVisible();
  assert.equal(new URL(page.url()).pathname, new URL(`${origin}/components/`).pathname);
  assert.equal(await page.locator("iframe").count(), 0, "Unscoped QA alias mounted a detail");
  console.log(
    "Legacy views stay public; QA aliases replace to browse/details; public comparison pins both themes/documents and uses replace-only URL state.",
  );
});
