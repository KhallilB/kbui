import { Collapsible } from "@base-ui/react/collapsible";
import { clsx } from "clsx";
import {
  type ComponentProps,
  createContext,
  type KeyboardEvent,
  type PointerEvent,
  type Ref,
  useContext,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { kb } from "../../utils/kb";

export type PanelTone = "quiet" | "default" | "sunken" | "active" | "critical";
export type PanelRail = "none" | "accent" | "status";
export type PanelDensity = "compact" | "standard";
export type PanelGroupDirection = "row" | "column";

/** Name the region with aria-labelledby pointing at the heading inside Panel.Header. */
export type PanelProps = ComponentProps<"section"> & {
  /** Plane weight: quiet has no seam, sunken recesses, active lifts, critical warns. */
  tone?: PanelTone;
  /** Inline-start rail: accent is always accent; status follows the tone. */
  rail?: PanelRail;
  /** Padding scale. */
  density?: PanelDensity;
  /** Solid fill with no theme backdrop filter; for content that redraws often. */
  opaque?: boolean;
  /** Makes Panel.Body collapse and expand from Panel.Toggle. */
  collapsible?: boolean;
  /** Controlled open state; collapsible only. */
  open?: boolean;
  /** Initial open state; collapsible only. */
  defaultOpen?: boolean;
  /** Called when the toggle changes the open state; collapsible only. */
  onOpenChange?: (open: boolean) => void;
};
export type PanelHeaderProps = ComponentProps<"header">;
export type PanelToolbarProps = ComponentProps<"div">;
export type PanelBodyProps = ComponentProps<"div">;
export type PanelFooterProps = ComponentProps<"footer">;
export type PanelWellProps = ComponentProps<"div">;
export type PanelToggleProps = Omit<Collapsible.Trigger.Props, "className"> & {
  /** Plain class string; Base UI's function form is not supported. */
  className?: string;
};
export type PanelGroupProps = ComponentProps<"div"> & {
  /** Flow of the panels inside the group. */
  direction?: PanelGroupDirection;
};
/** Sizes the panel right before it; the panel after it takes the rest. Needs a name. */
export type PanelHandleProps = Omit<ComponentProps<"div">, "children" | "role"> & {
  /** Controlled size of the panel before the handle, in percent of the group. */
  size?: number;
  /** Initial size when uncontrolled, in percent. */
  defaultSize?: number;
  /** Smallest size in percent; Enter collapses to it. */
  min?: number;
  /** Largest size in percent. */
  max?: number;
  /** Arrow-key change in percent. */
  step?: number;
  /** Called with the next size after a key press or drag. */
  onSizeChange?: (size: number) => void;
} & ({ "aria-label": string } | { "aria-labelledby": string });

const NestedContext = createContext(false);
const CollapsibleContext = createContext(false);
const DirectionContext = createContext<PanelGroupDirection>("column");

const paneBefore = (handle: HTMLElement | null) =>
  handle?.previousElementSibling as HTMLElement | null | undefined;

function PanelRoot({
  tone = "default",
  rail = "none",
  density = "standard",
  opaque = false,
  collapsible = false,
  open,
  defaultOpen,
  onOpenChange,
  className,
  children,
  ref,
  ...props
}: PanelProps) {
  const nested = useContext(NestedContext);
  const attrs = kb("panel", { tone, rail, density, nested, opaque, collapsible }, className);
  const content = (
    <NestedContext value={true}>
      <CollapsibleContext value={collapsible}>
        <span className="kb-panel-glow" aria-hidden="true" />
        <span className="kb-panel-plate" aria-hidden="true">
          {rail !== "none" ? <span className="kb-panel-rail" /> : null}
        </span>
        {children}
      </CollapsibleContext>
    </NestedContext>
  );
  if (!collapsible) {
    return (
      <section {...props} ref={ref} {...attrs}>
        {content}
      </section>
    );
  }
  return (
    <Collapsible.Root
      {...props}
      // Base UI types the root as a div; render swaps in the section.
      ref={ref as Ref<HTMLDivElement>}
      {...(open !== undefined ? { open } : {})}
      {...(defaultOpen !== undefined ? { defaultOpen } : {})}
      {...(onOpenChange ? { onOpenChange: (next: boolean) => onOpenChange(next) } : {})}
      render={<section />}
      {...attrs}
    >
      {content}
    </Collapsible.Root>
  );
}

function PanelHeader({ className, ...props }: PanelHeaderProps) {
  return <header {...props} className={clsx("kb-panel-header", className)} />;
}

function PanelToolbar({ className, ...props }: PanelToolbarProps) {
  return <div {...props} className={clsx("kb-panel-toolbar", className)} />;
}

function PanelBody({ className, ...props }: PanelBodyProps) {
  const collapsible = useContext(CollapsibleContext);
  const merged = clsx("kb-panel-body", className);
  if (collapsible) return <Collapsible.Panel {...props} className={merged} />;
  return <div {...props} className={merged} />;
}

function PanelFooter({ className, ...props }: PanelFooterProps) {
  return <footer {...props} className={clsx("kb-panel-footer", className)} />;
}

function PanelWell({ className, ...props }: PanelWellProps) {
  return <div {...props} className={clsx("kb-panel-well", className)} />;
}

function PanelToggle({ className, ...props }: PanelToggleProps) {
  return <Collapsible.Trigger {...props} className={clsx("kb-panel-toggle", className)} />;
}

function PanelGroup({ direction = "column", className, ...props }: PanelGroupProps) {
  return (
    <DirectionContext value={direction}>
      <div {...props} {...kb("panel-group", { direction }, className)} />
    </DirectionContext>
  );
}

function PanelHandle({
  size,
  defaultSize = 50,
  min = 10,
  max = 90,
  step = 5,
  onSizeChange,
  className,
  ref,
  onKeyDown,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  ...props
}: PanelHandleProps) {
  const row = useContext(DirectionContext) === "row";
  const clamp = (value: number) => Math.min(max, Math.max(min, value));
  const [inner, setInner] = useState(defaultSize);
  const current = clamp(size ?? inner);
  const [controls, setControls] = useState<string>();
  const [dragging, setDragging] = useState(false);
  const restore = useRef(current);
  const node = useRef<HTMLDivElement | null>(null);
  const fallbackId = useId();

  useLayoutEffect(() => {
    const target = paneBefore(node.current);
    if (!target) return;
    target.id ||= fallbackId;
    setControls(target.id);
  }, [fallbackId]);

  useLayoutEffect(() => {
    paneBefore(node.current)?.style.setProperty("--kb-panel-size", `${current}%`);
  }, [current]);

  const commit = (value: number) => {
    const next = clamp(value);
    if (next === current) return;
    if (size === undefined) setInner(next);
    onSizeChange?.(next);
  };

  const keys: Record<string, () => number> = {
    [row ? "ArrowLeft" : "ArrowUp"]: () => current - step,
    [row ? "ArrowRight" : "ArrowDown"]: () => current + step,
    Home: () => min,
    End: () => max,
    Enter: () => {
      if (current > min) {
        restore.current = current;
        return min;
      }
      return restore.current;
    },
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    const next = keys[event.key];
    if (event.defaultPrevented || !next) return;
    event.preventDefault();
    commit(next());
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    onPointerDown?.(event);
    if (event.defaultPrevented || event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    setDragging(true);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    onPointerMove?.(event);
    const group = node.current?.parentElement?.getBoundingClientRect();
    const start = paneBefore(node.current)?.getBoundingClientRect();
    if (!dragging || !group || !start) return;
    const offset = row ? event.clientX - start.left : event.clientY - start.top;
    const length = row ? group.width : group.height;
    // One decimal keeps drags smooth without leaking float noise into aria-valuenow.
    if (length > 0) commit(Math.round((offset / length) * 1000) / 10);
  };

  const endDrag = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    setDragging(false);
  };

  return (
    // biome-ignore lint/a11y/useSemanticElements: a focusable splitter with a value cannot be an hr.
    <div
      {...props}
      ref={(element) => {
        node.current = element;
        if (typeof ref === "function") return ref(element);
        if (ref) ref.current = element;
      }}
      role="separator"
      tabIndex={0}
      aria-orientation={row ? "vertical" : "horizontal"}
      aria-valuenow={current}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-controls={controls}
      onKeyDown={handleKeyDown}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={(event) => {
        onPointerUp?.(event);
        endDrag(event);
      }}
      onPointerCancel={(event) => {
        onPointerCancel?.(event);
        endDrag(event);
      }}
      {...kb("panel-handle", { orientation: row ? "vertical" : "horizontal", dragging }, className)}
    />
  );
}

export const Panel = Object.assign(PanelRoot, {
  Header: PanelHeader,
  Toolbar: PanelToolbar,
  Body: PanelBody,
  Footer: PanelFooter,
  Well: PanelWell,
  Toggle: PanelToggle,
  Group: PanelGroup,
  Handle: PanelHandle,
});
