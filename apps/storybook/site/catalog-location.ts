export function normalizeCatalogLocation(location: URL): { url: URL; redirect: boolean } {
  const url = new URL(location);
  if (url.searchParams.has("skin")) url.searchParams.delete("skin");
  if (url.searchParams.has("view")) url.searchParams.delete("view");
  if (/\/qa(?:\/index\.html|\/)?$/.test(url.pathname)) {
    url.pathname = url.pathname.replace(/\/qa(?:\/index\.html|\/)?$/, "/");
    return { url, redirect: true };
  }
  return { url, redirect: false };
}
