import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, waitFor, within } from "storybook/test";
import { controls, Harness } from "../stories/list-detail-flow/harness";
import { type CommitResult, ListDetail, type RequestDraft, type RequestRecord } from "./ListDetail";

const meta = {
  title: "Recipes/ListDetail",
  component: ListDetail,
  tags: ["!autodocs"],
  parameters: { layout: "padded" },
  afterEach: ({ canvasElement }) => {
    expect(canvasElement.scrollWidth).toBeLessThanOrEqual(canvasElement.clientWidth + 1);
  },
  beforeEach: () => {
    if (import.meta.env.MODE !== "test") return;
    const original = window.location.href;
    const url = new URL(original);
    url.searchParams.delete("request");
    window.history.replaceState(null, "", url);
    return () => window.history.replaceState(null, "", original);
  },
} satisfies Meta<typeof ListDetail>;
export default meta;
type Story = StoryObj<typeof meta>;

export const RequestQueue: Story = {
  play: async ({ canvasElement, userEvent }) => {
    if (
      import.meta.env.MODE !== "test" &&
      new URL(window.location.href).searchParams.has("request")
    )
      return;
    const canvas = within(canvasElement);
    const row = canvas.getByRole("button", { name: /REQ-1042.*Warehouse access/ });
    row.focus();
    await userEvent.keyboard("{Enter}");
    const detail = canvas.getByRole("region", { name: "Warehouse access" });
    await expect(within(detail).getByRole("heading", { name: "Warehouse access" })).toHaveFocus();
    expect(new URL(window.location.href).searchParams.get("request")).toBe("REQ-1042");
    await expect(canvas.getByRole("complementary", { name: "Request context" })).toHaveTextContent(
      "North depot",
    );
    await userEvent.click(canvas.getByRole("button", { name: "Hide context" }));
    expect(canvas.queryByRole("complementary", { name: "Request context" })).toBeNull();
    await userEvent.click(canvas.getByRole("button", { name: "Show context" }));
    await expect(canvas.getByRole("complementary", { name: "Request context" })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Back to requests" }));
    await expect(row).toHaveFocus();
    expect(new URL(window.location.href).searchParams.has("request")).toBe(false);
    expect(canvasElement.scrollWidth).toBeLessThanOrEqual(canvasElement.clientWidth + 1);
  },
};

export const EditAndValidate: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /REQ-1042.*Warehouse access/ }));
    await userEvent.click(canvas.getByRole("button", { name: "Edit request" }));
    const title = canvas.getByRole("textbox", { name: "Request title" });
    await expect(title).toHaveFocus();
    await userEvent.clear(title);
    await userEvent.type(title, "   ");
    await userEvent.click(canvas.getByRole("button", { name: "Save changes" }));
    await expect(title).toHaveFocus();
    await expect(title).toHaveAccessibleDescription("Enter a request title.");
    await expect(canvas.getByRole("textbox", { name: "Owner" })).toHaveValue("Maya Chen");
    await userEvent.clear(title);
    await userEvent.type(title, "Warehouse access approved");
    const owner = canvas.getByRole("textbox", { name: "Owner" });
    await userEvent.clear(owner);
    await userEvent.click(canvas.getByRole("button", { name: "Save changes" }));
    await expect(owner).toHaveFocus();
    await expect(owner).toHaveAccessibleDescription("Enter an owner.");
    await userEvent.type(owner, "Sam Rivera");
    await userEvent.click(canvas.getByRole("combobox", { name: "Status" }));
    await userEvent.click(await canvas.findByRole("option", { name: "Resolved" }));
    await userEvent.click(canvas.getByRole("button", { name: "Save changes" }));
    await expect(canvas.getByRole("heading", { name: "Warehouse access approved" })).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Edit request" })).toHaveFocus();
    await expect(canvas.getByRole("status")).toHaveTextContent("REQ-1042 saved for this session.");
    await expect(canvas.getByRole("complementary", { name: "Request context" })).toHaveTextContent(
      "Sam Rivera",
    );
    await userEvent.click(canvas.getByRole("button", { name: "Back to requests" }));
    await expect(
      canvas.getByRole("button", { name: /REQ-1042.*Warehouse access approved.*Resolved/ }),
    ).toBeVisible();
  },
};

