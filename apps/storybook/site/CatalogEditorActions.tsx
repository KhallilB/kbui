import { Button, Tooltip } from "@kbui/react";

export function CatalogEditorActions({
  copyLabel,
  resetLabel,
  onCopy,
  onReset,
  copyDisabled = false,
}: {
  copyLabel: string;
  resetLabel: string;
  onCopy: () => void | Promise<void>;
  onReset: () => void;
  copyDisabled?: boolean;
}) {
  return (
    <div className="catalog-editor-actions">
      <Tooltip content={copyLabel}>
        <Button
          variant="ghost"
          size="sm"
          aria-label={copyLabel}
          disabled={copyDisabled}
          onClick={onCopy}
        >
          <svg
            aria-hidden="true"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
          >
            <rect x="6" y="6" width="8" height="8" rx="1" />
            <path d="M10 6V2H2v8h4" />
          </svg>
        </Button>
      </Tooltip>
      <Tooltip content={resetLabel}>
        <Button variant="ghost" size="sm" aria-label={resetLabel} onClick={onReset}>
          <svg
            aria-hidden="true"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 3v4h4M3 7a5 5 0 1 1 1 5" />
          </svg>
        </Button>
      </Tooltip>
    </div>
  );
}
