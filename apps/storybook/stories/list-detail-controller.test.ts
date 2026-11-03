import { describe, expect, test } from "bun:test";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { recipeDefinitions } from "../catalog/content";
import {
  type FlowAction,
  type FlowState,
  filtersActive,
  initialFlowState,
  reduceFlow,
  visibleRecords,
} from "../recipes/list-detail-controller";

const root = resolve(import.meta.dir, "../../..");
const controllerPath = "apps/storybook/recipes/list-detail-controller.ts";
const read = (path: string) => readFileSync(resolve(root, path), "utf8");
const componentOf = (recipe: (typeof recipeDefinitions)[number]) =>
  recipe.files.find((path) => path.endsWith(".tsx")) ?? "";
// ListDetail before it moved onto the controller.
const mainEra = "d3f4d1229a51da00abfde2458056112458a007d7";

type Item = { id: string; name: string; tag: "a" | "b" };
type Draft = { name: string };
type Filter = "all" | "a" | "b";

const items: Item[] = [
  { id: "1", name: "One", tag: "a" },
  { id: "2", name: "Two", tag: "b" },
  { id: "3", name: "Three", tag: "a" },
];
const matches = (item: Item, query: string, filter: Filter) =>
  (filter === "all" || item.tag === filter) &&
  item.name.toLowerCase().includes(query.trim().toLowerCase());

function run(
  actions: FlowAction<Item, Draft, Filter>[],
  state: FlowState<Item, Draft, Filter> = initialFlowState<Item, Draft, Filter>({
    selectedId: null,
    defaultFilter: "all",
  }),
): FlowState<Item, Draft, Filter> {
  return actions.reduce(reduceFlow, state);
}

describe("initial state", () => {
  test("a starting selection becomes the return row", () => {
    const state = initialFlowState<Item, Draft, Filter>({ selectedId: "2", defaultFilter: "all" });
    expect(state.selectedId).toBe("2");
    expect(state.lastSelectedId).toBe("2");
  });

  test("an empty starting id reads as no selection", () => {
    const state = initialFlowState<Item, Draft, Filter>({ selectedId: "", defaultFilter: "all" });
    expect(state.selectedId).toBeNull();
    expect(state.lastSelectedId).toBeNull();
  });
});

describe("navigation", () => {
  test("select opens a record", () => {
    expect(run([{ type: "select", id: "1" }]).selectedId).toBe("1");
  });

  test("open from the list keeps the previous return row", () => {
    const state = run([
      { type: "select", id: "1" },
      { type: "select", id: null },
      { type: "select", id: "2" },
    ]);
    expect(state.lastSelectedId).toBe("1");
  });

  test("open from another record makes that record the return row", () => {
    const state = run([
      { type: "select", id: "1" },
      { type: "select", id: "2" },
    ]);
    expect(state.lastSelectedId).toBe("1");
  });

  test("back clears selection and keeps the originating row", () => {
    const state = run([
      { type: "select", id: "3" },
      { type: "select", id: null },
    ]);
    expect(state.selectedId).toBeNull();
    expect(state.lastSelectedId).toBe("3");
  });

  // Router changes and list clicks share one transition.
  test("history updates the return row", () => {
    const forward = run([
      { type: "select", id: "1" },
      { type: "select", id: "2" },
    ]);
    const backAgain = run([{ type: "select", id: null }], forward);
    expect(backAgain.lastSelectedId).toBe("2");
  });

  test("selecting the open record again changes nothing", () => {
    const opened = run([{ type: "select", id: "1" }]);
    expect(run([{ type: "select", id: "1" }], opened)).toBe(opened);
  });
});

