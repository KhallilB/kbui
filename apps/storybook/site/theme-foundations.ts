import type { CSSProperties } from "react";

import type { Theme } from "./site-theme";

export type { Theme } from "./site-theme";

export function themeStyle(theme: Theme): CSSProperties {
  return { colorScheme: theme };
}
