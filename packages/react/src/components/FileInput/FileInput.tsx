import { clsx } from "clsx";
import {
  type ComponentProps,
  type ReactNode,
  type Ref,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { kb } from "../../utils/kb";
import { Button } from "../Button/Button";

export type FileInputItem = {
  /** Stable unique identity independent of display name. */
  id: string;
  /** Visible filename and default accessible removal name. */
  name: string;
  /** Caller-owned metadata such as size or processing status. */
  description?: ReactNode;
};
export type FileInputProps = Omit<
  ComponentProps<"div">,
  "onChange" | "children" | "defaultValue"
> & {
  /** Accessible field label. */
  label: string;
  /** Retained items; caller owns acceptance and list updates. */
  items: readonly FileInputItem[];
  /** Receives original native File objects without policy filtering. */
  onFiles: (files: File[]) => void;
  /** Requests removal; focus moves only after items change. */
  onRemove: (id: string) => void;
  /** Native picker hint; callers must validate selected files. */
  accept?: string;
  /** Allow multiple selections; defaults to true. */
  multiple?: boolean;
  /** Block selection, removal and mutation callbacks. */
  disabled?: boolean;
  /** Keep retained items readable while blocking changes. */
  readOnly?: boolean;
  /** Helper text associated with picker action. */
  description?: string;
  /** Caller-owned rejection/error text; announced when shown. */
  error?: string;
  /** Hide field label visually while retaining accessible name. */
  visuallyHidden?: boolean;
  /** Localized picker action; defaults to Choose files. */
  chooseLabel?: string;
  /** Localized empty list message. */
  emptyMessage?: string;
  /** Localized accessible remove action for an item. */
  removeLabel?: (item: FileInputItem) => string;
  /** Localized announcement after controlled removal succeeds. */
  removedMessage?: (item: FileInputItem) => string;
  /** Localized native selection announcement; does not imply acceptance. */
  selectionMessage?: (count: number) => string;
  /** Custom item content; retain visible file identity. */
  renderItem?: (item: FileInputItem) => ReactNode;
  /** Class on picker action. */
  triggerClassName?: string;
  /** Class on retained-item list. */
  listClassName?: string;
  /** Class on each retained item. */
  itemClassName?: string;
  /** Ref to native hidden file input. */
  inputRef?: Ref<HTMLInputElement>;
  /** Ref to accessible picker button. */
  triggerRef?: Ref<HTMLButtonElement>;
};
const defaultRemoveLabel = (item: FileInputItem) => `Remove ${item.name}`;
const defaultRemovedMessage = (item: FileInputItem) => `${item.name} removed.`;
const defaultSelectionMessage = (count: number) =>
  `${count} ${count === 1 ? "file" : "files"} selected.`;

export function FileInput({
  label,
  items,
  onFiles,
  onRemove,
  accept,
  multiple = true,
  disabled = false,
  readOnly = false,
  description,
  error,
  visuallyHidden,
  chooseLabel = "Choose files",
  emptyMessage = "No files added.",
  removeLabel = defaultRemoveLabel,
  removedMessage = defaultRemovedMessage,
  selectionMessage = defaultSelectionMessage,
  renderItem,
  triggerClassName,
  listClassName,
  itemClassName,
  inputRef,
  triggerRef,
  className,
  onBlurCapture,
  "aria-describedby": callerDescription,
  ...props
}: FileInputProps) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const removeButtons = useRef(new Map<string, HTMLButtonElement>());
  const pending = useRef<{ item: FileInputItem; index: number; button: HTMLButtonElement } | null>(
    null,
  );
  const [announcement, setAnnouncement] = useState("");
  useImperativeHandle(inputRef, () => input.current as HTMLInputElement);
  useImperativeHandle(triggerRef, () => trigger.current as HTMLButtonElement);
  const blocked = disabled || readOnly;
  const described =
    [description ? `${id}-description` : null, error ? `${id}-error` : null, callerDescription]
      .filter(Boolean)
      .join(" ") || undefined;
  useLayoutEffect(() => {
    const request = pending.current;
    if (!request || items.some((item) => item.id === request.item.id)) return;
    pending.current = null;
    const active = request.button.ownerDocument.activeElement;
    if (!blocked && (active === request.button.ownerDocument.body || active === request.button)) {
      const next = items[Math.min(request.index, items.length - 1)];
      (next ? removeButtons.current.get(next.id) : trigger.current)?.focus();
    }
    setAnnouncement(removedMessage(request.item));
  }, [items, blocked, removedMessage]);
  return (
    <div
      {...props}
      {...kb("fileinput", { disabled, readonly: readOnly, invalid: Boolean(error) }, className)}
      onBlurCapture={(event) => {
        if (
          pending.current?.button.isSameNode(event.target) &&
          event.relatedTarget !== pending.current.button
        )
          pending.current = null;
        onBlurCapture?.(event);
      }}
    >
      <span
        id={`${id}-label`}
        className={clsx("kb-fileinput-label", visuallyHidden && "kb-sr-only")}
      >
        {label}
      </span>
      <input
        ref={input}
        type="file"
        hidden
        className="kb-fileinput-native"
        accept={accept}
        multiple={multiple}
        disabled={blocked}
        onChange={(event) => {
          const control = event.currentTarget;
          try {
            const files = Array.from(control.files ?? []);
            if (!blocked && files.length) {
              onFiles(files);
              setAnnouncement(selectionMessage(files.length));
            }
          } finally {
            control.value = "";
          }
        }}
      />
      <Button
        ref={trigger}
        type="button"
        size="lg"
        variant="secondary"
        disabled={blocked}
        aria-labelledby={`${id}-label ${id}-action`}
        aria-describedby={described}
        aria-invalid={Boolean(error) || undefined}
        className={clsx("kb-fileinput-trigger", triggerClassName)}
        onClick={() => {
          if (!blocked) input.current?.click();
        }}
      >
        <span id={`${id}-action`}>{chooseLabel}</span>
      </Button>
      {description && (
        <p id={`${id}-description`} className="kb-fileinput-description">
          {description}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="kb-fileinput-error" role="alert">
          {error}
        </p>
      )}
      {items.length ? (
        <ul className={clsx("kb-fileinput-list", listClassName)} aria-labelledby={`${id}-label`}>
          {items.map((item, index) => (
            <li className={clsx("kb-fileinput-item", itemClassName)} key={item.id}>
              <div className="kb-fileinput-content">
                {renderItem ? (
                  renderItem(item)
                ) : (
                  <>
                    <span className="kb-fileinput-name">{item.name}</span>
                    {item.description && (
                      <span className="kb-fileinput-metadata">{item.description}</span>
                    )}
                  </>
                )}
              </div>
              <Button
                ref={(node) => {
                  if (node) removeButtons.current.set(item.id, node);
                  else removeButtons.current.delete(item.id);
                }}
                type="button"
                size="lg"
                variant="ghost"
                disabled={blocked}
                className="kb-fileinput-remove"
                aria-label={removeLabel(item)}
                onClick={(event) => {
                  if (blocked) return;
                  if (event.currentTarget === event.currentTarget.ownerDocument.activeElement)
                    pending.current = { item, index, button: event.currentTarget };
                  onRemove(item.id);
                }}
              >
                <span aria-hidden="true">×</span>
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="kb-fileinput-empty">{emptyMessage}</p>
      )}
      <p role="status" aria-live="polite" aria-atomic="true" className="kb-sr-only">
        {announcement}
      </p>
    </div>
  );
}
