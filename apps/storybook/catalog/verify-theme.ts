import { chromium } from "playwright";

const origin = process.env.CATALOG_PREVIEW_URL ?? "http://127.0.0.1:4174";
const browser = await chromium.launch({ headless: true });
try {
  for (const reducedMotion of ["no-preference", "reduce"] as const) {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion });
    await page.goto(`${origin}/components/?component=input&skin=current&theme=light`);
    const toggle = page
      .getByRole("navigation", { name: "Main navigation" })
      .getByRole("button", { name: "Dark mode" });
    if (new URL(page.url()).searchParams.has("skin")) throw new Error("Legacy skin URL remains");
    if (await page.getByRole("button", { name: "Site skin", exact: true }).count())
      throw new Error("Skin selector remains");
    const frame = page.frameLocator('iframe[data-current="true"]');
    const email = frame.getByRole("textbox", { name: "Email", exact: true });
    await email.fill("preserve@example.com");
    await frame.locator("html").evaluate((root) => root.setAttribute("data-instance", "retained"));
    await toggle.focus();
    await toggle.press("Space");
    await page.waitForFunction(
      () =>
        document.querySelector<HTMLIFrameElement>('iframe[data-current="true"]')?.contentDocument
          ?.documentElement?.dataset.theme === "dark",
    );
    if ((await email.inputValue()) !== "preserve@example.com") throw new Error("Theme reset input");
    if ((await frame.locator("html").getAttribute("data-instance")) !== "retained")
      throw new Error("Theme reloaded iframe");
    if ((await toggle.getAttribute("aria-pressed")) !== "true")
      throw new Error("Toggle state missing");
    if (!(await toggle.evaluate((element) => element === document.activeElement)))
      throw new Error("Toggle lost focus");
    const duration = await toggle
      .locator(".theme-toggle-thumb")
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
    await page.goto(`${origin}/examples/`);
    await page.locator('.kbui-site[data-theme="dark"]').waitFor();
    await page.goto(`${origin}/compare/?theme=light`);
    const name = page.getByRole("textbox", { name: "Workspace name" });
    await name.fill("A retained draft");
    await page.getByRole("button", { name: "Dark mode", exact: true }).click();
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
      await page.goto(`${origin}/components/?theme=${theme}&view=live`);
      const picker = page.getByRole("combobox", { name: "Button example", exact: true });
      await picker.click();
      const list = page.getByRole("listbox", { name: "Button example", exact: true });
      await list.waitFor();
      const material = await page.locator(".control-select-popup").evaluate((element) => {
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
      await list.getByRole("option", { name: "Disabled", exact: true }).click();
      await list.waitFor({ state: "hidden" });
      await page.getByTitle("Button — Disabled live example").waitFor();
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
    }
    await page.evaluate(() => localStorage.clear());
    await page.goto(`${origin}/?theme=dark`);
    await page.getByRole("link", { name: "Continue setup", exact: false }).click();
    await page.locator('.kbui-site[data-theme="dark"]').waitFor({ timeout: 5000 });
    await page.getByLabel("Include typed tokens", { exact: true }).check();
    if (new URL(page.url()).searchParams.get("theme") !== "dark")
      throw new Error("Installer options removed navigation theme");
    await page.reload();
    await page.locator('.kbui-site[data-theme="dark"]').waitFor({ timeout: 5000 });
    await page.getByRole("link", { name: "Choose your theme", exact: true }).click();
    await page.locator('.kbui-site[data-theme="dark"]').waitFor({ timeout: 5000 });
    await page.close();
    console.log(
      `Theme navigation verified: ${reducedMotion}, iframe/draft retention, keyboard focus, cross-page preference.`,
    );
  }
} finally {
  await browser.close();
}
