import "@kbui/css/styles.css";
import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Catalog } from "../Catalog";
import { normalizeCatalogLocation } from "../catalog-location";
import { readSiteTheme } from "../site-theme";

const root = document.getElementById("root");
if (!root) throw new Error("Missing site root");
function canonicalCatalogUrl() {
  const { url, redirect } = normalizeCatalogLocation(new URL(window.location.href));
  if (redirect) {
    window.location.replace(url.href);
    return null;
  }
  if (url.href !== window.location.href) window.history.replaceState(window.history.state, "", url);
  return url;
}
const initialUrl = canonicalCatalogUrl();
function CatalogRoute() {
  const [location, setLocation] = useState(() => ({
    query: new URLSearchParams(window.location.search),
    revision: 0,
  }));
  useEffect(() => {
    const restore = () => {
      const url = canonicalCatalogUrl();
      if (url)
        setLocation((current) => ({
          query: url.searchParams,
          revision: current.revision + 1,
        }));
    };
    window.addEventListener("popstate", restore);
    return () => window.removeEventListener("popstate", restore);
  }, []);
  return (
    <Catalog
      navigationRevision={location.revision}
      initialAppearance={{ theme: readSiteTheme() }}
      initialCompare={["true", "1"].includes(location.query.get("compare") ?? "")}
      onCompareChange={(compare: boolean) => {
        const url = new URL(window.location.href);
        if (compare) url.searchParams.set("compare", "true");
        else url.searchParams.delete("compare");
        window.history.replaceState(window.history.state, "", url);
        setLocation((current) => ({ ...current, query: url.searchParams }));
      }}
      onAppearanceChange={({ theme }) => {
        const url = new URL(window.location.href);
        url.searchParams.set("theme", theme);
        window.history.replaceState(window.history.state, "", url);
        setLocation((current) => ({ ...current, query: url.searchParams }));
      }}
      onComponentChange={(id, stateId) => {
        const url = new URL(window.location.href);
        if (id === null) {
          url.searchParams.delete("component");
          url.searchParams.delete("state");
        } else {
          url.searchParams.set("component", id);
          if (stateId) url.searchParams.set("state", stateId);
          else url.searchParams.delete("state");
        }
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
if (initialUrl)
  createRoot(root).render(
    <StrictMode>
      <CatalogRoute />
    </StrictMode>,
  );
