import { Collapsible } from "@base-ui/react/collapsible";
import { type ComponentProps, type ReactNode, useId, useRef, useState } from "react";
import { type ClassNames, kb } from "../../utils/kb";

export type TreeListItem = {
  /** Stable identifier, unique within the tree. */
  id: string;
  /** Display content. Branch labels accept text and noninteractive inline content. */
  label: ReactNode;
  /** Nested items. Omit or pass an empty array for a leaf. */
  children?: readonly TreeListItem[] | undefined;
};

type TreeListPart = "root" | "item" | "trigger" | "label" | "branch";

export type TreeListProps = Omit<ComponentProps<"ul">, "children"> & {
  /** Ordered items at the root of the tree. */
  items: readonly TreeListItem[];
  /** Expanded branch IDs when expansion is controlled. */
  expandedIds?: readonly string[] | undefined;
  /** Initially expanded branch IDs when expansion is uncontrolled. */
  defaultExpandedIds?: readonly string[] | undefined;
  /** Reports the next expanded branch IDs after an activation. */
  onExpandedChange?: ((ids: string[]) => void) | undefined;
  /** Number of child levels that add indentation, starting below the root. */
  maxVisualDepth?: number | undefined;
  /** Extra classes for the root, items, buttons, labels and nested lists. */
  classNames?: ClassNames<TreeListPart> | undefined;
};

const defaultMaxVisualDepth = 4;

type TreeListRowProps = {
  item: TreeListItem;
  depth: number;
  maxVisualDepth: number;
  expanded: ReadonlySet<string>;
  onToggle: (id: string) => void;
  classNames: TreeListProps["classNames"];
};

function TreeListRow({
  item,
  depth,
  maxVisualDepth,
  expanded,
  onToggle,
  classNames,
}: TreeListRowProps) {
  const branchId = useId();
  const branchRef = useRef<HTMLUListElement>(null);
  const pointerHadBranchFocus = useRef(false);

  if (!item.children?.length) {
    return (
      <li {...kb("treelist-item", {}, classNames?.item)}>
        <div {...kb("treelist-label", {}, classNames?.label)}>{item.label}</div>
      </li>
    );
  }

  const isExpanded = expanded.has(item.id);
  return (
    <Collapsible.Root
      open={isExpanded}
      render={<li />}
      {...kb("treelist-item", {}, classNames?.item)}
    >
      <button
        type="button"
        aria-expanded={isExpanded}
        aria-controls={branchId}
        onPointerDown={(event) => {
          // WebKit can move focus to the document before dispatching click.
          pointerHadBranchFocus.current =
            isExpanded &&
            event.button === 0 &&
            Boolean(branchRef.current?.contains(event.currentTarget.ownerDocument.activeElement));
        }}
        onPointerCancel={() => {
          pointerHadBranchFocus.current = false;
        }}
        onClick={(event) => {
          const trigger = event.currentTarget;
          const { activeElement, body } = trigger.ownerDocument;
          const pointerBlurredBranch =
            event.detail > 0 && pointerHadBranchFocus.current && activeElement === body;
          pointerHadBranchFocus.current = false;

          if (isExpanded && (pointerBlurredBranch || branchRef.current?.contains(activeElement))) {
            trigger.focus();
          }
          onToggle(item.id);
        }}
        {...kb("treelist-trigger", {}, classNames?.trigger)}
      >
        <span {...kb("treelist-label", {}, classNames?.label)}>{item.label}</span>
      </button>
      <Collapsible.Panel
        id={branchId}
        keepMounted
        render={
          <ul
            ref={branchRef}
            // biome-ignore lint/a11y/noRedundantRoles: WebKit drops list semantics when list-style is none.
            role="list"
            inert={!isExpanded}
            aria-hidden={!isExpanded || undefined}
          />
        }
        {...kb("treelist-branch", { capped: depth >= maxVisualDepth }, classNames?.branch)}
      >
        {item.children.map((child) => (
          <TreeListRow
            key={child.id}
            item={child}
            depth={depth + 1}
            maxVisualDepth={maxVisualDepth}
            expanded={expanded}
            onToggle={onToggle}
            classNames={classNames}
          />
        ))}
      </Collapsible.Panel>
    </Collapsible.Root>
  );
}

export function TreeList({
  items,
  expandedIds,
  defaultExpandedIds,
  onExpandedChange,
  maxVisualDepth = defaultMaxVisualDepth,
  className,
  classNames,
  ...props
}: TreeListProps) {
  const [localExpanded, setLocalExpanded] = useState<ReadonlySet<string>>(
    () => new Set(defaultExpandedIds),
  );
  const expanded = expandedIds === undefined ? localExpanded : new Set(expandedIds);
  const depthLimit = Number.isFinite(maxVisualDepth)
    ? Math.max(0, Math.floor(maxVisualDepth))
    : defaultMaxVisualDepth;

  function toggle(id: string) {
    const next = new Set(expanded);
    if (!next.delete(id)) next.add(id);
    if (expandedIds === undefined) setLocalExpanded(next);
    onExpandedChange?.([...next]);
  }

  return (
    <ul
      {...props}
      role={props.role ?? "list"}
      {...kb("treelist", {}, classNames?.root ?? className)}
    >
      {items.map((item) => (
        <TreeListRow
          key={item.id}
          item={item}
          depth={0}
          maxVisualDepth={depthLimit}
          expanded={expanded}
          onToggle={toggle}
          classNames={classNames}
        />
      ))}
    </ul>
  );
}
