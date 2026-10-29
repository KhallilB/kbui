import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { CopyableText } from "./CopyableText";

const source = "  Request_AbC/東京\t\nnext line  ";
function clipboard(writeText = vi.fn().mockResolvedValue(undefined)) {
  vi.stubGlobal("navigator", { clipboard: { writeText } });
  return writeText;
}
afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("CopyableText", () => {
  test("copies exact value independently of displayed content and forwards root ref", async () => {
    const write = clipboard();
    const copied = vi.fn();
    const ref = createRef<HTMLSpanElement>();
    render(
      <CopyableText
        ref={ref}
        value={source}
        copyLabel="Copy request ID"
        onCopy={copied}
        className="custom"
      >
        Request reference
      </CopyableText>,
    );
    expect(ref.current).toHaveClass("kb-copyabletext", "custom");
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
    fireEvent.click(screen.getByRole("button", { name: "Copy request ID" }));
    await screen.findByRole("button", { name: "Copied" });
    expect(write).toHaveBeenCalledExactlyOnceWith(source);
    expect(copied).toHaveBeenCalledExactlyOnceWith(source);
    expect(screen.getByRole("status")).toHaveTextContent("Copied to clipboard");
  });

  test("reports pending until write resolves and prevents repeated writes", async () => {
    let resolve!: () => void;
    const write = clipboard(
      vi.fn(
        () =>
          new Promise<void>((done) => {
            resolve = done;
          }),
      ),
    );
    const copied = vi.fn();
    render(<CopyableText value="reference" onCopy={copied} />);
    const button = screen.getByRole("button", { name: "Copy" });
    button.focus();
    fireEvent.click(button);
    expect(button).toHaveAccessibleName("Copying…");
    expect(button).toHaveAttribute("aria-disabled", "true");
    expect(button).toHaveFocus();
    fireEvent.click(button);
    expect(write).toHaveBeenCalledTimes(1);
    expect(copied).not.toHaveBeenCalled();
    await act(async () => resolve());
    expect(button).toHaveAccessibleName("Copied");
    expect(button).toHaveFocus();
  });

  test("keeps failure visible, exposes error callback and allows retry", async () => {
    vi.useFakeTimers();
    const denied = new Error("Permission denied");
    const write = clipboard(vi.fn().mockRejectedValueOnce(denied).mockResolvedValue(undefined));
    const failed = vi.fn();
    const copied = vi.fn();
    render(<CopyableText value="case-Sensitive" onCopyError={failed} onCopy={copied} />);
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Copy" })));
    expect(screen.getByRole("button", { name: "Retry copy" })).toBeEnabled();
    expect(screen.getByRole("status")).toHaveTextContent(
      "Copy failed. Select and copy the text manually.",
    );
    expect(failed).toHaveBeenCalledExactlyOnceWith(denied);
    expect(copied).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(10000));
    expect(screen.getByRole("status")).toHaveTextContent("Copy failed");
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Retry copy" })));
    expect(screen.getByRole("button", { name: "Copied" })).toBeVisible();
    expect(write).toHaveBeenCalledTimes(2);
  });

  test("handles unavailable clipboard without claiming success", async () => {
    vi.stubGlobal("navigator", {});
    render(<CopyableText value="select me" />);
    fireEvent.click(screen.getByRole("button"));
    expect(await screen.findByRole("button", { name: "Retry copy" })).toBeVisible();
    expect(screen.getByText("select me")).toBeVisible();
  });

  test("resets success after configured duration; zero retains feedback", async () => {
    vi.useFakeTimers();
    clipboard();
    const { rerender } = render(<CopyableText value="a" feedbackDuration={1500} />);
    await act(async () => fireEvent.click(screen.getByRole("button")));
    act(() => vi.advanceTimersByTime(1499));
    expect(screen.getByRole("button")).toHaveAccessibleName("Copied");
    act(() => vi.advanceTimersByTime(1));
    expect(screen.getByRole("button")).toHaveAccessibleName("Copy");
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
    rerender(<CopyableText value="b" feedbackDuration={0} />);
    await act(async () => fireEvent.click(screen.getByRole("button")));
    act(() => vi.advanceTimersByTime(10000));
    expect(screen.getByRole("button")).toHaveAccessibleName("Copied");
  });

  test("ignores stale completion after value change, disable, and unmount", async () => {
    let finish!: () => void;
    const copied = vi.fn();
    clipboard(
      vi.fn(
        () =>
          new Promise<void>((resolve) => {
            finish = resolve;
          }),
      ),
    );
    const { rerender, unmount } = render(<CopyableText value="old" onCopy={copied} />);
    fireEvent.click(screen.getByRole("button"));
    const old = finish;
    rerender(<CopyableText value="new" onCopy={copied} />);
    await act(async () => old());
    expect(screen.getByRole("button")).toHaveAccessibleName("Copy");
    expect(copied).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button"));
    rerender(<CopyableText value="new" disabled onCopy={copied} />);
    await act(async () => finish());
    expect(copied).not.toHaveBeenCalled();
    rerender(<CopyableText value="new" onCopy={copied} />);
    fireEvent.click(screen.getByRole("button"));
    unmount();
    await act(async () => finish());
    expect(copied).not.toHaveBeenCalled();
  });

  test("keyboard activation works; disabled and empty values never write", async () => {
    const user = userEvent.setup();
    const write = clipboard();
    const { rerender } = render(<CopyableText value="keyboard" />);
    await user.tab();
    await user.keyboard("{Enter}");
    expect(write).toHaveBeenCalledExactlyOnceWith("keyboard");
    rerender(<CopyableText value="blocked" disabled />);
    expect(screen.getByRole("button")).toBeDisabled();
    fireEvent.click(screen.getByRole("button"));
    rerender(<CopyableText value="" />);
    expect(screen.getByRole("button")).toBeDisabled();
    expect(write).toHaveBeenCalledTimes(1);
  });

  test("localizes feedback and never submits enclosing form", async () => {
    clipboard();
    const submit = vi.fn();
    render(
      <form onSubmit={submit}>
        <CopyableText
          value="reference"
          copyLabel="Copier"
          copiedLabel="Copié"
          successMessage="Référence copiée"
        />
      </form>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Copier" }));
    await screen.findByRole("button", { name: "Copié" });
    expect(screen.getByRole("status")).toHaveTextContent("Référence copiée");
    expect(submit).not.toHaveBeenCalled();
  });
  test("reveals exact value and removes truncation for manual failure recovery", async () => {
    clipboard(vi.fn().mockRejectedValue(new Error("Denied")));
    const { container } = render(
      <CopyableText value="Exact_Reference/東京" truncate>
        Friendly display
      </CopyableText>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Copy" }));
    await screen.findByRole("button", { name: "Retry copy" });
    expect(screen.getByText("Exact_Reference/東京")).toBeVisible();
    expect(screen.queryByText("Friendly display")).toBeNull();
    expect(container.querySelector(".kb-copyabletext")).not.toHaveAttribute("data-truncate");
  });

  test("late rejection cannot replace feedback for a newer successful value", async () => {
    let reject!: (reason: Error) => void;
    const write = clipboard(
      vi
        .fn()
        .mockImplementationOnce(
          () =>
            new Promise<void>((_, fail) => {
              reject = fail;
            }),
        )
        .mockResolvedValue(undefined),
    );
    const copied = vi.fn();
    const failed = vi.fn();
    const { rerender } = render(<CopyableText value="old" onCopy={copied} onCopyError={failed} />);
    fireEvent.click(screen.getByRole("button"));
    rerender(<CopyableText value="new" onCopy={copied} onCopyError={failed} />);
    await act(async () => fireEvent.click(screen.getByRole("button")));
    await act(async () => reject(new Error("Old write denied")));
    expect(screen.getByRole("button")).toHaveAccessibleName("Copied");
    expect(copied).toHaveBeenCalledExactlyOnceWith("new");
    expect(failed).not.toHaveBeenCalled();
    expect(write).toHaveBeenCalledTimes(2);
  });

  test.each([-1, Number.NaN, Number.POSITIVE_INFINITY])(
    "invalid duration %s uses default reset",
    async (feedbackDuration) => {
      vi.useFakeTimers();
      clipboard();
      render(<CopyableText value="reference" feedbackDuration={feedbackDuration} />);
      await act(async () => fireEvent.click(screen.getByRole("button")));
      act(() => vi.advanceTimersByTime(2000));
      expect(screen.getByRole("button")).toHaveAccessibleName("Copy");
    },
  );
  test("truncated content has keyboard disclosure, preserving copy source and focus", async () => {
    const user = userEvent.setup();
    const write = clipboard();
    const { container } = render(<CopyableText value={source} truncate />);
    const toggle = screen.getByRole("button", { name: "Show full value" });
    const content = container.querySelector(".kb-copyabletext-value");
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(toggle.getAttribute("aria-controls")).toBe(content?.id);
    await user.tab();
    expect(toggle).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(toggle).toHaveAccessibleName("Show less");
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(toggle).toHaveFocus();
    expect(container.querySelector(".kb-copyabletext")).not.toHaveAttribute("data-truncate");
    expect(content?.textContent).toBe(source);
    fireEvent.click(screen.getByRole("button", { name: "Copy" }));
    await screen.findByRole("button", { name: "Copied" });
    expect(write).toHaveBeenCalledExactlyOnceWith(source);
    await user.keyboard(" ");
    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });

  test("expanded view exposes exact raw value even when display is formatted", () => {
    const { container } = render(
      <CopyableText value="Exact_Reference" truncate>
        Friendly display
      </CopyableText>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Show full value" }));
    expect(container.querySelector(".kb-copyabletext-value")).toHaveTextContent("Exact_Reference");
    expect(screen.queryByText("Friendly display")).toBeNull();
  });

  test("viewing remains available when copying is disabled and resets for new content", () => {
    const { rerender } = render(<CopyableText value="first" truncate disabled />);
    expect(screen.getByRole("button", { name: "Copy" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Show full value" }));
    expect(screen.getByRole("button", { name: "Show less" })).toBeEnabled();
    rerender(<CopyableText value="second" truncate disabled />);
    expect(screen.getByRole("button", { name: "Show full value" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    rerender(<CopyableText value="second" />);
    expect(screen.queryByRole("button", { name: "Show full value" })).toBeNull();
  });

  test("copy failure expands raw value and disclosure labels can be localized", async () => {
    clipboard(vi.fn().mockRejectedValue(new Error("Denied")));
    const { container } = render(
      <CopyableText
        value="Exact_Reference"
        truncate
        expandLabel="Tout afficher"
        collapseLabel="Réduire"
      >
        Friendly display
      </CopyableText>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Copy" }));
    await screen.findByRole("button", { name: "Retry copy" });
    expect(screen.getByRole("button", { name: "Réduire" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(container.querySelector(".kb-copyabletext-value")).toHaveTextContent("Exact_Reference");
  });

  test.each(["neutral", "accent", "info", "success", "warning", "danger"] as const)(
    "supports %s content tone independently of copy state",
    (tone) => {
      const { container } = render(<CopyableText value="reference" tone={tone} />);
      expect(container.querySelector(".kb-copyabletext")).toHaveAttribute("data-tone", tone);
      expect(screen.getByRole("button", { name: "Copy" })).toBeEnabled();
      expect(screen.getByRole("status")).toBeEmptyDOMElement();
    },
  );
  test("nontruncated display formatting returns after retry succeeds", async () => {
    clipboard(vi.fn().mockRejectedValueOnce(new Error("Denied")).mockResolvedValue(undefined));
    render(<CopyableText value="Exact_Reference">Friendly display</CopyableText>);
    fireEvent.click(screen.getByRole("button", { name: "Copy" }));
    await screen.findByRole("button", { name: "Retry copy" });
    expect(screen.getByText("Exact_Reference")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Retry copy" }));
    await screen.findByRole("button", { name: "Copied" });
    expect(screen.getByText("Friendly display")).toBeVisible();
  });
  test("highlights literal terms without altering displayed or copied source", async () => {
    const write = clipboard();
    const value = "production a+b production Production <script>";
    const { container } = render(
      <CopyableText value={value} highlight={["production", "a+b", "", "prod"]} />,
    );
    expect([...container.querySelectorAll("mark")].map((mark) => mark.textContent)).toEqual([
      "production",
      "a+b",
      "production",
    ]);
    expect(container.querySelector(".kb-copyabletext-value")?.textContent).toBe(value);
    expect(container.querySelector("script")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Copy" }));
    await screen.findByRole("button", { name: "Copied" });
    expect(write).toHaveBeenCalledExactlyOnceWith(value);
  });

  test("linkifies web URLs, excluding sentence punctuation and unsafe schemes", () => {
    const value =
      "Read https://example.com/docs(v2). Then https://example.org/help, javascript:alert(1) <img src=x>";
    const { container } = render(<CopyableText value={value} linkify highlight="docs" />);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveAttribute("href", "https://example.com/docs(v2)");
    expect(links[1]).toHaveAttribute("href", "https://example.org/help");
    expect(links[0]?.querySelector("mark")).toHaveTextContent("docs");
    expect(container.querySelector(".kb-copyabletext-value")?.textContent).toBe(value);
    expect(container.querySelector("img")).toBeNull();
  });

  test("keeps clipped links out of tab order, then exposes keyboard navigation after expansion", async () => {
    const user = userEvent.setup();
    render(
      <CopyableText
        value="Read https://example.com/docs for help"
        truncate
        linkify
        highlight="help"
      />,
    );
    expect(screen.queryByRole("link")).toBeNull();
    const toggle = screen.getByRole("button", { name: "Show full value" });
    await user.tab();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("link", { name: "https://example.com/docs" })).toHaveAttribute(
      "href",
      "https://example.com/docs",
    );
    await user.tab({ shift: true });
    expect(screen.getByRole("link")).toHaveFocus();
    await user.tab();
    expect(toggle).toHaveFocus();
    await user.keyboard(" ");
    expect(screen.queryByRole("link")).toBeNull();
  });

  test("plain text is explicit and source formatting survives expansion and copy failure", async () => {
    const value = "production https://example.com/docs";
    const { rerender, container } = render(<CopyableText value={value} format="text" />);
    expect(screen.queryByRole("link")).toBeNull();
    clipboard(vi.fn().mockRejectedValue(new Error("Denied")));
    rerender(
      <CopyableText value={value} linkify highlight="production" truncate>
        Short preview
      </CopyableText>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Copy" }));
    await screen.findByRole("button", { name: "Retry copy" });
    expect(screen.getByRole("link")).toHaveAttribute("href", "https://example.com/docs");
    expect(container.querySelector("mark")).toHaveTextContent("production");
    expect(container.querySelector(".kb-copyabletext-value")?.textContent).toBe(value);
  });
  test("automatically recognizes web and email links without changing source", () => {
    const value =
      "Contact dev.team+alerts@example.com or www.example.com/docs. See https://example.org/help?to=dev@example.com.";
    const { container } = render(<CopyableText value={value} />);
    expect(screen.getAllByRole("link")).toHaveLength(3);
    expect(screen.getByRole("link", { name: "dev.team+alerts@example.com" })).toHaveAttribute(
      "href",
      "mailto:dev.team%2Balerts@example.com",
    );
    expect(screen.getByRole("link", { name: "www.example.com/docs" })).toHaveAttribute(
      "href",
      "https://www.example.com/docs",
    );
    expect(container.querySelector(".kb-copyabletext-value")?.textContent).toBe(value);
  });

  test.each([
    ["const count = 42;\nconsole.log(count);", "ts"],
    ['{ "ready": true, "count": 42 }', "json"],
    ["bun run check", "bash"],
    [".card { color: red; }", "css"],
    ['<button type="button">Save</button>', "html"],
  ])("automatically colors code without creating navigation: %s", (value, language) => {
    const { container } = render(<CopyableText value={value} />);
    const code = container.querySelector(".kb-copyabletext-code");
    expect(code).toHaveAttribute("data-language", language);
    expect(code?.textContent).toBe(value);
    expect(code?.querySelectorAll("[data-syntax]").length).toBeGreaterThan(0);
    expect(screen.queryByRole("link")).toBeNull();
  });

  test("inline code suppresses links inside code and preserves delimiters", () => {
    const value =
      "Run `bun run check` or email help@example.com. Literal `https://example.com/code` stays code.";
    const { container } = render(<CopyableText value={value} />);
    expect(container.querySelectorAll(".kb-copyabletext-code")).toHaveLength(2);
    expect(screen.getAllByRole("link")).toHaveLength(1);
    expect(screen.getByRole("link")).toHaveAttribute("href", "mailto:help@example.com");
    expect(container.querySelector(".kb-copyabletext-value")?.textContent).toBe(value);
  });

  test("supports forced code and plain overrides, preserving raw clipboard text", async () => {
    const write = clipboard();
    const value = "Contact help@example.com";
    const { container, rerender } = render(
      <CopyableText value={value} format="code" language="plain" />,
    );
    expect(container.querySelector("code")?.textContent).toBe(value);
    expect(screen.queryByRole("link")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Copy" }));
    await screen.findByRole("button", { name: "Copied" });
    expect(write).toHaveBeenCalledExactlyOnceWith(value);
    rerender(<CopyableText value="const count = 42;" format="text" />);
    expect(container.querySelector("code")).toBeNull();
    rerender(<CopyableText value={value} linkify={false} />);
    expect(screen.queryByRole("link")).toBeNull();
  });

  test("keeps prose and malformed addresses literal and rejects active markup", () => {
    const value =
      "Please let us know. bad..local@example.com javascript:alert(1) <script>alert(1)</script>";
    const { container } = render(<CopyableText value={value} />);
    expect(screen.queryByRole("link")).toBeNull();
    expect(container.querySelector("script")).toBeNull();
    expect(container.querySelector(".kb-copyabletext-value")?.textContent).toBe(value);
  });

  test("recognizes uppercase www links and fenced code while preserving raw source", () => {
    const { container, rerender } = render(<CopyableText value="WWW.Example.COM/docs" />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "https://WWW.Example.COM/docs");
    const source = '```json\n{"ready": true}\n```';
    rerender(<CopyableText value={source} />);
    expect(container.querySelector("code")).toHaveAttribute("data-language", "json");
    expect(container.querySelector("code")?.textContent).toBe(source);
  });

  test("unknown fenced languages cannot resolve inherited object properties", () => {
    const source = "```constructor\nhello\n```";
    const { container } = render(<CopyableText value={source} />);
    expect(container.querySelector("code")).toHaveAttribute("data-language", "plain");
    expect(container.querySelector("code")?.textContent).toBe(source);
  });

  test("email www subdomains remain complete mailto links", () => {
    render(<CopyableText value="Email help@www.example.com for details." />);
    expect(screen.getAllByRole("link")).toHaveLength(1);
    expect(screen.getByRole("link", { name: "help@www.example.com" })).toHaveAttribute(
      "href",
      "mailto:help@www.example.com",
    );
  });

  test("embedded domains stay literal while complete URLs retain email query values", async () => {
    const value =
      "Build id_www.example.com. Visit (https://example.com/docs?contact=help@www.example.com).";
    const write = clipboard();
    const { container } = render(<CopyableText value={value} />);
    expect(screen.getAllByRole("link")).toHaveLength(1);
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "https://example.com/docs?contact=help@www.example.com",
    );
    expect(container.querySelector(".kb-copyabletext-value")?.textContent).toBe(value);
    fireEvent.click(screen.getByRole("button", { name: "Copy" }));
    await screen.findByRole("button", { name: "Copied" });
    expect(write).toHaveBeenCalledExactlyOnceWith(value);
  });
});
