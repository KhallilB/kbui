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
      navigationRevision={location.revision}
      initialAppearance={{
        theme: readSiteTheme(),
        live: location.query.get("view") !== "directory",
        overview: location.query.get("view") === "overview",
      }}
      onAppearanceChange={({ theme, live, overview }) => {
        const url = new URL(window.location.href);
        url.searchParams.delete("skin");
        url.searchParams.set("theme", theme);
        const view = overview ? "overview" : live ? "live" : "directory";
        const previous = url.searchParams.get("view") ?? "live";
        url.searchParams.set("view", view);
        if (view !== previous && view !== "live") url.searchParams.delete("component");
        window.history.replaceState(null, "", url);
        setLocation((current) => ({ ...current, query: url.searchParams }));
      }}
      onComponentChange={(id, stateId) => {
        const url = new URL(window.location.href);
        url.searchParams.set("component", id);
        if (stateId) url.searchParams.set("state", stateId);
        else url.searchParams.delete("state");
        window.history.pushState(null, "", url);
        setLocation((current) => ({ ...current, query: url.searchParams }));
      }}
      componentId={location.query.get("component")}
      stateId={location.query.get("state")}
      onStateChange={(id, componentId) => {
        const url = new URL(window.location.href);
        url.searchParams.set("state", id);
        if (componentId) url.searchParams.set("component", componentId);
        window.history.pushState(null, "", url);
        setLocation((current) => ({ ...current, query: url.searchParams }));
      }}
    />
  );
}
createRoot(root).render(
  <StrictMode>
    <CatalogRoute />
  </StrictMode>,
);
