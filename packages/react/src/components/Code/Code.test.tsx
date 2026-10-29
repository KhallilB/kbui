import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { Code, tokenizeCode } from "./Code";

describe("Code", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("renders literal inline code without changing case or whitespace", () => {
    const ref = createRef<HTMLElement>();
    const source = '<Widget path="Src/My File.tsx" />';
    render(
      <p>
        Use{" "}
        <Code ref={ref} className="extra" id="inline-example" block={false} title="Example">
          {source}
        </Code>
        .
      </p>,
    );
    expect(ref.current?.tagName).toBe("CODE");
    expect(ref.current?.textContent).toBe(source);
    expect(ref.current).toHaveClass("kb-code", "extra");
    expect(ref.current).toHaveAttribute("title", "Example");
    expect(ref.current).not.toHaveAttribute("data-block");
    expect(screen.getByText(source).children).toHaveLength(0);
  });

  test("auto-switches to block mode on multiline strings or block props", () => {
    const { container, rerender } = render(<Code>{"const a = 1;\nconst b = 2;"}</Code>);
    const root = container.querySelector(".kb-code");
    expect(root).toHaveAttribute("data-block", "");
    expect(container.querySelector("code")?.textContent).toBe("const a = 1;\nconst b = 2;");

    rerender(<Code language="tsx">{"const single = true;"}</Code>);
    expect(container.querySelector(".kb-code")).toHaveAttribute("data-block", "");
    expect(screen.getByText("TSX")).toHaveClass("kb-code-language");

    rerender(<Code title="src/index.ts">{"export {};"}</Code>);
    expect(container.querySelector(".kb-code")).toHaveAttribute("data-block", "");
    expect(screen.getByText("src/index.ts")).toHaveClass("kb-code-title");
  });

  test("highlights TSX, CSS, HTML, JSON, and Shell while preserving exact textContent", () => {
    const tsxSource =
      // biome-ignore lint/suspicious/noTemplateCurlyInString: Fixture tests template syntax as source text.
      '// <Ignored />\nconst label = `Step ${3}`;\nexport function Demo(): ReactNode {\n  return <Button size="sm" onClick={() => save(3)}>save(3)</Button>;\n}';
    const { container, rerender } = render(<Code language="tsx">{tsxSource}</Code>);
    const codeEl = container.querySelector("code");
    expect(codeEl?.textContent).toBe(tsxSource);

    const syntaxSpans = [...container.querySelectorAll<HTMLElement>("[data-syntax]")].map((el) => [
      el.textContent,
      el.dataset.syntax,
    ]);
    expect(syntaxSpans).toContainEqual(["// <Ignored />", "comment"]);
    expect(syntaxSpans).toContainEqual(["const", "keyword"]);
    expect(syntaxSpans).toContainEqual(["export", "keyword"]);
    expect(syntaxSpans).toContainEqual(["function", "keyword"]);
    expect(syntaxSpans).toContainEqual(["Demo", "function"]);
    expect(syntaxSpans).toContainEqual(["ReactNode", "type"]);
    expect(syntaxSpans).toContainEqual(["Button", "tag"]);
    expect(syntaxSpans).toContainEqual(["size", "attribute"]);
    expect(syntaxSpans).toContainEqual(['"sm"', "string"]);
    expect(syntaxSpans).toContainEqual(["onClick", "attribute"]);
    expect(syntaxSpans).toContainEqual(["save", "function"]);
    expect(syntaxSpans).toContainEqual(["3", "number"]);
    expect(syntaxSpans).not.toContainEqual(["Ignored", "tag"]);

    const cssParts = tokenizeCode(
      "/* token rule */\n@media (min-width: 640px) {\n  .kb-code[data-block] {\n    padding: var(--kb-space-4);\n    line-height: 1.65;\n  }\n}",
      "css",
    );
    expect(cssParts.some(([, , kind]) => kind === "comment")).toBe(true);
    expect(cssParts.some(([, , kind]) => kind === "keyword")).toBe(true);
    expect(cssParts.some(([, , kind]) => kind === "tag")).toBe(true);
    expect(cssParts.some(([, , kind]) => kind === "attribute")).toBe(true);
    expect(cssParts.some(([, , kind]) => kind === "function")).toBe(true);
    expect(cssParts.some(([, , kind]) => kind === "number")).toBe(true);

    const htmlParts = tokenizeCode(
      '<!-- banner -->\n<!DOCTYPE html>\n<pre class="kb-code" data-block></pre>',
      "html",
    );
    expect(htmlParts.some(([, , kind]) => kind === "comment")).toBe(true);
    expect(htmlParts.some(([, , kind]) => kind === "keyword")).toBe(true);
    expect(htmlParts.some(([, , kind]) => kind === "tag")).toBe(true);
    expect(htmlParts.some(([, , kind]) => kind === "attribute")).toBe(true);
    expect(htmlParts.some(([, , kind]) => kind === "string")).toBe(true);

    const jsonParts = tokenizeCode(
      '{\n  "name": "@kb.ui/react",\n  "version": 1,\n  "private": false\n}',
      "json",
    );
    expect(jsonParts.some(([, , kind]) => kind === "property")).toBe(true);
    expect(jsonParts.some(([, , kind]) => kind === "string")).toBe(true);
    expect(jsonParts.some(([, , kind]) => kind === "number")).toBe(true);
    expect(jsonParts.some(([, , kind]) => kind === "keyword")).toBe(true);

    const shParts = tokenizeCode('# install\nbun add --exact "$PKG_NAME"', "bash");
    expect(shParts.some(([, , kind]) => kind === "comment")).toBe(true);
    expect(shParts.some(([, , kind]) => kind === "function")).toBe(true);
    expect(shParts.some(([, , kind]) => kind === "attribute")).toBe(true);
    expect(shParts.some(([, , kind]) => kind === "string")).toBe(true);

    rerender(
      <Code language="plain" block>
        {"const raw = 1;"}
      </Code>,
    );
    expect(container.querySelectorAll("[data-syntax]")).toHaveLength(0);

    rerender(
      <Code block tokens={[[0, 5, "keyword"]]}>
        {"const custom = 1;"}
      </Code>,
    );
    const customSpans = [...container.querySelectorAll<HTMLElement>("[data-syntax]")];
    expect(customSpans).toHaveLength(1);
    expect(customSpans[0]?.textContent).toBe("const");
    expect(customSpans[0]?.dataset.syntax).toBe("keyword");
  });

  test("renders line numbers with startLine and highlights specified lines without polluting textContent", () => {
    const snippet = "const first = 1;\nconst second = 2;\nconst third = 3;";
    const { container } = render(
      <Code language="ts" lineNumbers startLine={10} highlightLines={[11]}>
        {snippet}
      </Code>,
    );
    expect(container.querySelector("code")?.textContent).toBe(snippet);
    const numbers = [...container.querySelectorAll<HTMLElement>(".kb-code-line-number")].map(
      (el) => el.dataset.lineNumber,
    );
    expect(numbers).toEqual(["10", "11", "12"]);
    const lines = [...container.querySelectorAll<HTMLElement>(".kb-code-line")];
    expect(lines[0]).not.toHaveAttribute("data-highlighted");
    expect(lines[1]).toHaveAttribute("data-highlighted", "");
    expect(lines[2]).not.toHaveAttribute("data-highlighted");
  });

  test("copies code to clipboard with status feedback and handles copy failure", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    const onCopy = vi.fn();
    const snippet = 'import { Code } from "@kb.ui/react";\n\n<Code language="tsx">Hello</Code>';

    render(
      <Code title="Example.tsx" language="tsx" onCopy={onCopy}>
        {snippet}
      </Code>,
    );

    const copyButton = screen.getByRole("button", { name: "Copy code" });
    expect(copyButton).toHaveAttribute("data-copy-state", "idle");
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith(snippet);
      expect(onCopy).toHaveBeenCalledWith(snippet);
      expect(screen.getByRole("button", { name: "Copied" })).toHaveAttribute(
        "data-copy-state",
        "copied",
      );
      expect(screen.getByRole("status")).toHaveTextContent("Code copied to clipboard");
    });

    writeText.mockRejectedValueOnce(new Error("Denied"));
    fireEvent.click(screen.getByRole("button", { name: "Copied" }));
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Copy failed" })).toHaveAttribute(
        "data-copy-state",
        "failed",
      );
    });
  });

  test("supports collapsible code blocks and maxHeight", () => {
    const onCollapsedChange = vi.fn();
    const { container } = render(
      <Code
        title="schema.ts"
        language="ts"
        collapsible
        defaultCollapsed
        maxHeight="16rem"
        onCollapsedChange={onCollapsedChange}
      >
        {"export const a = 1;\nexport const b = 2;\nexport const c = 3;"}
      </Code>,
    );

    const root = container.querySelector<HTMLElement>(".kb-code");
    expect(root).toHaveAttribute("data-collapsible", "");
    expect(root).toHaveAttribute("data-collapsed", "");
    expect(root?.style.getPropertyValue("--_code-max-height")).toBe("16rem");

    const toggle = screen.getByRole("button", { name: "Expand code" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(toggle);

    expect(onCollapsedChange).toHaveBeenCalledWith(false);
    expect(root).not.toHaveAttribute("data-collapsed");
    expect(screen.getByRole("button", { name: "Collapse code" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  test("measures collapsible content height into --_code-expanded-max-height for smooth height transitions", () => {
    const originalScrollHeight = Object.getOwnPropertyDescriptor(
      HTMLElement.prototype,
      "scrollHeight",
    );
    Object.defineProperty(HTMLElement.prototype, "scrollHeight", {
      configurable: true,
      get() {
        return this.classList?.contains("kb-code-pre") ? 284 : 0;
      },
    });
    try {
      const { container } = render(
        <Code title="package.json" language="json" collapsible defaultCollapsed>
          {'{\n  "name": "@kb.ui/react"\n}'}
        </Code>,
      );
      const root = container.querySelector<HTMLElement>(".kb-code");
      expect(root?.style.getPropertyValue("--_code-expanded-max-height")).toBe("284px");
    } finally {
      if (originalScrollHeight) {
        Object.defineProperty(HTMLElement.prototype, "scrollHeight", originalScrollHeight);
      } else {
        // @ts-expect-error restoring prototype property
        delete HTMLElement.prototype.scrollHeight;
      }
    }
  });
});
