export type Theme = "light" | "dark";

export function standaloneSite() {
  return document.getElementById("root") !== null;
}

export function readSiteTheme(): Theme {
  if (!standaloneSite()) return "light";
  const query = new URLSearchParams(window.location.search).get("theme");
  if (query === "light" || query === "dark") return query;
  try {
    return localStorage.getItem("kbui.theme") === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

export function retainSiteTheme(theme: Theme) {
  if (!standaloneSite()) return;
  try {
    localStorage.setItem("kbui.theme", theme);
  } catch {
    /* Preference stays usable without storage. */
  }
  const url = new URL(window.location.href);
  url.searchParams.set("theme", theme);
  url.searchParams.delete("skin");
  window.history.replaceState(null, "", url);
}
