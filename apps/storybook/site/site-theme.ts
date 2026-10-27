export type Theme = "light" | "dark";
export type ThemePreference = Theme | "system";

export function standaloneSite() {
  return document.getElementById("root") !== null;
}

export function readThemePreference(): ThemePreference {
  const query = new URLSearchParams(window.location.search).get("theme");
  if (query === "light" || query === "dark") return query;
  try {
    const stored = localStorage.getItem("kbui.theme");
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    /* System preference works without storage. */
  }
  return "system";
}

export function readPreferredTheme(): Theme {
  const preference = readThemePreference();
  if (preference !== "system") return preference;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function readSiteTheme(): Theme {
  return standaloneSite() ? readPreferredTheme() : "light";
}

export function retainSiteTheme(theme: ThemePreference) {
  if (!standaloneSite()) return;
  try {
    if (theme === "system") localStorage.removeItem("kbui.theme");
    else localStorage.setItem("kbui.theme", theme);
  } catch {
    /* Preference stays usable without storage. */
  }
  const url = new URL(window.location.href);
  if (theme === "system") url.searchParams.delete("theme");
  else url.searchParams.set("theme", theme);
  url.searchParams.delete("skin");
  window.history.replaceState(window.history.state, "", url);
}
