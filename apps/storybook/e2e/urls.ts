export const externalSiteURL =
  process.env.CATALOG_PREVIEW_URL ??
  process.env.RECIPE_SITE_URL ??
  process.env.LANDING_PREVIEW_URL ??
  process.env.STORYBOOK_URL?.replace(/\/storybook\/?$/, "");

export const siteURL = externalSiteURL ?? "http://127.0.0.1:4177";
export const storybookURL = process.env.STORYBOOK_URL ?? `${siteURL}/storybook`;

export const externalInternalURL =
  process.env.FOCUS_PREVIEW_URL ?? process.env.CONTROL_EDGES_URL?.replace(/\/storybook\/?$/, "");

export const internalURL = externalInternalURL ?? "http://127.0.0.1:4178";
export const internalStorybookURL = process.env.CONTROL_EDGES_URL ?? `${internalURL}/storybook`;
