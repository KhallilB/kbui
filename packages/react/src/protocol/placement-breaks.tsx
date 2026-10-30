import type { StoryObj } from "@storybook/react-vite";
import type { ReactElement } from "react";
import { expect } from "storybook/test";
import type { PlacementContract } from "./placement";
import { checkPlacement } from "./placement-check";

/** One deliberate break: CSS scoped under `[data-break="<name>"]` and the violation it must raise. */
export type PlacementBreak = { css: string; expected: string };

/**
 * Test-only story at 1440px that renders one broken copy of `render` per break.
 * A break that passes its contract means the contract is blind to it.
 */
export function placementBreaksStory(
  contract: PlacementContract,
  render: () => ReactElement,
  breaks: Readonly<Record<string, PlacementBreak>>,
): StoryObj {
  return {
    name: "Placement catches breaks",
    tags: ["!dev", "!autodocs"],
    globals: { viewport: { value: "desktop", isRotated: false } },
    parameters: {
      layout: "fullscreen",
      // Copies of one screen repeat its landmarks; the size stories scan it once.
      a11y: {
        options: {
          rules: {
            "landmark-unique": { enabled: false },
            "landmark-no-duplicate-main": { enabled: false },
          },
        },
      },
    },
    render: () => (
      <>
        <style>{Object.values(breaks).map((broken) => broken.css)}</style>
        {Object.keys(breaks).map((name) => (
          <div key={name} data-break={name}>
            {render()}
          </div>
        ))}
      </>
    ),
    play: async ({ canvasElement }) => {
      expect(window.innerWidth, "viewport width").toBe(1440);
      for (const [name, { expected }] of Object.entries(breaks)) {
        const root = canvasElement.querySelector<HTMLElement>(
          `[data-break="${name}"] ${contract.root}`,
        );
        if (!root) throw new Error(`missing ${name} copy`);
        const errors = checkPlacement(root, contract);
        expect(
          errors.some((error) => error.includes(expected)),
          `${name}: ${errors.join("; ")}`,
        ).toBe(true);
      }
    },
  };
}
