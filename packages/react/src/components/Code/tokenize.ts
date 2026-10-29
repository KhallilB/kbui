export type CodeLanguage =
  | "tsx"
  | "ts"
  | "typescript"
  | "jsx"
  | "js"
  | "javascript"
  | "css"
  | "html"
  | "json"
  | "bash"
  | "sh"
  | "shell"
  | "shellscript"
  | "plain"
  | "text";

export type CodeSyntaxKind =
  | "keyword"
  | "string"
  | "comment"
  | "number"
  | "tag"
  | "attribute"
  | "type"
  | "function"
  | "operator"
  | "property";

export type CodeToken = readonly [start: number, end: number, kind: CodeSyntaxKind];

const LANGUAGE_LABELS: Record<CodeLanguage, string | undefined> = {
  tsx: "TSX",
  ts: "TS",
  typescript: "TS",
  jsx: "JSX",
  js: "JS",
  javascript: "JS",
  css: "CSS",
  html: "HTML",
  json: "JSON",
  bash: "Shell",
  sh: "Shell",
  shell: "Shell",
  shellscript: "Shell",
  plain: undefined,
  text: undefined,
};

export function formatCodeLanguage(language?: CodeLanguage): string | undefined {
  if (!language) return undefined;
  return language in LANGUAGE_LABELS ? LANGUAGE_LABELS[language] : String(language).toUpperCase();
}

const TS_KEYWORDS = new Set([
  "as",
  "async",
  "await",
  "break",
  "case",
  "catch",
  "class",
  "const",
  "continue",
  "default",
  "delete",
  "do",
  "else",
  "enum",
  "export",
  "extends",
  "false",
  "finally",
  "for",
  "from",
  "function",
  "if",
  "implements",
  "import",
  "in",
  "infer",
  "instanceof",
  "interface",
  "keyof",
  "let",
  "new",
  "null",
  "of",
  "private",
  "protected",
  "public",
  "readonly",
  "return",
  "satisfies",
  "static",
  "super",
  "switch",
  "this",
  "throw",
  "true",
  "try",
  "type",
  "typeof",
  "undefined",
  "var",
  "void",
  "while",
  "yield",
]);

const TS_BUILTIN_TYPES = new Set([
  "Array",
  "Boolean",
  "CSSProperties",
  "ComponentProps",
  "Date",
  "Error",
  "Exclude",
  "Extract",
  "HTMLButtonElement",
  "HTMLDivElement",
  "HTMLElement",
  "HTMLInputElement",
  "Map",
  "NonNullable",
  "Number",
  "Omit",
  "Parameters",
  "Partial",
  "Pick",
  "Promise",
  "ReactElement",
  "ReactNode",
  "Readonly",
  "ReadonlyArray",
  "Record",
  "Ref",
  "RegExp",
  "Required",
  "ReturnType",
  "Set",
  "String",
  "Symbol",
  "any",
  "bigint",
  "boolean",
  "never",
  "number",
  "object",
  "string",
  "symbol",
  "unknown",
]);

const TS_EXPR_KEYWORDS = new Set([
  "await",
  "case",
  "delete",
  "else",
  "in",
  "instanceof",
  "new",
  "of",
  "return",
  "throw",
  "typeof",
  "void",
  "yield",
]);

const TS_TYPE_LEAD_KEYWORDS = new Set([
  "as",
  "class",
  "enum",
  "extends",
  "implements",
  "interface",
  "satisfies",
  "type",
]);

const CSS_KEYWORDS = new Set([
  "!important",
  "absolute",
  " anywhere",
  "auto",
  "baseline",
  "block",
  "bold",
  "border-box",
  "both",
  "break-spaces",
  "center",
  "clone",
  "column",
  "contain",
  "content-box",
  "currentColor",
  "dashed",
  "dotted",
  "ease",
  "ease-in",
  "ease-in-out",
  "ease-out",
  "end",
  "fixed",
  "flex",
  "grid",
  "hidden",
  "inberg",
  "inherit",
  "initial",
  "inline",
  "inline-block",
  "inline-flex",
  "inset",
  "italic",
  "linear",
  "max-content",
  "min-content",
  "none",
  "normal",
  "nowrap",
  "pointer",
  "relative",
  "revert",
  "row",
  " scroll",
  "slice",
  "solid",
  "space-between",
  "start",
  "static",
  "sticky",
  " stretch",
  "tabular-nums",
  "transparent",
  "unset",
  "uppercase",
  "visible",
  "wrap",
]);

