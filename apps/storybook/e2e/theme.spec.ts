import { readFile } from "node:fs/promises";
import { type Locator, test } from "playwright/test";
import { siteURL as origin } from "./urls.ts";

const material = (locator: Locator) =>
  locator.evaluate((element) => {
    const style = getComputedStyle(element);
    return JSON.stringify({
      background: style.backgroundColor,
      face: style.backgroundImage,
      ink: style.color,
      border: style.borderTopColor,
      shadow: style.boxShadow,
    });
  });
const sameMaterial = async (name: string, locator: Locator, expected: string) => {
  const actual = await material(locator);
  if (actual !== expected) throw new Error(`${name} material differs: ${actual} vs ${expected}`);
};
const installedCss = await readFile(
  new URL("../../../packages/react/dist/styles.css", import.meta.url),
  "utf8",
);
test("installed package and site palette parity", async ({ browser }) => {
  test.setTimeout(180_000);
  const installedContext = await browser.newContext({ reducedMotion: "reduce" });
  const paletteContext = await browser.newContext({ reducedMotion: "reduce" });
  try {
    const installed = await installedContext.newPage();
    const palettePage = await paletteContext.newPage();
    for (const theme of ["light", "dark"]) {
      await palettePage.goto(`${origin}/components/?component=button&theme=${theme}`);
      const frame = palettePage.frameLocator('iframe[data-current="true"]');
      const primary = await material(frame.locator('.kb-button[data-variant="primary"]'));
      await installed.setContent(`<style>${installedCss}</style><main data-theme="${theme}">
      <button class="kb-button" data-variant="primary" data-size="md">Save</button>
      <button class="kb-button" data-variant="secondary" data-size="md">Cancel</button>
      <article class="kb-card" data-appearance="outlined">Card</article>
      <article class="kb-card" data-appearance="plain">Plain</article>
    </main>`);
      await sameMaterial(
        `Installed primary ${theme}`,
        installed.locator('[data-variant="primary"]'),
        primary,
      );
      await palettePage
        .getByRole("radio", { name: "Secondary", exact: true })
        .locator("xpath=ancestor::label[1]")
        .click();
      const secondary = await material(frame.locator('.kb-button[data-variant="secondary"]'));
      await sameMaterial(
        `Installed secondary ${theme}`,
        installed.locator('[data-variant="secondary"]'),
        secondary,
      );
      await palettePage.goto(`${origin}/playground/?theme=${theme}`);
      const preview = palettePage.getByTestId("playground-preview");
      if ((await preview.getAttribute("data-theme")) !== theme)
        throw new Error("Playground did not inherit page theme");
      const action = preview.getByRole("button", { name: "Save changes" });
      await sameMaterial(`Playground primary ${theme}`, action, primary);
      await palettePage.getByRole("combobox", { name: "Variant", exact: true }).click();
      await palettePage.getByRole("option", { name: "Secondary", exact: true }).click();
      await sameMaterial(`Playground secondary ${theme}`, action, secondary);
      await palettePage.goto(`${origin}/components/?component=card&theme=${theme}`);
      const card = await material(frame.locator('.kb-card[data-appearance="outlined"]').first());
      await sameMaterial(
        `Installed Card ${theme}`,
        installed.locator('[data-appearance="outlined"]'),
        card,
      );
      const plain = await installed.locator('[data-appearance="plain"]').evaluate((element) => {
        const style = getComputedStyle(element);
        return { face: style.backgroundImage, shadow: style.boxShadow };
      });
      if (plain.face !== "none" || plain.shadow !== "none")
        throw new Error("Plain Card acquired depth");
      await palettePage.goto(`${origin}/components/?theme=${theme}`);
      await palettePage.mouse.move(0, 0);
      for (const tile of await palettePage.locator(".catalog-component-item").all())
        await sameMaterial(`Catalog grid Card ${theme}`, tile, card);
      await palettePage.goto(`${origin}/playground/?theme=${theme}`);
      for (const tile of await palettePage.locator(".component-card").all())
        await sameMaterial(`Playground grid Card ${theme}`, tile, card);
      await palettePage.goto(`${origin}/components/?component=input&theme=${theme}`);
      const field = await material(frame.locator(".kb-input-control").first());
      await palettePage.goto(`${origin}/components/?component=dialog&theme=${theme}`);
      await frame.getByRole("button", { name: "Delete project", exact: true }).click();
      const dialog = await material(frame.locator(".kb-dialog-popup"));
      await palettePage.goto(`${origin}/?theme=${theme}`);
      await sameMaterial(
        `Home primary ${theme}`,
        palettePage.getByRole("link", { name: "Start building", exact: false }),
        primary,
      );
      await sameMaterial(
        `Planner secondary ${theme}`,
        palettePage.locator(".day-name-action"),
        secondary,
      );
      await sameMaterial(
        `Planner field ${theme}`,
        palettePage.locator(".day-note .kb-input-control"),
        field,
      );
      await palettePage.locator(".day-name-action").click();
      await sameMaterial(
        `Planner dialog ${theme}`,
        palettePage.locator(".day-dialog.kb-dialog-popup"),
        dialog,
      );
      await palettePage.goto(`${origin}/setup/themes/?theme=${theme}`);
      await palettePage
        .getByRole("radio", { name: theme === "dark" ? "Dark" : "Light", exact: true })
        .locator("xpath=ancestor::label[1]")
        .click();
      await sameMaterial(
        `Setup primary ${theme}`,
        palettePage.locator(".setup-preview .kb-button"),
        primary,
      );
    }
    await installed.close();
    await palettePage.close();
    console.log(
      "Palette parity verified: Buttons, Cards, fields and dialogs across Components, Playground, Home and Setup in both themes.",
    );
  } finally {
    await installedContext.close();
    await paletteContext.close();
  }
});
for (const reducedMotion of ["no-preference", "reduce"] as const) {
  test.describe(reducedMotion, () => {
    test.use({ viewport: { width: 390, height: 844 }, reducedMotion });
    test("theme navigation, drafts and keyboard focus", async ({ page }) => {
      test.setTimeout(180_000);
      await page.goto(`${origin}/components/?component=input&skin=current&theme=light`);
      const toggle = page
        .getByRole("navigation", { name: "Main navigation" })
        .getByLabel("Dark mode", { exact: true });
      if (new URL(page.url()).searchParams.has("skin")) throw new Error("Legacy skin URL remains");
      if (await page.getByRole("button", { name: "Site skin", exact: true }).count())
        throw new Error("Skin selector remains");
      const frame = page.frameLocator('iframe[data-current="true"]');
      const email = frame.getByRole("textbox", { name: "Email", exact: true });
      await email.fill("preserve@example.com");
      await frame
        .locator("html")
        .evaluate((root) => root.setAttribute("data-instance", "retained"));
      await toggle.focus();
      await toggle.press("Space");
      await page.waitForFunction(
        () =>
          document.querySelector<HTMLIFrameElement>('iframe[data-current="true"]')?.contentDocument
            ?.documentElement?.dataset.theme === "dark",
      );
      if ((await email.inputValue()) !== "preserve@example.com")
        throw new Error("Theme reset input");
      if ((await frame.locator("html").getAttribute("data-instance")) !== "retained")
        throw new Error("Theme reloaded iframe");
      if (!(await toggle.isChecked())) throw new Error("Toggle state missing");
      if (!(await toggle.evaluate((element) => element === document.activeElement)))
        throw new Error("Toggle lost focus");
      const duration = await page
        .locator(".theme-toggle .kb-switch-thumb")
        .evaluate((element) => getComputedStyle(element).transitionDuration);
      if (duration !== (reducedMotion === "reduce" ? "0s" : "0.22s"))
        throw new Error(`Unexpected thumb motion: ${duration}`);
      await page.getByRole("button", { name: "Reload preview", exact: true }).click();
      await page.waitForFunction(
        () =>
          document.querySelector<HTMLIFrameElement>('iframe[data-current="true"]')?.contentDocument
            ?.documentElement?.dataset.theme === "dark",
        undefined,
        { timeout: 5000 },
      );
      await page.getByRole("banner").getByRole("link", { name: "kbui home" }).click();
      await page.locator('.kbui-home[data-theme="dark"]').waitFor();
      await page.goto(`${origin}/recipes/`);
      await page.locator('.kbui-site[data-theme="dark"]').waitFor();
      await page.goto(`${origin}/compare/?theme=light`);
      const name = page.getByRole("textbox", { name: "Workspace name" });
      await name.fill("A retained draft");
      await page.getByLabel("Dark mode", { exact: true }).click();
      if ((await name.inputValue()) !== "A retained draft")
        throw new Error("Theme reset workspace draft");
      await page.reload();
      await page.locator('.kbui-site[data-theme="dark"]').waitFor();
      if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth))
        throw new Error("Navigation overflow");
      await page.goto(`${origin}/playground/?theme=dark`);
      await page.getByRole("combobox", { name: "Variant", exact: true }).click();
      const danger = page.getByRole("option", { name: "Danger", exact: true });
      await danger.click();
      const primary = page.getByRole("button", { name: "Save changes", exact: true });
      if ((await primary.getAttribute("data-variant")) !== "danger")
        throw new Error("Dark navigation theme broke dropdown selection");
      for (const theme of ["light", "dark"]) {
        await page.goto(`${origin}/components/?component=button&theme=${theme}`);
        const preview = page.locator('.catalog-detail:visible iframe[data-current="true"]');
        const previewRoot = page
          .frameLocator('.catalog-detail:visible iframe[data-current="true"]')
          .locator("html");
        await previewRoot.locator("#storybook-root > *").first().waitFor();
        await previewRoot.evaluate((root) => (root.dataset.instance = "reskin-retained"));
        const href = page.url();
        const siteAccent = await page
          .locator(".kbui-catalog")
          .evaluate((root) => getComputedStyle(root).getPropertyValue("--kb-color-accent").trim());
        const picker = page.getByRole("combobox", { name: "Palette", exact: true });
        await picker.click();
        const list = page.getByRole("listbox", { name: "Palette", exact: true });
        await list.waitFor();
        const material = await page.locator(".kb-select-popup").evaluate((element) => {
          const style = getComputedStyle(element);
          const bounds = element.getBoundingClientRect();
          return {
            theme: element.closest<HTMLElement>("[data-theme]")?.dataset.theme,
            background: style.backgroundColor,
            shadow: style.boxShadow,
            transition: style.transitionDuration,
            fits: bounds.left >= 0 && bounds.right <= innerWidth && bounds.bottom <= innerHeight,
          };
        });
        if (
          material.theme !== theme ||
          material.background === "rgba(0, 0, 0, 0)" ||
          material.shadow === "none" ||
          !material.fits
        )
          throw new Error(`Dropdown material/bounds mismatch: ${JSON.stringify(material)}`);
        if (reducedMotion === "reduce" && material.transition !== "0s")
          throw new Error("Reduced motion animated dropdown");
        await list.getByRole("option", { name: "Ocean", exact: true }).click();
        await list.waitFor({ state: "hidden" });
        const accent = theme === "light" ? "#21637a" : "#8cd5e8";
        await page.waitForFunction((expected) => {
          const frame = document.querySelector<HTMLIFrameElement>(
            '.catalog-detail:not([hidden]) iframe[data-current="true"]',
          );
          const root = frame?.contentDocument?.documentElement;
          return (
            root && getComputedStyle(root).getPropertyValue("--kb-color-accent").trim() === expected
          );
        }, accent);
        if (
          page.url() !== href ||
          (await previewRoot.getAttribute("data-instance")) !== "reskin-retained"
        )
          throw new Error("Local palette changed URL or replaced preview document");
        if (
          (await page
            .locator(".kbui-catalog")
            .evaluate((root) =>
              getComputedStyle(root).getPropertyValue("--kb-color-accent").trim(),
            )) !== siteAccent
        )
          throw new Error("Preview palette leaked into the site theme");
        await picker.press("ArrowDown");
        await list.waitFor();
        await page.waitForFunction(
          () => Boolean(document.activeElement?.closest('[role="listbox"]')),
          undefined,
          { timeout: 2000 },
        );
        await page.keyboard.press("Escape");
        await list.waitFor({ state: "hidden" });
        if (!(await picker.evaluate((element) => element === document.activeElement)))
          throw new Error("Dropdown did not restore trigger focus");
        await page.getByRole("combobox", { name: "Corners", exact: true }).click();
        await page.getByRole("option", { name: "Sharp", exact: true }).click();
        await page.getByRole("listbox").waitFor({ state: "hidden" });
        if (
          !(await page.getByRole("textbox", { name: "Theme CSS overrides" }).inputValue()).includes(
            "--kb-radius-md: 0px;",
          )
        )
          throw new Error("Generated CSS omitted selected corners");
        if (
          (await previewRoot.evaluate((root) =>
            getComputedStyle(root).getPropertyValue("--kb-radius-md").trim(),
          )) !== "0px"
        )
          throw new Error("Selected corners did not reach live preview");
        await page.getByRole("button", { name: "Reset styling", exact: true }).click();
        if (
          (await previewRoot.evaluate((root) =>
            root.style.getPropertyValue("--kb-color-accent"),
          )) !== ""
        )
          throw new Error("Reset styling retained inline palette overrides");
        if (
          (await previewRoot.getAttribute("data-instance")) !== "reskin-retained" ||
          page.url() !== href
        )
          throw new Error("Reset styling replaced preview or changed URL");
        await page
          .getByRole("radiogroup", { name: "Example state" })
          .getByRole("radio", { name: "Disabled", exact: true })
          .locator("xpath=ancestor::label[1]")
          .click();
        await page.getByTitle("Button — Disabled live example").waitFor();
        if ((await preview.getAttribute("title")) !== "Button — Disabled live example")
          throw new Error("State selection stopped working after local reskinning");
      }
      await page.evaluate(() => localStorage.clear());
      await page.goto(`${origin}/?theme=dark`);
      await page.getByRole("link", { name: "Continue setup", exact: false }).click();
      await page.locator('.kbui-site[data-theme="dark"]').waitFor({ timeout: 5000 });
      await page.getByText("Using tokens in JavaScript or TypeScript?", { exact: true }).click();
      await page.getByRole("button", { name: "Add typed tokens", exact: true }).click();
      if (new URL(page.url()).searchParams.get("theme") !== "dark")
        throw new Error("Installer options removed navigation theme");
      await page.reload();
      await page.locator('.kbui-site[data-theme="dark"]').waitFor({ timeout: 5000 });
      await page.getByRole("link", { name: "Choose your theme", exact: true }).click();
      await page.locator('.kbui-site[data-theme="dark"]').waitFor({ timeout: 5000 });
      console.log(
        `Theme navigation verified: ${reducedMotion}, iframe/draft retention, keyboard focus, cross-page preference.`,
      );
    });
  });
}
