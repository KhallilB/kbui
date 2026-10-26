import "@kbui/css/styles.css";
import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Catalog } from "../Catalog";

const root = document.getElementById("root");
if (!root) throw new Error("Missing site root");
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