const SHELL_KEYWORDS = new Set([
  "case",
  "do",
  "done",
  "elif",
  "else",
  "esac",
  "exit",
  "export",
  "false",
  "fi",
  "for",
  "function",
  "if",
  "in",
  "local",
  "readonly",
  "return",
  "set",
  "then",
  "true",
  "unset",
  "until",
  "while",
]);

function isIdentStart(ch: string | undefined): boolean {
  return ch !== undefined && /[A-Za-z_$]/.test(ch);
}

function isIdentChar(ch: string | undefined): boolean {
  return ch !== undefined && /[\w$]/.test(ch);
}

function scanQuotedString(code: string, start: number, allowMultiline: boolean): number {
  const quote = code[start];
  let i = start + 1;
  while (i < code.length) {
    const ch = code[i];
    if (ch === "\\") {
      i += 2;
      continue;
    }
    if (ch === quote) return i + 1;
    if (!allowMultiline && ch === "\n") return i;
    i += 1;
  }
  return code.length;
}

// Finds matching '}' while skipping nested braces, strings, and comments.
function findMatchingBrace(code: string, openPos: number): number {
  let depth = 1;
  let i = openPos + 1;
  while (i < code.length && depth > 0) {
    const ch = code[i];
    if (code.startsWith("//", i)) {
      const nl = code.indexOf("\n", i + 2);
      i = nl === -1 ? code.length : nl + 1;
      continue;
    }
    if (code.startsWith("/*", i)) {
      const end = code.indexOf("*/", i + 2);
      i = end === -1 ? code.length : end + 2;
      continue;
    }
    if (ch === "'" || ch === '"') {
      i = scanQuotedString(code, i, false);
      continue;
    }
    if (ch === "`") {
      i = scanQuotedString(code, i, true);
      continue;
    }
    if (ch === "{") depth += 1;
    else if (ch === "}") depth -= 1;
    i += 1;
  }
  return i - 1;
}