export const RetainedDraft: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /REQ-1042.*Warehouse access/ }));
    await userEvent.click(canvas.getByRole("button", { name: "Edit request" }));
    const title = canvas.getByRole("textbox", { name: "Request title" });
    await userEvent.clear(title);
    await userEvent.type(title, "Unfinished draft");
    await userEvent.click(canvas.getByRole("button", { name: "Back to requests" }));
    await userEvent.click(
      canvas.getByRole("button", { name: /REQ-1043.*Replace loading dock scanner/ }),
    );
    await expect(canvas.getByRole("complementary", { name: "Request context" })).toHaveTextContent(
      "East depot",
    );
    await userEvent.click(canvas.getByRole("button", { name: "Back to requests" }));
    await userEvent.click(canvas.getByRole("button", { name: /REQ-1042.*Warehouse access/ }));
    await expect(canvas.getByRole("textbox", { name: "Request title" })).toHaveValue(
      "Unfinished draft",
    );
    await userEvent.click(canvas.getByRole("button", { name: "Cancel editing" }));
    await expect(canvas.getByRole("heading", { name: "Warehouse access" })).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Edit request" })).toHaveFocus();
    await userEvent.click(canvas.getByRole("button", { name: "Edit request" }));
    await expect(canvas.getByRole("textbox", { name: "Request title" })).toHaveValue(
      "Warehouse access",
    );
  },
};

export const SearchAndRecovery: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const search = canvas.getByRole("searchbox", { name: "Search requests" });
    await userEvent.type(search, "nothing matches");
    await expect(canvas.getByRole("heading", { name: "No matching requests" })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Clear filters" }));
    await expect(search).toHaveFocus();
    await expect(search).toHaveValue("");
    await userEvent.click(canvas.getByRole("combobox", { name: "Filter by status" }));
    await userEvent.click(await canvas.findByRole("option", { name: "Resolved" }));
    await expect(
      canvas.getByRole("button", { name: /REQ-1044.*Delivery window update/ }),
    ).toBeVisible();
    expect(canvas.queryByRole("button", { name: /REQ-1042/ })).toBeNull();
    await userEvent.type(search, "none");
    await userEvent.click(canvas.getByRole("button", { name: "Clear filters" }));
    await expect(canvas.getByRole("button", { name: /REQ-1042/ })).toBeVisible();
  },
};

export const UnavailableRequest: Story = {
  args: { initialRequestId: "missing" },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { name: "Request unavailable" })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Back to requests" }));
    await expect(canvas.getByRole("searchbox", { name: "Search requests" })).toHaveFocus();
    await userEvent.click(canvas.getByRole("button", { name: /REQ-1043/ }));
    window.history.back();
    await waitFor(() => expect(canvas.getByRole("button", { name: /REQ-1043/ })).toHaveFocus());
  },
};

export const EmptyQueue: Story = {
  args: { requests: [] },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole("heading", { name: "No requests yet" }),
    ).toBeVisible();
    expect(canvasElement.scrollWidth).toBeLessThanOrEqual(canvasElement.clientWidth + 1);
  },
};

export const LongContent: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /REQ-1045/ }));
    await expect(
      canvas.getByRole("heading", {
        name: "Review international shipment documentation and regional handling instructions",
      }),
    ).toBeVisible();
    await expect(canvas.getByRole("complementary", { name: "Request context" })).toHaveTextContent(
      "Central distribution hub",
    );
    await userEvent.click(canvas.getByRole("button", { name: "Edit request" }));
    await expect(canvas.getByRole("textbox", { name: "Request title" })).toHaveValue(
      "Review international shipment documentation and regional handling instructions",
    );
  },
};

type Context = Parameters<NonNullable<Story["play"]>>[0];
type Outcome = CommitResult<keyof RequestDraft & string>;

const failed = "Changes could not be saved. Your draft is safe; try again.";
const offline = () => Promise.reject(new Error("offline"));

/** Opens REQ-1042's editor and returns its title field. */
async function editFirst({ canvasElement, userEvent }: Context) {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole("button", { name: /REQ-1042.*Warehouse access/ }));
  await userEvent.click(canvas.getByRole("button", { name: "Edit request" }));
  const title = canvas.getByRole("textbox", { name: "Request title" });
  await userEvent.clear(title);
  await userEvent.type(title, "Warehouse access approved");
  return title;
}

