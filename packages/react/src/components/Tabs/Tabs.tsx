import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import { clsx as cx } from "clsx";
import {
  Children,
  type ComponentPropsWithoutRef,
  createContext,
  forwardRef,
  isValidElement,
  type ReactNode,
  useContext,
} from "react";
import type { ClassNames } from "../../utils/kb";

export type TabsOrientation = "horizontal" | "vertical";
export type TabsVariant = "line" | "pill";
export type TabsSize = "sm" | "md";
export type TabsClassKey =
  | "root"
  | "list"
  | "tab"
  | "tabIcon"
  | "tabLabel"
  | "tabBadge"
  | "indicator"
  | "panel";

type TabsStyleContextValue = {
  variant: TabsVariant;
  size: TabsSize;
  orientation: TabsOrientation;
  classNames?: ClassNames<TabsClassKey> | undefined;
};

const TabsStyleContext = createContext<TabsStyleContextValue>({
  variant: "line",
  size: "md",
  orientation: "horizontal",
});

export interface TabsProps
  extends Omit<
    ComponentPropsWithoutRef<typeof BaseTabs.Root>,
    "className" | "orientation" | "value" | "defaultValue" | "onValueChange"
  > {
  /** Controlled active tab value. */
  value?: string | number | null | undefined;
  /** Initial active tab value when uncontrolled. */
  defaultValue?: string | number | null | undefined;
  /** Called when the active tab value changes. */
  onValueChange?:
    | ((value: string | number | null, eventDetails: BaseTabs.Root.ChangeEventDetails) => void)
    | undefined;
  /** Layout axis for the tab list and panels. */
  orientation?: TabsOrientation | undefined;
  /** Visual treatment of the tab list and active indicator. */
  variant?: TabsVariant | undefined;
  /** Control density for tab triggers. */
  size?: TabsSize | undefined;
  /** Additional root class name. */
  className?: string | undefined;
  /** Custom class names for inner anatomy slots. */
  classNames?: ClassNames<TabsClassKey> | undefined;
}

export interface TabsListProps
  extends Omit<ComponentPropsWithoutRef<typeof BaseTabs.List>, "className"> {
  /** Move selection automatically when focus moves between tabs. */
  activateOnFocus?: boolean | undefined;
  /** Wrap arrow-key focus from the last tab back to the first. */
  loopFocus?: boolean | undefined;
  /** Render the sliding active indicator inside the list. */
  showIndicator?: boolean | undefined;
  /** Additional tablist class name. */
  className?: string | undefined;
}

export interface TabsTabProps
  extends Omit<ComponentPropsWithoutRef<typeof BaseTabs.Tab>, "className" | "value"> {
  /** Unique value matching the associated panel. */
  value: string | number;
  /** Prevent selecting or activating the tab. */
  disabled?: boolean | undefined;
  /** Optional leading icon rendered inside the tab trigger. */
  icon?: ReactNode | undefined;
  /** Optional trailing count or status badge. */
  badge?: ReactNode | undefined;
  /** Additional tab button class name. */
  className?: string | undefined;
}

export interface TabsIndicatorProps
  extends Omit<ComponentPropsWithoutRef<typeof BaseTabs.Indicator>, "className"> {
  /** Additional indicator class name. */
  className?: string | undefined;
}

export interface TabsPanelProps
  extends Omit<ComponentPropsWithoutRef<typeof BaseTabs.Panel>, "className" | "value"> {
  /** Tab value that reveals this panel when active. */
  value: string | number;
  /** Keep inactive panel DOM mounted when hidden. */
  keepMounted?: boolean | undefined;
  /** Additional panel class name. */
  className?: string | undefined;
}

export const TabsIndicator = forwardRef<HTMLSpanElement, TabsIndicatorProps>(function TabsIndicator(
  { className, ...props },
  ref,
) {
  const { classNames, variant, size, orientation } = useContext(TabsStyleContext);
  return (
    <BaseTabs.Indicator
      {...props}
      data-variant={variant}
      data-size={size}
      data-orientation={orientation}
      ref={ref}
      className={cx("kb-tabs-indicator", classNames?.indicator, className)}
    />
  );
});

export const TabsList = forwardRef<HTMLDivElement, TabsListProps>(function TabsList(
  { activateOnFocus = true, loopFocus = true, showIndicator = true, className, children, ...props },
  ref,
) {
  const { classNames, variant, size, orientation } = useContext(TabsStyleContext);
  const hasExplicitIndicator = Children.toArray(children).some(
    (child) => isValidElement(child) && child.type === TabsIndicator,
  );
  return (
    <BaseTabs.List
      {...props}
      data-variant={variant}
      data-size={size}
      data-orientation={orientation}
      ref={ref}
      activateOnFocus={activateOnFocus}
      loopFocus={loopFocus}
      className={cx("kb-tabs-list", classNames?.list, className)}
    >
      {children}
      {showIndicator && !hasExplicitIndicator ? <TabsIndicator /> : null}
    </BaseTabs.List>
  );
});

export const TabsTab = forwardRef<HTMLButtonElement, TabsTabProps>(function TabsTab(
  { value, disabled = false, icon, badge, className, children, ...props },
  ref,
) {
  const { classNames, variant, size, orientation } = useContext(TabsStyleContext);
  return (
    <BaseTabs.Tab
      {...props}
      data-variant={variant}
      data-size={size}
      data-orientation={orientation}
      ref={ref}
      value={value}
      disabled={disabled}
      className={cx("kb-tabs-tab", classNames?.tab, className)}
    >
      {icon != null ? (
        <span className={cx("kb-tabs-tab-icon", classNames?.tabIcon)} aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span className={cx("kb-tabs-tab-label", classNames?.tabLabel)}>{children}</span>
      {badge != null ? (
        <span className={cx("kb-tabs-tab-badge", classNames?.tabBadge)}>{badge}</span>
      ) : null}
    </BaseTabs.Tab>
  );
});

export const TabsPanel = forwardRef<HTMLDivElement, TabsPanelProps>(function TabsPanel(
  { value, keepMounted = false, className, children, ...props },
  ref,
) {
  const { classNames, variant, size, orientation } = useContext(TabsStyleContext);
  return (
    <BaseTabs.Panel
      {...props}
      data-variant={variant}
      data-size={size}
      data-orientation={orientation}
      ref={ref}
      value={value}
      keepMounted={keepMounted}
      className={cx("kb-tabs-panel", classNames?.panel, className)}
    >
      {children}
    </BaseTabs.Panel>
  );
});

const TabsRoot = forwardRef<HTMLDivElement, TabsProps>(function Tabs(
  {
    value,
    defaultValue,
    onValueChange,
    orientation = "horizontal",
    variant = "line",
    size = "md",
    className,
    classNames,
    children,
    ...props
  },
  ref,
) {
  return (
    <TabsStyleContext.Provider value={{ classNames, variant, size, orientation }}>
      <BaseTabs.Root
        {...props}
        ref={ref}
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        orientation={orientation}
        data-variant={variant}
        data-size={size}
        className={cx("kb-tabs", classNames?.root, className)}
      >
        {children}
      </BaseTabs.Root>
    </TabsStyleContext.Provider>
  );
});

export const Tabs = Object.assign(TabsRoot, {
  List: TabsList,
  Tab: TabsTab,
  Indicator: TabsIndicator,
  Panel: TabsPanel,
});
