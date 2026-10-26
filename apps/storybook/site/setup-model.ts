export const releaseVersion = "0.5.0";
export const managers = ["npm", "bun", "pnpm", "yarn"] as const;
export type Manager = (typeof managers)[number];
export type SetupOptions = { manager: Manager; tokens: boolean };
export const themes = ["system", "light", "dark"] as const;
export type Theme = (typeof themes)[number];

export function installCommand(manager: Manager, tokens: boolean): string {
  const prefix = manager === "npm" ? "npm install" : `${manager} add`;
  const packages = tokens ? ["react", "css", "tokens"] : ["react", "css"];
  return `${prefix} ${packages.map((name) => `https://github.com/KhallilB/kbui/releases/download/v${releaseVersion}/kbui-${name}-${releaseVersion}.tgz`).join(" ")}`;
}
export function readSetup(search: string): SetupOptions {
  const query = new URLSearchParams(search);
  const manager = query.get("manager");
  return {
    manager: managers.find((value) => value === manager) ?? "npm",
    tokens: query.get("tokens") === "1",
  };
}
export function setupHref(root: string, options: SetupOptions): string {
  const query = new URLSearchParams({ manager: options.manager });
  if (options.tokens) query.set("tokens", "1");
  return `${root}setup/?${query}`;
}
export function themeMarkup(theme: Theme): string {
  return `<html lang="en"${theme === "system" ? "" : ` data-theme="${theme}"`}>`;
}
export const firstComponent = `import "@kbui/css/styles.css";
import { Button } from "@kbui/react";

export function App() {
  return <Button>Save changes</Button>;
}`;
