import { clsx } from "clsx";
import { type ComponentProps, useEffect, useId, useState } from "react";
import { type ClassNames, kb } from "../../utils/kb";
import { type CopyFeedbackProps, useClipboard } from "../../utils/useClipboard";
import type { CodeLanguage } from "../Code/tokenize";
import { detectCopyableLanguage, renderCopyableContent } from "./content";

export type CopyableTextPart =
  | "label"
  | "value"
  | "actions"
  | "toggle"
  | "copy"
  | "feedback"
  | "link"
  | "highlight"
  | "code";
export type CopyableTextFormat = "auto" | "text" | "code";
export type CopyableTextTone = "neutral" | "accent" | "info" | "success" | "warning" | "danger";
export type CopyableTextProps = Omit<ComponentProps<"span">, "onCopy"> &
  CopyFeedbackProps & {
    /** Exact clipboard value; display formatting never changes copied bytes. */
    value: string;
    /** Optional visible context above value. */
    label?: string | undefined;
    /** Bordered field or inline text with adjacent copy action. */
    appearance?: "field" | "plain" | undefined;
    /** Content and copy target density. */
    size?: "sm" | "md" | undefined;
    /** Monospace display for identifiers, paths, and commands. */
    mono?: boolean | undefined;
    /** Value color and subtle field tint; independent of clipboard state. */
    tone?: CopyableTextTone | undefined;
    /** Single-line preview with explicit full-value disclosure. */
    truncate?: boolean | undefined;
    /** Collapsed disclosure button text. */
    expandLabel?: string | undefined;
    /** Expanded disclosure button text. */
    collapseLabel?: string | undefined;
    /** Case-sensitive literal terms to emphasize; longer matches win overlaps. */
    highlight?: string | readonly string[] | undefined;
    /** Automatic recognition, literal text, or explicit source code. */
    format?: CopyableTextFormat | undefined;
    /** Code language hint; forces code in automatic mode. */
    language?: CodeLanguage | undefined;
    /** Override automatic web/email links when full content is visible. */
    linkify?: boolean | undefined;
    /** Extra classes for each rendered part. */
    classNames?: ClassNames<CopyableTextPart> | undefined;
  };

export function CopyableText({
  value,
  label,
  appearance = "field",
  size = "md",
  mono = true,
  tone = "neutral",
  truncate = false,
  expandLabel = "Show full value",
  collapseLabel = "Show less",
  highlight,
  linkify,
  format = "auto",
  language,
  copyLabel = "Copy",
  copyingLabel = "Copying…",
  copiedLabel = "Copied",
  copyErrorLabel = "Retry copy",
  successMessage = "Copied to clipboard",
  errorMessage = "Copy failed. Select and copy the text manually.",
  disabled,
  feedbackDuration,
  onCopy,
  onCopyError,
  className,
  classNames,
  children,
  ...props
}: CopyableTextProps) {
  const valueId = useId();
  const codeLanguage =
    format === "text"
      ? undefined
      : (language ?? (format === "code" ? "tsx" : detectCopyableLanguage(value)));
  const [disclosure, setDisclosure] = useState({ value, open: false });
  const expanded = truncate && disclosure.value === value && disclosure.open;
  useEffect(() => setDisclosure({ value, open: false }), [value]);
  const clipboard = useClipboard(value, {
    disabled,
    feedbackDuration,
    onCopy,
    onCopyError: (error) => {
      setDisclosure({ value, open: true });
      onCopyError?.(error);
    },
  });
  const buttonLabel = {
    idle: copyLabel,
    pending: copyingLabel,
    copied: copiedLabel,
    failed: copyErrorLabel,
  }[clipboard.state];
  return (
    <span
      {...props}
      {...kb(
        "copyabletext",
        {
          appearance,
          format: codeLanguage ? "code" : "text",
          size,
          mono,
          tone,
          expandable: truncate,
          expanded,
          truncate: truncate && !expanded,
          disabled: clipboard.disabled,
          "copy-state": clipboard.state,
        },
        className,
      )}
    >
      {label ? (
        <span className={clsx("kb-copyabletext-label", classNames?.label)}>{label}</span>
      ) : null}
      <span className={clsx("kb-copyabletext-value", classNames?.value)} id={valueId}>
        {children != null && !expanded && clipboard.state !== "failed"
          ? children
          : renderCopyableContent(value, {
              highlight,
              linkify: (linkify ?? format !== "text") && (!truncate || expanded),
              detectCode: format !== "text",
              codeLanguage,
              codeClassName: classNames?.code,
              highlightClassName: classNames?.highlight,
              linkClassName: classNames?.link,
            })}
      </span>
      <span className={clsx("kb-copyabletext-actions", classNames?.actions)}>
        {truncate ? (
          <button
            type="button"
            className={clsx("kb-copyabletext-toggle", classNames?.toggle)}
            aria-expanded={expanded}
            aria-controls={valueId}
            onClick={() => setDisclosure({ value, open: !expanded })}
          >
            {expanded ? collapseLabel : expandLabel}
          </button>
        ) : null}
        <button
          type="button"
          className={clsx("kb-copyabletext-copy", classNames?.copy)}
          disabled={clipboard.disabled}
          aria-disabled={clipboard.state === "pending" || undefined}
          onClick={() => void clipboard.copy()}
        >
          {buttonLabel}
        </button>
      </span>
      <span
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className={clsx(
          "kb-copyabletext-feedback",
          clipboard.state !== "failed" && "kb-sr-only",
          classNames?.feedback,
        )}
      >
        {clipboard.state === "copied"
          ? successMessage
          : clipboard.state === "failed"
            ? errorMessage
            : clipboard.state === "pending"
              ? copyingLabel
              : ""}
      </span>
    </span>
  );
}
