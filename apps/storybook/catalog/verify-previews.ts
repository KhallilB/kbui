import { chromium, type Locator } from "playwright";
import { previewKind, previewLayout } from "../site/catalog-model.ts";
import { playgroundKey } from "../site/playground-model.ts";
import { chooseRadio } from "./native-controls.ts";
import { loadSiteSamples } from "./site-samples.ts";
import { loadCatalogSources } from "./source.ts";
import type { CodeSample } from "./types";

// Run against combined static output; shell stories alone cannot prove embedded sizing.
const origin = process.env.CATALOG_PREVIEW_URL ?? "http://127.0.0.1:4174";
const catalogTheme = process.env.CATALOG_THEME;
const storyFilter = process.env.PREVIEW_STORY;
if (catalogTheme && !["light", "dark"].includes(catalogTheme))
  throw new Error("CATALOG_THEME must be light or dark");
const appearance = catalogTheme ? `&theme=${catalogTheme}` : "";
const browser = await chromium.launch({ headless: true });
const failures: string[] = [];
const endOfCode = process.platform === "darwin" ? "Meta+ArrowDown" : "Control+End";
let checked = 0;
async function verifyPopoverContent(popup: Locator) {
  await popup.waitFor({ state: "visible" });
  await popup.evaluate(async (element) => {
    await Promise.all(element.getAnimations().map((animation) => animation.finished));
  });
  const usable = await popup.evaluate((element) => {
    const bounds = element.getBoundingClientRect();
    const host = window.frameElement as HTMLElement | null;
    let clippedByHost = false;
    if (host) {
      const frameBounds = host.getBoundingClientRect();
      const scale = frameBounds.width / host.clientWidth;
      const top = frameBounds.top + bounds.top * scale;
      const bottom = frameBounds.top + bounds.bottom * scale;
      for (
        let parent = host.parentElement;
        parent && parent !== host.ownerDocument.body;
        parent = parent.parentElement
      ) {
        if (getComputedStyle(parent).overflowY === "visible") continue;
        const clip = parent.getBoundingClientRect();
        if (top < clip.top - 1 || bottom > clip.bottom + 1) clippedByHost = true;
      }
    }
    const body = element.querySelector<HTMLElement>(".kb-popover-body");
    const controls = [...element.querySelectorAll<HTMLElement>("input, button, label")];
    return (
      !clippedByHost &&
      body != null &&
      body.clientHeight > 0 &&
      controls.length > 0 &&
      bounds.top >= 0 &&
      bounds.bottom <= innerHeight + 1 &&
      controls.every((control) => {
        const rect = control.getBoundingClientRect();
        return rect.height > 0 && rect.top >= bounds.top && rect.bottom <= bounds.bottom;
      })
    );
  });
  if (!usable) throw new Error("Popover form or actions clipped in real catalog iframe");
}

