import { Button as Base } from "@base-ui/react/button";
import {
  Children,
  cloneElement,
  isValidElement,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import { kb } from "../../utils/kb";
import { Spinner } from "../Spinner/Spinner";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

type ButtonBaseProps = Omit<Base.Props, "className"> & {
  /** Plain class string; Base UI's function form is not supported. */
  className?: string;
  /** Action emphasis: primary main, secondary supporting, ghost quiet, danger destructive. */
  variant?: ButtonVariant;
  /** Shows progress and blocks activation while preserving the action name and focus. */
  loading?: boolean | undefined;
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

const busyState = { "aria-busy": true, "aria-disabled": true } as const;

function loadingContent(children: ReactNode) {
  return (
    <>
      {children}
      <Spinner className="kb-button-spinner" decorative size="sm" tone="current" />
    </>
  );
}

function blockActivation(event: MouseEvent) {
  event.preventDefault();
  event.stopPropagation();
}

function loadingElement(element: ReactElement, fallbackChildren?: ReactNode) {
  const target = isValidElement(element) ? element : Children.toArray(element)[0];
  if (!isValidElement<Base.Props>(target)) return element;

  return cloneElement(target, {
    ...busyState,
    onClickCapture: blockActivation,
    onAuxClickCapture: blockActivation,
    children: loadingContent(
      target.props.children === undefined ? fallbackChildren : target.props.children,
    ),
  });
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  loading = false,
  ...props
}: ButtonProps) {
  const styleProps = kb("button", { variant, size, loading }, className);
  if (!loading) return <Base {...props} {...styleProps} />;

  const { children, disabled, focusableWhenDisabled, render, ...baseProps } = props;
  const loadingRender: Base.Props["render"] =
    typeof render === "function"
      ? (elementProps, state) => loadingElement(render(elementProps, state), children)
      : render && loadingElement(render, children);

  return (
    <Base
      {...baseProps}
      {...styleProps}
      {...busyState}
      disabled
      focusableWhenDisabled={!disabled || focusableWhenDisabled}
      render={loadingRender}
    >
      {loadingRender ? children : loadingContent(children)}
    </Base>
  );
}
