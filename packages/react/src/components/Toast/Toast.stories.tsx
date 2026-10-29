import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Button } from "../Button/Button";
import { Toast, type ToastAddOptions, useToastManager } from "./Toast";

function Messages({
  initial = [],
  timed = false,
}: {
  initial?: ToastAddOptions[];
  timed?: boolean;
}) {
  const { add, close } = useToastManager();
  React.useEffect(() => {
    initial.forEach((message, index) => {
      add({ id: `example-${index}`, ...message });
    });
  }, [add, initial]);
  return (
    <div style={{ display: "grid", gap: 16, width: "100%" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        <Button
          onClick={() =>
            add({
              title: "Changes saved",
              description: "Your project is up to date.",
              type: "success",
              timeout: timed ? 5000 : 0,
            })
          }
        >
          Show notification
        </Button>
        <Button variant="secondary" onClick={() => close()}>
          Dismiss all
        </Button>
      </div>
      <Toast.Viewport placement="inline" />
    </div>
  );
}

const saved: ToastAddOptions[] = [
  { title: "Changes saved", description: "Your project is up to date.", type: "success" },
];
const tones: ToastAddOptions[] = [
  { title: "Draft available", description: "Continue editing when you are ready." },
  { title: "Sync in progress", description: "You can keep working.", type: "info" },
  { title: "Changes saved", description: "Your project is up to date.", type: "success" },
  {
    title: "Storage almost full",
    description: "Remove unused files to make space.",
    type: "warning",
  },
  {
    title: "Upload failed",
    description: "Your file is still available. Try again.",
    type: "error",
  },
];

const meta = {
  title: "Components/Toast",
  component: Toast,
  args: { toast: { id: "preview", title: "Changes saved" } },
  tags: ["autodocs"],
  parameters: { controls: { disable: true } },
} satisfies Meta<typeof Toast>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Toast.Provider timeout={0}>
      <Messages initial={saved} />
    </Toast.Provider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const message = await canvas.findByRole("dialog", { name: "Changes saved" });
    await expect(message).toHaveAccessibleDescription("Your project is up to date.");
    await expect(canvas.getByRole("region", { name: "Notifications" })).toHaveAttribute(
      "aria-live",
      "polite",
    );
    await userEvent.click(within(message).getByRole("button", { name: "Dismiss notification" }));
    await waitFor(() => expect(message).not.toBeInTheDocument());
    await userEvent.click(canvas.getByRole("button", { name: "Show notification" }));
    await waitFor(() =>
      expect(canvas.getByRole("dialog", { name: "Changes saved" })).toBeVisible(),
    );
  },
};

export const Queue: Story = {
  render: () => (
    <Toast.Provider timeout={0} limit={2}>
      <Messages initial={tones} />
    </Toast.Provider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const latest = await canvas.findByRole("dialog", { name: "Upload failed" });
    await expect(canvas.getAllByRole("dialog")).toHaveLength(2);
    await expect(canvas.getByText("Changes saved").closest(".kb-toast")).toHaveAttribute("inert");
    await expect(canvas.getByText("Changes saved")).not.toBeVisible();
    await userEvent.click(within(latest).getByRole("button", { name: "Dismiss notification" }));
    await waitFor(() =>
      expect(canvas.getByRole("dialog", { name: "Changes saved" })).toBeVisible(),
    );
  },
};

export const Tones: Story = {
  render: () => (
    <Toast.Provider timeout={0} limit={5}>
      <Messages initial={tones} />
    </Toast.Provider>
  ),
};

function UndoMessage() {
  const { add, close, update } = useToastManager();
  return (
    <div style={{ display: "grid", gap: 16, width: "100%" }}>
      <Button
        onClick={() => {
          const id = add({
            title: "Project archived",
            description: "You can restore it from the archive.",
            timeout: 0,
            actionProps: {
              children: "Undo",
              onClick: () =>
                update(id, {
                  title: "Project restored",
                  description: "The project is back in your workspace.",
                  type: "success",
                  actionProps: undefined,
                }),
            },
          });
        }}
      >
        Archive project
      </Button>
      <Button variant="secondary" onClick={() => close()}>
        Dismiss all
      </Button>
      <Toast.Viewport placement="inline" />
    </div>
  );
}

export const WithAction: Story = {
  render: () => (
    <Toast.Provider>
      <UndoMessage />
    </Toast.Provider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Archive project" }));
    await userEvent.click(await canvas.findByRole("button", { name: "Undo" }));
    await waitFor(() =>
      expect(canvas.getByRole("dialog", { name: "Project restored" })).toBeVisible(),
    );
    await expect(canvas.queryByRole("button", { name: "Undo" })).not.toBeInTheDocument();
  },
};

