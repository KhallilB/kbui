import { Button as Base } from "@base-ui/react/button";
import { kb } from "../../utils/kb";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

type ButtonBaseProps = Omit<Base.Props, "className"> & {
  /** Plain class string; Base UI's function form is not supported. */
  className?: string;
  /** Visual weight. */
  variant?: ButtonVariant;
};

/** Navigation use: pass render={<a href/>} nativeButton={false} role="link". Icon size needs aria-label. */
export type ButtonProps = ButtonBaseProps &
  (
    | {
        /** Height and padding scale; icon is a square for a lone icon. */
        size?: Exclude<ButtonSize, "icon">;
      }
    | { size: "icon"; "aria-label": string }
  );

export function Button({ variant = "primary", size = "md", className, ...props }: ButtonProps) {
  return <Base {...props} {...kb("button", { variant, size }, className)} />;
}
