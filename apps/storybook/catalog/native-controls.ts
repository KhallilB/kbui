import type { Page } from "playwright";

export function radioChoice(page: Page, group: string, name: string) {
  return page
    .getByRole("radiogroup", { name: group, exact: true })
    .getByRole("radio", { name, exact: true });
}

export async function chooseRadio(page: Page, group: string, name: string) {
  // Visible label owns pointer target; radio slot stays clipped for custom paint.
  await radioChoice(page, group, name).locator("xpath=ancestor::label[1]").click();
}
