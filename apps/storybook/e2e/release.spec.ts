import assert from "node:assert/strict";
import { createServer } from "node:http";
import { type Page, test } from "playwright/test";
import release from "../../../package.json" with { type: "json" };
import { chooseRadio, radioChoice } from "../catalog/native-controls.ts";
import { loadCatalogSources } from "../catalog/source.ts";
import type { releaseProfiles } from "./profiles.ts";
import { siteURL as origin } from "./urls.ts";

const check = (
  name: string,
  run: (page: Page, profile: (typeof releaseProfiles)[number]) => Promise<void>,
) => {
  if (process.env.RELEASE_CHECK && name !== process.env.RELEASE_CHECK) return;
  test(name, async ({ page }, testInfo) => {
    const profile = testInfo.project.metadata.profile as (typeof releaseProfiles)[number];
    page.on("pageerror", (error) => console.error(`${profile.name} page error: ${error.message}`));
    page.on("crash", () => console.error(`${profile.name}: page crashed`));
    await run(page, profile);
  });
};
check("history", async (page) => {
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
  assert.match(
    await page.getByRole("textbox", { name: "Component code", exact: true }).inputValue(),
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
  await page.getByRole("status").filter({ hasText: "State not found" }).waitFor();
  assert.match(
    await page
      .getByRole("status")
      .allTextContents()
      .then((text) => text.join(" ")),
    /State not found/,
  );
});
check("redirected-preview", async (page) => {
  const server = createServer(async (request, response) => {
    const url = new URL(request.url ?? "/", origin);
    if (url.pathname.endsWith("/storybook/iframe.html")) {
      response.writeHead(307, { location: url.pathname.slice(0, -5) + url.search });
      response.end();
      return;
    }
    if (url.pathname.endsWith("/storybook/iframe")) url.pathname += ".html";
    try {
      const upstream = await fetch(`${origin.replace(/\/$/, "")}${url.pathname}${url.search}`);
      response.writeHead(upstream.status, {
        "content-type": upstream.headers.get("content-type") ?? "application/octet-stream",
      });
      response.end(Buffer.from(await upstream.arrayBuffer()));
    } catch {
      response.writeHead(502);
      response.end();
    }
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  assert.ok(address && typeof address === "object");
  try {
    await page.goto(
      `http://127.0.0.1:${address.port}/components/?component=progress&state=components-progress--complete`,
    );
    const frame = page.locator('iframe[data-current="true"]');
    await page.waitForFunction(() => {
      const frame = document.querySelector<HTMLIFrameElement>('iframe[data-current="true"]');
      return frame?.contentDocument?.URL.includes("/storybook/iframe?");
    });
    assert.equal(
      await frame.contentFrame().locator('[role="progressbar"]').getAttribute("aria-valuenow"),
      "100",
    );
    await page.getByText("Loading live example…", { exact: true }).waitFor({ state: "hidden" });
    assert.equal(await frame.getAttribute("aria-busy"), "false");
    assert.equal(await frame.getAttribute("inert"), null);
    await chooseRadio(page, "Example state", "Default");
    await page.getByText("Loading live example…", { exact: true }).waitFor({ state: "hidden" });
    assert.equal(
      await page
        .locator('iframe[data-current="true"]')
        .contentFrame()
        .getByRole("progressbar", { name: "Build", exact: true })
        .getAttribute("aria-valuenow"),
      "40",
    );
  } finally {
    server.closeAllConnections();
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  }
});
check("readiness", async (page) => {
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
check("normalized-readiness", async (page) => {
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
check("slow-retry", async (page) => {
  await page.route("**/storybook/iframe.html?*", (route) =>
    route.fulfill({
      status: 503,
      contentType: "text/html",
      body: "<p>Unavailable fixture</p>",
    }),
  );
  await page.goto(`${origin}/components/?component=input`);
  await page
    .getByText("Still loading. Try reloading, or open this example in Storybook.", {
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
    .getByText("Still loading. Try reloading, or open this example in Storybook.", {
      exact: true,
    })
    .waitFor({ state: "hidden" });
});
check("examples-redirect", async (page) => {
  await page.goto(`${origin}/examples/?theme=dark`);
  await page.waitForURL(/\/recipes\/\?theme=dark$/);
  await page.locator('.kbui-site[data-theme="dark"]').waitFor();
});
check("site-theme", async (page) => {
  await page.emulateMedia({ colorScheme: "dark" });
  for (const path of [
    "/",
    "/setup/",
    "/setup/themes/",
    "/recipes/",
    "/playground/",
    "/components/",
  ]) {
    await page.goto(`${origin}${path}`);
    await page.waitForFunction(
      () => document.querySelector(".kbui-site")?.getAttribute("data-theme") === "dark",
    );
    assert.equal(await page.locator("html").getAttribute("data-theme"), "dark");
    assert.ok(
      !(
        await page
          .getByRole("link", { name: "kbui home", exact: true })
          .first()
          .getAttribute("href")
      )?.includes("theme="),
    );
    await page.emulateMedia({ colorScheme: "light" });
    await page.waitForFunction(
      () => document.querySelector(".kbui-site")?.getAttribute("data-theme") === "light",
    );
    await page.emulateMedia({ colorScheme: "dark" });
    await page.waitForFunction(
      () => document.querySelector(".kbui-site")?.getAttribute("data-theme") === "dark",
    );
  }
  await page.getByRole("switch", { name: "Dark mode", exact: true }).click();
  await page.emulateMedia({ colorScheme: "light" });
  await page.emulateMedia({ colorScheme: "dark" });
  assert.equal(await page.locator(".kbui-site").getAttribute("data-theme"), "light");
  await page.reload();
  assert.equal(await page.locator(".kbui-site").getAttribute("data-theme"), "light");
  await page.getByRole("button", { name: "Use system theme", exact: true }).click();
  await page.waitForFunction(
    () => document.querySelector(".kbui-site")?.getAttribute("data-theme") === "dark",
  );
  assert.equal(new URL(page.url()).searchParams.has("theme"), false);
  assert.equal(await page.evaluate(() => localStorage.getItem("kbui.theme")), null);
  await page.emulateMedia({ colorScheme: "light" });
  await page.waitForFunction(
    () => document.querySelector(".kbui-site")?.getAttribute("data-theme") === "light",
  );
  await page.reload();
  await page.locator(".kbui-site[data-theme=light]").waitFor();
  await page.goto(`${origin}/setup/?theme=dark`);
  await page.locator(".kbui-site[data-theme=dark]").waitFor();
  await page.emulateMedia({ colorScheme: "dark" });
  await page.emulateMedia({ colorScheme: "light" });
  assert.equal(await page.locator(".kbui-site").getAttribute("data-theme"), "dark");
});
check("setup", async (page, profile) => {
  if (profile.browserName === "chromium")
    await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto(origin);
  const builder = page.getByRole("region", { name: "Install kbui", exact: true });
  await builder.getByRole("combobox", { name: "Package manager", exact: true }).click();
  await page.getByRole("option", { name: "Bun", exact: true }).click();
  await builder.getByText("Using tokens in JavaScript or TypeScript?", { exact: true }).click();
  await builder.getByRole("button", { name: "Add typed tokens", exact: true }).click();
  await builder.getByRole("link", { name: "Continue setup" }).click();
  await page.waitForURL("**/setup/?manager=bun&tokens=1");
  await page.reload();
  const command = page.getByRole("region", { name: "Install command", exact: true });
  assert.equal(
    await command.innerText(),
    Number(release.version.split(".")[0]) > 0 || Number(release.version.split(".")[1]) >= 10
      ? `bun add @kb.ui/react@${release.version} @kb.ui/tokens@${release.version}`
      : `bun add https://github.com/KhallilB/kbui/releases/download/v${release.version}/kbui-react-${release.version}.tgz https://github.com/KhallilB/kbui/releases/download/v${release.version}/kbui-tokens-${release.version}.tgz`,
  );
  assert.match(
    await page
      .getByRole("region", { name: "First component React example", exact: true })
      .innerText(),
    /@kb\.ui\/react\/styles\.css/,
  );
  await page
    .getByRole("region", { name: "Install Shell example", exact: true })
    .getByRole("button", { name: "Copy code", exact: true })
    .click();
  await page.getByRole("button", { name: "Copied", exact: true }).waitFor();
  if (profile.browserName === "chromium")
    assert.equal(
      await page.evaluate(() => navigator.clipboard.readText()),
      await command.innerText(),
    );
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
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
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
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
check("motion", async (page, profile) => {
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
    for (const selector of [
      ".about-strip > p",
      ".day-choice .kb-checkbox-label",
      ".day-choice .kb-checkbox-description",
    ]) {
      assert.equal(
        await page
          .locator(selector)
          .first()
          .evaluate((element) => getComputedStyle(element).animationName),
        reduced ? "none" : "kbui-fragment-arrive",
      );
    }
    const copyDelays = await page
      .locator(".day-choice")
      .first()
      .evaluate((element) =>
        Array.from(
          element.querySelectorAll(".kb-checkbox-label, .kb-checkbox-description"),
          (child) => Number.parseFloat(getComputedStyle(child).animationDelay),
        ),
      );
    if (!reduced) {
      const [labelDelay, detailDelay] = copyDelays;
      assert.ok(labelDelay !== undefined && detailDelay !== undefined && detailDelay > labelDelay);
    }
    const title = page.locator(".day-heading h2");
    const entrance = await title.evaluateHandle((element) => element.getAnimations()[0]);
    await page.getByRole("button", { name: "Name your day", exact: true }).click();
    const dialog = page.getByRole("dialog", { name: "Give your day a name", exact: true });
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
      await page
        .getByRole("progressbar", { name: "Activities picked" })
        .getAttribute("aria-valuenow"),
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
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      true,
    );
  }
});
check("updates", async (page) => {
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
    await page.getByRole("textbox", { name: "Component code", exact: true }).waitFor();
    const iframe = page.locator('iframe[data-visible="true"]');
    const stage = page.locator(".catalog-preview-frame");
    const identity = await stage.elementHandle();
    assert.ok(identity);
    const height = await iframe.evaluate((element) => element.getBoundingClientRect().height);
    const toolbar = page.locator(".catalog-editor-panel");
    const top = await toolbar.evaluate((element) => element.getBoundingClientRect().top + scrollY);
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
    const snippet = page.getByRole("textbox", { name: "Component code", exact: true });
    assert.equal(
      await snippet.inputValue(),
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
          .backgroundColor === "rgb(23, 25, 29)",
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
check("surfaces", async (page) => {
  for (const reduced of [false, true]) {
    await page.emulateMedia({ reducedMotion: reduced ? "reduce" : "no-preference" });
    for (const [route, surface] of [
      ["/playground/", ".playground-section"],
      ["/changelog/", ".release-list"],
      ["/components/?view=directory", ".catalog-browser"],
      ["/components/", ".catalog-browser"],
      ["/components/?component=input&view=directory", ".catalog-live"],
    ] as const) {
      await page.goto(`${origin}${route}`);
      assert.equal(
        await page
          .locator(
            surface === ".catalog-live" ? ".catalog-detail:visible .page-heading" : ".page-heading",
          )
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