try {
  for (const width of [320, 1280]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    page.setDefaultTimeout(5000);
    if (catalogTheme) {
      await page.goto(`${origin}/components/?theme=${catalogTheme}`);
      await page.waitForFunction(
        (expected) => {
          return document.querySelectorAll(".catalog-card").length === expected;
        },
        loadCatalogSources().length,
        { timeout: 15000 },
      );
      const gallery = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > innerWidth,
        theme: document.querySelector<HTMLElement>(".kbui-catalog")?.dataset.theme,
        scroll: scrollY,
        frames: document.querySelectorAll("iframe").length,
        qaLinks: [...document.querySelectorAll<HTMLAnchorElement>("a[href]")].some((link) =>
          new URL(link.href).pathname.endsWith("/components/qa/"),
        ),
      }));
      if (
        gallery.overflow ||
        gallery.theme !== catalogTheme ||
        gallery.scroll !== 0 ||
        gallery.frames !== 0 ||
        gallery.qaLinks
      )
        throw new Error(`Catalog index theme/focus/overflow mismatch: ${JSON.stringify(gallery)}`);
    }
    for (const entry of loadCatalogSources()) {
      for (const story of entry.stories.filter(
        (story) => !/(?:^|\s)(?:Dark|Light)$/.test(story.name),
      )) {
        if (storyFilter && story.id !== storyFilter) continue;
        const label = `${width}px ${story.id}`;
        try {
          await page.goto(
            `${origin}/components/?component=${entry.id}&state=${story.id}${appearance}`,
          );
          const frame = page.frameLocator('iframe[data-current="true"]');
          await page.waitForFunction(
            () => {
              const doc = document.querySelector<HTMLIFrameElement>(
                'iframe[data-current="true"]',
              )?.contentDocument;
              return doc?.querySelector("#storybook-root > *, [role=dialog]");
            },
            undefined,
            { timeout: 5000 },
          );
          if (catalogTheme) {
            const values = await frame.locator("html").evaluate((root) => ({
              theme: root.dataset.theme,
              accent: getComputedStyle(root).getPropertyValue("--kb-color-accent").trim(),
            }));
            const expected = await page
              .locator(".kbui-catalog")
              .evaluate((root) =>
                getComputedStyle(root).getPropertyValue("--kb-color-accent").trim(),
              );
            if (values.theme !== catalogTheme || values.accent !== expected)
              throw new Error(`Theme did not reach preview: ${JSON.stringify(values)}`);
          }
          await frame.locator("#storybook-root").evaluate(async (root) => {
            await root.ownerDocument.fonts.ready;
            await new Promise<void>((resolve) =>
              requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
            );
          });
          await page.waitForFunction(() => {
            const iframe = document.querySelector<HTMLIFrameElement>('iframe[data-current="true"]');
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
          await page.evaluate(async () => {
            await document.fonts.ready;
            await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
          });
          const geometry = await page.evaluate(() => {
            const iframe = document.querySelector<HTMLIFrameElement>('iframe[data-current="true"]');
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
              verticalOverflow: doc.documentElement.scrollHeight > iframe.clientHeight + 1,
              height: iframe.clientHeight,
              content,
            };
          });
          if (geometry.pageOverflow || geometry.frameOverflow) {
            const overflowing = await page.evaluate(() =>
              [...document.querySelectorAll("body *")]
                .filter((element) => element.getBoundingClientRect().right > innerWidth + 1)
                .slice(0, 12)
                .map((element) => ({
                  tag: element.tagName,
                  className: element.getAttribute("class"),
                  right: element.getBoundingClientRect().right,
                })),
            );
            throw new Error(`Horizontal overflow: ${JSON.stringify({ ...geometry, overflowing })}`);
          }
          if (geometry.verticalOverflow)
            throw new Error(`Preview retains vertical scrollbar: ${JSON.stringify(geometry)}`);
          const alignment = await frame.locator("#storybook-root").evaluate((root) => {
            const content =
              root.querySelector(".component-preview-content") ?? root.firstElementChild;
            if (!content) throw new Error("Missing example content");
            const bounds = content.getBoundingClientRect();
            return {
              x: bounds.left + bounds.width / 2,
              y: bounds.top + bounds.height / 2,
              top: bounds.top,
              left: bounds.left,
              width: bounds.width,
              height: bounds.height,
              viewportWidth: innerWidth,
              viewportHeight: innerHeight,
              text: getComputedStyle(content).textAlign,
            };
          });
          const kind = previewKind(entry.id);
          const isLayout = kind === "layout";
          const isSurface = kind === "surface";
          if (isLayout) {
            if (Math.abs(alignment.left - 16) > 1 || Math.abs(alignment.top - 16) > 1)
              throw new Error(`Layout lost start alignment: ${JSON.stringify(alignment)}`);
          } else {
            if (Math.abs(alignment.x - alignment.viewportWidth / 2) > 1)
              throw new Error(`Example is not horizontally centered: ${JSON.stringify(alignment)}`);
            if (!isSurface && Math.abs(alignment.y - alignment.viewportHeight / 2) > 1)
              throw new Error(
                `Compact example is not vertically centered: ${JSON.stringify(alignment)}`,
              );
            if (isSurface && alignment.viewportWidth > 900 && alignment.width > 700)
              throw new Error(
                `Surface has no readable width constraint: ${JSON.stringify(alignment)}`,
              );
          }
          if (alignment.text === "center") throw new Error("Example text became center-aligned");
          const fluidSelectors: Record<string, string> = {
            tabs: ".kb-tabs:not(.kb-tabs .kb-tabs)",
            codeblock: ".kb-codeblock",
            collection: ".kb-collection",
            accordion: ".kb-accordion",
            disclosure: ".kb-disclosure",
            input: ".kb-input",
            textarea: ".kb-textarea",
            fieldset: ".kb-fieldset",
            formactions: ".kb-formactions",
            errorsummary: ".kb-errorsummary",
            select: ".kb-select",
            combobox: ".kb-combobox",
            multiselect: ".kb-multiselect",
            card: ".kb-card",
            callout: ".kb-callout",
            emptystate: ".kb-emptystate",
            dashboard: ".kb-dashboard",
            pageheader: ".kb-pageheader",
            supportingpane: ".kb-supportingpane",
            gallery: ".kb-gallery",
            statsrow: ".kb-statsrow",
            toast: ".kb-toast-viewport[data-placement=inline]",
            progress: ".kb-progress",
            scrollarea: ".kb-scrollarea",
            table: ".kb-table-scroll",
            descriptionlist: ".kb-descriptionlist",
            collectionlist: ".kb-collectionlist",
            collectionrow: ".kb-collectionlist",
          };
          const selector = fluidSelectors[entry.id];
          if (selector) {
            const fills = await frame.locator("#storybook-root").evaluate((root, target) => {
              const content = root.querySelector(".component-preview-content") ?? root;
              const available = content.getBoundingClientRect().width;
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
          const reserve = previewLayout(entry.id, story.id).minimum;
          const availableHeight = await page.locator(".catalog-preview-frame").evaluate((stage) => {
            const style = getComputedStyle(stage);
            return (
              stage.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom)
            );
          });
          if (entry.id === "popover" && geometry.height < reserve)
            throw new Error("Popover preview lost its reserved overlay space");
          if (width >= 520 && entry.id !== "popover" && geometry.height < availableHeight - 1)
            throw new Error(`Preview leaves unused pane height: ${JSON.stringify(geometry)}`);
          if (width < 520 && geometry.height > Math.max(reserve, geometry.content) + 1)
            throw new Error(`Unnecessary vertical space: ${JSON.stringify(geometry)}`);
          if (story.id === "components-badge--default") {
            await page.getByRole("button", { name: "Expand preview", exact: true }).click();
            await page.waitForFunction(
              () =>
                (document.querySelector<HTMLIFrameElement>('iframe[data-current="true"]')
                  ?.clientHeight ?? 0) >= 480,
            );
            const centered = await frame.locator(".kb-badge").evaluate((element) => {
              const bounds = element.getBoundingClientRect();
              return Math.abs(bounds.top + bounds.height / 2 - innerHeight / 2) < 3;
            });
            if (!centered) throw new Error("Expanded compact example lost vertical centering");
            await page.getByRole("button", { name: "Compact preview", exact: true }).click();
            await page.waitForFunction(
              (height) =>
                document.querySelector<HTMLIFrameElement>('iframe[data-current="true"]')
                  ?.clientHeight === height,
              geometry.height,
            );
          }
          const code = page.getByRole("textbox", { name: "Component code", exact: true });
          await code.waitFor({ state: "visible" });
          if ((await code.inputValue()) !== story.snippet)
            throw new Error("Code differs from selected canonical example");
          const afterCode = await page.evaluate(() => ({
            overflow: document.documentElement.scrollWidth > innerWidth,
            height: document.querySelector<HTMLIFrameElement>('iframe[data-current="true"]')
              ?.clientHeight,
          }));
          if (afterCode.overflow || afterCode.height !== geometry.height)
            throw new Error(`Code panel changed preview geometry: ${JSON.stringify(afterCode)}`);
          await page.getByRole("button", { name: "Expand preview", exact: true }).click();
          const expandedHeight = Math.max(geometry.height, Math.min(480, 900 * 0.6));
          await page.waitForFunction(
            (expected) =>
              Math.abs(
                (document.querySelector<HTMLIFrameElement>('iframe[data-current="true"]')
                  ?.clientHeight ?? 0) - expected,
              ) <= 1,
            expandedHeight,
          );
          if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth))
            throw new Error("Expanded preview caused page overflow");
          await page.getByRole("button", { name: "Compact preview", exact: true }).click();
          await page.waitForFunction(
            (expected) =>
              document.querySelector<HTMLIFrameElement>('iframe[data-current="true"]')
                ?.clientHeight === expected,
            geometry.height,
          );
          if (
            story.id === "components-panel--token-overrides" &&
            (await code.evaluate((element) => element.scrollHeight > element.clientHeight))
          ) {
            await code.evaluate((element) => {
              element.scrollTop = 0;
            });
            await code.press(endOfCode);
            await page.waitForFunction(
              () => (document.querySelector(".code-editor textarea")?.scrollTop ?? 0) > 0,
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
          if (["components-popover--default", "components-popover--scrolling"].includes(story.id)) {
            const trigger = frame.getByRole("button", { name: "View options", exact: true });
            await trigger.click();
            const popup = frame.getByRole("dialog", { name: "View options", exact: true });
            await verifyPopoverContent(popup);
            await frame.getByRole("checkbox", { name: "Show descriptions" }).uncheck();
            if (
              await frame.getByText("Review the latest interface changes.", { exact: true }).count()
            )
              throw new Error("Display preference did not update workspace");
            await frame.getByRole("button", { name: "Done", exact: true }).click();
            await page.getByRole("checkbox", { name: "Compare light and dark" }).check();
            const comparison = page.frameLocator('iframe[title$="Dark comparison"]');
            await comparison.getByRole("button", { name: "View options", exact: true }).click();
            await verifyPopoverContent(comparison.getByRole("dialog", { name: "View options" }));
            await comparison.getByRole("button", { name: "Done", exact: true }).click();
            await page.getByRole("checkbox", { name: "Compare light and dark" }).uncheck();
          }
          if (story.id === "components-popover--controlled") {
            const trigger = frame.getByRole("button", { name: "Rename project" });
            const popup = frame.getByRole("dialog", { name: "Rename project" });
            const input = popup.getByRole("textbox", { name: "Project name" });
            await trigger.click();
            await verifyPopoverContent(popup);
            await input.fill("Discarded draft");
            await input.press("Escape");
            await popup.waitFor({ state: "hidden" });
            await trigger.click();
            if ((await input.inputValue()) !== "Website refresh")
              throw new Error("Escape retained discarded draft");
            await input.fill("Outside draft");
            await frame.getByRole("status").click();
            await popup.waitFor({ state: "hidden" });
            await trigger.click();
            if ((await input.inputValue()) !== "Website refresh")
              throw new Error("Outside dismissal retained draft");
            await input.fill("Updated from keyboard");
            await input.press("Enter");
            await popup.waitFor({ state: "hidden" });
            if (!(await frame.getByRole("status").innerText()).includes("Updated from keyboard"))
              throw new Error("Native Enter did not submit associated form");
            if (!(await trigger.evaluate((element) => element === document.activeElement)))
              throw new Error("Save lost trigger focus");
          }
          if (["dialog", "menu", "tooltip"].includes(entry.id)) {
            if (entry.id === "menu") {
              const trigger = frame.getByRole("button", { name: "Actions", exact: true });
              if ((await trigger.getAttribute("aria-expanded")) !== "true") await trigger.click();
            }
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
            if (entry.id === "menu") {
              const balance = await popup.evaluate((element) => {
                const trigger = document.querySelector('[aria-haspopup="menu"]');
                if (!trigger) throw new Error("Missing Menu trigger");
                const top = trigger.getBoundingClientRect().top;
                const bottom = element.getBoundingClientRect().bottom;
                return Math.abs((top + bottom) / 2 - innerHeight / 2);
              });
              if (balance > 16) throw new Error(`Menu composition is not centered: ${balance}px`);
              const trigger = frame.getByRole("button", { name: "Actions", exact: true });
              await popup.focus();
              await page.keyboard.press("Escape");
              await popup.waitFor({ state: "hidden" });
              for (const key of ["Tab", "Shift+Tab"]) {
                await trigger.focus();
                await page.keyboard.press("ArrowDown");
                await popup.waitFor({ state: "visible" });
                await page.waitForFunction(() => {
                  const active = document.querySelector<HTMLIFrameElement>(
                    'iframe[data-current="true"]',
                  )?.contentDocument?.activeElement;
                  return active?.matches('[role="menu"], [role="menuitem"]');
                });
                await page.keyboard.press(key);
                await popup.waitFor({ state: "hidden" });
                await page.waitForFunction(() => {
                  const active = document.querySelector<HTMLIFrameElement>(
                    'iframe[data-current="true"]',
                  )?.contentDocument?.activeElement;
                  return active?.matches('[aria-haspopup="menu"][aria-expanded="false"]');
                });
              }
            }
          }
          if (story.id === "components-panel--collapsible") {
            await frame.getByRole("button", { name: "Toggle" }).click();
            await frame.locator(".kb-panel[data-closed]").waitFor();
            await frame
              .getByText("Only the body collapses; header and footer stay.")
              .waitFor({ state: "hidden" });
            // Minimum overlay reserve can contain both open and closed content.
            await page.waitForFunction((minimum) => {
              const iframe = document.querySelector<HTMLIFrameElement>(
                'iframe[data-current="true"]',
              );
              const doc = iframe?.contentDocument;
              const root = doc?.getElementById("storybook-root");
              if (!iframe || !doc || !root) return false;
              const body = getComputedStyle(doc.body);
              const needed = Math.ceil(
                root.getBoundingClientRect().bottom +
                  (iframe.contentWindow?.scrollY ?? 0) +
                  Number.parseFloat(body.paddingBottom) +
                  Number.parseFloat(body.marginBottom),
              );
              return iframe.clientHeight >= Math.max(minimum, needed) - 1;
            }, reserve);
          }
          if (
            [
              "components-copyabletext--default",
              "components-copyabletext--long-value",
              "components-codeblock--default",
            ].includes(story.id)
          ) {
            await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
            const source = await frame
              .locator(entry.id === "copyabletext" ? ".kb-copyabletext-value" : ".kb-code-content")
              .textContent();
            if (story.id === "components-copyabletext--long-value") {
              await frame.getByRole("button", { name: "Show full value", exact: true }).click();
              await frame.getByRole("button", { name: "Show less", exact: true }).waitFor();
            }
            const copy = frame.getByRole("button", {
              name:
                story.id === "components-copyabletext--long-value"
                  ? "Copy digest"
                  : entry.id === "copyabletext"
                    ? "Copy ID"
                    : "Copy code",
              exact: true,
            });
            await copy.click();
            await frame.getByRole("button", { name: "Copied", exact: true }).waitFor();
            if ((await page.evaluate(() => navigator.clipboard.readText())) !== source)
              throw new Error("Copyable content clipboard differs from original source");
          }
          checked++;
        } catch (error) {
          failures.push(`${label}: ${error instanceof Error ? error.message : String(error)}`);
          if (storyFilter) throw new Error(failures.at(-1));
        }
      }
    }
    if (width === 320) {
      for (const height of [568, 844]) {
        console.log(`Checking ${width}×${height} state switches`);
        await page.setViewportSize({ width, height });
        await page.goto(
          `${origin}/components/?component=panel&state=components-panel--token-overrides`,
        );
        const code = page.getByRole("textbox", { name: "Component code", exact: true });
        console.log(`${width}×${height}: scroll long code`);
        await code.press(endOfCode);
        await page.waitForFunction(
          () => (document.querySelector(".code-editor textarea")?.scrollTop ?? 0) > 0,
        );
        // Let native keyboard scrolling settle before testing state reset.
        await code.evaluate(
          (element) =>
            new Promise<void>((resolve) => {
              let previous = element.scrollTop;
              let stable = 0;
              const settle = () => {
                stable = element.scrollTop === previous ? stable + 1 : 0;
                previous = element.scrollTop;
                if (stable === 4) resolve();
                else requestAnimationFrame(settle);
              };
              requestAnimationFrame(settle);
            }),
        );
        await page.getByRole("button", { name: "Expand preview", exact: true }).click();
        console.log(`${width}×${height}: reset long code on state change`);
        await chooseRadio(page, "Example state", "Depth");
        await page.getByRole("button", { name: "Expand preview", exact: true }).waitFor();
        await page.waitForFunction(
          () => document.querySelector(".code-editor textarea")?.scrollTop === 0,
        );
        if (!(await code.isVisible())) throw new Error("State switch hid the code editor");
        console.log(`${width}×${height}: fit short state`);
        await chooseRadio(page, "Example state", "Compact");
        await page.waitForFunction(() => {
          const iframe = document.querySelector<HTMLIFrameElement>('iframe[data-current="true"]');
          const root = iframe?.contentDocument?.getElementById("storybook-root");
          return root?.querySelector(".kb-panel") && iframe && iframe.clientHeight < 300;
        });
        const fits = await code.evaluate(
          (element) =>
            element.scrollTop === 0 &&
            element.scrollWidth <= element.clientWidth + 1 &&
            element.clientHeight > 0,
        );
        if (!fits) throw new Error("Short state retained code scroll, overflow or empty height");
        console.log(`${width}×${height}: fit expanded input`);
        await page.goto(`${origin}/components/?component=input`);
        await page.getByRole("button", { name: "Expand preview", exact: true }).click();
        await page.waitForFunction(
          (expected) =>
            Math.abs(
              (document.querySelector<HTMLIFrameElement>('iframe[data-current="true"]')
                ?.clientHeight ?? 0) - expected,
            ) <= 1,
          Math.min(480, height * 0.6),
        );
        await chooseRadio(page, "Example state", "With Error");
        await page.getByRole("button", { name: "Expand preview", exact: true }).waitFor();
        await page.waitForFunction(
          () =>
            (document.querySelector<HTMLIFrameElement>('iframe[data-current="true"]')
              ?.clientHeight ?? 480) < 220,
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
      keyboardRing.offset !== "-2px" ||
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
    await chooseRadio(page, "Preview theme", "Dark");
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
