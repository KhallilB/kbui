import { chromium } from "playwright";

const origin = process.env.CATALOG_PREVIEW_URL ?? "http://127.0.0.1:4174";
const cases = [
  ["components-badge--default", ".kb-badge", "inlay"],
  ["components-button--secondary", ".kb-button", "raised"],
  ["components-button--primary", ".kb-button", "filled"],
  ["components-button--danger", ".kb-button", "filled"],
  ["components-button--disabled", ".kb-button", "disabled"],
  ["components-callout--default", ".kb-callout", "inlay"],
  ["components-card--default", ".kb-card", "surface"],
  ["components-dialog--open", ".kb-dialog-popup", "surface"],
  ["layout-grid--default", ".kb-grid", "flat"],
  ["components-input--default", ".kb-input-control", "recessed"],
  ["components-menu--default", ".kb-menu", "surface"],
  ["components-panel--default", ".kb-panel-plate", "surface"],
  ["components-progress--default", ".kb-progress-track", "recessed"],
  ["components-scrollarea--default", ".kb-scrollarea", "recessed"],
  ["components-stat--default", ".kb-stat", "flat"],
  ["components-status--chip", '.kb-status[data-appearance="chip"]', "inlay"],
  ["components-toolbar--default", ".kb-toolbar", "recessed"],
  ["components-tooltip--on-hover", ".kb-tooltip", "surface"],
] as const;
const browser = await chromium.launch({ headless: true });
let checked = 0;
try {
  const page = await browser.newPage({
    viewport: { width: 640, height: 800 },
    reducedMotion: "reduce",
  });
  for (const theme of ["light", "dark"]) {
    for (const [id, selector, role] of cases) {
      if (process.env.DEPTH_STORY && process.env.DEPTH_STORY !== id) continue;
      await page.goto(
        `${origin}/storybook/iframe.html?id=${id}&viewMode=story&globals=previewTheme:${theme}&embed=true`,
      );
      await page.locator('#storybook-root > *, [role="dialog"]').first().waitFor();
      await page.waitForFunction((mode) => document.documentElement.dataset.theme === mode, theme);
      if (id === "components-menu--default")
        await page.getByRole("button", { name: "Actions", exact: true }).click();
      if (id === "components-tooltip--on-hover")
        await page.getByRole("button", { name: "Stop", exact: true }).hover();
      const element = page.locator(selector).first();
      await element.waitFor({ state: "visible" });
      const style = await element.evaluate((node) => {
        const own = getComputedStyle(node);
        return {
          shadow: own.boxShadow,
          face: own.backgroundImage,
          color: own.backgroundColor,
          canvas: getComputedStyle(document.documentElement).backgroundColor,
        };
      });
      const fail = (message: string) => {
        throw new Error(`${id} ${theme}: ${message}`);
      };
      if (role === "flat" || role === "disabled") {
        if (style.shadow !== "none" || style.face !== "none")
          fail("intentionally flat state acquired depth");
      } else {
        if (style.shadow === "none" || !style.shadow.includes("inset"))
          fail("missing material edge light or inset shading");
        if ((role === "raised" || role === "recessed") && style.face === "none")
          fail("missing face gradient");
        if (role === "surface" && theme === "dark" && style.color === style.canvas)
          fail("elevated plane merges with dark canvas");
      }
      if (role === "filled" || role === "raised") {
        await element.hover();
        if ((await element.evaluate((node) => getComputedStyle(node).backgroundImage)) === "none")
          fail("hover removes face gradient");
        const resting = await element.evaluate((node) => getComputedStyle(node).boxShadow);
        await page.mouse.down();
        const pressed = await element.evaluate((node) => getComputedStyle(node).boxShadow);
        await page.mouse.up();
        const layers = pressed.replace(/rgba?\([^)]*\)/g, "color").split(",");
        if (pressed === resting || layers.some((layer) => !layer.includes("inset"))) {
          fail("pressed action retained raised outer shadow");
        }
      }
      checked++;
    }
  }
  await page.close();
} finally {
  await browser.close();
}
console.log(
  `Depth contracts verified: ${checked} theme/state cases ${process.env.DEPTH_STORY ? "for selected story" : "across 15 component families"}.`,
);
