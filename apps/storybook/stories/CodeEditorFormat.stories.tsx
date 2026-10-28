import { Button } from "@kb.ui/react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
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
