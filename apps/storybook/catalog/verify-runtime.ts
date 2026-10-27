import assert from "node:assert/strict";
import { chromium, expect, webkit } from "playwright/test";
import { chooseRadio, radioChoice } from "./native-controls.ts";

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
  await page.goto(`${origin}/components/?component=button`);
  const states = page
    .getByRole("radiogroup", { name: "Example state", exact: true })
    .getByRole("radio");
  const count = await states.count();
  assert.ok(count > 6, "Bounded-cache probe needs more states than capacity");
  for (let index = 0; index < count; index++) {
    await states.nth(index).locator("xpath=ancestor::label[1]").click();
    await expect(page.locator('iframe[data-current="true"]')).toHaveAttribute("aria-busy", "false");
    assert.ok(
      (await page.locator(".catalog-preview-frame iframe").count()) <= 6,
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
  const old = page.locator('iframe[title="Input — Default live example"]');
  await expect(old).toHaveAttribute("data-visible", "true");
  await expect(old).toHaveAttribute("inert");
  await chooseRadio(page, "Example state", "With Error");
  const chosen = radioChoice(page, "Example state", "With Error");
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
  await page.unrouteAll({ behavior: "wait" });
  for (const width of [320, 1280]) {
    for (const theme of ["light", "dark"]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`${origin}/components/?theme=${theme}`);
      await expect(page.locator('iframe[data-current="true"]')).toHaveAttribute(
        "aria-busy",
        "false",
      );
      assert.equal(await page.locator("iframe").count(), 1, "Default browser loaded all examples");
      assert.equal(await page.evaluate(() => scrollY), 0, "Initial preview stole scroll");
      const components = page.getByRole("navigation", { name: "Browse components" });
      await components.getByRole("link", { name: "Input", exact: true }).click();
      await expect(page.locator('iframe[data-current="true"]')).toHaveAttribute(
        "aria-busy",
        "false",
      );
      await input("Default").fill("browser@example.com");
      await chooseRadio(page, "Example state", "With Error");
      await expect(page.locator('iframe[data-current="true"]')).toHaveAttribute(
        "aria-busy",
        "false",
      );
      await input("With Error").fill("remembered-error@example.com");
      await components.getByRole("link", { name: "Button", exact: true }).click();
      await expect(page.locator('iframe[data-current="true"]')).toHaveAttribute(
        "aria-busy",
        "false",
      );
      await components.getByRole("link", { name: "Input", exact: true }).click();
      await expect(page.locator('iframe[data-current="true"]')).toHaveAttribute(
        "aria-busy",
        "false",
      );
      await expect(page.locator('iframe[data-current="true"]')).toHaveAttribute(
        "title",
        "Input — With Error live example",
      );
      assert.equal(
        await input("With Error").inputValue(),
        "remembered-error@example.com",
        "Component browsing erased selected state's draft",
      );
      assert.equal(
        new URL(page.url()).searchParams.get("state"),
        "components-input--with-error",
        "Component browsing forgot selected state in URL",
      );
      const search = page.getByRole("searchbox", { name: "Search components" });
      await search.fill("unmatched component");
      await page.getByRole("button", { name: "Clear search" }).click();
      await expect(search).toBeFocused();
      await expect(search).toHaveValue("");
      assert.equal(
        await input("Default").inputValue(),
        "browser@example.com",
        "Search remounted inspector",
      );
      assert.equal(await frame("Default").locator("html").getAttribute("data-theme"), theme);
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
        false,
        "Focused browser overflowed page",
      );
    }
  }
  console.log(
    "Focused browser: one initial document; cross-component drafts, clear focus, both themes and mobile/desktop fit verified.",
  );
  await page.goto(
    `${origin}/components/?component=input&state=components-input--with-error&theme=dark`,
  );
  await input("With Error").waitFor();
  const beforeQa = await page.evaluate(() => history.length);
  await page.goto(
    `${origin}/components/?view=overview&component=input&state=components-input--with-error&theme=dark&compare=true&from=legacy#main`,
  );
  await page.locator(".catalog-qa-gallery").waitFor();
  const qaLocation = new URL(page.url());
  assert.equal(qaLocation.pathname, new URL("qa/", `${origin}/components/`).pathname);
  assert.equal(qaLocation.searchParams.has("view"), false);
  assert.equal(qaLocation.searchParams.get("component"), "input");
  assert.equal(qaLocation.searchParams.get("state"), "components-input--with-error");
  assert.equal(qaLocation.searchParams.get("theme"), "dark");
  assert.equal(qaLocation.searchParams.get("from"), "legacy");
  assert.equal(qaLocation.hash, "#main");
  assert.equal(
    await page.evaluate(() => history.length),
    beforeQa + 1,
    "QA redirect added history",
  );
  await expect(page.locator(".catalog-qa-gallery .catalog-specimen")).toHaveCount(1);
  const lightQa = page.frameLocator(
    '.catalog-qa-panes [data-qa-theme="light"] iframe[data-current="true"]',
  );
  const darkQa = page.frameLocator(
    '.catalog-qa-panes [data-qa-theme="dark"] iframe[data-current="true"]',
  );
  await expect(lightQa.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(darkQa.locator("html")).toHaveAttribute("data-theme", "dark");
  await lightQa.getByRole("textbox", { name: "Email", exact: true }).fill("light-qa@example.com");
  await darkQa.getByRole("textbox", { name: "Email", exact: true }).fill("dark-qa@example.com");
  for (const theme of ["light", "dark"])
    await expect
      .poll(() =>
        page
          .locator(`.catalog-qa-panes [data-qa-theme="${theme}"] iframe[data-current="true"]`)
          .evaluate((frame) => frame.getBoundingClientRect().height),
      )
      .toBeLessThan(240);
  await page.getByLabel("Dark mode", { exact: true }).click();
  await expect(lightQa.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(darkQa.locator("html")).toHaveAttribute("data-theme", "dark");
  assert.equal(
    await lightQa.getByRole("textbox", { name: "Email", exact: true }).inputValue(),
    "light-qa@example.com",
  );
  assert.equal(
    await darkQa.getByRole("textbox", { name: "Email", exact: true }).inputValue(),
    "dark-qa@example.com",
  );
  console.log(
    "Legacy overview redirects without extra history; QA comparison pins both themes and retains drafts.",
  );
  await page.close();
} finally {
  await browser.close();
}
for (const engine of [chromium, webkit]) {
  const recipeBrowser = await engine.launch();
  try {
    const page = await recipeBrowser.newPage({ viewport: { width: 567, height: 900 } });
    await page.goto(
      `${origin}/components/?component=input&state=components-input--with-adornments`,
    );
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
      `${engine.name()}: legacy Input recipe URL selects canonical icons/actions without recovery.`,
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
      `${engine.name()} recipe retained vertical scrollbar`,
    );
    console.log(
      `${engine.name()}567px: Input icons/actions recipe fits settled document height without vertical scrollbar.`,
    );
  } finally {
    await recipeBrowser.close();
  }
}
