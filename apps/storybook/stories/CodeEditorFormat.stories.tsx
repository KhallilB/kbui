import { Button } from "@kb.ui/react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fireEvent, userEvent, waitFor, within } from "storybook/test";
import { CodeEditor } from "../site/CodeEditor";

function FormatFixture() {
  const [value, setValue] = useState(".brand{color:red}");
  return (
    <div className="kbui-site">
      <CodeEditor label="Formatting draft" language="css" value={value} onChange={setValue} />
      <Button>After editor</Button>
    </div>
  );
}
const meta = { title: "Site/Editor formatting", component: FormatFixture } satisfies Meta<
  typeof FormatFixture
>;
export default meta;
type Story = StoryObj<typeof meta>;

export const FormatOnBlur: Story = {
  play: async ({ canvasElement }) => {
    const page = within(canvasElement);
    const editor = page.getByRole("textbox", { name: "Formatting draft" });
    await userEvent.click(editor);
    await userEvent.tab();
    expect(editor).toHaveValue(".brand{color:red}");
    await userEvent.clear(editor);
    await userEvent.type(editor, ".brand{{color:blue}");
    expect(editor).toHaveValue(".brand{color:blue}");
    await userEvent.tab();
    await waitFor(() => expect(editor).toHaveValue(".brand {\n  color: blue;\n}\n"), {
      timeout: 10000,
    });
    expect(page.getByRole("button", { name: "After editor" })).toHaveFocus();
    await userEvent.clear(editor);
    await userEvent.type(editor, ".brand{{");
    await userEvent.tab();
    expect(editor).toHaveValue(".brand{");
  },
};

function ScrollFixture() {
  const [width, setWidth] = useState(300);
  const [value, setValue] = useState(
    Array.from(
      { length: 30 },
      (_, index) => `.brand-${index} { color: red; background: transparent; border-radius: 10px; }`,
    ).join("\n"),
  );
  return (
    <div className="kbui-site" style={{ width, maxWidth: "100%" }}>
      <CodeEditor label="Scrolling draft" language="css" value={value} onChange={setValue} />
      <Button onClick={() => setWidth(180)}>Narrow editor</Button>
    </div>
  );
}

export const CursorAlignment: Story = {
  render: () => <ScrollFixture />,
  play: async ({ canvasElement }) => {
    const page = within(canvasElement);
    const editor = page.getByRole("textbox", { name: "Scrolling draft" }) as HTMLTextAreaElement;
    const overlay = editor.parentElement?.querySelector("pre");
    if (!overlay) throw new Error("Missing syntax overlay");
    await waitFor(() => expect(overlay.querySelector("[data-syntax]")).not.toBeNull());
    editor.scrollTop = 150;
    editor.dispatchEvent(new Event("scroll", { bubbles: true }));
    expect(editor.scrollTop).toBeGreaterThan(0);
    expect(overlay.scrollTop).toBe(editor.scrollTop);
    await userEvent.click(page.getByRole("button", { name: "Narrow editor" }));
    await waitFor(() => {
      expect(overlay.textContent).toBe(`${editor.value}\n`);
      expect(overlay.querySelector("[data-syntax]")).not.toBeNull();
    });
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    expect(overlay.scrollTop).toBe(editor.scrollTop);
    await userEvent.click(editor);
    fireEvent.change(editor, { target: { value: `${editor.value}\n.brand-last{color:blue}` } });
    editor.scrollTop = 150;
    editor.dispatchEvent(new Event("scroll", { bubbles: true }));
    await userEvent.tab();
    await waitFor(() => expect(editor.value).toContain(".brand-last {\n  color: blue;\n}"));
    await waitFor(() => expect(overlay.querySelector("[data-syntax]")).not.toBeNull());
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    expect(overlay.scrollTop).toBe(editor.scrollTop);
  },
};
