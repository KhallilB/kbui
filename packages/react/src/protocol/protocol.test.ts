/// <reference types="vite/client" />
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { type Card, validateCard } from "./card";
import {
  contractsOf,
  definePlacement,
  type PlacementContract,
  placementClasses,
  rootClass,
  sizeClassOf,
  validatePlacement,
} from "./placement";

const components = join(import.meta.dirname, "../components");
const stylesheets = join(import.meta.dirname, "../../../css/src/components");

function anatomyClasses(name: string) {
  const line = readFileSync(join(stylesheets, `${name.toLowerCase()}.css`), "utf8").split("\n")[0];
  return new Set(line?.match(/\.kb-[a-z][a-z-]*/g) ?? []);
}

const popup: PlacementContract = {
  root: ".kb-dialog-popup",
  rules: [{ part: ":scope", place: "fill" }],
};

describe("placement contracts", () => {
  test("size class follows container width in rem", () => {
    expect([24, 47.9, 48, 63.9, 64, 90].map((width) => sizeClassOf(width))).toEqual([
      "compact",
      "compact",
      "medium",
      "medium",
      "wide",
      "wide",
    ]);
  });

  test("a contract can move where medium and wide begin", () => {
    expect([39.9, 40, 63.9, 64].map((width) => sizeClassOf(width, { medium: 40 }))).toEqual([
      "compact",
      "medium",
      "medium",
      "wide",
    ]);
    expect(sizeClassOf(56, { wide: 56 })).toBe("wide");
    expect(validatePlacement({ ...popup, from: { medium: 0 } })).toEqual([
      ".kb-dialog-popup from.medium must be > 0 rem",
    ]);
    expect(validatePlacement({ ...popup, from: { medium: 64 } })).toEqual([
      ".kb-dialog-popup from.medium must be below from.wide",
    ]);
  });

  test("roots may carry attribute qualifiers", () => {
    for (const root of ['.kb-formsection[data-layout="split"]', ".kb-x[data-a][data-b='c']"])
      expect(validatePlacement({ ...popup, root }), root).toEqual([]);
    for (const root of [".kb-x[", ".kb-x [data-a]", ".kb-x[data-a] .kb-y"])
      expect(validatePlacement({ ...popup, root })).toEqual([`root ${root} is not a kb class`]);
    expect(rootClass('.kb-formsection[data-layout="split"]')).toBe(".kb-formsection");
  });

  test("a module exports one contract or one per arrangement", () => {
    expect(contractsOf(popup)).toEqual([{ contract: popup, ref: "placement" }]);
    expect(contractsOf([popup, popup]).map(({ ref }) => ref)).toEqual([
      "placement[0]",
      "placement[1]",
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
    // Parts that act as the root, such as a dialog popup, are valid roots.
    expect(validatePlacement(popup)).toEqual([]);
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
  // Vite resolves only glob imports, not template-string paths.
  const modules = import.meta.glob<{
    placement: PlacementContract | readonly PlacementContract[];
  }>("../components/*/*.placement.ts");
  const contracts = Object.keys(modules).map((path) => path.split("/")[2] ?? path);
  test.each(contracts)("%s contract matches its anatomy and stories", async (name) => {
    const load = modules[`../components/${name}/${name}.placement.ts`];
    if (!load) throw new Error(`${name}.placement.ts is not named after its folder`);
    const { placement } = await load();
    const declared = anatomyClasses(name);
    const stories = readFileSync(join(components, name, `${name}.placement.stories.tsx`), "utf8");
    for (const { contract, ref } of contractsOf(placement)) {
      expect(validatePlacement(contract)).toEqual([]);
      const own = placementClasses(contract).filter((cls) =>
        cls.startsWith(rootClass(contract.root)),
      );
      expect(own.filter((cls) => !declared.has(cls))).toEqual([]);
      for (const size of ["compact", "medium", "wide"])
        expect(stories, `${name} ${ref} ${size} story`).toContain(`${ref}, "${size}"`);
    }
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
    // Whole-screen intents fill no slot of another piece.
    expect(validateCard({ ...complete, role: null })).toEqual([]);
    // One contract per arrangement, as a module may export.
    expect(validateCard({ ...complete, placement: [popup, popup] })).toEqual([]);
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
