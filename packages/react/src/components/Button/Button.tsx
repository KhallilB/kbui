import { Button as Base } from "@base-ui/react/button";
import { kb } from "../../utils/kb";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = Omit<Base.Props, "className"> & {
  /** Plain class string; Base UI's function form is not supported. */
  className?: string;
  /** Visual weight. */
  variant?: ButtonVariant;
  /** Height and padding scale. */
  size?: ButtonSize;
};

export function Button({ variant = "primary", size = "md", className, ...props }: ButtonProps) {
  return <Base {...kb("button", { variant, size }, className)} {...props} />;
}
