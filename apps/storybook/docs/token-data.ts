import { tokens } from "@kb.ui/tokens";

type VariableTree = { readonly [key: string]: string | VariableTree };

function leaves(tree: VariableTree): string[] {
  return Object.values(tree).flatMap((value) =>
    typeof value === "string" ? [value] : leaves(value),
  );
}

const groups = [
  "button",
  "input",
  "dialog",
  "heading",
  "text",
  "link",
  "code",
] as const satisfies readonly (keyof typeof tokens)[];

export function componentTokenVariables() {
  return groups.flatMap((group) => leaves(tokens[group]));
}

export function fontFamilyVariables() {
  return Object.values(tokens.font).filter((value) => typeof value === "string");
}

export function fontWeightVariables() {
  return Object.values(tokens.font.weight);
}
