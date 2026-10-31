import type { StoryObj } from "@storybook/react-vite";
import { createElement, type ReactElement } from "react";
import { expect, waitFor, within } from "storybook/test";
import { page } from "vitest/browser";
import { type RecipePolicy, recipeDefinitions } from "../../catalog/content";
import { controls, Harness } from "./harness";
import { type RuleId, type RuleMeta, ruleMeta } from "./rules";

export type { RuleId };

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

/** Router a recipe receives in place of the URL; records every write. */
export type MemoryRouter = {
  read(): string | null;
  write(id: string | null): void;
  subscribe(onChange: () => void): () => void;
  writes: (string | null)[];
  /** Simulates an outside navigation. */
  emit(id: string | null): void;
};

export function memoryRouter(): MemoryRouter {
  let id: string | null = null;
  const listeners = new Set<() => void>();
  const writes: (string | null)[] = [];
  return {
    read: () => id,
    write(next) {
      writes.push(next);
      id = next;
    },
    subscribe(onChange) {
      listeners.add(onChange);
      return () => listeners.delete(onChange);
    },
    writes,
    emit(next) {
      id = next;
      for (const listener of listeners) listener();
    },
  };
}

/** The catalog policy for a flow recipe; throws if it declares none. */
export function recipePolicy(recipe: string): RecipePolicy {
  const policy = recipeDefinitions.find((entry) => entry.name === recipe)?.policy;
  if (!policy) throw new Error(`${recipe} declares no policy`);
  return policy;
}

/** What a list-and-detail recipe exposes to the shared flow contract. */
export type FlowFixture = {
  recipe: string;
  param: string;
  render: (options: {
    initialId?: string | undefined;
    send?: Send | undefined;
    records?: readonly unknown[] | undefined;
    router?: MemoryRouter | undefined;
  }) => ReactElement;
  policy: RecipePolicy;
  /** Accessible name of the context aside. */
  context: string;
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
    /** Visible text of a failed commit. */
    failed: string;
  };
  /** One complete successful commit on the open record. */
  commitOnce: (canvas: Canvas, user: User) => Promise<void>;
  /** The region that announces commit outcomes. */
  status: (root: HTMLElement) => HTMLElement;
  /** Present when commits are asynchronous. */
  async?: { pendingSubmit: string } | undefined;
  /** Records rendered through `Harness`, and changes a server could deliver. */
  live: {
    records: readonly unknown[];
    added: Entry;
    add(records: readonly unknown[]): readonly unknown[];
    /** Server copy of `id` that already includes the committed change. */
    echo(records: readonly unknown[], id: string): readonly unknown[];
    remove(records: readonly unknown[], id: string): readonly unknown[];
    /** Commits `committedText` on the open record, from a closed draft. */
    commitChange(canvas: Canvas, user: User): Promise<void>;
    committedText: string;
  };
  /** Rules the recipe breaks today, with why; each must still fail. */
  gaps: Partial<Record<RuleId, string>>;
};

type Context = {
  fixture: FlowFixture;
  root: HTMLElement;
  canvas: Canvas;
  user: User;
  send: Deferred;
  router: MemoryRouter;
};

