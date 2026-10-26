import assert from "node:assert/strict";
import { chromium, webkit } from "playwright";

const origin = process.env.CONTROL_EDGES_URL ?? "http://127.0.0.1:4174/storybook";
// 640 CSS px models 1280px at 200% browser zoom; this verifies reflow, not browser chrome zoom.
const profiles = [
  { name: "desktop", engine: chromium, width: 1280, height: 900 },
  { name: "narrow", engine: chromium, width: 320, height: 568 },
  { name: "webkit-narrow", engine: webkit, width: 390, height: 844 },
  { name: "200-percent-reflow", engine: chromium, width: 640, height: 450 },
  { name: "webkit-200-percent-reflow", engine: webkit, width: 640, height: 450 },
];

for (const profile of profiles) {
  if (process.env.CONTROL_EDGES_PROFILE && process.env.CONTROL_EDGES_PROFILE !== profile.name)
    continue;
  const browser = await profile.engine.launch();
  try {
    for (const theme of ["light", "dark"]) {
      const page = await browser.newPage({ viewport: profile });
      page.setDefaultTimeout(8000);
      const story = async (name: string) => {
        await page.goto(
          `${origin}/iframe.html?id=site-control-edges--${name}&globals=theme:${theme}`,
        );
        await page.getByRole("heading", { name: "Delivery preferences" }).waitFor();
        await page.waitForFunction(
          (value) => document.documentElement.dataset.theme === value,
          theme,
        );
      };
      await story("form-behavior");
      const form = page.getByRole("form", { name: "Delivery preferences" });
      const save = page.getByRole("button", { name: "Save preferences" });
      const reset = page.getByRole("button", { name: "Reset preferences" });
      const workspace = page.getByRole("textbox", { name: "Workspace name" });
      const agreement = page.getByRole("checkbox", { name: "Confirm sharing" });
      const delivery = page.getByRole("switch", { name: "Enable delivery" });
      const attempts = page.getByLabel("Submit attempts");
      const missing = async (name: string) =>
        form
          .locator(`input[name='${name}']`)
          .first()
          .evaluate((node: HTMLInputElement) => ({
            required: node.required,
            missing: node.validity.valueMissing,
          }));

      await save.click();
      assert.deepEqual(await missing("workspace"), { required: true, missing: true });
      assert.equal(await attempts.textContent(), "0", "Empty submit reached owner handler");
      await workspace.fill("Northstar");
      await save.click();
      assert.deepEqual(await missing("agreement"), { required: true, missing: true });
      assert.equal(await attempts.textContent(), "0");
      await agreement.check();
      await delivery.check();
      await save.click();
      assert.deepEqual(await missing("channel"), { required: true, missing: true });
      assert.equal(await attempts.textContent(), "0", "Empty required radio group submitted");
      await page.getByRole("radio", { name: "Text message" }).click();
      await delivery.uncheck();
      await save.click();
      assert.deepEqual(await missing("delivery"), { required: true, missing: true });
      assert.equal(await attempts.textContent(), "0");
      await delivery.check();
      await save.click();
      await page.getByText("Choose an environment.", { exact: true }).waitFor();
      assert.equal(await attempts.textContent(), "1");
      const select = page.getByRole("combobox", { name: "Environment" });
      assert.equal(await select.getAttribute("aria-invalid"), "true");
      assert.equal(await select.evaluate((node) => node === document.activeElement), true);
      await reset.click();
      assert.equal(await select.getAttribute("aria-invalid"), null);
      assert.equal(await page.getByText("Choose an environment.", { exact: true }).count(), 0);
      assert.equal(await attempts.textContent(), "0");
      await workspace.fill("Northstar");
      await agreement.check();
      await page.getByRole("radio", { name: "Text message" }).click();
      await delivery.check();
      await select.click();
      await page.getByRole("option", { name: "Production", exact: true }).click();
      await page.getByRole("listbox").waitFor({ state: "hidden" });
      await save.click();
      assert.equal(await attempts.textContent(), "1");
      const values = [
        ["workspace", "Northstar"],
        ["agreement", "confirmed"],
        ["channel", "sms"],
        ["delivery", "enabled"],
        ["environment", "production"],
      ];
      assert.deepEqual(
        JSON.parse((await page.getByLabel("Saved values").textContent()) ?? ""),
        values,
      );
      await reset.click();
      assert.equal(await workspace.inputValue(), "");
      assert.equal(await agreement.isChecked(), false);
      assert.equal(await delivery.isChecked(), false);
      for (const radio of await page.getByRole("radio").all())
        assert.equal(await radio.isChecked(), false);
      assert.equal(await select.textContent(), "Choose environment");
      assert.equal(await select.getAttribute("aria-invalid"), null);
      assert.equal(await attempts.textContent(), "0");
      assert.equal(await page.getByLabel("Saved values").textContent(), "Nothing saved");
      const resetValues = await form.evaluate((node: HTMLFormElement) => [
        ...new FormData(node).entries(),
      ]);
      assert.equal(
        resetValues.some(([key]) => ["agreement", "channel", "delivery"].includes(key)),
        false,
      );
      assert.equal(
        resetValues.some(([, value]) => value !== ""),
        false,
      );
      await agreement.focus();
      await page.keyboard.press("Tab");
      const entryState = await form.evaluate((node) => ({
        activeIndex: [...node.querySelectorAll("[role='radio']")].indexOf(
          document.activeElement as Element,
        ),
        radios: [...node.querySelectorAll("[role='radio']")].map((radio) => ({
          checked: radio.getAttribute("aria-checked"),
          tabIndex: radio.getAttribute("tabindex"),
        })),
      }));
      assert(
        entryState.activeIndex >= 0,
        `Reset lost radio keyboard entry: ${JSON.stringify(entryState)}`,
      );
      assert.equal(entryState.radios.filter((radio) => radio.tabIndex === "0").length, 1);
      await page.keyboard.press("ArrowRight");
      assert.equal(
        await page
          .getByRole("radio")
          .nth((entryState.activeIndex + 1) % 2)
          .isChecked(),
        true,
      );

      await story("long-labels");
      const overflow = await page.evaluate(() => {
        const bounds = document.querySelector("main")?.getBoundingClientRect();
        if (!bounds) throw new Error("Missing composed fixture");
        return [
          ...document.querySelectorAll(
            ".kb-input, .kb-checkbox, .kb-radiogroup, .kb-switch, .kb-select",
          ),
        ]
          .filter((node) => node.scrollWidth > node.clientWidth + 1)
          .map((node) => ({
            component: node.className,
            width: node.clientWidth,
            content: node.scrollWidth,
          }));
      });
      assert.deepEqual(overflow, [], `Long labels overflow ${profile.name} ${theme}`);
      await page.getByRole("combobox").click();
      await page.getByRole("option").last().click();
      await page.getByRole("listbox").waitFor({ state: "hidden" });
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        true,
        "Selected long value creates horizontal page scroll",
      );
      assert.equal(
        await page
          .getByRole("combobox")
          .evaluate((node) => node.scrollWidth <= node.clientWidth + 1),
        true,
        "Selected long value clips inside Select",
      );
      console.log(
        `PASS ${profile.name} ${theme}: native required, FormData, owner reset, keyboard entry, long labels`,
      );
      await page.close();
    }
  } finally {
    await browser.close();
  }
}
