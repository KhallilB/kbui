import { describe, expect, test } from "bun:test";
import type { Spec } from "@json-render/core";
import { type Dom, domFindings, type RuleId, treeFindings } from "./rules";

type El = Record<string, unknown>;

function spec(elements: Record<string, El>, state: Record<string, unknown> = {}): Spec {
  const all = Object.fromEntries(
    Object.entries(elements).map(([k, e]) => [k, { children: [], props: {}, ...e }]),
  );
  return { root: "root", elements: all, state } as unknown as Spec;
}

function page(...children: [string, El][]): Spec {
  return spec({
    root: { type: "Stack", children: children.map(([k]) => k) },
    ...Object.fromEntries(children),
  });
}

const rules = (s: Spec) => treeFindings(s).map((f) => f.rule);
const fires = (s: Spec, rule: RuleId) => expect(rules(s)).toContain(rule);
const quiet = (s: Spec, rule: RuleId) => expect(rules(s)).not.toContain(rule);

describe("integrity", () => {
  test("INT-1 flags password and card fields only", () => {
    fires(page(["pw", { type: "Input", props: { label: "Password", type: "password" } }]), "INT-1");
    fires(page(["cc", { type: "Input", props: { label: "Card number" } }]), "INT-1");
    quiet(page(["em", { type: "Input", props: { label: "Email", type: "email" } }]), "INT-1");
  });

  test("INT-2 needs a confirm, a dialog, or an overlay ancestor", () => {
    fires(
      page([
        "del",
        { type: "Button", props: { label: "Delete account" }, on: { press: { action: "x" } } },
      ]),
      "INT-2",
    );
    quiet(
      page([
        "del",
        {
          type: "Button",
          props: { label: "Delete account" },
          on: { press: { action: "x", confirm: { title: "Sure?" } } },
        },
      ]),
      "INT-2",
    );
    quiet(
      page(
        [
          "open",
          {
            type: "Button",
            props: { label: "Delete" },
            on: { press: { action: "setState", params: { statePath: "/d" } } },
          },
        ],
        ["dlg", { type: "Dialog", props: { title: "Delete?", openPath: "/d" }, children: ["ok"] }],
        ["ok", { type: "Button", props: { label: "Delete", variant: "danger" } }],
      ),
      "INT-2",
    );
    quiet(page(["save", { type: "Button", props: { label: "Save changes" } }]), "INT-2");
  });

  test("INT-3 reads props and seeded state", () => {
    fires(page(["t", { type: "Text", props: { text: "Only 3 left in stock" } }]), "INT-3");
    fires(
      spec(
        { root: { type: "Text", props: { text: { $state: "/b" } } } },
        { b: "Hurry, sale ends tonight" },
      ),
      "INT-3",
    );
    quiet(page(["t", { type: "Text", props: { text: "Free returns within 30 days" } }]), "INT-3");
  });

  test("INT-4 follows bindings into seeded state", () => {
    const opt = (checked: unknown) =>
      ["nl", { type: "Switch", props: { label: "Email me the newsletter", checked } }] as [
        string,
        El,
      ];
    fires(page(opt(true)), "INT-4");
    fires(
      spec(
        {
          root: {
            type: "Switch",
            props: { label: "Marketing emails", checked: { $bindState: "/n" } },
          },
        },
        { n: true },
      ),
      "INT-4",
    );
    quiet(page(opt(false)), "INT-4");
    quiet(page(["t", { type: "Switch", props: { label: "Dark mode", checked: true } }]), "INT-4");
  });

  test("INT-5 catches shaming decline copy", () => {
    fires(
      page(["no", { type: "Link", props: { label: "No thanks, I don't like saving money" } }]),
      "INT-5",
    );
    quiet(page(["no", { type: "Link", props: { label: "Not now" } }]), "INT-5");
  });
});

describe("design", () => {
  test("DES-1 counts filled buttons per card", () => {
    const btn = (v: unknown) => ({ type: "Button", props: { label: "Go", variant: v } });
    fires(
      spec({ root: { type: "Card", children: ["a", "b"] }, a: btn("primary"), b: btn(null) }),
      "DES-1",
    );
    quiet(
      spec({
        root: { type: "Card", children: ["a", "b"] },
        a: btn("primary"),
        b: btn("secondary"),
      }),
      "DES-1",
    );
    quiet(
      spec({
        root: { type: "Stack", children: ["c1", "c2"] },
        c1: { type: "Card", children: ["a"] },
        c2: { type: "Card", children: ["b"] },
        a: btn("primary"),
        b: btn("primary"),
      }),
      "DES-1",
    );
  });

  test("DES-2 flags skipped levels and a second h1", () => {
    const h = (level: string) => ({ type: "Heading", props: { text: "x", level } });
    fires(page(["a", h("h1")], ["b", h("h3")]), "DES-2");
    fires(page(["a", h("h1")], ["b", h("h1")]), "DES-2");
    quiet(page(["a", h("h1")], ["b", h("h2")], ["c", h("h3")], ["d", h("h2")]), "DES-2");
  });
});

describe("arrangement and data", () => {
  test("ARR-1 allows seven levels", () => {
    const chain = (n: number) => {
      const els: Record<string, El> = {};
      for (let i = 0; i < n; i++)
        els[i === 0 ? "root" : `n${i}`] = {
          type: "Stack",
          children: i < n - 1 ? [`n${i + 1}`] : [],
        };
      return spec(els);
    };
    quiet(chain(7), "ARR-1");
    fires(chain(8), "ARR-1");
  });

  test("DATA-1 flags long tables and repeats without pagination", () => {
    const rows = Array.from({ length: 11 }, (_, i) => [`r${i}`]);
    fires(page(["t", { type: "Table", props: { columns: ["a"], rows } }]), "DATA-1");
    quiet(
      page(
        ["t", { type: "Table", props: { columns: ["a"], rows } }],
        ["p", { type: "Pagination", props: { totalPages: 2 } }],
      ),
      "DATA-1",
    );
    quiet(
      page(["t", { type: "Table", props: { columns: ["a"], rows: rows.slice(0, 10) } }]),
      "DATA-1",
    );
  });

  test("DATA-2 accepts any element whose visibility reads the list", () => {
    const list: [string, El] = [
      "l",
      { type: "Stack", repeat: { statePath: "/items" }, children: ["i"] },
    ];
    const item: [string, El] = ["i", { type: "Text", props: { text: { $item: "name" } } }];
    fires(page(list, item), "DATA-2");
    quiet(
      page(list, item, [
        "e",
        { type: "Text", props: { text: "Nothing yet" }, visible: { $state: "/items", eq: [] } },
      ]),
      "DATA-2",
    );
  });
});

test("domFindings maps measurements to rules per width", () => {
  const dom: Dom = {
    width: 390,
    overflowX: true,
    clipped: [],
    overlaps: [{ a: "x", b: "y", area: 120 }],
    axe: [
      { id: "target-size", impact: "serious", keys: ["btn"] },
      { id: "color-contrast", impact: "serious", keys: ["t"] },
    ],
  };
  expect(domFindings([dom]).map((f) => `${f.rule}@${f.width}`)).toEqual([
    "ARR-2@390",
    "ARR-3@390",
    "ARR-4@390",
  ]);
});
