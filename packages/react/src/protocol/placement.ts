/** Widths, in CSS pixels, that every placement contract is checked at. */
export const sizeClasses = { compact: 390, medium: 768, wide: 1440 } as const;
export type SizeClass = keyof typeof sizeClasses;

/** Container widths, in rem, where medium and wide begin. */
export const sizeBreakpoints = { medium: 48, wide: 64 } as const;

/**
 * Size class of a container `width` rem wide. Parent width, not viewport,
 * so a piece in a pane or dialog follows the space it actually has.
 */
export function sizeClassOf(width: number): SizeClass {
  if (width >= sizeBreakpoints.wide) return "wide";
  return width >= sizeBreakpoints.medium ? "medium" : "compact";
}

type Scope = {
  /** Selector inside the root; `:scope` is the root itself. Every match is checked. */
  part: string;
  /** Size classes the rule holds at; all when omitted. */
  at?: readonly SizeClass[] | undefined;
  /** Ancestor selector to measure against; the root, or the root's parent for `:scope`. */
  of?: string | undefined;
};

/** One placement promise; geometry is LTR. */
export type PlacementRule = Scope &
  (
    | { place: "fill" | "start" | "end" | "last" | "line" | "stack" }
    | { place: "measure"; max: number }
    | { place: "primary-last"; primary: string }
  );

/** Where a container puts its children; the stylesheet applies it, the story test checks it. */
export type PlacementContract = {
  root: string;
  rules: readonly PlacementRule[];
};

export function definePlacement<const C extends PlacementContract>(contract: C): C {
  return contract;
}

/** Data errors a contract can carry without rendering. */
export function validatePlacement(contract: PlacementContract): string[] {
  const errors: string[] = [];
  if (!/^\.kb-[a-z]+$/.test(contract.root)) errors.push(`root ${contract.root} is not a kb class`);
  if (contract.rules.length === 0) errors.push(`${contract.root} has no rules`);
  for (const rule of contract.rules) {
    const label = `${contract.root} ${rule.part} ${rule.place}`;
    if (!rule.part.trim()) errors.push(`${label}: empty part`);
    if (rule.at?.length === 0) errors.push(`${label}: empty at`);
    if (rule.place === "measure" && !(rule.max > 0)) errors.push(`${label}: max must be > 0 rem`);
  }
  return errors;
}

/** `.kb-*` classes a contract names, for the anatomy drift check. */
export function placementClasses(contract: PlacementContract): string[] {
  const text = [contract.root, ...contract.rules.flatMap((rule) => [rule.part, rule.of ?? ""])];
  for (const rule of contract.rules) if (rule.place === "primary-last") text.push(rule.primary);
  return [...new Set(text.join(" ").match(/\.kb-[a-z][a-z-]*/g) ?? [])];
}
