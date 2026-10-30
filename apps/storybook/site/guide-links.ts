import { recipeDefinitions } from "../catalog/content";

export function guideLink(href: string, guide: string, siteRoot: string): string {
  if (href.startsWith("#")) return href;
  const url = new URL(href, `https://github.com/KhallilB/kbui/blob/main/${guide}`);
  if (url.protocol !== "https:" && url.protocol !== "http:") return "#";
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
