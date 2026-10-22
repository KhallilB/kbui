import type { Decorator } from "@storybook/react-vite";
import type { CSSProperties } from "react";
import { skinFixture } from "./skin-fixture-values";

export const withSkinFixture: Decorator = (Story) => (
  <div data-skin="fixture" style={skinFixture as CSSProperties}>
    <Story />
  </div>
);
