import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { definePlacement, type PlacementContract } from "./placement";
import { checkPlacement, sizeClassOfRoot } from "./placement-check";
import { placementStory } from "./placement-story";

// Self-test for the checker: one fixture that keeps the contract, then one copy per broken rule.
const meta = { title: "Placement/Checker", tags: ["!dev", "!autodocs"] } satisfies Meta;
export default meta;

const contract = definePlacement({
  root: ".kb-placementfixture",
  rules: [
    { part: ":scope", place: "fill" },
    { part: ":scope", place: "stack", at: ["compact"] },
    { part: ".kb-placementfixture-main", place: "start" },
    { part: ".kb-placementfixture-main p", place: "measure", max: 30 },
    { part: ".kb-placementfixture-actions", place: "end" },
    // A padded control is placed by its box, not its label.
    { part: "[data-primary]", place: "end" },
    { part: ".kb-placementfixture-actions", place: "last" },
    { part: ".kb-placementfixture-actions", place: "line" },
    { part: ".kb-placementfixture-actions", place: "primary-last", primary: "[data-primary]" },
  ],
});

const css = `
.kb-placementfixture-region { container-type: inline-size; }
.kb-placementfixture-region[data-pane] { inline-size: 24rem; }
.kb-placementfixture { display: grid; grid-template-columns: minmax(0, 1fr); gap: 1rem; padding: 1rem; border: 1px solid; }
.kb-placementfixture-main p { max-inline-size: 30rem; margin: 0; }
.kb-placementfixture-scroll { overflow-x: auto; }
.kb-placementfixture-scroll button { margin-inline-start: 200rem; }
.kb-placementfixture-actions { display: flex; justify-content: flex-end; gap: 0.5rem; }
.kb-placementfixture button { min-block-size: 32px; padding-inline: 0.75rem; }
@container (width >= 48rem) {
  .kb-placementfixture { grid-template-columns: minmax(0, 1fr) auto; align-items: start; }
}
[data-break="fill"] { inline-size: 50%; }
[data-break="end"] { grid-template-columns: auto minmax(0, 1fr); }
[data-break="end"] .kb-placementfixture-actions { justify-content: flex-start; }
[data-break="last"] .kb-placementfixture-actions { order: -1; }
[data-break="line"] .kb-placementfixture-actions { flex-direction: column; }
[data-break="primary"] [data-primary] { order: -1; }
[data-break="measure"] .kb-placementfixture-main p { max-inline-size: none; }
[data-break="overflow"] { overflow: hidden; }
[data-break="overflow"] .kb-placementfixture-main p { inline-size: 200rem; max-inline-size: none; }
[data-break="target"] [data-primary] { min-block-size: 0; block-size: 16px; padding: 0; font-size: 10px; }
[data-break="overlap"] [data-primary] { margin-inline-start: -2rem; }
`;

function Fixture({ broken, pane }: { broken?: string; pane?: boolean }) {
  return (
    <div className="kb-placementfixture-region" data-pane={pane || undefined}>
      <section
        className="kb-placementfixture"
        data-break={broken}
        aria-label={broken ?? (pane ? "Pane fixture" : "Fixture")}
      >
        <div className="kb-placementfixture-main">
          <h2>Members</h2>
          <p>
            People who can open this workspace, with their <a href="#roles">roles</a> and the date
            they joined it.
          </p>
          {/* biome-ignore lint/a11y/noNoninteractiveTabindex: axe needs scrollers focusable. */}
          <div className="kb-placementfixture-scroll" tabIndex={0}>
            <button type="button">Older entries</button>
          </div>
        </div>
        <div className="kb-placementfixture-actions">
          <button type="button">Cancel</button>
          <button type="button" data-primary>
            Save
          </button>
        </div>
      </section>
    </div>
  );
}

const render = () => (
  <>
    <style>{css}</style>
    <Fixture />
  </>
);

export const PlacementCompact = placementStory(contract, "compact", render);
export const PlacementMedium = placementStory(contract, "medium", render);
export const PlacementWide = placementStory(contract, "wide", render);

// Each break must surface as its own violation; a silent pass means the checker is blind to it.
const breaks = {
  fill: ":scope fill",
  end: ".kb-placementfixture-actions end",
  last: ".kb-placementfixture-actions last",
  line: ".kb-placementfixture-actions line",
  primary: ".kb-placementfixture-actions primary-last",
  measure: ".kb-placementfixture-main p measure",
  overflow: "overflows sideways",
  target: 'target "Save" is',
  overlap: '"Cancel" overlaps "Save"',
} as const;

export const CatchesBrokenRules: StoryObj = {
  globals: { viewport: { value: "desktop", isRotated: false } },
  // The target and overlap fixtures fail axe's target-size rule by design.
  parameters: { a11y: { config: { rules: [{ id: "target-size", enabled: false }] } } },
  render: () => (
    <>
      <style>{css}</style>
      <Fixture />
      <Fixture pane />
      {Object.keys(breaks).map((broken) => (
        <Fixture key={broken} broken={broken} />
      ))}
    </>
  ),
  play: async ({ canvasElement }) => {
    expect(window.innerWidth).toBe(1440);
    const [kept, pane] = canvasElement.querySelectorAll<HTMLElement>(
      ".kb-placementfixture:not([data-break])",
    );
    if (!kept || !pane) throw new Error("missing kept fixtures");
    expect(sizeClassOfRoot(kept)).toBe("wide");
    expect(checkPlacement(kept, contract)).toEqual([]);
    // A narrow pane on a wide page is compact: its parent decides, not the viewport.
    expect(sizeClassOfRoot(pane)).toBe("compact");
    expect(checkPlacement(pane, contract)).toEqual([]);
    // The pane still stacks, so a medium-only line rule fires only once medium starts at 20rem.
    const sideBySide = { ...contract, rules: [{ part: ":scope", place: "line", at: ["medium"] }] };
    expect(checkPlacement(pane, sideBySide as PlacementContract)).toEqual([]);
    expect(sizeClassOfRoot(pane, { medium: 20 })).toBe("medium");
    expect(
      checkPlacement(pane, { ...sideBySide, from: { medium: 20 } } as PlacementContract),
    ).toContain(".kb-placementfixture :scope line: children wrap onto more than one line");
    // Side by side at 1440, so the compact-only stack rule must fire when asked.
    expect(checkPlacement(kept, contract, "compact")).toContain(
      ".kb-placementfixture :scope stack: child 2 is not below child 1",
    );
    for (const [broken, expected] of Object.entries(breaks)) {
      const root = canvasElement.querySelector<HTMLElement>(`[data-break="${broken}"]`);
      if (!root) throw new Error(`missing ${broken} fixture`);
      const errors = checkPlacement(root, contract);
      expect(
        errors.some((error) => error.includes(expected)),
        `${broken}: ${errors.join("; ")}`,
      ).toBe(true);
    }
  },
};
