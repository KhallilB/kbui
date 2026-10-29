import assert from "node:assert/strict";
import { chromium } from "playwright";
import { loadCatalogSources, loadComponentReferences } from "./source";

const origin = process.env.STORYBOOK_URL ?? "http://127.0.0.1:4174/storybook";
const references = loadComponentReferences();
const entries = loadCatalogSources().filter(
  (entry) => !process.env.COMPONENT_DOCS_ONLY || entry.name === process.env.COMPONENT_DOCS_ONLY,
);
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
  });
  page.setDefaultTimeout(30_000);
  const docs = page.frameLocator("#storybook-preview-iframe");
  page.on("pageerror", (error) => console.error(error.message));
  let checked = 0;
  const open = async (entry: (typeof entries)[number], theme: "light" | "dark") => {
    console.log(`Checking ${entry.name} (${theme})`);
    await page.goto(`${origin}/?path=/docs/${entry.docsId}&globals=theme:${theme}`);
    try {
      await docs.locator("#reference-accessibility").waitFor();
    } catch (error) {
      console.error(await docs.locator("body").innerText());
      throw error;
    }
    await docs.locator(`html[data-theme="${theme}"]`).waitFor();
    assert.equal(
      await docs.locator(".reference-api caption").first().innerText(),
      `${entry.name} API`,
    );
    for (const group of ["provides", "authoring", "verify"] as const) {
      assert.deepEqual(
        await docs
          .locator(`#reference-accessibility [data-accessibility="${group}"] li`)
          .allTextContents(),
        references[entry.name]?.guide.accessibility[group],
      );
    }
    await docs.getByRole("heading", { name: "Standards and patterns", exact: true }).waitFor();
    assert.ok(
      await docs
        .locator('#reference-accessibility a[href^="https://www.w3.org/TR/WCAG22/#"]')
        .count(),
    );
    const background = await docs
      .locator(".reference-accessibility")
      .evaluate((el) => getComputedStyle(el).backgroundColor);
    assert.equal(background, theme === "light" ? "rgb(233, 236, 241)" : "rgb(30, 34, 41)");
    assert.equal(
      await docs.locator("html").evaluate((el) => el.scrollWidth > el.clientWidth + 1),
      false,
      `${entry.name} overflows the document`,
    );
    checked++;
  };
  for (const theme of ["light", "dark"] as const) {
    for (const entry of entries) {
      await open(entry, theme);
      if (entry.name === "Dialog") {
        assert.equal(
          await docs.getByRole("dialog").count(),
          0,
          "Reading Dialog docs must not launch a modal",
        );
        const trigger = docs
          .locator("#reference-preview")
          .getByRole("button", { name: "Delete project", exact: true });
        await trigger.click();
        const dialog = docs.getByRole("dialog", { name: "Delete project", exact: true });
        await dialog.waitFor();
        await dialog.press("Escape");
        await dialog.waitFor({ state: "hidden" });
        assert.equal(await trigger.evaluate((el) => document.activeElement === el), true);
      }
      if (entry.name === "Button") {
        const summary = docs.locator(".reference-controls > summary");
        await summary.focus();
        await summary.press("Enter");
        await docs.locator(".reference-controls[open]").waitFor();
        const children = docs.locator(".reference-controls textarea").first();
        await children.fill("Publish draft");
        await docs
          .locator("#reference-preview")
          .getByRole("button", { name: "Publish draft", exact: true })
          .waitFor();
        await summary.press("Enter");
        assert.equal(await docs.locator(".reference-controls").getAttribute("open"), null);
      }
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  for (const theme of ["light", "dark"] as const) {
    for (const entry of entries.filter((entry) =>
      ["Dialog", "FileInput", "Panel"].includes(entry.name),
    ))
      await open(entry, theme);
  }
  console.log(
    `Component docs verified: ${entries.length} components, ${checked} desktop/mobile theme cases, interactive controls and dialog focus.`,
  );
} finally {
  await browser.close();
}
