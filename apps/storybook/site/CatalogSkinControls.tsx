import { Heading, RadioGroup, Text } from "@kb.ui/react";
import { type ReactNode, useEffect, useId, useRef, useState } from "react";
import { CatalogEditorActions } from "./CatalogEditorActions";
import { CatalogEditorNotice } from "./CatalogEditorNotice";
import { CodeEditor } from "./CodeEditor";
import {
  type CatalogSkin,
  catalogSkinCss,
  defaultCatalogSkin,
  defaultTailwindSource,
  presetComponentCss,
} from "./catalog-skin";
import { activeClassNames } from "./class-source";
import { applyStylingPatches, type StylingPatch } from "./styling-copy";
import type { Theme } from "./theme-foundations";

export function CatalogSkinControls({
  id,
  value,
  onChange,
  theme,
  component = "Button",
  sourceModule,
  stylingPatches,
  example,
}: {
  id?: string;
  value: CatalogSkin;
  onChange: (skin: CatalogSkin) => void;
  theme: Theme;
  component?: string;
  sourceModule: string;
  stylingPatches: StylingPatch[];
  example?: ReactNode;
}) {
  const hint = useId();
  const [editor, setEditor] = useState(example ? "component" : "styles");
  const [mode, setMode] = useState<"css" | "tailwind">(
    value.custom && value.custom.classes !== "brand" ? "tailwind" : "css",
  );
  const [drafts, setDrafts] = useState({
    css:
      value.custom?.classes === "brand" ? value.custom.css : presetComponentCss(component, value),
    tailwind:
      value.custom && value.custom.classes !== "brand"
        ? value.custom.classes
        : defaultTailwindSource,
  });
  const [dirty, setDirty] = useState(false);
  const [touched, setTouched] = useState({ css: false, tailwind: false });
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [copyState, setCopyState] = useState("");
  const latest = useRef({ value, onChange });
  useEffect(() => {
    latest.current = { value, onChange };
  }, [value, onChange]);
  const source = drafts[mode];
  useEffect(() => {
    if (!dirty) return;
    let current = true;
    setStatus("Updating preview…");
    setError("");
    setCopyState("");
    const timer = window.setTimeout(() => {
      void (async () => {
        const { compileComponentStyle } = await import("./style-compiler");
        const themeCss =
          mode === "tailwind" ? (await import("tailwindcss/theme.css?raw")).default : "";
        const css = await compileComponentStyle(mode, source, themeCss);
        if (!current) return;
        latest.current.onChange({
          ...latest.current.value,
          custom: { component, css, classes: mode === "css" ? "brand" : source },
        });
        setStatus("Preview updated");
      })().catch((cause: unknown) => {
        if (!current) return;
        setError(cause instanceof Error ? cause.message : "Could not apply these styles.");
        setStatus("Previous styles kept. Fix the code to update.");
      });
    }, 150);
    return () => {
      current = false;
      window.clearTimeout(timer);
    };
  }, [source, mode, dirty, component]);
  const css = catalogSkinCss(value, theme);
  const resetStyles = () => {
    setTouched((current) => ({ ...current, css: true }));
    setDrafts({
      css: presetComponentCss(component, defaultCatalogSkin),
      tailwind: defaultTailwindSource,
    });
    setMode("css");
    setDirty(false);
    setError("");
    setCopyState("");
    setStatus("Styles reset");
    onChange(defaultCatalogSkin);
  };
  const classes = mode === "tailwind" ? activeClassNames(source).join(" ") : "brand";
  return (
    <section id={id} className="catalog-skin-controls" aria-label="Preview styling">
      <div className="catalog-style-settings">
        <div className="catalog-skin-heading">
          <Text className="catalog-styling-eyebrow">{component} playground</Text>
          <Heading level={3}>Make it yours</Heading>
          <Text>
            Edit {example ? "content, props or styles" : "the styles"} and watch {component} change.
          </Text>
        </div>
      </div>
      <div className="catalog-editor-panel">
        <RadioGroup
          className="catalog-style-mode"
          label="Edit example"
          visuallyHidden
          appearance="segmented"
          value={editor === "component" ? "component" : mode}
          onValueChange={(next) => {
            setEditor(next === "component" ? "component" : "styles");
            setCopyState("");
            if (next === "css" || next === "tailwind") {
              setMode(next);
              setDirty(true);
            }
          }}
        >
          {example && <RadioGroup.Item value="component">Component</RadioGroup.Item>}
          <RadioGroup.Item value="css">CSS</RadioGroup.Item>
          <RadioGroup.Item value="tailwind">Tailwind</RadioGroup.Item>
        </RadioGroup>
        <div className="catalog-editor-buffer" hidden={editor !== "component"}>
          {example}
        </div>
        <div hidden={editor !== "styles"} className="catalog-style-editor catalog-editor-buffer">
          <CatalogEditorActions
            copyLabel="Copy styling"
            resetLabel="Reset styling"
            copyDisabled={
              !stylingPatches.length || Boolean(error) || status === "Updating preview…"
            }
            onCopy={async () => {
              try {
                const usage = applyStylingPatches(sourceModule, stylingPatches, classes, theme);
                const copiedCode =
                  mode === "css"
                    ? `${usage}\n\n/* Add to your stylesheet */\n${source}${css ? `\n\n${css}` : ""}`
                    : `${usage}${css ? `\n\n/* Theme CSS */\n${css}` : ""}`;
                await navigator.clipboard.writeText(copiedCode);
                setCopyState("Copied styling");
              } catch {
                setCopyState("Copy unavailable. Select the code to copy.");
              }
            }}
            onReset={resetStyles}
          />
          <CodeEditor
            showCaption={false}
            label={mode === "css" ? "Style this component" : "Tailwind classes"}
            value={source}
            language={mode === "css" ? "css" : "classes"}
            describedBy={hint}
            invalid={Boolean(error)}
            onChange={(next) => {
              setTouched((current) => ({ ...current, [mode]: true }));
              setDrafts((current) => ({ ...current, [mode]: next }));
              setDirty(true);
            }}
          />
          <small id={hint} className="catalog-skin-hint">
            {!stylingPatches.length
              ? `Choose an example rendering ${component} to copy its styling.`
              : mode === "css"
                ? "Style .brand, including :hover and inner elements. CSS stays inside this preview."
                : "Add utility classes, including hover:, dark: and arbitrary values. Tailwind v4."}
          </small>
          {error && (
            <Text className="catalog-style-error" role="alert">
              {error}
            </Text>
          )}
          {(touched[mode] || copyState) && (
            <CatalogEditorNotice
              tone={
                error || copyState.startsWith("Copy unavailable")
                  ? "error"
                  : copyState || status === "Preview updated" || status === "Styles reset"
                    ? "success"
                    : status === "Updating preview…"
                      ? "pending"
                      : "idle"
              }
            >
              {copyState || status || "Ready to customize"}
            </CatalogEditorNotice>
          )}
        </div>
      </div>
    </section>
  );
}
