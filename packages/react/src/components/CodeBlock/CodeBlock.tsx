import { clsx } from "clsx";
import type { Ref } from "react";
import { Code, type CodeProps } from "../Code/Code";

export type CodeBlockProps = Omit<CodeProps, "block" | "children" | "ref"> & {
  /** Exact source string, including whitespace and trailing newlines. */
  children: string;
  /** Root block element. */
  ref?: Ref<HTMLDivElement> | undefined;
};

/** Explicit block rendering with Code's highlighting, line, and collapse contracts. */
export function CodeBlock({ className, ...props }: CodeBlockProps) {
  return <Code {...props} block className={clsx("kb-codeblock", className)} />;
}
