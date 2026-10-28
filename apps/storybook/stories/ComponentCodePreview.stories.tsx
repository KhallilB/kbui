import { Badge, Button } from "@kb.ui/react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useRef, useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { ComponentCodePreview } from "../.storybook/ComponentCodePreview";

function RuntimeFixture() {
  const revision = useRef(0);
  const lastMessage = useRef<object | null>(null);
  const [result, setResult] = useState("Waiting");
  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (
        event.source === window &&
        event.origin === location.origin &&
        event.data?.type === "kbui:code-result"
      )
        setResult(event.data.error ? `Error: ${event.data.error}` : "Preview updated");
    };
    window.parent.addEventListener("message", receive);
    return () => window.parent.removeEventListener("message", receive);
  }, []);
  const send = (source: string | null, origin = location.origin, sender = window.parent) => {
    setResult("Updating");
    lastMessage.current = { type: "kbui:code", id: String(++revision.current), source };
    window.dispatchEvent(
      new MessageEvent("message", {
        source: sender,
        origin,
        data: lastMessage.current,
      }),
    );
  };
  return (
    <>
      <Button
        onClick={() =>
          send('import { Badge } from "@kb.ui/react"; <Badge tone="success">Ready</Badge>')
        }
      >
        Edit content and props
      </Button>
      <Button onClick={() => send('<Badge tone="')}>Invalid JSX</Button>
      <Button
        onClick={() => send('import { Badge } from "@kb.ui/react"; <Badge>{missing.value}</Badge>')}
      >
        Render error
      </Button>
      <Button
        onClick={() =>
          send(
            'import { useState } from "react"; function Example() { const [count, setCount] = useState(0); return <button onClick={() => setCount(count + 1)}>Count {count}</button>; }',
          )
        }
      >
        Hook example
      </Button>
      <Button onClick={() => send(null)}>Reset code</Button>
      <Button
        onClick={() => {
          setResult("Updating");
          window.dispatchEvent(
            new MessageEvent("message", {
              source: window.parent,
              origin: location.origin,
              data: lastMessage.current,
            }),
          );
        }}
      >
        Resend current code
      </Button>
      <Button onClick={() => send("<span>Wrong origin</span>", "https://elsewhere.invalid")}>
        Wrong origin
      </Button>
      <Button onClick={() => send("<span>Wrong sender</span>", location.origin, window)}>
        Wrong sender
      </Button>
      <section aria-label="Runtime output">
        <ComponentCodePreview>
          <Badge>Original</Badge>
        </ComponentCodePreview>
      </section>
      <p role="status">{result}</p>
    </>
  );
}

const meta = { title: "Site/ComponentCodePreview", component: RuntimeFixture } satisfies Meta<
  typeof RuntimeFixture
>;
export default meta;
type Story = StoryObj<typeof meta>;

export const EditAndRecover: Story = {
  play: async ({ canvasElement }) => {
    const page = within(canvasElement);
    const output = within(page.getByRole("region", { name: "Runtime output" }));
    await userEvent.click(page.getByRole("button", { name: "Edit content and props" }));
    await waitFor(() => expect(output.getByText("Ready")).toHaveAttribute("data-tone", "success"), {
      timeout: 10000,
    });
    const working = output.getByText("Ready");
    await userEvent.click(page.getByRole("button", { name: "Invalid JSX" }));
    await waitFor(() => expect(page.getByRole("status")).toHaveTextContent("Error:"));
    await waitFor(() => expect(output.getByText("Ready")).toBe(working));
    await userEvent.click(page.getByRole("button", { name: "Render error" }));
    await waitFor(() =>
      expect(page.getByRole("status")).toHaveTextContent("missing is not defined"),
    );
    await waitFor(() => expect(output.getByText("Ready")).toHaveAttribute("data-tone", "success"));
    await userEvent.click(page.getByRole("button", { name: "Hook example" }));
    await userEvent.click(await output.findByRole("button", { name: "Count 0" }));
    expect(output.getByRole("button", { name: "Count 1" })).toBeVisible();
    await userEvent.click(page.getByRole("button", { name: "Resend current code" }));
    await waitFor(() => expect(page.getByRole("status")).toHaveTextContent("Preview updated"));
    expect(output.getByRole("button", { name: "Count 1" })).toBeVisible();
    await userEvent.click(page.getByRole("button", { name: "Reset code" }));
    expect(output.getByText("Original")).toBeVisible();
  },
};

export const TrustedParentOnly: Story = {
  play: async ({ canvasElement }) => {
    const page = within(canvasElement);
    await userEvent.click(page.getByRole("button", { name: "Wrong origin" }));
    await userEvent.click(page.getByRole("button", { name: "Wrong sender" }));
    expect(page.getByText("Original")).toBeVisible();
    expect(page.queryByText("Wrong origin", { exact: true, selector: "span" })).toBeNull();
    expect(page.queryByText("Wrong sender", { exact: true, selector: "span" })).toBeNull();
  },
};
