import { clsx } from "clsx";
import type { ReactNode } from "react";
import { type CodeLanguage, tokenizeCode } from "../Code/tokenize";
import { Link } from "../Link/Link";

type Range = { start: number; end: number };
type WebLink = Range & { href: string };
type ContentOptions = {
  highlight?: string | readonly string[] | undefined;
  linkify: boolean;
  detectCode: boolean;
  codeLanguage?: CodeLanguage | undefined;
  codeClassName?: string | undefined;
  highlightClassName?: string | undefined;
  linkClassName?: string | undefined;
};

function highlightRanges(value: string, highlight: ContentOptions["highlight"]): Range[] {
  const terms = (typeof highlight === "string" ? [highlight] : (highlight ?? [])).filter(Boolean);
  const ranges: Range[] = [];
  let cursor = 0;
  while (cursor < value.length) {
    let next: Range | undefined;
    for (const term of terms) {
      const start = value.indexOf(term, cursor);
      if (start < 0) continue;
      const end = start + term.length;
      if (!next || start < next.start || (start === next.start && end > next.end)) {
        next = { start, end };
      }
    }
    if (!next) break;
    ranges.push(next);
    cursor = next.end;
  }
  return ranges;
}

function webLinks(value: string): WebLink[] {
  const links: WebLink[] = [];
  for (const match of value.matchAll(
    /(?:https?:\/\/|www\.)[^\s<>"'`\p{Cc}\u2018\u2019\u201c\u201d]+/giu,
  )) {
    if (/[a-z0-9@_.-]/i.test(value[match.index - 1] ?? "")) continue;
    let href = match[0];
    // Keep balanced URL delimiters; leave sentence punctuation outside anchor.
    while (href) {
      const last = href.at(-1) ?? "";
      const opener = ({ ")": "(", "]": "[", "}": "{" } as Record<string, string>)[last];
      if (
        /[.,!?;:]/.test(last) ||
        (opener && href.split(last).length > href.split(opener).length)
      ) {
        href = href.slice(0, -1);
      } else break;
    }
    try {
      const url = new URL(/^www\./i.test(href) ? `https://${href}` : href);
      if (url.protocol !== "http:" && url.protocol !== "https:") continue;
      links.push({
        start: match.index,
        end: match.index + href.length,
        href: /^www\./i.test(href) ? `https://${href}` : href,
      });
    } catch {
      // Invalid web candidates remain literal text.
    }
  }
  for (const match of value.matchAll(
    /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+/giu,
  )) {
    const start = match.index;
    const end = start + match[0].length;
    if (/[a-z0-9.!#$%&'*+/=?^_`{|}~@-]/i.test(value[start - 1] ?? "")) continue;
    if (links.some((link) => start < link.end && end > link.start)) continue;
    links.push({
      start,
      end,
      href: `mailto:${encodeURIComponent(match[0]).replaceAll("%40", "@")}`,
    });
  }
  return links.sort((a, b) => a.start - b.start);
}

const CODE_LANGUAGES: Record<string, CodeLanguage> = {
  ts: "ts",
  tsx: "tsx",
  typescript: "ts",
  js: "js",
  jsx: "jsx",
  javascript: "js",
  json: "json",
  css: "css",
  html: "html",
  sh: "bash",
  bash: "bash",
  shell: "bash",
  text: "plain",
  plain: "plain",
};

export function detectCopyableLanguage(value: string): CodeLanguage | undefined {
  const source = value.trim();
  const fence = /^```([^\s`]*)[^\S\r\n]*\r?\n[\s\S]*\r?\n```$/.exec(source);
  if (fence) {
    const language = fence[1]?.toLowerCase() ?? "";
    return Object.hasOwn(CODE_LANGUAGES, language) ? CODE_LANGUAGES[language] : "plain";
  }
  if (/^[{[]/.test(source)) {
    try {
      JSON.parse(source);
      return "json";
    } catch {
      /* Continue with conservative source patterns. */
    }
  }
  if (
    /^(?:(?:export\s+(?:default\s+)?)?(?:const|let|var)\s+[\w$]+\s*[:=]|(?:export\s+)?(?:async\s+)?function\s+[\w$]+\s*\(|(?:export\s+)?(?:class|interface|enum)\s+\w+|(?:export\s+)?type\s+\w+\s*=|import\s+(?:.+\s+from\s+["']|["']))/.test(
      source,
    )
  )
    return "ts";
  if (/^<(?:[A-Z][\w.]*)[\s/>]/.test(source)) return "tsx";
  if (/^<(?:!doctype\s+html|[a-z][\w-]*(?:\s[^<>]*)?)[\s/>]/i.test(source)) return "html";
  if (
    /^(?:(?:\$\s+)?(?:bun|npm|pnpm|yarn)\s+(?:add|install|run|test|exec|dlx|build)\b|(?:\$\s+)?git\s+(?:status|diff|log|add|commit|push|pull|fetch|checkout|switch|clone)\b|(?:\$\s+)?curl\s+(?:-|https?:\/\/))/.test(
      source,
    )
  )
    return "bash";
  if (/^(?:[.#@][\w-]|[a-z][\w-]*[\s:#.])[\s\S]*\{\s*[\w-]+\s*:/i.test(source)) return "css";
  return undefined;
}

export function renderCopyableContent(value: string, options: ContentOptions): ReactNode {
  const highlights = highlightRanges(value, options.highlight);
  if (!options.linkify && !options.detectCode && !options.codeLanguage && highlights.length === 0)
    return value;
  const text = (start: number, end: number): ReactNode => {
    if (start >= end) return null;
    const nodes: ReactNode[] = [];
    let cursor = start;
    for (const range of highlights) {
      if (range.end <= start) continue;
      if (range.start >= end) break;
      const from = Math.max(cursor, range.start);
      const to = Math.min(end, range.end);
      if (from > cursor) nodes.push(value.slice(cursor, from));
      nodes.push(
        <mark key={from} className={clsx("kb-copyabletext-highlight", options.highlightClassName)}>
          {value.slice(from, to)}
        </mark>,
      );
      cursor = to;
    }
    if (cursor < end) nodes.push(value.slice(cursor, end));
    return nodes;
  };
  const code = (start: number, end: number, language: CodeLanguage): ReactNode => {
    let from = start;
    let to = end;
    const source = value.slice(start, end);
    if (source.trim().startsWith("```") && source.includes("\n")) {
      from = start + source.indexOf("\n") + 1;
      to = start + source.lastIndexOf("```");
    } else if (source.startsWith("`") && source.endsWith("`")) {
      from += 1;
      to -= 1;
    }
    const nodes: ReactNode[] = [text(start, from)];
    let cursor = from;
    for (const [tokenStart, tokenEnd, kind] of tokenizeCode(value.slice(from, to), language)) {
      const begin = from + tokenStart;
      const finish = from + tokenEnd;
      if (begin > cursor) nodes.push(text(cursor, begin));
      nodes.push(
        <span key={begin} data-syntax={kind}>
          {text(begin, finish)}
        </span>,
      );
      cursor = finish;
    }
    nodes.push(text(cursor, end));
    return (
      <code
        key={`code-${start}`}
        className={clsx("kb-code", "kb-copyabletext-code", options.codeClassName)}
        data-language={language}
      >
        {nodes}
      </code>
    );
  };
  if (options.codeLanguage) return code(0, value.length, options.codeLanguage);
  const codeRanges = options.detectCode
    ? [...value.matchAll(/`([^`\r\n]+)`/g)].map((match) => ({
        start: match.index,
        end: match.index + match[0].length,
      }))
    : [];
  const links = options.linkify
    ? webLinks(value).filter(
        (link) => !codeRanges.some((range) => link.start < range.end && link.end > range.start),
      )
    : [];
  const ranges = [
    ...codeRanges.map((range) => ({ ...range, kind: "code" as const })),
    ...links.map((link) => ({ ...link, kind: "link" as const })),
  ].sort((a, b) => a.start - b.start);
  const nodes: ReactNode[] = [];
  let cursor = 0;
  for (const range of ranges) {
    nodes.push(text(cursor, range.start));
    if (range.kind === "code") {
      nodes.push(
        code(
          range.start,
          range.end,
          detectCopyableLanguage(value.slice(range.start + 1, range.end - 1)) ?? "plain",
        ),
      );
    } else {
      nodes.push(
        <Link
          key={range.start}
          href={range.href}
          className={clsx("kb-copyabletext-link", options.linkClassName)}
        >
          {text(range.start, range.end)}
        </Link>,
      );
    }
    cursor = range.end;
  }
  nodes.push(text(cursor, value.length));
  return nodes;
}