describe("drafts", () => {
  test("begin drafts the selected record", () => {
    const state = run([
      { type: "select", id: "1" },
      { type: "begin", draft: { name: "One" } },
    ]);
    expect(state.drafts["1"]).toEqual({ name: "One" });
  });

  test("begin without a selected record changes nothing", () => {
    const empty = run([]);
    expect(run([{ type: "begin", draft: { name: "One" } }], empty)).toBe(empty);
  });

  test("drafts belong to their record and survive navigation", () => {
    const state = run([
      { type: "select", id: "1" },
      { type: "begin", draft: { name: "One" } },
      { type: "change", draft: { name: "Unfinished" } },
      { type: "select", id: null },
      { type: "select", id: "2" },
      { type: "select", id: null },
      { type: "select", id: "1" },
    ]);
    expect(state.drafts["1"]).toEqual({ name: "Unfinished" });
    expect(state.drafts["2"]).toBeUndefined();
  });

  test("discard drops only the selected draft, its errors and its failure", () => {
    const state = run([
      { type: "select", id: "2" },
      { type: "begin", draft: { name: "Two" } },
      { type: "select", id: "1" },
      { type: "begin", draft: { name: "One" } },
      { type: "submit", id: "1", errors: { name: "Required" } },
      { type: "failed", id: "1" },
      { type: "discard" },
    ]);
    expect(state.drafts["1"]).toBeUndefined();
    expect(state.errors["1"]).toBeUndefined();
    expect(state.failures["1"]).toBeUndefined();
    expect(state.drafts["2"]).toEqual({ name: "Two" });
  });

  test("a commit drops the draft and records it against its base", () => {
    const base = items[2] as Item;
    const state = run([
      { type: "select", id: "3" },
      { type: "begin", draft: { name: "Third" } },
      { type: "submit", id: "3", errors: {} },
      { type: "committed", id: "3", base, draft: { name: "Third" } },
    ]);
    expect(state.drafts["3"]).toBeUndefined();
    expect(state.pending["3"]).toBeUndefined();
    expect(state.committed["3"]).toEqual({ base, drafts: [{ name: "Third" }] });
    expect(state.committed["1"]).toBeUndefined();
  });
});

describe("commits", () => {
  const begun = run([
    { type: "select", id: "1" },
    { type: "begin", draft: { name: "Uno" } },
  ]);

  test("invalid fields keep the draft and start nothing", () => {
    const state = run([{ type: "submit", id: "1", errors: { name: "Required" } }], begun);
    expect(state.errors["1"]).toEqual({ name: "Required" });
    expect(state.pending["1"]).toBeUndefined();
    expect(state.drafts["1"]).toEqual({ name: "Uno" });
  });

  test("a commit while pending is ignored", () => {
    const pending = run([{ type: "submit", id: "1", errors: {} }], begun);
    expect(pending.pending["1"]).toBe(true);
    expect(run([{ type: "submit", id: "1", errors: { name: "Required" } }], pending)).toBe(pending);
  });

  test("a valid submit clears the previous errors and failure", () => {
    const state = run(
      [
        { type: "submit", id: "1", errors: { name: "Required" } },
        { type: "submit", id: "1", errors: {} },
        { type: "failed", id: "1" },
        { type: "submit", id: "1", errors: {} },
      ],
      begun,
    );
    expect(state.errors["1"]).toBeUndefined();
    expect(state.failures["1"]).toBeUndefined();
    expect(state.pending["1"]).toBe(true);
  });

  test("a refused commit keeps the draft with the server's errors", () => {
    const state = run(
      [
        { type: "submit", id: "1", errors: {} },
        { type: "refused", id: "1", errors: { form: "Denied" } },
      ],
      begun,
    );
    expect(state.errors["1"]).toEqual({ form: "Denied" });
    expect(state.pending["1"]).toBeUndefined();
    expect(state.drafts["1"]).toEqual({ name: "Uno" });
  });

  test("a failed commit keeps the draft and marks the failure", () => {
    const state = run(
      [
        { type: "submit", id: "1", errors: {} },
        { type: "failed", id: "1" },
      ],
      begun,
    );
    expect(state.failures["1"]).toBe(true);
    expect(state.pending["1"]).toBeUndefined();
    expect(state.drafts["1"]).toEqual({ name: "Uno" });
  });

  test("commits append while the base matches and reset once it changes", () => {
    const base = items[0] as Item;
    const echoed = { ...base, name: "Uno" };
    const commit = (draft: Draft, from: Item): FlowAction<Item, Draft, Filter>[] => [
      { type: "begin", draft },
      { type: "submit", id: "1", errors: {} },
      { type: "committed", id: "1", base: from, draft },
    ];
    const twice = run([...commit({ name: "Uno" }, base), ...commit({ name: "Ein" }, base)], begun);
    expect(twice.committed["1"]?.drafts).toEqual([{ name: "Uno" }, { name: "Ein" }]);
    const after = run(commit({ name: "Un" }, echoed), twice);
    expect(after.committed["1"]).toEqual({ base: echoed, drafts: [{ name: "Un" }] });
  });

  test("a commit with no base drops the draft and keeps the committed view", () => {
    const state = run(
      [
        { type: "submit", id: "1", errors: {} },
        { type: "committed", id: "1", base: undefined, draft: { name: "Uno" } },
      ],
      begun,
    );
    expect(state.drafts["1"]).toBeUndefined();
    expect(state.committed["1"]).toBeUndefined();
  });

  test("removal drops the draft, errors and failure", () => {
    const state = run(
      [
        { type: "submit", id: "1", errors: { name: "Required" } },
        { type: "failed", id: "1" },
        { type: "remove", id: "1" },
      ],
      begun,
    );
    expect(state.drafts["1"]).toBeUndefined();
    expect(state.errors["1"]).toBeUndefined();
    expect(state.failures["1"]).toBeUndefined();
  });
});

