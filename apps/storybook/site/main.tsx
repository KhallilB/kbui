import "./layers.css";
import "@kb.ui/css/styles.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Changelog } from "./Changelog";
import { Examples } from "./Examples";
import { Home } from "./Home";
import { Recipes } from "./Recipes";
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
    ) : root.dataset.page === "recipes" ? (
      <Recipes search={window.location.search} />
    ) : root.dataset.page === "changelog" ? (
      <Changelog />
    ) : (
      <Home />
    )}
  </StrictMode>,
);
