import type { StoryObj } from "@storybook/react-vite";
import type { ReactElement } from "react";
import { expect, waitFor, within } from "storybook/test";
import { page } from "vitest/browser";

type Canvas = ReturnType<typeof within>;
type User = {
  click: (element: Element) => Promise<void>;
  keyboard: (keys: string) => Promise<void>;
  type: (element: Element, text: string) => Promise<void>;
  clear: (element: Element) => Promise<void>;
};
export type Send = (id: string, body: string) => Promise<void>;

/** One record the contract opens: its id, list row and detail heading. */
type Entry = { id: string; row: RegExp; heading: string };

/** What a list-and-detail recipe exposes to the shared flow contract. */
export type FlowFixture = {
  recipe: string;
  param: string;
  render: (options: { initialId?: string | undefined; send?: Send | undefined }) => ReactElement;
  first: Entry;
  second: Entry;
  /** Matches `second` but not `first`. */
  query: string;
  missingHeading: string;
  names: { search: string; back: string; clear: string };
  draft: {
    begin: RegExp;
    field: string;
    discard: string;
    submit: string;
    /** Field value when a draft starts. */
    pristine: string;
    invalid: string;
  };
  /** One complete successful commit on the open record. */
  commit: (canvas: Canvas, user: User) => Promise<void>;
  /** The region that announces commit outcomes. */
  status: (root: HTMLElement) => HTMLElement;
  /** Present when commits are asynchronous. */
  async?: { pendingSubmit: string } | undefined;
  /** Rules the recipe breaks today, with why; each must still fail. */
  gaps: Partial<Record<RuleId, string>>;
};

type Context = {
  fixture: FlowFixture;
  root: HTMLElement;
  canvas: Canvas;
  user: User;
  send: Deferred;
};

export type Rule = {
  /** What a recipe guarantees; shown when a gap closes. */
  summary: string;
  /** Fixture capability the rule needs; recipes without it skip the rule. */
  requires?: "async";
  /** Viewport width; omitted runs at the test default. */
  width?: number;
  initialId?: string;
  /** URL search set before render. */
  search?: (fixture: FlowFixture) => string;
  deferredSend?: boolean;
  check: (context: Context) => Promise<void>;
};

/** Send whose next call waits for `settle`. */
export type Deferred = Send & { calls: number; settle: (ok: boolean) => void };

export function deferred(): Deferred {
  let finish: (ok: boolean) => void = () => {};
  const send = Object.assign(
    () => {
      send.calls += 1;
      return new Promise<void>((resolve, reject) => {
        finish = (ok) => (ok ? resolve() : reject(new Error("offline")));
      });
    },
    { calls: 0, settle: (ok: boolean) => finish(ok) },
  );
  return send;
}

// Reselecting an open record must move focus without a visible lag.
const RESELECT_FOCUS_MS = 500;

async function open(canvas: Canvas, user: User, entry: Entry) {
  await user.click(canvas.getByRole("button", { name: entry.row }));
  await waitFor(() => expect(canvas.getByRole("heading", { name: entry.heading })).toHaveFocus());
}

async function back(canvas: Canvas, user: User, fixture: FlowFixture) {
  await user.click(canvas.getByRole("button", { name: fixture.names.back }));
}

function heading(canvas: Canvas, entry: Entry) {
  return canvas.getByRole("heading", { name: entry.heading });
}

function selection(fixture: FlowFixture) {
  return new URL(window.location.href).searchParams.get(fixture.param);
}

function pending(fixture: FlowFixture) {
  if (!fixture.async) throw new Error(`${fixture.recipe} has no asynchronous commit`);
  return fixture.async.pendingSubmit;
}

