/** Fixture skin: documented facet and status custom properties only, scoped to a wrapper. */
export const skinFixture = {
  "--kb-facet-background": "var(--kb-color-bg)",
  "--kb-facet-background-active": "var(--kb-color-surface)",
  "--kb-facet-border": "var(--kb-color-border)",
  "--kb-facet-border-active": "var(--kb-color-info)",
  "--kb-facet-radius": "var(--kb-radius-lg)",
  "--kb-facet-rim-top": "var(--kb-color-info)",
  "--kb-facet-glow-active": "color-mix(in oklab, var(--kb-color-info) 35%, transparent)",
  "--kb-facet-glow-critical": "color-mix(in oklab, var(--kb-color-danger) 35%, transparent)",
  "--kb-facet-highlight": "var(--kb-color-border)",
  "--kb-facet-divider": "var(--kb-color-border)",
  "--kb-facet-padding": "var(--kb-space-5)",
  "--kb-facet-rail": "var(--kb-color-muted)",
  "--kb-facet-rail-active": "var(--kb-color-info)",
  "--kb-status-running": "var(--kb-color-info)",
} satisfies Record<`--kb-${"facet" | "status"}-${string}`, string>;
