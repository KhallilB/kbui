import type { StoryObj } from "@storybook/react-vite";
import type { ReactElement } from "react";
import { expect, waitFor, within } from "storybook/test";
import { type RuleId, ruleMeta } from "./rules";

type User = {
  click(element: Element): Promise<void>;
  type(element: Element, text: string): Promise<void>;
  clear(element: Element): Promise<void>;
  keyboard(keys: string): Promise<void>;
};

export type IntakeFixture = {
  recipe: string;
  render(options: { emptyDirectory: boolean; applicationValidation: boolean }): ReactElement;
  fields: { title: string; description: string; owner: string; reviewers: string };
  actions: { prepare: string; edit: string; reset: string };
  result: string;
  draft: { title: string; description: string };
  owner: { query: string; label: string };
  reviewer: { query: string; label: string };
  errors: { title: string; owner: string; description: string; empty: string; noMatch: string };
};
type Context = { fixture: IntakeFixture; canvas: ReturnType<typeof within>; user: User };

async function choose(context: Context, field: string, person: { query: string; label: string }) {
  const input = context.canvas.getByRole("combobox", { name: field });
  await context.user.click(input);
  await context.user.type(input, person.query);
  await within(document.body).findByRole("option", { name: person.label });
  await context.user.keyboard("{ArrowDown}{Enter}");
  if (field === context.fixture.fields.reviewers) {
    await waitFor(() =>
      expect(context.canvas.getByRole("button", { name: `Remove ${person.label}` })).toBeVisible(),
    );
    await context.user.keyboard("{Escape}");
  } else await waitFor(() => expect(input).toHaveValue(person.label));
}

async function fill(context: Context, reviewers = true) {
  const { fixture: f, canvas, user } = context;
  await user.type(canvas.getByRole("textbox", { name: f.fields.title }), f.draft.title);
  await user.type(canvas.getByRole("textbox", { name: f.fields.description }), f.draft.description);
  await choose(context, f.fields.owner, f.owner);
  if (reviewers) await choose(context, f.fields.reviewers, f.reviewer);
}

async function prepare(context: Context) {
  await fill(context);
  await context.user.click(
    context.canvas.getByRole("button", { name: context.fixture.actions.prepare }),
  );
}

