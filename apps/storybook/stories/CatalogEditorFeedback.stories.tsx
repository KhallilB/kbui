import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { CatalogComponentEditor } from "../site/CatalogComponentEditor";
import "../site/catalog.css";

function FeedbackFixture({ error }: { error?: string }) {
  const [request, setRequest] = useState<{ id: string; source: string | null }>({
    id: "0",
    source: error ? "<span>Broken preview</span>" : null,
  });
  return (
    <div className="kbui-site">
      <CatalogComponentEditor
        original="<span>Original</span>"
        request={request}
        result={{ id: request.id, ...(error ? { error } : {}) }}
        onChange={(source) =>
          setRequest((current) => ({ id: String(Number(current.id) + 1), source }))
        }
      />
    </div>
  );
}

const meta = { title: "Site/Editor feedback", component: FeedbackFixture } satisfies Meta<
  typeof FeedbackFixture
>;
export default meta;
type Story = StoryObj<typeof meta>;

export const NotificationStates: Story = {
  play: async ({ canvasElement }) => {
    const page = within(canvasElement);
    expect(page.queryByRole("status", { name: "Editor notification" })).toBeNull();
    const editor = page.getByRole("textbox", { name: "Component code" });
    await userEvent.type(editor, "\n// Edited");
    const notice = page.getByRole("status", { name: "Editor notification" });
    expect(notice).toHaveTextContent("Preview updated");
    expect(notice).toHaveAttribute("data-tone", "success");
    expect(notice.querySelector("svg")).not.toBeNull();
    const original = Object.getOwnPropertyDescriptor(navigator, "clipboard");
    let copied = "";
    try {
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: {
          writeText: async (value: string) => {
            copied = value;
          },
        },
      });
      const copy = page.getByRole("button", { name: "Copy code" });
      await userEvent.click(copy);
      expect(notice).toHaveTextContent("Copied code");
      expect(notice).toHaveAttribute("data-tone", "success");
      expect(copied).toContain("// Edited");
      expect(copy).toHaveFocus();
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: {
          writeText: async () => {
            throw new Error("Permission denied");
          },
        },
      });
      await userEvent.click(copy);
      expect(notice).toHaveTextContent("Copy unavailable");
      expect(notice).toHaveAttribute("data-tone", "error");
      await userEvent.type(editor, " again");
      expect(notice).toHaveTextContent("Preview updated");
    } finally {
      if (original) Object.defineProperty(navigator, "clipboard", original);
      else Reflect.deleteProperty(navigator, "clipboard");
    }
  },
};

export const CopyWithPreviewError: Story = {
  args: { error: "Broken JSX" },
  play: async ({ canvasElement }) => {
    const page = within(canvasElement);
    expect(page.queryByRole("status", { name: "Editor notification" })).toBeNull();
    await userEvent.type(page.getByRole("textbox", { name: "Component code" }), " ");
    const notice = page.getByRole("status", { name: "Editor notification" });
    expect(notice).toHaveAttribute("data-tone", "error");
    const original = Object.getOwnPropertyDescriptor(navigator, "clipboard");
    try {
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: { writeText: async () => {} },
      });
      await userEvent.click(page.getByRole("button", { name: "Copy code" }));
      expect(notice).toHaveTextContent("Copied code");
      expect(notice).toHaveAttribute("data-tone", "success");
      expect(page.getByRole("alert")).toHaveTextContent("Broken JSX");
    } finally {
      if (original) Object.defineProperty(navigator, "clipboard", original);
      else Reflect.deleteProperty(navigator, "clipboard");
    }
  },
};
