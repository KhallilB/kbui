import "@kbui/css/styles.css";
import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Catalog } from "../Catalog";
import { readSiteTheme } from "../site-theme";

const root = document.getElementById("root");
if (!root) throw new Error("Missing site root");
const clean = new URL(window.location.href);
if (clean.searchParams.has("skin")) {
  clean.searchParams.delete("skin");
  window.history.replaceState(null, "", clean);
}
function CatalogRoute() {
  const [location, setLocation] = useState(() => ({
    query: new URLSearchParams(window.location.search),
    revision: 0,
  }));
  useEffect(() => {
    const restore = () =>
      setLocation((current) => ({
        query: new URLSearchParams(window.location.search),
        revision: current.revision + 1,
      }));
    window.addEventListener("popstate", restore);
    return () => window.removeEventListener("popstate", restore);
  }, []);
  return (
    <Catalog
      key={location.revision}
      initialAppearance={{ theme: readSiteTheme(), live: location.query.get("view") === "live" }}
      onAppearanceChange={({ theme, live }) => {
        const url = new URL(window.location.href);
        url.searchParams.delete("skin");
        url.searchParams.set("theme", theme);
        url.searchParams.set("view", live ? "live" : "directory");
        window.history.replaceState(null, "", url);
      }}
      componentId={location.query.get("component")}
      stateId={location.query.get("state")}
      onStateChange={(id) => {
        const url = new URL(window.location.href);
        url.searchParams.set("state", id);
        window.history.pushState(null, "", url);
      }}
    />
  );
}
createRoot(root).render(
  <StrictMode>
    <CatalogRoute />
  </StrictMode>,
);
