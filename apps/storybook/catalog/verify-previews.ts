import { chromium, type Locator } from "playwright";
import { playgroundKey } from "../site/playground-model.ts";
import { loadSiteSamples } from "./site-samples.ts";
import { loadCatalogSources } from "./source.ts";
import type { CodeSample } from "./types";

// Run against combined static output; shell stories alone cannot prove embedded sizing.
const origin = process.env.CATALOG_PREVIEW_URL ?? "http://127.0.0.1:4174";
const browser = await chromium.launch({ headless: true });
const failures: string[] = [];
let checked = 0;
try {
  for (const width of [320, 1280]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    page.setDefaultTimeout(5000);
    for (const entry of loadCatalogSources()) {
      for (const story of entry.stories) {
        const label = `${width}px ${story.id}`;
        try {
          await page.goto(`${origin}/components/?component=${entry.id}&state=${story.id}`);
          const frame = page.frameLocator("iframe");
          await page.waitForFunction(
            () => {
              const doc = document.querySelector("iframe")?.contentDocument;
              return doc?.querySelector("#storybook-root > *, [role=dialog]");
            },
            undefined,
            { timeout: 5000 },
          );
          await frame.locator("#storybook-root").evaluate(async (root) => {
            await root.ownerDocument.fonts.ready;
            await new Promise<void>((resolve) =>
              requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
            );
          });
          await page.waitForFunction(() => {
            const iframe = document.querySelector("iframe");
            const doc = iframe?.contentDocument;
            const root = doc?.getElementById("storybook-root");
            if (!root || !iframe || !doc) return false;
            const body = getComputedStyle(doc.body);
            const needed = Math.ceil(
              root.getBoundingClientRect().bottom +
                (iframe.contentWindow?.scrollY ?? 0) +
                Number.parseFloat(body.paddingBottom) +
                Number.parseFloat(body.marginBottom),
            );
            return iframe.clientHeight >= needed;
          });
          const geometry = await page.evaluate(() => {
            const iframe = document.querySelector("iframe");
            const doc = iframe?.contentDocument;
            const root = doc?.getElementById("storybook-root");
            if (!iframe || !doc || !root) throw new Error("Missing live example");
            const body = getComputedStyle(doc.body);
            const content = Math.ceil(
              root.getBoundingClientRect().bottom +
                (iframe.contentWindow?.scrollY ?? 0) +
                Number.parseFloat(body.paddingBottom) +
                Number.parseFloat(body.marginBottom),
            );
            return {
              pageOverflow: document.documentElement.scrollWidth > innerWidth,
              frameOverflow: doc.documentElement.scrollWidth > iframe.clientWidth + 1,
              height: iframe.clientHeight,
              content,
            };
          });
          if (geometry.pageOverflow || geometry.frameOverflow)
            throw new Error(`Horizontal overflow: ${JSON.stringify(geometry)}`);
          const fluidSelectors: Record<string, string> = {
            input: ".kb-input",
            card: ".kb-card",
            callout: ".kb-callout",
            progress: ".kb-progress",
            scrollarea: ".kb-scrollarea",
          };
          const selector = fluidSelectors[entry.id];
          if (selector) {
            const fills = await frame.locator("#storybook-root").evaluate((root, target) => {
              const available = root.getBoundingClientRect().width;
              const surfaces = [...root.querySelectorAll(target)];
              return (
                surfaces.length > 0 &&
                surfaces.every((surface) => surface.getBoundingClientRect().width >= available - 1)
              );
            }, selector);
            if (!fills) throw new Error("Fluid component leaves unused preview width");
          }
          if (entry.id === "panel") {
            const fills = await frame.locator("#storybook-root").evaluate((root) => {
              for (const parent of [root, ...root.querySelectorAll("div")]) {
                const panels = [...parent.children].filter((child) =>
                  child.classList.contains("kb-panel"),
                );
                if (!panels.length) continue;
                const style = getComputedStyle(parent);
                const available =
                  parent.clientWidth -
                  parseFloat(style.paddingLeft) -
                  parseFloat(style.paddingRight);
                const rows = new Map<number, DOMRect[]>();
                for (const panel of panels) {
                  const bounds = panel.getBoundingClientRect();
                  const key = Math.round(bounds.top);
                  rows.set(key, [...(rows.get(key) ?? []), bounds]);
                }
                for (const row of rows.values()) {
                  const used =
                    Math.max(...row.map((box) => box.right)) -
                    Math.min(...row.map((box) => box.left));
                  if (used < available - 2) return false;
                }
              }
              return true;
            });
            if (!fills) throw new Error("Panel row leaves unused width");
          }
          const reserves: Record<string, number> = {
            dialog: 360,
            menu: 240,
            tooltip: 160,
            panel: 64,
            grid: 96,
          };
          const reserve = reserves[entry.id] ?? 64;
          if (geometry.height > Math.max(reserve, geometry.content) + 1)
            throw new Error(`Unnecessary vertical space: ${JSON.stringify(geometry)}`);
          await page.getByRole("button", { name: "View code", exact: true }).click();
          const code = page.getByRole("region", { name: "Example code", exact: true });
          await code.waitFor({ state: "visible" });
          if ((await code.textContent()) !== story.snippet)
            throw new Error("Code differs from selected canonical example");
          const afterCode = await page.evaluate(() => ({
            overflow: document.documentElement.scrollWidth > innerWidth,
            height: document.querySelector("iframe")?.clientHeight,
          }));
          if (afterCode.overflow || afterCode.height !== geometry.height)
            throw new Error(`Code panel changed preview geometry: ${JSON.stringify(afterCode)}`);
          await page.getByRole("button", { name: "Expand preview", exact: true }).click();
          const expandedHeight = Math.max(geometry.height, Math.min(480, 900 * 0.6));
          await page.waitForFunction(
            (expected) =>
              Math.abs((document.querySelector("iframe")?.clientHeight ?? 0) - expected) <= 1,
            expandedHeight,
          );
          if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth))
            throw new Error("Expanded preview caused page overflow");
          await page.getByRole("button", { name: "Compact preview", exact: true }).click();
          await page.waitForFunction(
            (expected) => document.querySelector("iframe")?.clientHeight === expected,
            geometry.height,
          );
          if (story.id === "components-panel--token-overrides") {
            const before = await code.evaluate((element) => element.scrollTop);
            console.log(`${width}px: scroll long code`);
            await code.press("ArrowDown");
            await page.waitForFunction(
              (position) =>
                (document.querySelector(".example-code-content")?.scrollTop ?? 0) > position,
              before,
            );
            if (
              (await page.getByRole("button", { name: "Copy code", exact: true }).isVisible()) ===
              false
            )
              throw new Error("Copy control lost while scrolling code");
          }
          if (story.id === "components-input--with-error") {
            await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
            await page.getByRole("button", { name: "Copy code", exact: true }).click();
            const copied = await page.evaluate(() => navigator.clipboard.readText());
            if (copied !== story.snippet)
              throw new Error("Clipboard differs from selected example");
          }
          if (["dialog", "menu", "tooltip"].includes(entry.id)) {
            if (entry.id === "tooltip")
              await frame.getByRole("button", { name: "Stop", exact: true }).hover();
            if (story.id.endsWith("--confirm"))
              await frame.getByRole("button", { name: "Delete project", exact: true }).click();
            const popup =
              entry.id === "tooltip"
                ? frame.getByText("Stop worker", { exact: true })
                : frame.getByRole(entry.id === "dialog" ? "dialog" : "menu");
            await popup.waitFor({ state: "visible" });
            const fits = await popup.evaluate((element) => {
              const bounds = element.getBoundingClientRect();
              return (
                bounds.top >= 0 &&
                bounds.left >= 0 &&
                bounds.right <= innerWidth + 1 &&
                bounds.bottom <= innerHeight + 1
              );
            });
            if (!fits) throw new Error("Overlay clipped by preview viewport");
          }
          if (story.id === "components-panel--collapsible") {
            await frame.getByRole("button", { name: "Toggle" }).click();
            await page.waitForFunction(
              (before) => (document.querySelector("iframe")?.clientHeight ?? before) < before,
              geometry.height,
            );
          }
          checked++;
        } catch (error) {
          failures.push(`${label}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
    }
    console.log(`${width}px: checked ${checked} canonical previews; ${failures.length} failures.`);
    if (width === 320) {
      for (const height of [568, 844]) {
        console.log(`Checking ${width}×${height} state switches`);
        await page.setViewportSize({ width, height });
        await page.goto(
          `${origin}/components/?component=panel&state=components-panel--token-overrides`,
        );
        const codeToggle = page.getByRole("button", { name: "View code", exact: true });
        await codeToggle.click();
        const code = page.getByRole("region", { name: "Example code", exact: true });
        console.log(`${width}×${height}: scroll long code`);
        await code.press("ArrowDown");
        await page.waitForFunction(
          () => (document.querySelector(".example-code-content")?.scrollTop ?? 0) > 0,
        );
        await page.getByRole("button", { name: "Expand preview", exact: true }).click();
        console.log(`${width}×${height}: reset long code on state change`);
        await page.getByRole("button", { name: "Token Overrides Light", exact: true }).click();
        await page.getByRole("button", { name: "Expand preview", exact: true }).waitFor();
        await page.waitForFunction(
          () => document.querySelector(".example-code-content")?.scrollTop === 0,
        );
        if ((await codeToggle.getAttribute("aria-expanded")) !== "true")
          throw new Error("State switch closed the code panel");
        console.log(`${width}×${height}: fit short state`);
        await page.getByRole("button", { name: "Compact", exact: true }).click();
        await page.waitForFunction(() => {
          const iframe = document.querySelector("iframe");
          const root = iframe?.contentDocument?.getElementById("storybook-root");
          return root?.querySelector(".kb-panel") && iframe && iframe.clientHeight < 300;
        });
        const fits = await code.evaluate(
          (element) =>
            element.scrollTop === 0 &&
            element.scrollWidth <= element.clientWidth + 1 &&
            element.clientHeight <= (element.querySelector("pre")?.clientHeight ?? 0),
        );
        if (!fits) throw new Error("Short state retained code scroll, overflow or empty height");
        console.log(`${width}×${height}: fit expanded input`);
        await page.goto(`${origin}/components/?component=input`);
        await page.getByRole("button", { name: "Expand preview", exact: true }).click();
        await page.waitForFunction(
          (expected) =>
            Math.abs((document.querySelector("iframe")?.clientHeight ?? 0) - expected) <= 1,
          Math.min(480, height * 0.6),
        );
        await page.getByRole("button", { name: "With Error", exact: true }).click();
        await page.getByRole("button", { name: "Expand preview", exact: true }).waitFor();
        await page.waitForFunction(
          () => (document.querySelector("iframe")?.clientHeight ?? 480) < 220,
        );
      }
      await page.setViewportSize({ width, height: 900 });
    }
    const samples = loadSiteSamples();
    await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
    const checkPanel = async (panel: Locator, sample: CodeSample | undefined) => {
      if (!sample) throw new Error("Missing source sample");
      const toggle = panel.getByRole("button", { name: "View code", exact: true });
      if ((await toggle.getAttribute("aria-expanded")) === "false") await toggle.click();
      const code = panel.getByRole("region");
      const expected = sample.snippet;
      if ((await code.textContent()) !== expected)
        throw new Error("Site code differs from selected state");
      if (await panel.getByRole("button", { name: "Include setup" }).count())
        throw new Error("Setup control remains in usage panel");
      await panel.evaluate(async (element) => {
        await element.ownerDocument.fonts.ready;
        await new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        );
        await Promise.all(
          element
            .getAnimations({ subtree: true })
            .map((animation) => animation.finished.catch(() => {})),
        );
      });
      const height = await panel.evaluate((element) => element.getBoundingClientRect().height);
      await panel.getByRole("button", { name: "Copy code", exact: true }).click();
      await panel
        .getByRole("button", { name: "Copied", exact: true })
        .waitFor({ state: "visible" });
      if ((await panel.evaluate((element) => element.getBoundingClientRect().height)) !== height)
        throw new Error("Copy feedback changed panel height");
      if ((await page.evaluate(() => navigator.clipboard.readText())) !== expected)
        throw new Error("Site clipboard differs from visible code");
      const fits = await panel
        .locator(".example-code-bar")
        .evaluate(
          (bar) =>
            new Set(
              [...bar.querySelectorAll("button")].map((button) =>
                Math.round(button.getBoundingClientRect().top),
              ),
            ).size === 1,
        );
      if (!fits) throw new Error("Code controls wrapped to extra rows");
      if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth))
        throw new Error("Site code caused page overflow");
    };
    await page.goto(`${origin}/playground/`);
    const variant = page.getByRole("combobox", { name: "Variant", exact: true });
    await variant.focus();
    await page.keyboard.press("ArrowDown");
    await page.getByRole("listbox").waitFor({ state: "visible" });
    await page.waitForFunction(() => document.activeElement?.getAttribute("role") === "option");
    await page.keyboard.press("End");
    await page.waitForFunction(() => document.activeElement?.textContent?.trim() === "Danger");
    await page.keyboard.press("Enter");
    const variantId = await variant.getAttribute("id");
    await page.waitForFunction((id) => document.activeElement?.id === id, variantId);
    const keyboardRing = await variant.evaluate((element) => ({
      width: getComputedStyle(element).outlineWidth,
      offset: getComputedStyle(element).outlineOffset,
      label: element.textContent,
    }));
    if (
      keyboardRing.width !== "2px" ||
      keyboardRing.offset !== "2px" ||
      keyboardRing.label?.trim() !== "Danger"
    )
      throw new Error(`Keyboard select/focus failed: ${JSON.stringify(keyboardRing)}`);
    await page.getByRole("combobox", { name: "Variant", exact: true }).click();
    await page.getByRole("option", { name: "Danger", exact: true }).click();
    await page.waitForFunction((id) => document.activeElement?.id === id, variantId);
    if ((await variant.evaluate((element) => getComputedStyle(element).outlineStyle)) !== "none")
      throw new Error("Pointer selection retained a keyboard ring");
    await page.getByRole("combobox", { name: "Size", exact: true }).click();
    await page.getByRole("option", { name: "Large", exact: true }).click();
    await page.getByLabel("Disabled", { exact: true }).check();
    await page.getByLabel("Reduce motion", { exact: true }).check();
    await page.getByRole("button", { name: "Dark theme" }).click();
    await checkPanel(
      page.locator(".example-code"),
      samples.playground[
        playgroundKey({
          variant: "danger",
          size: "lg",
          theme: "dark",
          disabled: true,
          reduced: true,
        })
      ],
    );
    await page.getByRole("button", { name: "Reset controls" }).click();
    await checkPanel(
      page.locator(".example-code"),
      samples.playground[
        playgroundKey({
          variant: "primary",
          size: "md",
          theme: "light",
          disabled: false,
          reduced: false,
        })
      ],
    );
    await page.goto(`${origin}/examples/`);
    for (const surface of ["editorial", "operations", "creative"]) {
      await checkPanel(
        page.locator(`#${surface} .example-code`),
        samples.surfaces[surface === "creative" ? "creative-false" : surface],
      );
    }
    await page.getByRole("button", { name: "Change palette" }).click();
    await checkPanel(page.locator("#creative .example-code"), samples.surfaces["creative-true"]);
    console.log(`${width}px: checked ${checked} previews; ${failures.length} failures.`);
    await page.close();
  }
} finally {
  await browser.close();
}
if (failures.length) throw new Error(failures.join("\n"));
console.log(
  `Preview/code verified: ${checked} live examples and all site code panels across mobile and desktop.`,
);
