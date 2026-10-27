import "@kbui/css/styles.css";
import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { CatalogQa } from "../../CatalogQa";
import { readSiteTheme } from "../../site-theme";

const root = document.getElementById("root");
if (!root) throw new Error("Missing site root");

function CatalogQaRoute() {
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
  const update = (values: Record<string, string | null>) => {
    const url = new URL(window.location.href);
    url.searchParams.delete("skin");
    url.searchParams.delete("view");
    for (const [name, value] of Object.entries(values)) {
      if (value === null) url.searchParams.delete(name);
      else url.searchParams.set(name, value);
    }
    window.history.replaceState(null, "", url);
  };
  return (
    <CatalogQa
      key={location.revision}
      componentId={location.query.get("component")}
      stateId={location.query.get("state")}
      initialCompare={["true", "1"].includes(location.query.get("compare") ?? "")}
      initialTheme={readSiteTheme()}
      onCompareChange={(compare) => update({ compare: compare ? "true" : null })}
      onStateChange={(component, state) => update({ component, state })}
    />
  );
}

createRoot(root).render(
  <StrictMode>
    <CatalogQaRoute />
  </StrictMode>,
);
