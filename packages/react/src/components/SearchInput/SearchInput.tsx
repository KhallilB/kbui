import { type Ref, useImperativeHandle, useRef } from "react";
import { kb } from "../../utils/kb";
import { Button } from "../Button/Button";
import { Input, type InputProps } from "../Input/Input";

export type SearchInputProps = Omit<
  InputProps,
  | "type"
  | "value"
  | "defaultValue"
  | "onValueChange"
  | "onChange"
  | "children"
  | "render"
  | "startAdornment"
  | "endAdornment"
  | "ref"
> & {
  /** Controlled search query; empty string means no query. */
  value: string;
  /** Receives edits and clear requests; caller owns filtering and submission. */
  onValueChange: (value: string) => void;
  /** Accessible name for the clear action. */
  clearLabel?: string;
  /** Ref to the native search input. */
  ref?: Ref<HTMLInputElement>;
};

export function SearchInput({
  value,
  onValueChange,
  clearLabel = "Clear search",
  className,
  size = "md",
  disabled,
  readOnly,
  ref,
  ...props
}: SearchInputProps) {
  const control = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => control.current as HTMLInputElement);
  return (
    <Input
      {...props}
      {...kb("searchinput", {}, className)}
      ref={control}
      size={size}
      type="search"
      value={value}
      disabled={disabled}
      readOnly={readOnly}
      onValueChange={(next) => onValueChange(next)}
      startAdornment={
        <svg
          className="kb-searchinput-icon"
          aria-hidden="true"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <circle cx="8.5" cy="8.5" r="5.5" />
          <path d="m13 13 4 4" />
        </svg>
      }
      endAdornment={
        value !== "" && !disabled && !readOnly ? (
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="kb-searchinput-clear"
            aria-label={clearLabel}
            onClick={() => {
              onValueChange("");
              control.current?.focus();
            }}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="m4 4 8 8M12 4l-8 8" />
            </svg>
          </Button>
        ) : undefined
      }
    />
  );
}
