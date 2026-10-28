import type { ComponentProps } from "react";
import { kb } from "../../utils/kb";

export type SeparatorOrientation = "horizontal" | "vertical";
export type SeparatorProps = Omit<
  ComponentProps<"hr">,
  "children" | "role" | "aria-hidden" | "aria-orientation"
> & {
  /** Direction of the visible rule and announced separator. */
  orientation?: SeparatorOrientation;
  /** Hide a visual-only divider from assistive technology. */
  decorative?: boolean;
};

export function Separator({
  orientation = "horizontal",
  decorative = false,
  className,
  ...props
}: SeparatorProps) {
  return (
    <hr
      {...props}
      {...kb("separator", { orientation }, className)}
      role={decorative ? "none" : undefined}
      aria-hidden={decorative ? true : undefined}
      aria-orientation={decorative ? undefined : orientation}
    />
  );
}
