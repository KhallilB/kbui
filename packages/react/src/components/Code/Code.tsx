import { clsx } from "clsx";
import {
  type ComponentProps,
  type CSSProperties,
  Fragment,
  type ReactNode,
  type Ref,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { type ClassNames, kb } from "../../utils/kb";
import { type CodeLanguage, type CodeToken, formatCodeLanguage, tokenizeCode } from "./tokenize";

export {
  type CodeLanguage,
  type CodeSyntaxKind,
  type CodeToken,
  tokenizeCode,
} from "./tokenize";

export type CodePart =
  | "header"
  | "meta"
  | "title"
  | "language"
  | "actions"
  | "toggle"
  | "copy"
  | "viewport"
  | "pre"
  | "content"
  | "line"
  | "lineNumber"
  | "lineText";

export type CodeProps = Omit<ComponentProps<"code">, "ref" | "title"> & {
  ref?: Ref<HTMLElement>;
  block?: boolean | undefined;
  language?: CodeLanguage | undefined;
  title?: string | undefined;
  copyable?: boolean | undefined;
  onCopy?: ((code: string) => void) | undefined;
  lineNumbers?: boolean | undefined;
  startLine?: number | undefined;
  highlightLines?: readonly number[] | undefined;
  minLines?: number | undefined;
  collapsible?: boolean | undefined;
  collapsedLines?: number | undefined;
  defaultCollapsed?: boolean | undefined;
  collapsed?: boolean | undefined;
  onCollapsedChange?: ((collapsed: boolean) => void) | undefined;
  maxHeight?: string | number | undefined;
  tokens?: readonly CodeToken[] | undefined;
  classNames?: ClassNames<CodePart> | undefined;
};

const SR_ONLY_STYLE: CSSProperties = {
  position: "absolute",
  width: "1px",
  height: "1px",
  padding: 0,
  margin: "-1px",
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
};

function renderLineTokens(
  lineText: string,
  lineStart: number,
  tokens: readonly CodeToken[],
): ReactNode {
  if (!lineText || tokens.length === 0) return lineText;
  const lineEnd = lineStart + lineText.length;
  const nodes: ReactNode[] = [];
  let cursor = 0;

  for (const [tokStart, tokEnd, kind] of tokens) {
    if (tokEnd <= lineStart) continue;
    if (tokStart >= lineEnd) break;
    const start = Math.max(tokStart, lineStart) - lineStart;
    const end = Math.min(tokEnd, lineEnd) - lineStart;
    if (start > cursor) {
      nodes.push(lineText.slice(cursor, start));
    }
    if (end > start) {
      nodes.push(
        <span key={start} data-syntax={kind}>
          {lineText.slice(start, end)}
        </span>,
      );
      cursor = end;
    }
  }

  if (cursor === 0) return lineText;
  if (cursor < lineText.length) {
    nodes.push(lineText.slice(cursor));
  }
  return nodes;
}

export function Code({
  ref,
  block,
  language,
  title,
  copyable,
  onCopy,
  lineNumbers = false,
  startLine = 1,
  highlightLines,
  minLines,
  collapsible = false,
  collapsedLines,
  defaultCollapsed = false,
  collapsed: collapsedProp,
  onCollapsedChange,
  maxHeight,
  tokens,
  classNames,
  className,
  style,
  children,
  ...props
}: CodeProps) {
  const viewportId = useId();
  const [uncontrolledCollapsed, setUncontrolledCollapsed] = useState(defaultCollapsed);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");
  const [expandedHeight, setExpandedHeight] = useState<number | undefined>(undefined);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const preRef = useRef<HTMLPreElement | null>(null);

  const resolvedMinLines =
    minLines !== undefined && minLines > 0 ? Math.floor(minLines) : undefined;
  const resolvedCollapsedLines =
    collapsedLines !== undefined && collapsedLines > 0
      ? Math.floor(collapsedLines)
      : collapsible && resolvedMinLines !== undefined
        ? resolvedMinLines
        : undefined;

  useEffect(() => {
    return () => {
      if (copyTimerRef.current !== null) clearTimeout(copyTimerRef.current);
    };
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: Re-measure when resolvedMinLines changes in non-ResizeObserver environments.
  useEffect(() => {
    if (!collapsible) return;
    const element = preRef.current;
    if (!element) return;
    const measure = () => {
      const next = Math.ceil(element.getBoundingClientRect().height) || element.scrollHeight;
      if (next > 0) setExpandedHeight(next);
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [collapsible, resolvedMinLines]);

  const hasBlockProps =
    language !== undefined ||
    title !== undefined ||
    copyable !== undefined ||
    lineNumbers ||
    (highlightLines !== undefined && highlightLines.length > 0) ||
    resolvedMinLines !== undefined ||
    collapsible ||
    resolvedCollapsedLines !== undefined ||
    maxHeight !== undefined ||
    tokens !== undefined;
  const isMultilineString = typeof children === "string" && children.includes("\n");
  const isBlock = block ?? (hasBlockProps || isMultilineString);

  if (!isBlock) {
    return (
      <code
        {...props}
        ref={ref as Ref<HTMLElement>}
        title={title}
        style={style}
        {...kb("code", {}, className)}
      >
        {children}
      </code>
    );
  }

  const isCollapsed = collapsible ? (collapsedProp ?? uncontrolledCollapsed) : false;
  const showCopy = copyable ?? true;
  const languageLabel = formatCodeLanguage(language);
  const hasMeta = Boolean(title || languageLabel);
  const hasActions = Boolean(collapsible || showCopy);
  const showHeader = hasMeta || hasActions;

  const rawCode = typeof children === "string" ? children : "";
  const resolvedTokens =
    typeof children === "string" ? (tokens ?? tokenizeCode(rawCode, language ?? "tsx")) : [];
  const lines = typeof children === "string" ? rawCode.split("\n") : [];
  const highlightSet =
    highlightLines && highlightLines.length > 0 ? new Set(highlightLines) : undefined;
  const extraLineCount =
    typeof children === "string" &&
    resolvedMinLines !== undefined &&
    resolvedMinLines > lines.length
      ? resolvedMinLines - lines.length
      : 0;

  const hasCustomVars =
    maxHeight !== undefined ||
    resolvedMinLines !== undefined ||
    resolvedCollapsedLines !== undefined ||
    (collapsible && expandedHeight !== undefined);
  const blockStyle: CSSProperties | undefined = hasCustomVars
    ? ({
        ...style,
        ...(maxHeight !== undefined
          ? { "--_code-max-height": typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight }
          : null),
        ...(resolvedMinLines !== undefined
          ? { "--_code-min-lines": String(resolvedMinLines) }
          : null),
        ...(resolvedCollapsedLines !== undefined
          ? { "--_code-collapsed-lines": String(resolvedCollapsedLines) }
          : null),
        ...(collapsible && expandedHeight !== undefined
          ? { "--_code-expanded-max-height": `${expandedHeight}px` }
          : null),
      } as CSSProperties)
    : style;

  const handleToggleCollapse = () => {
    const next = !isCollapsed;
    if (collapsedProp === undefined) {
      setUncontrolledCollapsed(next);
    }
    onCollapsedChange?.(next);
  };

  const handleCopy = async () => {
    if (copyTimerRef.current !== null) {
      clearTimeout(copyTimerRef.current);
      copyTimerRef.current = null;
    }
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error("Clipboard unavailable");
      }
      await navigator.clipboard.writeText(rawCode);
      setCopyState("copied");
      onCopy?.(rawCode);
    } catch {
      setCopyState("failed");
    }
    copyTimerRef.current = setTimeout(() => {
      setCopyState("idle");
      copyTimerRef.current = null;
    }, 2000);
  };

  const copyLabel =
    copyState === "copied" ? "Copied" : copyState === "failed" ? "Copy failed" : "Copy code";
  const copyAnnouncement =
    copyState === "copied"
      ? "Code copied to clipboard"
      : copyState === "failed"
        ? "Failed to copy code"
        : "";

  let offset = 0;

  return (
    <div
      {...(props as ComponentProps<"div">)}
      ref={ref as Ref<HTMLDivElement>}
      style={blockStyle}
      {...kb(
        "code",
        {
          block: true,
          "line-numbers": lineNumbers || undefined,
          "min-lines": resolvedMinLines !== undefined || undefined,
          collapsible: collapsible || undefined,
          collapsed: isCollapsed || undefined,
          "collapsed-lines": resolvedCollapsedLines !== undefined || undefined,
          language: language || undefined,
        },
        className,
      )}
    >
      {showHeader ? (
        <div className={clsx("kb-code-header", classNames?.header)}>
          {hasMeta ? (
            <div className={clsx("kb-code-meta", classNames?.meta)}>
              {title ? (
                <span className={clsx("kb-code-title", classNames?.title)}>{title}</span>
              ) : null}
              {languageLabel ? (
                <span className={clsx("kb-code-language", classNames?.language)}>
                  {languageLabel}
                </span>
              ) : null}
            </div>
          ) : null}
          {hasActions ? (
            <div className={clsx("kb-code-actions", classNames?.actions)}>
              {collapsible ? (
                <button
                  type="button"
                  className={clsx("kb-code-toggle", classNames?.toggle)}
                  aria-expanded={!isCollapsed}
                  aria-controls={viewportId}
                  onClick={handleToggleCollapse}
                >
                  <svg aria-hidden="true" viewBox="0 0 16 16">
                    <path d="M4.5 6.25 8 9.75l3.5-3.5" />
                  </svg>
                  {isCollapsed ? "Expand code" : "Collapse code"}
                </button>
              ) : null}
              {showCopy ? (
                <button
                  type="button"
                  className={clsx("kb-code-copy", classNames?.copy)}
                  data-copy-state={copyState}
                  onClick={handleCopy}
                >
                  {copyState === "copied" ? (
                    <svg aria-hidden="true" viewBox="0 0 16 16">
                      <path d="M3.5 8.5 6.5 11.5 12.5 4.5" />
                    </svg>
                  ) : copyState === "failed" ? (
                    <svg aria-hidden="true" viewBox="0 0 16 16">
                      <path d="M8 4.5v4.5M8 11.75h.01" />
                    </svg>
                  ) : (
                    <svg aria-hidden="true" viewBox="0 0 16 16">
                      <rect x="5.5" y="5.5" width="7.5" height="7.5" rx="1.5" />
                      <path d="M10.5 5.5V4a1.5 1.5 0 0 0-1.5-1.5H4A1.5 1.5 0 0 0 2.5 4v5A1.5 1.5 0 0 0 4 10.5h1.5" />
                    </svg>
                  )}
                  {copyLabel}
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
      {showCopy ? (
        <span role="status" aria-live="polite" style={SR_ONLY_STYLE}>
          {copyAnnouncement}
        </span>
      ) : null}
      <div id={viewportId} className={clsx("kb-code-viewport", classNames?.viewport)}>
        <pre ref={preRef} className={clsx("kb-code-pre", classNames?.pre)}>
          <code className={clsx("kb-code-content", classNames?.content)}>
            {typeof children === "string" ? (
              <>
                {lines.map((lineText, idx) => {
                  const lineStart = offset;
                  offset += lineText.length + 1;
                  const lineNumber = startLine + idx;
                  const isHighlighted = highlightSet?.has(lineNumber) ?? false;
                  return (
                    <Fragment key={lineNumber}>
                      {idx > 0 ? "\n" : null}
                      <span
                        className={clsx("kb-code-line", classNames?.line)}
                        data-highlighted={isHighlighted ? "" : undefined}
                      >
                        {lineNumbers ? (
                          <span
                            className={clsx("kb-code-line-number", classNames?.lineNumber)}
                            data-line-number={String(lineNumber)}
                            aria-hidden="true"
                          />
                        ) : null}
                        <span className={clsx("kb-code-line-text", classNames?.lineText)}>
                          {renderLineTokens(lineText, lineStart, resolvedTokens)}
                        </span>
                      </span>
                    </Fragment>
                  );
                })}
                {extraLineCount > 0
                  ? Array.from({ length: extraLineCount }, (_, extraOffset) => {
                      const lineNumber = startLine + lines.length + extraOffset;
                      const isHighlighted = highlightSet?.has(lineNumber) ?? false;
                      return (
                        <span
                          key={`pad-${lineNumber}`}
                          className={clsx("kb-code-line", classNames?.line)}
                          data-highlighted={isHighlighted ? "" : undefined}
                          aria-hidden="true"
                        >
                          {lineNumbers ? (
                            <span
                              className={clsx("kb-code-line-number", classNames?.lineNumber)}
                              data-line-number={String(lineNumber)}
                              aria-hidden="true"
                            />
                          ) : null}
                          <span className={clsx("kb-code-line-text", classNames?.lineText)} />
                        </span>
                      );
                    })
                  : null}
              </>
            ) : (
              children
            )}
          </code>
        </pre>
      </div>
    </div>
  );
}