const checks: Record<RuleId, (context: Context) => Promise<void>> = {
  async prepare(context) {
    const { fixture: f, canvas } = context;
    await prepare(context);
    await expect(canvas.getByRole("heading", { name: f.result })).toHaveFocus();
    for (const text of [f.draft.title, f.draft.description, f.owner.label, f.reviewer.label])
      await expect(canvas.getByText(text, { exact: true })).toBeVisible();
  },
  async validation(context) {
    const { fixture: f, canvas, user } = context;
    const description = canvas.getByRole("textbox", { name: f.fields.description });
    await user.type(description, f.draft.description);
    await user.click(canvas.getByRole("button", { name: f.actions.prepare }));
    await expect(canvas.getByRole("alert")).toHaveFocus();
    await user.click(canvas.getByRole("link", { name: f.errors.title }));
    const title = canvas.getByRole("textbox", { name: f.fields.title });
    await expect(title).toHaveFocus();
    await expect(title).toHaveAttribute("aria-invalid", "true");
    await user.type(title, f.draft.title);
    await user.click(canvas.getByRole("link", { name: f.errors.owner }));
    await expect(canvas.getByRole("combobox", { name: f.fields.owner })).toHaveFocus();
    await choose(context, f.fields.owner, f.owner);
    await expect(description).toHaveValue(f.draft.description);
    await user.click(canvas.getByRole("button", { name: f.actions.prepare }));
    await expect(canvas.getByRole("heading", { name: f.result })).toHaveFocus();
    await expect(canvas.queryByRole("alert")).toBeNull();
  },
  async assignment(context) {
    const { fixture: f, canvas, user } = context;
    const title = canvas.getByRole("textbox", { name: f.fields.title });
    await user.type(title, f.draft.title);
    const owner = canvas.getByRole("combobox", { name: f.fields.owner });
    await user.click(owner);
    await user.type(owner, "no-such-person");
    await expect(within(document.body).getByText(f.errors.noMatch)).toBeVisible();
    await user.clear(owner);
    await choose(context, f.fields.owner, f.owner);
    await expect(owner).toHaveValue(f.owner.label);
    await choose(context, f.fields.reviewers, f.reviewer);
    await user.click(canvas.getByRole("button", { name: `Remove ${f.reviewer.label}` }));
    await expect(canvas.queryByRole("button", { name: `Remove ${f.reviewer.label}` })).toBeNull();
    await expect(title).toHaveValue(f.draft.title);
    await expect(owner).toHaveValue(f.owner.label);
  },
  async edit(context) {
    const { fixture: f, canvas, user } = context;
    await prepare(context);
    await user.click(canvas.getByRole("button", { name: f.actions.edit }));
    const title = canvas.getByRole("textbox", { name: f.fields.title });
    await expect(title).toHaveFocus();
    await expect(title).toHaveValue(f.draft.title);
    await expect(canvas.getByRole("textbox", { name: f.fields.description })).toHaveValue(
      f.draft.description,
    );
    await expect(canvas.getByRole("combobox", { name: f.fields.owner })).toHaveValue(f.owner.label);
    await expect(canvas.getByRole("button", { name: `Remove ${f.reviewer.label}` })).toBeVisible();
  },
  async reset(context) {
    const { fixture: f, canvas, user } = context;
    await prepare(context);
    await user.click(canvas.getByRole("button", { name: f.actions.reset }));
    const title = canvas.getByRole("textbox", { name: f.fields.title });
    await expect(title).toHaveFocus();
    await expect(title).toHaveValue("");
    await expect(canvas.getByRole("textbox", { name: f.fields.description })).toHaveValue("");
    await expect(canvas.getByRole("combobox", { name: f.fields.owner })).toHaveValue("");
    await expect(canvas.queryByRole("button", { name: `Remove ${f.reviewer.label}` })).toBeNull();
  },
  async "empty-directory"({ fixture: f, canvas, user }) {
    const title = canvas.getByRole("textbox", { name: f.fields.title });
    await user.type(title, f.draft.title);
    await user.click(canvas.getByRole("button", { name: `Toggle ${f.fields.owner} options` }));
    await expect(await canvas.findByText(f.errors.empty)).toBeVisible();
    await user.keyboard("{Escape}");
    await user.click(canvas.getByRole("button", { name: f.actions.prepare }));
    await expect(canvas.getByRole("alert")).toHaveFocus();
    await expect(canvas.getByRole("link", { name: f.errors.owner })).toBeVisible();
    await expect(title).toHaveValue(f.draft.title);
    await expect(canvas.queryByRole("heading", { name: f.result })).toBeNull();
  },
  async "application-validation"(context) {
    const { fixture: f, canvas, user } = context;
    await user.type(canvas.getByRole("textbox", { name: f.fields.title }), f.draft.title);
    await choose(context, f.fields.owner, f.owner);
    await user.click(canvas.getByRole("button", { name: f.actions.prepare }));
    await expect(canvas.getByRole("alert")).toHaveFocus();
    await user.click(canvas.getByRole("link", { name: f.errors.description }));
    const description = canvas.getByRole("textbox", { name: f.fields.description });
    await expect(description).toHaveFocus();
    await user.type(description, f.draft.description);
    await expect(canvas.getByRole("textbox", { name: f.fields.title })).toHaveValue(f.draft.title);
    await expect(canvas.getByRole("combobox", { name: f.fields.owner })).toHaveValue(f.owner.label);
    await user.click(canvas.getByRole("button", { name: f.actions.prepare }));
    await expect(canvas.getByRole("heading", { name: f.result })).toHaveFocus();
  },
};

export function flow(fixture: IntakeFixture, options: { gaps: Partial<Record<RuleId, string>> }) {
  const covered = new Set<RuleId>();
  function story(id: RuleId): StoryObj {
    if (covered.has(id)) throw new Error(`${fixture.recipe} has two "${id}" stories`);
    covered.add(id);
    return {
      render: () =>
        fixture.render({
          emptyDirectory: id === "empty-directory",
          applicationValidation: id === "application-validation",
        }),
      play: async ({ canvasElement, userEvent }) => {
        try {
          await checks[id]({ fixture, canvas: within(canvasElement), user: userEvent });
        } catch (error) {
          if (options.gaps[id]) return;
          throw error;
        }
        if (options.gaps[id]) throw new Error(`${fixture.recipe} ${id} now passes; remove its gap`);
      },
    };
  }
  function complete() {
    const missing = (Object.keys(ruleMeta) as RuleId[]).filter((id) => !covered.has(id));
    if (missing.length)
      throw new Error(`${fixture.recipe} intake stories missing: ${missing.join(", ")}`);
  }
  return { story, complete };
}
