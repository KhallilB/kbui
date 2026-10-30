import Markdown from "markdown-to-jsx/react";
import type { ComponentProps } from "react";
import { guideLink } from "./guide-links";
import "./guide-content.css";

function GuideCode(props: ComponentProps<"pre">) {
  return (
    // biome-ignore lint/a11y/noNoninteractiveTabindex: Code scrolls and supports keyboard selection.
    <pre {...props} tabIndex={0} />
  );
}

function GuideTable(props: ComponentProps<"table">) {
  return (
    // biome-ignore lint/a11y/noNoninteractiveTabindex: Wide tables need keyboard scrolling.
    <section className="guide-table-scroll" aria-label="Reference table" tabIndex={0}>
      <table {...props} />
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
  return (
    <Markdown
      className="system-guide"
      options={{
        disableParsingRawHTML: true,
        overrides: {
          a: {
            component: ({ href = "", ...props }: ComponentProps<"a">) => (
              <a {...props} href={guideLink(href, path, siteRoot)} target={linkTarget} />
            ),
          },
          pre: GuideCode,
          table: GuideTable,
        },
      }}
    >
      {markdown.replace(/^# .+\r?\n+/, "")}
    </Markdown>
  );
}
