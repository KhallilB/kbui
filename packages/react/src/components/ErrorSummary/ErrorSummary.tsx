import { clsx } from "clsx";
import { type ComponentProps, type MouseEvent, type ReactNode, useId } from "react";
import { type ClassNames, kb } from "../../utils/kb";

export type ErrorSummaryHeadingLevel = 2 | 3 | 4;
export type ErrorSummaryPart = "title" | "description" | "list" | "item" | "link";

export interface ErrorSummaryItem {
  /** Optional key when multiple items point to the same href. */
  id?: string | undefined;
  /** Anchor fragment such as "#email" targeting the invalid field or group. */
  href: string;
  /** Actionable message naming the field and how to fix it. */
  label: ReactNode;
}

export interface ErrorSummaryProps extends Omit<ComponentProps<"div">, "title"> {
  /** Summary heading displayed above the error list. */
  title?: ReactNode | undefined;
  /** Optional guidance shown between the heading and list. */
  description?: ReactNode | undefined;
  /** Ordered field errors with fragment links for focus recovery. */
  items: readonly ErrorSummaryItem[];
  /** Document heading rank for the summary title. */
  headingLevel?: ErrorSummaryHeadingLevel | undefined;
  /** Callback fired when a recovery link is activated. */
  onItemSelect?: ((href: string, event: MouseEvent<HTMLAnchorElement>) => void) | undefined;
  /** Classes for the title, description, list, item and link slots. */
  classNames?: ClassNames<ErrorSummaryPart> | undefined;
}

const FOCUSABLE_CHILD_SELECTOR = [
  "input:not(:disabled):not([type='hidden']):not([hidden]):not([tabindex='-1']):not([aria-hidden='true'])",
  "textarea:not(:disabled):not([hidden]):not([tabindex='-1']):not([aria-hidden='true'])",
  "select:not(:disabled):not([hidden]):not([tabindex='-1']):not([aria-hidden='true'])",
  "button:not(:disabled):not([hidden]):not([tabindex='-1']):not([aria-hidden='true'])",
  "[tabindex]:not([tabindex='-1']):not(:disabled):not([hidden]):not([aria-hidden='true']):not([aria-disabled='true'])",
].join(", ");

function focusTargetByHref(doc: Document, href: string): boolean {
  if (!href.startsWith("#") || href.length < 2) return false;
  const rawId = href.slice(1);
  let targetId = rawId;
  try {
    targetId = decodeURIComponent(rawId);
  } catch {
    targetId = rawId;
  }
  const element = doc.getElementById(targetId);
  if (!element) return false;

  const focusTarget = element.matches(FOCUSABLE_CHILD_SELECTOR)
    ? element
    : (element.querySelector<HTMLElement>(FOCUSABLE_CHILD_SELECTOR) ??
      (element.hasAttribute("tabindex") && !element.matches(":disabled") && !element.hidden
        ? element
        : null));
  if (!focusTarget) return false;

  focusTarget.focus();
  focusTarget.scrollIntoView?.({ block: "nearest" });
  return true;
}

/** Focusable form-level validation alert that links each error to its field. */
export const ErrorSummary = ({
  ref,
  title = "There is a problem",
  description,
  items,
  headingLevel = 2,
  onItemSelect,
  tabIndex = -1,
  className,
  classNames,
  "aria-labelledby": ariaLabelledBy,
  "aria-describedby": ariaDescribedBy,
  ...props
}: ErrorSummaryProps) => {
  const reactId = useId();
  if (items.length === 0) return null;

  const baseId = props.id ?? `kb-errorsummary-${reactId}`;
  const titleId = `${baseId}-title`;
  const descriptionId = description ? `${baseId}-description` : undefined;
  const labelledBy = ariaLabelledBy ?? titleId;
  const describedBy = [descriptionId, ariaDescribedBy].filter(Boolean).join(" ") || undefined;
  const HeadingTag = `h${headingLevel}` as const;
  const seenKeys = new Map<string, number>();

  return (
    <div
      {...props}
      ref={ref}
      role="alert"
      tabIndex={tabIndex}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      {...kb("errorsummary", {}, className)}
    >
      <HeadingTag id={titleId} className={clsx("kb-errorsummary-title", classNames?.title)}>
        {title}
      </HeadingTag>
      {description ? (
        <p
          id={descriptionId}
          className={clsx("kb-errorsummary-description", classNames?.description)}
        >
          {description}
        </p>
      ) : null}
      <ul className={clsx("kb-errorsummary-list", classNames?.list)}>
        {items.map((item) => {
          const baseKey =
            item.id ??
            `${item.href}:${typeof item.label === "string" || typeof item.label === "number" ? item.label : ""}`;
          const occurrence = (seenKeys.get(baseKey) ?? 0) + 1;
          seenKeys.set(baseKey, occurrence);
          const itemKey = occurrence === 1 ? baseKey : `${baseKey}:${occurrence}`;
          return (
            <li key={itemKey} className={clsx("kb-errorsummary-item", classNames?.item)}>
              <a
                href={item.href}
                className={clsx("kb-errorsummary-link", classNames?.link)}
                onClick={(event) => {
                  onItemSelect?.(item.href, event);
                  if (event.defaultPrevented) return;
                  if (focusTargetByHref(event.currentTarget.ownerDocument, item.href)) {
                    event.preventDefault();
                  }
                }}
              >
                {item.label}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
