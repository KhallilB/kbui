import { Button, Select } from "@kbui/react";
import { type CatalogSkin, catalogSkinCss, defaultCatalogSkin } from "./catalog-skin";
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
}: {
  value: CatalogSkin;
  onChange: (skin: CatalogSkin) => void;
  theme: Theme;
}) {
  const css = catalogSkinCss(value, theme);
  return (
    <section className="catalog-skin-controls" aria-label="Preview styling">
      <div className="catalog-skin-heading">
        <h3>Make it yours</h3>
        <p>Try accent colors and corners in this preview. Your site theme stays the same.</p>
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
      {css ? (
        <label className="catalog-skin-code">
          <span>Theme CSS overrides</span>
          <textarea
            readOnly
            spellCheck={false}
            value={css}
            rows={Math.min(12, css.split("\n").length)}
          />
        </label>
      ) : (
        <p className="catalog-skin-default">Default KBUI tokens. No CSS overrides needed.</p>
      )}
    </section>
  );
}