function tokenizeTsx(code: string, baseOffset = 0): CodeToken[] {
  const tokens: CodeToken[] = [];
  let i = 0;
  let lastWord = "";
  let prevNonSpaceChar = "";
  let jsxDepth = 0;

  const push = (start: number, end: number, kind: CodeSyntaxKind) => {
    if (end > start) tokens.push([baseOffset + start, baseOffset + end, kind]);
  };

  while (i < code.length) {
    const ch = code.charAt(i);

    if (jsxDepth > 0) {
      if (ch === "{") {
        const closeBrace = findMatchingBrace(code, i);
        const exprEnd = closeBrace > i ? closeBrace : code.length;
        tokens.push(...tokenizeTsx(code.slice(i + 1, exprEnd), baseOffset + i + 1));
        i = closeBrace < code.length ? closeBrace + 1 : code.length;
        continue;
      }
      if (
        ch !== "<" ||
        (code[i + 1] !== "/" && code[i + 1] !== ">" && !isIdentStart(code[i + 1]))
      ) {
        i += 1;
        continue;
      }
    }

    if (/\s/.test(ch)) {
      i += 1;
      continue;
    }

    if (code.startsWith("//", i)) {
      const nl = code.indexOf("\n", i + 2);
      const end = nl === -1 ? code.length : nl;
      push(i, end, "comment");
      i = end;
      continue;
    }

    if (code.startsWith("/*", i)) {
      const close = code.indexOf("*/", i + 2);
      const end = close === -1 ? code.length : close + 2;
      push(i, end, "comment");
      i = end;
      continue;
    }

    if (ch === "'" || ch === '"') {
      const end = scanQuotedString(code, i, false);
      push(i, end, "string");
      prevNonSpaceChar = ch;
      lastWord = "";
      i = end;
      continue;
    }

    if (ch === "`") {
      let segStart = i;
      let cursor = i + 1;
      while (cursor < code.length) {
        const c = code[cursor];
        if (c === "\\") {
          cursor += 2;
          continue;
        }
        if (c === "`") {
          cursor += 1;
          break;
        }
        if (c === "$" && code[cursor + 1] === "{") {
          push(segStart, cursor + 2, "string");
          const closeBrace = findMatchingBrace(code, cursor + 1);
          const exprEnd = closeBrace >= cursor + 2 ? closeBrace : code.length;
          const expr = code.slice(cursor + 2, exprEnd);
          tokens.push(...tokenizeTsx(expr, baseOffset + cursor + 2));
          if (closeBrace < code.length && code[closeBrace] === "}") {
            segStart = closeBrace;
            cursor = closeBrace + 1;
          } else {
            segStart = code.length;
            cursor = code.length;
          }
          continue;
        }
        cursor += 1;
      }
      if (cursor > segStart) push(segStart, cursor, "string");
      prevNonSpaceChar = "`";
      lastWord = "";
      i = cursor;
      continue;
    }

    // JSX fragment opening: <>
    if (ch === "<" && code[i + 1] === ">") {
      push(i, i + 2, "operator");
      i += 2;
      jsxDepth += 1;
      prevNonSpaceChar = ">";
      lastWord = "";
      continue;
    }

    // JSX closing tag: </Tag> or </>
    if (ch === "<" && code[i + 1] === "/") {
      push(i, i + 2, "operator");
      i += 2;
      while (i < code.length && /\s/.test(code.charAt(i))) i += 1;
      const tagMatch = /^[A-Za-z_$][\w$.-]*/.exec(code.slice(i));
      if (tagMatch) {
        push(i, i + tagMatch[0].length, "tag");
        i += tagMatch[0].length;
      }
      while (i < code.length && /\s/.test(code.charAt(i))) i += 1;
      if (code[i] === ">") {
        push(i, i + 1, "operator");
        i += 1;
      }
      jsxDepth = Math.max(0, jsxDepth - 1);
      prevNonSpaceChar = ">";
      lastWord = "";
      continue;
    }

    // JSX opening tag when '<Ident' appears in expression position (not generic call/type).
    if (ch === "<" && isIdentStart(code[i + 1])) {
      const isGenericAfterIdent =
        jsxDepth === 0 && isIdentChar(prevNonSpaceChar) && !TS_EXPR_KEYWORDS.has(lastWord);
      if (!isGenericAfterIdent) {
        push(i, i + 1, "operator");
        i += 1;
        const tagMatch = /^[A-Za-z_$][\w$.-]*/.exec(code.slice(i));
        if (tagMatch) {
          push(i, i + tagMatch[0].length, "tag");
          i += tagMatch[0].length;
        }
        let selfClosing = false;
        // Scan JSX attributes until closing '>' or '/>'.
        while (i < code.length) {
          if (/\s/.test(code.charAt(i))) {
            i += 1;
            continue;
          }
          if (code.startsWith("/>", i)) {
            push(i, i + 2, "operator");
            i += 2;
            selfClosing = true;
            break;
          }
          if (code[i] === ">") {
            push(i, i + 1, "operator");
            i += 1;
            break;
          }
          if (code[i] === "'" || code[i] === '"') {
            const end = scanQuotedString(code, i, false);
            push(i, end, "string");
            i = end;
            continue;
          }
          if (code[i] === "{") {
            const closeBrace = findMatchingBrace(code, i);
            const exprEnd = closeBrace > i ? closeBrace : code.length;
            tokens.push(...tokenizeTsx(code.slice(i + 1, exprEnd), baseOffset + i + 1));
            i = closeBrace < code.length ? closeBrace + 1 : code.length;
            continue;
          }
          if (code[i] === "=") {
            push(i, i + 1, "operator");
            i += 1;
            continue;
          }
          const attrMatch = /^[A-Za-z_$][\w$-]*/.exec(code.slice(i));
          if (attrMatch) {
            push(i, i + attrMatch[0].length, "attribute");
            i += attrMatch[0].length;
            continue;
          }
          i += 1;
        }
        if (!selfClosing) jsxDepth += 1;
        prevNonSpaceChar = ">";
        lastWord = "";
        continue;
      }
    }

    const numMatch =
      /^(?:0[xX][\da-fA-F_]+n?|0[bB][01_]+n?|0[oO][0-7_]+n?|\d[\d_]*(?:\.\d[\d_]*)?(?:[eE][+-]?\d[\d_]*)?n?)/.exec(
        code.slice(i),
      );
    if (numMatch) {
      const len = numMatch[0].length;
      push(i, i + len, "number");
      prevNonSpaceChar = code.charAt(i + len - 1);
      lastWord = "";
      i += len;
      continue;
    }

    if (isIdentStart(ch)) {
      const identMatch = /^[A-Za-z_$][\w$]*/.exec(code.slice(i));
      const word = identMatch ? identMatch[0] : ch;
      const end = i + word.length;
      const afterSlice = code.slice(end);
      const isCall = /^\s*(?:<[^>\n]+>\s*)?\(/.test(afterSlice);
      const isObjKey =
        (prevNonSpaceChar === "{" || prevNonSpaceChar === ",") && /^\s*:(?!:)/.test(afterSlice);

      if (prevNonSpaceChar === ".") {
        push(i, end, isCall ? "function" : "property");
      } else if (isObjKey) {
        push(i, end, "property");
      } else if (TS_KEYWORDS.has(word)) {
        push(i, end, "keyword");
      } else if (TS_BUILTIN_TYPES.has(word)) {
        push(i, end, "type");
      } else if (
        TS_TYPE_LEAD_KEYWORDS.has(lastWord) ||
        (prevNonSpaceChar === ":" && /^[A-Z]/.test(word)) ||
        (prevNonSpaceChar === "<" && /^[A-Z]/.test(word))
      ) {
        push(i, end, "type");
      } else if (isCall) {
        push(i, end, "function");
      } else if (/^[A-Z]/.test(word)) {
        push(i, end, "type");
      }

      prevNonSpaceChar = word.charAt(word.length - 1);
      lastWord = word;
      i = end;
      continue;
    }

    const opMatch = /^(?:=>|===|!==|==|!=|<=|>=|&&|\|\||\?\?|\?\.|\.\.\.|[+\-*/%=<>!&|^~?:])/.exec(
      code.slice(i),
    );
    if (opMatch) {
      const op = opMatch[0];
      push(i, i + op.length, "operator");
      prevNonSpaceChar = op.charAt(op.length - 1);
      i += op.length;
      continue;
    }

    prevNonSpaceChar = ch;
    i += 1;
  }

  return tokens;
}

function tokenizeCss(code: string): CodeToken[] {
  const tokens: CodeToken[] = [];
  let i = 0;
  let braceDepth = 0;
  let inAtRuleHeader = false;

  const push = (start: number, end: number, kind: CodeSyntaxKind) => {
    if (end > start) tokens.push([start, end, kind]);
  };

  while (i < code.length) {
    const ch = code.charAt(i);

    if (/\s/.test(ch)) {
      i += 1;
      continue;
    }

    if (code.startsWith("/*", i)) {
      const close = code.indexOf("*/", i + 2);
      const end = close === -1 ? code.length : close + 2;
      push(i, end, "comment");
      i = end;
      continue;
    }

    if (ch === "'" || ch === '"') {
      const end = scanQuotedString(code, i, false);
      push(i, end, "string");
      i = end;
      continue;
    }

    if (ch === "@") {
      const m = /^@[A-Za-z_-][\w-]*/.exec(code.slice(i));
      if (m) {
        push(i, i + m[0].length, "keyword");
        inAtRuleHeader = true;
        i += m[0].length;
        continue;
      }
    }

    if (ch === "{") {
      braceDepth += 1;
      inAtRuleHeader = false;
      i += 1;
      continue;
    }

    if (ch === "}") {
      braceDepth = Math.max(0, braceDepth - 1);
      i += 1;
      continue;
    }

    if (ch === ";") {
      inAtRuleHeader = false;
      i += 1;
      continue;
    }

    if (ch === "[") {
      const close = code.indexOf("]", i + 1);
      const end = close === -1 ? code.length : close + 1;
      push(i, end, "attribute");
      i = end;
      continue;
    }

    const numMatch =
      /^(?:#[0-9a-fA-F]{3,8}\b|-?\d+(?:\.\d+)?(?:px|rem|em|ch|vh|vw|vmin|vmax|%|deg|s|ms|fr)?)/.exec(
        code.slice(i),
      );
    if (numMatch) {
      push(i, i + numMatch[0].length, "number");
      i += numMatch[0].length;
      continue;
    }

    // Declaration property or media feature before ':'
    const propMatch = /^(--[\w-]+|[A-Za-z_-][\w-]*)(?=\s*:(?!:))/.exec(code.slice(i));
    if (propMatch && (braceDepth > 0 || inAtRuleHeader)) {
      // Distinguish selector pseudo-classes (where '{' comes before ';') from declarations.
      const restAfterColon = code.slice(i + propMatch[0].length).replace(/^\s*:/, "");
      const nextSemi = restAfterColon.indexOf(";");
      const nextBrace = restAfterColon.indexOf("{");
      const isDeclaration =
        inAtRuleHeader || (nextSemi !== -1 && (nextBrace === -1 || nextSemi < nextBrace));
      if (isDeclaration) {
        push(i, i + propMatch[0].length, "attribute");
        i += propMatch[0].length;
        continue;
      }
    }

    const fnMatch = /^[A-Za-z_-][\w-]*(?=\()/.exec(code.slice(i));
    if (fnMatch) {
      push(i, i + fnMatch[0].length, "function");
      i += fnMatch[0].length;
      continue;
    }

    const varMatch = /^--[\w-]+/.exec(code.slice(i));
    if (varMatch) {
      push(i, i + varMatch[0].length, "property");
      i += varMatch[0].length;
      continue;
    }

    // Selector tag or class/id outside declarations
    const restToBrace = code.slice(i);
    const nextOpenBrace = restToBrace.indexOf("{");
    const nextSemi = restToBrace.indexOf(";");
    const inSelector =
      !inAtRuleHeader && nextOpenBrace !== -1 && (nextSemi === -1 || nextOpenBrace < nextSemi);

    if (inSelector) {
      const pseudoMatch = /^::?[A-Za-z_-][\w-]*/.exec(restToBrace);
      if (pseudoMatch) {
        push(i, i + pseudoMatch[0].length, "keyword");
        i += pseudoMatch[0].length;
        continue;
      }
      const selMatch = /^(?:\.|#)?[A-Za-z_-][\w-]*/.exec(restToBrace);
      if (selMatch) {
        push(i, i + selMatch[0].length, "tag");
        i += selMatch[0].length;
        continue;
      }
    }

    const wordMatch = /^!?[A-Za-z_-][\w-]*/.exec(code.slice(i));
    if (wordMatch) {
      if (CSS_KEYWORDS.has(wordMatch[0])) {
        push(i, i + wordMatch[0].length, "keyword");
      }
      i += wordMatch[0].length;
      continue;
    }

    i += 1;
  }

  return tokens;
}

function tokenizeHtml(code: string): CodeToken[] {
  const tokens: CodeToken[] = [];
  let i = 0;

  const push = (start: number, end: number, kind: CodeSyntaxKind) => {
    if (end > start) tokens.push([start, end, kind]);
  };

  while (i < code.length) {
    if (code.startsWith("<!--", i)) {
      const close = code.indexOf("-->", i + 4);
      const end = close === -1 ? code.length : close + 3;
      push(i, end, "comment");
      i = end;
      continue;
    }

    if (/^<!DOCTYPE/i.test(code.slice(i))) {
      const close = code.indexOf(">", i + 2);
      const end = close === -1 ? code.length : close + 1;
      push(i, end, "keyword");
      i = end;
      continue;
    }

    if (code[i] === "<" && /^<\/?[A-Za-z]/.test(code.slice(i))) {
      const isClose = code[i + 1] === "/";
      const tagStart = i + (isClose ? 2 : 1);
      push(i, tagStart, "operator");
      i = tagStart;
      const tagMatch = /^[A-Za-z][\w:-]*/.exec(code.slice(i));
      if (tagMatch) {
        push(i, i + tagMatch[0].length, "tag");
        i += tagMatch[0].length;
      }
      while (i < code.length) {
        if (/\s/.test(code.charAt(i))) {
          i += 1;
          continue;
        }
        if (code.startsWith("/>", i)) {
          push(i, i + 2, "operator");
          i += 2;
          break;
        }
        if (code[i] === ">") {
          push(i, i + 1, "operator");
          i += 1;
          break;
        }
        if (code[i] === "'" || code[i] === '"') {
          const end = scanQuotedString(code, i, false);
          push(i, end, "string");
          i = end;
          continue;
        }
        if (code[i] === "=") {
          push(i, i + 1, "operator");
          i += 1;
          continue;
        }
        const attrMatch = /^[A-Za-z_:][\w:.-]*/.exec(code.slice(i));
        if (attrMatch) {
          push(i, i + attrMatch[0].length, "attribute");
          i += attrMatch[0].length;
          continue;
        }
        i += 1;
      }
      continue;
    }

    i += 1;
  }

  return tokens;
}

function tokenizeJson(code: string): CodeToken[] {
  const tokens: CodeToken[] = [];
  let i = 0;

  while (i < code.length) {
    const ch = code.charAt(i);
    if (/\s/.test(ch)) {
      i += 1;
      continue;
    }
    if (ch === '"') {
      const end = scanQuotedString(code, i, false);
      const isKey = /^\s*:/.test(code.slice(end));
      tokens.push([i, end, isKey ? "property" : "string"]);
      i = end;
      continue;
    }
    const numMatch = /^-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/.exec(code.slice(i));
    if (numMatch) {
      tokens.push([i, i + numMatch[0].length, "number"]);
      i += numMatch[0].length;
      continue;
    }
    const kwMatch = /^(?:true|false|null)\b/.exec(code.slice(i));
    if (kwMatch) {
      tokens.push([i, i + kwMatch[0].length, "keyword"]);
      i += kwMatch[0].length;
      continue;
    }
    i += 1;
  }

  return tokens;
}

function tokenizeShell(code: string): CodeToken[] {
  const tokens: CodeToken[] = [];
  let i = 0;
  let expectCommand = true;

  while (i < code.length) {
    const ch = code.charAt(i);

    if (ch === "\n") {
      expectCommand = true;
      i += 1;
      continue;
    }

    if (/\s/.test(ch)) {
      i += 1;
      continue;
    }

    if (ch === "#" && (i === 0 || /[\s;|&()]/.test(code.charAt(i - 1)))) {
      const nl = code.indexOf("\n", i + 1);
      const end = nl === -1 ? code.length : nl;
      tokens.push([i, end, "comment"]);
      i = end;
      continue;
    }

    if (ch === "'" || ch === '"') {
      const end = scanQuotedString(code, i, true);
      tokens.push([i, end, "string"]);
      expectCommand = false;
      i = end;
      continue;
    }

    const opMatch = /^(?:\|\||&&|;;|[|&;><]+|\$\()/.exec(code.slice(i));
    if (opMatch) {
      tokens.push([i, i + opMatch[0].length, "operator"]);
      expectCommand = true;
      i += opMatch[0].length;
      continue;
    }

    const varMatch = /^\$(?:\{[A-Za-z_]\w*\}|[A-Za-z_]\w*)/.exec(code.slice(i));
    if (varMatch) {
      tokens.push([i, i + varMatch[0].length, "property"]);
      expectCommand = false;
      i += varMatch[0].length;
      continue;
    }

    const flagMatch = /^--?[A-Za-z0-9][\w-]*/.exec(code.slice(i));
    if (flagMatch && (i === 0 || /\s/.test(code.charAt(i - 1)))) {
      tokens.push([i, i + flagMatch[0].length, "attribute"]);
      expectCommand = false;
      i += flagMatch[0].length;
      continue;
    }

    const numMatch = /^\b\d+(?:\.\d+)?\b/.exec(code.slice(i));
    if (numMatch) {
      tokens.push([i, i + numMatch[0].length, "number"]);
      expectCommand = false;
      i += numMatch[0].length;
      continue;
    }

    const wordMatch = /^[A-Za-z_][\w./-]*/.exec(code.slice(i));
    if (wordMatch) {
      const word = wordMatch[0];
      if (SHELL_KEYWORDS.has(word)) {
        tokens.push([i, i + word.length, "keyword"]);
        expectCommand = word === "then" || word === "do" || word === "else";
      } else if (expectCommand) {
        tokens.push([i, i + word.length, "function"]);
        expectCommand = word === "sudo" || word === "env" || word === "npx" || word === "bunx";
      }
      i += word.length;
      continue;
    }

    i += 1;
  }

  return tokens;
}

export function tokenizeCode(code: string, language: CodeLanguage = "tsx"): CodeToken[] {
  if (!code || language === "plain" || language === "text") return [];
  switch (language) {
    case "css":
      return tokenizeCss(code);
    case "html":
      return tokenizeHtml(code);
    case "json":
      return tokenizeJson(code);
    case "bash":
    case "sh":
    case "shell":
    case "shellscript":
      return tokenizeShell(code);
    default:
      return tokenizeTsx(code);
  }
}
