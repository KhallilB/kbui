import "@kbui/css/styles.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Examples } from "./Examples";
import { Home } from "./Home";
import { Setup } from "./Setup";
import { SkinComparison } from "./SkinComparison";
import { Workbench } from "./Workbench";

const root = document.getElementById("root");
if (!root) throw new Error("Missing site root");
createRoot(root).render(
  <StrictMode>
    {root.dataset.page === "setup" || root.dataset.page === "setup-theme" ? (
      <Setup
        themePage={root.dataset.page === "setup-theme"}
        siteRoot={root.dataset.page === "setup-theme" ? "../../" : "../"}
        storybookRoot={root.dataset.page === "setup-theme" ? "../../storybook/" : "../storybook/"}
        search={window.location.search}
      />
    ) : root.dataset.page === "compare" ? (
      <SkinComparison />
    ) : root.dataset.page === "playground" ? (
      <Workbench />
    ) : root.dataset.page === "examples" ? (
      <Examples />
    ) : (
      <Home />
    )}
  </StrictMode>,
);
