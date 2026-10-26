import assert from "node:assert/strict";
import { chromium, expect, webkit } from "playwright/test";

const origin = process.env.FOCUS_PREVIEW_URL ?? "http://127.0.0.1:4185";
for (const [name, engine] of Object.entries({ chromium, webkit })) {
  const browser = await engine.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await page.goto(
      `${origin}/storybook/iframe.html?id=site-focus-states--compact-indicators&viewMode=story&embed=true`,
    );
    const input = page.getByRole("textbox", { name: "Search orders" });
    await input.click();
    assert.equal(await input.evaluate((node) => getComputedStyle(node).outlineOffset), "-2px");
    await input.press("Tab");
    const trigger = page.getByRole("button", { name: "Row actions" });
    await expect(trigger).toBeFocused();
    assert.equal(await trigger.evaluate((node) => getComputedStyle(node).outlineOffset), "-2px");
    await trigger.press("ArrowDown");
    const item = page.getByRole("menuitem", { name: "Copy order" });
    await expect(item).toBeFocused();
    assert.equal(await item.evaluate((node) => getComputedStyle(node).outlineOffset), "-2px");
    await item.click();
    await expect(page.getByRole("menu")).toBeHidden();
    assert.equal(
      await trigger.evaluate((node) => getComputedStyle(node).outlineStyle),
      "none",
      "Mouse menu selection left a keyboard ring on the trigger",
    );
    const save = page.getByRole("button", { name: "Save order" });
    await save.click();
    assert.equal(await save.evaluate((node) => getComputedStyle(node).outlineStyle), "none");
    await save.focus();
    await page.keyboard.press("Tab");
    await page.keyboard.press("Shift+Tab");
    await expect(save).toBeFocused();
    const keyboard = await save.evaluate((node) => ({
      width: getComputedStyle(node).outlineWidth,
      offset: getComputedStyle(node).outlineOffset,
      color: getComputedStyle(node).outlineColor,
      text: getComputedStyle(node).color,
    }));
    assert.equal(keyboard.width, "2px");
    assert.equal(keyboard.offset, "-2px");
    assert.equal(keyboard.color, keyboard.text);
    console.log(`PASS ${name}: compact keyboard edges, pointer menu/button rings absent`);
    await page.screenshot({ path: `/tmp/kbui-focus-${name}.png` });
  } finally {
    await browser.close();
  }
}
