export const variants = ["primary", "secondary", "ghost", "danger"] as const;
export const sizes = ["sm", "md", "lg"] as const;
export type PlaygroundState = {
  variant: (typeof variants)[number];
  size: (typeof sizes)[number];
  theme: "light" | "dark";
  disabled: boolean;
  reduced: boolean;
};
export const playgroundKey = (state: PlaygroundState) =>
  `${state.variant}-${state.size}-${state.theme}-${state.disabled}-${state.reduced}`;
