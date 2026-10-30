import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { catalogPlugin } from "./catalog/source";
import { themeBootstrapPlugin } from "./site/theme-bootstrap";

export default defineConfig({
  root: fileURLToPath(new URL("./site", import.meta.url)),
  base: "./",
  plugins: [themeBootstrapPlugin(), react(), catalogPlugin()],
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    rolldownOptions: {
      input: {
        compare: fileURLToPath(new URL("./site/compare/index.html", import.meta.url)),
        setup: fileURLToPath(new URL("./site/setup/index.html", import.meta.url)),
        themes: fileURLToPath(new URL("./site/setup/themes/index.html", import.meta.url)),
        components: fileURLToPath(new URL("./site/components/index.html", import.meta.url)),
        componentQa: fileURLToPath(new URL("./site/components/qa/index.html", import.meta.url)),
        home: fileURLToPath(new URL("./site/index.html", import.meta.url)),
        playground: fileURLToPath(new URL("./site/playground/index.html", import.meta.url)),
        examples: fileURLToPath(new URL("./site/examples/index.html", import.meta.url)),
        recipes: fileURLToPath(new URL("./site/recipes/index.html", import.meta.url)),
        changelog: fileURLToPath(new URL("./site/changelog/index.html", import.meta.url)),
      },
    },
  },
});
