import assert from "node:assert/strict";
import { chromium } from "playwright";

const origin = process.env.STORYBOOK_URL ?? "http://127.0.0.1:4174/storybook";
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ colorScheme: "dark", reducedMotion: "reduce" });
  page.setDefaultTimeout(30_000);
  const docs = page.frameLocator("#storybook-preview-iframe");
  const checkTheme = async (theme: "light" | "dark") => {
    console.log(`Checking ${theme}: ${page.url()}`);
    const background = theme === "dark" ? "rgb(23, 25, 29)" : "rgb(245, 246, 248)";
    await page.waitForFunction(
      ({ theme, background }) => {
        const frame = document.querySelector<HTMLIFrameElement>("#storybook-preview-iframe");
        const doc = frame?.contentDocument;
        const wrapper = doc?.querySelector(".sbdocs-wrapper");
        return (
          doc?.documentElement.dataset.theme === theme &&
          wrapper &&
          getComputedStyle(wrapper).backgroundColor === background &&
          getComputedStyle(document.body).backgroundColor === background
        );
      },
      { theme, background },
      { timeout: 15_000 },
    );
  };
  const chooseTheme = async (name: "System" | "Light" | "Dark") => {
    await page.getByRole("button", { name: /^Color theme / }).click();
    await page.getByRole("option", { name, exact: true }).click();
  };

  await page.goto(`${origin}/?path=/docs/components-button--docs`);
  await docs.getByRole("heading", { name: "Button", exact: true }).waitFor();
  await checkTheme("dark");
  assert.equal(await page.locator("#components-button--motion-tokens").count(), 0);
  assert.equal(await docs.getByRole("heading", { name: "Motion Tokens" }).count(), 0);
  assert.equal(await docs.getByRole("heading", { name: "Primary", exact: true }).count(), 0);
  assert.equal(
    await page.getByRole("button", { name: "Open onboarding guide", exact: true }).count(),
    0,
  );

  await chooseTheme("Light");
  await checkTheme("light");
  await page.getByRole("link", { name: "Introduction", exact: true }).click();
  await docs.getByRole("navigation", { name: "Explore kbui" }).waitFor();
  await checkTheme("light");
  await chooseTheme("System");
  await checkTheme("dark");
  await page.emulateMedia({ colorScheme: "light" });
  await checkTheme("light");
  await chooseTheme("Dark");
  await checkTheme("dark");
  await page.emulateMedia({ colorScheme: "dark" });
  await page.emulateMedia({ colorScheme: "light" });
  await checkTheme("dark");

  await page.goto(`${origin}/?path=/story/components-card--default&globals=theme:dark`);
  await docs.locator(".kb-card").waitFor();
  await docs.locator('html[data-theme="dark"]').waitFor();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${origin}/?path=/docs/introduction--docs&globals=theme:light`);
  await docs.getByRole("navigation", { name: "Explore kbui" }).waitFor();
  assert.equal(
    await docs.locator("html").evaluate((el) => el.scrollWidth > el.clientWidth + 1),
    false,
    "Mobile documentation must not overflow horizontally",
  );
  console.log(
    "Storybook verified: curated navigation, live QA links, matching docs/chrome, explicit and system theme changes.",
  );
} finally {
  await browser.close();
}
