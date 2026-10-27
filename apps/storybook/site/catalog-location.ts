export function normalizeCatalogLocation(location: URL): { url: URL; redirect: boolean } {
  const url = new URL(location);
  const view = url.searchParams.get("view");
  if (url.searchParams.has("skin")) url.searchParams.delete("skin");
  if (url.searchParams.has("view")) url.searchParams.delete("view");
  if (view === "overview") {
    const base = new URL(url);
    if (!base.pathname.endsWith("/") && !base.pathname.endsWith("/index.html"))
      base.pathname += "/";
    const qa = new URL("qa/", base);
    qa.search = url.search;
    qa.hash = url.hash;
    return { url: qa, redirect: true };
  }
  return { url, redirect: false };
}
