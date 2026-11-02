import { describe, expect, test } from "bun:test";
import type { Spec } from "@json-render/core";
import type { RuleId } from "./rules";
import { treeFindingsV2 } from "./rules-v2";

type El = Record<string, unknown>;

function page(children: [string, El][], state: Record<string, unknown> = {}): Spec {
  const elements = Object.fromEntries(
    children.map(([k, e]) => [k, { children: [], props: {}, ...e }]),
  );
  const top = children.filter(
    ([k]) => !children.some(([, e]) => (e.children as string[] | undefined)?.includes(k)),
  );
  return {
    root: "root",
    elements: { root: { type: "Stack", props: {}, children: top.map(([k]) => k) }, ...elements },
    state,
  } as unknown as Spec;
}

const fired = (s: Spec, rule: RuleId) =>
  treeFindingsV2(s).filter((f) => f.rule === rule).length > 0;

describe("v2 rules", () => {
  test("INT-2 counts only irreversible actions, still excused by a confirm", () => {
    const button = (label: string, on: El = {}): [string, El] => [
      "b",
      { type: "Button", props: { label }, on },
    ];
    expect(fired(page([button("Remove")]), "INT-2")).toBe(false);
    expect(fired(page([button("Disconnect")]), "INT-2")).toBe(false);
    expect(fired(page([button("Delete account")]), "INT-2")).toBe(true);
    expect(fired(page([button("Cancel subscription")]), "INT-2")).toBe(true);
    expect(
      fired(
        page([button("Delete account", { press: { action: "x", confirm: { title: "Sure?" } } })]),
        "INT-2",
      ),
    ).toBe(false);
  });

  test("INT-3 catches common deadline and scarcity copy", () => {
    const text = (t: string): [string, El] => ["t", { type: "Text", props: { text: t } }];
    expect(fired(page([text("Sale ends Sunday at 11:59 PM")]), "INT-3")).toBe(true);
    expect(fired(page([text("Stock is limited.")]), "INT-3")).toBe(true);
    expect(fired(page([text("Once it's gone, it's gone!")]), "INT-3")).toBe(true);
    expect(fired(page([text("Free shipping on every order")]), "INT-3")).toBe(false);
  });

  test("DES-1 counts filled danger buttons and ignores closed dialogs", () => {
    const card = (kids: string[]): [string, El] => ["card", { type: "Card", children: kids }];
    expect(
      fired(
        page([
          card(["save", "drop"]),
          ["save", { type: "Button", props: { label: "Save", variant: "primary" } }],
          ["drop", { type: "Button", props: { label: "Disable", variant: "danger" } }],
        ]),
        "DES-1",
      ),
    ).toBe(true);
    expect(
      fired(
        page(
          [
            ["go", { type: "Button", props: { label: "Invite", variant: "primary" } }],
            [
              "dlg",
              { type: "Dialog", props: { title: "Invite", openPath: "/open" }, children: ["send"] },
            ],
            ["send", { type: "Button", props: { label: "Send", variant: "primary" } }],
          ],
          { open: false },
        ),
        "DES-1",
      ),
    ).toBe(false);
  });

  test("DATA-2 asks for an empty state only on lists the UI can empty", () => {
    const list: [string, El] = [
      "l",
      { type: "Stack", repeat: { statePath: "/items" }, children: ["i"] },
    ];
    const item: [string, El] = ["i", { type: "Text", props: { text: { $item: "name" } } }];
    const remove: [string, El] = [
      "rm",
      {
        type: "Button",
        props: { label: "Remove" },
        on: { press: { action: "removeState", params: { statePath: "/items", index: 0 } } },
      },
    ];
    const empty: [string, El] = [
      "e",
      { type: "Text", props: { text: "Nothing yet" }, visible: { $state: "/items", eq: [] } },
    ];
    expect(fired(page([list, item]), "DATA-2")).toBe(false);
    expect(fired(page([list, item, remove]), "DATA-2")).toBe(true);
    expect(fired(page([list, item, remove, empty]), "DATA-2")).toBe(false);
  });
});
