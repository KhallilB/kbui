import { act, fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { CodeBlock } from "./CodeBlock";

afterEach(() => vi.unstubAllGlobals());
describe("CodeBlock", () => {
  test("forces block semantics for single lines and copies original source", async () => {
    const value = "  bun run check\r\n# 東京\n";
    const write = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText: write } });
    const ref = createRef<HTMLDivElement>();
    const { container, rerender } = render(
      <CodeBlock ref={ref} title="Terminal" language="bash" lineNumbers highlightLines={[2]}>
        {value}
      </CodeBlock>,
    );
    expect(ref.current).toHaveClass("kb-code", "kb-codeblock");
    expect(ref.current).toHaveAttribute("data-block", "");
    expect(container.querySelector("code")?.textContent).toBe(value);
    fireEvent.click(screen.getByRole("button", { name: "Copy code" }));
    await screen.findByRole("button", { name: "Copied" });
    expect(write).toHaveBeenCalledExactlyOnceWith(value);
    rerender(<CodeBlock>single line</CodeBlock>);
    expect(ref.current).toBeNull();
    expect(container.querySelector(".kb-codeblock")).toHaveAttribute("data-block", "");
  });

  test("keeps full source copyable while collapsed and supports controlled expansion", async () => {
    const value = "one\ntwo\nthree\nfour";
    const write = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText: write } });
    const change = vi.fn();
    render(
      <CodeBlock collapsible collapsed collapsedLines={2} onCollapsedChange={change}>
        {value}
      </CodeBlock>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Expand code" }));
    expect(change).toHaveBeenCalledExactlyOnceWith(false);
    expect(screen.getByRole("button", { name: "Expand code" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Copy code" })));
    expect(write).toHaveBeenCalledExactlyOnceWith(value);
  });

  test("exposes accessible scroll region, disabled state and copy-free mode", () => {
    const { rerender } = render(
      <CodeBlock title="Configuration" disabled>
        {"long line"}
      </CodeBlock>,
    );
    expect(screen.getByRole("region", { name: "Configuration" })).toHaveAttribute("tabindex", "0");
    expect(screen.getByRole("button", { name: "Copy code" })).toBeDisabled();
    rerender(<CodeBlock copyable={false}>{"long line"}</CodeBlock>);
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.queryByRole("status")).toBeNull();
  });
});
