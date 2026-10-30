import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { type Card, validateCard } from "./card";
import {
  definePlacement,
  type PlacementContract,
  placementClasses,
  sizeClassOf,
  validatePlacement,
} from "./placement";

const components = join(import.meta.dirname, "../components");
const stylesheets = join(import.meta.dirname, "../../../css/src/components");

function anatomyClasses(name: string) {
  const line = readFileSync(join(stylesheets, `${name.toLowerCase()}.css`), "utf8").split("\n")[0];
  return new Set(line?.match(/\.kb-[a-z][a-z-]*/g) ?? []);
}

describe("placement contracts", () => {
  test("size class follows container width in rem", () => {
    expect([24, 47.9, 48, 63.9, 64, 90].map(sizeClassOf)).toEqual([
      "compact",
      "compact",
      "medium",
      "medium",
      "wide",
      "wide",
    ]);
  });

  test("validation names empty, unscoped and unbounded rules", () => {
    const errors = validatePlacement({
      root: "section",
      rules: [
        { part: " ", place: "fill" },
        { part: ".kb-x-a", place: "end", at: [] },
        { part: ".kb-x-b", place: "measure", max: 0 },
      ],
    });
    expect(errors).toEqual([
      "root section is not a kb class",
      "section   fill: empty part",
      "section .kb-x-a end: empty at",
      "section .kb-x-b measure: max must be > 0 rem",
    ]);
    expect(validatePlacement({ root: ".kb-x", rules: [] })).toEqual([".kb-x has no rules"]);
  });

  test("lists every kb class a contract names", () => {
    const contract = definePlacement({
      root: ".kb-x",
      rules: [
        { part: ":scope > .kb-x-a", place: "end", of: ".kb-y" },
        { part: ".kb-x-b", place: "primary-last", primary: ".kb-button[data-variant]" },
      ],
    });
    expect(placementClasses(contract)).toEqual([
      ".kb-x",
      ".kb-x-a",
      ".kb-y",
      ".kb-x-b",
      ".kb-button",
    ]);
  });

  // Each contract sits beside its component, names only classes its anatomy declares,
  // and has placement stories at all three size classes.
  const contracts = readdirSync(components).filter((name) =>
    existsSync(join(components, name, `${name}.placement.ts`)),
  );
  test.each(contracts)("%s contract matches its anatomy and stories", async (name) => {
    const { placement } = (await import(`../components/${name}/${name}.placement.ts`)) as {
      placement: PlacementContract;
    };
    expect(validatePlacement(placement)).toEqual([]);
    const declared = anatomyClasses(name);
    const own = placementClasses(placement).filter((cls) => cls.startsWith(placement.root));
    expect(own.filter((cls) => !declared.has(cls))).toEqual([]);
    const stories = readFileSync(join(components, name, `${name}.placement.stories.tsx`), "utf8");
    for (const size of ["compact", "medium", "wide"])
      expect(stories, `${name} ${size} story`).toContain(`placement, "${size}"`);
  });
});

describe("identity cards", () => {
  const complete: Card = {
    role: "region",
    use: "Group related fields with their own actions.",
    instead: { Fieldset: "the fields have no actions of their own" },
    slots: { actions: { roles: ["action"], max: 2 } },
  };

  test("a complete card has no gaps", () => {
    expect(validateCard(complete)).toEqual([]);
  });

  test("names each gap", () => {
    expect(
      validateCard({
        ...complete,
        use: " ",
        instead: { Fieldset: "" },
        slots: { actions: { roles: [] } },
      }),
    ).toEqual(["use is empty", "instead.Fieldset is empty", "slots.actions accepts no role"]);
    expect(validateCard({ ...complete, instead: {}, slots: {} })).toEqual([
      "instead names no neighbour",
      "slots is empty",
    ]);
  });
});