describe("filters", () => {
  test("query and filter narrow visible records without changing selection", () => {
    const state = run([
      { type: "select", id: "2" },
      { type: "setFilter", filter: "a" },
      { type: "setQuery", query: " THR " },
    ]);
    expect(visibleRecords(items, state, matches).map((item) => item.id)).toEqual(["3"]);
    expect(state.selectedId).toBe("2");
    expect(filtersActive(state)).toBe(true);
  });

  test("a cleared filter value falls back to the default", () => {
    const state = run([
      { type: "setFilter", filter: "b" },
      { type: "setFilter", filter: null },
    ]);
    expect(state.filter).toBe("all");
    expect(filtersActive(state)).toBe(false);
  });

  test("clear filters resets query and filter", () => {
    const state = run([
      { type: "setQuery", query: "x" },
      { type: "setFilter", filter: "b" },
      { type: "clearFilters" },
    ]);
    expect(state.query).toBe("");
    expect(state.filter).toBe("all");
    expect(filtersActive(state)).toBe(false);
  });

  test("a whitespace query stays raw, so clearing it remains available", () => {
    const state = run([{ type: "setQuery", query: "  " }]);
    expect(visibleRecords(items, state, matches)).toHaveLength(3);
    expect(filtersActive(state)).toBe(true);
  });
});

const family = recipeDefinitions.filter((recipe) => recipe.flow === "list-detail");
const owners = recipeDefinitions.filter((recipe) => recipe.files.includes(controllerPath));
const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Names, params, copy exports, policy literals and domain words of any list-and-detail recipe. */
function recipeNamesIn(source: string): string[] {
  // Line 1 is the provenance header, owned by recipe-provenance.test.ts.
  const body = source.split("\n").slice(1).join("\n");
  const words = family.flatMap((recipe) => {
    const component = read(componentOf(recipe));
    return [
      recipe.name,
      recipe.id,
      ...[...component.matchAll(/searchParamRouter\("([^"]+)"\)/g)].map((match) => match[1] ?? ""),
      ...[...component.matchAll(/export const (\w+Copy)\b/g)].map((match) => match[1] ?? ""),
    ];
  });
  const literals = family.flatMap((recipe) =>
    Object.values(recipe.policy ?? {}).filter((value) => typeof value === "string"),
  );
  return [
    ...words.filter((word) => new RegExp(`\\b${escapeRegExp(word)}\\b`, "i").test(body)),
    ...literals.filter((value) => new RegExp(`["'\`]${escapeRegExp(value)}["'\`]`).test(body)),
    ...["Request", "Thread", "Reply", "Replies", "Member"].filter((word) =>
      new RegExp(`\\b${word}`, "i").test(body),
    ),
  ];
}

const mechanics = [
  "router.subscribe",
  "router.write",
  "observeHiddenFocus",
  "takeFocusTarget",
  "isFocusDisconnected",
  "useAnnounce",
  "history.pushState",
  "onFocusCapture",
];
const mechanicsIn = (source: string) => mechanics.filter((token) => source.includes(token));

describe("controller guards", () => {
  test("the controller names no recipe", () => {
    expect(family.map((recipe) => recipe.name)).toEqual(["ListDetail", "Inbox"]);
    expect(recipeNamesIn(read(controllerPath))).toEqual([]);
  });

  test("a recipe branch injected into the controller fails the name guard", () => {
    const source = read(controllerPath).replace(
      "export function useListDetailFlow",
      'if (recipe === "Inbox") throw new Error();\nexport function useListDetailFlow',
    );
    expect(recipeNamesIn(source)).toContain("Inbox");
  });

  test("compositions on the controller keep no flow mechanics", () => {
    expect(owners.map((recipe) => recipe.name)).toContain("ListDetail");
    for (const recipe of owners)
      expect(mechanicsIn(read(componentOf(recipe))), recipe.name).toEqual([]);
  });

  test("the main-era ListDetail fails the composition guard", () => {
    const source = execFileSync(
      "git",
      ["show", `${mainEra}:apps/storybook/recipes/ListDetail.tsx`],
      { cwd: root, encoding: "utf8" },
    );
    expect(mechanicsIn(source)).toEqual(
      expect.arrayContaining(["router.subscribe", "router.write", "observeHiddenFocus"]),
    );
  });
});
