import type { ReactElement } from "react";
import { expect, waitFor, type within } from "storybook/test";
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
  /** Rules the recipe breaks today; each must still fail, so a fix forces removal. */
  gaps: readonly RuleId[];
};

export type RuleId =
  | "R1 open focuses heading"
  | "R1 unavailable focuses heading"
  | "R2 reselect"
  | "R3 return row"
  | "R3 filtered return"
  | "R4 history"
  | "R5 resize"
  | "R6 drafts"
  | "R7 async completion"
  | "R8 validation"
  | "R9 current row"
  | "R10 routing"
  | "R11 announcements"
  | "R12 filters"
  | "R13 pending focus"
  | "R14 empty selection";

export type Rule = {
  /** Viewport width; omitted runs at the test default. */
  width?: number;
  initialId?: string;
  /** URL search set before render. */
  search?: (fixture: FlowFixture) => string;
  deferredSend?: boolean;
  check: (context: {
    fixture: FlowFixture;
    root: HTMLElement;
    canvas: Canvas;
    user: User;
    send: Deferred;
  }) => Promise<void>;
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

export const rules: Record<RuleId, Rule> = {
  "R1 open focuses heading": {
    check: async ({ fixture, canvas, user }) => {
      canvas.getByRole("button", { name: fixture.first.row }).focus();
      await user.keyboard("{Enter}");
      await expect(heading(canvas, fixture.first)).toHaveFocus();
    },
  },
  "R1 unavailable focuses heading": {
    initialId: "missing-record",
    check: async ({ fixture, canvas }) => {
      await waitFor(() =>
        expect(canvas.getByRole("heading", { name: fixture.missingHeading })).toHaveFocus(),
      );
    },
  },
  "R2 reselect": {
    width: 1280,
    check: async ({ fixture, canvas, user }) => {
      await open(canvas, user, fixture.first);
      const entries = window.history.length;
      await user.click(canvas.getByRole("button", { name: fixture.first.row }));
      await waitFor(() => expect(heading(canvas, fixture.first)).toHaveFocus(), { timeout: 500 });
      expect(window.history.length).toBe(entries);
    },
  },
  "R3 return row": {
    check: async ({ fixture, canvas, user }) => {
      await open(canvas, user, fixture.first);
      await back(canvas, user, fixture);
      await expect(canvas.getByRole("button", { name: fixture.first.row })).toHaveFocus();
    },
  },
  "R3 filtered return": {
    width: 1280,
    check: async ({ fixture, canvas, user }) => {
      await open(canvas, user, fixture.first);
      await user.type(canvas.getByRole("searchbox", { name: fixture.names.search }), fixture.query);
      await back(canvas, user, fixture);
      await expect(canvas.getByRole("searchbox", { name: fixture.names.search })).toHaveFocus();
    },
  },
  "R4 history": {
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
  "R5 resize": {
    width: 1440,
    check: async ({ fixture, canvas, user }) => {
      await open(canvas, user, fixture.first);
      canvas.getByRole("searchbox", { name: fixture.names.search }).focus();
      await page.viewport(390, 844);
      await waitFor(() => expect(heading(canvas, fixture.first)).toHaveFocus());
    },
  },
  "R6 drafts": {
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
  "R7 async completion": {
    deferredSend: true,
    check: async ({ fixture, root, canvas, user, send }) => {
      if (!fixture.async) throw new Error(`${fixture.recipe} has no asynchronous commit`);
      await open(canvas, user, fixture.first);
      await user.click(canvas.getByRole("button", { name: fixture.draft.begin }));
      await user.type(canvas.getByRole("textbox", { name: fixture.draft.field }), "Once");
      await user.click(canvas.getByRole("button", { name: fixture.draft.submit }));
      await expect(
        canvas.getByRole("button", { name: fixture.async.pendingSubmit }),
      ).toBeDisabled();
      await back(canvas, user, fixture);
      await open(canvas, user, fixture.second);
      send.settle(true);
      await waitFor(() => expect(fixture.status(root).textContent).not.toMatch(/^Sending/));
      await expect(heading(canvas, fixture.second)).toHaveFocus();
      expect(send.calls).toBe(1);
    },
  },
  "R8 validation": {
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
  "R9 current row": {
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
  "R10 routing": {
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
  "R11 announcements": {
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
      await fixture.commit(canvas, user);
      await new Promise((resolve) => setTimeout(resolve, 50));
      observer.disconnect();
      expect(status.textContent).toBe(before);
      expect(changes, "identical outcome must be announced again").toBeGreaterThan(0);
    },
  },
  "R12 filters": {
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
  "R13 pending focus": {
    deferredSend: true,
    check: async ({ fixture, canvas, user, send }) => {
      if (!fixture.async) throw new Error(`${fixture.recipe} has no asynchronous commit`);
      await open(canvas, user, fixture.first);
      await user.click(canvas.getByRole("button", { name: fixture.draft.begin }));
      await user.type(canvas.getByRole("textbox", { name: fixture.draft.field }), "Pending");
      await user.click(canvas.getByRole("button", { name: fixture.draft.submit }));
      await expect(
        canvas.getByRole("button", { name: fixture.async.pendingSubmit }),
      ).toBeDisabled();
      try {
        const active = document.activeElement;
        expect(active, "focus left the flow").not.toBe(document.body);
        expect(active).not.toBeDisabled();
      } finally {
        send.settle(true);
      }
    },
  },
  "R14 empty selection": {
    search: (fixture) => `?${fixture.param}=`,
    check: async ({ fixture, canvas }) => {
      await expect(canvas.getByRole("searchbox", { name: fixture.names.search })).toBeVisible();
      expect(canvas.queryByRole("heading", { name: fixture.missingHeading })).toBeNull();
    },
  },
};

/** Runs a rule; a listed gap must still fail, so closing it forces its removal. */
export async function verify(id: RuleId, run: () => Promise<void>, fixture: FlowFixture) {
  if (!fixture.gaps.includes(id)) return run();
  try {
    await run();
  } catch {
    return;
  }
  throw new Error(`${fixture.recipe} now meets "${id}"; remove it from gaps`);
}
