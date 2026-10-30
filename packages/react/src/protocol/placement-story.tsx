import type { StoryObj } from "@storybook/react-vite";
import type { ReactElement } from "react";
import { expect } from "storybook/test";
import { type PlacementContract, type SizeClass, sizeClasses } from "./placement";
import { checkPlacement, sizeClassOfRoot } from "./placement-check";

// Names from the preview's viewport options; addon-vitest resizes the page to them.
const viewports = { compact: "mobile", medium: "tablet", wide: "desktop" } as const;

/**
 * Test-only story at the size class's real viewport; fails on any broken rule.
 * Export one per size class from `<Name>.placement.stories.tsx`.
 */
export function placementStory(
  contract: PlacementContract,
  size: SizeClass,
  render: () => ReactElement,
): StoryObj {
  return {
    name: `Placement ${sizeClasses[size]}px`,
    tags: ["!dev", "!autodocs"],
    globals: { viewport: { value: viewports[size], isRotated: false } },
    // No page padding, so a full-width root's parent is exactly the viewport's size class.
    parameters: { layout: "fullscreen" },
    render,
    play: async ({ canvasElement }) => {
      // Guards a silent fallback to the default viewport, which would test the wrong size.
      expect(window.innerWidth, "viewport width").toBe(sizeClasses[size]);
      const html = document.documentElement;
      expect(html.scrollWidth, "page overflows sideways").toBeLessThanOrEqual(html.clientWidth);
      const roots = [...canvasElement.querySelectorAll<HTMLElement>(contract.root)];
      expect(roots.length, `${contract.root} rendered`).toBeGreaterThan(0);
      expect(
        roots.map((root) => sizeClassOfRoot(root, contract.from)),
        "size class of each root",
      ).toContain(size);
      for (const root of roots) expect(checkPlacement(root, contract)).toEqual([]);
    },
  };
}