const definitions = {
  "open-focus": {
    summary: "Opening a record focuses its heading",
    check: async ({ fixture, canvas, user }) => {
      canvas.getByRole("button", { name: fixture.first.row }).focus();
      await user.keyboard("{Enter}");
      await expect(heading(canvas, fixture.first)).toHaveFocus();
    },
  },
  "unavailable-focus": {
    summary: "An unknown record id focuses the unavailable heading",
    initialId: "missing-record",
    check: async ({ fixture, canvas }) => {
      await waitFor(() =>
        expect(canvas.getByRole("heading", { name: fixture.missingHeading })).toHaveFocus(),
      );
    },
  },
  reselect: {
    summary: "Reselecting the open record focuses its heading without a history entry",
    width: 1280,
    check: async ({ fixture, canvas, user }) => {
      await open(canvas, user, fixture.first);
      const entries = window.history.length;
      await user.click(canvas.getByRole("button", { name: fixture.first.row }));
      await waitFor(() => expect(heading(canvas, fixture.first)).toHaveFocus(), {
        timeout: RESELECT_FOCUS_MS,
      });
      expect(window.history.length).toBe(entries);
    },
  },
  "return-row": {
    summary: "Back returns focus to the row that opened the record",
    check: async ({ fixture, canvas, user }) => {
      await open(canvas, user, fixture.first);
      await back(canvas, user, fixture);
      await expect(canvas.getByRole("button", { name: fixture.first.row })).toHaveFocus();
    },
  },
  "filtered-return": {
    summary: "Back focuses search when the opening row is filtered out",
    width: 1280,
    check: async ({ fixture, canvas, user }) => {
      await open(canvas, user, fixture.first);
      await user.type(canvas.getByRole("searchbox", { name: fixture.names.search }), fixture.query);
      await back(canvas, user, fixture);
      await expect(canvas.getByRole("searchbox", { name: fixture.names.search })).toHaveFocus();
    },
  },
  history: {
    summary: "Browser Back and Forward restore the row and heading of the latest record",
    check: async ({ fixture, canvas, user }) => {
      await open(canvas, user, fixture.first);
      await back(canvas, user, fixture);
      await open(canvas, user, fixture.second);
      window.history.back();
      await waitFor(() =>
        expect(canvas.getByRole("button", { name: fixture.second.row })).toHaveFocus(),
      );
      window.history.forward();
      await waitFor(() => expect(heading(canvas, fixture.second)).toHaveFocus());
    },
  },
  resize: {
    summary: "Narrowing to one pane moves focus from the hidden list to the heading",
    width: 1440,
    check: async ({ fixture, canvas, user }) => {
      await open(canvas, user, fixture.first);
      canvas.getByRole("searchbox", { name: fixture.names.search }).focus();
      await page.viewport(390, 844);
      await waitFor(() => expect(heading(canvas, fixture.first)).toHaveFocus());
    },
  },
  drafts: {
    summary: "Drafts stay with their record across navigation; discard restores the original",
    check: async ({ fixture, canvas, user }) => {
      await open(canvas, user, fixture.first);
      await user.click(canvas.getByRole("button", { name: fixture.draft.begin }));
      const field = canvas.getByRole("textbox", { name: fixture.draft.field });
      await user.clear(field);
      await user.type(field, "Kept draft");
      await back(canvas, user, fixture);
      await open(canvas, user, fixture.second);
      expect(canvas.queryByRole("textbox", { name: fixture.draft.field })).toBeNull();
      await back(canvas, user, fixture);
      await open(canvas, user, fixture.first);
      await expect(canvas.getByRole("textbox", { name: fixture.draft.field })).toHaveValue(
        "Kept draft",
      );
      await user.click(canvas.getByRole("button", { name: fixture.draft.discard }));
      await user.click(canvas.getByRole("button", { name: fixture.draft.begin }));
      await expect(canvas.getByRole("textbox", { name: fixture.draft.field })).toHaveValue(
        fixture.draft.pristine,
      );
    },
  },
  "async-completion": {
    summary: "A commit settling after navigation sends once and leaves focus where the user is",
    requires: "async",
    deferredSend: true,
    check: async ({ fixture, root, canvas, user, send }) => {
      const pendingSubmit = pending(fixture);
      await open(canvas, user, fixture.first);
      await user.click(canvas.getByRole("button", { name: fixture.draft.begin }));
      await user.type(canvas.getByRole("textbox", { name: fixture.draft.field }), "Once");
      await user.click(canvas.getByRole("button", { name: fixture.draft.submit }));
      await expect(canvas.getByRole("button", { name: pendingSubmit })).toBeDisabled();
      await back(canvas, user, fixture);
      await open(canvas, user, fixture.second);
      send.settle(true);
      await waitFor(() => expect(fixture.status(root).textContent).not.toMatch(/^Sending/));
      await expect(heading(canvas, fixture.second)).toHaveFocus();
      expect(send.calls).toBe(1);
    },
  },
  validation: {
    summary: "An invalid commit keeps the value, focuses the field and describes the error",
    check: async ({ fixture, canvas, user }) => {
      await open(canvas, user, fixture.first);
      await user.click(canvas.getByRole("button", { name: fixture.draft.begin }));
      const field = canvas.getByRole("textbox", { name: fixture.draft.field });
      await user.clear(field);
      await user.type(field, "   ");
      await user.click(canvas.getByRole("button", { name: fixture.draft.submit }));
      await expect(field).toHaveFocus();
      await expect(field).toHaveValue("   ");
      await expect(field).toHaveAccessibleDescription(fixture.draft.invalid);
    },
  },
  "current-row": {
    summary: "Only the open record's row carries aria-current",
    width: 1280,
    check: async ({ fixture, canvas, user }) => {
      await open(canvas, user, fixture.first);
      const row = canvas.getByRole("button", { name: fixture.first.row });
      expect(row).toHaveAttribute("aria-current", "true");
      expect(row).not.toHaveFocus();
      expect(canvas.getByRole("button", { name: fixture.second.row })).not.toHaveAttribute(
        "aria-current",
      );
    },
  },
  routing: {
    summary: "The selection parameter follows the open record and keeps other parameters",
    search: () => "?keep=1",
    check: async ({ fixture, canvas, user }) => {
      await open(canvas, user, fixture.first);
      expect(selection(fixture)).toBe(fixture.first.id);
      expect(new URL(window.location.href).searchParams.get("keep")).toBe("1");
      await back(canvas, user, fixture);
      expect(selection(fixture)).toBeNull();
      expect(new URL(window.location.href).searchParams.get("keep")).toBe("1");
    },
  },
  announcements: {
    summary: "A repeated identical outcome is announced again",
    check: async ({ fixture, root, canvas, user }) => {
      await open(canvas, user, fixture.first);
      await fixture.commit(canvas, user);
      const status = fixture.status(root);
      const before = status.textContent;
      let changes = 0;
      const observer = new MutationObserver((records) => {
        changes += records.length;
      });
      observer.observe(status, { subtree: true, childList: true, characterData: true });
      try {
        await fixture.commit(canvas, user);
        await waitFor(() =>
          expect(changes, "identical outcome must be announced again").toBeGreaterThan(0),
        );
      } finally {
        observer.disconnect();
      }
      expect(status.textContent).toBe(before);
    },
  },
  filters: {
    summary: "Filters persist, keep the open record open, and Clear focuses search",
    width: 1280,
    check: async ({ fixture, canvas, user }) => {
      await open(canvas, user, fixture.first);
      const search = canvas.getByRole("searchbox", { name: fixture.names.search });
      await user.type(search, fixture.query);
      expect(canvas.queryByRole("button", { name: fixture.first.row })).toBeNull();
      await expect(heading(canvas, fixture.first)).toBeVisible();
      await back(canvas, user, fixture);
      await expect(search).toHaveValue(fixture.query);
      await user.click(canvas.getByRole("button", { name: fixture.names.clear }));
      await expect(search).toHaveFocus();
      await expect(search).toHaveValue("");
    },
  },
  "pending-focus": {
    summary: "Focus stays on an enabled control while a commit is pending",
    requires: "async",
    deferredSend: true,
    check: async ({ fixture, canvas, user, send }) => {
      const pendingSubmit = pending(fixture);
      await open(canvas, user, fixture.first);
      await user.click(canvas.getByRole("button", { name: fixture.draft.begin }));
      await user.type(canvas.getByRole("textbox", { name: fixture.draft.field }), "Pending");
      await user.click(canvas.getByRole("button", { name: fixture.draft.submit }));
      await expect(canvas.getByRole("button", { name: pendingSubmit })).toBeDisabled();
      try {
        const active = document.activeElement;
        expect(active, "focus left the flow").not.toBe(document.body);
        expect(active).not.toBeDisabled();
      } finally {
        send.settle(true);
      }
    },
  },
  "empty-selection": {
    summary: "An empty selection parameter shows the list, not an unavailable record",
    search: (fixture) => `?${fixture.param}=`,
    check: async ({ fixture, canvas }) => {
      await expect(canvas.getByRole("searchbox", { name: fixture.names.search })).toBeVisible();
      expect(canvas.queryByRole("heading", { name: fixture.missingHeading })).toBeNull();
    },
  },
} satisfies Record<string, Rule>;