/** How a rule runs; its summary, group and requirement live in `rules.ts`. */
export type Check = {
  /** Viewport width; omitted runs at the test default. */
  width?: number;
  initialId?: string;
  /** URL search set before render. */
  search?: (fixture: FlowFixture) => string;
  deferredSend?: boolean;
  /** Render through `Harness` with `live.records`, so `controls` works. */
  harness?: boolean;
  /** Pass a fresh `MemoryRouter`, empty, as the recipe's router. */
  router?: boolean;
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

/** Viewport width, in px, just below `collapseBelow`: one pane shows. */
function collapsed(fixture: FlowFixture) {
  const rem = Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
  return Math.floor(Number.parseFloat(fixture.policy.collapseBelow) * rem) - 1;
}

// Two frames let React commit and the browser lay out a state change.
function frames() {
  return new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
}

const nonColourProperties = ["outline-style", "outline-width"].concat(
  ["top", "right", "bottom", "left"].flatMap((side) => [
    `border-${side}-style`,
    `border-${side}-width`,
  ]),
);

function nonColourCue(element: Element) {
  const style = getComputedStyle(element);
  return nonColourProperties.map((property) => style.getPropertyValue(property)).join(" ");
}

function accessibleDescription(element: Element) {
  return (element.getAttribute("aria-describedby") ?? "")
    .split(/\s+/)
    .map((id) => (id ? (document.getElementById(id)?.textContent ?? "") : ""))
    .join(" ");
}

function pending(fixture: FlowFixture) {
  if (!fixture.async) throw new Error(`${fixture.recipe} has no asynchronous commit`);
  return fixture.async.pendingSubmit;
}

const definitions = {
  "open-focus": {
    check: async ({ fixture, canvas, user }) => {
      canvas.getByRole("button", { name: fixture.first.row }).focus();
      await user.keyboard("{Enter}");
      await expect(heading(canvas, fixture.first)).toHaveFocus();
    },
  },
  "unavailable-focus": {
    initialId: "missing-record",
    check: async ({ fixture, canvas }) => {
      await waitFor(() =>
        expect(canvas.getByRole("heading", { name: fixture.missingHeading })).toHaveFocus(),
      );
    },
  },
  reselect: {
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
    check: async ({ fixture, canvas, user }) => {
      await open(canvas, user, fixture.first);
      await back(canvas, user, fixture);
      await expect(canvas.getByRole("button", { name: fixture.first.row })).toHaveFocus();
    },
  },
  "filtered-return": {
    width: 1280,
    check: async ({ fixture, canvas, user }) => {
      await open(canvas, user, fixture.first);
      await user.type(canvas.getByRole("searchbox", { name: fixture.names.search }), fixture.query);
      await back(canvas, user, fixture);
      await expect(canvas.getByRole("searchbox", { name: fixture.names.search })).toHaveFocus();
    },
  },
  history: {
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
    width: 1440,
    check: async ({ fixture, canvas, user }) => {
      await open(canvas, user, fixture.first);
      canvas.getByRole("searchbox", { name: fixture.names.search }).focus();
      await page.viewport(collapsed(fixture), 844);
      await waitFor(() => expect(heading(canvas, fixture.first)).toHaveFocus());
    },
  },
  drafts: {
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
    check: async ({ fixture, root, canvas, user }) => {
      await open(canvas, user, fixture.first);
      await fixture.commitOnce(canvas, user);
      const status = fixture.status(root);
      const before = status.textContent;
      let changes = 0;
      const observer = new MutationObserver((records) => {
        changes += records.length;
      });
      observer.observe(status, { subtree: true, childList: true, characterData: true });
      try {
        await fixture.commitOnce(canvas, user);
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
    search: (fixture) => `?${fixture.param}=`,
    check: async ({ fixture, canvas }) => {
      await expect(canvas.getByRole("searchbox", { name: fixture.names.search })).toBeVisible();
      expect(canvas.queryByRole("heading", { name: fixture.missingHeading })).toBeNull();
    },
  },
  "resize-keeps-draft": {
    width: 1280,
    check: async ({ fixture, canvas, user }) => {
      await open(canvas, user, fixture.first);
      await user.click(canvas.getByRole("button", { name: fixture.draft.begin }));
      const field = canvas.getByRole("textbox", { name: fixture.draft.field });
      await user.clear(field);
      await user.type(field, "kept");
      await page.viewport(collapsed(fixture), 844);
      await frames();
      await expect(field).toHaveFocus();
      await expect(field).toHaveValue("kept");
    },
  },
  "context-initial": {
    width: 1280,
    check: async ({ fixture, canvas, user }) => {
      await open(canvas, user, fixture.first);
      const aside = canvas.queryByRole("complementary", { name: fixture.context });
      if (fixture.policy.context === "open") expect(aside).not.toBeNull();
      else expect(aside).toBeNull();
    },
  },
  "forced-colors-row": {
    width: 1280,
    check: async ({ fixture, canvas, user }) => {
      await open(canvas, user, fixture.first);
      const current = canvas.getByRole("button", { name: fixture.first.row });
      const focused = canvas.getByRole("button", { name: fixture.second.row });
      current.focus();
      // Keyboard focus, so the focus ring is the one users see.
      await user.keyboard("{Tab}");
      await expect(focused).toHaveFocus();
      expect(nonColourCue(current), "current row matches the focused row").not.toBe(
        nonColourCue(focused),
      );
      if (!matchMedia("(forced-colors: active)").matches) return;
      const idle = [...(current.closest("ul")?.querySelectorAll("button") ?? [])].find(
        (row) => row !== current && row !== focused,
      );
      if (!idle) throw new Error(`${fixture.recipe} needs a third row`);
      expect(nonColourCue(current), "current row matches an idle row").not.toBe(nonColourCue(idle));
    },
  },
  "validation-separate": {
    deferredSend: true,
    check: async ({ fixture, canvas, user, send }) => {
      await open(canvas, user, fixture.first);
      await user.click(canvas.getByRole("button", { name: fixture.draft.begin }));
      const field = canvas.getByRole("textbox", { name: fixture.draft.field });
      await user.clear(field);
      await user.click(canvas.getByRole("button", { name: fixture.draft.submit }));
      await waitFor(() => expect(accessibleDescription(field)).toContain(fixture.draft.invalid));
      expect(send.calls).toBe(0);
      await user.type(field, "Updated text");
      await user.click(canvas.getByRole("button", { name: fixture.draft.submit }));
      send.settle(false);
      await waitFor(() =>
        expect(
          canvas
            .getAllByText(fixture.draft.failed)
            .some((element: HTMLElement) => element.checkVisibility()),
        ).toBe(true),
      );
      const description = accessibleDescription(field);
      expect(description).not.toContain(fixture.draft.failed);
      expect(description).not.toContain(fixture.draft.invalid);
    },
  },
  unmount: {
    deferredSend: true,
    harness: true,
    check: async ({ fixture, canvas, user, send }) => {
      const pendingSubmit = pending(fixture);
      const errors: unknown[] = [];
      const original = console.error;
      console.error = (...args: unknown[]) => {
        errors.push(args);
        original(...args);
      };
      const record = (event: ErrorEvent | PromiseRejectionEvent) =>
        errors.push("reason" in event ? event.reason : event.error);
      window.addEventListener("error", record);
      window.addEventListener("unhandledrejection", record);
      try {
        await open(canvas, user, fixture.first);
        await user.click(canvas.getByRole("button", { name: fixture.draft.begin }));
        await user.type(canvas.getByRole("textbox", { name: fixture.draft.field }), "Updated text");
        await user.click(canvas.getByRole("button", { name: fixture.draft.submit }));
        await expect(canvas.getByRole("button", { name: pendingSubmit })).toBeDisabled();
        controls.unmount();
        await waitFor(() =>
          expect(canvas.queryByRole("heading", { name: fixture.first.heading })).toBeNull(),
        );
        send.settle(true);
        await frames();
        controls.remount();
        await waitFor(() => expect(heading(canvas, fixture.first)).toBeVisible());
        expect(canvas.queryByText(pendingSubmit)).toBeNull();
        expect(errors).toEqual([]);
      } finally {
        console.error = original;
        window.removeEventListener("error", record);
        window.removeEventListener("unhandledrejection", record);
      }
    },
  },
  "live-records": {
    harness: true,
    check: async ({ fixture, canvas, user }) => {
      const { live } = fixture;
      let records = live.records;
      const deliver = async (next: readonly unknown[]) => {
        records = next;
        controls.setRecords(records);
        await frames();
      };
      await open(canvas, user, fixture.first);
      await deliver(live.add(records));
      await expect(canvas.getByRole("button", { name: live.added.row })).toBeVisible();
      await expect(heading(canvas, fixture.first)).toHaveFocus();

      await deliver(live.remove(records, live.added.id));
      expect(canvas.queryByRole("button", { name: live.added.row })).toBeNull();
      await expect(heading(canvas, fixture.first)).toHaveFocus();

      await user.click(canvas.getByRole("button", { name: fixture.draft.begin }));
      const field = canvas.getByRole("textbox", { name: fixture.draft.field });
      await user.clear(field);
      await user.type(field, "Live draft");
      await deliver(live.add(records));
      await expect(canvas.getByRole("button", { name: live.added.row })).toBeVisible();
      await expect(canvas.getByRole("textbox", { name: fixture.draft.field })).toHaveValue(
        "Live draft",
      );
      await user.click(canvas.getByRole("button", { name: fixture.draft.discard }));

      await live.commitChange(canvas, user);
      const shown = canvas.getAllByText(live.committedText).length;
      await deliver(live.echo(records, fixture.first.id));
      expect(canvas.getAllByText(live.committedText), "server echo shown twice").toHaveLength(
        shown,
      );

      await deliver(live.remove(records, fixture.first.id));
      await expect(canvas.getByRole("heading", { name: fixture.missingHeading })).toBeVisible();
    },
  },
  "routing-boundary": {
    router: true,
    width: 1280,
    check: async ({ fixture, canvas, user, router }) => {
      const search = window.location.search;
      await open(canvas, user, fixture.first);
      expect(router.writes).toEqual([fixture.first.id]);
      await back(canvas, user, fixture);
      expect(router.writes).toEqual([fixture.first.id, null]);
      router.emit(fixture.second.id);
      await waitFor(() => expect(heading(canvas, fixture.second)).toHaveFocus());
      router.emit(fixture.second.id);
      await frames();
      expect(router.writes).toEqual([fixture.first.id, null]);
      await expect(heading(canvas, fixture.second)).toHaveFocus();
      await user.click(canvas.getByRole("button", { name: fixture.second.row }));
      await expect(heading(canvas, fixture.second)).toHaveFocus();
      expect(router.writes, "reselecting the open id writes").toEqual([fixture.first.id, null]);
      expect(window.location.search).toBe(search);
    },
  },
} satisfies Record<RuleId, Check>;

export const rules: Record<RuleId, Check> = definitions;

function applies(id: RuleId, fixture: FlowFixture) {
  const meta: RuleMeta = ruleMeta[id];
  return meta.requires !== "async" || fixture.async !== undefined;
}

/** Runs a rule; a listed gap must still fail, so closing it forces its removal. */
export async function verify(id: RuleId, run: () => Promise<void>, fixture: FlowFixture) {
  if (fixture.gaps[id] === undefined) return run();
  try {
    await run();
  } catch {
    return;
  }
  throw new Error(
    `${fixture.recipe} now meets "${ruleMeta[id].summary}"; remove "${id}" from gaps`,
  );
}

/** Builds one story per rule; `complete()` throws if an applicable rule has none. */
export function flow(fixture: FlowFixture) {
  const ids = Object.keys(rules) as RuleId[];
  const applicable = ids.filter((id) => applies(id, fixture));
  for (const id of Object.keys(fixture.gaps) as RuleId[])
    if (!applicable.includes(id))
      throw new Error(`${fixture.recipe} lists inapplicable gap "${id}"`);
  const covered = new Set<RuleId>();

  function story(id: RuleId): StoryObj {
    const rule = rules[id];
    if (!applicable.includes(id)) throw new Error(`"${id}" does not apply to ${fixture.recipe}`);
    if (covered.has(id)) throw new Error(`${fixture.recipe} has two "${id}" stories`);
    covered.add(id);
    let send = deferred();
    let router = memoryRouter();
    return {
      render: () => {
        const options = {
          initialId: rule.initialId,
          send: rule.deferredSend ? send : undefined,
          router: rule.router ? router : undefined,
        };
        if (!rule.harness) return fixture.render(options);
        return createElement(Harness, {
          records: fixture.live.records,
          render: (records) => fixture.render({ ...options, records }),
        });
      },
      beforeEach: () => {
        send = deferred();
        router = memoryRouter();
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
                router,
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
