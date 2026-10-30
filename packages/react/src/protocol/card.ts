import type { PlacementContract } from "./placement";

/** Protocol roles; slots accept roles, not type names. */
export type Role =
  | "action"
  | "input"
  | "feedback"
  | "region"
  | "data"
  | "navigation"
  | "text"
  | "media"
  | "layout";

export type Slot = { roles: readonly Role[]; max?: number | undefined };

/** Identity card for an intent or pattern; local until M4's protocol package adopts it. */
export type Card = {
  /** Null for whole-screen intents, which fill no other piece's slot. */
  role: Role | null;
  /** One sentence: the job it does. */
  use: string;
  /** Nearest neighbour name → the condition that picks it instead. */
  instead: Readonly<Record<string, string>>;
  /** Named regions or slots and the roles each accepts. */
  slots: Readonly<Record<string, Slot>>;
  requires?: readonly string[] | undefined;
  placement?: PlacementContract | readonly PlacementContract[] | undefined;
  /** Selection prompts; recorded pick rates arrive with M4. */
  prompts?:
    | {
        pick: readonly string[];
        nearMiss?: Readonly<Record<string, readonly string[]>> | undefined;
      }
    | undefined;
};

export function defineCard<const C extends Card>(card: C): C {
  return card;
}

/** Gaps that make a card incomplete. */
export function validateCard(card: Card): string[] {
  const errors: string[] = [];
  if (!card.use.trim()) errors.push("use is empty");
  const neighbours = Object.entries(card.instead);
  if (neighbours.length === 0) errors.push("instead names no neighbour");
  for (const [name, when] of neighbours) if (!when.trim()) errors.push(`instead.${name} is empty`);
  if (Object.keys(card.slots).length === 0) errors.push("slots is empty");
  for (const [name, slot] of Object.entries(card.slots))
    if (slot.roles.length === 0) errors.push(`slots.${name} accepts no role`);
  return errors;
}
