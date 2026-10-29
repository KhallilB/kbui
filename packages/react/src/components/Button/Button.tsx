import { Button as Base } from "@base-ui/react/button";
import { kb } from "../../utils/kb";
import { useLinkComponent } from "../Link/Link";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

type ButtonBaseProps = Omit<Base.Props, "className"> & {
  /** Plain class string; Base UI's function form is not supported. */
  className?: string;
  /** Action emphasis: primary main, secondary supporting, ghost quiet, danger destructive. */
  variant?: ButtonVariant;
  /** Navigation destination: renders as a link through Link.Provider's component. */
  href?: string | undefined;
};

/** Icon size needs aria-label. */
export type ButtonProps = ButtonBaseProps &
  (
    | {
        /** Height and padding scale; icon is a square for a lone icon. */
        size?: Exclude<ButtonSize, "icon">;
      }
    | { size: "icon"; "aria-label": string }
  );

export function Button({
  variant = "primary",
  size = "md",
  className,
  href,
  ...props
}: ButtonProps) {
  const Anchor = useLinkComponent();
  // Caller render/role still win: the per-instance escape hatch.
  const link =
    href === undefined
      ? {}
      : { render: <Anchor href={href} />, nativeButton: false, role: "link" as const };
  return <Base {...link} {...props} {...kb("button", { variant, size }, className)} />;
}
