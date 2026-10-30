import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  root: "render",
  base: "./",
  plugins: [react(), tailwindcss()],
  build: { outDir: "../.render-dist", emptyOutDir: true },
});