export type RuleId = keyof typeof definitions;
export const rules: Record<RuleId, Rule> = definitions;

function applies(rule: Rule, fixture: FlowFixture) {
  return rule.requires !== "async" || fixture.async !== undefined;
}

/** Runs a rule; a listed gap must still fail, so closing it forces its removal. */
export async function verify(id: RuleId, run: () => Promise<void>, fixture: FlowFixture) {
  if (fixture.gaps[id] === undefined) return run();
  try {
    await run();
  } catch {
    return;
  }
  throw new Error(`${fixture.recipe} now meets "${rules[id].summary}"; remove "${id}" from gaps`);
}

/** Builds one story per rule; `complete()` throws if an applicable rule has none. */
export function flow(fixture: FlowFixture) {
  const ids = Object.keys(rules) as RuleId[];
  const applicable = ids.filter((id) => applies(rules[id], fixture));
  for (const id of Object.keys(fixture.gaps) as RuleId[])
    if (!applicable.includes(id))
      throw new Error(`${fixture.recipe} lists inapplicable gap "${id}"`);
  const covered = new Set<RuleId>();

  function story(id: RuleId): StoryObj {
    const rule = rules[id];
    if (!applicable.includes(id)) throw new Error(`"${id}" does not apply to ${fixture.recipe}`);
    if (covered.has(id)) throw new Error(`${fixture.recipe} has two "${id}" stories`);
    covered.add(id);
    const send = deferred();
    return {
      render: () =>
        fixture.render({ initialId: rule.initialId, send: rule.deferredSend ? send : undefined }),
      beforeEach: () => {
        const original = window.location.href;
        const url = new URL(original);
        for (const key of [fixture.param, "keep"]) url.searchParams.delete(key);
        for (const [key, value] of new URLSearchParams(rule.search?.(fixture) ?? ""))
          url.searchParams.set(key, value);
        window.history.replaceState(null, "", url);
        return () => window.history.replaceState(null, "", original);
      },
      play: async ({ canvasElement, userEvent }) => {
        const original = { width: innerWidth, height: innerHeight };
        try {
          if (rule.width) await page.viewport(rule.width, 900);
          await verify(
            id,
            () =>
              rule.check({
                fixture,
                root: canvasElement,
                canvas: within(canvasElement),
                user: userEvent,
                send,
              }),
            fixture,
          );
        } finally {
          await page.viewport(original.width, original.height);
        }
      },
    };
  }

  function complete() {
    const missing = applicable.filter((id) => !covered.has(id));
    if (missing.length)
      throw new Error(`${fixture.recipe} flow stories missing: ${missing.join(", ")}`);
  }

  return { story, complete };
}
