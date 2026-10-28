import release from "../../../package.json" with { type: "json" };

export const releaseVersion = release.version;
export const managers = ["npm", "bun", "pnpm", "yarn"] as const;
export type Manager = (typeof managers)[number];
export type SetupOptions = { manager: Manager; tokens: boolean };
export const themes = ["system", "light", "dark"] as const;
export type Theme = (typeof themes)[number];

const atLeastMinor = (version: string, floor: number) => {
  const [major = 0, minor = 0] = version.split(".").map(Number);
  return major > 0 || minor >= floor;
};
// @kbui/react ships styles.css from 0.7.0; earlier releases also need @kbui/css.
export function bundlesCss(version = releaseVersion): boolean {
  return atLeastMinor(version, 7);
}
// npm has 0.9.0 onward; older releases exist only as GitHub tarballs.
function onRegistry(version = releaseVersion): boolean {
  return atLeastMinor(version, 9);
}
export function stylesheetImport(version = releaseVersion): string {
  return bundlesCss(version) ? "@kbui/react/styles.css" : "@kbui/css/styles.css";
}
export function installCommand(
  manager: Manager,
  tokens: boolean,
  version = releaseVersion,
): string {
  const prefix = manager === "npm" ? "npm install" : `${manager} add`;
  const packages = [
    "react",
    ...(bundlesCss(version) ? [] : ["css"]),
    ...(tokens ? ["tokens"] : []),
  ];
  const source = (name: string) =>
    onRegistry(version)
      ? `@kbui/${name}@${version}`
      : `https://github.com/KhallilB/kbui/releases/download/v${version}/kbui-${name}-${version}.tgz`;
  return `${prefix} ${packages.map(source).join(" ")}`;
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
export const firstComponent = `import "${stylesheetImport()}";
import { Button } from "@kbui/react";

export function App() {
  return <Button>Save changes</Button>;
}`;