function save({ canvasElement, userEvent }: Context) {
  return userEvent.click(within(canvasElement).getByRole("button", { name: "Save changes" }));
}

/** Commit whose next call waits until the story settles it. */
function held() {
  const commit = fn(async (_id: string, _draft: RequestDraft): Promise<Outcome> => {});
  let settle: (ok: boolean) => void = () => {};
  const next = () =>
    commit.mockReturnValueOnce(
      new Promise<Outcome>((resolve, reject) => {
        settle = (ok) => (ok ? resolve() : reject(new Error("offline")));
      }),
    );
  return { commit, next, settle: (ok: boolean) => settle(ok) };
}

export const ClientValidationBlocksCommit: Story = {
  args: {
    commit: fn(async () => {}),
    validate: (draft) =>
      draft.owner === "Maya Chen" ? { owner: "Choose an owner on shift." } : {},
  },
  play: async (context) => {
    const canvas = within(context.canvasElement);
    const title = await editFirst(context);
    await save(context);
    const owner = canvas.getByRole("textbox", { name: "Owner" });
    await expect(owner).toHaveFocus();
    await expect(owner).toHaveAccessibleDescription("Choose an owner on shift.");
    await expect(title).toHaveValue("Warehouse access approved");
    expect(context.args.commit).not.toHaveBeenCalled();
  },
};

export const ServerErrorsActLikeValidation: Story = {
  args: { commit: fn(async () => ({ errors: { title: "Server says no" } })) },
  play: async (context) => {
    const canvas = within(context.canvasElement);
    const title = await editFirst(context);
    await save(context);
    await waitFor(() => expect(title).toHaveFocus());
    await expect(title).toHaveAccessibleDescription("Server says no");
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "REQ-1042 needs changes before saving.",
    );
    await expect(title).toHaveValue("Warehouse access approved");
    expect(context.args.commit).toHaveBeenCalledTimes(1);
    expect(canvas.queryByText(failed)).toBeNull();
  },
};

export const CommitRejectionShowsVisibleError: Story = {
  args: { commit: fn(offline) },
  play: async (context) => {
    const canvas = within(context.canvasElement);
    const title = await editFirst(context);
    await save(context);
    await waitFor(() => expect(canvas.getByText(failed)).toBeVisible());
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "REQ-1042 could not be saved. Draft kept.",
    );
    await expect(title).toHaveFocus();
    await expect(title).toHaveValue("Warehouse access approved");
    await expect(title).not.toHaveAccessibleDescription(/could not be saved/);
  },
};

export const CommitSuccessAppliesAndClears: Story = {
  args: { commit: fn(async () => {}) },
  play: async (context) => {
    const canvas = within(context.canvasElement);
    await editFirst(context);
    await save(context);
    await waitFor(() => expect(canvas.getByRole("button", { name: "Edit request" })).toHaveFocus());
    expect(context.args.commit).toHaveBeenCalledWith("REQ-1042", {
      title: "Warehouse access approved",
      owner: "Maya Chen",
      status: "Open",
    });
    await expect(canvas.getByRole("heading", { name: "Warehouse access approved" })).toBeVisible();
    expect(canvas.queryByRole("textbox", { name: "Request title" })).toBeNull();
    await expect(canvas.getByRole("status")).toHaveTextContent("REQ-1042 saved for this session.");
  },
};

const leavingSuccess = held();
export const SuccessAfterLeavingKeepsFocus: Story = {
  args: { commit: leavingSuccess.commit },
  play: async (context) => {
    const { userEvent } = context;
    const canvas = within(context.canvasElement);
    leavingSuccess.next();
    await editFirst(context);
    await save(context);
    await expect(canvas.getByRole("button", { name: "Saving changes…" })).toBeDisabled();
    await userEvent.click(canvas.getByRole("button", { name: "Back to requests" }));
    await userEvent.click(canvas.getByRole("button", { name: /REQ-1043/ }));
    const heading = canvas.getByRole("heading", { name: "Replace loading dock scanner" });
    await waitFor(() => expect(heading).toHaveFocus());
    leavingSuccess.settle(true);
    await waitFor(() =>
      expect(canvas.getByRole("status")).toHaveTextContent("REQ-1042 saved for this session."),
    );
    await expect(heading).toHaveFocus();
    await userEvent.click(canvas.getByRole("button", { name: "Back to requests" }));
    await expect(
      canvas.getByRole("button", { name: /REQ-1042.*Warehouse access approved/ }),
    ).toBeVisible();
    expect(leavingSuccess.commit).toHaveBeenCalledTimes(1);
  },
};

