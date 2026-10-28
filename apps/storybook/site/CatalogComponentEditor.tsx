import { useState } from "react";
import { CatalogEditorActions } from "./CatalogEditorActions";
import { CatalogEditorNotice } from "./CatalogEditorNotice";
import { CodeEditor } from "./CodeEditor";
import type { CodeRequest, CodeResult } from "./component-code";

export function CatalogComponentEditor({
  original,
  request,
  result,
  onChange,
}: {
  original: string;
  request: CodeRequest;
  result?: CodeResult | undefined;
  onChange: (source: string | null) => void;
}) {
  const source = request.source ?? original;
  const [touched, setTouched] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const error = result?.id === request.id ? result.error : undefined;
  const tone =
    copied === request.id
      ? "success"
      : error || copied === `failed:${request.id}`
        ? "error"
        : request.source !== null && result?.id === request.id
          ? "success"
          : request.source === null
            ? "idle"
            : "pending";
  return (
    <>
      <CatalogEditorActions
        copyLabel="Copy code"
        resetLabel="Reset example"
        onCopy={async () => {
          try {
            await navigator.clipboard.writeText(source);
            setCopied(request.id);
          } catch {
            setCopied(`failed:${request.id}`);
          }
        }}
        onReset={() => {
          setTouched(true);
          onChange(null);
        }}
      />
      <CodeEditor
        showCaption={false}
        label="Component code"
        language="tsx"
        value={source}
        invalid={Boolean(error)}
        onChange={(value) => {
          setTouched(true);
          onChange(value);
        }}
      />
      {error && (
        <p className="catalog-style-error" role="alert">
          {error}
        </p>
      )}
      {(touched || copied === request.id || copied === `failed:${request.id}`) && (
        <CatalogEditorNotice tone={tone}>
          {copied === request.id
            ? "Copied code"
            : copied === `failed:${request.id}`
              ? "Copy unavailable. Select the code to copy."
              : error
                ? "Previous preview kept. Fix the code to update."
                : request.source === null
                  ? "Ready to edit"
                  : result?.id === request.id
                    ? "Preview updated"
                    : "Updating preview…"}
        </CatalogEditorNotice>
      )}
    </>
  );
}