export const Timed: Story = {
  render: () => (
    <Toast.Provider>
      <Messages timed />
    </Toast.Provider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Show notification" });
    await userEvent.click(trigger);
    const message = await canvas.findByRole("dialog", { name: "Changes saved" });
    await expect(trigger).toHaveFocus();
    await userEvent.keyboard("{F6}");
    await expect(canvas.getByRole("region")).toHaveFocus();
    await userEvent.keyboard("{Tab}");
    await expect(message).toHaveFocus();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(message).not.toBeInTheDocument());
    await expect(trigger).toHaveFocus();
    await userEvent.click(trigger);
    await userEvent.hover(trigger);
    await waitFor(() => expect(canvas.queryByRole("dialog")).not.toBeInTheDocument(), {
      timeout: 7000,
    });
  },
};

function PromiseMessage() {
  const { promise } = useToastManager();
  return (
    <div style={{ display: "grid", gap: 16, width: "100%" }}>
      <Button
        onClick={() => {
          void promise(
            new Promise<string>((resolve) => setTimeout(() => resolve("Project"), 800)),
            { loading: "Saving project", success: (name) => `${name} saved`, error: "Save failed" },
          );
        }}
      >
        Save project
      </Button>
      <Toast.Viewport placement="inline" />
    </div>
  );
}

export const PromiseState: Story = {
  render: () => (
    <Toast.Provider timeout={0}>
      <PromiseMessage />
    </Toast.Provider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Save project" }));
    await waitFor(() =>
      expect(canvas.getByRole("dialog", { name: "Saving project" })).toBeVisible(),
    );
    await expect(await canvas.findByRole("dialog", { name: "Project saved" })).toHaveAttribute(
      "data-tone",
      "success",
    );
  },
};

function CustomMessage() {
  const { add } = useToastManager<{ file: string }>();
  return (
    <div style={{ display: "grid", gap: 16, width: "100%" }}>
      <Button
        onClick={() =>
          add({ title: "Download ready", data: { file: "quarterly-report.pdf" }, timeout: 0 })
        }
      >
        Prepare download
      </Button>
      <Toast.Viewport<{ file: string }>
        placement="inline"
        renderToast={(toast) => (
          <Toast key={toast.id} toast={toast}>
            <Toast.Content>
              <Toast.Title />
              <Toast.Description>{toast.data?.file}</Toast.Description>
              <Toast.Action render={<a href="#download" />} nativeButton={false} role="link">
                Open download
              </Toast.Action>
            </Toast.Content>
            <Toast.Close aria-label="Close download notice">Close</Toast.Close>
          </Toast>
        )}
      />
    </div>
  );
}

export const CustomComposition: Story = {
  render: () => (
    <Toast.Provider>
      <CustomMessage />
    </Toast.Provider>
  ),
};

function PositionedMessage() {
  const { add } = useToastManager();
  return (
    <>
      <Button
        onClick={() =>
          add({
            title: "Connection lost",
            description: "Reconnect to save changes.",
            priority: "high",
            timeout: 0,
            type: "error",
          })
        }
      >
        Show urgent notification
      </Button>
      <Toast.Viewport placement="top-end" />
    </>
  );
}

export const Positioned: Story = {
  render: () => (
    <Toast.Provider>
      <PositionedMessage />
    </Toast.Provider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Show urgent notification" }));
    const page = within(canvasElement.ownerDocument.body);
    await expect(await page.findByRole("alert")).toHaveTextContent("Connection lost");
    await userEvent.keyboard("{F6}");
    await expect(page.getByRole("region", { name: "Notifications" })).toHaveFocus();
    await userEvent.keyboard("{Tab}");
    const toast = page.getByRole("alertdialog", { name: "Connection lost" });
    await expect(toast).toHaveFocus();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(toast).not.toBeInTheDocument());
    await expect(canvas.getByRole("button")).toHaveFocus();
  },
};

const longMessage: ToastAddOptions[] = [
  {
    title: "Export completed with a filename that needs room to wrap",
    description:
      "quarterly-report-for-all-regions-with-a-very-long-unbroken-identifier-012345678901234567890123456789.pdf",
    actionProps: { children: "Review exported report" },
  },
];
export const LongContent: Story = {
  render: () => (
    <Toast.Provider timeout={0}>
      <Messages initial={longMessage} />
    </Toast.Provider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const message = await canvas.findByRole("dialog");
    await waitFor(() => expect(message).toBeVisible());
    const document = canvasElement.ownerDocument;
    await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(
      document.documentElement.clientWidth,
    );
    await expect(message.scrollWidth).toBeLessThanOrEqual(message.clientWidth);
    for (const control of within(message).getAllByRole("button")) {
      const bounds = control.getBoundingClientRect();
      await expect(bounds.width).toBeGreaterThanOrEqual(24);
      await expect(bounds.height).toBeGreaterThanOrEqual(24);
    }
  },
};
