import type { Decorator } from "@storybook/react-vite";
import type { CSSProperties } from "react";
import { facetedSkin } from "./faceted-skin-values";

export const withFacetedSkin: Decorator = (Story) => (
  <div data-skin="faceted" style={facetedSkin as CSSProperties}>
    <Story />
  </div>
);
