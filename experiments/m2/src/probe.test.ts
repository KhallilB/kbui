import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { type Browser, chromium, type Page } from "playwright";
import { probe } from "./probe";

describe("probe", () => {
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    browser = await chromium.launch();
    page = await browser.newPage({ viewport: { width: 390, height: 600 } });
  });

  afterAll(async () => {
    await browser?.close();
  });

  test("flags CSS overflow-x clipping on text leaves", async () => {
    await page.setContent(`
      <div id="root">
        <div data-jr-key="sort-pill" style="width: 60px; overflow-x: hidden; white-space: nowrap; font: 14px sans-serif;">
          Sort by: Featured items first
        </div>
      </div>
    `);
    const res = await page.evaluate(probe);
    expect(res.clipped).toEqual([{ key: "sort-pill", text: "Sort by: Featured items first" }]);
    expect(res.overlaps).toEqual([]);
  });

  test("flags input value and placeholder text wider than available input box", async () => {
    await page.setContent(`
      <div id="root">
        <span data-jr-key="search-input" style="display: contents">
          <input type="text" placeholder="Search orders by customer or SKU" style="width: 90px; padding: 4px 12px; font: 14px sans-serif; box-sizing: border-box;" />
        </span>
        <span data-jr-key="ok-input" style="display: contents">
          <input type="text" value="OK" style="width: 120px; padding: 4px 8px; font: 14px sans-serif; box-sizing: border-box;" />
        </span>
      </div>
    `);
    const res = await page.evaluate(probe);
    expect(res.clipped).toEqual([
      { key: "search-input", text: "Search orders by customer or SKU" },
    ]);
  });

  test("flags card overflow and suppresses cross-card overlap when occluded by opaque neighbor card", async () => {
    await page.setContent(`
      <div id="root" style="display: grid; grid-template-columns: 70px 70px; gap: 8px; width: 148px;">
        <span data-jr-key="card-1" data-jr-type="Card" style="display: contents">
          <div style="background: rgb(255, 255, 255); border: 1px solid #ccc; padding: 8px;">
            <span data-jr-key="badge-1" style="display: inline-block; background: rgb(240, 240, 240); white-space: nowrap; font: 14px sans-serif;">
              +12.4% vs previous period
            </span>
          </div>
        </span>
        <span data-jr-key="card-2" data-jr-type="Card" style="display: contents">
          <div style="background: rgb(255, 255, 255); border: 1px solid #ccc; padding: 8px;">
            <span data-jr-key="badge-2" style="display: inline-block; background: rgb(240, 240, 240); white-space: nowrap; font: 14px sans-serif;">
              +8.1% vs previous
            </span>
          </div>
        </span>
      </div>
    `);
    const res = await page.evaluate(probe);
    expect(res.clipped.map((c) => c.key)).toContain("badge-1");
    expect(res.overlaps).toEqual([]);
  });

  test("flags unwrapped text glyph overlap inside narrow table columns via Range bounds", async () => {
    await page.setContent(`
      <div id="root">
        <span data-jr-key="table-card" data-jr-type="Card" style="display: contents">
          <div style="background: rgb(255, 255, 255); width: 220px;">
            <table style="width: 120px; table-layout: fixed; border-collapse: collapse; font: 14px sans-serif;">
              <thead>
                <tr>
                  <th data-jr-key="col-att" style="width: 45px; text-align: left; white-space: nowrap;">ATTENDANCE</th>
                  <th data-jr-key="col-asn" style="width: 45px; text-align: left; white-space: nowrap;">ASSIGNMENT</th>
                </tr>
              </thead>
            </table>
          </div>
        </span>
      </div>
    `);
    const res = await page.evaluate(probe);
    expect(res.overlaps).toEqual([expect.objectContaining({ a: "col-att", b: "col-asn" })]);
  });
});
