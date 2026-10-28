import { Select } from "@kb.ui/react";
import "./control-select.css";

export function ControlSelect<Value extends string>({
  id,
  label,
  value,
  options,
  onChange,
  disabled = false,
}: {
  id: string;
  label: string;
  value: Value;
  options: readonly { value: Value; label: string }[];
  onChange: (value: Value) => void;
  disabled?: boolean;
}) {
  return (
    <Select
      id={id}
      label={label}
      value={value}
      options={options}
      disabled={disabled}
      className="control-field"
      controlClassName="control-select"
      popupClassName="control-select-popup"
      onValueChange={(next) => {
        const option = options.find((candidate) => candidate.value === next);
        if (option) onChange(option.value);
      }}
    />
  );
}
