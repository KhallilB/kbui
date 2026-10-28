import { Button } from "@kbui/react";
import { useEffect, useId, useRef, useState } from "react";
import type { CodeSample, CodeToken } from "../catalog/types";
import "./code-panel.css";

export function HighlightedCode({ code, tokens }: { code: string; tokens: CodeToken[] }) {
  let offset = 0;
  const content = tokens.flatMap(([start, end, kind]) => {
    const gap = code.slice(offset, start);
    offset = end;
    return [
      gap,
      <span key={start} data-syntax={kind}>
        {code.slice(start, end)}
      </span>,
    ];
  });
  return (
    <code>
      {content}
      {code.slice(offset)}
    </code>
  );
}

export function CodePanel({
  sample,
  name,
  defaultOpen = false,
  testId,
  regionLabel = "Example code",
  language = "React",
}: {
  language?: "React" | "Shell" | "HTML" | "CSS";
  sample: CodeSample;
  name: string;
  defaultOpen?: boolean;
  testId?: string;
  regionLabel?: string;
}) {
  const code = sample.snippet;
  const tokens = sample.snippetTokens;
  const id = useId();
  const [open, setOpen] = useState(defaultOpen);
  const [copied, setCopied] = useState<{ code: string; result: "copied" | "failed" } | null>(null);
  const content = useRef<HTMLElement>(null);
  const pre = useRef<HTMLPreElement>(null);
  const [height, setHeight] = useState<number>();
  useEffect(() => {
    const element = pre.current;
    if (!element) return;
    const measure = () => {
      const next = Math.ceil(element.getBoundingClientRect().height);
      if (next > 0) setHeight(next);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    measure();
    return () => observer.disconnect();
  }, []);
  const result = copied?.code === code ? copied.result : null;
  const previousCode = useRef(code);
  useEffect(() => {
    if (previousCode.current !== code) {
      content.current?.scrollTo({ top: 0, left: 0, behavior: "instant" });
      previousCode.current = code;
    }
  }, [code]);
  useEffect(() => {
    if (copied && copied.code !== code) setCopied(null);
    else if (copied?.result === "failed") content.current?.focus();
    else if (copied?.result === "copied") {
      const timer = window.setTimeout(() => setCopied(null), 2000);
      return () => window.clearTimeout(timer);
    }
  }, [code, copied]);
  return (
    <section className="example-code" aria-label={`${name} ${language} example`}>
      <div className="example-code-bar">
        <Button
          variant={open ? "primary" : "secondary"}
          size="sm"
          type="button"
          className="example-code-toggle"
          aria-label="View code"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((value) => !value)}
        >
          <svg
            aria-hidden="true"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m5 4-4 4 4 4M11 4l4 4-4 4M9 2 7 14" />
          </svg>
          Code
          <svg
            className="example-code-chevron"
            aria-hidden="true"
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m3 5 3 3 3-3" />
          </svg>
        </Button>
        <span className="example-code-caption">
          {language} · {name}
        </span>
        <Button
          variant="ghost"
          size="sm"
          type="button"
          className="example-copy"
          data-copy-state={result ?? "idle"}
          title={
            result === "failed" ? "Try again, or select the code to copy manually." : undefined
          }
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(code);
              setCopied({ code, result: "copied" });
            } catch {
              setOpen(true);
              setCopied({ code, result: "failed" });
            }
          }}
        >
          {result === "copied" ? "Copied" : result === "failed" ? "Copy failed" : "Copy code"}
          <svg
            aria-hidden="true"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinejoin="round"
          >
            {result === "copied" ? (
              <path data-copy-check="" d="m3 8 3 3 7-7" strokeLinecap="round" />
            ) : result === "failed" ? (
              <path d="m4 4 8 8M12 4l-8 8" strokeLinecap="round" />
            ) : (
              <>
                <rect x="6" y="6" width="8" height="8" rx="1" />
                <path d="M10 6V2H2v8h4" />
              </>
            )}
          </svg>
        </Button>
      </div>
      <section
        id={id}
        hidden={!open}
        ref={content}
        aria-label={regionLabel}
        // biome-ignore lint/a11y/noNoninteractiveTabindex: Code scrolls horizontally and supports manual copy.
        tabIndex={0}
        className="example-code-content"
        data-testid={testId}
        style={{
          height: height === undefined ? undefined : `min(${height}px, var(--code-max-height))`,
        }}
      >
        <pre ref={pre}>
          <HighlightedCode key={code} code={code} tokens={tokens} />
        </pre>
      </section>
      <p className="example-copy-status" role="status" aria-atomic="true">
        {result === "copied"
          ? `${name} code copied to clipboard.`
          : result === "failed"
            ? "Copy unavailable. Select the code below to copy."
            : ""}
      </p>
    </section>
  );
}
