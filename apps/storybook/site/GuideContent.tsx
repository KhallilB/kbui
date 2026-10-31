import { Code, CodeBlock, type CodeLanguage } from "@kb.ui/react";
import { compiler, RuleType } from "markdown-to-jsx/react";
import type { ComponentProps, ReactNode } from "react";
import { guideLink } from "./guide-links";
import "./guide-content.css";

const languages = [
  "tsx",
  "ts",
  "typescript",
  "jsx",
  "js",
  "javascript",
  "css",
  "html",
  "json",
  "bash",
  "sh",
  "shell",
  "shellscript",
  "plain",
  "text",
] as const satisfies readonly CodeLanguage[];

// Raw HTML is disabled, so `docs:recipes` markers would render as text.
const generatedMarker = /^<!-- (?:generated:[a-z-]+|\/generated) -->\r?\n?/gm;

function GuideInlineCode({ onCopy, ...props }: ComponentProps<"code">) {
  // Native copy events differ from Code's clipboard callback.
  return onCopy ? <code {...props} onCopy={onCopy} /> : <Code {...props} block={false} />;
}

function GuideCode(props: ComponentProps<"pre">) {
  return (
    // biome-ignore lint/a11y/noNoninteractiveTabindex: Code scrolls and supports keyboard selection.
    <pre {...props} tabIndex={0} />
  );
}

function GuideTable({ label, children }: { label: string; children: ReactNode }) {
  return (
    // biome-ignore lint/a11y/noNoninteractiveTabindex: Wide tables need keyboard scrolling.
    <section className="guide-table-scroll" aria-label={label} tabIndex={0}>
      {children}
    </section>
  );
}

export function GuideContent({
  markdown,
  path,
  siteRoot,
  linkTarget,
}: {
  markdown: string;
  path: string;
  siteRoot: string;
  linkTarget?: "_top";
}) {
  let codeNumber = 0;
  // Numbered so each scroll region is a distinct landmark.
  let tableNumber = 0;
  const body = markdown.replace(/^# .+\r?\n+/, "").replace(generatedMarker, "");
  return (
    <div className="system-guide">
      {compiler(body, {
        wrapper: null,
        disableParsingRawHTML: true,
        renderRule: (next, node, _renderChildren, state) => {
          if (node.type === RuleType.table) {
            tableNumber += 1;
            return (
              <GuideTable key={state.key} label={`Reference table ${tableNumber}`}>
                {next()}
              </GuideTable>
            );
          }
          if (node.type !== RuleType.codeBlock || (node.attrs && Object.keys(node.attrs).length))
            return next();
          const language = languages.find((value) => value === node.lang?.toLowerCase()) ?? "plain";
          codeNumber += 1;
          return (
            <CodeBlock
              key={state.key}
              title={`Code example ${codeNumber}`}
              classNames={{
                viewport: "guide-code-viewport",
                pre: "guide-code-pre",
                content: "guide-code-content",
                line: "guide-code-line",
                lineText: "guide-code-line-text",
              }}
              language={language}
              copyable={false}
            >
              {node.text}
            </CodeBlock>
          );
        },
        overrides: {
          a: {
            component: ({ href = "", ...props }: ComponentProps<"a">) => (
              <a {...props} href={guideLink(href, path, siteRoot)} target={linkTarget} />
            ),
          },
          code: GuideInlineCode,
          pre: GuideCode,
        },
      })}
    </div>
  );
}
