import { clsx } from "clsx";
import type { ComponentProps, ReactNode } from "react";
import { type ClassNames, kb } from "../../utils/kb";
import { Stat } from "../Stat/Stat";

export type StatsRowAppearance = "plain" | "outlined";
export type StatsRowTrend = "up" | "down" | "flat";
export type StatsRowTone = "positive" | "negative" | "neutral";

export type StatsRowProps = ComponentProps<"ul"> & {
  /** Plain metrics on the page, or each metric on an outlined card surface. */
  appearance?: StatsRowAppearance | undefined;
};

/** A list of comparable metrics that fills its region and wraps when narrow. */
function StatsRowRoot({ appearance = "plain", className, ...rest }: StatsRowProps) {
  // biome-ignore lint/a11y/noRedundantRoles: WebKit drops list semantics when list-style is none.
  return <ul role="list" {...rest} {...kb("statsrow", { appearance }, className)} />;
}

export type StatsRowItemProps = Omit<ComponentProps<"li">, "children"> & {
  /** What the value measures, including its period when that changes the meaning. */
  label: ReactNode;
  /** The figure with its unit; figures are tabular. */
  value: ReactNode;
  /** Change since the comparison period; its text must state the direction, such as `+12.8%`. */
  change?: ReactNode | undefined;
  /** Direction glyph beside `change`; decorative, so the change text carries the meaning. */
  trend?: StatsRowTrend | undefined;
  /** Colors `change` by whether it is good or bad news; color alone, so state it in text too. */
  tone?: StatsRowTone | undefined;
  /** Comparison period or freshness, such as `vs. previous month`. */
  context?: ReactNode | undefined;
  /** Optional link to the detail behind the metric. */
  link?: ReactNode | undefined;
  classNames?:
    | ClassNames<"stat" | "label" | "value" | "trend" | "change" | "glyph" | "context" | "link">
    | undefined;
};

const glyphs: Record<StatsRowTrend, string> = {
  up: "M8 3.5 13 10H3z",
  down: "M8 12.5 3 6h10z",
  flat: "M3 7h10v2H3z",
};

function StatsRowItem({
  label,
  value,
  change,
  trend,
  tone = "neutral",
  context,
  link,
  className,
  classNames,
  ...rest
}: StatsRowItemProps) {
  const hasTrend = change != null || context != null;

  return (
    <li {...rest} {...kb("statsrow-item", {}, className)}>
      <Stat
        label={label}
        value={value}
        className={classNames?.stat}
        classNames={classNames ?? {}}
      />
      {hasTrend ? (
        <p className={clsx("kb-statsrow-trend", classNames?.trend)}>
          {change != null ? (
            <span
              className={clsx("kb-statsrow-change", classNames?.change)}
              data-tone={tone}
              data-trend={trend}
            >
              {trend !== undefined ? (
                <svg
                  className={clsx("kb-statsrow-glyph", classNames?.glyph)}
                  viewBox="0 0 16 16"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path d={glyphs[trend]} fill="currentColor" />
                </svg>
              ) : null}
              {change}
            </span>
          ) : null}
          {change != null && context != null ? " " : null}
          {context != null ? (
            <span className={clsx("kb-statsrow-context", classNames?.context)}>{context}</span>
          ) : null}
        </p>
      ) : null}
      {link != null ? (
        <div className={clsx("kb-statsrow-link", classNames?.link)}>{link}</div>
      ) : null}
    </li>
  );
}

export const StatsRow = Object.assign(StatsRowRoot, { Item: StatsRowItem });