const leavingFailure = held();
export const FailureAfterLeavingKeepsDraftAndError: Story = {
  args: { commit: leavingFailure.commit },
  play: async (context) => {
    const { userEvent } = context;
    const canvas = within(context.canvasElement);
    leavingFailure.next();
    await editFirst(context);
    await save(context);
    await userEvent.click(canvas.getByRole("button", { name: "Back to requests" }));
    await userEvent.click(canvas.getByRole("button", { name: /REQ-1043/ }));
    const heading = canvas.getByRole("heading", { name: "Replace loading dock scanner" });
    await waitFor(() => expect(heading).toHaveFocus());
    leavingFailure.settle(false);
    const status = canvas.getByRole("status");
    await waitFor(() =>
      expect(status).toHaveTextContent("REQ-1042 could not be saved. Draft kept."),
    );
    await expect(heading).toHaveFocus();
    let announced = 0;
    const observer = new MutationObserver((records) => {
      announced += records.length;
    });
    observer.observe(status, { subtree: true, childList: true, characterData: true });
    try {
      await userEvent.click(canvas.getByRole("button", { name: "Back to requests" }));
      await userEvent.click(canvas.getByRole("button", { name: /REQ-1042/ }));
      await expect(canvas.getByRole("textbox", { name: "Request title" })).toHaveValue(
        "Warehouse access approved",
      );
      await expect(canvas.getByText(failed)).toBeVisible();
      expect(announced, "failure announced again on reopen").toBe(0);
    } finally {
      observer.disconnect();
    }
  },
};

const echoed: RequestRecord[] = [
  {
    id: "REQ-1042",
    title: "Warehouse access",
    owner: "Maya Chen",
    status: "Open",
    summary: "Arrange visitor access for the inventory team.",
    site: "North depot",
    requester: "Alex Morgan",
    activity: "Alex opened this request.",
  },
];
export const EchoAfterFailedCommitKeepsDraft: Story = {
  args: { commit: fn(offline) },
  render: (args) => (
    <Harness
      records={echoed}
      render={(records) => <ListDetail {...args} requests={records as RequestRecord[]} />}
    />
  ),
  play: async (context) => {
    const canvas = within(context.canvasElement);
    const title = await editFirst(context);
    await save(context);
    await waitFor(() => expect(canvas.getByText(failed)).toBeVisible());
    controls.setRecords(echoed.map((record) => ({ ...record })));
    await new Promise((resolve) => requestAnimationFrame(resolve));
    await expect(title).toHaveValue("Warehouse access approved");
    await expect(canvas.getByText(failed)).toBeVisible();
    await expect(canvas.getByRole("heading", { name: "Warehouse access" })).toBeVisible();
    expect(canvas.queryByText("Warehouse access approved")).toBeNull();
  },
};

export const UnrenderedFieldErrorFocusesSubmit: Story = {
  args: {
    commit: fn(async () => {}),
    validate: () => ({ budget: "Attach a budget code first." }) as Record<string, string>,
  },
  play: async (context) => {
    const canvas = within(context.canvasElement);
    await editFirst(context);
    await save(context);
    await expect(canvas.getByRole("button", { name: "Save changes" })).toHaveFocus();
    await expect(canvas.getByRole("status")).toHaveTextContent("Attach a budget code first.");
    expect(context.args.commit).not.toHaveBeenCalled();
  },
};

export const CopyReplacesStrings: Story = {
  args: { copy: { title: "Site requests", edit: "Change request" } },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { name: "Site requests" })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: /REQ-1042/ }));
    await expect(canvas.getByRole("button", { name: "Change request" })).toBeVisible();
  },
};
