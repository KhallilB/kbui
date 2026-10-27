import { Button, Select } from "@kbui/react";
import { useId } from "react";
import {
  type CatalogSkin,
  catalogSkinCss,
  componentStyleExample,
  defaultCatalogSkin,
} from "./catalog-skin";
import type { Theme } from "./theme-foundations";

const palettes = [
  { value: "default", label: "Default" },
  { value: "ocean", label: "Ocean" },
  { value: "plum", label: "Plum" },
] as const;
const corners = [
  { value: "default", label: "Default" },
  { value: "sharp", label: "Sharp" },
  { value: "soft", label: "Soft" },
] as const;

export function CatalogSkinControls({
  value,
  onChange,
  theme,
  component = "Button",
}: {
  value: CatalogSkin;
  onChange: (skin: CatalogSkin) => void;
  theme: Theme;
  component?: string;
}) {
  const css = catalogSkinCss(value, theme);
  const example = componentStyleExample(component, value, theme);
  const hint = useId();
  return (
    <section className="catalog-skin-controls" aria-label="Preview styling">
      <div className="catalog-skin-heading">
        <h3>Make it yours</h3>
        <p>
          Pass your own class with <code>className</code>, or <code>classNames</code> for inner
          parts. Your CSS or Tailwind wins over kbui. Pick colors and corners to try them.
        </p>
      </div>
      <div className="catalog-skin-fields">
        <Select
          label="Palette"
          value={value.palette}
          options={palettes}
          onValueChange={(next) => {
            const palette = palettes.find((option) => option.value === next);
            if (palette) onChange({ ...value, palette: palette.value });
          }}
        />
        <Select
          label="Corners"
          value={value.corners}
          options={corners}
          onValueChange={(next) => {
            const corner = corners.find((option) => option.value === next);
            if (corner) onChange({ ...value, corners: corner.value });
          }}
        />
        <Button variant="secondary" disabled={!css} onClick={() => onChange(defaultCatalogSkin)}>
          Reset styling
        </Button>
      </div>
      <label className="catalog-skin-code">
        <span>Style this component</span>
        <textarea readOnly spellCheck={false} value={example} rows={example.split("\n").length} />
      </label>
      {css ? (
        <>
          <label className="catalog-skin-code">
            <span>Theme CSS overrides</span>
            <textarea
              aria-describedby={hint}
              readOnly
              spellCheck={false}
              value={css}
              rows={Math.min(12, css.split("\n").length)}
            />
          </label>
          <small id={hint} className="catalog-skin-hint">
            Optional: restyle every component at once. The preview uses this.
          </small>
        </>
      ) : (
        <p className="catalog-skin-default">Default KBUI tokens. No CSS overrides needed.</p>
      )}
    </section>
  );
}
