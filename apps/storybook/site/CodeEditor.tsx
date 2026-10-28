import { useEffect, useId, useRef, useState } from "react";
import type { CodeToken } from "../catalog/types";
import { HighlightedCode } from "./CodePanel";
import { classSourceParts } from "./class-source";
import "./code-editor.css";

export function CodeEditor({
  label,
  value,
  onChange,
  language,
  describedBy,
  showCaption = true,
  invalid = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  language: "css" | "classes" | "tsx";
  describedBy?: string;
  showCaption?: boolean;
  invalid?: boolean;
}) {
  const id = useId();
  const overlay = useRef<HTMLPreElement>(null);
  const latest = useRef({ value, language, onChange });
  const inputValue = useRef(value);
  const revision = useRef(0);
  const dirty = useRef(false);
  useEffect(() => {
    if (value !== inputValue.current || language !== latest.current.language) {
      dirty.current = false;
      revision.current++;
    }
    inputValue.current = value;
    latest.current = { value, language, onChange };
  }, [value, language, onChange]);
  useEffect(
    () => () => {
      revision.current++;
    },
    [],
  );
  const [highlight, setHighlight] = useState<{ source: string; tokens: CodeToken[] }>();
  useEffect(() => {
    if (language === "classes") {
      setHighlight({
        source: value,
        tokens: classSourceParts(value).map<CodeToken>((part) => [
          part.start,
          part.start + part.text.length,
          part.comment ? "comment" : "string",
        ]),
      });
      return;
    }
    let current = true;
    void import("../catalog/highlight")
      .then(({ highlightCode }) => {
        if (current) setHighlight({ source: value, tokens: highlightCode(value, language) });
      })
      .catch(() => {
        /* Native editing remains available if highlighting fails. */
      });
    return () => {
      current = false;
    };
  }, [value, language]);
  return (
    <label className="catalog-skin-code" htmlFor={id}>
      {showCaption && (
        <span className="code-editor-caption">
          <span>{label}</span>
          <span aria-hidden="true">
            {language === "tsx" ? "example.tsx" : language === "css" ? "styles.css" : "className"}
          </span>
        </span>
      )}
      <div className="code-editor example-code">
        <pre ref={overlay} aria-hidden="true">
          <HighlightedCode
            code={`${value}\n`}
            tokens={highlight?.source === value ? highlight.tokens : []}
          />
        </pre>
        <textarea
          id={id}
          aria-label={showCaption ? undefined : label}
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
          value={value}
          onChange={(event) => {
            dirty.current = true;
            inputValue.current = event.target.value;
            revision.current++;
            onChange(event.target.value);
          }}
          onFocus={() => {
            revision.current++;
          }}
          onBlur={(event) => {
            if (!dirty.current) return;
            // Actions copy/reset visible draft without racing async formatting.
            if (
              event.relatedTarget instanceof Element &&
              event.relatedTarget.closest(".catalog-editor-actions")
            )
              return;
            const source = event.currentTarget.value;
            const version = ++revision.current;
            void import("./editor-format")
              .then(({ formatEditorCode }) => formatEditorCode(source, language))
              .then((formatted) => {
                if (
                  revision.current !== version ||
                  latest.current.value !== source ||
                  latest.current.language !== language
                )
                  return;
                dirty.current = false;
                inputValue.current = formatted;
                if (formatted !== source) latest.current.onChange(formatted);
              })
              .catch(() => {
                /* Keep incomplete drafts; preview owners report syntax errors. */
              });
          }}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          rows={8}
          onScroll={(event) => {
            if (overlay.current) {
              overlay.current.scrollTop = event.currentTarget.scrollTop;
              overlay.current.scrollLeft = event.currentTarget.scrollLeft;
            }
          }}
        />
      </div>
    </label>
  );
}
