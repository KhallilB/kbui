import assert from "node:assert/strict";
import { chromium, type Page, webkit } from "playwright";
import { chooseRadio, radioChoice } from "./native-controls.ts";
import { loadCatalogSources } from "./source.ts";

const origin = process.env.CATALOG_PREVIEW_URL ?? "http://127.0.0.1:4174";
const failures: string[] = [];
let passed = 0;
const profiles = [
  { name: "chromium-short-mobile", engine: chromium, width: 320, height: 568 },
  { name: "webkit-mobile", engine: webkit, width: 390, height: 844 },
  { name: "webkit-landscape", engine: webkit, width: 844, height: 390 },
];
for (const profile of profiles) {
  if (process.env.RELEASE_PROFILE && profile.name !== process.env.RELEASE_PROFILE) continue;
  if (process.env.RELEASE_BROWSER && profile.engine.name() !== process.env.RELEASE_BROWSER)
    continue;
  const check = async (name: string, run: (page: Page) => Promise<void>) => {
    if (process.env.RELEASE_CHECK && name !== process.env.RELEASE_CHECK) return;

    const browser = await profile.engine.launch();
    const context = await browser.newContext({
      viewport: { width: profile.width, height: profile.height },
      isMobile: true,
      hasTouch: true,
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();
    page.setDefaultTimeout(8000);
    page.on("pageerror", (error) => console.error(`${profile.name} page error: ${error.message}`));
    page.on("crash", () => console.error(`${profile.name}: page crashed`));
    try {
      await run(page);
      passed++;
      console.log(`PASS ${profile.name}: ${name}`);
    } catch (error) {
      const failure = `${profile.name}: ${name}: ${error instanceof Error ? error.message : String(error)}`;
      failures.push(failure);
      console.error(`FAIL ${failure}`);
      console.error(`URL at failure: ${page.url()}`);
      try {
        console.error((await page.locator("body").innerText({ timeout: 2000 })).slice(0, 2000));
        await page.screenshot({
          path: `/tmp/kbui-release-${profile.name}-${name}.png`,
          timeout: 3000,
        });
      } catch {
        console.error("Failure capture unavailable");
      }
    } finally {
      await context.close();
      await browser.close();
    }
  };
  await check("history", async (page) => {
    await page.goto(
      `${origin}/components/?component=input&state=components-input--with-description#main`,
    );
    const state = (name: string) => radioChoice(page, "Example state", name);
    assert.equal(await state("With Description").getAttribute("aria-checked"), "true");
    await page.getByText("Loading live example…", { exact: true }).waitFor({ state: "hidden" });
    const initialHistory = await page.evaluate(() => history.length);
    await page
      .locator('iframe[data-current="true"]')
      .evaluate((frame) => frame.setAttribute("data-history-instance", "retained"));
    await chooseRadio(page, "Example state", "With Error");
    await page.getByText("Loading live example…", { exact: true }).waitFor({ state: "hidden" });
    await chooseRadio(page, "Example state", "Disabled");
    await page.getByText("Loading live example…", { exact: true }).waitFor({ state: "hidden" });
    assert.equal(
      await page.evaluate(() => history.length),
      initialHistory + 2,
      "Preview navigation added browser history entries",
    );
    assert.equal(
      await page
        .locator('iframe[title="Input — With Description live example"]')
        .getAttribute("data-history-instance"),
      "retained",
    );
    await page.goBack();
    await state("With Error").waitFor();
    await page.waitForFunction(
      () =>
        document.querySelector<HTMLIFrameElement>('iframe[data-current="true"]')?.title ===
        "Input — With Error live example",
    );
    assert.match(page.url(), /state=components-input--with-error/);
    await page.goForward();
    await page.waitForFunction(
      () =>
        document.querySelector<HTMLIFrameElement>('iframe[data-current="true"]')?.title ===
        "Input — Disabled live example",
    );
    await page.reload();
    assert.equal(await state("Disabled").getAttribute("aria-checked"), "true");
    await page.getByRole("button", { name: "View code", exact: true }).click();
    assert.match(
      await page.getByRole("region", { name: "Example code", exact: true }).innerText(),
      /disabled/,
    );
    await chooseRadio(page, "Example state", "With Description");
    await page.getByText("Loading live example…", { exact: true }).waitFor({ state: "hidden" });
    await chooseRadio(page, "Example state", "Disabled");
    await page.getByText("Loading live example…", { exact: true }).waitFor({ state: "hidden" });
    assert.match(
      await page
        .frameLocator('iframe[data-current="true"]')
        .locator("html")
        .evaluate(() => document.URL),
      /components-input--disabled/,
    );
    await page.goto(`${origin}/components/?component=input&state=missing`);
    assert.match(
      await page
        .getByRole("status")
        .allTextContents()
        .then((text) => text.join(" ")),
      /State not found/,
    );
  });
  await check("readiness", async (page) => {
    await page.route("**/storybook/iframe.html?*", (route) =>
      route.fulfill({
        contentType: "text/html",
        body: '<body><div id="storybook-root"></div></body>',
      }),
    );
    await page.goto(`${origin}/components/?component=input`);
    await page.waitForFunction(
      () =>
        document.querySelector<HTMLIFrameElement>('iframe[data-current="true"]')?.contentDocument
          ?.readyState === "complete",
    );
    await page.evaluate(
      () =>
        new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        ),
    );
    await page.getByText("Loading live example…", { exact: true }).waitFor();
    await page
      .frameLocator('iframe[data-current="true"]')
      .locator("#storybook-root")
      .evaluate((root) => {
        const button = root.ownerDocument.createElement("button");
        button.textContent = "Ready fixture";
        root.append(button);
      });
    await page.getByText("Loading live example…", { exact: true }).waitFor({ state: "hidden" });
  });
  await check("normalized-readiness", async (page) => {
    await page.route("**/storybook/iframe.html?*", (route) =>
      route.fulfill({
        contentType: "text/html",
        body: `<body><div id="storybook-root"><button>Ready fixture</button></div><script>
          const url = new URL(location.href);
          url.searchParams.sort();
          history.replaceState(null, "", url);
        </script></body>`,
      }),
    );
    await page.goto(`${origin}/components/?component=input`);
    await page.getByText("Loading live example…", { exact: true }).waitFor({ state: "hidden" });
    await page
      .frameLocator('iframe[data-current="true"]')
      .getByRole("button", { name: "Ready fixture" })
      .click();
  });
  await check("slow-retry", async (page) => {
    await page.route("**/storybook/iframe.html?*", (route) =>
      route.fulfill({
        status: 503,
        contentType: "text/html",
        body: "<p>Unavailable fixture</p>",
      }),
    );
    await page.goto(`${origin}/components/?component=input`);
    await page
      .getByText("Taking longer than expected. Reload the preview or open it in Storybook.", {
        exact: true,
      })
      .waitFor({ timeout: 15000 });
    await page.unroute("**/storybook/iframe.html?*");
    await page.getByRole("button", { name: "Reload preview", exact: true }).click();
    await page
      .frameLocator('iframe[data-current="true"]')
      .getByRole("textbox", { name: "Email", exact: true })
      .waitFor();
    await page.getByText("Loading live example…", { exact: true }).waitFor({ state: "hidden" });
    await page
      .getByText("Taking longer than expected. Reload the preview or open it in Storybook.", {
        exact: true,
      })
      .waitFor({ state: "hidden" });
  });
  await check("setup", async (page) => {
    if (profile.engine === chromium)
      await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto(origin);
    const builder = page.getByRole("region", { name: "Install kbui", exact: true });
    await builder.getByRole("combobox", { name: "Package manager", exact: true }).click();
    await page.getByRole("option", { name: "Bun", exact: true }).click();
    await builder.getByRole("checkbox", { name: "Include typed tokens" }).check();
    await builder.getByRole("link", { name: "Continue setup" }).click();
    await page.waitForURL("**/setup/?manager=bun&tokens=1");
    await page.reload();
    const command = page.getByRole("region", { name: "Install command", exact: true });
    assert.match(await command.innerText(), /^bun add /);
    assert.match(await command.innerText(), /kbui-tokens-0.5.0.tgz/);
    await page
      .getByRole("region", { name: "Install Shell example", exact: true })
      .getByRole("button", { name: "Copy code", exact: true })
      .click();
    await page.getByRole("button", { name: "Copied", exact: true }).waitFor();
    if (profile.engine === chromium)
      assert.equal(
        await page.evaluate(() => navigator.clipboard.readText()),
        await command.innerText(),
      );
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      true,
    );
    await page.getByRole("link", { name: "Choose your theme" }).click();
    await chooseRadio(page, "Theme", "Dark");
    assert.equal(await page.locator(".setup-preview").getAttribute("data-theme"), "dark");
    assert.match(
      await page.getByRole("region", { name: "Theme code", exact: true }).innerText(),
      /data-theme="dark"/,
    );
    await chooseRadio(page, "Theme", "System");
    await page.emulateMedia({ colorScheme: "dark" });
    await page.waitForFunction(
      () => document.querySelector(".setup-preview")?.getAttribute("data-theme") === "dark",
    );
    await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
    await page.waitForFunction(
      () => document.querySelector(".setup-preview")?.getAttribute("data-theme") === "light",
    );
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      true,
    );
    await page.goBack();
    await page.waitForURL("**/setup/?manager=bun&tokens=1");
    assert.match(await command.innerText(), /^bun add /);
    await page.goForward();
    await page.waitForURL("**/setup/themes/");
    for (const panel of await page.locator(".example-code-content:not([hidden])").all()) {
      assert.equal(
        await panel.evaluate((element) => element.scrollWidth <= element.clientWidth + 1),
        true,
      );
    }
  });
  await check("motion", async (page) => {
    for (const reduced of [false, true]) {
      await page.emulateMedia({ reducedMotion: reduced ? "reduce" : "no-preference" });
      await page.goto(origin);
      const ending = page.locator(".take-it");
      if (!reduced) {
        assert.equal(await ending.getAttribute("data-motion-phase"), "waiting");
        assert.equal(
          await ending
            .locator("h2")
            .evaluate((element) => getComputedStyle(element).animationPlayState),
          "paused",
        );
      }
      await ending.scrollIntoViewIfNeeded();
      await page.waitForFunction(
        () => document.querySelector(".take-it")?.getAttribute("data-motion-phase") === "ready",
      );
      if (!reduced) {
        await page.emulateMedia({ reducedMotion: "reduce" });
        assert.equal(
          await ending.locator("h2").evaluate((element) => getComputedStyle(element).animationName),
          "none",
        );
        await page.emulateMedia({ reducedMotion: "no-preference" });
      }
      await page.evaluate(() => window.scrollTo(0, 0));
      const styles = await page.locator(".hero-example").evaluate((element) => ({
        animation: getComputedStyle(element).animationName,
        iterations: getComputedStyle(element).animationIterationCount,
      }));
      assert.equal(styles.animation, reduced ? "none" : "kbui-poster-arrive");
      assert.equal(styles.iterations, "1");
      for (const selector of [".about-strip > p", ".choice-copy strong", ".choice-copy small"]) {
        assert.equal(
          await page
            .locator(selector)
            .first()
            .evaluate((element) => getComputedStyle(element).animationName),
          reduced ? "none" : "kbui-fragment-arrive",
        );
      }
      const copyDelays = await page
        .locator(".choice-copy")
        .first()
        .evaluate((element) =>
          Array.from(element.children, (child) =>
            Number.parseFloat(getComputedStyle(child).animationDelay),
          ),
        );
      if (!reduced) {
        const [labelDelay, detailDelay] = copyDelays;
        assert.ok(
          labelDelay !== undefined && detailDelay !== undefined && detailDelay > labelDelay,
        );
      }
      const title = page.locator(".day-heading h2");
      const entrance = await title.evaluateHandle((element) => element.getAnimations()[0]);
      await page.getByRole("button", { name: "Rename plan", exact: true }).click();
      const dialog = page.getByRole("dialog", { name: "Name your day", exact: true });
      await dialog.waitFor();
      const bounds = await dialog.boundingBox();
      assert.ok(
        bounds &&
          bounds.x >= 0 &&
          bounds.y >= 0 &&
          bounds.x + bounds.width <= profile.width + 1 &&
          bounds.y + bounds.height <= profile.height + 1,
        "Entrance motion displaced dialog",
      );
      assert.ok(
        bounds &&
          Math.abs(bounds.x + bounds.width / 2 - profile.width / 2) < 2 &&
          Math.abs(bounds.y + bounds.height / 2 - profile.height / 2) < 2,
        "Entrance motion changed dialog viewport positioning",
      );
      await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
      await page.getByRole("checkbox", { name: "Coffee and a slow start" }).check();
      assert.equal(
        await page.getByRole("progressbar", { name: "Plans picked" }).getAttribute("aria-valuenow"),
        "1",
      );
      assert.equal(
        await title.evaluate(
          (element, previous) => element.getAnimations()[0] === previous,
          entrance,
        ),
        true,
      );
      assert.equal(
        await page
          .locator(".plan-summary-words")
          .evaluate((element) => getComputedStyle(element).animationName),
        reduced ? "none" : "kbui-ink-update",
      );
      await page.goto(`${origin}/examples/`);
      const creativeTitle = page.locator(".creative .composition-title");
      const creativeEntrance = await creativeTitle.evaluateHandle(
        (element) => element.getAnimations()[0],
      );
      const palette = page.getByRole("status", { name: "Palette" });
      assert.equal(
        await palette.evaluate((element) => getComputedStyle(element).animationName),
        reduced ? "none" : "kbui-fragment-arrive",
      );
      await page.getByRole("button", { name: "Change palette", exact: true }).click();
      assert.match(await palette.innerText(), /Apricot \/ Iris \/ Mint/);
      assert.equal(
        await creativeTitle.evaluate(
          (element, previous) => element.getAnimations()[0] === previous,
          creativeEntrance,
        ),
        true,
      );
      assert.equal(
        await page
          .locator(".palette-words")
          .evaluate((element) => getComputedStyle(element).animationName),
        reduced ? "none" : "kbui-ink-update",
      );
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        true,
      );
    }
  });
  await check("updates", async (page) => {
    for (const reduced of [false, true]) {
      await page.emulateMedia({ reducedMotion: reduced ? "reduce" : "no-preference" });
      await page.goto(`${origin}/components/?component=input`);
      await page.waitForFunction(
        () =>
          document
            .querySelector<HTMLIFrameElement>('iframe[data-current="true"]')
            ?.getAttribute("aria-busy") === "false" &&
          document
            .querySelector<HTMLIFrameElement>('iframe[data-current="true"]')
            ?.getAnimations()
            .every((animation) => animation.playState !== "running"),
      );
      await page.getByRole("button", { name: "View code", exact: true }).click();
      const iframe = page.locator('iframe[data-visible="true"]');
      const stage = page.locator(".catalog-preview-frame");
      const identity = await stage.elementHandle();
      assert.ok(identity);
      const height = await iframe.evaluate((element) => element.getBoundingClientRect().height);
      const toolbar = page.locator(".example-code-bar");
      const top = await toolbar.evaluate(
        (element) => element.getBoundingClientRect().top + scrollY,
      );
      let release = () => {};
      const pending = new Promise<void>((resolve) => {
        release = resolve;
      });
      const pattern = "**/storybook/iframe.html?id=components-input--with-error*";
      await page.route(pattern, async (route) => {
        await pending;
        await route.continue();
      });
      try {
        await chooseRadio(page, "Example state", "With Error");
        await page.getByText("Loading live example…", { exact: true }).waitFor();
        assert.equal(
          await stage.evaluate((element, previous) => element === previous, identity),
          true,
        );
        assert.ok(
          Math.abs(
            (await iframe.evaluate((element) => element.getBoundingClientRect().height)) - height,
          ) < 1,
          "Pending state collapsed the previous preview height",
        );
        assert.ok(
          Math.abs(
            (await toolbar.evaluate((element) => element.getBoundingClientRect().top + scrollY)) -
              top,
          ) < 1,
          "Loading status moved the code toolbar",
        );
        release();
        await page
          .frameLocator('iframe[data-current="true"]')
          .getByText("Email is required.", { exact: true })
          .waitFor();
        await page.waitForFunction(
          () =>
            document
              .querySelector<HTMLIFrameElement>('iframe[data-current="true"]')
              ?.getAttribute("aria-busy") === "false" &&
            document
              .querySelector<HTMLIFrameElement>('iframe[data-current="true"]')
              ?.getAnimations()
              .every((animation) => animation.playState !== "running"),
        );
      } finally {
        release();
        await page.unrouteAll({ behavior: "wait" });
      }
      await page.getByRole("button", { name: "Expand preview", exact: true }).click();
      await page.waitForFunction(() =>
        document
          .querySelector<HTMLIFrameElement>('iframe[data-current="true"]')
          ?.getAnimations()
          .every((animation) => animation.playState !== "running"),
      );
      const expanded = await iframe.evaluate((element) => element.getBoundingClientRect().height);
      let resumeDefault = () => {};
      const delayedDefault = new Promise<void>((resolve) => {
        resumeDefault = resolve;
      });
      let finishDefault = () => {};
      const defaultHandled = new Promise<void>((resolve) => {
        finishDefault = resolve;
      });
      const defaultPattern = "**/storybook/iframe.html?id=components-input--with-description*";
      await page.route(defaultPattern, async (route) => {
        try {
          await delayedDefault;
          await route.continue();
        } finally {
          finishDefault();
        }
      });
      try {
        await chooseRadio(page, "Example state", "With Description");
        await page.getByText("Loading live example…", { exact: true }).waitFor();
        await page.waitForFunction(() =>
          document
            .querySelector<HTMLIFrameElement>('iframe[data-current="true"]')
            ?.getAnimations()
            .every((animation) => animation.playState !== "running"),
        );
        assert.ok(
          Math.abs(
            (await iframe.evaluate((element) => element.getBoundingClientRect().height)) - expanded,
          ) < 1,
          "Expanded canvas collapsed while the next state was pending",
        );
      } finally {
        resumeDefault();
        await defaultHandled;
        await page.unroute(defaultPattern);
      }
      await page.waitForFunction(
        () =>
          document
            .querySelector<HTMLIFrameElement>('iframe[data-current="true"]')
            ?.getAttribute("aria-busy") === "false",
      );
      for (const name of ["With Description", "Disabled", "Default"]) {
        await chooseRadio(page, "Example state", name);
      }
      await page.waitForFunction(() => {
        const iframe = document.querySelector<HTMLIFrameElement>('iframe[data-current="true"]');
        return (
          iframe?.getAttribute("aria-busy") === "false" &&
          iframe.contentDocument?.URL.includes("components-input--default") &&
          iframe.getAnimations().every((animation) => animation.playState !== "running")
        );
      });
      assert.ok(
        Math.abs(
          (await iframe.evaluate((element) => element.getBoundingClientRect().height)) - height,
        ) < 1,
        "Latest state retained the wrong canvas height",
      );
      const snippet = page.getByRole("region", { name: "Example code", exact: true });
      assert.equal(
        await snippet.innerText(),
        loadCatalogSources()
          .find((entry) => entry.id === "input")
          ?.stories.find((story) => story.id === "components-input--default")?.snippet,
      );
      await page.goto(`${origin}/playground/`);
      const preview = page.getByTestId("playground-preview");
      const initial = await preview.evaluate((element) => element.getBoundingClientRect().height);
      const button = page.getByRole("button", { name: "Save changes", exact: true });
      const buttonIdentity = await button.elementHandle();
      assert.ok(buttonIdentity);
      for (const size of ["Large", "Small", "Medium"]) {
        await page.getByRole("combobox", { name: "Size", exact: true }).click();
        await page.getByRole("option", { name: size, exact: true }).click();
        assert.ok(
          Math.abs(
            (await preview.evaluate((element) => element.getBoundingClientRect().height)) - initial,
          ) < 1,
          "Button size moved the playground canvas",
        );
      }
      assert.equal(
        await button.evaluate((element, previous) => element === previous, buttonIdentity),
        true,
      );
      await chooseRadio(page, "Preview theme", "Dark");
      await page.waitForFunction(
        () =>
          getComputedStyle(document.querySelector(".playground-preview") as Element)
            .backgroundColor === "rgb(32, 41, 32)",
      );
      await page.getByLabel("Reduce motion", { exact: true }).check();
      assert.equal(
        await preview.evaluate((element) => getComputedStyle(element).transitionDuration),
        "0s",
      );
      assert.equal(
        await page
          .locator(".example-code code")
          .evaluate((element) => getComputedStyle(element).animationName),
        "none",
      );
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        true,
      );
    }
  });
  await check("surfaces", async (page) => {
    for (const reduced of [false, true]) {
      await page.emulateMedia({ reducedMotion: reduced ? "reduce" : "no-preference" });
      for (const [route, surface] of [
        ["/playground/", ".playground-section"],
        ["/examples/", ".example-section"],
        ["/changelog/", ".release-list"],
        ["/components/?view=directory", ".catalog-grid"],
        ["/components/", ".catalog-browser"],
        ["/components/?component=input&view=directory", ".catalog-live"],
      ] as const) {
        await page.goto(`${origin}${route}`);
        assert.equal(
          await page
            .locator(".page-heading")
            .first()
            .evaluate((element) => getComputedStyle(element).animationName),
          reduced ? "none" : "kbui-poster-rise",
        );
        const styles = await page
          .locator(surface)
          .first()
          .evaluate((element) => ({
            animation: getComputedStyle(element).animationName,
            transform: getComputedStyle(element).transform,
          }));
        assert.equal(styles.animation, reduced ? "none" : "kbui-poster-arrive");
        assert.equal(styles.transform, "none");
        assert.equal(
          await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
          true,
        );
      }
    }
    await page.goto(`${origin}/playground/`);
    await page.getByRole("combobox", { name: "Variant", exact: true }).click();
    await page.getByRole("option", { name: "Danger", exact: true }).click();
    assert.match(
      await page.getByRole("combobox", { name: "Variant", exact: true }).innerText(),
      /Danger/,
    );
    const toggle = page.getByRole("button", { name: "View code", exact: true });
    if ((await toggle.getAttribute("aria-expanded")) === "false") await toggle.click();
    const code = page.getByRole("region", { name: "Example code", exact: true });
    assert.equal(
      await code.evaluate((element) => element.scrollWidth <= element.clientWidth + 1),
      true,
    );
    for (const entry of loadCatalogSources()) {
      await page.goto(`${origin}/components/?component=${entry.id}`);
      await page.waitForFunction(() => {
        const doc = document.querySelector<HTMLIFrameElement>(
          'iframe[data-current="true"]',
        )?.contentDocument;
        return doc?.querySelector("#storybook-root > *, [role=dialog]");
      });
      assert.equal(
        await page.evaluate(() => {
          const iframe = document.querySelector<HTMLIFrameElement>('iframe[data-current="true"]');
          return (
            document.documentElement.scrollWidth <= innerWidth &&
            (iframe?.contentDocument?.documentElement.scrollWidth ?? Infinity) <=
              (iframe?.clientWidth ?? 0) + 1
          );
        }),
        true,
        `${entry.name} overflows`,
      );
    }
  });
}
console.log(`Release checks: ${passed} passed; ${failures.length} failed.`);
if (failures.length) throw new Error(failures.join("\n"));
