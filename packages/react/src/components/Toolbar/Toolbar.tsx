import { Toolbar as Base } from "@base-ui/react/toolbar";
import { clsx } from "clsx";
import { Button, type ButtonVariant } from "../Button/Button";

/** One tab stop for a row of actions; arrow keys move between them. Name it with aria-label. */
export type ToolbarProps = Omit<Base.Root.Props, "className"> & {
  /** Plain class string; Base UI's function form is not supported. */
  className?: string;
};
export type ToolbarGroupProps = Omit<Base.Group.Props, "className"> & {
  /** Plain class string; Base UI's function form is not supported. */
  className?: string;
};
export type ToolbarButtonProps = Omit<Base.Button.Props, "className" | "render"> & {
  /** Plain class string; Base UI's function form is not supported. */
  className?: string;
  /** Button weight; toolbars default to ghost. */
  variant?: ButtonVariant;
};
export type ToolbarSeparatorProps = Omit<Base.Separator.Props, "className"> & {
  /** Plain class string; Base UI's function form is not supported. */
  className?: string;
};

function ToolbarRoot({ className, ...props }: ToolbarProps) {
  return <Base.Root {...props} className={clsx("kb-toolbar", className)} />;
}

function ToolbarGroup({ className, ...props }: ToolbarGroupProps) {
  return <Base.Group {...props} className={clsx("kb-toolbar-group", className)} />;
}

function ToolbarButton({ variant = "ghost", className, ...props }: ToolbarButtonProps) {
  return (
    <Base.Button
      {...props}
      render={<Button variant={variant} size="sm" {...(className ? { className } : {})} />}
    />
  );
}

function ToolbarSeparator({ className, ...props }: ToolbarSeparatorProps) {
  return <Base.Separator {...props} className={clsx("kb-toolbar-separator", className)} />;
}

export const Toolbar = Object.assign(ToolbarRoot, {
  Group: ToolbarGroup,
  Button: ToolbarButton,
  Separator: ToolbarSeparator,
});
