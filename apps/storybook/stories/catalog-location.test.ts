import { expect, test } from "bun:test";
import { normalizeCatalogLocation } from "../site/catalog-location";

test("canonical catalog URL preserves selection, theme, unrelated query and hash", () => {
  const original = new URL(
    "https://example.com/kbui/components/?component=input&state=recipe&theme=dark&tag=a%20b&tag=b#api",
  );
  const result = normalizeCatalogLocation(original);
  expect(result.redirect).toBe(false);
  expect(result.url.href).toBe(original.href);
  expect(result.url).not.toBe(original);
});

for (const view of ["live", "directory"]) {
  test(`legacy ${view} stays in catalog without obsolete query state`, () => {
    const original = new URL(
      `https://example.com/kbui/components/?view=${view}&skin=current&component=input&state=recipe&theme=dark&tag=a&tag=b#api`,
    );
    const result = normalizeCatalogLocation(original);
    expect(result.redirect).toBe(false);
    expect(result.url.pathname).toBe("/kbui/components/");
    expect(result.url.searchParams.has("view")).toBe(false);
    expect(result.url.searchParams.has("skin")).toBe(false);
    expect(result.url.searchParams.get("component")).toBe("input");
    expect(result.url.searchParams.get("state")).toBe("recipe");
    expect(result.url.searchParams.get("theme")).toBe("dark");
    expect(result.url.searchParams.getAll("tag")).toEqual(["a", "b"]);
    expect(result.url.hash).toBe("#api");
    expect(original.searchParams.get("view")).toBe(view);
  });
}

for (const prefix of ["", "/kbui"]) {
  for (const ending of ["/", "/index.html", ""]) {
    test(`legacy overview redirects relative to ${prefix}/components${ending}`, () => {
      const result = normalizeCatalogLocation(
        new URL(
          `https://example.com${prefix}/components${ending}?view=overview&skin=current&component=input&state=recipe&theme=dark&tag=a&tag=b#api`,
        ),
      );
      expect(result.redirect).toBe(true);
      expect(result.url.origin).toBe("https://example.com");
      expect(result.url.pathname).toBe(`${prefix}/components/qa/`);
      expect(result.url.searchParams.has("view")).toBe(false);
      expect(result.url.searchParams.has("skin")).toBe(false);
      expect(result.url.searchParams.get("component")).toBe("input");
      expect(result.url.searchParams.get("state")).toBe("recipe");
      expect(result.url.searchParams.get("theme")).toBe("dark");
      expect(result.url.searchParams.getAll("tag")).toEqual(["a", "b"]);
      expect(result.url.hash).toBe("#api");
    });
  }
}

test("obsolete skin alone is removed without redirect", () => {
  const result = normalizeCatalogLocation(
    new URL("https://example.com/components/?skin=sleek&theme=light"),
  );
  expect(result.redirect).toBe(false);
  expect(result.url.search).toBe("?theme=light");
});
