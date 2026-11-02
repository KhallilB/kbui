import { recipeDefinitions } from "../catalog/content";

/** Published site; guides link here so a copied guide still resolves. */
export const siteOrigin = "https://kbui.kcb.pro";

export function guideLink(href: string, guide: string, siteRoot: string): string {
  if (href.startsWith("#")) return href;
  const url = new URL(href, `https://github.com/KhallilB/kbui/blob/main/${guide}`);
  if (url.protocol !== "https:" && url.protocol !== "http:") return "#";
  // Keeps previews and local builds on their own host.
  if (url.origin === siteOrigin)
    return `${siteRoot}${url.pathname.slice(1)}${url.search}${url.hash}`;
  const prefix = "/KhallilB/kbui/blob/main/";
  if (url.origin !== "https://github.com" || !url.pathname.startsWith(prefix)) return url.href;
  const path = url.pathname.slice(prefix.length);
  const component = /^packages\/react\/docs\/components\/(\w+)\.md$/.exec(path);
  if (component?.[1])
    return `${siteRoot}components/?component=${component[1].toLowerCase()}${url.hash}`;
  const recipe = recipeDefinitions.find((entry) => entry.guide === path);
  if (recipe) return `${siteRoot}recipes/?recipe=${recipe.id}${url.hash}`;
  if (path === "docs/guides/components-and-recipes.md") return `${siteRoot}recipes/#system-guide`;
  return url.href;
}
